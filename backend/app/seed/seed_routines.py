from app.models.routine import Routine
from app.models.routine_exercise import RoutineExercise


def seed_routines(
    db,
    users,
    exercises,
):

    routines = []

    routine_names = [
        "가슴 · 삼두",
        "등 · 이두",
        "하체",
    ]

    for user in users:

        for name in routine_names:

            routine = Routine(
                user_id=user.id,
                name=name,
            )

            db.add(routine)

            db.flush()

            for order, exercise in enumerate(exercises[:3], start=1):

                db.add(
                    RoutineExercise(
                        routine_id=routine.id,
                        exercise_id=exercise.id,
                        exercise_order=order,
                        target_sets=4,
                        target_reps=10,
                        target_weight=80,
                        rest_seconds=90,
                    )
                )

            routines.append(routine)

    db.flush()

    return routines