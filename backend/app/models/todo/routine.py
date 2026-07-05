import datetime
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class Routine(Base):

    __tablename__ = "routines"

    id: Mapped[int] = mapped_column(primary_key=True)

    user_id: Mapped[int]

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime.datetime]

    updated_at: Mapped[datetime.datetime]
