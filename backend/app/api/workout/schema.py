from datetime import datetime

from pydantic import BaseModel, Field, field_validator


class StartSessionRequest(BaseModel):
    routine_id: int | None = None


class SessionSetResponse(BaseModel):
    weight: float | None
    reps: int | None
    completed: bool


class SessionExerciseResponse(BaseModel):
    exercise_id: int
    name_kr: str
    body_part: int
    rest_seconds: int
    sets: list[SessionSetResponse]


class SessionResponse(BaseModel):
    id: int
    routine_id: int | None
    routine_name: str | None
    started_at: datetime
    exercises: list[SessionExerciseResponse]


class FinishSetRequest(BaseModel):
    weight: float | None = Field(default=None, ge=0)
    reps: int | None = Field(default=None, ge=0)
    completed: bool = False


class FinishExerciseRequest(BaseModel):
    exercise_id: int
    rest_seconds: int = Field(default=90, ge=0)
    sets: list[FinishSetRequest]


class FinishSessionRequest(BaseModel):
    name: str | None = Field(default=None, max_length=50)
    memo: str | None = None
    elapsed_seconds: int = Field(ge=0)
    exercises: list[FinishExerciseRequest]

    @field_validator("name")
    @classmethod
    def normalize_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class FinishSessionResponse(BaseModel):
    id: int
    ended_at: datetime


class SessionHistoryItem(BaseModel):
    id: int
    performed_at: datetime
    name: str
    exercise_names: list[str]
    duration: int
    volume: float


class SessionHistoryPage(BaseModel):
    items: list[SessionHistoryItem]
    next_offset: int | None
