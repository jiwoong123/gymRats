from sqlalchemy.orm import Session, joinedload

from app.models.personal_record import PersonalRecord
from app.models.enum.recordType import RecordType


class PersonalRecordRepository:

    @staticmethod
    def get_recorded_exercises(
        db: Session,
        user_id: int,
    ) -> list[PersonalRecord]:
        return (
            db.query(PersonalRecord)
            .options(joinedload(PersonalRecord.exercise))
            .filter(PersonalRecord.user_id == user_id)
            .order_by(PersonalRecord.achieved_at.desc(), PersonalRecord.id.desc())
            .all()
        )

    @staticmethod
    def get_exercise_pr_history(
        db: Session,
        user_id: int,
        exercise_id: int,
    ) -> list[PersonalRecord]:
        return (
            db.query(PersonalRecord)
            .options(joinedload(PersonalRecord.exercise))
            .filter(
                PersonalRecord.user_id == user_id,
                PersonalRecord.exercise_id == exercise_id,
            )
            .order_by(PersonalRecord.achieved_at.desc(), PersonalRecord.id.desc())
            .all()
        )

    @staticmethod
    def get_pr_history(
        db: Session,
        user_id: int,
        offset: int,
        limit: int,
    ) -> list[PersonalRecord]:
        return (
            db.query(PersonalRecord)
            .options(joinedload(PersonalRecord.exercise))
            .filter(PersonalRecord.user_id == user_id)
            .order_by(PersonalRecord.achieved_at.desc(), PersonalRecord.id.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_latest_pr(
        db: Session,
        user_id: int,
    ) -> dict | None:
        record = (
            db.query(PersonalRecord)
            .options(joinedload(PersonalRecord.exercise))
            .filter(
                PersonalRecord.user_id == user_id,
                PersonalRecord.record_type == RecordType.estimated_1rm,
            )
            .order_by(PersonalRecord.achieved_at.desc(), PersonalRecord.id.desc())
            .first()
        )

        if record is None:
            return None

        return {
            "exercise": record.exercise.name_kr,
            "weight": round(float(record.value), 1),
        }

    @staticmethod
    def save_pr(
        db: Session,
        pr: PersonalRecord,
    ):
        db.add(pr)
        db.flush()
