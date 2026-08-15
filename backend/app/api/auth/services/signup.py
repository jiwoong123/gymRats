from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.db.repositories.userRepository import UserRepository
from app.api.auth.schema import SignupRequest
from app.auth.password import hash_password
from app.models.user import User
from app.api.auth.services.email_verification import consume_verification


class EmailAlreadyExistsError(ValueError):
    pass


def signup(
    db: Session,
    request: SignupRequest,
):
    consume_verification(db, str(request.email), request.email_verification_token)

    user = User(
        email=str(request.email).strip().lower(),
        password_hashed=hash_password(request.password),
        nickname=request.nickname,
        gender=request.gender,
        birth=request.birth,
        height=request.height,
        training_level=request.training_level,
    )

    try:
        return UserRepository.create_user(
            db,
            user,
        )
    except IntegrityError as error:
        db.rollback()
        raise EmailAlreadyExistsError("Email already exists") from error
