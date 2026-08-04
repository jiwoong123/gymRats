from calendar import monthrange
from datetime import date, datetime, time, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.workout.schema import (
    FinishSessionRequest,
    FinishSessionResponse,
    SessionExerciseResponse,
    SessionHistoryItem,
    SessionHistoryPage,
    WorkoutCalendarDay,
    SessionDetailExercise,
    SessionDetailResponse,
    SessionDetailSet,
    SessionResponse,
    SessionSetResponse,
    StartSessionRequest,
)
from app.auth.jwt import get_current_user_id
from app.db.dependencies import get_db
from app.db.repositories.routineRepository import RoutineRepository
from app.db.repositories.workoutSessionRepository import (
    ActiveWorkoutSessionError,
    WorkoutSessionReposiroty,
)


router = APIRouter()


def serialize_session(session) -> SessionResponse:
    return SessionResponse(
        id=session.id,
        routine_id=session.routine_id,
        routine_name=session.routine.name if session.routine else None,
        started_at=session.started_at,
        exercises=[
            SessionExerciseResponse(
                exercise_id=item.exercise_id,
                name_kr=item.exercise.name_kr,
                body_part=item.exercise.body_part,
                rest_seconds=item.rest_seconds,
                sets=[
                    SessionSetResponse(weight=workout_set.weight, reps=workout_set.reps, completed=workout_set.completed)
                    for workout_set in sorted(item.sets, key=lambda value: value.set_number)
                ],
            )
            for item in sorted(session.exercises, key=lambda value: value.exercise_order)
        ],
    )


@router.get("/active", response_model=SessionResponse | None)
def get_active_session(db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    session = WorkoutSessionReposiroty.get_active_session(db, user_id)
    return serialize_session(session) if session else None


@router.get("/history", response_model=SessionHistoryPage)
def get_session_history(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=30),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    sessions = WorkoutSessionReposiroty.get_history(db, user_id, offset, limit + 1)
    has_more = len(sessions) > limit
    items = sessions[:limit]
    return SessionHistoryPage(
        items=[
            SessionHistoryItem(
                id=session.id,
                performed_at=session.started_at,
                name=session.name or (session.routine.name if session.routine else "자유 운동"),
                exercise_names=[
                    exercise.exercise.name_kr
                    for exercise in sorted(session.exercises, key=lambda value: value.exercise_order)
                ],
                duration=max(0, int((session.ended_at - session.started_at).total_seconds() // 60)),
                volume=float(sum(
                    (workout_set.weight or 0) * (workout_set.reps or 0)
                    for exercise in session.exercises
                    for workout_set in exercise.sets
                    if workout_set.completed and not workout_set.is_warmup
                )),
            )
            for session in items
        ],
        next_offset=offset + limit if has_more else None,
    )


@router.get("/calendar", response_model=list[WorkoutCalendarDay])
def get_workout_calendar(
    month: date = Query(default_factory=date.today),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    month_start = month.replace(day=1)
    month_end = month_start + timedelta(days=monthrange(month_start.year, month_start.month)[1])
    sessions = WorkoutSessionReposiroty.get_completed_sessions_between(
        db,
        user_id,
        datetime.combine(month_start, time.min),
        datetime.combine(month_end, time.min),
    )
    body_parts_by_day: dict[date, set[int]] = {}
    for session in sessions:
        for workout_exercise in session.exercises:
            has_completed_set = any(
                workout_set.completed and not workout_set.is_warmup
                for workout_set in workout_exercise.sets
            )
            if has_completed_set:
                body_parts_by_day.setdefault(session.started_at.date(), set()).add(
                    workout_exercise.exercise.body_part
                )

    return [
        WorkoutCalendarDay(date=workout_date, body_parts=sorted(body_parts))
        for workout_date, body_parts in body_parts_by_day.items()
    ]


@router.get("/{session_id}", response_model=SessionDetailResponse)
def get_session_detail(
    session_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    session = WorkoutSessionReposiroty.get_completed_session(db, user_id, session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="운동 기록을 찾을 수 없습니다.")

    completed_sets = [
        workout_set
        for exercise in session.exercises
        for workout_set in exercise.sets
        if workout_set.completed and not workout_set.is_warmup
    ]
    exercises = []
    for exercise in sorted(session.exercises, key=lambda value: value.exercise_order):
        ordered_sets = sorted(exercise.sets, key=lambda value: value.set_number)
        exercise_completed_sets = [
            workout_set
            for workout_set in ordered_sets
            if workout_set.completed and not workout_set.is_warmup
        ]
        exercises.append(SessionDetailExercise(
            exercise_id=exercise.exercise_id,
            name_kr=exercise.exercise.name_kr,
            body_part=exercise.exercise.body_part,
            rest_seconds=exercise.rest_seconds,
            completed_sets=len(exercise_completed_sets),
            volume=float(sum(
                (workout_set.weight or 0) * (workout_set.reps or 0)
                for workout_set in exercise_completed_sets
            )),
            sets=[
                SessionDetailSet(
                    set_number=workout_set.set_number,
                    weight=workout_set.weight,
                    reps=workout_set.reps,
                    completed=workout_set.completed,
                    is_warmup=workout_set.is_warmup,
                    volume=float((workout_set.weight or 0) * (workout_set.reps or 0)),
                )
                for workout_set in ordered_sets
            ],
        ))

    return SessionDetailResponse(
        id=session.id,
        name=session.name or (session.routine.name if session.routine else "자유 운동"),
        routine_name=session.routine.name if session.routine else None,
        performed_at=session.started_at,
        ended_at=session.ended_at,
        duration=max(0, int((session.ended_at - session.started_at).total_seconds() // 60)),
        volume=float(sum(
            (workout_set.weight or 0) * (workout_set.reps or 0)
            for workout_set in completed_sets
        )),
        completed_sets=len(completed_sets),
        memo=session.memo,
        exercises=exercises,
    )


@router.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    deleted = WorkoutSessionReposiroty.delete_completed_session(db, user_id, session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="운동 기록을 찾을 수 없습니다.")


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(request: StartSessionRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    try:
        return serialize_session(WorkoutSessionReposiroty.start_session(db, user_id, request.routine_id))
    except ActiveWorkoutSessionError as error:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={
                "message": str(error),
                "active_session_id": error.session_id,
            },
        ) from error
    except ValueError as error:
        db.rollback()
        raise HTTPException(status_code=404, detail=str(error)) from error


@router.put("/{session_id}/finish", response_model=FinishSessionResponse)
def finish_session(session_id: int, request: FinishSessionRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    session = WorkoutSessionReposiroty.get_active_session(db, user_id)
    if session is None or session.id != session_id:
        raise HTTPException(status_code=404, detail="진행 중인 운동을 찾을 수 없습니다.")

    valid_ids = {exercise.id for exercise in RoutineRepository.get_exercises(db)}
    if any(item.exercise_id not in valid_ids for item in request.exercises):
        raise HTTPException(status_code=400, detail="존재하지 않는 운동이 포함되어 있습니다.")

    finished = WorkoutSessionReposiroty.finish_session(
        db,
        session,
        [item.model_dump() for item in request.exercises],
        request.name,
        request.memo,
        request.elapsed_seconds,
    )
    return FinishSessionResponse(id=finished.id, ended_at=finished.ended_at)
