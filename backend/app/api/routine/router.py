from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.routine.schema import (
    ExerciseResponse,
    RoutineCreateRequest,
    RoutineCreateResponse,
    RoutineExerciseResponse,
    RoutineIconRequest,
    RoutineResponse,
    RoutineSetResponse,
)
from app.auth.jwt import get_current_user_id
from app.db.dependencies import get_db
from app.db.repositories.exerciseRepository import ExerciseRepository
from app.db.repositories.routineRepository import RoutineRepository
from app.models.enum.trainingLevel import TrainingLevel
from app.models.user import User


router = APIRouter()


def serialize_routine(routine) -> RoutineResponse:
    ordered_exercises = sorted(routine.exercises, key=lambda item: item.exercise_order)
    return RoutineResponse(
        id=routine.id,
        name=routine.name,
        icon=routine.icon,
        exercises=[
            RoutineExerciseResponse(
                id=item.exercise.id,
                name_kr=item.exercise.name_kr,
                name_eng=item.exercise.name_eng,
                body_part=item.exercise.body_part,
                rest_seconds=item.rest_seconds,
                sets=[
                    RoutineSetResponse.model_validate(routine_set, from_attributes=True)
                    for routine_set in sorted(item.sets, key=lambda value: value.set_number)
                ],
            )
            for item in ordered_exercises
        ],
    )


def validate_routine_request(request: RoutineCreateRequest, db: Session) -> tuple[str, list[int]]:
    routine_name = request.name.strip()
    if not routine_name:
        raise HTTPException(status_code=422, detail="루틴 이름을 입력해주세요.")

    exercise_ids = list(dict.fromkeys(request.exercise_ids))
    valid_ids = ExerciseRepository.get_existing_ids(db, exercise_ids)
    if valid_ids != set(exercise_ids):
        raise HTTPException(status_code=400, detail="존재하지 않는 운동이 포함되어 있습니다.")
    return routine_name, exercise_ids


def get_exercise_settings(request: RoutineCreateRequest, exercise_ids: list[int]) -> dict[int, dict]:
    allowed_ids = set(exercise_ids)
    return {
        setting.exercise_id: setting.model_dump(exclude={"exercise_id"})
        for setting in request.exercise_settings
        if setting.exercise_id in allowed_ids
    }


@router.get("/exercises", response_model=list[ExerciseResponse])
def get_exercises(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    user = db.get(User, user_id)
    training_level = (
        TrainingLevel[user.training_level]
        if user and user.training_level in TrainingLevel.__members__
        else TrainingLevel.untrained
    )
    return [
        ExerciseResponse(
            id=exercise.id,
            name_kr=exercise.name_kr,
            name_eng=exercise.name_eng,
            body_part=exercise.body_part,
            default_weight=ExerciseRepository.get_default_weight(exercise, training_level),
        )
        for exercise in ExerciseRepository.get_exercises(db)
    ]


@router.get("", response_model=list[RoutineResponse])
def get_routines(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    return [serialize_routine(routine) for routine in RoutineRepository.get_user_routines(db, user_id)]


@router.get("/{routine_id}", response_model=RoutineResponse)
def get_routine(
    routine_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    routine = RoutineRepository.get_user_routine(db, user_id, routine_id)
    if routine is None:
        raise HTTPException(status_code=404, detail="루틴을 찾을 수 없습니다.")
    return serialize_routine(routine)


@router.post("", response_model=RoutineCreateResponse, status_code=status.HTTP_201_CREATED)
def create_routine(
    request: RoutineCreateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    routine_name, exercise_ids = validate_routine_request(request, db)

    routine = RoutineRepository.create_routine(
        db=db,
        user_id=user_id,
        name=routine_name,
        exercise_ids=exercise_ids,
        exercise_settings=get_exercise_settings(request, exercise_ids),
    )
    return RoutineCreateResponse(
        id=routine.id,
        name=routine.name,
        exercise_count=len(exercise_ids),
    )


@router.put("/{routine_id}", response_model=RoutineResponse)
def update_routine(
    routine_id: int,
    request: RoutineCreateRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    routine = RoutineRepository.get_user_routine(db, user_id, routine_id)
    if routine is None:
        raise HTTPException(status_code=404, detail="루틴을 찾을 수 없습니다.")
    routine_name, exercise_ids = validate_routine_request(request, db)
    updated = RoutineRepository.update_routine(
        db,
        routine,
        routine_name,
        exercise_ids,
        get_exercise_settings(request, exercise_ids),
    )
    return serialize_routine(updated)


@router.delete("/{routine_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_routine(
    routine_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    routine = RoutineRepository.get_user_routine(db, user_id, routine_id)
    if routine is None:
        raise HTTPException(status_code=404, detail="루틴을 찾을 수 없습니다.")
    RoutineRepository.delete_routine(db, routine)


@router.patch("/{routine_id}/icon", response_model=RoutineResponse)
def update_routine_icon(
    routine_id: int,
    request: RoutineIconRequest,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    routine = RoutineRepository.get_user_routine(db, user_id, routine_id)
    if routine is None:
        raise HTTPException(status_code=404, detail="루틴을 찾을 수 없습니다.")
    routine.icon = request.icon
    db.flush()
    return serialize_routine(routine)
