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

    for user in users:
        max_pr = {} # {(exercise.id, recordtype) : max_pr}
        for exercise in exercises:
            for i in RecordType:
                max_pr[(exercise.id, i)]=0

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
                    prs = []
                    weight = random.randint(60, 140)
                    reps = random.randint(6, 12)
                    volume = weight * reps
                    estimated_1rm = weight * (1 + reps / 30)
                    rpe = round(random.uniform(7.5, 10), 1)
                    updated = False
                    if weight>max_pr[(exercise.id, RecordType.weight)]:
                        updated=True
                        prs.append(PersonalRecord(
                                    user_id=user.id,
                                    exercise_id=exercise.id,
                                    workout_set_id=0,
                                    record_type=RecordType.weight,
                                    value=weight,
                                    achieved_at=start,
                                ))
                        
                    if volume>max_pr[(exercise.id, RecordType.volume)]:
                        updated=True
                        prs.append(PersonalRecord(
                                    user_id=user.id,
                                    exercise_id=exercise.id,
                                    workout_set_id=0,
                                    record_type=RecordType.volume,
                                    value=volume,
                                    achieved_at=start,
                                ))
                        
                    if estimated_1rm>max_pr[(exercise.id, RecordType.estimated_1rm)]:
                        updated=True
                        prs.append(PersonalRecord(
                                    user_id=user.id,
                                    exercise_id=exercise.id,
                                    workout_set_id=0,
                                    record_type=RecordType.estimated_1rm,
                                    value=estimated_1rm,
                                    achieved_at=start,
                                ))
                        

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
                        is_pr_updated=updated,
                    )
                    db.add(workout_set)
                    db.flush()

                    for pr in prs:
                        pr.workout_set_id = workout_set.id
                        db.add(pr)
                    db.flush()

    db.flush()