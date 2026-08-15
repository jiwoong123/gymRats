from sqlalchemy import Float
from sqlalchemy.orm import Mapped, mapped_column

from app.models.enum.exerciseCategory import ExerciseCategory
from app.models.exercise import Exercise


class WeightExercise(Exercise):
    default_weight_untrained: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    default_weight_novice: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    default_weight_intermediate: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    default_weight_advanced: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    default_weight_elite: Mapped[float] = mapped_column(Float, nullable=False, default=0)

    __mapper_args__ = {
        "polymorphic_identity": ExerciseCategory.strength,
    }
