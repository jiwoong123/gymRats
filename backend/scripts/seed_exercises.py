from sqlalchemy.orm import Session

from app.db.database import SessionLocal
from app.seed.seed_exercises import seed_exercises


def main() -> None:
    db: Session = SessionLocal()
    try:
        catalog_size = len(seed_exercises(db))
        db.commit()
        print(f"Exercise seed complete. Catalog contains {catalog_size} exercises.")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
