"""Add ``ean_code`` to beers + matching CHECK and UNIQUE constraints.

Adds the standard product barcode column on ``beers``. The column is
populated by the Open Food Facts importer (PR2) and used as the primary
external match key for community scans (PR3). Accepts EAN-8, UPC-A
(12 digits), EAN-13 and EAN-14 — the four formats commonly found on
beverage packaging in Europe and North America.

The unique constraint allows multiple NULL rows on both PostgreSQL and
SQLite, so beers without a known barcode (internal seeds, community
drafts) do not collide with each other; only two distinct beers
claiming the same EAN are rejected.

Revision ID: 004
Revises: 003
Create Date: 2026-05-01
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "004"
down_revision: str | None = "003"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    """Add ``ean_code`` column + CHECK length + UNIQUE constraint."""

    with op.batch_alter_table("beers") as batch_op:
        batch_op.add_column(
            sa.Column("ean_code", sa.String(length=14), nullable=True),
        )
        batch_op.create_check_constraint(
            "ck_beers_ean_code_length",
            "ean_code IS NULL OR length(ean_code) IN (8, 12, 13, 14)",
        )
        batch_op.create_unique_constraint(
            "uq_beers_ean_code",
            ["ean_code"],
        )


def downgrade() -> None:
    """Drop the unique + CHECK constraints and the column."""

    with op.batch_alter_table("beers") as batch_op:
        batch_op.drop_constraint("uq_beers_ean_code", type_="unique")
        batch_op.drop_constraint("ck_beers_ean_code_length", type_="check")
        batch_op.drop_column("ean_code")
