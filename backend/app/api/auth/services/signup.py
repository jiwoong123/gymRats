from sqlalchemy.orm import Session

from app.db.repositories.userRepository import UserRepository
from app.api.auth.schema import SignupRequest
from app.auth.password import hash_password
from app.models.user import User


def signup(
    db: Session,
    request: SignupRequest,
):

    if UserRepository.get_user_by_email(
        db,
        request.email,
    ):
        raise ValueError("Email already exists")
    
    user = User(
        email=request.email,
        password_hashed=hash_password(request.password),
        nickname=request.nickname,
        gender=request.gender,
        birth=request.birth,
        height=request.height,
    )

    return UserRepository.create_user(
        db,
        user,
    )
