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


# Canonical provenance values. Mirrors ``BEER_SOURCE_VALUES`` in
# ``db/models/beer.py`` — kept duplicated in the migration (instead of
# imported from the model) so historical migrations remain runnable even
# if the model evolves.
SOURCE_VALUES: tuple[str, ...] = ("openfoodfacts", "internal", "community")

SOURCE_CHECK_EXPR: str = "source IN ({})".format(
    ", ".join(f"'{v}'" for v in SOURCE_VALUES)
)


def upgrade() -> None:
    """Add provenance columns + CHECK constraint on beers.

    Uses ``batch_alter_table`` so the same migration runs on both
    PostgreSQL (production) and SQLite (tests). SQLite does not support
    ``ALTER TABLE ADD CONSTRAINT`` directly — ``batch_alter_table``
    transparently rewrites the table under the hood on that backend.
    """

    with op.batch_alter_table("beers") as batch_op:
        # ``server_default=sa.text("'internal'")`` renders as
        # ``DEFAULT 'internal'`` (quoted) in the emitted DDL. A bare
        # ``server_default="internal"`` would be treated as a raw SQL
        # expression (``DEFAULT internal``) and fail on both PostgreSQL
        # and SQLite. Matches the convention used in migration 001.
        batch_op.add_column(
            sa.Column(
                "source",
                sa.String(length=20),
                nullable=False,
                server_default=sa.text("'internal'"),
            ),
        )
        batch_op.add_column(sa.Column("contributed_by", sa.Uuid(), nullable=True))
        batch_op.add_column(
            sa.Column(
                "contributed_at",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
        )
        batch_op.add_column(
            sa.Column(
                "approved_at",
                sa.DateTime(timezone=True),
                nullable=True,
            ),
        )

        # Enforce the canonical provenance whitelist at the DB level.
        # Paired with the ``@validates`` decorator on the SQLAlchemy model
        # so invalid values are rejected at both the ORM layer (readable
        # ``ValueError`` at assignment time) AND the DB layer (last line of
        # defence against direct SQL).
        batch_op.create_check_constraint(
            "ck_beers_source_valid",
            SOURCE_CHECK_EXPR,
        )


def downgrade() -> None:
    """Remove the provenance columns + CHECK constraint."""

    with op.batch_alter_table("beers") as batch_op:
        batch_op.drop_constraint("ck_beers_source_valid", type_="check")
        batch_op.drop_column("approved_at")
        batch_op.drop_column("contributed_at")
        batch_op.drop_column("contributed_by")
        batch_op.drop_column("source")
