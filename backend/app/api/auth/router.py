from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.api.auth.schema import *
from app.api.auth.services.login import login
from app.api.auth.services.signup import signup
from app.api.auth.services.logout import logout
from app.api.auth.services.refresh import refresh

from app.db.dependencies import get_db

router = APIRouter()


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
    


@router.post("/refresh")
def refresh_api(
    request: RefreshRequest,
    db: Session = Depends(get_db),
):

    try:

        return refresh(
            db,
            request,
        )

    except ValueError as e:

        raise HTTPException(
            status_code=401,
            detail=str(e),
        )

@router.post("/logout")
def logout_api(
    request: LogoutRequest,
    db: Session = Depends(get_db),
):

    logout(
        db,
        request,
    )

    return {
        "message": "Logout success"
    }