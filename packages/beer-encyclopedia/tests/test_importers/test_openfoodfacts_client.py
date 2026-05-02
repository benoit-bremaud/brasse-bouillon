"""Behaviour tests for ``OpenFoodFactsClient``.

Covers the three layers the client owns:
- HTTP transport (404 + 5xx + non-JSON payload → controlled errors)
- Status discrimination (OFF ``status=0`` → ``None``, ``status=1`` →
  snapshot)
- Field mapping (name preference, brand split, abv extraction, country
  resolution, allergen normalisation, image URL fallback)

Tests build a ``httpx.MockTransport`` so the real HTTP layer is
exercised without ever leaving the process.
"""

from __future__ import annotations

from decimal import Decimal
from typing import Any

import httpx
import pytest

from importers.openfoodfacts import (
    DEFAULT_BASE_URL,
    OpenFoodFactsClient,
    OpenFoodFactsError,
)


def _build_client(handler) -> OpenFoodFactsClient:  # type: ignore[no-untyped-def]
    transport = httpx.MockTransport(handler)
    httpx_client = httpx.AsyncClient(
        transport=transport,
        base_url=DEFAULT_BASE_URL,
    )
    return OpenFoodFactsClient(client=httpx_client)


# --- Happy path ----------------------------------------------------------


async def test_fetch_by_ean_returns_full_snapshot_for_known_product() -> None:
    payload: dict[str, Any] = {
        "code": "3760231860119",
        "status": 1,
        "product": {
            "product_name": "Pelforth Brune",
            "product_name_fr": "Pelforth Brune",
            "brands": "Pelforth, Heineken France",
            "countries_tags": ["en:france"],
            "allergens_tags": ["en:gluten"],
            "image_front_url": "https://example.org/pelforth.jpg",
            "nutriments": {"alcohol_value": 6.5, "alcohol_unit": "% vol"},
        },
    }

    def handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/v2/product/3760231860119.json"
        return httpx.Response(200, json=payload)

    async with _build_client(handler) as client:
        snapshot = await client.fetch_by_ean("3760231860119")

    assert snapshot is not None
    assert snapshot.external_id == "3760231860119"
    assert snapshot.name == "Pelforth Brune"
    assert snapshot.brand == "Pelforth"  # first of the comma list
    assert snapshot.abv == Decimal("6.5")
    assert snapshot.country_of_origin == "FR"
    assert snapshot.allergens == ["gluten"]
    assert snapshot.image_url == "https://example.org/pelforth.jpg"
    # Audit trail keeps the full source payload.
    assert snapshot.raw_payload == payload["product"]


# --- Sad / not-found paths -----------------------------------------------


async def test_fetch_by_ean_returns_none_when_off_reports_status_zero() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"code": "0000000000000", "status": 0})

    async with _build_client(handler) as client:
        snapshot = await client.fetch_by_ean("0000000000000")

    assert snapshot is None


async def test_fetch_by_ean_returns_none_on_404() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(404, text="not found")

    async with _build_client(handler) as client:
        snapshot = await client.fetch_by_ean("9999999999999")

    assert snapshot is None


# --- Error paths ---------------------------------------------------------


async def test_fetch_by_ean_raises_on_5xx() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(503, text="bad gateway")

    async with _build_client(handler) as client:
        with pytest.raises(OpenFoodFactsError, match="HTTP 503"):
            await client.fetch_by_ean("3760231860119")


async def test_fetch_by_ean_raises_on_non_json_payload() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(200, content=b"<html>not json</html>")

    async with _build_client(handler) as client:
        with pytest.raises(OpenFoodFactsError, match="non-JSON payload"):
            await client.fetch_by_ean("3760231860119")


async def test_fetch_by_ean_raises_when_product_object_is_missing() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        # status=1 promises a product, but the dict has none.
        return httpx.Response(200, json={"status": 1})

    async with _build_client(handler) as client:
        with pytest.raises(OpenFoodFactsError, match="no 'product' object"):
            await client.fetch_by_ean("3760231860119")


# --- Mapping edge cases --------------------------------------------------


async def test_mapping_prefers_french_name_over_canonical() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "status": 1,
                "product": {
                    "product_name": "Generic name",
                    "product_name_fr": "Nom français",
                },
            },
        )

    async with _build_client(handler) as client:
        snapshot = await client.fetch_by_ean("1234567890123")

    assert snapshot is not None
    assert snapshot.name == "Nom français"


async def test_mapping_falls_back_to_placeholder_when_every_name_is_blank() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={"status": 1, "product": {"product_name": "  ", "brands": "X"}},
        )

    async with _build_client(handler) as client:
        snapshot = await client.fetch_by_ean("1234567890123")

    assert snapshot is not None
    assert snapshot.name == "Unnamed product"


async def test_mapping_handles_missing_nutriments_gracefully() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={"status": 1, "product": {"product_name": "X"}},
        )

    async with _build_client(handler) as client:
        snapshot = await client.fetch_by_ean("1234567890123")

    assert snapshot is not None
    assert snapshot.abv is None
    assert snapshot.country_of_origin is None
    assert snapshot.allergens == []
    assert snapshot.image_url is None
    assert snapshot.brand is None


async def test_mapping_resolves_belgian_country_tag() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "status": 1,
                "product": {
                    "product_name": "X",
                    "countries_tags": ["en:belgium"],
                },
            },
        )

    async with _build_client(handler) as client:
        snapshot = await client.fetch_by_ean("1234567890123")

    assert snapshot is not None
    assert snapshot.country_of_origin == "BE"


async def test_mapping_skips_unknown_country_slug() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "status": 1,
                "product": {
                    "product_name": "X",
                    "countries_tags": ["en:atlantis"],
                },
            },
        )

    async with _build_client(handler) as client:
        snapshot = await client.fetch_by_ean("1234567890123")

    assert snapshot is not None
    # Unmapped slug → leave country blank rather than guessing.
    assert snapshot.country_of_origin is None


async def test_mapping_deduplicates_allergen_tokens_and_preserves_order() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "status": 1,
                "product": {
                    "product_name": "X",
                    "allergens_tags": [
                        "en:gluten",
                        "fr:gluten",  # duplicate after stripping the prefix
                        "en:sulfites",
                    ],
                },
            },
        )

    async with _build_client(handler) as client:
        snapshot = await client.fetch_by_ean("1234567890123")

    assert snapshot is not None
    assert snapshot.allergens == ["gluten", "sulfites"]


async def test_image_url_falls_back_to_image_url_when_front_missing() -> None:
    def handler(_: httpx.Request) -> httpx.Response:
        return httpx.Response(
            200,
            json={
                "status": 1,
                "product": {
                    "product_name": "X",
                    "image_url": "https://example.org/fallback.jpg",
                },
            },
        )

    async with _build_client(handler) as client:
        snapshot = await client.fetch_by_ean("1234567890123")

    assert snapshot is not None
    assert snapshot.image_url == "https://example.org/fallback.jpg"
