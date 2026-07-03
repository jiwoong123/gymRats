from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.api.auth.repository import AuthRepository
from app.api.auth.schema import LoginRequest

from app.core.security import (
    create_access_token,
    verify_password,
)

from app.models.users import User

def login(
        db: Session,
        request: LoginRequest,
    ):

        user = AuthRepository.get_by_email(
            db,
            request.email,
        )

        if user is None:
            raise HTTPException(
                status_code=401,
                detail="이메일 또는 비밀번호가 올바르지 않습니다.",
            )

        if not verify_password(
            request.password,
            user.password_hash,
        ):
            raise HTTPException(
                status_code=401,
                detail="이메일 또는 비밀번호가 올바르지 않습니다.",
            )

        token = create_access_token(user.id)

        return {
            "access_token": token,
            "token_type": "bearer",
        }