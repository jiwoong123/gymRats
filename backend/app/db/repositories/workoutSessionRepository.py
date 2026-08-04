from datetime import datetime, timedelta

from sqlalchemy import func
from sqlalchemy.orm import Session, joinedload, selectinload

from app.models.routine import Routine
from app.models.routine_exercise import RoutineExercise
from app.models.user import User
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_session import WorkoutSession
from app.models.workout_set import WorkoutSet
from app.models.personal_record import PersonalRecord
from app.models.enum.recordType import RecordType


class ActiveWorkoutSessionError(Exception):
    def __init__(self, session_id: int):
        self.session_id = session_id
        super().__init__("이미 진행 중인 운동이 있습니다.")


class WorkoutSessionReposiroty:

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
        db.commit()
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
    def start_session(db: Session, user_id: int, routine_id: int | None) -> WorkoutSession:
        db.query(User.id).filter(User.id == user_id).with_for_update().one()

        existing = WorkoutSessionReposiroty.get_active_session(db, user_id)
        if existing:
            raise ActiveWorkoutSessionError(existing.id)

        routine = None
        if routine_id is not None:
            routine = (
                db.query(Routine)
                .options(selectinload(Routine.exercises))
                .filter(Routine.id == routine_id, Routine.user_id == user_id)
                .first()
            )
            if routine is None:
                raise ValueError("루틴을 찾을 수 없습니다.")

        workout_session = WorkoutSession(
            user_id=user_id,
            routine_id=routine_id,
            started_at=datetime.now(),
            ended_at=None,
        )
        db.add(workout_session)
        db.flush()

        if routine:
            for routine_exercise in sorted(routine.exercises, key=lambda item: item.exercise_order):
                workout_exercise = WorkoutExercise(
                    workout_session_id=workout_session.id,
                    exercise_id=routine_exercise.exercise_id,
                    exercise_order=routine_exercise.exercise_order,
                    rest_seconds=routine_exercise.rest_seconds or 90,
                )
                db.add(workout_exercise)
                db.flush()
                for set_number in range(1, (routine_exercise.target_sets or 1) + 1):
                    db.add(WorkoutSet(
                        workout_exercise_id=workout_exercise.id,
                        set_number=set_number,
                        weight=routine_exercise.target_weight,
                        reps=routine_exercise.target_reps,
                        duration=None,
                        distance=None,
                        calories=None,
                        rpe=None,
                        is_warmup=False,
                        is_failure=False,
                        is_drop_set=False,
                        is_super_set=False,
                        completed=False,
                        is_pr_updated=False,
                    ))

        db.commit()
        return WorkoutSessionReposiroty.get_active_session(db, user_id)

    @staticmethod
    def finish_session(
        db: Session,
        session: WorkoutSession,
        exercises: list[dict],
        name: str | None,
        memo: str | None,
        elapsed_seconds: int,
    ) -> WorkoutSession:
        session.exercises.clear()
        db.flush()

        completed_sets: list[tuple[int, WorkoutSet]] = []
        for exercise_order, exercise_data in enumerate(exercises, start=1):
            workout_exercise = WorkoutExercise(
                workout_session_id=session.id,
                exercise_id=exercise_data["exercise_id"],
                exercise_order=exercise_order,
                rest_seconds=exercise_data["rest_seconds"],
            )
            db.add(workout_exercise)
            db.flush()
            for set_number, set_data in enumerate(exercise_data["sets"], start=1):
                workout_set = WorkoutSet(
                    workout_exercise_id=workout_exercise.id,
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
                db.add(workout_set)
                if workout_set.completed:
                    completed_sets.append((exercise_data["exercise_id"], workout_set))

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

        db.commit()
        return session

    @staticmethod
    def create_workout_session(
        db: Session,
        session: WorkoutSession,
    ):
        db.add(session)
        db.commit()


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
        
