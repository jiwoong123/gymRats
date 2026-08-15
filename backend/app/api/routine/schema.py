from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


RoutineIcon = Literal["dumbbell", "flame", "target", "zap", "heart", "trophy"]


class ExerciseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name_kr: str
    name_eng: str
    body_part: int
    default_weight: float | None = None


class RoutineSetSettings(BaseModel):
    set_number: int = Field(ge=1)
    target_reps: int | None = Field(default=None, ge=1)
    target_weight: float | None = Field(default=None, ge=0)
    target_duration: int | None = Field(default=None, ge=0)
    target_distance: float | None = Field(default=None, ge=0)
    rest_seconds: int | None = Field(default=None, ge=0)
    is_warmup: bool = False
    is_failure: bool = False
    is_drop_set: bool = False
    is_super_set: bool = False


class RoutineExerciseSettings(BaseModel):
    exercise_id: int
    rest_seconds: int | None = Field(default=None, ge=0)
    sets: list[RoutineSetSettings] = Field(min_length=1)


class RoutineCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    exercise_ids: list[int] = Field(min_length=1)
    exercise_settings: list[RoutineExerciseSettings] = Field(default_factory=list)


class RoutineCreateResponse(BaseModel):
    id: int
    name: str
    exercise_count: int


class RoutineIconRequest(BaseModel):
    icon: RoutineIcon


class RoutineSetResponse(BaseModel):
    id: int
    set_number: int
    target_reps: int | None
    target_weight: float | None
    target_duration: int | None
    target_distance: float | None
    rest_seconds: int | None
    is_warmup: bool
    is_failure: bool
    is_drop_set: bool
    is_super_set: bool


class RoutineExerciseResponse(ExerciseResponse):
    rest_seconds: int | None
    sets: list[RoutineSetResponse]


class RoutineResponse(BaseModel):
    id: int
    name: str
    icon: RoutineIcon
    exercises: list[RoutineExerciseResponse]
