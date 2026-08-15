from datetime import date, datetime, timedelta

from sqlalchemy import case, false, func, true
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.workout_exercise import WorkoutExercise
from app.models.workout_session import WorkoutSession
from app.models.workout_set import WorkoutSet


class WorkoutRepository:

    @staticmethod
    def _sessions_between(
        db: Session,
        user_id: int,
        start: datetime,
        end: datetime,
    ) -> list[WorkoutSession]:
        return (
            db.query(WorkoutSession)
            .options(
                selectinload(WorkoutSession.exercises)
                .selectinload(WorkoutExercise.sets),
                selectinload(WorkoutSession.exercises)
                .joinedload(WorkoutExercise.exercise),
            )
            .filter(
                WorkoutSession.user_id == user_id,
                WorkoutSession.ended_at.is_not(None),
                WorkoutSession.started_at >= start,
                WorkoutSession.started_at < end,
            )
            .order_by(WorkoutSession.started_at.asc())
            .all()
        )

    @classmethod
    def get_sessions_between(
        cls,
        db: Session,
        user_id: int,
        start: datetime,
        end: datetime,
    ) -> list[WorkoutSession]:
        return cls._sessions_between(db, user_id, start, end)

    @staticmethod
    def _session_totals(session: WorkoutSession) -> tuple[int, float]:
        completed_sets = [
            workout_set
            for exercise in session.exercises
            for workout_set in exercise.sets
            if workout_set.completed and not workout_set.is_warmup
        ]
        volume = sum(
            (workout_set.weight or 0) * (workout_set.reps or 0)
            for workout_set in completed_sets
        )
        return len(completed_sets), float(volume)

    @classmethod
    def get_weekly_summary(
        cls,
        db: Session,
        user_id: int,
        start: datetime,
        end: datetime,
    ) -> dict:
        sessions = cls._sessions_between(db, user_id, start, end)
        totals = [cls._session_totals(session) for session in sessions]
        return {
            "workout_days": len({session.started_at.date() for session in sessions}),
            "volume": sum(volume for _, volume in totals),
            "sets": sum(sets for sets, _ in totals),
        }

    @staticmethod
    def get_weekly_dashboard(
        db: Session,
        user_id: int,
        start: datetime,
        end: datetime,
    ) -> tuple[dict, list[dict]]:
        workout_day = func.trunc(WorkoutSession.started_at)
        completed_set = case(
            (
                (WorkoutSet.completed == true()) & (WorkoutSet.is_warmup == false()),
                1,
            ),
            else_=0,
        )
        completed_volume = case(
            (
                (WorkoutSet.completed == true()) & (WorkoutSet.is_warmup == false()),
                func.coalesce(WorkoutSet.weight, 0) * func.coalesce(WorkoutSet.reps, 0),
            ),
            else_=0,
        )
        rows = (
            db.query(
                workout_day.label("workout_day"),
                func.sum(completed_set).label("completed_sets"),
                func.sum(completed_volume).label("volume"),
            )
            .outerjoin(
                WorkoutExercise,
                WorkoutExercise.workout_session_id == WorkoutSession.id,
            )
            .outerjoin(WorkoutSet, WorkoutSet.workout_exercise_id == WorkoutExercise.id)
            .filter(
                WorkoutSession.user_id == user_id,
                WorkoutSession.ended_at.is_not(None),
                WorkoutSession.started_at >= start,
                WorkoutSession.started_at < end,
            )
            .group_by(workout_day)
            .order_by(workout_day)
            .all()
        )
        volume_by_day = {
            start.date() + timedelta(days=offset): 0.0 for offset in range(7)
        }
        total_sets = 0
        total_volume = 0.0
        for row in rows:
            day = row.workout_day.date() if isinstance(row.workout_day, datetime) else row.workout_day
            volume = float(row.volume or 0)
            completed_sets = int(row.completed_sets or 0)
            volume_by_day[day] = volume
            total_sets += completed_sets
            total_volume += volume

        day_names = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
        return (
            {
                "workout_days": len(rows),
                "volume": total_volume,
                "sets": total_sets,
            },
            [
                {"day": day_names[day.weekday()], "volume": volume}
                for day, volume in volume_by_day.items()
            ],
        )

    @classmethod
    def get_weekly_activity(
        cls,
        db: Session,
        user_id: int,
        start: datetime,
        end: datetime,
    ) -> list[dict]:
        sessions = cls._sessions_between(db, user_id, start, end)
        start_date = start.date()
        volume_by_day = {start_date + timedelta(days=offset): 0.0 for offset in range(7)}
        for session in sessions:
            _, volume = cls._session_totals(session)
            volume_by_day[session.started_at.date()] += volume

        day_names = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
        return [
            {"day": day_names[day.weekday()], "volume": volume}
            for day, volume in volume_by_day.items()
        ]

    @classmethod
    def get_recent_sessions(
        cls,
        db: Session,
        user_id: int,
        limit: int = 2,
    ) -> list[dict]:
        sessions = (
            db.query(WorkoutSession)
            .options(
                joinedload(WorkoutSession.routine),
                selectinload(WorkoutSession.exercises)
                .selectinload(WorkoutExercise.sets),
            )
            .filter(WorkoutSession.user_id == user_id, WorkoutSession.ended_at.is_not(None))
            .order_by(WorkoutSession.started_at.desc())
            .limit(limit)
            .all()
        )

        recent_workouts = []
        for session in sessions:
            _, volume = cls._session_totals(session)
            duration = 0
            if session.ended_at is not None:
                duration = max(
                    0,
                    int((session.ended_at - session.started_at).total_seconds() // 60),
                )
            recent_workouts.append({
                "id": session.id,
                # Sessions created before the name column was introduced can
                # still have a null name.  The dashboard response requires a
                # string, so fall back to the routine name (or a generic name)
                # instead of making the whole home endpoint fail validation.
                "name": session.name or (
                    session.routine.name if session.routine else "자유운동"
                ),
                "performed_at": session.started_at.date(),
                "duration": duration,
                "volume": volume,
            })
        return recent_workouts

    @staticmethod
    def get_streak(
        db: Session,
        user_id: int,
        today: date,
    ) -> int:
        workout_day = func.trunc(WorkoutSession.started_at)
        workout_days = (
            db.query(workout_day.label("workout_day"))
            .filter(WorkoutSession.user_id == user_id, WorkoutSession.ended_at.is_not(None))
            .distinct()
            .order_by(workout_day.desc())
            .yield_per(32)
        )
        cursor = today
        streak = 0
        for row in workout_days:
            day = row.workout_day.date() if isinstance(row.workout_day, datetime) else row.workout_day
            if streak == 0 and day == today - timedelta(days=1):
                cursor = day
            if day != cursor:
                break
            streak += 1
            cursor -= timedelta(days=1)
        return streak

    @staticmethod
    def get_sessions(
        db: Session,
        user_id: int,
        number: int | None = None,
    ) -> list[WorkoutSession]:
        query = (
            db.query(WorkoutSession)
            .options(
                selectinload(WorkoutSession.exercises)
                .selectinload(WorkoutExercise.sets)
            )
            .filter(WorkoutSession.user_id == user_id, WorkoutSession.ended_at.is_not(None))
            .order_by(WorkoutSession.started_at.desc())
        )
        if number is not None:
            query = query.limit(number)
        return query.all()
