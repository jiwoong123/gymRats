from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.api.auth.schema import *
from app.api.auth.services.login import login
from app.api.auth.services.signup import EmailAlreadyExistsError, signup
from app.api.auth.services.logout import logout
from app.api.auth.services.refresh import refresh
from app.api.auth.services.email_verification import (
    EmailAlreadyRegisteredError,
    EmailVerificationError,
    EmailVerificationRateLimitError,
    request_verification,
    verify_code,
)

from app.db.dependencies import get_db

router = APIRouter()


@router.post("/email-verification/request", response_model=EmailVerificationRequestResponse)
def request_email_verification_api(
    request: EmailVerificationRequest,
    db: Session = Depends(get_db),
):
    try:
        challenge_id = request_verification(db, str(request.email))
        return EmailVerificationRequestResponse(challenge_id=challenge_id)
    except EmailAlreadyRegisteredError as error:
        raise HTTPException(status_code=409, detail=str(error)) from error
    except EmailVerificationRateLimitError as error:
        raise HTTPException(status_code=429, detail=str(error)) from error
    except RuntimeError as error:
        raise HTTPException(status_code=503, detail="이메일 서비스를 사용할 수 없습니다.") from error


@router.post("/email-verification/confirm", response_model=EmailVerificationConfirmResponse)
def confirm_email_verification_api(
    request: EmailVerificationConfirmRequest,
    db: Session = Depends(get_db),
):
    try:
        token = verify_code(db, request.challenge_id, str(request.email), request.code)
        return EmailVerificationConfirmResponse(verification_token=token)
    except EmailVerificationError as error:
        raise HTTPException(status_code=400, detail=str(error)) from error


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

    except (EmailAlreadyExistsError, EmailVerificationError) as e:

        raise HTTPException(
            status_code=409,
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
    print("login")

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
    


@router.post("/refresh", response_model=TokenResponse,)
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
