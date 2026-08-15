from sqlalchemy.orm import Session

from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:

    @staticmethod
    def save_refresh_token(
        db: Session,
        token: RefreshToken,
    ):
        db.add(token)
        db.flush()

    @staticmethod
    def get_refresh_token(
        db: Session,
        token_hashed: str
    ) -> RefreshToken | None:

        return (
            db.query(RefreshToken)
            .filter(RefreshToken.token_hashed == token_hashed)
            .first()
        )

    @staticmethod
    def get_refresh_token_for_update(
        db: Session,
        token_hashed: str,
    ) -> RefreshToken | None:
        return (
            db.query(RefreshToken)
            .filter(RefreshToken.token_hashed == token_hashed)
            .with_for_update()
            .first()
        )

    @staticmethod
    def delete_refresh_token(
        db: Session,
        token: RefreshToken,
    ):
        db.delete(token)
        db.flush()
