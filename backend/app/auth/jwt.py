from datetime import datetime, timedelta, timezone
import hashlib
import uuid

from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer

from jose import JWTError, jwt
from app.core.config import settings

ALGORITHM = "HS256"
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def create_access_token(user_id: int):

    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=90),
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=ALGORITHM,
    )


def create_refresh_token(user_id: int) -> tuple[str, datetime]:
    expires_at_utc = datetime.now(timezone.utc) + timedelta(days=30)

    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": expires_at_utc,
        "jti": uuid.uuid4().hex,
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return token, expires_at_utc.replace(tzinfo=None)


def decode_token(token: str, expected_type: str | None = None) -> dict:
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[ALGORITHM],
        )
        if expected_type is not None and payload.get("type") != expected_type:
            raise ValueError("Invalid token type")
        subject = payload.get("sub")
        if not isinstance(subject, str) or not subject.isdigit() or int(subject) <= 0:
            raise ValueError("Invalid token subject")
        return payload
    except JWTError as error:
        raise ValueError("Invalid or expired token") from error


def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


def get_current_user_id(
    token: str = Depends(oauth2_scheme),
) -> int:
    try:
        payload = decode_token(token, expected_type="access")
        return int(payload["sub"])
    except (ValueError, KeyError, TypeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
