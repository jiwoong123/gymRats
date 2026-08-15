from sqlalchemy.orm import Session

from app.db.repositories.userRepository import UserRepository
from app.db.repositories.refreshTokenRepository import RefreshTokenRepository
from app.api.auth.schema import (
    RefreshRequest,
    TokenResponse,
)

from app.auth.jwt import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_refresh_token,
)

from app.models.refresh_token import RefreshToken


def refresh(
    db: Session,
    request: RefreshRequest,
) -> TokenResponse:

    payload = decode_token(request.refresh_token, expected_type="refresh")

    user_id = int(payload["sub"])

    user = UserRepository.get_user_by_id(
        db,
        user_id,
    )

    if user is None:
        raise ValueError("User not found")
    saved = RefreshTokenRepository.get_refresh_token_for_update(
        db,
        hash_refresh_token(request.refresh_token),
    )

    if saved is None or saved.user_id != user_id:
        raise ValueError("Invalid refresh token")

    refresh_token, expires_at = create_refresh_token(user.id)
    access_token = create_access_token(user.id)

    try:
        db.delete(saved)
        db.add(
            RefreshToken(
                user_id=user_id,
                token_hashed=hash_refresh_token(refresh_token),
                expires_at=expires_at,
            )
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
    )
