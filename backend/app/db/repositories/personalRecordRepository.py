from sqlalchemy.orm import Session

from app.models.personal_record import PersonalRecord


class PersonalRecordRepository:

    @staticmethod
    def save_pr(
        db: Session,
        pr: PersonalRecord,
    ):
        db.add(pr)
        db.commit()
