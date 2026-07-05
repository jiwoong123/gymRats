import datetime
from sqlalchemy import PrimaryKeyConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class RoutineExercise(Base):

    __tablename__ = "routine_exercises"

    routine_id: Mapped[int]

    exercise_order: Mapped[int]

    exercise_id: Mapped[int]

    target_sets: Mapped[int | None]

    target_reps: Mapped[int | None]

    target_weight: Mapped[float | None]

    rest_seconds: Mapped[int | None]

    created_at: Mapped[datetime.datetime]

    updated_at: Mapped[datetime.datetime]
