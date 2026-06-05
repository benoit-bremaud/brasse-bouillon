"""Behavior tests for the read-only /styles endpoints."""

from __future__ import annotations

import uuid

from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession

from db.models import Style


async def _seed(session: AsyncSession, *names: str) -> list[Style]:
    styles = [
        Style(name=name, slug=name.lower().replace(" ", "-"))
        for name in names
    ]
    session.add_all(styles)
    await session.commit()
    for style in styles:
        await session.refresh(style)
    return styles


async def test_get_style_exposes_family(
    client: TestClient, db_session: AsyncSession
) -> None:
    """StyleRead surfaces the BJCP family (ADR-0016 D2) to API clients."""

    style = Style(name="Blonde Ale", slug="blonde_ale", family="Pale Ale")
    db_session.add(style)
    await db_session.commit()
    await db_session.refresh(style)

    response = client.get(f"/styles/{style.id}")

    assert response.status_code == 200
    assert response.json()["family"] == "Pale Ale"


def test_list_styles_empty_returns_empty_items(client: TestClient) -> None:
    response = client.get("/styles")
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["meta"] == {"total": 0, "page": 1, "per_page": 20}


async def test_list_styles_returns_alphabetical(
    client: TestClient, db_session: AsyncSession
) -> None:
    await _seed(db_session, "Stout", "IPA", "Lager")

    response = client.get("/styles")

    assert response.status_code == 200
    names = [item["name"] for item in response.json()["items"]]
    assert names == ["IPA", "Lager", "Stout"]


async def test_list_styles_respects_pagination(
    client: TestClient, db_session: AsyncSession
) -> None:
    await _seed(db_session, *[f"Style {i:02d}" for i in range(25)])

    response = client.get("/styles", params={"page": 2, "per_page": 10})

    data = response.json()
    assert data["meta"] == {"total": 25, "page": 2, "per_page": 10}
    assert len(data["items"]) == 10


def test_get_style_returns_404_for_unknown_id(client: TestClient) -> None:
    response = client.get(f"/styles/{uuid.uuid4()}")
    assert response.status_code == 404


async def test_get_style_returns_single_row(
    client: TestClient, db_session: AsyncSession
) -> None:
    (style,) = await _seed(db_session, "India Pale Ale")

    response = client.get(f"/styles/{style.id}")

    assert response.status_code == 200
    assert response.json()["slug"] == "india-pale-ale"
