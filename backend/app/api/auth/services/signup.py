import datetime

from sqlalchemy.orm import Session

from app.api.auth.repository import AuthRepository
from app.api.auth.schema import SignupRequest
from app.core.security.password import hash_password
from app.models.user import User


def signup(
    db: Session,
    request: SignupRequest,
):

    if AuthRepository.get_user_by_email(
        db,
        request.email,
    ):
        raise ValueError("Email already exists")

    user = User(
        email=request.email,
        password_hash=hash_password(request.password),
        nickname=request.nickname,
        gender=request.gender,
        birth=request.birth,
        height=request.height,
    )

    return AuthRepository.create_user(
        db,
        user,
    )
