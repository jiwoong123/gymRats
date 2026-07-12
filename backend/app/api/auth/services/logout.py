from sqlalchemy.orm import Session

from app.db.repositories.refreshTokenRepository import RefreshTokenRepository
from app.api.auth.schema import RefreshRequest
from app.auth.jwt import hash_refresh_token

def logout(
    db: Session,
    request: RefreshRequest,
):
    hashed = hash_refresh_token(request.refresh_token);

    token = RefreshTokenRepository.get_refresh_token(
        db,
        hashed,
    )

    if token is None:
        return

    RefreshTokenRepository.delete_refresh_token(
        db,
        token,
    )