from sqlalchemy.orm import Session
from app.models.workout_session import WorkoutSession


class WorkoutSessionReposiroty:

    @staticmethod
    def create_workout_session(
        db: Session,
        session: WorkoutSession,
    ):
        db.add(session)
        db.commit()


    @staticmethod
    def get_sessions(
        db: Session,
        user_id: int,
        number: int | None = None,
    ) -> list[WorkoutSession]:
        if number is not None:
            query = (
                db.query(WorkoutSession)
                .filter(WorkoutSession.user_id == user_id)
                .order_by(WorkoutSession.started_at.desc())
                .limit(number)
            )
        else:
             query = (
                db.query(WorkoutSession)
                .filter(WorkoutSession.user_id == user_id)
                .order_by(WorkoutSession.started_at.desc())
             )

        return query.all()
        
