from sqlalchemy import Identity, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base

class RoutineSet(Base):

    __tablename__ = "routine_sets"

    id: Mapped[int] = mapped_column(
        Identity(),
        primary_key=True,
    )

    routine_exercise_id = mapped_column(
        ForeignKey("routine_exercises.id"),
        nullable=False,
        index=True,
    )

    set_number: Mapped[int]

    target_weight: Mapped[float | None]

    target_reps: Mapped[int | None]

    target_duration: Mapped[int | None]

    target_distance: Mapped[float | None]

    rest_seconds: Mapped[int | None]

    is_warmup: Mapped[bool]

    is_failure: Mapped[bool]

    is_drop_set: Mapped[bool]

    is_super_set: Mapped[bool]

    routine_exercise: Mapped["RoutineExercise"] = relationship(
        back_populates="sets",
    )