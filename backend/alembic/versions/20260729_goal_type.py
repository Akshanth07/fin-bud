"""add goal_type and priority to goals

Revision ID: 20260729_goal_type
Revises:
Create Date: 2026-07-29
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = '20260729_goal_type'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('goals', sa.Column('goal_type', sa.Text(), nullable=False, server_default='custom'), schema='public')
    op.add_column('goals', sa.Column('priority', sa.Text(), nullable=False, server_default='medium'), schema='public')


def downgrade():
    op.drop_column('goals', 'priority', schema='public')
    op.drop_column('goals', 'goal_type', schema='public')
