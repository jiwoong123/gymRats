from datetime import datetime, timedelta
import random

from app.models.workout_session import WorkoutSession
from app.models.workout_exercise import WorkoutExercise
from app.models.workout_set import WorkoutSet
from app.models.personal_record import PersonalRecord

from app.models.enum.recordType import RecordType


def seed_workouts(
    db,
    users,
    routines,
    exercises,
):

    # (user_id, exercise_id, record_type) -> 최고 기록
    best_records = {}

    for user in users:

        for day in range(20):

            start = datetime.now() - timedelta(days=day)

            session = WorkoutSession(
                user_id=user.id,
                routine_id=random.choice(routines).id,
                started_at=start,
                ended_at=start + timedelta(minutes=70),
            )

            db.add(session)
            db.flush()

            for exercise in random.sample(exercises, 3):

                workout = WorkoutExercise(
                    workout_session_id=session.id,
                    exercise_id=exercise.id,
                    exercise_order=1,
                    rest_seconds=90,
                )

                db.add(workout)
                db.flush()

                for set_number in range(1, 5):

                    weight = random.randint(60, 140)
                    reps = random.randint(6, 12)
                    volume = weight * reps
                    estimated_1rm = weight * (1 + reps / 30)
                    rpe = round(random.uniform(7.5, 10), 1)

                    workout_set = WorkoutSet(
                        workout_exercise_id=workout.id,
                        set_number=set_number,
                        weight=weight,
                        reps=reps,
                        duration=40,
                        rpe=rpe,
                        is_warmup=False,
                        is_failure=False,
                        is_drop_set=False,
                        is_super_set=False,
                        completed=True,
                        is_pr_updated=False,
                    )

                    db.add(workout_set)
                    db.flush()      # workout_set.id 생성

                    updated = False

                    candidates = [
                        (RecordType.weight, weight),
                        (RecordType.volume, volume),
                        (RecordType.estimated_1rm, estimated_1rm),
                    ]

                    for record_type, value in candidates:

                        key = (
                            user.id,
                            exercise.id,
                            record_type,
                        )

                        previous = best_records.get(key)

                        if previous is None or value > previous:

                            best_records[key] = value

                            db.add(
                                PersonalRecord(
                                    user_id=user.id,
                                    exercise_id=exercise.id,
                                    workout_set_id=workout_set.id,
                                    record_type=record_type,
                                    value=value,
                                    achieved_at=start,
                                )
                            )

                            updated = True

                    workout_set.is_pr_updated = updated
                    