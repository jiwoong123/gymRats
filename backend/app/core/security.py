from datetime import datetime, timedelta, UTC

from jose import jwt
from pwdlib import PasswordHash
from app.core.config import settings

password_hash = PasswordHash.recommended()

SECRET_KEY = settings.JWT_SECRET_KEY
ALGORITHM = "HS256"


def hash_password(password: str):

    return password_hash.hash(password)


def verify_password(password: str, hashed: str):

    return password_hash.verify(password, hashed)


def create_access_token(user_id: int):

    expire = datetime.now(UTC) + timedelta(hours=24)

    payload = {
        "sub": str(user_id),
        "exp": expire,
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )