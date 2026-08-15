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
    BodyPartWorkoutStat,
    MuscleFatigueStat,
    WeeklyWorkoutStat,
    WorkoutCalendarDay,
    CalendarWorkoutBrief,
    WorkoutStatisticsResponse,
    SessionDetailExercise,
    SessionDetailResponse,
    SessionDetailSet,
    SessionResponse,
    SessionSetResponse,
    StartSessionRequest,
)
from app.auth.jwt import get_current_user_id
from app.db.dependencies import get_db
from app.db.repositories.exerciseRepository import ExerciseRepository
from app.db.repositories.workoutSessionRepository import (
    ActiveWorkoutSessionError,
    WorkoutSessionRepository,
)
from app.models.enum.exerciseCategory import ExerciseCategory
from app.core.time import utc_now, utc_today


router = APIRouter()

WHOLE_BODY = 9
ARMS = 10
CARDIO = 11
ARM_BODY_PARTS = frozenset((4, 5, 6))
ALL_STRENGTH_GROUPS = frozenset((1, 2, 3, ARMS, 7, 8))
STATISTICS_DAYS = 30
RECOVERY_HOURS = 72
FATIGUE_PER_SET = 14


def get_statistics_body_part(exercise) -> int:
    if exercise.category == ExerciseCategory.cardio:
        return CARDIO
    if exercise.body_part in ARM_BODY_PARTS:
        return ARMS
    return exercise.body_part


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
    session = WorkoutSessionRepository.get_active_session(db, user_id)
    return serialize_session(session) if session else None


