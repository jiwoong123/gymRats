import datetime
from sqlalchemy import Text, String, Identity, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class WorkoutSession(Base):

    __tablename__ = "workout_sessions"
    
    __table_args__ = (
        Index(
            "ix_workout_session_user_started_at",
            "user_id",
            "started_at",
        ),
        Index(
            "ix_ws_user_routine_started",
            "user_id",
            "routine_id",
            "started_at",
        ),
    )
    id:Mapped[int] = mapped_column(
        Identity(),
        primary_key=True,
    )

    user_id = mapped_column(
        ForeignKey("users.id"),
        nullable=False,
    )

    routine_id = mapped_column(
        ForeignKey("routines.id"),
        nullable=True,
        index=True,
    )

    name: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )
    
    started_at: Mapped[datetime.datetime]

    ended_at: Mapped[datetime.datetime | None]

    memo: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    user:Mapped["User"] = relationship(
        back_populates="workout_sessions",
    )

    routine:Mapped["Routine"] = relationship(
        back_populates="workout_sessions",
    )

    exercises:Mapped[list["WorkoutExercise"]]= relationship(
        back_populates="workout_session",
        cascade="all, delete-orphan",
    )
