from typing import List
from sqlalchemy import String, Text, Identity, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class Routine(Base):

    __tablename__ = "routines"

    id:Mapped[int] = mapped_column(
        Identity(),
        primary_key=True
    )

    user_id = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    user:Mapped["User"] = relationship(
        back_populates="routines",
    )

    exercises:Mapped[List["RoutineExercise"]] = relationship(
        back_populates="routine",
        cascade="all, delete-orphan",
    )
    workout_sessions: Mapped[List["WorkoutSession"]] = relationship(
        back_populates="routine",
    )