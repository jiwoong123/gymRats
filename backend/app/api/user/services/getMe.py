from sqlalchemy.orm import Session

from app.db.userRepository import userRepository
from app.auth.password import hash_password
from app.models.user import User


def getMe(
    db: Session,
    user_id: int
):

    user = userRepository.get_user_by_id(
        db,
        user_id,
    )

    if user is None:
        raise ValueError("User not found")

    return user
