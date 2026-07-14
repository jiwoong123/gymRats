from sqlalchemy.orm import Session, selectinload

from app.models.workout_session import WorkoutSession
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_set import WorkoutSet


class WorkoutRepository:

    @staticmethod
    def get_sessions(
        db: Session,
        user_id: int,
        number: int | None = None,
    ):
        if number is not None:
            query = (
                db.db.query(WorkoutSession)
                .options(
                    selectinload(WorkoutSession.exercises)
                    .selectinload(WorkoutExercise.sets)
                )
                .filter(WorkoutSession.user_id == user_id)
                .order_by(WorkoutSession.started_at.desc())
                .limit(number)
            )
        else:
             query = (
                db.db.query(WorkoutSession)
                .options(
                    selectinload(WorkoutSession.exercises)
                    .selectinload(WorkoutExercise.sets)
                )
                .filter(WorkoutSession.user_id == user_id)
                .order_by(WorkoutSession.started_at.desc())
            )

        return query.all()
