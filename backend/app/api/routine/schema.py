from pydantic import BaseModel, ConfigDict, Field


class ExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name_kr: str
    name_eng: str
    body_part: int


class RoutineCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    exercise_ids: list[int] = Field(min_length=1)


class RoutineCreateResponse(BaseModel):
    id: int
    name: str
    exercise_count: int
