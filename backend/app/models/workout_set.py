from sqlalchemy import Identity, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class WorkoutSet(Base):

    __tablename__ = "workout_sets"

    __table_args__ = (
        Index(
            "ix_workout_sets_order",
            "workout_exercise_id",
            "set_number",
        ),
    )

    id:Mapped[int] = mapped_column(
        Identity(),
        primary_key=True,
    )

    workout_exercise_id = mapped_column(
        ForeignKey("workout_exercises.id"),
    )
    
    set_number: Mapped[int]

    weight: Mapped[float | None]

    duration: Mapped[int| None]

    reps: Mapped[int | None]

    distance: Mapped[float | None]  # only when cardio

    calories: Mapped[float| None]  # auto estimated

    rpe: Mapped[float | None]  # auto estimated

    is_warmup: Mapped[bool]

    is_failure: Mapped[bool]

    is_drop_set: Mapped[bool]

    is_super_set: Mapped[bool]

    completed: Mapped[bool]

    is_pr_updated: Mapped[bool]

    workout_exercise:Mapped["WorkoutExercise"] = relationship(
        back_populates="sets",
    )
    
    personal_record:Mapped["PersonalRecord"] = relationship(
        back_populates="workout_set",
        cascade="all, delete-orphan",
    )