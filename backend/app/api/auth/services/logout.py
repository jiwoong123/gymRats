from sqlalchemy.orm import Session

from app.db.refreshTokenRepository import refreshTokenRepository
from app.api.auth.schema import RefreshRequest
from app.auth.jwt import hash_refresh_token

def logout(
    db: Session,
    request: RefreshRequest,
):
    hashed = hash_refresh_token(request.refresh_token);

    token = refreshTokenRepository.get_refresh_token(
        db,
        hashed,
    )

    if token is None:
        return

    refreshTokenRepository.delete_refresh_token(
        db,
        token,
    )