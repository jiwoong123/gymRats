from app.models.routine import Routine
from app.models.routine_exercise import RoutineExercise
from app.models.routine_set import RoutineSet


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
                exercises=[
                    RoutineExercise(
                        exercise_id=exercise.id,
                        exercise_order=order,
                        rest_seconds=90,
                        sets=[
                            RoutineSet(
                                set_number=set_number,
                                target_weight=80,
                                target_reps=10,
                                target_duration=None,
                                target_distance=None,
                                rest_seconds=90,
                                is_warmup=False,
                                is_failure=False,
                                is_drop_set=False,
                                is_super_set=False,
                            )
                            for set_number in range(1, 5)
                        ],
                    )
                    for order, exercise in enumerate(exercises[:3], start=1)
                ],
            )
            routines.append(routine)

    db.add_all(routines)
    db.flush()

    return routines
