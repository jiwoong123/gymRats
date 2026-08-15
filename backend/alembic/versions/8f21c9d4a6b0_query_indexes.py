"""Add indexes for dashboard routine usage and personal-record maxima.

Revision ID: 8f21c9d4a6b0
Revises: c947089cf239
"""

from typing import Sequence, Union

from alembic import op


revision: str = "8f21c9d4a6b0"
down_revision: Union[str, Sequence[str], None] = "c947089cf239"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(
        "ix_ws_user_routine_started",
        "workout_sessions",
        ["user_id", "routine_id", "started_at"],
        unique=False,
    )
    op.create_index(
        "ix_pr_user_ex_type_value",
        "personal_records",
        ["user_id", "exercise_id", "record_type", "value"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_pr_user_ex_type_value", table_name="personal_records")
    op.drop_index("ix_ws_user_routine_started", table_name="workout_sessions")
