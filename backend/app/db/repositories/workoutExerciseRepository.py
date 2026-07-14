from sqlalchemy.orm import Session
from app.models.workout_exercise import WorkoutExercise


class WorkoutExerciseRepository:

    @staticmethod
    def create_workout_exercise(
        db: Session,
        workoutExercise: WorkoutExercise,
    ):
        db.add(workoutExercise)
        db.commit()


    @staticmethod
    def get_exercises_by_sessions(
        db: Session,
        workout_session_id: int,
    ) -> list[WorkoutExercise]:
        
        query = (
            db.query(WorkoutExercise)
            .filter(WorkoutExercise.workout_session_id == workout_session_id)
            .order_by(WorkoutExercise.exercise_order.desc())
        )

        return query.all()
        
