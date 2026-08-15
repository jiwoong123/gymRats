import datetime

from sqlalchemy import Identity, Index, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.database import Base


class EmailVerification(Base):
    __tablename__ = "email_verifications"
    __table_args__ = (
        Index("ix_email_verification_email_created", "email", "created_at"),
    )

    id: Mapped[int] = mapped_column(Identity(), primary_key=True)
    email: Mapped[str] = mapped_column(String(320), nullable=False)
    code_hashed: Mapped[str] = mapped_column(String(64), nullable=False)
    verification_token_hashed: Mapped[str | None] = mapped_column(String(64), nullable=True)
    expires_at: Mapped[datetime.datetime]
    verified_at: Mapped[datetime.datetime | None]
    consumed_at: Mapped[datetime.datetime | None]
    attempts: Mapped[int] = mapped_column(default=0, nullable=False)
