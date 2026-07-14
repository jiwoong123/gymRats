from sqlalchemy.orm import Session

from app.db.repositories.userRepository import UserRepository
from app.db.repositories.refreshTokenRepository import RefreshTokenRepository
from app.api.auth.schema import (
    RefreshRequest,
    TokenResponse,
)

from app.auth.jwt import (
    decode_token,
    create_access_token,
    create_refresh_token,
    hash_refresh_token
)

from app.models.refresh_token import RefreshToken


def refresh(
    db: Session,
    request: RefreshRequest,
) -> TokenResponse:

    payload = decode_token(request.refresh_token) # token request is valid

    if payload["type"] != "refresh":
        raise ValueError("Invalid refresh token")

    user_id = int(payload["sub"])

    user = UserRepository.get_user_by_id(
        db,
        user_id,
    )

    if user is None:
        raise ValueError("User not found")
    hashed_token = hash_refresh_token(request.refresh_token)
    saved = RefreshTokenRepository.get_refresh_token(hashed_token)

    if saved is None:
        raise ValueError("Invalid refresh token")
    
    RefreshTokenRepository.delete_refresh_token(
        db,
        saved,
    )
    refresh_token, expires_at = create_refresh_token(user.id)
    access_token = create_access_token(user.id)

    RefreshTokenRepository.save_refresh_token(
        db,
        RefreshToken(
            user_id=user_id,
            token_hashed=hash_refresh_token(refresh_token),
            expires_at = expires_at,
        )
    )
    return TokenResponse(
        access_token,
        refresh_token,
    )