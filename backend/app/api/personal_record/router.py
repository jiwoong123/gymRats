from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.personal_record.schema import (
    PersonalRecordHistoryItem,
    PersonalRecordHistoryPage,
    PersonalRecordExerciseDetail,
    PersonalRecordExerciseSummary,
)
from app.auth.jwt import get_current_user_id
from app.db.dependencies import get_db
from app.db.repositories.personalRecordRepository import PersonalRecordRepository


router = APIRouter()


def _history_item(record) -> PersonalRecordHistoryItem:
    return PersonalRecordHistoryItem(
        id=record.id,
        exercise_id=record.exercise_id,
        exercise=record.exercise.name_kr,
        weight=round(float(record.value), 1),
        achieved_at=record.achieved_at,
    )


@router.get("/exercises", response_model=list[PersonalRecordExerciseSummary])
def get_personal_record_exercises(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    records = PersonalRecordRepository.get_recorded_exercises(db, user_id)
    grouped = {}
    for record in records:
        summary = grouped.get(record.exercise_id)
        if summary is None:
            grouped[record.exercise_id] = {
                "exercise_id": record.exercise_id,
                "exercise": record.exercise.name_kr,
                "best_weight": round(float(record.value), 1),
                "record_count": 1,
                "latest_achieved_at": record.achieved_at,
            }
        else:
            summary["best_weight"] = max(summary["best_weight"], round(float(record.value), 1))
            summary["record_count"] += 1

    return list(grouped.values())


@router.get("/exercises/{exercise_id}", response_model=PersonalRecordExerciseDetail)
def get_personal_record_exercise_detail(
    exercise_id: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    records = PersonalRecordRepository.get_exercise_pr_history(db, user_id, exercise_id)
    if not records:
        raise HTTPException(status_code=404, detail="Exercise records not found")

    return PersonalRecordExerciseDetail(
        exercise_id=exercise_id,
        exercise=records[0].exercise.name_kr,
        best_weight=round(max(float(record.value) for record in records), 1),
        items=[_history_item(record) for record in records],
    )


@router.get("/history", response_model=PersonalRecordHistoryPage)
def get_personal_record_history(
    offset: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=50),
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id),
):
    records = PersonalRecordRepository.get_pr_history(db, user_id, offset, limit + 1)
    has_more = len(records) > limit

    return PersonalRecordHistoryPage(
        items=[
            _history_item(record)
            for record in records[:limit]
        ],
        next_offset=offset + limit if has_more else None,
    )
