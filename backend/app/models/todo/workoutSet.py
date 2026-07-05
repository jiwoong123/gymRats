import datetime
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class WorkoutSet(Base):

    __tablename__ = "workout_sets"

    id: Mapped[int] = mapped_column(primary_key=True)

    workout_exercise_id: Mapped[int]

    set_number: Mapped[int]

    weight: Mapped[float | None]

    reps: Mapped[int | None]

    distance: Mapped[float | None]  # only when cardio

    calories: Mapped[float]  # auto estimated

    duration: Mapped[int]

    rpe: Mapped[float | None]  # auto estimated

    is_warmup: Mapped[bool]

    is_failure: Mapped[bool]

    is_drop_set: Mapped[bool]

    is_super_set: Mapped[bool]

    completed: Mapped[bool]

    created_at: Mapped[datetime.datetime]
    updated_at: Mapped[datetime.datetime]
