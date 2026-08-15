from sqlalchemy.orm import Session

from app.models.routine_set import RoutineSet


class RoutineSetRepository:

    @staticmethod
    def create_routine_set(
        db: Session,
        routine_set: RoutineSet,
    ) -> RoutineSet:
        db.add(routine_set)
        db.flush()
        db.refresh(routine_set)
        return routine_set

    @staticmethod
    def create_routine_sets(
        db: Session,
        routine_sets: list[RoutineSet],
    ) -> list[RoutineSet]:
        db.add_all(routine_sets)
        db.flush()
        for routine_set in routine_sets:
            db.refresh(routine_set)
        return routine_sets

    @staticmethod
    def get_routine_set(
        db: Session,
        routine_set_id: int,
    ) -> RoutineSet | None:
        return (
            db.query(RoutineSet)
            .filter(RoutineSet.id == routine_set_id)
            .first()
        )

    @staticmethod
    def get_sets_by_exercise(
        db: Session,
        routine_exercise_id: int,
    ) -> list[RoutineSet]:
        return (
            db.query(RoutineSet)
            .filter(RoutineSet.routine_exercise_id == routine_exercise_id)
            .order_by(RoutineSet.set_number.asc())
            .all()
        )

    @staticmethod
    def update_routine_set(
        db: Session,
        routine_set: RoutineSet,
        values: dict,
    ) -> RoutineSet:
        for field, value in values.items():
            setattr(routine_set, field, value)

        db.flush()
        db.refresh(routine_set)
        return routine_set

    @staticmethod
    def delete_routine_set(
        db: Session,
        routine_set: RoutineSet,
    ) -> None:
        db.delete(routine_set)
        db.flush()
