from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class WorkoutExercise(Base):
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        primary_key=True,
    )

    weight:Mapped[float | None]

    body_fat:Mapped[float | None]

    muscle_mass:Mapped[float | None]