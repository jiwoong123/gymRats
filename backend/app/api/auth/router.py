from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.api.auth.schema import *
from app.api.auth.services.login import login
from app.api.auth.services.signup import signup
from app.db.dependencies import get_db

router = APIRouter(
    prefix="/auth",
    tags=["Auth"],
)


@router.post(
    "/signup",
    response_model=UserResponse,
)
def signup_api(
    request: SignupRequest,
    db: Session = Depends(get_db),
):

    try:

        return signup(
            db,
            request,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )


@router.post(
    "/login",
    response_model=TokenResponse,
)
def login_api(
    request: LoginRequest,
    db: Session = Depends(get_db),
):

    try:

        return login(
            db,
            request,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=401,
            detail=str(e),
        )
