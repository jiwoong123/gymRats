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
