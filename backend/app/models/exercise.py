from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from app.db.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[int] = mapped_column(primary_key=True)

    category_code: Mapped[int]

    equipment_code: Mapped[int]

    body_part_code: Mapped[int]

    sub_body_part_code: Mapped[int| None]
    
    name_eng: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    name_kr: Mapped[str] = mapped_column(
        String(30),
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