@router.get("/history", response_model=SessionHistoryPage)
def get_session_history(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=30),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    sessions = WorkoutSessionRepository.get_history(db, user_id, offset, limit + 1)
    has_more = len(sessions) > limit
    items = sessions[:limit]
    return SessionHistoryPage(
        items=[
            SessionHistoryItem(
                id=session.id,
                performed_at=session.started_at,
                name=session.name or (session.routine.name if session.routine else "자유 운동"),
                routine_icon=session.routine.icon if session.routine else None,
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
    month: date = Query(default_factory=utc_today),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    month_start = month.replace(day=1)
    month_end = month_start + timedelta(days=monthrange(month_start.year, month_start.month)[1])
    activities = WorkoutSessionRepository.get_completed_activity_between(
        db,
        user_id,
        datetime.combine(month_start, time.min),
        datetime.combine(month_end, time.min),
    )
    workout_rows = WorkoutSessionRepository.get_calendar_workouts_between(
        db,
        user_id,
        datetime.combine(month_start, time.min),
        datetime.combine(month_end, time.min),
    )
    completed_sets_by_day: dict[date, dict[int, int]] = {}
    for activity in activities:
        workout_date = activity.started_at.date()
        body_part = (
            CARDIO
            if activity.category == ExerciseCategory.cardio
            else ARMS if activity.body_part in ARM_BODY_PARTS else activity.body_part
        )
        daily_counts = completed_sets_by_day.setdefault(workout_date, {})
        daily_counts[body_part] = daily_counts.get(body_part, 0) + int(activity.completed_sets)

    workouts_by_day: dict[date, dict[int, dict]] = {}
    for row in workout_rows:
        workout_date = row.started_at.date()
        daily_workouts = workouts_by_day.setdefault(workout_date, {})
        workout = daily_workouts.setdefault(
            row.session_id,
            {
                "id": row.session_id,
                "name": row.session_name or row.routine_name or "자유 운동",
                "started_at": row.started_at,
                "duration": max(
                    0,
                    int((row.ended_at - row.started_at).total_seconds() // 60),
                ),
                "volume": 0.0,
                "completed_sets": 0,
                "exercise_names": [],
                "routine_icon": row.routine_icon,
            },
        )
        workout["volume"] += float(row.volume or 0)
        workout["completed_sets"] += int(row.completed_sets or 0)
        if row.exercise_name:
            workout["exercise_names"].append(row.exercise_name)

    calendar_days = []
    for workout_date in sorted(set(completed_sets_by_day) | set(workouts_by_day)):
        completed_sets = completed_sets_by_day.get(workout_date, {})
        if ALL_STRENGTH_GROUPS.issubset(completed_sets):
            displayed_body_parts = [WHOLE_BODY]
        else:
            ranked_body_parts = sorted(completed_sets, key=lambda part: (-completed_sets[part], part))
            displayed_body_parts = ranked_body_parts[:1]
            if (
                len(ranked_body_parts) > 1
                and completed_sets[ranked_body_parts[0]] == completed_sets[ranked_body_parts[1]]
            ):
                displayed_body_parts.append(ranked_body_parts[1])
        calendar_days.append(
            WorkoutCalendarDay(
                date=workout_date,
                body_parts=displayed_body_parts,
                workouts=[
                    CalendarWorkoutBrief(**workout)
                    for workout in workouts_by_day.get(workout_date, {}).values()
                ],
            )
        )

    return calendar_days


@router.get("/statistics", response_model=WorkoutStatisticsResponse)
def get_workout_statistics(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    now = utc_now()
    period_start = now - timedelta(days=STATISTICS_DAYS)
    sessions = WorkoutSessionRepository.get_completed_session_times_between(
        db, user_id, period_start, now + timedelta(seconds=1)
    )
    activities = WorkoutSessionRepository.get_completed_activity_between(
        db, user_id, period_start, now + timedelta(seconds=1)
    )

    body_part_totals: dict[int, dict[str, float | int]] = {}
    fatigue_scores = {body_part: 0.0 for body_part in ALL_STRENGTH_GROUPS}
    last_trained: dict[int, datetime] = {}
    completed_set_total = 0
    total_volume = 0.0

    for activity in activities:
        trained_at = activity.ended_at or activity.started_at
        age_hours = max(0.0, (now - trained_at).total_seconds() / 3600)
        recovery_factor = max(0.0, 1 - age_hours / RECOVERY_HOURS)
        body_part = (
            CARDIO
            if activity.category == ExerciseCategory.cardio
            else ARMS if activity.body_part in ARM_BODY_PARTS else activity.body_part
        )
        set_count = int(activity.completed_sets)
        volume = float(activity.volume or 0)
        totals = body_part_totals.setdefault(body_part, {"completed_sets": 0, "volume": 0.0})
        totals["completed_sets"] += set_count
        totals["volume"] += volume
        completed_set_total += set_count
        total_volume += volume
        if body_part in fatigue_scores:
            fatigue_scores[body_part] += set_count * FATIGUE_PER_SET * recovery_factor
            if body_part not in last_trained or trained_at > last_trained[body_part]:
                last_trained[body_part] = trained_at

    weekly = []
    for week_index in range(4):
        week_start = (now - timedelta(days=(3 - week_index) * 7 + 6)).date()
        week_end = week_start + timedelta(days=7)
        week_sessions = [session for session in sessions if week_start <= session.started_at.date() < week_end]
        weekly.append(WeeklyWorkoutStat(
            week_start=week_start,
            sessions=len(week_sessions),
            completed_sets=sum(
                int(activity.completed_sets)
                for activity in activities
                if week_start <= activity.started_at.date() < week_end
            ),
        ))

    total_duration = sum(
        max(0, int(((session.ended_at or session.started_at) - session.started_at).total_seconds() // 60))
        for session in sessions
    )
    return WorkoutStatisticsResponse(
        period_days=STATISTICS_DAYS,
        sessions=len(sessions),
        active_days=len({session.started_at.date() for session in sessions}),
        completed_sets=completed_set_total,
        total_volume=total_volume,
        average_duration=round(total_duration / len(sessions)) if sessions else 0,
        muscle_fatigue=[
            MuscleFatigueStat(
                body_part=body_part,
                fatigue=min(100, round(fatigue_scores[body_part])),
                last_trained_at=last_trained.get(body_part),
            )
            for body_part in (1, 2, 3, ARMS, 7, 8)
        ],
        body_parts=[
            BodyPartWorkoutStat(
                body_part=body_part,
                completed_sets=int(totals["completed_sets"]),
                volume=float(totals["volume"]),
            )
            for body_part, totals in sorted(
                body_part_totals.items(), key=lambda item: (-item[1]["completed_sets"], item[0])
            )
        ],
        weekly=weekly,
    )


@router.get("/{session_id}", response_model=SessionDetailResponse)
def get_session_detail(
    session_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    session = WorkoutSessionRepository.get_completed_session(db, user_id, session_id)
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
    deleted = WorkoutSessionRepository.delete_completed_session(db, user_id, session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="운동 기록을 찾을 수 없습니다.")


@router.post("", response_model=SessionResponse, status_code=status.HTTP_201_CREATED)
def start_session(request: StartSessionRequest, db: Session = Depends(get_db), user_id: int = Depends(get_current_user_id)):
    try:
        return serialize_session(WorkoutSessionRepository.start_session(db, user_id, request.routine_id))
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
    session = WorkoutSessionRepository.get_active_session_for_update(db, user_id)
    if session is None or session.id != session_id:
        raise HTTPException(status_code=404, detail="진행 중인 운동을 찾을 수 없습니다.")

    requested_ids = {item.exercise_id for item in request.exercises}
    valid_ids = ExerciseRepository.get_existing_ids(db, list(requested_ids))
    if valid_ids != requested_ids:
        raise HTTPException(status_code=400, detail="존재하지 않는 운동이 포함되어 있습니다.")

    finished = WorkoutSessionRepository.finish_session(
        db,
        session,
        [item.model_dump() for item in request.exercises],
        request.name,
        request.memo,
        request.elapsed_seconds,
    )
    return FinishSessionResponse(id=finished.id, ended_at=finished.ended_at)
