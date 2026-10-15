"""Add drip_day and drip config fields

Adds drip_day (nullable int) to activity and chapter tables, and drip_timezone
(text, default 'Europe/Warsaw') and drip_unlock_hour (integer, default 6) to 
course table for drip-content scheduling.

Revision ID: b7c8d9e0f1g2
Revises: x3y4z5a6b7c8
Create Date: 2026-10-15

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel  # noqa: F401


revision: str = 'b7c8d9e0f1g2'
down_revision: Union[str, None] = 'x3y4z5a6b7c8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has_column(inspector, table: str, column: str) -> bool:
    return column in {col['name'] for col in inspector.get_columns(table)}


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    # Add drip_day to activity
    if 'activity' in tables and not _has_column(inspector, 'activity', 'drip_day'):
        bind.exec_driver_sql(
            "ALTER TABLE activity ADD COLUMN drip_day INTEGER NULL"
        )

    # Add drip_day to chapter
    if 'chapter' in tables and not _has_column(inspector, 'chapter', 'drip_day'):
        bind.exec_driver_sql(
            "ALTER TABLE chapter ADD COLUMN drip_day INTEGER NULL"
        )

    # Add drip_timezone to course
    if 'course' in tables and not _has_column(inspector, 'course', 'drip_timezone'):
        bind.exec_driver_sql(
            "ALTER TABLE course ADD COLUMN drip_timezone TEXT NOT NULL DEFAULT 'Europe/Warsaw'"
        )

    # Add drip_unlock_hour to course
    if 'course' in tables and not _has_column(inspector, 'course', 'drip_unlock_hour'):
        bind.exec_driver_sql(
            "ALTER TABLE course ADD COLUMN drip_unlock_hour INTEGER NOT NULL DEFAULT 6"
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = set(inspector.get_table_names())

    if 'activity' in tables and _has_column(inspector, 'activity', 'drip_day'):
        op.drop_column('activity', 'drip_day')

    if 'chapter' in tables and _has_column(inspector, 'chapter', 'drip_day'):
        op.drop_column('chapter', 'drip_day')

    if 'course' in tables and _has_column(inspector, 'course', 'drip_unlock_hour'):
        op.drop_column('course', 'drip_unlock_hour')

    if 'course' in tables and _has_column(inspector, 'course', 'drip_timezone'):
        op.drop_column('course', 'drip_timezone')
