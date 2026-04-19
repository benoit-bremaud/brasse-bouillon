# Changelog

All notable API-visible changes to this project are documented in this file.
This file tracks released versions. For day-to-day operational history —
decisions, refactors, backlog work — see [PROJECT_LOG.md](../PROJECT_LOG.md).

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Versions are tracked per package. The table below is the current state:

| Package | Version (from package metadata) |
|---------|---------------------------------|
| `@brasse-bouillon/beer-encyclopedia` | 0.2.0 |
| `@brasse-bouillon/api` | (unreleased — tracked via git tags) |
| `@brasse-bouillon/mobile-app` | 1.0.0 |
| `@brasse-bouillon/website` | (static site, no version) |

> Note: the beer-encyclopedia FastAPI `app.version` was set to `0.4.0` in #552
> ahead of a package bump. Until the `package.json` / `pyproject.toml` are
> bumped to match, the authoritative package version stays **0.2.0**. The
> release entry below is indexed by the content shipped, not by the
> `app.version` string.

---

## [Unreleased]

## beer-encyclopedia — 2026-04-15 — CRUD + search (under 0.2.0)

### Added

- CRUD endpoints for `/breweries` and `/beers` (list + filters, search, get, create, update, delete) (#552)
- Read-only endpoints for `/styles` (list, detail) (#552)
- Fuzzy search on brewery/beer names using `pg_trgm` `%` operator + GIN trigram index on PostgreSQL, with case-insensitive substring fallback on SQLite (#552)
- FK validation at POST/PATCH on `/beers` (`brewery_id`, `style_id`) for clean 422 errors instead of DB-level 500s (#552)
- Shared `api/slug.create_with_unique_slug()` helper wrapping build-then-insert in an `IntegrityError` retry loop, closing the slug race under concurrent creates (#552)
- Shared `api/db_utils.is_postgres()` helper for dialect branching across routers (#552)
- 25 behavior tests covering CRUD + filters + search + pagination edges, using SQLite in-memory + `get_db` dependency override (#552)
- Root `Makefile` targets: `setup`, `dev-api`, `dev-mobile`, `dev`, `test-all`, `lint-all`, with macOS-compatible LAN IP detection (#552)

### Changed

- FastAPI app restructured into per-domain routers (`scan`, `styles`, `breweries`, `beers`) with a graceful-shutdown lifespan; lazy engine init preserved for fast cold starts and test injection (#545, #551)
- Dependency management moved to `pyproject.toml` as the single source of truth (`[ml]` and `[dev]` optional groups); `ml/requirements.txt` removed (#543)

## beer-encyclopedia — 2026-04-12 — initial models + infra (under 0.2.0)

### Added

- Initial data model: 10 ORM models (`Style`, `Brewery`, `Beer`, `Ingredient`, `BeerIngredient`, `TastingProfile`, `Media`, `Source`, `EntitySource`, `CommunityCorrection`) with FK cascades, CHECK constraints, and B-tree indexes (#544)
- Hand-written Alembic initial migration (`001_initial_schema.py`) enabling `pg_trgm` extension and GIN trigram indexes on `breweries.name` / `beers.name` when on PostgreSQL (#544)
- Style seeder (`scripts/seed_styles.py`): idempotent upsert of 15 styles (#544)
- PostgreSQL + async SQLAlchemy 2.0 + Alembic + Docker Compose infrastructure (#543)
- `UUIDMixin` and `TimestampMixin` on ORM `Base` (#543)

### Changed

- Package renamed from `beer-label-ai` → `beer-encyclopedia` (#548, closes #542) with git history preserved via `git mv`

---

[Unreleased]: https://github.com/benoit-bremaud/brasse-bouillon/commits/main
