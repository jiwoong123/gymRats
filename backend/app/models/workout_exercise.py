from typing import List
from sqlalchemy import Identity, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class WorkoutExercise(Base):

    __tablename__ = "workout_exercises"
    
    __table_args__ = (
        Index(
            "ix_workout_exercise_order",
            "workout_session_id",
            "exercise_order",
        ),
    )
    id:Mapped[int] = mapped_column(
        Identity(),
        primary_key=True,
    )

    workout_session_id = mapped_column(
        ForeignKey("workout_sessions.id"),
        index=True,
    )

    exercise_id = mapped_column(
        ForeignKey("exercises.id"),
    )

    exercise_order: Mapped[int]

    rest_seconds: Mapped[int]

    workout_session:Mapped["WorkoutSession"] = relationship(
        back_populates="exercises",
    )

    exercise: Mapped["Exercise"] = relationship(
        back_populates="workout_exercises",
    )

    sets: Mapped[List["WorkoutSet"]] = relationship(
        back_populates="workout_exercise",
        cascade="all, delete-orphan",
    )