"""Add email verification challenges.

Revision ID: d5ae46c1f092
Revises: 8f21c9d4a6b0
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "d5ae46c1f092"
down_revision: Union[str, Sequence[str], None] = "8f21c9d4a6b0"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "email_verifications",
        sa.Column("id", sa.Integer(), sa.Identity(always=False), nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("code_hashed", sa.String(length=64), nullable=False),
        sa.Column("verification_token_hashed", sa.String(length=64), nullable=True),
        sa.Column("expires_at", sa.DateTime(), nullable=False),
        sa.Column("verified_at", sa.DateTime(), nullable=True),
        sa.Column("consumed_at", sa.DateTime(), nullable=True),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.text("CURRENT_TIMESTAMP"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_email_verification_email_created",
        "email_verifications",
        ["email", "created_at"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_email_verification_email_created", table_name="email_verifications")
    op.drop_table("email_verifications")
