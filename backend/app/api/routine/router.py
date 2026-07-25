from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routine.schema import (
    ExerciseResponse,
    RoutineCreateRequest,
    RoutineCreateResponse,
)
from app.auth.jwt import get_current_user_id
from app.db.dependencies import get_db
from app.db.repositories.routineRepository import RoutineRepository


router = APIRouter()


@router.get("/exercises", response_model=list[ExerciseResponse])
def get_exercises(
    db: Session = Depends(get_db),
    _user_id: int = Depends(get_current_user_id),
):
    return RoutineRepository.get_exercises(db)


@router.post("", response_model=RoutineCreateResponse, status_code=status.HTTP_201_CREATED)
def create_routine(
    request: RoutineCreateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    routine_name = request.name.strip()
    if not routine_name:
        raise HTTPException(status_code=422, detail="루틴 이름을 입력해주세요.")

    exercise_ids = list(dict.fromkeys(request.exercise_ids))
    exercises = RoutineRepository.get_exercises(db)
    valid_ids = {exercise.id for exercise in exercises}

    if any(exercise_id not in valid_ids for exercise_id in exercise_ids):
        raise HTTPException(status_code=400, detail="존재하지 않는 운동이 포함되어 있습니다.")

    routine = RoutineRepository.create_routine(
        db=db,
        user_id=user_id,
        name=routine_name,
        exercise_ids=exercise_ids,
    )
    return RoutineCreateResponse(
        id=routine.id,
        name=routine.name,
        exercise_count=len(exercise_ids),
    )
