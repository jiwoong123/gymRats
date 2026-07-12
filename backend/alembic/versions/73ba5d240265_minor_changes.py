"""minor changes

Revision ID: 73ba5d240265
Revises: 6ae45ec2d94a
Create Date: 2026-07-12 12:19:11.062218

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '73ba5d240265'
down_revision: Union[str, Sequence[str], None] = '6ae45ec2d94a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
