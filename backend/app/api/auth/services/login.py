from sqlalchemy.orm import Session
from app.db.repositories.userRepository import UserRepository
from app.db.repositories.refreshTokenRepository import RefreshTokenRepository
from app.api.auth.schema import (
    LoginRequest,
    TokenResponse,
)
from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    hash_refresh_token,
)

from app.models.refreshToken import RefreshToken
from app.auth.password import verify_password

def login(
    db: Session,
    request: LoginRequest,
) -> TokenResponse:
    user = UserRepository.get_user_by_email(
        db,
        request.email,
    )

    if user is None:
        raise ValueError("Invalid email")

    if not verify_password(
        request.password,
        user.password_hashed,
    ):
        raise ValueError("Wrong password")
    
    refresh_token, expires_at = create_refresh_token(user.id)
    access_token = create_access_token(user.id)
    
    RefreshTokenRepository.save_refresh_token(
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

