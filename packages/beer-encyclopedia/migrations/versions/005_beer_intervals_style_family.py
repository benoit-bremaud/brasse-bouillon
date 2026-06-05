"""Beer IBU/SRM as min-max intervals + Style.family (BJCP).

Two model changes, batched per accepted conception:

- **ADR-0017** — replace ``beers.ibu`` / ``beers.srm`` single columns with
  ``ibu_min`` / ``ibu_max`` / ``srm_min`` / ``srm_max`` intervals, plus CHECK
  constraints mirroring the ABV pattern already on ``styles`` (each bound
  non-negative, ``min <= max``). IBU/colour are rarely published and disagree
  across sources, so a single integer is false precision; an interval is honest.
- **ADR-0016 D2** — add ``styles.family`` (canonical BJCP style family) backing
  the family-graded style similarity of recipe-matching v2.

Dropping ``ibu`` / ``srm`` is a clean cut: per ADR-0017 (and ADR-0001 "build for
today") there is no canonical beer seed yet and Open Food Facts leaves these
NULL, so no meaningful data is lost. SQLite cannot ``DROP COLUMN`` / add CHECKs
in place, so this runs under ``batch_alter_table`` (table recreate).

Revision ID: 005
Revises: 004
Create Date: 2026-06-05
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "005"
down_revision: str | None = "004"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    """Add ``styles.family``; swap beer IBU/SRM scalars for min/max intervals."""

    with op.batch_alter_table("styles") as batch_op:
        batch_op.add_column(sa.Column("family", sa.String(length=50), nullable=True))

    # 1) Add the interval columns + CHECKs alongside the existing scalars.
    with op.batch_alter_table("beers") as batch_op:
        batch_op.add_column(sa.Column("ibu_min", sa.SmallInteger(), nullable=True))
        batch_op.add_column(sa.Column("ibu_max", sa.SmallInteger(), nullable=True))
        batch_op.add_column(sa.Column("srm_min", sa.SmallInteger(), nullable=True))
        batch_op.add_column(sa.Column("srm_max", sa.SmallInteger(), nullable=True))
        batch_op.create_check_constraint(
            "ck_beers_ibu_min_positive", "ibu_min IS NULL OR ibu_min >= 0"
        )
        batch_op.create_check_constraint(
            "ck_beers_ibu_max_positive", "ibu_max IS NULL OR ibu_max >= 0"
        )
        batch_op.create_check_constraint(
            "ck_beers_ibu_range",
            "ibu_min IS NULL OR ibu_max IS NULL OR ibu_min <= ibu_max",
        )
        batch_op.create_check_constraint(
            "ck_beers_srm_min_positive", "srm_min IS NULL OR srm_min >= 0"
        )
        batch_op.create_check_constraint(
            "ck_beers_srm_max_positive", "srm_max IS NULL OR srm_max >= 0"
        )
        batch_op.create_check_constraint(
            "ck_beers_srm_range",
            "srm_min IS NULL OR srm_max IS NULL OR srm_min <= srm_max",
        )

    # 2) Backfill: a previously-known single value becomes a degenerate
    #    interval (min == max) so no data is lost when the scalars are dropped.
    op.execute(
        "UPDATE beers SET ibu_min = ibu, ibu_max = ibu WHERE ibu IS NOT NULL"
    )
    op.execute(
        "UPDATE beers SET srm_min = srm, srm_max = srm WHERE srm IS NOT NULL"
    )

    # 3) Drop the now-migrated scalar columns.
    with op.batch_alter_table("beers") as batch_op:
        batch_op.drop_column("ibu")
        batch_op.drop_column("srm")


def downgrade() -> None:
    """Restore single ``ibu`` / ``srm`` columns; drop intervals + ``family``."""

    with op.batch_alter_table("beers") as batch_op:
        batch_op.add_column(sa.Column("ibu", sa.SmallInteger(), nullable=True))
        batch_op.add_column(sa.Column("srm", sa.SmallInteger(), nullable=True))

    # Collapse the interval back to a single value (its lower bound) — exact
    # for known values (min == max), lossy for genuine ranges (acceptable on a
    # downgrade).
    op.execute("UPDATE beers SET ibu = ibu_min WHERE ibu_min IS NOT NULL")
    op.execute("UPDATE beers SET srm = srm_min WHERE srm_min IS NOT NULL")

    with op.batch_alter_table("beers") as batch_op:
        batch_op.drop_constraint("ck_beers_ibu_min_positive", type_="check")
        batch_op.drop_constraint("ck_beers_ibu_max_positive", type_="check")
        batch_op.drop_constraint("ck_beers_ibu_range", type_="check")
        batch_op.drop_constraint("ck_beers_srm_min_positive", type_="check")
        batch_op.drop_constraint("ck_beers_srm_max_positive", type_="check")
        batch_op.drop_constraint("ck_beers_srm_range", type_="check")
        batch_op.drop_column("ibu_max")
        batch_op.drop_column("ibu_min")
        batch_op.drop_column("srm_max")
        batch_op.drop_column("srm_min")

    with op.batch_alter_table("styles") as batch_op:
        batch_op.drop_column("family")
