from app.models.enum.exerciseCategory import ExerciseCategory
from app.models.exercise import Exercise


class CardioExercise(Exercise):
    __mapper_args__ = {
        "polymorphic_identity": ExerciseCategory.cardio,
    }
