"""Behavior tests for /beers CRUD + search + filters."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Beer, Brewery, Style


async def _seed_reference_data(
    db_session: AsyncSession,
) -> tuple[Brewery, Style, Style]:
    brewery = Brewery(name="Reference Brewery", slug="reference-brewery")
    ipa = Style(name="India Pale Ale", slug="ipa")
    stout = Style(name="Stout", slug="stout")
    db_session.add_all([brewery, ipa, stout])
    await db_session.commit()
    for obj in (brewery, ipa, stout):
        await db_session.refresh(obj)
    return brewery, ipa, stout


async def test_create_beer_returns_201(client: TestClient, db_session: AsyncSession) -> None:
    brewery, ipa, _ = await _seed_reference_data(db_session)

    response = client.post(
        "/beers",
        json={
            "name": "Citra Bomb",
            "brewery_id": str(brewery.id),
            "style_id": str(ipa.id),
            "abv": "6.5",
            "ibu_min": 50,
            "ibu_max": 55,
        },
    )

    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Citra Bomb"
    assert body["slug"] == "citra-bomb"
    assert body["brewery_id"] == str(brewery.id)
    assert body["ibu_min"] == 50
    assert body["ibu_max"] == 55


def test_create_beer_rejects_inverted_ibu_interval(client: TestClient) -> None:
    """Sad path: ibu_min > ibu_max is a 422 at the edge, not a DB 500."""

    response = client.post(
        "/beers",
        json={"name": "Inverted IBU", "ibu_min": 60, "ibu_max": 20},
    )

    assert response.status_code == 422


def test_create_beer_rejects_inverted_srm_interval(client: TestClient) -> None:
    """Sad path: srm_min > srm_max is a 422 at the edge, not a DB 500."""

    response = client.post(
        "/beers",
        json={"name": "Inverted SRM", "srm_min": 30, "srm_max": 5},
    )

    assert response.status_code == 422


def test_create_beer_rejects_unknown_brewery_fk(client: TestClient) -> None:
    response = client.post(
        "/beers",
        json={"name": "Orphan IPA", "brewery_id": str(uuid.uuid4())},
    )

    assert response.status_code == 422
    assert "brewery_id" in response.json()["detail"].lower()


def test_create_beer_rejects_unknown_style_fk(client: TestClient) -> None:
    response = client.post(
        "/beers",
        json={"name": "Orphan Stout", "style_id": str(uuid.uuid4())},
    )

    assert response.status_code == 422
    assert "style_id" in response.json()["detail"].lower()


def test_get_beer_returns_404_for_unknown(client: TestClient) -> None:
    response = client.get(f"/beers/{uuid.uuid4()}")
    assert response.status_code == 404


async def test_list_beers_filters_by_style(client: TestClient, db_session: AsyncSession) -> None:
    brewery, ipa, stout = await _seed_reference_data(db_session)
    db_session.add_all(
        [
            Beer(name="A IPA", slug="a-ipa", brewery_id=brewery.id, style_id=ipa.id),
            Beer(name="B IPA", slug="b-ipa", brewery_id=brewery.id, style_id=ipa.id),
            Beer(name="C Stout", slug="c-stout", brewery_id=brewery.id, style_id=stout.id),
        ]
    )
    await db_session.commit()

    response = client.get("/beers", params={"style_id": str(ipa.id)})

    data = response.json()
    assert data["meta"]["total"] == 2
    assert {item["name"] for item in data["items"]} == {"A IPA", "B IPA"}


async def test_list_beers_filters_by_abv_range(
    client: TestClient, db_session: AsyncSession
) -> None:
    brewery, _, _ = await _seed_reference_data(db_session)
    db_session.add_all(
        [
            Beer(name="Low", slug="low", brewery_id=brewery.id, abv=3.5),
            Beer(name="Mid", slug="mid", brewery_id=brewery.id, abv=5.5),
            Beer(name="Strong", slug="strong", brewery_id=brewery.id, abv=9.0),
        ]
    )
    await db_session.commit()

    response = client.get("/beers", params={"abv_min": 4, "abv_max": 7})

    data = response.json()
    assert data["meta"]["total"] == 1
    assert data["items"][0]["name"] == "Mid"


async def test_patch_beer_updates_fields_and_validates_fk(
    client: TestClient, db_session: AsyncSession
) -> None:
    brewery, ipa, stout = await _seed_reference_data(db_session)
    created = client.post(
        "/beers",
        json={"name": "Shape-shifter", "brewery_id": str(brewery.id), "style_id": str(ipa.id)},
    ).json()

    # Valid FK change
    update = client.patch(
        f"/beers/{created['id']}",
        json={"style_id": str(stout.id), "abv": "8.0"},
    )
    assert update.status_code == 200
    assert update.json()["style_id"] == str(stout.id)

    # Invalid FK rejected
    bad_update = client.patch(
        f"/beers/{created['id']}",
        json={"style_id": str(uuid.uuid4())},
    )
    assert bad_update.status_code == 422


async def test_delete_beer_returns_204_then_404(
    client: TestClient, db_session: AsyncSession
) -> None:
    brewery, _, _ = await _seed_reference_data(db_session)
    created = client.post(
        "/beers",
        json={"name": "Doomed IPA", "brewery_id": str(brewery.id)},
    ).json()

    assert client.delete(f"/beers/{created['id']}").status_code == 204
    assert client.get(f"/beers/{created['id']}").status_code == 404


async def test_search_beers_matches_substring(client: TestClient, db_session: AsyncSession) -> None:
    brewery, _, _ = await _seed_reference_data(db_session)
    db_session.add_all(
        [
            Beer(name="Citra Bomb", slug="citra-bomb", brewery_id=brewery.id),
            Beer(name="Citra Sun", slug="citra-sun", brewery_id=brewery.id),
            Beer(name="Amber Amber", slug="amber-amber", brewery_id=brewery.id),
        ]
    )
    await db_session.commit()

    response = client.get("/beers/search", params={"q": "citra"})

    data = response.json()
    assert data["meta"]["total"] == 2
    assert {item["name"] for item in data["items"]} == {"Citra Bomb", "Citra Sun"}


async def test_list_resolves_brewery_and_style_names(
    client: TestClient, db_session: AsyncSession
) -> None:
    """Happy: list rows carry the denormalised brewery/style names (#1220)."""

    brewery, ipa, _ = await _seed_reference_data(db_session)
    db_session.add(
        Beer(
            name="Named IPA",
            slug="named-ipa",
            brewery_id=brewery.id,
            style_id=ipa.id,
        )
    )
    await db_session.commit()

    item = client.get("/beers").json()["items"][0]

    assert item["brewery_name"] == "Reference Brewery"
    assert item["style_name"] == "India Pale Ale"


async def test_list_leaves_names_null_when_fks_are_null(
    client: TestClient, db_session: AsyncSession
) -> None:
    """Edge: a beer with no brewery/style keeps both names null."""

    db_session.add(Beer(name="Orphan", slug="orphan"))
    await db_session.commit()

    item = client.get("/beers").json()["items"][0]

    assert item["brewery_name"] is None
    assert item["style_name"] is None


async def test_search_resolves_brewery_and_style_names(
    client: TestClient, db_session: AsyncSession
) -> None:
    """Happy: search rows also carry the resolved names (#1220)."""

    brewery, ipa, _ = await _seed_reference_data(db_session)
    db_session.add(
        Beer(
            name="Searchable IPA",
            slug="searchable-ipa",
            brewery_id=brewery.id,
            style_id=ipa.id,
        )
    )
    await db_session.commit()

    item = client.get("/beers/search", params={"q": "searchable"}).json()["items"][0]

    assert item["brewery_name"] == "Reference Brewery"
    assert item["style_name"] == "India Pale Ale"


async def test_get_beer_resolves_brewery_and_style_names(
    client: TestClient, db_session: AsyncSession
) -> None:
    """Happy: the detail endpoint resolves the names too (#1220)."""

    brewery, ipa, _ = await _seed_reference_data(db_session)
    beer = Beer(
        name="Detail IPA",
        slug="detail-ipa",
        brewery_id=brewery.id,
        style_id=ipa.id,
    )
    db_session.add(beer)
    await db_session.commit()
    await db_session.refresh(beer)

    body = client.get(f"/beers/{beer.id}").json()

    assert body["brewery_name"] == "Reference Brewery"
    assert body["style_name"] == "India Pale Ale"
