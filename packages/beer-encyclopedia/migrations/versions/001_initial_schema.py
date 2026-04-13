"""Initial beer encyclopedia schema.

Creates the 10 core tables (styles, breweries, beers, ingredients,
beer_ingredients, tasting_profiles, media, sources, entity_sources,
community_corrections), the ``pg_trgm`` extension and its associated GIN
trigram indexes for fuzzy name search, plus the B-tree indexes used by the
common filter/lookup paths.

Revision ID: 001
Revises:
Create Date: 2026-04-12
"""

from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "001"
down_revision: str | None = None
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def _is_postgres() -> bool:
    """Return True when the current connection targets PostgreSQL.

    Guards PG-only DDL (extensions, GIN trigram indexes) so the same
    migration runs unchanged against SQLite in unit tests.
    """

    return op.get_bind().dialect.name == "postgresql"


def upgrade() -> None:
    # --- PostgreSQL extension (pg_trgm powers fuzzy name search) -----------
    if _is_postgres():
        op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    # --- styles ------------------------------------------------------------
    op.create_table(
        "styles",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("slug", sa.String(length=50), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("abv_min", sa.Numeric(precision=4, scale=2), nullable=True),
        sa.Column("abv_max", sa.Numeric(precision=4, scale=2), nullable=True),
        sa.Column("ibu_min", sa.SmallInteger(), nullable=True),
        sa.Column("ibu_max", sa.SmallInteger(), nullable=True),
        sa.Column("srm_min", sa.SmallInteger(), nullable=True),
        sa.Column("srm_max", sa.SmallInteger(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
        sa.CheckConstraint("abv_min IS NULL OR abv_min >= 0", name="ck_styles_abv_min_positive"),
        sa.CheckConstraint("abv_max IS NULL OR abv_max >= 0", name="ck_styles_abv_max_positive"),
        sa.CheckConstraint(
            "abv_min IS NULL OR abv_max IS NULL OR abv_min <= abv_max",
            name="ck_styles_abv_range",
        ),
    )

    # --- breweries ---------------------------------------------------------
    op.create_table(
        "breweries",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("brewery_type", sa.String(length=50), nullable=True),
        sa.Column("address_1", sa.String(length=255), nullable=True),
        sa.Column("address_2", sa.String(length=255), nullable=True),
        sa.Column("address_3", sa.String(length=255), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("state_province", sa.String(length=100), nullable=True),
        sa.Column("postal_code", sa.String(length=20), nullable=True),
        sa.Column("country", sa.String(length=100), nullable=True),
        sa.Column("longitude", sa.Numeric(precision=11, scale=8), nullable=True),
        sa.Column("latitude", sa.Numeric(precision=10, scale=8), nullable=True),
        sa.Column("phone", sa.String(length=30), nullable=True),
        sa.Column("website_url", sa.String(length=512), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("founded_year", sa.SmallInteger(), nullable=True),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
    )
    op.create_index("ix_breweries_city", "breweries", ["city"])
    op.create_index("ix_breweries_country", "breweries", ["country"])
    op.create_index("ix_breweries_brewery_type", "breweries", ["brewery_type"])
    if _is_postgres():
        op.execute(
            "CREATE INDEX ix_breweries_name_trgm ON breweries "
            "USING gin (name gin_trgm_ops)"
        )

    # --- beers -------------------------------------------------------------
    op.create_table(
        "beers",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False),
        sa.Column("brewery_id", sa.Uuid(), nullable=True),
        sa.Column("style_id", sa.Uuid(), nullable=True),
        sa.Column("abv", sa.Numeric(precision=4, scale=2), nullable=True),
        sa.Column("ibu", sa.SmallInteger(), nullable=True),
        sa.Column("srm", sa.SmallInteger(), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_verified", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        sa.ForeignKeyConstraint(["brewery_id"], ["breweries.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["style_id"], ["styles.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_beers_brewery_id", "beers", ["brewery_id"])
    op.create_index("ix_beers_style_id", "beers", ["style_id"])
    op.create_index("ix_beers_abv", "beers", ["abv"])
    if _is_postgres():
        op.execute(
            "CREATE INDEX ix_beers_name_trgm ON beers USING gin (name gin_trgm_ops)"
        )

    # --- ingredients + beer_ingredients -----------------------------------
    op.create_table(
        "ingredients",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=150), nullable=False),
        sa.Column("category", sa.String(length=50), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_ingredients_category", "ingredients", ["category"])

    op.create_table(
        "beer_ingredients",
        sa.Column("beer_id", sa.Uuid(), nullable=False),
        sa.Column("ingredient_id", sa.Uuid(), nullable=False),
        sa.Column("amount", sa.String(length=50), nullable=True),
        sa.Column("usage_phase", sa.String(length=30), nullable=True),
        sa.PrimaryKeyConstraint("beer_id", "ingredient_id"),
        sa.ForeignKeyConstraint(["beer_id"], ["beers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["ingredient_id"], ["ingredients.id"], ondelete="CASCADE"),
    )

    # --- tasting_profiles --------------------------------------------------
    op.create_table(
        "tasting_profiles",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("beer_id", sa.Uuid(), nullable=False),
        sa.Column("aroma", sa.Text(), nullable=True),
        sa.Column("appearance", sa.Text(), nullable=True),
        sa.Column("flavor", sa.Text(), nullable=True),
        sa.Column("mouthfeel", sa.Text(), nullable=True),
        sa.Column("overall", sa.Text(), nullable=True),
        sa.Column("bitterness", sa.SmallInteger(), nullable=True),
        sa.Column("sweetness", sa.SmallInteger(), nullable=True),
        sa.Column("body", sa.SmallInteger(), nullable=True),
        sa.Column("carbonation", sa.SmallInteger(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("beer_id"),
        sa.ForeignKeyConstraint(["beer_id"], ["beers.id"], ondelete="CASCADE"),
        sa.CheckConstraint(
            "bitterness IS NULL OR bitterness BETWEEN 1 AND 5",
            name="ck_tasting_bitterness_range",
        ),
        sa.CheckConstraint(
            "sweetness IS NULL OR sweetness BETWEEN 1 AND 5",
            name="ck_tasting_sweetness_range",
        ),
        sa.CheckConstraint(
            "body IS NULL OR body BETWEEN 1 AND 5",
            name="ck_tasting_body_range",
        ),
        sa.CheckConstraint(
            "carbonation IS NULL OR carbonation BETWEEN 1 AND 5",
            name="ck_tasting_carbonation_range",
        ),
    )

    # --- media -------------------------------------------------------------
    op.create_table(
        "media",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("beer_id", sa.Uuid(), nullable=True),
        sa.Column("brewery_id", sa.Uuid(), nullable=True),
        sa.Column("media_type", sa.String(length=30), nullable=False),
        sa.Column("url", sa.String(length=1024), nullable=False),
        sa.Column("alt_text", sa.String(length=255), nullable=True),
        sa.Column("is_primary", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("uploaded_by", sa.String(length=100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["beer_id"], ["beers.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["brewery_id"], ["breweries.id"], ondelete="CASCADE"),
        # XOR — each media row belongs to exactly one parent (beer or brewery,
        # never both, never neither). Enforcing it in SQL keeps the polymorphic
        # invariant safe even when rows are created outside the ORM.
        sa.CheckConstraint(
            "(beer_id IS NOT NULL AND brewery_id IS NULL) OR "
            "(beer_id IS NULL AND brewery_id IS NOT NULL)",
            name="ck_media_parent_required",
        ),
    )
    op.create_index("ix_media_beer_id", "media", ["beer_id"])
    op.create_index("ix_media_brewery_id", "media", ["brewery_id"])

    # --- sources + entity_sources (provenance) ----------------------------
    op.create_table(
        "sources",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("source_type", sa.String(length=30), nullable=False),
        sa.Column("base_url", sa.String(length=512), nullable=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "entity_sources",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("source_id", sa.Uuid(), nullable=False),
        sa.Column("entity_type", sa.String(length=30), nullable=False),
        sa.Column("entity_id", sa.Uuid(), nullable=False),
        sa.Column("external_id", sa.String(length=255), nullable=True),
        sa.Column("last_synced_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column(
            "raw_data",
            sa.JSON().with_variant(postgresql.JSONB(astext_type=sa.Text()), "postgresql"),
            nullable=True,
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"], ondelete="CASCADE"),
        sa.UniqueConstraint(
            "source_id", "entity_type", "external_id",
            name="uq_entity_sources_triplet",
        ),
    )
    op.create_index(
        "ix_entity_sources_lookup",
        "entity_sources",
        ["entity_type", "entity_id"],
    )

    # --- community_corrections --------------------------------------------
    op.create_table(
        "community_corrections",
        sa.Column("id", sa.Uuid(), nullable=False),
        sa.Column("entity_type", sa.String(length=30), nullable=False),
        sa.Column("entity_id", sa.Uuid(), nullable=False),
        sa.Column("field_name", sa.String(length=100), nullable=False),
        sa.Column("old_value", sa.Text(), nullable=True),
        sa.Column("new_value", sa.Text(), nullable=False),
        sa.Column("reason", sa.Text(), nullable=True),
        sa.Column(
            "status",
            sa.String(length=20),
            nullable=False,
            server_default=sa.text("'pending'"),
        ),
        sa.Column("submitted_by", sa.String(length=100), nullable=True),
        sa.Column("reviewed_by", sa.String(length=100), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        "ix_corrections_moderation_queue",
        "community_corrections",
        ["status", "created_at"],
    )


def downgrade() -> None:
    # Drop in reverse dependency order. Indexes are dropped automatically
    # with their tables on every supported backend.
    op.drop_table("community_corrections")
    op.drop_table("entity_sources")
    op.drop_table("sources")
    op.drop_table("media")
    op.drop_table("tasting_profiles")
    op.drop_table("beer_ingredients")
    op.drop_table("ingredients")
    op.drop_table("beers")
    op.drop_table("breweries")
    op.drop_table("styles")

    if _is_postgres():
        # Keep the extension — other schemas on the same database may rely on
        # pg_trgm. Dropping it here would be destructive beyond our scope.
        pass
