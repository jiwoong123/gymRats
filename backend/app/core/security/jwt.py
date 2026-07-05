from datetime import datetime, timedelta

import jwt

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


def create_refresh_token(user_id: int):

    payload = {
        "sub": str(user_id),
        "type": "refresh",
        "exp": datetime.now() + timedelta(days=30),
    }

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=ALGORITHM,
    )
