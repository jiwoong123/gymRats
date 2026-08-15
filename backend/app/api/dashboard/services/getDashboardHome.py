from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session

from ..schema import *

from app.db.repositories.userRepository import UserRepository
from app.db.repositories.workoutRepository import WorkoutRepository
from app.db.repositories.routineRepository import RoutineRepository
from app.db.repositories.personalRecordRepository import PersonalRecordRepository
from app.core.time import utc_today


def get_dashboard_home(
    db: Session,
    user_id: int,
):
    today = utc_today()

    seven_days_ago = today - timedelta(days=6)
    tomorrow = today + timedelta(days=1)
    week_start = datetime.combine(seven_days_ago, time.min)
    week_end = datetime.combine(tomorrow, time.min)

    user = UserRepository.get_user_by_id(
        db,
        user_id,
    )
    if user is None:
        raise ValueError("User not found")

    weekly_summary, weekly_activity = WorkoutRepository.get_weekly_dashboard(
        db,
        user_id,
        week_start,
        week_end,
    )

    quick_workouts = RoutineRepository.get_routines_by_recent_use(
        db,
        user_id,
    )

    recent_workouts = WorkoutRepository.get_recent_sessions(
        db,
        user_id,
        limit=2,
    )

    latest_pr = PersonalRecordRepository.get_latest_pr(
        db,
        user_id,
    )

    return DashboardHomeResponse(
        user=UserSummary(
            nickname=user.nickname,
        ),

        streak=WorkoutRepository.get_streak(db, user_id, today),

        weekly_summary=weekly_summary,

        weekly_activity=weekly_activity,

        quick_workouts=quick_workouts,

        recent_workouts=recent_workouts,

        latest_pr=latest_pr,
    )
