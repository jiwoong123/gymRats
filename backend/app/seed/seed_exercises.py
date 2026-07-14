from app.models.exercise import Exercise
from app.models.enum.exerciseCategory import ExerciseCategory
from app.models.enum.bodyPart import BodyPart
from app.models.enum.equipment import Equipment

def seed_exercises(db):

    exercises = [

        Exercise(
            category=ExerciseCategory.strength,
            equipment=Equipment.barbell,
            body_part=BodyPart.chest,
            sub_body_part= BodyPart.triceps,
            name_kr="벤치프레스",
            name_eng="Bench Press",
        ),

        Exercise(
            category=ExerciseCategory.strength,
            equipment=Equipment.barbell,
            body_part=BodyPart.back,
            sub_body_part= BodyPart.leg,
            name_kr="데드리프트",
            name_eng="Deadlift",
        ),

        Exercise(
            category=ExerciseCategory.strength,
            equipment=Equipment.barbell,
            body_part=BodyPart.leg,
            name_kr="바벨 스쿼트",
            name_eng="Squat",
        ),

        Exercise(
            category=ExerciseCategory.strength,
            equipment=Equipment.machine,
            body_part=BodyPart.back,
            name_kr="랫풀다운",
            name_eng="Lat Pulldown",
        ),

        Exercise(
            category=ExerciseCategory.strength,
            equipment=Equipment.dumbbell,
            body_part=BodyPart.shoulder,
            name_kr="숄더프레스",
            name_eng="Shoulder Press",
        ),
    ]

    db.add_all(exercises)

    db.flush()

    return exercises