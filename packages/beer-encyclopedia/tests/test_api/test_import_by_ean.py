"""HTTP contract tests for ``POST /beers/import-by-ean``.

Exercises the full route → persistence → audit-trail flow against an
in-memory SQLite DB and a stubbed Open Food Facts client. The stub is
injected via ``app.dependency_overrides`` so no real HTTP call ever
leaves the process and tests stay deterministic.

Coverage layout:
- Happy path : known EAN → 201 Created with mapped fields, audit row inserted
- Sad paths  : invalid EAN format, OFF unknown, OFF transport failure,
              missing source seed
- Edge cases : idempotence on re-import (200 OK, last_synced_at refreshed),
              brewery created on first import then reused
"""

from __future__ import annotations

from collections.abc import AsyncIterator, Callable, Iterator
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from api.main import app
from api.routers.beers import get_openfoodfacts_client
from db.models import Beer, Brewery, EntitySource, Source
from importers.base import ExternalBeerSnapshot
from importers.openfoodfacts import OpenFoodFactsError
from scripts.seed_sources import seed_sources

# Real EAN-13 from the OFF doc — used as a stable fixture identifier.
EAN_PELFORTH: str = "3760231860119"

# A behaviour function maps an EAN to the value the stub client should
# return: a snapshot (success), ``None`` (unknown product), or an
# Exception instance to raise (transport failure). Typing this once
# keeps the fixture and the stub class honest without ``# type: ignore``.
SnapshotBehaviour = Callable[
    [str], "ExternalBeerSnapshot | None | OpenFoodFactsError"
]


def _build_pelforth_snapshot(ean: str = EAN_PELFORTH) -> ExternalBeerSnapshot:
    return ExternalBeerSnapshot(
        external_id=ean,
        name="Pelforth Brune",
        brand="Pelforth",
        abv=Decimal("6.5"),
        country_of_origin="FR",
        allergens=["gluten"],
        image_url="https://example.org/pelforth.jpg",
        raw_payload={"product_name": "Pelforth Brune", "code": ean},
    )


class _StubOpenFoodFactsClient:
    """Programmable stub injected as the FastAPI dependency.

    Stores the calls it received so tests can assert on them and
    returns either a snapshot, ``None`` (unknown product), or raises
    :class:`OpenFoodFactsError` (transport failure).
    """

    def __init__(self, behaviour: SnapshotBehaviour) -> None:
        self._behaviour = behaviour
        self.calls: list[str] = []

    async def fetch_by_ean(self, ean: str) -> ExternalBeerSnapshot | None:
        self.calls.append(ean)
        result = self._behaviour(ean)
        if isinstance(result, Exception):
            raise result
        return result


StubFactory = Callable[[SnapshotBehaviour], _StubOpenFoodFactsClient]


@pytest.fixture
def stub_off_factory(client: TestClient) -> Iterator[StubFactory]:
    """Yield a factory that injects a stub OFF client into the app.

    Cleans up the dependency override on teardown so other tests in
    the same suite are unaffected.
    """

    def _install(behaviour: SnapshotBehaviour) -> _StubOpenFoodFactsClient:
        stub = _StubOpenFoodFactsClient(behaviour)

        async def _override() -> AsyncIterator[_StubOpenFoodFactsClient]:
            yield stub

        app.dependency_overrides[get_openfoodfacts_client] = _override
        return stub

    try:
        yield _install
    finally:
        app.dependency_overrides.pop(get_openfoodfacts_client, None)


@pytest.fixture
async def seeded_source(db_session: AsyncSession) -> Source:
    """Ensure the ``openfoodfacts`` Source row exists before tests run."""

    await seed_sources(db_session)
    return (
        await db_session.execute(
            select(Source).where(Source.name == "openfoodfacts")
        )
    ).scalar_one()


# --- Happy path ----------------------------------------------------------


async def test_first_import_creates_beer_and_returns_201(
    client: TestClient,
    db_session: AsyncSession,
    stub_off_factory,  # type: ignore[no-untyped-def]
    seeded_source: Source,
) -> None:
    snapshot = _build_pelforth_snapshot()
    stub = stub_off_factory(lambda _: snapshot)

    response = client.post(
        "/beers/import-by-ean", json={"ean": EAN_PELFORTH}
    )

    assert response.status_code == 201
    body = response.json()
    assert body["ean_code"] == EAN_PELFORTH
    assert body["country_of_origin"] == "FR"
    assert body["allergens"] == ["gluten"]
    assert body["abv"] == "6.50"
    assert body["source"] == "openfoodfacts"
    assert stub.calls == [EAN_PELFORTH]

    beer = (
        await db_session.execute(
            select(Beer).where(Beer.ean_code == EAN_PELFORTH)
        )
    ).scalar_one()
    assert beer.name == "Pelforth Brune"

    audit = (
        await db_session.execute(
            select(EntitySource).where(
                EntitySource.external_id == EAN_PELFORTH
            )
        )
    ).scalar_one()
    assert audit.entity_type == "beer"
    assert audit.entity_id == beer.id
    assert audit.raw_data == snapshot.raw_payload
    assert audit.last_synced_at is not None


