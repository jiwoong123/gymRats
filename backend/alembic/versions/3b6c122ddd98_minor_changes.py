"""minor changes

Revision ID: 3b6c122ddd98
Revises: 3dc2b0260d0a
Create Date: 2026-07-12 12:19:56.868639

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3b6c122ddd98'
down_revision: Union[str, Sequence[str], None] = '3dc2b0260d0a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
