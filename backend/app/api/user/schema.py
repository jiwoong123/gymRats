from datetime import date, datetime

from pydantic import BaseModel, ConfigDict

class UserMeResponse(BaseModel):
    id: int
    email: str
    nickname: str
    gender: int
    birth: date
    height: float | None

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes = True)