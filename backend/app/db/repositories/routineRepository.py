from sqlalchemy.orm import Session

from app.models.exercise import Exercise
from app.models.routine import Routine
from app.models.routine_exercise import RoutineExercise


class RoutineRepository:

    @staticmethod
    def get_exercises(db: Session) -> list[Exercise]:
        return db.query(Exercise).order_by(Exercise.body_part, Exercise.name_kr).all()

    @staticmethod
    def create_routine(
        db: Session,
        user_id: int,
        name: str,
        exercise_ids: list[int],
    ) -> Routine:
        routine = Routine(user_id=user_id, name=name)
        db.add(routine)
        db.flush()

        db.add_all([
            RoutineExercise(
                routine_id=routine.id,
                exercise_id=exercise_id,
                exercise_order=index,
                target_sets=None,
                target_reps=None,
                target_weight=None,
                rest_seconds=None,
            )
            for index, exercise_id in enumerate(exercise_ids, start=1)
        ])
        db.commit()
        db.refresh(routine)
        return routine

    @staticmethod
    def get_recent_routines(
        db: Session,
        user_id: int,
        limit: int = 3,
    ) -> list[dict]:
        routines = (
            db.query(Routine)
            .filter(Routine.user_id == user_id)
            .order_by(Routine.id.desc())
            .limit(limit)
            .all()
        )

        return [
            {"routine_id": routine.id, "name": routine.name}
            for routine in routines
        ]
