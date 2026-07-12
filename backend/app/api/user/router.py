from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.api.user.schema import *

from app.db.dependencies import get_db
from app.auth.jwt import get_current_user_id

from app.api.user.services.getMe import getMe

router = APIRouter()

@router.get(
    "/me",
    response_model=UserMeResponse,
)
def get_my_profile(
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