from datetime import date

from pydantic import BaseModel


class WeeklyTotals(BaseModel):
    workout_days: int
    sessions: int
    duration_minutes: int
    sets: int
    reps: int
    volume: float


class DailyActivity(BaseModel):
    date: date
    sets: int
    volume: float


class ExerciseSummary(BaseModel):
    exercise_id: int
    name: str
    body_part: int
    sets: int
    reps: int
    volume: float
    max_weight: float


class BodyPartSummary(BaseModel):
    body_part: int
    sets: int
    volume: float


class WeeklySummaryResponse(BaseModel):
    week_start: date
    week_end: date
    totals: WeeklyTotals
    daily_activity: list[DailyActivity]
    exercises: list[ExerciseSummary]
    body_parts: list[BodyPartSummary]
