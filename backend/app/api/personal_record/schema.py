from datetime import datetime

from pydantic import BaseModel


class PersonalRecordHistoryItem(BaseModel):
    id: int
    exercise_id: int
    exercise: str
    weight: float
    achieved_at: datetime


class PersonalRecordHistoryPage(BaseModel):
    items: list[PersonalRecordHistoryItem]
    next_offset: int | None


class PersonalRecordExerciseSummary(BaseModel):
    exercise_id: int
    exercise: str
    best_weight: float
    record_count: int
    latest_achieved_at: datetime


class PersonalRecordExerciseDetail(BaseModel):
    exercise_id: int
    exercise: str
    best_weight: float
    items: list[PersonalRecordHistoryItem]
