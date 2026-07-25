from sqlalchemy import select

from app.models.enum.bodyPart import BodyPart
from app.models.enum.equipment import Equipment
from app.models.enum.exerciseCategory import ExerciseCategory
from app.models.exercise import Exercise


ExerciseSeed = tuple[
    ExerciseCategory,
    Equipment,
    BodyPart,
    BodyPart | None,
    str,
    str,
]

S = ExerciseCategory.strength
C = ExerciseCategory.cardio
T = ExerciseCategory.stretching

EXERCISE_SEEDS: list[ExerciseSeed] = [
    # Chest
    (S, Equipment.barbell, BodyPart.chest, BodyPart.triceps, "벤치프레스", "Bench Press"),
    (S, Equipment.barbell, BodyPart.chest, BodyPart.triceps, "인클라인 벤치프레스", "Incline Bench Press"),
    (S, Equipment.barbell, BodyPart.chest, BodyPart.triceps, "디클라인 벤치프레스", "Decline Bench Press"),
    (S, Equipment.dumbbell, BodyPart.chest, BodyPart.triceps, "덤벨 벤치프레스", "Dumbbell Bench Press"),
    (S, Equipment.dumbbell, BodyPart.chest, BodyPart.triceps, "인클라인 덤벨프레스", "Incline Dumbbell Press"),
    (S, Equipment.dumbbell, BodyPart.chest, None, "덤벨 플라이", "Dumbbell Fly"),
    (S, Equipment.cable, BodyPart.chest, None, "케이블 크로스오버", "Cable Crossover"),
    (S, Equipment.cable, BodyPart.chest, None, "로우 케이블 플라이", "Low Cable Fly"),
    (S, Equipment.cable, BodyPart.chest, None, "하이 케이블 플라이", "High Cable Fly"),
    (S, Equipment.machine, BodyPart.chest, BodyPart.triceps, "체스트 프레스 머신", "Machine Chest Press"),
    (S, Equipment.machine, BodyPart.chest, None, "펙 덱 플라이", "Pec Deck Fly"),
    (S, Equipment.bodyweight, BodyPart.chest, BodyPart.triceps, "푸시업", "Push-Up"),
    (S, Equipment.bodyweight, BodyPart.chest, BodyPart.triceps, "인클라인 푸시업", "Incline Push-Up"),
    (S, Equipment.bodyweight, BodyPart.chest, BodyPart.triceps, "딥스", "Chest Dip"),
    (S, Equipment.dumbbell, BodyPart.chest, BodyPart.back, "덤벨 풀오버", "Dumbbell Pullover"),

    # Back
    (S, Equipment.barbell, BodyPart.back, BodyPart.leg, "데드리프트", "Deadlift"),
    (S, Equipment.barbell, BodyPart.back, BodyPart.biceps, "바벨 로우", "Barbell Row"),
    (S, Equipment.barbell, BodyPart.back, BodyPart.biceps, "펜들레이 로우", "Pendlay Row"),
    (S, Equipment.barbell, BodyPart.back, BodyPart.biceps, "티바 로우", "T-Bar Row"),
    (S, Equipment.dumbbell, BodyPart.back, BodyPart.biceps, "원암 덤벨 로우", "One-Arm Dumbbell Row"),
    (S, Equipment.dumbbell, BodyPart.back, BodyPart.biceps, "체스트 서포티드 덤벨 로우", "Chest-Supported Dumbbell Row"),
    (S, Equipment.cable, BodyPart.back, BodyPart.biceps, "시티드 케이블 로우", "Seated Cable Row"),
    (S, Equipment.cable, BodyPart.back, None, "스트레이트 암 풀다운", "Straight-Arm Pulldown"),
    (S, Equipment.machine, BodyPart.back, BodyPart.biceps, "랫풀다운", "Lat Pulldown"),
    (S, Equipment.machine, BodyPart.back, BodyPart.biceps, "언더그립 랫풀다운", "Underhand Lat Pulldown"),
    (S, Equipment.machine, BodyPart.back, BodyPart.biceps, "머신 로우", "Machine Row"),
    (S, Equipment.machine, BodyPart.back, None, "백 익스텐션", "Back Extension"),
    (S, Equipment.bodyweight, BodyPart.back, BodyPart.biceps, "풀업", "Pull-Up"),
    (S, Equipment.bodyweight, BodyPart.back, BodyPart.biceps, "친업", "Chin-Up"),
    (S, Equipment.bodyweight, BodyPart.back, BodyPart.biceps, "인버티드 로우", "Inverted Row"),
    (S, Equipment.kettlebell, BodyPart.back, BodyPart.leg, "케틀벨 데드리프트", "Kettlebell Deadlift"),
    (S, Equipment.cable, BodyPart.back, BodyPart.shoulder, "페이스 풀", "Face Pull"),
    (S, Equipment.barbell, BodyPart.back, BodyPart.shoulder, "바벨 슈러그", "Barbell Shrug"),
    (S, Equipment.dumbbell, BodyPart.back, BodyPart.shoulder, "덤벨 슈러그", "Dumbbell Shrug"),

    # Shoulders
    (S, Equipment.barbell, BodyPart.shoulder, BodyPart.triceps, "오버헤드 프레스", "Overhead Press"),
    (S, Equipment.barbell, BodyPart.shoulder, BodyPart.triceps, "비하인드 넥 프레스", "Behind-the-Neck Press"),
    (S, Equipment.dumbbell, BodyPart.shoulder, BodyPart.triceps, "숄더프레스", "Shoulder Press"),
    (S, Equipment.dumbbell, BodyPart.shoulder, BodyPart.triceps, "아놀드 프레스", "Arnold Press"),
    (S, Equipment.dumbbell, BodyPart.shoulder, None, "덤벨 레터럴 레이즈", "Dumbbell Lateral Raise"),
    (S, Equipment.dumbbell, BodyPart.shoulder, None, "덤벨 프론트 레이즈", "Dumbbell Front Raise"),
    (S, Equipment.dumbbell, BodyPart.shoulder, BodyPart.back, "벤트오버 리어 델트 레이즈", "Bent-Over Rear Delt Raise"),
    (S, Equipment.cable, BodyPart.shoulder, None, "케이블 레터럴 레이즈", "Cable Lateral Raise"),
    (S, Equipment.cable, BodyPart.shoulder, None, "케이블 프론트 레이즈", "Cable Front Raise"),
    (S, Equipment.cable, BodyPart.shoulder, BodyPart.back, "케이블 리어 델트 플라이", "Cable Rear Delt Fly"),
    (S, Equipment.machine, BodyPart.shoulder, BodyPart.triceps, "머신 숄더프레스", "Machine Shoulder Press"),
    (S, Equipment.machine, BodyPart.shoulder, None, "머신 레터럴 레이즈", "Machine Lateral Raise"),
    (S, Equipment.machine, BodyPart.shoulder, BodyPart.back, "리버스 펙 덱 플라이", "Reverse Pec Deck Fly"),
    (S, Equipment.barbell, BodyPart.shoulder, BodyPart.back, "업라이트 로우", "Upright Row"),
    (S, Equipment.kettlebell, BodyPart.shoulder, BodyPart.triceps, "케틀벨 프레스", "Kettlebell Press"),
    (S, Equipment.bodyweight, BodyPart.shoulder, BodyPart.triceps, "파이크 푸시업", "Pike Push-Up"),

    # Biceps
    (S, Equipment.barbell, BodyPart.biceps, BodyPart.forearm, "바벨 컬", "Barbell Curl"),
    (S, Equipment.ezbar, BodyPart.biceps, BodyPart.forearm, "이지바 컬", "EZ-Bar Curl"),
    (S, Equipment.ezbar, BodyPart.biceps, None, "프리처 컬", "Preacher Curl"),
    (S, Equipment.dumbbell, BodyPart.biceps, BodyPart.forearm, "덤벨 컬", "Dumbbell Curl"),
    (S, Equipment.dumbbell, BodyPart.biceps, BodyPart.forearm, "해머 컬", "Hammer Curl"),
    (S, Equipment.dumbbell, BodyPart.biceps, None, "인클라인 덤벨 컬", "Incline Dumbbell Curl"),
    (S, Equipment.dumbbell, BodyPart.biceps, None, "컨센트레이션 컬", "Concentration Curl"),
    (S, Equipment.dumbbell, BodyPart.biceps, None, "스파이더 컬", "Spider Curl"),
    (S, Equipment.cable, BodyPart.biceps, None, "케이블 컬", "Cable Curl"),
    (S, Equipment.cable, BodyPart.biceps, None, "오버헤드 케이블 컬", "Overhead Cable Curl"),
    (S, Equipment.machine, BodyPart.biceps, None, "머신 바이셉 컬", "Machine Biceps Curl"),
    (S, Equipment.dumbbell, BodyPart.biceps, BodyPart.forearm, "조트맨 컬", "Zottman Curl"),

    # Triceps
    (S, Equipment.barbell, BodyPart.triceps, BodyPart.chest, "클로즈그립 벤치프레스", "Close-Grip Bench Press"),
    (S, Equipment.ezbar, BodyPart.triceps, None, "라잉 트라이셉 익스텐션", "Lying Triceps Extension"),
    (S, Equipment.ezbar, BodyPart.triceps, None, "이지바 스컬 크러셔", "EZ-Bar Skull Crusher"),
    (S, Equipment.dumbbell, BodyPart.triceps, None, "덤벨 오버헤드 트라이셉 익스텐션", "Dumbbell Overhead Triceps Extension"),
    (S, Equipment.dumbbell, BodyPart.triceps, None, "덤벨 킥백", "Dumbbell Kickback"),
    (S, Equipment.cable, BodyPart.triceps, None, "케이블 푸시다운", "Cable Triceps Pushdown"),
    (S, Equipment.cable, BodyPart.triceps, None, "로프 푸시다운", "Rope Triceps Pushdown"),
    (S, Equipment.cable, BodyPart.triceps, None, "오버헤드 케이블 익스텐션", "Overhead Cable Triceps Extension"),
    (S, Equipment.machine, BodyPart.triceps, BodyPart.chest, "어시스트 딥 머신", "Assisted Dip Machine"),
    (S, Equipment.machine, BodyPart.triceps, None, "머신 트라이셉 익스텐션", "Machine Triceps Extension"),
    (S, Equipment.bodyweight, BodyPart.triceps, BodyPart.chest, "벤치 딥스", "Bench Dip"),
    (S, Equipment.bodyweight, BodyPart.triceps, BodyPart.chest, "다이아몬드 푸시업", "Diamond Push-Up"),

    # Forearms and grip
    (S, Equipment.barbell, BodyPart.forearm, None, "바벨 리스트 컬", "Barbell Wrist Curl"),
    (S, Equipment.barbell, BodyPart.forearm, None, "리버스 바벨 리스트 컬", "Reverse Barbell Wrist Curl"),
    (S, Equipment.ezbar, BodyPart.forearm, BodyPart.biceps, "리버스 컬", "Reverse Curl"),
    (S, Equipment.dumbbell, BodyPart.forearm, None, "덤벨 리스트 컬", "Dumbbell Wrist Curl"),
    (S, Equipment.dumbbell, BodyPart.forearm, None, "덤벨 리스트 로테이션", "Dumbbell Wrist Rotation"),
    (S, Equipment.dumbbell, BodyPart.forearm, BodyPart.core, "파머스 워크", "Farmer's Walk"),
    (S, Equipment.bodyweight, BodyPart.forearm, BodyPart.back, "데드 행", "Dead Hang"),
    (S, Equipment.others, BodyPart.forearm, None, "플레이트 핀치", "Plate Pinch"),

    # Legs and glutes
    (S, Equipment.barbell, BodyPart.leg, BodyPart.core, "바벨 스쿼트", "Squat"),
    (S, Equipment.barbell, BodyPart.leg, BodyPart.core, "프론트 스쿼트", "Front Squat"),
    (S, Equipment.barbell, BodyPart.leg, None, "루마니안 데드리프트", "Romanian Deadlift"),
    (S, Equipment.barbell, BodyPart.leg, None, "스모 데드리프트", "Sumo Deadlift"),
    (S, Equipment.barbell, BodyPart.leg, None, "굿모닝", "Good Morning"),
    (S, Equipment.barbell, BodyPart.leg, None, "바벨 힙 쓰러스트", "Barbell Hip Thrust"),
    (S, Equipment.barbell, BodyPart.leg, None, "바벨 런지", "Barbell Lunge"),
    (S, Equipment.dumbbell, BodyPart.leg, None, "덤벨 런지", "Dumbbell Lunge"),
    (S, Equipment.dumbbell, BodyPart.leg, None, "불가리안 스플릿 스쿼트", "Bulgarian Split Squat"),
    (S, Equipment.dumbbell, BodyPart.leg, BodyPart.core, "고블릿 스쿼트", "Goblet Squat"),
    (S, Equipment.dumbbell, BodyPart.leg, None, "덤벨 스텝업", "Dumbbell Step-Up"),
    (S, Equipment.kettlebell, BodyPart.leg, BodyPart.core, "케틀벨 스윙", "Kettlebell Swing"),
    (S, Equipment.machine, BodyPart.leg, None, "레그 프레스", "Leg Press"),
    (S, Equipment.machine, BodyPart.leg, None, "핵 스쿼트", "Hack Squat"),
    (S, Equipment.machine, BodyPart.leg, None, "레그 익스텐션", "Leg Extension"),
    (S, Equipment.machine, BodyPart.leg, None, "라잉 레그 컬", "Lying Leg Curl"),
    (S, Equipment.machine, BodyPart.leg, None, "시티드 레그 컬", "Seated Leg Curl"),
    (S, Equipment.machine, BodyPart.leg, None, "힙 어브덕션", "Hip Abduction"),
    (S, Equipment.machine, BodyPart.leg, None, "힙 어덕션", "Hip Adduction"),
    (S, Equipment.machine, BodyPart.leg, None, "스탠딩 카프 레이즈", "Standing Calf Raise"),
    (S, Equipment.machine, BodyPart.leg, None, "시티드 카프 레이즈", "Seated Calf Raise"),
    (S, Equipment.bodyweight, BodyPart.leg, None, "바디웨이트 스쿼트", "Bodyweight Squat"),
    (S, Equipment.bodyweight, BodyPart.leg, None, "리버스 런지", "Reverse Lunge"),
    (S, Equipment.bodyweight, BodyPart.leg, None, "글루트 브리지", "Glute Bridge"),
    (S, Equipment.bodyweight, BodyPart.leg, None, "싱글 레그 글루트 브리지", "Single-Leg Glute Bridge"),
    (S, Equipment.bodyweight, BodyPart.leg, None, "노르딕 햄스트링 컬", "Nordic Hamstring Curl"),
    (S, Equipment.bodyweight, BodyPart.leg, None, "월 싯", "Wall Sit"),
    (S, Equipment.cable, BodyPart.leg, None, "케이블 킥백", "Cable Glute Kickback"),

    # Core
    (S, Equipment.bodyweight, BodyPart.core, None, "크런치", "Crunch"),
    (S, Equipment.bodyweight, BodyPart.core, None, "리버스 크런치", "Reverse Crunch"),
    (S, Equipment.bodyweight, BodyPart.core, None, "바이시클 크런치", "Bicycle Crunch"),
    (S, Equipment.bodyweight, BodyPart.core, None, "싯업", "Sit-Up"),
    (S, Equipment.bodyweight, BodyPart.core, None, "플랭크", "Plank"),
    (S, Equipment.bodyweight, BodyPart.core, None, "사이드 플랭크", "Side Plank"),
    (S, Equipment.bodyweight, BodyPart.core, None, "마운틴 클라이머", "Mountain Climber"),
    (S, Equipment.bodyweight, BodyPart.core, None, "레그 레이즈", "Lying Leg Raise"),
    (S, Equipment.bodyweight, BodyPart.core, BodyPart.forearm, "행잉 레그 레이즈", "Hanging Leg Raise"),
    (S, Equipment.bodyweight, BodyPart.core, BodyPart.forearm, "행잉 니 레이즈", "Hanging Knee Raise"),
    (S, Equipment.others, BodyPart.core, None, "애브 휠 롤아웃", "Ab Wheel Rollout"),
    (S, Equipment.cable, BodyPart.core, None, "케이블 크런치", "Cable Crunch"),
    (S, Equipment.cable, BodyPart.core, None, "팔로프 프레스", "Pallof Press"),
    (S, Equipment.cable, BodyPart.core, None, "케이블 우드초퍼", "Cable Woodchop"),
    (S, Equipment.dumbbell, BodyPart.core, None, "러시안 트위스트", "Russian Twist"),
    (S, Equipment.dumbbell, BodyPart.core, None, "덤벨 사이드 벤드", "Dumbbell Side Bend"),
    (S, Equipment.bodyweight, BodyPart.core, None, "데드 버그", "Dead Bug"),
    (S, Equipment.bodyweight, BodyPart.core, None, "버드 독", "Bird Dog"),
    (S, Equipment.bodyweight, BodyPart.core, None, "홀로우 바디 홀드", "Hollow Body Hold"),

    # Cardio
    (C, Equipment.machine, BodyPart.leg, None, "트레드밀 달리기", "Treadmill Running"),
    (C, Equipment.machine, BodyPart.leg, None, "트레드밀 걷기", "Treadmill Walking"),
    (C, Equipment.machine, BodyPart.leg, None, "실내 자전거", "Stationary Bike"),
    (C, Equipment.machine, BodyPart.leg, BodyPart.back, "로잉 머신", "Rowing Machine"),
    (C, Equipment.machine, BodyPart.leg, None, "스텝밀", "Stair Climber"),
    (C, Equipment.machine, BodyPart.leg, None, "일립티컬", "Elliptical Trainer"),
    (C, Equipment.others, BodyPart.leg, None, "줄넘기", "Jump Rope"),
    (C, Equipment.bodyweight, BodyPart.leg, BodyPart.core, "버피", "Burpee"),
    (C, Equipment.others, BodyPart.leg, None, "야외 달리기", "Outdoor Running"),
    (C, Equipment.others, BodyPart.leg, None, "사이클링", "Cycling"),

    # Stretching and mobility
    (T, Equipment.bodyweight, BodyPart.chest, BodyPart.shoulder, "도어웨이 가슴 스트레칭", "Doorway Chest Stretch"),
    (T, Equipment.bodyweight, BodyPart.back, None, "차일드 포즈", "Child's Pose"),
    (T, Equipment.bodyweight, BodyPart.back, BodyPart.core, "캣 카우 스트레칭", "Cat-Cow Stretch"),
    (T, Equipment.bodyweight, BodyPart.shoulder, None, "크로스 바디 숄더 스트레칭", "Cross-Body Shoulder Stretch"),
    (T, Equipment.bodyweight, BodyPart.triceps, BodyPart.shoulder, "오버헤드 트라이셉 스트레칭", "Overhead Triceps Stretch"),
    (T, Equipment.bodyweight, BodyPart.leg, None, "스탠딩 쿼드 스트레칭", "Standing Quad Stretch"),
    (T, Equipment.bodyweight, BodyPart.leg, None, "시티드 햄스트링 스트레칭", "Seated Hamstring Stretch"),
    (T, Equipment.bodyweight, BodyPart.leg, None, "힙 플렉서 스트레칭", "Hip Flexor Stretch"),
    (T, Equipment.bodyweight, BodyPart.leg, None, "비둘기 자세", "Pigeon Pose"),
    (T, Equipment.others, BodyPart.leg, None, "종아리 폼롤링", "Calf Foam Rolling"),
]


def seed_exercises(db) -> list[Exercise]:
    """Insert missing exercises and return the complete seed catalog in seed order."""
    seed_names = [seed[5] for seed in EXERCISE_SEEDS]
    existing = db.scalars(
        select(Exercise).where(Exercise.name_eng.in_(seed_names))
    ).all()
    exercises_by_name = {exercise.name_eng: exercise for exercise in existing}

    new_exercises = []
    for category, equipment, body_part, sub_body_part, name_kr, name_eng in EXERCISE_SEEDS:
        if name_eng in exercises_by_name:
            continue
        exercise = Exercise(
            category=category,
            equipment=equipment,
            body_part=body_part,
            sub_body_part=sub_body_part,
            name_kr=name_kr,
            name_eng=name_eng,
        )
        exercises_by_name[name_eng] = exercise
        new_exercises.append(exercise)

    db.add_all(new_exercises)
    db.flush()

    return [exercises_by_name[name] for name in seed_names]
