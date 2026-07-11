from sqlalchemy.orm import Session

from app.models.user import User
from app.models.refreshToken import RefreshToken


class AuthRepository:

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
    def save_refresh_token(
        db: Session,
        token: RefreshToken,
    ):
        db.add(token)
        db.commit()

    @staticmethod
    def get_refresh_token(
        db: Session,
        token_hashed: str
    ):

        return (
            db.query(RefreshToken)
            .filter(RefreshToken.token_hashed == token_hashed)
            .first()
        )

    @staticmethod
    def delete_refresh_token(
        db: Session,
        token: RefreshToken,
    ):
        db.delete(token)
        db.commit()
