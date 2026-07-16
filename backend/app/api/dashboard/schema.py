from datetime import date

from pydantic import BaseModel

class UserSummary(BaseModel):
    nickname: str


class WeeklySummary(BaseModel):
    workout_days: int
    volume: float
    sets: int


class WeeklyActivityItem(BaseModel):
    day: str
    volume: float


class QuickWorkout(BaseModel):
    routine_id: int
    name: str


class RecentWorkout(BaseModel):
    id: int
    name: str
    performed_at: date
    duration: int
    volume: float


class LatestPR(BaseModel):
    exercise: str
    weight: float


class DashboardHomeResponse(BaseModel):
    user: UserSummary

    streak: int

    weekly_summary: WeeklySummary

    weekly_activity: list[WeeklyActivityItem]

    quick_workouts: list[QuickWorkout]

    recent_workouts: list[RecentWorkout]

    latest_pr: LatestPR | None
