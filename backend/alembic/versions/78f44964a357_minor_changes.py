"""minor changes

Revision ID: 78f44964a357
Revises: 3b6c122ddd98
Create Date: 2026-07-12 12:22:38.248291

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '78f44964a357'
down_revision: Union[str, Sequence[str], None] = '3b6c122ddd98'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
