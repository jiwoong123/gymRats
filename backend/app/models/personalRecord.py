import datetime
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship


from app.db.database import Base


class PersonalRecord(Base):

    __tablename__ = "personal_records"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        primary_key=True,
    )

    exercise_id: Mapped[int] = mapped_column(
        ForeignKey("exercises.id"),
        primary_key=True,
    )

    max_weight: Mapped[float | None]

    max_volume: Mapped[float | None]

    estimated_1rm: Mapped[float | None]

    max_reps: Mapped[int | None]

    achieved_at: Mapped[datetime.date]

    user: Mapped["User"] = relationship(
        back_populates="personal_records",
    )

    exercise: Mapped["Exercise"] = relationship(
        back_populates="personal_records",
    )
