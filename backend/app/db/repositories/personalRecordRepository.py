from sqlalchemy.orm import Session, joinedload

from app.models.personal_record import PersonalRecord
from app.models.enum.recordType import RecordType


class PersonalRecordRepository:

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
                PersonalRecord.record_type == RecordType.weight,
            )
            .order_by(PersonalRecord.achieved_at.desc(), PersonalRecord.id.desc())
            .first()
        )

        if record is None:
            return None

        return {
            "exercise": record.exercise.name_kr,
            "weight": record.value,
        }

    @staticmethod
    def save_pr(
        db: Session,
        pr: PersonalRecord,
    ):
        db.add(pr)
        db.commit()
