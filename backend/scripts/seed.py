from sqlalchemy.orm import Session

from app.db.database import SessionLocal

from app.seed.seed_users import seed_users
from app.seed.seed_exercises import seed_exercises
from app.seed.seed_routines import seed_routines
from app.seed.seed_workouts import seed_workouts


def main():

    db: Session = SessionLocal()

    try:

        print("Seeding users...")
        users = seed_users(db)

        print("Seeding exercises...")
        exercises = seed_exercises(db)

        print("Seeding routines...")
        routines = seed_routines(
            db,
            users,
            exercises,
        )

        print("Seeding workouts...")
        seed_workouts(
            db,
            users,
            routines,
            exercises,
        )

        db.commit()

        print("Done!")

    finally:
        db.close()


if __name__ == "__main__":
    main()