from sqlalchemy import String, Text, Identity
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.db.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id:Mapped[int] = mapped_column(Identity(),primary_key=True)

    category: Mapped[int]

    equipment: Mapped[int]

    body_part: Mapped[int]

    sub_body_part: Mapped[int| None]
    
    name_eng: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    name_kr: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    description_eng: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )
    description_kr: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    personal_records: Mapped[list["PersonalRecord"]] = relationship(
        back_populates="exercise",
    )

    routine_exercises: Mapped[list["RoutineExercise"]] = relationship(
        back_populates="exercise"
    )

    workout_exercises: Mapped[list["WorkoutExercise"]] = relationship(
        back_populates="exercise"
    )
