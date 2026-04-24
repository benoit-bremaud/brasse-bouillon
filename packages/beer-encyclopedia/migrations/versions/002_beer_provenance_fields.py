"""Add provenance fields to beers table.

Introduces the four provenance columns on ``beers`` that the Scan Tranche
2 matching algorithm relies on, and that anticipate the v0.2 community
contribution flow per ADR-0001 (shapes anticipate evolution):

- ``source`` — NOT NULL ``VARCHAR(20)`` with a CHECK constraint limiting
  values to ``'openfoodfacts' | 'internal' | 'community'``, default
  ``'internal'`` for existing rows (all seeded internally today) and
  future inserts that do not specify.
- ``contributed_by`` — nullable ``UUID``, loose link to the users table
  in ``packages/api``. No FK because the NestJS API and the Python
  encyclopedia may run against separate databases in some topologies.
- ``contributed_at`` / ``approved_at`` — nullable ``TIMESTAMP WITH
  TIME ZONE``, both NULL in v0.1 and populated by the community
  contribution / moderation flow in v0.2+.

Revision ID: 002
Revises: 001
Create Date: 2026-04-24
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "002"
down_revision: str | None = "001"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    """Add provenance columns + CHECK constraint on beers."""

    # Add the four new columns. ``source`` ships with a server default
    # so existing rows are backfilled to 'internal' without requiring a
    # data migration pass.
    op.add_column(
        "beers",
        sa.Column(
            "source",
            sa.String(length=20),
            nullable=False,
            server_default="internal",
        ),
    )
    op.add_column(
        "beers",
        sa.Column("contributed_by", sa.Uuid(), nullable=True),
    )
    op.add_column(
        "beers",
        sa.Column(
            "contributed_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )
    op.add_column(
        "beers",
        sa.Column(
            "approved_at",
            sa.DateTime(timezone=True),
            nullable=True,
        ),
    )

    # Enforce the canonical provenance values at the DB level. Duplicates
    # the whitelist on the SQLAlchemy model so both layers reject invalid
    # inserts — the CHECK is the last line of defence against direct SQL.
    op.create_check_constraint(
        "ck_beers_source_valid",
        "beers",
        "source IN ('openfoodfacts', 'internal', 'community')",
    )


def downgrade() -> None:
    """Remove the provenance columns + CHECK constraint."""

    op.drop_constraint("ck_beers_source_valid", "beers", type_="check")
    op.drop_column("beers", "approved_at")
    op.drop_column("beers", "contributed_at")
    op.drop_column("beers", "contributed_by")
    op.drop_column("beers", "source")
