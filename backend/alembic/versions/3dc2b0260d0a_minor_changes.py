"""minor changes

Revision ID: 3dc2b0260d0a
Revises: 73ba5d240265
Create Date: 2026-07-12 12:19:53.438125

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3dc2b0260d0a'
down_revision: Union[str, Sequence[str], None] = '73ba5d240265'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
