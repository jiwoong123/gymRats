from datetime import date, datetime, time, timedelta

from sqlalchemy.orm import Session

from ..schema import *

from app.db.repositories.userRepository import UserRepository
from app.db.repositories.workoutRepository import WorkoutRepository
from app.db.repositories.routineRepository import RoutineRepository
from app.db.repositories.personalRecordRepository import PersonalRecordRepository


def get_dashboard_home(
    db: Session,
    user_id: int,
):
    today = date.today()

    monday = today - timedelta(days=today.weekday())
    next_monday = monday + timedelta(days=7)
    week_start = datetime.combine(monday, time.min)
    week_end = datetime.combine(next_monday, time.min)

    user = UserRepository.get_user_by_id(
        db,
        user_id,
    )
    if user is None:
        raise ValueError("User not found")

    weekly_summary = WorkoutRepository.get_weekly_summary(
        db,
        user_id,
        week_start,
        week_end,
    )

    weekly_activity = WorkoutRepository.get_weekly_activity(
        db,
        user_id,
        week_start,
        week_end,
    )

    quick_workouts = RoutineRepository.get_recent_routines(
        db,
        user_id,
        limit=3,
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
