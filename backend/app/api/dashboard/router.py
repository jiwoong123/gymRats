from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.auth.jwt import get_current_user_id

from app.api.dashboard.schema import DashboardHomeResponse
from app.api.dashboard.services.getDashboardHome import get_dashboard_home
router = APIRouter()

@router.get(
    "/home",
    response_model=DashboardHomeResponse,
)
def get_dashboard_home_api(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    try:
        return get_dashboard_home(
            db,
            user_id,
        )

    except ValueError as e:
        raise HTTPException(
            status_code=404,
            detail=str(e),
        )
