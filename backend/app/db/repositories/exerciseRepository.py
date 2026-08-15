from sqlalchemy.orm import Session

from app.models.enum.trainingLevel import TrainingLevel
from app.models.exercise import Exercise
from app.models.weight_exercise import WeightExercise


class ExerciseRepository:

    @staticmethod
    def get_exercises(db: Session) -> list[Exercise]:
        return db.query(Exercise).order_by(Exercise.body_part, Exercise.name_kr).all()

    @staticmethod
    def get_existing_ids(db: Session, exercise_ids: list[int]) -> set[int]:
        if not exercise_ids:
            return set()
        return {
            exercise_id
            for (exercise_id,) in (
                db.query(Exercise.id)
                .filter(Exercise.id.in_(set(exercise_ids)))
                .all()
            )
        }

    @staticmethod
    def get_default_weight(
        exercise: Exercise,
        training_level: TrainingLevel,
    ) -> float:
        if not isinstance(exercise, WeightExercise):
            return 0

        return getattr(exercise, f"default_weight_{training_level.name}")
