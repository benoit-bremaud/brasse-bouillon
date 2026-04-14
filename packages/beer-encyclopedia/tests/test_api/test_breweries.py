"""Behavior tests for /breweries CRUD + search."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Brewery


def test_create_brewery_returns_201(client: TestClient) -> None:
    response = client.post(
        "/breweries",
        json={"name": "Mountain Peak Brewery", "country": "France", "city": "Lyon"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Mountain Peak Brewery"
    assert data["slug"] == "mountain-peak-brewery"
    assert data["country"] == "France"


def test_create_brewery_rejects_missing_name(client: TestClient) -> None:
    response = client.post("/breweries", json={"country": "France"})
    assert response.status_code == 422


def test_create_brewery_generates_unique_slug_on_collision(
    client: TestClient,
) -> None:
    first = client.post("/breweries", json={"name": "Abbey Brew"})
    second = client.post("/breweries", json={"name": "Abbey Brew"})

    assert first.status_code == 201
    assert second.status_code == 201
    assert first.json()["slug"] == "abbey-brew"
    assert second.json()["slug"] == "abbey-brew-2"


def test_get_brewery_returns_404_for_unknown(client: TestClient) -> None:
    response = client.get(f"/breweries/{uuid.uuid4()}")
    assert response.status_code == 404


def test_get_brewery_returns_the_row(client: TestClient) -> None:
    created = client.post("/breweries", json={"name": "Test Brewery"}).json()

    response = client.get(f"/breweries/{created['id']}")

    assert response.status_code == 200
    assert response.json()["id"] == created["id"]


def test_list_breweries_filters_by_country(client: TestClient) -> None:
    client.post("/breweries", json={"name": "FR One", "country": "France"})
    client.post("/breweries", json={"name": "FR Two", "country": "France"})
    client.post("/breweries", json={"name": "BE One", "country": "Belgium"})

    response = client.get("/breweries", params={"country": "France"})

    data = response.json()
    assert data["meta"]["total"] == 2
    assert {item["name"] for item in data["items"]} == {"FR One", "FR Two"}


def test_list_breweries_paginates(client: TestClient) -> None:
    for i in range(25):
        client.post("/breweries", json={"name": f"Brewery {i:02d}"})

    response = client.get("/breweries", params={"page": 2, "per_page": 10})

    data = response.json()
    assert data["meta"] == {"total": 25, "page": 2, "per_page": 10}
    assert len(data["items"]) == 10


def test_patch_brewery_updates_partial_fields(client: TestClient) -> None:
    created = client.post(
        "/breweries",
        json={"name": "Old Name", "city": "Old City"},
    ).json()

    response = client.patch(
        f"/breweries/{created['id']}",
        json={"city": "New City"},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "Old Name"
    assert body["city"] == "New City"


def test_patch_brewery_returns_404_for_unknown(client: TestClient) -> None:
    response = client.patch(
        f"/breweries/{uuid.uuid4()}",
        json={"city": "Anywhere"},
    )
    assert response.status_code == 404


def test_delete_brewery_returns_204_then_404(client: TestClient) -> None:
    created = client.post("/breweries", json={"name": "Doomed"}).json()

    delete_response = client.delete(f"/breweries/{created['id']}")
    assert delete_response.status_code == 204

    follow_up = client.get(f"/breweries/{created['id']}")
    assert follow_up.status_code == 404


async def test_search_breweries_matches_substring(
    client: TestClient, db_session: AsyncSession
) -> None:
    # Seed directly via ORM for speed and to avoid HTTP round-trips.
    db_session.add_all(
        [
            Brewery(name="Abbey Brew", slug="abbey-brew"),
            Brewery(name="Mountain Abbey", slug="mountain-abbey"),
            Brewery(name="City Lager", slug="city-lager"),
        ]
    )
    await db_session.commit()

    response = client.get("/breweries/search", params={"q": "abbey"})

    data = response.json()
    assert data["meta"]["total"] == 2
    names = {item["name"] for item in data["items"]}
    assert names == {"Abbey Brew", "Mountain Abbey"}
