import datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class WorkoutExercise(Base):

    __tablename__ = "workout_exercises"

    id: Mapped[int] = mapped_column(primary_key=True)

    workout_session_id: Mapped[int]

    exercise_id: Mapped[int]

    exercise_order: Mapped[int]

    rest_seconds: Mapped[int]

    note: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )
    created_at: Mapped[datetime.datetime]

    updated_at: Mapped[datetime.datetime]

