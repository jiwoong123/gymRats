from datetime import date

from fastapi import APIRouter
from fastapi import Depends
from fastapi import HTTPException
from fastapi import Query

from sqlalchemy.orm import Session

from app.db.dependencies import get_db
from app.auth.jwt import get_current_user_id

from app.api.dashboard.schema import DashboardHomeResponse
from app.api.dashboard.services.getDashboardHome import get_dashboard_home
from app.api.weekly_summary.schema import WeeklySummaryResponse
from app.api.weekly_summary.service import get_weekly_summary
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


@router.get(
    "/week",
    response_model=WeeklySummaryResponse,
)
def get_dashboard_week_api(
    week_start: date | None = Query(default=None),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    return get_weekly_summary(db, user_id, week_start or date.today())
