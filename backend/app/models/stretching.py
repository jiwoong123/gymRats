from app.models.enum.exerciseCategory import ExerciseCategory
from app.models.exercise import Exercise


class Stretching(Exercise):
    __mapper_args__ = {
        "polymorphic_identity": ExerciseCategory.stretching,
    }
