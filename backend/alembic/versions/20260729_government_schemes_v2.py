"""government schemes v2 and saved schemes and sync logs

Revision ID: 20260729_gov_schemes_v2
Revises: 20260729_goal_type
Create Date: 2026-07-29
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '20260729_gov_schemes_v2'
down_revision = '20260729_goal_type'
branch_labels = None
depends_on = None


def upgrade():
    # Upgrade government_schemes table
    op.add_column('government_schemes', sa.Column('scheme_code', sa.Text(), nullable=True), schema='public')
    op.add_column('government_schemes', sa.Column('name', sa.Text(), nullable=True), schema='public')
    op.add_column('government_schemes', sa.Column('benefits', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False), schema='public')
    op.add_column('government_schemes', sa.Column('eligibility_summary', sa.Text(), nullable=True), schema='public')
    op.add_column('government_schemes', sa.Column('official_url', sa.Text(), nullable=True), schema='public')
    op.add_column('government_schemes', sa.Column('documents_required', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False), schema='public')
    op.add_column('government_schemes', sa.Column('application_process', postgresql.JSONB(astext_type=sa.Text()), server_default='[]', nullable=False), schema='public')
    op.add_column('government_schemes', sa.Column('ministry', sa.Text(), nullable=True), schema='public')
    op.add_column('government_schemes', sa.Column('source', sa.Text(), server_default='myScheme', nullable=True), schema='public')
    op.add_column('government_schemes', sa.Column('version', sa.Integer(), server_default='1', nullable=False), schema='public')
    op.add_column('government_schemes', sa.Column('deadline', sa.Text(), nullable=True), schema='public')
    op.add_column('government_schemes', sa.Column('status', sa.Text(), server_default='ACTIVE', nullable=False), schema='public')
    op.add_column('government_schemes', sa.Column('last_seen_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False), schema='public')
    op.add_column('government_schemes', sa.Column('last_synced_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False), schema='public')
    op.add_column('government_schemes', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False), schema='public')

    # Create indexes on government_schemes
    op.create_index('idx_schemes_code', 'government_schemes', ['scheme_code'], schema='public')
    op.create_index('idx_schemes_category', 'government_schemes', ['category'], schema='public')
    op.create_index('idx_schemes_state', 'government_schemes', ['state'], schema='public')
    op.create_index('idx_schemes_status', 'government_schemes', ['status'], schema='public')
    op.create_index('idx_schemes_ministry', 'government_schemes', ['ministry'], schema='public')

    # Create saved_schemes table
    op.create_table(
        'saved_schemes',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('public.users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('scheme_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('public.government_schemes.id', ondelete='CASCADE'), nullable=False),
        sa.Column('application_status', sa.Text(), server_default='Interested', nullable=False),
        sa.Column('saved_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.UniqueConstraint('user_id', 'scheme_id', name='saved_schemes_user_scheme_unique'),
        schema='public'
    )
    op.create_index('idx_saved_schemes_user', 'saved_schemes', ['user_id'], schema='public')
    op.create_index('idx_saved_schemes_status', 'saved_schemes', ['application_status'], schema='public')

    # Create scheme_sync_logs table
    op.create_table(
        'scheme_sync_logs',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('source', sa.Text(), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('new_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('updated_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('inactive_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('failed_count', sa.Integer(), server_default='0', nullable=False),
        sa.Column('sync_status', sa.Text(), server_default='IN_PROGRESS', nullable=False),
        schema='public'
    )
    op.create_index('idx_sync_logs_source', 'scheme_sync_logs', ['source'], schema='public')
    op.create_index('idx_sync_logs_status', 'scheme_sync_logs', ['sync_status'], schema='public')


def downgrade():
    op.drop_table('scheme_sync_logs', schema='public')
    op.drop_table('saved_schemes', schema='public')
    op.drop_index('idx_schemes_ministry', 'government_schemes', schema='public')
    op.drop_index('idx_schemes_status', 'government_schemes', schema='public')
    op.drop_index('idx_schemes_state', 'government_schemes', schema='public')
    op.drop_index('idx_schemes_category', 'government_schemes', schema='public')
    op.drop_index('idx_schemes_code', 'government_schemes', schema='public')
