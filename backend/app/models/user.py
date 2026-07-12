import datetime
from typing import List
from sqlalchemy import String, Identity
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        Identity(start=1),
        primary_key=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )

    password_hashed: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
    )

    nickname: Mapped[str] = mapped_column(
        String(20),
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

    refresh_tokens: Mapped[List["RefreshToken"]] = relationship(
    back_populates="user",
    cascade="all, delete-orphan",
    )