from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class WorkoutExercise(Base):
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        primary_key=True,
    )

    target_calories: Mapped[float | None]

    target_protein: Mapped[float | None]

    target_carb: Mapped[float | None]

    target_fat: Mapped[float | None]

    target_weight: Mapped[float | None]