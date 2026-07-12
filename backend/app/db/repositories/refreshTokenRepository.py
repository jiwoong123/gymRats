from sqlalchemy.orm import Session

from app.models.refreshToken import RefreshToken


class RefreshTokenRepository:

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
