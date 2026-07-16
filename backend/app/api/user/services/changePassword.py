from sqlalchemy.orm import Session

from app.api.user.schema import UserPasswordUpdateRequest
from app.auth.password import hash_password, verify_password
from app.db.repositories.userRepository import UserRepository


def change_password(
    db: Session,
    user_id: int,
    request: UserPasswordUpdateRequest,
) -> None:
    user = UserRepository.get_user_by_id(db, user_id)
    if user is None:
        raise ValueError("User not found")

    if not verify_password(request.current_password, user.password_hashed):
        raise PermissionError("Current password is incorrect")

    if verify_password(request.new_password, user.password_hashed):
        raise ValueError("New password must be different from current password")

    UserRepository.update_password(
        db,
        user,
        hash_password(request.new_password),
    )
