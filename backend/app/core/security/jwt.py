from datetime import datetime, timedelta
import hashlib

import jwt
from jwt import ExpiredSignatureError, InvalidTokenError

from app.core.config import settings

ALGORITHM = "HS256"


def create_access_token(user_id: int):

    payload = {
        "sub": str(user_id),
        "type": "access",
        "exp": datetime.now() + timedelta(minutes=30),
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=ALGORITHM,
    )


def create_refresh_token(user_id: int) -> tuple[str, datetime]:
    expires_at =  datetime.now() + timedelta(days=30)

    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": str(expires_at),
    }

    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=ALGORITHM,
    )
    return token, expires_at

def decode_token(token: str) -> dict:
    try:
        return jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[ALGORITHM],
        )
    except ExpiredSignatureError:
        raise ValueError("Token expired")
    except InvalidTokenError:
        raise ValueError("Invalid token")
    

def hash_refresh_token(token: str) -> str:
    return hashlib.sha256(
        token.encode()
    ).hexdigest()