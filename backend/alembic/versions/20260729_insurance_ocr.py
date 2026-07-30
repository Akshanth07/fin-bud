"""insurance ocr and policy analyzer columns

Revision ID: 20260729_insurance_ocr
Revises: 20260729_gov_schemes_v2
Create Date: 2026-07-29
"""

from alembic import op
import sqlalchemy as sa

revision = '20260729_insurance_ocr'
down_revision = '20260729_gov_schemes_v2'
branch_labels = None
depends_on = None


def upgrade():
    op.add_column('insurance_policies', sa.Column('company', sa.Text(), server_default='Insurance Provider', nullable=False), schema='public')
    op.add_column('insurance_policies', sa.Column('policy_holder', sa.Text(), nullable=True), schema='public')
    op.add_column('insurance_policies', sa.Column('plan_name', sa.Text(), nullable=True), schema='public')
    op.add_column('insurance_policies', sa.Column('premium_amount', sa.Numeric(precision=15, scale=2), server_default='0.00', nullable=False), schema='public')
    op.add_column('insurance_policies', sa.Column('premium_frequency', sa.Text(), server_default='Annual', nullable=False), schema='public')
    op.add_column('insurance_policies', sa.Column('nominee', sa.Text(), nullable=True), schema='public')
    op.add_column('insurance_policies', sa.Column('start_date', sa.Date(), nullable=True), schema='public')
    op.add_column('insurance_policies', sa.Column('end_date', sa.Date(), nullable=True), schema='public')
    op.add_column('insurance_policies', sa.Column('maturity_date', sa.Date(), nullable=True), schema='public')
    op.add_column('insurance_policies', sa.Column('claim_contact', sa.Text(), nullable=True), schema='public')
    op.add_column('insurance_policies', sa.Column('status', sa.Text(), server_default='Active', nullable=False), schema='public')
    op.add_column('insurance_policies', sa.Column('ocr_confidence', sa.Float(), server_default='100.0', nullable=False), schema='public')

    op.create_index('idx_insurance_user', 'insurance_policies', ['user_id'], schema='public')
    op.create_index('idx_insurance_number', 'insurance_policies', ['policy_number'], schema='public')
    op.create_index('idx_insurance_type', 'insurance_policies', ['policy_type'], schema='public')


def downgrade():
    op.drop_index('idx_insurance_type', 'insurance_policies', schema='public')
    op.drop_index('idx_insurance_number', 'insurance_policies', schema='public')
    op.drop_index('idx_insurance_user', 'insurance_policies', schema='public')
    op.drop_column('insurance_policies', 'ocr_confidence', schema='public')
    op.drop_column('insurance_policies', 'status', schema='public')
    op.drop_column('insurance_policies', 'claim_contact', schema='public')
    op.drop_column('insurance_policies', 'maturity_date', schema='public')
    op.drop_column('insurance_policies', 'end_date', schema='public')
    op.drop_column('insurance_policies', 'start_date', schema='public')
    op.drop_column('insurance_policies', 'nominee', schema='public')
    op.drop_column('insurance_policies', 'premium_frequency', schema='public')
    op.drop_column('insurance_policies', 'premium_amount', schema='public')
    op.drop_column('insurance_policies', 'plan_name', schema='public')
    op.drop_column('insurance_policies', 'policy_holder', schema='public')
    op.drop_column('insurance_policies', 'company', schema='public')
