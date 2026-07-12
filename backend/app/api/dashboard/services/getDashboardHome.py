from datetime import date
from datetime import timedelta

from sqlalchemy.orm import Session

from ..schema import *

from app.db.repositories.userRepository import UserRepository
from app.db.repositories.workoutRepository import WorkoutRepository
from app.db.repositories.routine_repository import RoutineRepository
from app.db.repositories.personal_record_repository import PersonalRecordRepository


def get_dashboard_home(
    db: Session,
    user_id: int,
):
    today = date.today()

    monday = today - timedelta(days=today.weekday())
    sunday = monday + timedelta(days=6)

    user = UserRepository.get_by_id(
        db,
        user_id,
    )

    weekly_summary = WorkoutRepository.get_weekly_summary(
        db,
        user_id,
        monday,
        sunday,
    )

    weekly_activity = WorkoutRepository.get_weekly_activity(
        db,
        user_id,
        monday,
        sunday,
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

        weekly_summary=weekly_summary,

        weekly_activity=weekly_activity,

        quick_workouts=quick_workouts,

        recent_workouts=recent_workouts,

        latest_pr=latest_pr,
    )