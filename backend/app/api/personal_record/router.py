from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.personal_record.schema import (
    PersonalRecordHistoryItem,
    PersonalRecordHistoryPage,
)
from app.auth.jwt import get_current_user_id
from app.db.dependencies import get_db
from app.db.repositories.personalRecordRepository import PersonalRecordRepository


router = APIRouter()


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
            PersonalRecordHistoryItem(
                id=record.id,
                exercise_id=record.exercise_id,
                exercise=record.exercise.name_kr,
                weight=float(record.value),
                achieved_at=record.achieved_at,
            )
            for record in records[:limit]
        ],
        next_offset=offset + limit if has_more else None,
    )
