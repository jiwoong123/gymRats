from sqlalchemy.orm import Session

from app.models.routine import Routine


class RoutineRepository:

    @staticmethod
    def get_recent_routines(
        db: Session,
        user_id: int,
        limit: int = 3,
    ) -> list[dict]:
        routines = (
            db.query(Routine)
            .filter(Routine.user_id == user_id)
            .order_by(Routine.updated_at.desc(), Routine.id.desc())
            .limit(limit)
            .all()
        )

        return [
            {"routine_id": routine.id, "name": routine.name}
            for routine in routines
        ]
