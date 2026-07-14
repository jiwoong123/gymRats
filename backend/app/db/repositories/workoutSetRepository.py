from sqlalchemy.orm import Session
from app.models.workout_set import WorkoutSet


class WorkoutSessionReposiroty:

    @staticmethod
    def create_workout_set(
        db: Session,
        set: WorkoutSet,
    ):
        db.add(set)
        db.commit()


    @staticmethod
    def get_sets_by_exercise(
        db: Session,
        workout_exercise_id: int,
    ) -> list[WorkoutSet]:
        
        query = (
            db.query(WorkoutSet)
            .filter(WorkoutSet.workout_exercise_id == workout_exercise_id)
            .order_by(WorkoutSet.set_number.desc())
        )

        return query.all()
        
