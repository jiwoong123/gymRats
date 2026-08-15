from datetime import datetime

from pydantic import BaseModel


class PersonalRecordHistoryItem(BaseModel):
    id: int
    exercise_id: int
    exercise: str
    record_type: int
    value: float
    achieved_at: datetime


class PersonalRecordHistoryPage(BaseModel):
    items: list[PersonalRecordHistoryItem]
    next_offset: int | None


class PersonalRecordExerciseSummary(BaseModel):
    exercise_id: int
    exercise: str
    best_weight: float | None
    best_volume: float | None
    best_estimated_1rm: float | None
    record_count: int
    latest_achieved_at: datetime


class PersonalRecordExerciseDetail(BaseModel):
    exercise_id: int
    exercise: str
    best_weight: float | None
    best_volume: float | None
    best_estimated_1rm: float | None
    items: list[PersonalRecordHistoryItem]
