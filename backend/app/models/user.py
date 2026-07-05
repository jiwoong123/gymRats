import datetime
from typing import List
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    salt: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    nickname: Mapped[str] = mapped_column(
        String(20),
        unique=True,
        nullable=False,
        index=True,
    )

    # profile_image_url: Mapped[str | None] = mapped_column(
    #     String(500),
    #     nullable=True,
    # )

    gender: Mapped[int]
    
    birth: Mapped[datetime.date]

    height: Mapped[float | None]

    personal_records: Mapped[List["PersonalRecord"]] = relationship(
        back_populates="user",
        cascade="all, delete-orphan",
    )
