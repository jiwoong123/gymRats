from app.models.exercise import Exercise
from app.models.enum.exerciseCategory import ExerciseCategory
from app.models.enum.bodyPart import BodyPart
from app.models.enum.equipment import Equipment
from app.models.enum.gender import gender

def seed_exercises(db):

    exercises = [

        Exercise(
            category=ExerciseCategory.strength,
            equipment=Equipment.barbell,
            body_part=BodyPart.chest,
            name_kr="벤치프레스",
            name_eng="Bench Press",
        ),

        Exercise(
            category=ExerciseCategory.strength,
            equipment=Equipment.barbell,
            body_part=BodyPart.back,
            name_kr="데드리프트",
            name_eng="Deadlift",
        ),

        Exercise(
            category=1,
            equipment=1,
            body_part=3,
            name_kr="스쿼트",
            name_eng="Squat",
        ),

        Exercise(
            category=1,
            equipment=2,
            body_part=2,
            name_kr="랫풀다운",
            name_eng="Lat Pulldown",
        ),

        Exercise(
            category=1,
            equipment=3,
            body_part=4,
            name_kr="숄더프레스",
            name_eng="Shoulder Press",
        ),
    ]

    db.add_all(exercises)

    db.flush()

    return exercises