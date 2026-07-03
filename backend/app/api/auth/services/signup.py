from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.api.auth.repository import AuthRepository
from app.api.auth.schema import SignupRequest

from app.core.security import hash_password

from app.models.users import User

def signup(
        db: Session,
        request: SignupRequest,
    ):

        user = AuthRepository.get_by_email(
            db,
            request.email,
        )

        if user:
            raise HTTPException(
                status_code=409,
                detail="이미 존재하는 이메일입니다.",
            )

        new_user = User(
            email=request.email,
            password_hash=hash_password(request.password),
            nickname=request.nickname,
        )

        AuthRepository.create(
            db,
            new_user,
        )