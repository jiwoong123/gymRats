from sqlalchemy.orm import Session
from app.api.auth.repository import AuthRepository
from app.api.auth.schema import (
    LoginRequest,
    TokenResponse,
)
from app.core.security.jwt import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
)

from app.models.refreshToken import RefreshToken
from app.core.security.password import verify_password

def login(
    db: Session,
    request: LoginRequest,
) -> TokenResponse:
    
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
    
    refresh_token, expires_at = create_refresh_token(user.id)
    access_token = create_access_token(user.id)
    
    AuthRepository.save_refresh_token(
        db,
        RefreshToken(
            user_id=user.id,
            token_hashed=hash_refresh_token(refresh_token),
            expires_at = expires_at,
        )
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )

