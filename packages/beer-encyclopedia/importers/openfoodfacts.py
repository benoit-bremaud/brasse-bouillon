"""Open Food Facts client for fetching beer products by EAN.

Open Food Facts (OFF) is a public, crowd-sourced food product database
covering more than two million SKUs worldwide. We use it as the
primary external source to bootstrap the encyclopedia: a scanned EAN
that does not yet exist in our DB triggers a one-shot lookup against
OFF, and the response is normalised into an
:class:`importers.base.ExternalBeerSnapshot` for the upsert layer to
persist.

Network layer
-------------
The client wraps an :class:`httpx.AsyncClient` so the caller can hold
a single connection pool for the lifetime of the request handler and
take advantage of HTTP/2 keep-alive when available. The base URL and
the user-agent are pulled from the environment so the same code runs
unchanged in tests (with a stub) and in production.

Per OFF's `terms of use`_, every client must identify itself with a
descriptive ``User-Agent`` header that includes the project name, a
version, and a contact endpoint. The default value embedded here
satisfies that requirement; production deployments should override it
via the ``OFF_USER_AGENT`` environment variable to surface their own
contact channel.

.. _terms of use: https://world.openfoodfacts.org/files/api-documentation
"""

from __future__ import annotations

import os
from decimal import Decimal, InvalidOperation

import httpx

from importers.base import ExternalBeerSnapshot

DEFAULT_BASE_URL: str = "https://world.openfoodfacts.org"
DEFAULT_USER_AGENT: str = (
    "BrasseBouillon/0.2 (+https://github.com/benoit-bremaud/brasse-bouillon)"
)
DEFAULT_TIMEOUT_SECONDS: float = 10.0

_PRODUCT_PATH_TEMPLATE: str = "/api/v2/product/{ean}.json"


class OpenFoodFactsError(RuntimeError):
    """Raised when the OFF API returns an unexpected response.

    Distinct from a missing-product situation (which the client surfaces
    as ``None``) — this exception is reserved for transport-level or
    payload-shape failures the caller cannot recover from without code
    or configuration changes.
    """


class OpenFoodFactsClient:
    """Asynchronous client for the Open Food Facts product API."""

    def __init__(
        self,
        *,
        client: httpx.AsyncClient | None = None,
        base_url: str | None = None,
        user_agent: str | None = None,
        timeout_seconds: float | None = None,
    ) -> None:
        """Build a client.

        Parameters
        ----------
        client:
            Inject an existing :class:`httpx.AsyncClient` to share a
            connection pool with the surrounding application. When
            ``None`` the client builds its own and owns its lifecycle —
            callers must then use the instance as an async context
            manager (``async with``) to ensure the underlying client is
            closed.
        base_url, user_agent, timeout_seconds:
            Override the defaults pulled from the environment. Useful
            for tests targeting a mock server.
        """

        resolved_base_url = (
            base_url if base_url is not None else os.environ.get(
                "OFF_API_BASE_URL", DEFAULT_BASE_URL
            )
        )
        resolved_user_agent = (
            user_agent if user_agent is not None else os.environ.get(
                "OFF_USER_AGENT", DEFAULT_USER_AGENT
            )
        )
        resolved_timeout = (
            timeout_seconds if timeout_seconds is not None
            else DEFAULT_TIMEOUT_SECONDS
        )

        self._base_url: str = resolved_base_url.rstrip("/")
        self._user_agent: str = resolved_user_agent
        self._owns_client: bool = client is None
        self._client: httpx.AsyncClient = client or httpx.AsyncClient(
            timeout=resolved_timeout,
            headers={"User-Agent": self._user_agent},
        )

    async def __aenter__(self) -> OpenFoodFactsClient:
        return self

    async def __aexit__(self, *_: object) -> None:
        await self.aclose()

    async def aclose(self) -> None:
        """Close the underlying HTTP client when this object owns it."""

        if self._owns_client:
            await self._client.aclose()

    async def fetch_by_ean(self, ean: str) -> ExternalBeerSnapshot | None:
        """Look up a product by EAN.

        Returns ``None`` when OFF reports the product as missing
        (``status == 0`` or HTTP 404) so the caller can branch on a
        clean sentinel. Any other unexpected condition — HTTP 5xx,
        malformed payload, or transport-level failure (timeout, DNS,
        connection reset) — raises :class:`OpenFoodFactsError` so the
        route handler can convert it into a controlled 503 instead of
        leaking an uncaught exception as a 500.
        """

        url = f"{self._base_url}{_PRODUCT_PATH_TEMPLATE.format(ean=ean)}"
        try:
            response = await self._client.get(url)
        except httpx.RequestError as exc:
            # Transport-level failure (timeout, DNS, connection reset…).
            # Surface it through the typed error so the route returns 503.
            raise OpenFoodFactsError(
                f"OFF transport error for EAN {ean}: {exc}"
            ) from exc

        # 404 from OFF is unusual (the API normally returns 200 with
        # status=0 for unknown codes) but treat it the same way to
        # remain resilient against minor server-side changes.
        if response.status_code == 404:
            return None
        if response.status_code != 200:
            raise OpenFoodFactsError(
                f"OFF returned HTTP {response.status_code} for EAN {ean}"
            )

        try:
            payload = response.json()
        except ValueError as exc:
            raise OpenFoodFactsError(
                f"OFF returned non-JSON payload for EAN {ean}"
            ) from exc

        # Defensive: a misbehaving proxy or schema drift could return a
        # JSON list / string / number. Anything other than an object
        # cannot be treated as an OFF response — fail fast with a
        # controlled error instead of letting AttributeError bubble up.
        if not isinstance(payload, dict):
            raise OpenFoodFactsError(
                f"OFF payload for EAN {ean} is not a JSON object "
                f"(got {type(payload).__name__})"
            )

        if payload.get("status") == 0:
            return None

        product = payload.get("product")
        if not isinstance(product, dict):
            raise OpenFoodFactsError(
                f"OFF payload for EAN {ean} has no 'product' object"
            )

        return _map_product_to_snapshot(ean=ean, product=product)


def _map_product_to_snapshot(
    *, ean: str, product: dict[str, object]
) -> ExternalBeerSnapshot:
    """Translate the OFF product dict into our internal shape.

    Kept module-level (instead of a private method on the client) so
    tests can exercise the mapping logic without instantiating a
    network-bearing client.
    """

    return ExternalBeerSnapshot(
        external_id=ean,
        name=_pick_name(product),
        brand=_pick_first_brand(product),
        abv=_pick_abv(product),
        country_of_origin=_pick_country_iso2(product),
        allergens=_pick_allergens(product),
        image_url=_pick_image_url(product),
        raw_payload=product,
    )


def _pick_name(product: dict[str, object]) -> str:
    """Return the most descriptive available name.

    Prefers the localised French name when present, falls back to the
    canonical ``product_name``, then to the generic name, and finally
    to a placeholder so the ORM never receives an empty string.
    """

    for key in ("product_name_fr", "product_name", "generic_name"):
        value = product.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return "Unnamed product"


def _pick_first_brand(product: dict[str, object]) -> str | None:
    """Return the first brand listed (OFF stores them comma-separated)."""

    brands = product.get("brands")
    if not isinstance(brands, str):
        return None
    first, _, _ = brands.partition(",")
    cleaned = first.strip()
    return cleaned or None


def _pick_abv(product: dict[str, object]) -> Decimal | None:
    """Extract the alcohol-by-volume value from the nutriments dict.

    OFF stores it under several keys depending on the product's
    history; we try the canonical ``alcohol_value`` first, then fall
    back to ``alcohol_100g`` and ``alcohol`` for older entries.
    """

    nutriments = product.get("nutriments")
    if not isinstance(nutriments, dict):
        return None

    for key in ("alcohol_value", "alcohol_100g", "alcohol"):
        raw = nutriments.get(key)
        if raw is None:
            continue
        try:
            return Decimal(str(raw))
        except (InvalidOperation, ValueError):
            continue
    return None


def _pick_country_iso2(product: dict[str, object]) -> str | None:
    """Extract an ISO 3166-1 alpha-2 country code from ``countries_tags``.

    OFF country tags are language-prefixed slugs such as ``"en:france"``
    or ``"fr:belgique"``. We do not maintain a full slug→ISO mapping
    here; instead we trust the ``"en:"`` prefix and try a small
    hard-coded translation for the most frequent countries shipped on
    European beer labels. Anything we cannot resolve safely is left
    ``None`` so the caller falls back to the seed default.
    """

    tags = product.get("countries_tags")
    if not isinstance(tags, list):
        return None

    for tag in tags:
        if not isinstance(tag, str) or ":" not in tag:
            continue
        _, _, slug = tag.partition(":")
        iso = _COUNTRY_SLUG_TO_ISO2.get(slug.lower())
        if iso is not None:
            return iso
    return None


def _pick_allergens(product: dict[str, object]) -> list[str]:
    """Extract a normalised allergen list from ``allergens_tags``.

    OFF tags such as ``"en:gluten"`` are converted to plain tokens
    (``"gluten"``); duplicates are removed and the order is preserved
    for stable diffing.
    """

    tags = product.get("allergens_tags")
    if not isinstance(tags, list):
        return []

    seen: set[str] = set()
    normalised: list[str] = []
    for tag in tags:
        if not isinstance(tag, str):
            continue
        _, _, token = tag.partition(":")
        token = token.strip().lower()
        if token and token not in seen:
            seen.add(token)
            normalised.append(token)
    return normalised


def _pick_image_url(product: dict[str, object]) -> str | None:
    """Return the front-label image URL when OFF provides one."""

    for key in ("image_front_url", "image_url"):
        value = product.get(key)
        if isinstance(value, str) and value.strip():
            return value.strip()
    return None


# Minimal slug → ISO 3166-1 alpha-2 map covering the countries we see
# most often on European beer labels. Extend as gaps appear; missing
# entries simply leave ``country_of_origin`` blank rather than guessing.
_COUNTRY_SLUG_TO_ISO2: dict[str, str] = {
    "france": "FR",
    "belgique": "BE",
    "belgium": "BE",
    "allemagne": "DE",
    "germany": "DE",
    "royaume-uni": "GB",
    "united-kingdom": "GB",
    "irlande": "IE",
    "ireland": "IE",
    "pays-bas": "NL",
    "netherlands": "NL",
    "espagne": "ES",
    "spain": "ES",
    "italie": "IT",
    "italy": "IT",
    "republique-tcheque": "CZ",
    "czech-republic": "CZ",
    "danemark": "DK",
    "denmark": "DK",
    "etats-unis": "US",
    "united-states": "US",
}
