from sqlalchemy.orm import Session

from app.db.repositories.userRepository import UserRepository


def delete_me(
    db: Session,
    user_id: int,
) -> None:
    user = UserRepository.get_user_by_id(db, user_id)
    if user is None:
        raise ValueError("User not found")

    UserRepository.delete_user(db, user)