async def test_import_creates_brewery_with_unique_slug(
    client: TestClient,
    db_session: AsyncSession,
    stub_off_factory,  # type: ignore[no-untyped-def]
    seeded_source: Source,
) -> None:
    stub_off_factory(lambda _: _build_pelforth_snapshot())

    client.post("/beers/import-by-ean", json={"ean": EAN_PELFORTH})

    brewery = (
        await db_session.execute(select(Brewery).where(Brewery.name == "Pelforth"))
    ).scalar_one()
    assert brewery.slug == "pelforth"


# --- Sad path ------------------------------------------------------------


async def test_invalid_ean_format_is_rejected_by_pydantic(
    client: TestClient,
    seeded_source: Source,
) -> None:
    # 7-digit string is too short for any standard barcode.
    response = client.post(
        "/beers/import-by-ean", json={"ean": "1234567"}
    )
    assert response.status_code == 422


async def test_non_digit_ean_is_rejected_by_pydantic(
    client: TestClient,
    seeded_source: Source,
) -> None:
    response = client.post(
        "/beers/import-by-ean", json={"ean": "12345abc"}
    )
    assert response.status_code == 422


async def test_unknown_product_returns_404(
    client: TestClient,
    stub_off_factory,  # type: ignore[no-untyped-def]
    seeded_source: Source,
) -> None:
    stub_off_factory(lambda _: None)

    response = client.post(
        "/beers/import-by-ean", json={"ean": "0000000000017"}
    )
    assert response.status_code == 404
    assert "0000000000017" in response.json()["detail"]


async def test_off_transport_failure_returns_503(
    client: TestClient,
    stub_off_factory,  # type: ignore[no-untyped-def]
    seeded_source: Source,
) -> None:
    stub_off_factory(lambda _: OpenFoodFactsError("HTTP 502"))

    response = client.post(
        "/beers/import-by-ean", json={"ean": EAN_PELFORTH}
    )
    assert response.status_code == 503
    assert "Open Food Facts unavailable" in response.json()["detail"]


async def test_missing_source_seed_returns_503_with_actionable_message(
    client: TestClient,
    stub_off_factory,  # type: ignore[no-untyped-def]
) -> None:
    # Note: deliberately do NOT include `seeded_source` here, so the
    # `openfoodfacts` row is absent.
    stub_off_factory(lambda _: _build_pelforth_snapshot())

    response = client.post(
        "/beers/import-by-ean", json={"ean": EAN_PELFORTH}
    )
    assert response.status_code == 503
    assert "seed_sources.py" in response.json()["detail"]


# --- Edge cases ----------------------------------------------------------


async def test_second_import_is_idempotent_and_returns_200(
    client: TestClient,
    db_session: AsyncSession,
    stub_off_factory,  # type: ignore[no-untyped-def]
    seeded_source: Source,
) -> None:
    stub_off_factory(lambda _: _build_pelforth_snapshot())

    first = client.post("/beers/import-by-ean", json={"ean": EAN_PELFORTH})
    assert first.status_code == 201
    first_id = first.json()["id"]

    second = client.post("/beers/import-by-ean", json={"ean": EAN_PELFORTH})
    assert second.status_code == 200
    assert second.json()["id"] == first_id

    # Still exactly one beer + one audit row, last_synced_at refreshed.
    beers = (
        await db_session.execute(
            select(Beer).where(Beer.ean_code == EAN_PELFORTH)
        )
    ).scalars().all()
    assert len(beers) == 1

    audits = (
        await db_session.execute(
            select(EntitySource).where(
                EntitySource.external_id == EAN_PELFORTH
            )
        )
    ).scalars().all()
    assert len(audits) == 1


async def test_import_with_snapshot_missing_brand_skips_brewery(
    client: TestClient,
    db_session: AsyncSession,
    stub_off_factory,  # type: ignore[no-untyped-def]
    seeded_source: Source,
) -> None:
    snapshot = ExternalBeerSnapshot(
        external_id=EAN_PELFORTH,
        name="Bare beer",
        brand=None,
        raw_payload={"product_name": "Bare beer"},
    )
    stub_off_factory(lambda _: snapshot)

    response = client.post(
        "/beers/import-by-ean", json={"ean": EAN_PELFORTH}
    )
    assert response.status_code == 201
    assert response.json()["brewery_id"] is None

    # No brewery row should have been created.
    breweries = (
        await db_session.execute(select(Brewery))
    ).scalars().all()
    assert breweries == []
