import datetime
from sqlalchemy import ForeignKey, Identity, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship


from app.db.database import Base


class PersonalRecord(Base):

    __tablename__ = "personal_records"

    __table_args__ = (
        Index(
            "ix_personal_record_user_exercise_date",
            "user_id",
            "exercise_id",
            "achieved_at",
        ),
    )

    id: Mapped[int] = mapped_column(
        Identity(),
        primary_key=True,
    )

    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    exercise_id: Mapped[int] = mapped_column(
        ForeignKey("exercises.id"),
        nullable=False,
    )

    workout_set_id: Mapped[int] = mapped_column(
        ForeignKey("workout_sets.id"),
        nullable=False,
        index=True,
    )

    record_type: Mapped[int]
    value: Mapped[float]


    achieved_at: Mapped[datetime.datetime]

    user: Mapped["User"] = relationship(
        back_populates="personal_records",
    )

    exercise: Mapped["Exercise"] = relationship(
        back_populates="personal_records",
    )

    workout_set: Mapped["WorkoutSet"] = relationship(
        back_populates="personal_records",
    )