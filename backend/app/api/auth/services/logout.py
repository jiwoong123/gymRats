from sqlalchemy.orm import Session

from app.api.auth.repository import AuthRepository
from app.api.auth.schema import RefreshRequest


def logout(
    db: Session,
    request: RefreshRequest,
):

    token = AuthRepository.get_refresh_token(
        db,
        request.refresh_token,
    )

    if token is None:
        return

    AuthRepository.delete_refresh_token(
        db,
        token,
    )