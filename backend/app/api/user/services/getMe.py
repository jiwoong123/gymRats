from sqlalchemy.orm import Session

from app.db.repositories.userRepository import UserRepository
from app.auth.password import hash_password
from app.models.user import User


def getMe(
    db: Session,
    user_id: int
):

    user = UserRepository.get_user_by_id(
        db,
        user_id,
    )

    if user is None:
        raise ValueError("User not found")

    return user
