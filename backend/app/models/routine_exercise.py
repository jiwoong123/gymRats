from sqlalchemy import Identity, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class RoutineExercise(Base):

    __tablename__ = "routine_exercises"

    __table_args__ = (
        Index(
            "ix_routine_exercise_order",
            "routine_id",
            "exercise_order",
        ),
    )

    id:Mapped[int] = mapped_column(
        Identity(),
        primary_key=True,
    )
    
    routine_id = mapped_column(
        ForeignKey("routines.id"),
        nullable=False,
    )

    exercise_id = mapped_column(
        ForeignKey("exercises.id"),
        nullable=False,
        index=True,
    )

    exercise_order: Mapped[int]

    target_sets: Mapped[int | None]

    target_reps: Mapped[int | None]

    target_weight: Mapped[float | None]

    rest_seconds: Mapped[int | None]

    routine:Mapped["Routine"] = relationship(
        back_populates="exercises",
    )

    exercise:Mapped["Exercise"] = relationship(
        back_populates="routine_exercises",
    )