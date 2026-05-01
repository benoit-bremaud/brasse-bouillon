"""Add French legal reference (denominations table + beer regulatory fields).

Introduces the regulatory layer required to keep the encyclopedia
compliant with the French framework for beer composition and labelling:

- New ``legal_denominations`` table — controlled vocabulary of the ten
  legal beer denominations defined by decree 92-307 of 31 March 1992,
  modified by decree 2016-1531 of 15 November 2016. The table is
  populated by ``scripts/seed_legal_denominations.py``.
- Four new columns on ``beers``:
  - ``legal_denomination`` (nullable VARCHAR(50), CHECK against the ten
    canonical codes) — the regulated category claimed by the brewer.
  - ``country_of_origin`` (nullable CHAR(2), CHECK on length) — ISO
    3166-1 alpha-2 code. Required by EU regulation 1169/2011 Art. 26
    only when its omission would mislead the consumer (not systematic).
  - ``allergens`` (nullable JSONB on PostgreSQL, JSON elsewhere) — the
    list of allergens that must be highlighted on the label per EU
    regulation 1169/2011 (cereals containing gluten, sulfites > 10 mg/L,
    etc.). Stored as a normalised string array.
  - ``alcohol_group`` (nullable SMALLINT, CHECK in (1, 3, 4, 5)) — group
    classification under article L-3321-1 of the French Code de la santé
    publique. Beer falls in group 3.

All four ``beers`` columns are nullable so the migration is non-breaking
for existing rows imported from non-FR sources.

Revision ID: 003
Revises: 002
Create Date: 2026-05-01
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "003"
down_revision: str | None = "002"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


# Canonical legal denomination codes. Mirrors LEGAL_DENOMINATION_VALUES
# in db/models/legal_denomination.py — kept duplicated here (instead of
# imported) so historical migrations remain runnable even if the model
# evolves. Same convention as migration 002 for BEER_SOURCE_VALUES.
LEGAL_DENOMINATION_VALUES: tuple[str, ...] = (
    "biere",
    "biere_sans_alcool",
    "biere_forte",
    "pur_malt",
    "biere_de_garde",
    "biere_fermentation_lactique",
    "biere_a_ingredient",
    "biere_aromatisee",
    "panache",
    "biere_artisanale",
)

ALCOHOL_GROUP_VALUES: tuple[int, ...] = (1, 3, 4, 5)

LEGAL_DENOMINATION_CHECK_EXPR: str = "code IN ({})".format(
    ", ".join(f"'{v}'" for v in LEGAL_DENOMINATION_VALUES)
)

BEER_LEGAL_DENOMINATION_CHECK_EXPR: str = (
    "legal_denomination IS NULL OR legal_denomination IN ({})".format(
        ", ".join(f"'{v}'" for v in LEGAL_DENOMINATION_VALUES)
    )
)

BEER_ALCOHOL_GROUP_CHECK_EXPR: str = (
    "alcohol_group IS NULL OR alcohol_group IN ({})".format(
        ", ".join(str(v) for v in ALCOHOL_GROUP_VALUES)
    )
)


def upgrade() -> None:
    """Create ``legal_denominations`` and add four columns on ``beers``."""

    # --- legal_denominations -----------------------------------------------
    op.create_table(
        "legal_denominations",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("code", sa.String(length=50), nullable=False),
        sa.Column("label", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("legal_reference", sa.String(length=255), nullable=False),
        sa.Column("min_aging_days", sa.SmallInteger(), nullable=True),
        sa.Column("max_alcohol_pct", sa.Numeric(precision=4, scale=2), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code"),
        sa.CheckConstraint(
            LEGAL_DENOMINATION_CHECK_EXPR,
            name="ck_legal_denominations_code_valid",
        ),
        sa.CheckConstraint(
            "min_aging_days IS NULL OR min_aging_days >= 0",
            name="ck_legal_denominations_min_aging_positive",
        ),
        sa.CheckConstraint(
            "max_alcohol_pct IS NULL OR max_alcohol_pct >= 0",
            name="ck_legal_denominations_max_alcohol_positive",
        ),
    )

    # --- beers regulatory columns ------------------------------------------
    # ``batch_alter_table`` keeps the migration portable across PostgreSQL
    # (production) and SQLite (tests). SQLite cannot ``ALTER TABLE ADD
    # CONSTRAINT`` directly — batch mode rewrites the table transparently.
    with op.batch_alter_table("beers") as batch_op:
        batch_op.add_column(
            sa.Column("legal_denomination", sa.String(length=50), nullable=True),
        )
        batch_op.add_column(
            sa.Column("country_of_origin", sa.String(length=2), nullable=True),
        )
        batch_op.add_column(
            sa.Column(
                "allergens",
                sa.JSON().with_variant(
                    postgresql.JSONB(astext_type=sa.Text()), "postgresql"
                ),
                nullable=True,
            ),
        )
        batch_op.add_column(
            sa.Column("alcohol_group", sa.SmallInteger(), nullable=True),
        )

        batch_op.create_check_constraint(
            "ck_beers_legal_denomination_valid",
            BEER_LEGAL_DENOMINATION_CHECK_EXPR,
        )
        batch_op.create_check_constraint(
            "ck_beers_alcohol_group_valid",
            BEER_ALCOHOL_GROUP_CHECK_EXPR,
        )
        batch_op.create_check_constraint(
            "ck_beers_country_of_origin_iso2",
            "country_of_origin IS NULL OR length(country_of_origin) = 2",
        )


def downgrade() -> None:
    """Drop the four ``beers`` columns + the ``legal_denominations`` table."""

    with op.batch_alter_table("beers") as batch_op:
        batch_op.drop_constraint(
            "ck_beers_country_of_origin_iso2", type_="check"
        )
        batch_op.drop_constraint("ck_beers_alcohol_group_valid", type_="check")
        batch_op.drop_constraint(
            "ck_beers_legal_denomination_valid", type_="check"
        )
        batch_op.drop_column("alcohol_group")
        batch_op.drop_column("allergens")
        batch_op.drop_column("country_of_origin")
        batch_op.drop_column("legal_denomination")

    op.drop_table("legal_denominations")
