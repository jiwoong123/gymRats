from datetime import date

from sqlalchemy.orm import Session

from app.api.user.schema import UserProfileUpdateRequest
from app.db.repositories.userRepository import UserRepository
from app.core.time import utc_today


def update_me(
    db: Session,
    user_id: int,
    request: UserProfileUpdateRequest,
):
    user = UserRepository.get_user_by_id(db, user_id)
    if user is None:
        raise ValueError("User not found")

    if request.birth is not None and request.birth > utc_today():
        raise ValueError("Birth date cannot be in the future")

    values = request.model_dump(exclude_unset=True)
    if "nickname" in values and values["nickname"] is None:
        raise ValueError("Nickname cannot be null")
    if "gender" in values and values["gender"] is None:
        raise ValueError("Gender cannot be null")
    if "birth" in values and values["birth"] is None:
        raise ValueError("Birth date cannot be null")
    if "training_level" in values and values["training_level"] is None:
        raise ValueError("Training level cannot be null")

    if not values:
        return user

    return UserRepository.update_user(db, user, values)
