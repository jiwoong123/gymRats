from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.workout_exercise import WorkoutExercise
from app.models.workout_session import WorkoutSession


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
                .selectinload(WorkoutExercise.sets)
            )
            .filter(
                WorkoutSession.user_id == user_id,
                WorkoutSession.started_at >= start,
                WorkoutSession.started_at < end,
            )
            .order_by(WorkoutSession.started_at.asc())
            .all()
        )

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

    @classmethod
    def get_weekly_activity(
        cls,
        db: Session,
        user_id: int,
        start: datetime,
        end: datetime,
    ) -> list[dict]:
        sessions = cls._sessions_between(db, user_id, start, end)
        volume_by_day = {day: 0.0 for day in range(7)}
        for session in sessions:
            _, volume = cls._session_totals(session)
            volume_by_day[session.started_at.weekday()] += volume

        day_names = ("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
        return [
            {"day": day_names[day], "volume": volume_by_day[day]}
            for day in range(7)
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
            .filter(WorkoutSession.user_id == user_id)
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
                "name": session.routine.name if session.routine else "Free Workout",
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
        started_at_values = (
            db.query(WorkoutSession.started_at)
            .filter(WorkoutSession.user_id == user_id)
            .order_by(WorkoutSession.started_at.desc())
            .all()
        )
        workout_days = {row[0].date() for row in started_at_values}
        cursor = today if today in workout_days else today - timedelta(days=1)

        streak = 0
        while cursor in workout_days:
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
            .filter(WorkoutSession.user_id == user_id)
            .order_by(WorkoutSession.started_at.desc())
        )
        if number is not None:
            query = query.limit(number)
        return query.all()
