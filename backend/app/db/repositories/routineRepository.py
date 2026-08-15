from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models.routine import Routine
from app.models.routine_exercise import RoutineExercise
from app.models.routine_set import RoutineSet
from app.models.workout_session import WorkoutSession


class RoutineRepository:
    @staticmethod
    def create_routine(
        db: Session,
        user_id: int,
        name: str,
        exercise_ids: list[int],
        exercise_settings: dict[int, dict] | None = None,
    ) -> Routine:
        routine = Routine(user_id=user_id, name=name)
        db.add(routine)
        db.flush()

        settings = exercise_settings or {}
        routine.exercises = RoutineRepository._build_exercises(exercise_ids, settings)
        db.flush()
        db.refresh(routine)
        return routine

    @staticmethod
    def get_user_routines(db: Session, user_id: int) -> list[Routine]:
        return (
            db.query(Routine)
            .options(
                selectinload(Routine.exercises).selectinload(RoutineExercise.exercise),
                selectinload(Routine.exercises).selectinload(RoutineExercise.sets),
            )
            .filter(Routine.user_id == user_id)
            .order_by(Routine.id.desc())
            .all()
        )

    @staticmethod
    def get_user_routine(db: Session, user_id: int, routine_id: int) -> Routine | None:
        return (
            db.query(Routine)
            .options(
                selectinload(Routine.exercises).selectinload(RoutineExercise.exercise),
                selectinload(Routine.exercises).selectinload(RoutineExercise.sets),
            )
            .filter(Routine.id == routine_id, Routine.user_id == user_id)
            .first()
        )

    @staticmethod
    def update_routine(
        db: Session,
        routine: Routine,
        name: str,
        exercise_ids: list[int],
        exercise_settings: dict[int, dict] | None = None,
    ) -> Routine:
        routine.name = name
        settings = exercise_settings or {}
        routine.exercises.clear()
        routine.exercises.extend(RoutineRepository._build_exercises(exercise_ids, settings))
        db.flush()
        return RoutineRepository.get_user_routine(db, routine.user_id, routine.id)

    @staticmethod
    def _build_exercises(
        exercise_ids: list[int],
        settings: dict[int, dict],
    ) -> list[RoutineExercise]:
        return [
            RoutineExercise(
                exercise_id=exercise_id,
                exercise_order=index,
                rest_seconds=settings.get(exercise_id, {}).get("rest_seconds"),
                sets=[
                    RoutineSet(**routine_set)
                    for routine_set in settings.get(exercise_id, {}).get("sets", [])
                ],
            )
            for index, exercise_id in enumerate(exercise_ids, start=1)
        ]

    @staticmethod
    def delete_routine(db: Session, routine: Routine) -> None:
        db.delete(routine)
        db.flush()

    @staticmethod
    def get_routines_by_recent_use(
        db: Session,
        user_id: int,
        limit: int = 5,
    ) -> list[dict]:
        routine_usage = (
            select(
                WorkoutSession.routine_id.label("routine_id"),
                func.max(WorkoutSession.started_at).label("last_used_at"),
            )
            .where(
                WorkoutSession.user_id == user_id,
                WorkoutSession.routine_id.is_not(None),
            )
            .group_by(WorkoutSession.routine_id)
            .subquery()
        )
        routines = (
            db.query(Routine)
            .outerjoin(routine_usage, routine_usage.c.routine_id == Routine.id)
            .filter(Routine.user_id == user_id)
            .order_by(routine_usage.c.last_used_at.desc().nullslast(), Routine.id.desc())
            .limit(limit)
            .all()
        )

        return [
            {"routine_id": routine.id, "name": routine.name, "icon": routine.icon}
            for routine in routines
        ]
