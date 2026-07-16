from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Response
from fastapi import status

from sqlalchemy.orm import Session

from app.api.user.schema import *

from app.db.dependencies import get_db
from app.auth.jwt import get_current_user_id

from app.api.user.services.getMe import getMe
from app.api.user.services.updateMe import update_me
from app.api.user.services.changePassword import change_password
from app.api.user.services.deleteMe import delete_me

router = APIRouter()

@router.get(
    "/me",
    response_model=UserMeResponse,
)
def getMeApi(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    try:
        return getMe(
            db,
            user_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )


@router.patch(
    "/me",
    response_model=UserMeResponse,
)
def update_me_api(
    request: UserProfileUpdateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    try:
        return update_me(db, user_id, request)
    except ValueError as e:
        status_code = 404 if str(e) == "User not found" else 400
        raise HTTPException(status_code=status_code, detail=str(e)) from e


@router.patch(
    "/me/password",
    response_model=MessageResponse,
)
def change_password_api(
    request: UserPasswordUpdateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    try:
        change_password(db, user_id, request)
        return MessageResponse(message="Password changed successfully")
    except PermissionError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except ValueError as e:
        status_code = 404 if str(e) == "User not found" else 400
        raise HTTPException(status_code=status_code, detail=str(e)) from e


@router.delete(
    "/me",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_me_api(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    try:
        delete_me(db, user_id)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
