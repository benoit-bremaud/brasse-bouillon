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
    # The write path resolves the denormalised names too (#1220).
    assert body["brewery_name"] == "Reference Brewery"
    assert body["style_name"] == "India Pale Ale"


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
            Beer(
                name="A IPA", slug="a-ipa", brewery_id=brewery.id, style_id=ipa.id, is_verified=True
            ),
            Beer(
                name="B IPA", slug="b-ipa", brewery_id=brewery.id, style_id=ipa.id, is_verified=True
            ),
            Beer(
                name="C Stout",
                slug="c-stout",
                brewery_id=brewery.id,
                style_id=stout.id,
                is_verified=True,
            ),
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
            Beer(name="Low", slug="low", brewery_id=brewery.id, abv=3.5, is_verified=True),
            Beer(name="Mid", slug="mid", brewery_id=brewery.id, abv=5.5, is_verified=True),
            Beer(name="Strong", slug="strong", brewery_id=brewery.id, abv=9.0, is_verified=True),
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
    assert update.json()["style_name"] == "Stout"

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
            Beer(name="Citra Bomb", slug="citra-bomb", brewery_id=brewery.id, is_verified=True),
            Beer(name="Citra Sun", slug="citra-sun", brewery_id=brewery.id, is_verified=True),
            Beer(name="Amber Amber", slug="amber-amber", brewery_id=brewery.id, is_verified=True),
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
            is_verified=True,
        )
    )
    await db_session.commit()

    data = client.get("/beers").json()
    assert data["meta"]["total"] == 1
    item = data["items"][0]

    assert item["brewery_name"] == "Reference Brewery"
    assert item["style_name"] == "India Pale Ale"


async def test_list_leaves_names_null_when_fks_are_null(
    client: TestClient, db_session: AsyncSession
) -> None:
    """Edge: a beer with no brewery/style keeps both names null."""

    db_session.add(Beer(name="Orphan", slug="orphan", is_verified=True))
    await db_session.commit()

    data = client.get("/beers").json()
    assert data["meta"]["total"] == 1
    item = data["items"][0]

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
            is_verified=True,
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


async def test_brewery_name_becomes_null_after_brewery_deleted(
    client: TestClient, db_session: AsyncSession
) -> None:
    """Edge: deleting a brewery (ON DELETE SET NULL) nulls the resolved name."""

    brewery, _, _ = await _seed_reference_data(db_session)
    db_session.add(Beer(name="Widow", slug="widow", brewery_id=brewery.id, is_verified=True))
    await db_session.commit()

    assert client.delete(f"/breweries/{brewery.id}").status_code == 204

    data = client.get("/beers").json()
    assert data["meta"]["total"] == 1
    assert data["items"][0]["brewery_name"] is None


async def test_list_excludes_unverified_beers(client: TestClient, db_session: AsyncSession) -> None:
    """Sad/edge: staged (is_verified=False) imports stay out of the public
    catalogue (ADR-0015 D1) — only the published row is browsable."""

    brewery, _, _ = await _seed_reference_data(db_session)
    db_session.add_all(
        [
            Beer(name="Published", slug="published", brewery_id=brewery.id, is_verified=True),
            Beer(name="Staged", slug="staged", brewery_id=brewery.id, is_verified=False),
        ]
    )
    await db_session.commit()

    data = client.get("/beers").json()
    assert data["meta"]["total"] == 1
    assert {item["name"] for item in data["items"]} == {"Published"}


async def test_search_excludes_unverified_beers(
    client: TestClient, db_session: AsyncSession
) -> None:
    """Sad: search also hides staged rows."""

    brewery, _, _ = await _seed_reference_data(db_session)
    db_session.add_all(
        [
            Beer(
                name="Verified Saison",
                slug="verified-saison",
                brewery_id=brewery.id,
                is_verified=True,
            ),
            Beer(
                name="Staged Saison",
                slug="staged-saison",
                brewery_id=brewery.id,
                is_verified=False,
            ),
        ]
    )
    await db_session.commit()

    data = client.get("/beers/search", params={"q": "saison"}).json()
    assert data["meta"]["total"] == 1
    assert data["items"][0]["name"] == "Verified Saison"


async def test_list_excludes_depublished_beers(
    client: TestClient, db_session: AsyncSession
) -> None:
    """Edge: a depublished entry (is_active=False) is hidden even when verified —
    the read contract is verified AND not depublished (ADR-0018)."""

    brewery, _, _ = await _seed_reference_data(db_session)
    db_session.add_all(
        [
            Beer(
                name="Active",
                slug="active",
                brewery_id=brewery.id,
                is_verified=True,
                is_active=True,
            ),
            Beer(
                name="Depublished",
                slug="depublished",
                brewery_id=brewery.id,
                is_verified=True,
                is_active=False,
            ),
        ]
    )
    await db_session.commit()

    data = client.get("/beers").json()
    assert data["meta"]["total"] == 1
    assert {item["name"] for item in data["items"]} == {"Active"}


async def test_get_beer_returns_unverified_staged_detail(
    client: TestClient, db_session: AsyncSession
) -> None:
    """Edge: a staged beer is hidden from browse/search but its fiche stays
    reachable by id — the just-scanned bottle the contributor needs to see
    (ADR-0015 D1)."""

    beer = Beer(name="Just Scanned", slug="just-scanned", is_verified=False)
    db_session.add(beer)
    await db_session.commit()
    await db_session.refresh(beer)

    response = client.get(f"/beers/{beer.id}")
    assert response.status_code == 200
    assert response.json()["name"] == "Just Scanned"
    assert response.json()["is_verified"] is False


async def test_search_excludes_depublished_beers(
    client: TestClient, db_session: AsyncSession
) -> None:
    """Edge: search hides a depublished (is_active=False) row too — same
    published gate as list (verified AND not depublished)."""

    brewery, _, _ = await _seed_reference_data(db_session)
    db_session.add_all(
        [
            Beer(
                name="Active Porter",
                slug="active-porter",
                brewery_id=brewery.id,
                is_verified=True,
                is_active=True,
            ),
            Beer(
                name="Depublished Porter",
                slug="depublished-porter",
                brewery_id=brewery.id,
                is_verified=True,
                is_active=False,
            ),
        ]
    )
    await db_session.commit()

    data = client.get("/beers/search", params={"q": "porter"}).json()
    assert data["meta"]["total"] == 1
    assert data["items"][0]["name"] == "Active Porter"


async def test_list_filter_intersects_with_published_gate(
    client: TestClient, db_session: AsyncSession
) -> None:
    """Edge: stacking a column filter (style_id) on the published gate applies
    BOTH to the count and the items — a staged IPA is excluded from a
    style-filtered browse (proves count vs items stay consistent)."""

    brewery, ipa, _ = await _seed_reference_data(db_session)
    db_session.add_all(
        [
            Beer(
                name="Published IPA",
                slug="published-ipa",
                brewery_id=brewery.id,
                style_id=ipa.id,
                is_verified=True,
            ),
            Beer(
                name="Staged IPA",
                slug="staged-ipa",
                brewery_id=brewery.id,
                style_id=ipa.id,
                is_verified=False,
            ),
        ]
    )
    await db_session.commit()

    data = client.get("/beers", params={"style_id": str(ipa.id)}).json()
    assert data["meta"]["total"] == 1
    assert {item["name"] for item in data["items"]} == {"Published IPA"}
