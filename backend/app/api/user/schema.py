from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class UserProfileUpdateRequest(BaseModel):
    nickname: str | None = Field(default=None, min_length=1, max_length=20)
    gender: int | None = Field(default=None, ge=1, le=2)
    birth: date | None = None
    height: float | None = Field(default=None, gt=0)


class UserPasswordUpdateRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8, max_length=100)


class MessageResponse(BaseModel):
    message: str


class UserMeResponse(BaseModel):
    id: int
    email: str
    nickname: str
    gender: int
    birth: date
    height: float | None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
