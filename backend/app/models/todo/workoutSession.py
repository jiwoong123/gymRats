import datetime
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class WorkoutSession(Base):

    __tablename__ = "workout_sessions"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int]

    routine_id: Mapped[int | None]

    started_at: Mapped[datetime.datetime]

    ended_at: Mapped[datetime.datetime | None]

    memo: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )
    created_at: Mapped[datetime.datetime]

    updated_at: Mapped[datetime.datetime]
