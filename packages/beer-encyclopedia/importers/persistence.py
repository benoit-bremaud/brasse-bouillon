"""Persist an :class:`ExternalBeerSnapshot` into the encyclopedia.

Sits between the importers (which know how to fetch + map a remote
schema) and the API router (which only orchestrates HTTP). Keeps the
upsert logic in one place so adding a new source — Untappd, RateBeer,
Open Brewery DB — does not duplicate the brewery / EntitySource / Beer
upsert dance.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.slug import build_unique_slug
from db.models import Beer, Brewery, EntitySource, Source, Style
from importers.base import ExternalBeerSnapshot


class SourceNotSeededError(RuntimeError):
    """Raised when an importer runs before its source row exists.

    The encyclopedia tracks every external import via
    ``EntitySource.source_id``; that FK requires the matching ``Source``
    row to be seeded first (``scripts/seed_sources.py``). Surfacing
    this as a typed error makes the mismatch obvious instead of letting
    a generic ``IntegrityError`` bubble up at flush time.
    """


@dataclass(slots=True)
class UpsertResult:
    """Outcome of :func:`upsert_beer_from_snapshot`.

    ``created`` reflects whether a new ``Beer`` row was inserted or an
    existing one was refreshed in place. The router uses it to choose
    between ``201 Created`` and ``200 OK`` so the HTTP semantics stay
    honest.
    """

    beer: Beer
    created: bool


async def upsert_beer_from_snapshot(
    session: AsyncSession,
    *,
    snapshot: ExternalBeerSnapshot,
    source_name: str,
) -> UpsertResult:
    """Persist ``snapshot`` and its audit trail in a single transaction.

    Idempotent on ``snapshot.external_id``: a second call refreshes the
    matched ``Beer`` row in place (no duplicates, no insert errors) and
    bumps ``EntitySource.last_synced_at`` so the audit trail records
    the new fetch.
    """

    source = await _fetch_source_or_raise(session, source_name=source_name)
    brewery = await _upsert_brewery(session, name=snapshot.brand)
    style = await _resolve_style(session, slug=snapshot.style_slug)

    existing_beer = (
        await session.execute(
            select(Beer).where(Beer.ean_code == snapshot.external_id)
        )
    ).scalar_one_or_none()

    if existing_beer is None:
        beer = await _create_beer(
            session,
            snapshot=snapshot,
            brewery=brewery,
            style=style,
            source_name=source_name,
        )
        created = True
    else:
        _refresh_beer_fields(
            existing_beer, snapshot=snapshot, brewery=brewery, style=style
        )
        beer = existing_beer
        created = False

    await _upsert_entity_source(
        session,
        source=source,
        beer=beer,
        snapshot=snapshot,
    )

    await session.commit()
    await session.refresh(beer)
    return UpsertResult(beer=beer, created=created)


async def _fetch_source_or_raise(
    session: AsyncSession, *, source_name: str
) -> Source:
    source = (
        await session.execute(select(Source).where(Source.name == source_name))
    ).scalar_one_or_none()
    if source is None:
        raise SourceNotSeededError(
            f"Source '{source_name}' is not seeded — run "
            "`python scripts/seed_sources.py` before importing."
        )
    return source


async def _upsert_brewery(
    session: AsyncSession, *, name: str | None
) -> Brewery | None:
    """Find or create the brewery referenced by the snapshot.

    Returns ``None`` when the snapshot carries no brand name — the
    encyclopedia tolerates beers without a brewery (the FK is nullable),
    typically for community drafts and bare OFF entries that omit
    ``brands``.
    """

    if name is None:
        return None

    cleaned = name.strip()
    if not cleaned:
        return None

    existing = (
        await session.execute(select(Brewery).where(Brewery.name == cleaned))
    ).scalar_one_or_none()
    if existing is not None:
        return existing

    slug = await build_unique_slug(session, column=Brewery.slug, name=cleaned)
    brewery = Brewery(name=cleaned, slug=slug)
    session.add(brewery)
    # Flush so the FK below has a valid id without forcing the caller
    # to commit the half-built transaction.
    await session.flush()
    return brewery


async def _resolve_style(
    session: AsyncSession, *, slug: str | None
) -> Style | None:
    """Look up a seeded ``Style`` by slug. Returns ``None`` when the
    snapshot carries no style hint or the slug is not in the catalogue —
    the importer only links to styles that already exist (it never
    creates them), so an unrecognised slug leaves the beer unclassified.
    """

    if slug is None:
        return None
    return (
        await session.execute(select(Style).where(Style.slug == slug))
    ).scalar_one_or_none()


async def _create_beer(
    session: AsyncSession,
    *,
    snapshot: ExternalBeerSnapshot,
    brewery: Brewery | None,
    style: Style | None,
    source_name: str,
) -> Beer:
    """Insert a new beer row carrying the snapshot's payload.

    ``source_name`` must be one of ``BEER_SOURCE_VALUES``
    (``openfoodfacts`` | ``internal`` | ``community``); the
    ``Beer.source`` ORM validator rejects anything else at assignment
    time so a misuse from a future importer surfaces immediately
    instead of corrupting provenance silently.
    """

    slug = await build_unique_slug(session, column=Beer.slug, name=snapshot.name)
    beer = Beer(
        name=snapshot.name,
        slug=slug,
        brewery_id=brewery.id if brewery is not None else None,
        style_id=style.id if style is not None else None,
        abv=snapshot.abv,
        description=snapshot.description,
        country_of_origin=snapshot.country_of_origin,
        allergens=list(snapshot.allergens) or None,
        ean_code=snapshot.external_id,
        source=source_name,
        contributed_at=datetime.now(UTC),
    )
    session.add(beer)
    await session.flush()
    return beer


def _refresh_beer_fields(
    beer: Beer,
    *,
    snapshot: ExternalBeerSnapshot,
    brewery: Brewery | None,
    style: Style | None,
) -> None:
    """Update mutable fields on an existing beer row.

    Three layered policies:

    - **Never overwrite hand-edited fields.** ``name``, ``slug`` and
      ``legal_denomination`` are preserved unconditionally — they may
      have been corrected by a moderator or refined by another source.

    - **Fill ``style_id`` / ``description`` only when empty.** These can
      now be derived from the source (style from OFF categories,
      description from the ingredients list), so this path fills them
      when the row has none yet, while a non-null value (a moderator's
      correction or an earlier source) is kept untouched. Note this only
      runs when a fetch actually reaches the upsert: the current
      ``POST /beers/import-by-ean`` route is DB-first and returns a known
      EAN from the cache **without** re-fetching, so existing rows are
      not backfilled by a plain duplicate import — that needs a real
      re-fetch (a future refresh flag, or delete + re-import).

    - **Never clear on refresh.** A re-import only writes a value when
      the snapshot carries one (``brewery is not None``,
      ``snapshot.abv is not None``, ``snapshot.allergens`` truthy,
      …). If OFF stops returning, say, an ``allergens_tags`` array on
      the next call, we keep the previous list rather than clearing it
      and losing data the user could see in the mobile app. The
      explicit cost: a field stays populated even after the source
      removes it. The chosen mitigation: a future moderation tool can
      flush a field on demand; the importer must not do it implicitly.
    """

    if brewery is not None:
        beer.brewery_id = brewery.id
    if style is not None and beer.style_id is None:
        beer.style_id = style.id
    if snapshot.description and not beer.description:
        beer.description = snapshot.description
    if snapshot.abv is not None:
        beer.abv = snapshot.abv
    if snapshot.country_of_origin is not None:
        beer.country_of_origin = snapshot.country_of_origin
    if snapshot.allergens:
        beer.allergens = list(snapshot.allergens)
    beer.contributed_at = datetime.now(UTC)


async def _upsert_entity_source(
    session: AsyncSession,
    *,
    source: Source,
    beer: Beer,
    snapshot: ExternalBeerSnapshot,
) -> None:
    """Insert or refresh the ``EntitySource`` audit row for this import.

    Matches on the ``(source_id, entity_type, external_id)`` triplet to
    stay aligned with the unique constraint defined on the table. A
    re-import refreshes ``raw_data`` (so the latest payload is always
    available for re-transform) and bumps ``last_synced_at``.
    """

    existing = (
        await session.execute(
            select(EntitySource).where(
                EntitySource.source_id == source.id,
                EntitySource.entity_type == "beer",
                EntitySource.external_id == snapshot.external_id,
            )
        )
    ).scalar_one_or_none()

    now = datetime.now(UTC)
    if existing is None:
        session.add(
            EntitySource(
                source_id=source.id,
                entity_type="beer",
                entity_id=beer.id,
                external_id=snapshot.external_id,
                last_synced_at=now,
                raw_data=snapshot.raw_payload,
            )
        )
    else:
        existing.entity_id = beer.id
        existing.last_synced_at = now
        existing.raw_data = snapshot.raw_payload
