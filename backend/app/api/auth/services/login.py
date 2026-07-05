from sqlalchemy.orm import Session

from app.api.auth.repository import AuthRepository
from app.api.auth.schema import (
    LoginRequest,
    TokenResponse,
)
from app.core.security.jwt import (
    create_access_token,
    create_refresh_token,
)
from app.core.security.password import verify_password


def login(
    db: Session,
    request: LoginRequest,
):

    user = AuthRepository.get_user_by_email(
        db,
        request.email,
    )

    if user is None:
        raise ValueError("Invalid email")

    if not verify_password(
        request.password,
        user.password_hash,
    ):
        raise ValueError("Wrong password")

    return TokenResponse(
        access_token=create_access_token(
            user.id,
        ),
        refresh_token=create_refresh_token(
            user.id,
        ),
    )
