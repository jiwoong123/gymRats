from datetime import datetime, timedelta

from sqlalchemy import case, false, func, true
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.routine import Routine
from app.models.routine_exercise import RoutineExercise
from app.models.exercise import Exercise
from app.models.user import User
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_session import WorkoutSession
from app.models.workout_set import WorkoutSet
from app.models.personal_record import PersonalRecord
from app.models.enum.recordType import RecordType
from app.core.time import utc_now


class ActiveWorkoutSessionError(Exception):
    def __init__(self, session_id: int):
        self.session_id = session_id
        super().__init__("이미 진행 중인 운동이 있습니다.")


class WorkoutSessionRepository:

    @staticmethod
    def get_completed_session(
        db: Session,
        user_id: int,
        session_id: int,
    ) -> WorkoutSession | None:
        return (
            db.query(WorkoutSession)
            .options(
                joinedload(WorkoutSession.routine),
                selectinload(WorkoutSession.exercises).joinedload(WorkoutExercise.exercise),
                selectinload(WorkoutSession.exercises).selectinload(WorkoutExercise.sets),
            )
            .filter(
                WorkoutSession.id == session_id,
                WorkoutSession.user_id == user_id,
                WorkoutSession.ended_at.is_not(None),
            )
            .first()
        )

    @staticmethod
    def delete_completed_session(db: Session, user_id: int, session_id: int) -> bool:
        session = (
            db.query(WorkoutSession)
            .filter(
                WorkoutSession.id == session_id,
                WorkoutSession.user_id == user_id,
                WorkoutSession.ended_at.is_not(None),
            )
            .first()
        )
        if session is None:
            return False

        db.delete(session)
        db.flush()
        return True

    @staticmethod
    def get_history(db: Session, user_id: int, offset: int, limit: int) -> list[WorkoutSession]:
        return (
            db.query(WorkoutSession)
            .options(
                joinedload(WorkoutSession.routine),
                selectinload(WorkoutSession.exercises).joinedload(WorkoutExercise.exercise),
                selectinload(WorkoutSession.exercises).selectinload(WorkoutExercise.sets),
            )
            .filter(WorkoutSession.user_id == user_id, WorkoutSession.ended_at.is_not(None))
            .order_by(WorkoutSession.started_at.desc(), WorkoutSession.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_completed_sessions_between(
        db: Session,
        user_id: int,
        start: datetime,
        end: datetime,
    ) -> list[WorkoutSession]:
        return (
            db.query(WorkoutSession)
            .options(
                selectinload(WorkoutSession.exercises).joinedload(WorkoutExercise.exercise),
                selectinload(WorkoutSession.exercises).selectinload(WorkoutExercise.sets),
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

    @staticmethod
    def get_completed_session_times_between(
        db: Session,
        user_id: int,
        start: datetime,
        end: datetime,
    ) -> list:
        return (
            db.query(
                WorkoutSession.id.label("session_id"),
                WorkoutSession.started_at,
                WorkoutSession.ended_at,
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

    @staticmethod
    def get_completed_activity_between(
        db: Session,
        user_id: int,
        start: datetime,
        end: datetime,
    ) -> list:
        return (
            db.query(
                WorkoutSession.id.label("session_id"),
                WorkoutSession.started_at,
                WorkoutSession.ended_at,
                Exercise.category,
                Exercise.body_part,
                func.count(WorkoutSet.id).label("completed_sets"),
                func.sum(
                    func.coalesce(WorkoutSet.weight, 0)
                    * func.coalesce(WorkoutSet.reps, 0)
                ).label("volume"),
            )
            .join(
                WorkoutExercise,
                WorkoutExercise.workout_session_id == WorkoutSession.id,
            )
            .join(Exercise, Exercise.id == WorkoutExercise.exercise_id)
            .join(WorkoutSet, WorkoutSet.workout_exercise_id == WorkoutExercise.id)
            .filter(
                WorkoutSession.user_id == user_id,
                WorkoutSession.ended_at.is_not(None),
                WorkoutSession.started_at >= start,
                WorkoutSession.started_at < end,
                WorkoutSet.completed == true(),
                WorkoutSet.is_warmup == false(),
            )
            .group_by(
                WorkoutSession.id,
                WorkoutSession.started_at,
                WorkoutSession.ended_at,
                Exercise.category,
                Exercise.body_part,
            )
            .all()
        )

    @staticmethod
    def get_calendar_workouts_between(
        db: Session,
        user_id: int,
        start: datetime,
        end: datetime,
    ) -> list:
        completed = (WorkoutSet.completed == true()) & (WorkoutSet.is_warmup == false())
        return (
            db.query(
                WorkoutSession.id.label("session_id"),
                WorkoutSession.name.label("session_name"),
                WorkoutSession.started_at,
                WorkoutSession.ended_at,
                Routine.name.label("routine_name"),
                Routine.icon.label("routine_icon"),
                Exercise.id.label("exercise_id"),
                Exercise.name_kr.label("exercise_name"),
                func.sum(case((completed, 1), else_=0)).label("completed_sets"),
                func.sum(
                    case(
                        (
                            completed,
                            func.coalesce(WorkoutSet.weight, 0)
                            * func.coalesce(WorkoutSet.reps, 0),
                        ),
                        else_=0,
                    )
                ).label("volume"),
            )
            .outerjoin(Routine, Routine.id == WorkoutSession.routine_id)
            .outerjoin(
                WorkoutExercise,
                WorkoutExercise.workout_session_id == WorkoutSession.id,
            )
            .outerjoin(Exercise, Exercise.id == WorkoutExercise.exercise_id)
            .outerjoin(WorkoutSet, WorkoutSet.workout_exercise_id == WorkoutExercise.id)
            .filter(
                WorkoutSession.user_id == user_id,
                WorkoutSession.ended_at.is_not(None),
                WorkoutSession.started_at >= start,
                WorkoutSession.started_at < end,
            )
            .group_by(
                WorkoutSession.id,
                WorkoutSession.name,
                WorkoutSession.started_at,
                WorkoutSession.ended_at,
                Routine.name,
                Routine.icon,
                Exercise.id,
                Exercise.name_kr,
            )
            .order_by(WorkoutSession.started_at.asc(), Exercise.id.asc())
            .all()
        )

    @staticmethod
    def get_active_session(db: Session, user_id: int) -> WorkoutSession | None:
        return (
            db.query(WorkoutSession)
            .options(
                joinedload(WorkoutSession.routine),
                selectinload(WorkoutSession.exercises).joinedload(WorkoutExercise.exercise),
                selectinload(WorkoutSession.exercises).selectinload(WorkoutExercise.sets),
            )
            .filter(WorkoutSession.user_id == user_id, WorkoutSession.ended_at.is_(None))
            .order_by(WorkoutSession.started_at.desc())
            .first()
        )

    @staticmethod
    def get_active_session_for_update(db: Session, user_id: int) -> WorkoutSession | None:
        db.query(User.id).filter(User.id == user_id).with_for_update().one()
        locked = (
            db.query(WorkoutSession.id)
            .filter(WorkoutSession.user_id == user_id, WorkoutSession.ended_at.is_(None))
            .order_by(WorkoutSession.started_at.desc())
            .first()
        )
        if locked is None:
            return None
        return WorkoutSessionRepository.get_active_session(db, user_id)

    @staticmethod
    def start_session(db: Session, user_id: int, routine_id: int | None) -> WorkoutSession:
        db.query(User.id).filter(User.id == user_id).with_for_update().one()

        existing = WorkoutSessionRepository.get_active_session(db, user_id)
        if existing:
            raise ActiveWorkoutSessionError(existing.id)

        routine = None
        if routine_id is not None:
            routine = (
                db.query(Routine)
                .options(
                    selectinload(Routine.exercises)
                    .selectinload(RoutineExercise.sets)
                )
                .filter(Routine.id == routine_id, Routine.user_id == user_id)
                .first()
            )
            if routine is None:
                raise ValueError("루틴을 찾을 수 없습니다.")

        workout_session = WorkoutSession(
            user_id=user_id,
            routine_id=routine_id,
            started_at=utc_now(),
            ended_at=None,
        )

        if routine:
            workout_session.exercises = [
                WorkoutExercise(
                    exercise_id=routine_exercise.exercise_id,
                    exercise_order=routine_exercise.exercise_order,
                    rest_seconds=(
                        90
                        if routine_exercise.rest_seconds is None
                        else routine_exercise.rest_seconds
                    ),
                    sets=[
                        WorkoutSet(
                            set_number=routine_set.set_number,
                            weight=routine_set.target_weight,
                            reps=routine_set.target_reps,
                            duration=routine_set.target_duration,
                            distance=routine_set.target_distance,
                            calories=None,
                            rpe=None,
                            is_warmup=routine_set.is_warmup,
                            is_failure=routine_set.is_failure,
                            is_drop_set=routine_set.is_drop_set,
                            is_super_set=routine_set.is_super_set,
                            completed=False,
                            is_pr_updated=False,
                        )
                        for routine_set in sorted(
                            routine_exercise.sets,
                            key=lambda item: item.set_number,
                        )
                    ],
                )
                for routine_exercise in sorted(
                    routine.exercises,
                    key=lambda item: item.exercise_order,
                )
            ]

        db.add(workout_session)
        db.flush()
        return WorkoutSessionRepository.get_active_session(db, user_id)

    @staticmethod
    def finish_session(
        db: Session,
        session: WorkoutSession,
        exercises: list[dict],
        name: str | None,
        memo: str | None,
        elapsed_seconds: int,
    ) -> WorkoutSession:
        completed_sets: list[tuple[int, WorkoutSet]] = []
        workout_exercises = []
        for exercise_order, exercise_data in enumerate(exercises, start=1):
            workout_exercise = WorkoutExercise(
                exercise_id=exercise_data["exercise_id"],
                exercise_order=exercise_order,
                rest_seconds=exercise_data["rest_seconds"],
            )
            workout_exercise.sets = []
            for set_number, set_data in enumerate(exercise_data["sets"], start=1):
                workout_set = WorkoutSet(
                    set_number=set_number,
                    weight=set_data["weight"],
                    reps=set_data["reps"],
                    duration=None,
                    distance=None,
                    calories=None,
                    rpe=None,
                    is_warmup=False,
                    is_failure=False,
                    is_drop_set=False,
                    is_super_set=False,
                    completed=set_data["completed"],
                    is_pr_updated=False,
                )
                workout_exercise.sets.append(workout_set)
                if workout_set.completed:
                    completed_sets.append((exercise_data["exercise_id"], workout_set))
            workout_exercises.append(workout_exercise)

        session.exercises = workout_exercises

        routine_name = session.routine.name if session.routine else "자유운동"
        default_name = f"{session.started_at.month}월 {session.started_at.day}일 {routine_name}"
        session.name = name or default_name[:50]
        session.memo = memo
        session.ended_at = session.started_at + timedelta(seconds=elapsed_seconds)
        db.flush()

        exercise_ids = {exercise_id for exercise_id, _ in completed_sets}
        previous_records = {}
        if exercise_ids:
            previous_records = {
                (exercise_id, record_type): float(value)
                for exercise_id, record_type, value in (
                    db.query(
                        PersonalRecord.exercise_id,
                        PersonalRecord.record_type,
                        func.max(PersonalRecord.value),
                    )
                    .filter(
                        PersonalRecord.user_id == session.user_id,
                        PersonalRecord.exercise_id.in_(exercise_ids),
                    )
                    .group_by(PersonalRecord.exercise_id, PersonalRecord.record_type)
                    .all()
                )
            }

        for exercise_id, workout_set in completed_sets:
            weight = float(workout_set.weight or 0)
            reps = workout_set.reps or 0
            if weight <= 0 or reps <= 0:
                continue
            candidates = (
                (RecordType.weight, weight),
                (RecordType.volume, weight * reps),
                (RecordType.estimated_1rm, round(weight * (1 + reps / 30), 1)),
            )
            for record_type, value in candidates:
                key = (exercise_id, record_type)
                if value <= previous_records.get(key, 0):
                    continue
                previous_records[key] = value
                db.add(PersonalRecord(
                    user_id=session.user_id,
                    exercise_id=exercise_id,
                    workout_set_id=workout_set.id,
                    record_type=record_type,
                    value=value,
                    achieved_at=session.ended_at,
                ))
                workout_set.is_pr_updated = True

        db.flush()
        return session

    @staticmethod
    def create_workout_session(
        db: Session,
        session: WorkoutSession,
    ):
        db.add(session)
        db.flush()


    @staticmethod
    def get_sessions(
        db: Session,
        user_id: int,
        number: int | None = None,
    ) -> list[WorkoutSession]:
        if number is not None:
            query = (
                db.query(WorkoutSession)
                .filter(WorkoutSession.user_id == user_id)
                .order_by(WorkoutSession.started_at.desc())
                .limit(number)
            )
        else:
             query = (
                db.query(WorkoutSession)
                .filter(WorkoutSession.user_id == user_id)
                .order_by(WorkoutSession.started_at.desc())
             )

        return query.all()
        
