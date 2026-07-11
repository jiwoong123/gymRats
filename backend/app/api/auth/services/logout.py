from sqlalchemy.orm import Session

from app.api.auth.repository import AuthRepository
from app.api.auth.schema import RefreshRequest
from app.core.security.jwt import hash_refresh_token

def logout(
    db: Session,
    request: RefreshRequest,
):
    hashed = hash_refresh_token(request.refresh_token);

    token = AuthRepository.get_refresh_token(
        db,
        hashed,
    )

    if token is None:
        return

    AuthRepository.delete_refresh_token(
        db,
        token,
    )