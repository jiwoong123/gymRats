from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.users import User


class AuthRepository:

    @staticmethod
    def get_by_email(
        db: Session,
        email: str,
    ) -> User | None:

        return db.scalar(select(User).where(User.email == email))

    @staticmethod
    def create(
        db: Session,
        user: User,
    ) -> User:

        db.add(user)

        db.commit()

        db.refresh(user)

        return user
