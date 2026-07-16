from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken
from app.models.user import User


class UserRepository:

    @staticmethod
    def get_user_by_email(
        db: Session,
        email: str,
    ) -> User | None:

        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_user_by_id(
        db: Session,
        user_id: int,
    ) -> User | None:

        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def create_user(
        db: Session,
        user: User,
    ) -> User:

        db.add(user)

        db.commit()

        db.refresh(user)

        return user

    @staticmethod
    def update_user(
        db: Session,
        user: User,
        values: dict,
    ) -> User:
        for field, value in values.items():
            setattr(user, field, value)

        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_password(
        db: Session,
        user: User,
        password_hashed: str,
    ) -> None:
        user.password_hashed = password_hashed
        (
            db.query(RefreshToken)
            .filter(RefreshToken.user_id == user.id)
            .delete(synchronize_session=False)
        )
        db.commit()

    @staticmethod
    def delete_user(
        db: Session,
        user: User,
    ) -> None:
        db.delete(user)
        db.commit()
