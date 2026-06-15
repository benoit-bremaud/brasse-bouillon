"""Behavior tests for the /health and /scan HTTP endpoints.

These tests pin down the HTTP contract that must remain stable across the
router refactor: identical paths, identical request/response shapes,
identical status codes. They use FastAPI's ``TestClient`` for synchronous
calls — no live database or ML model is required because /health is pure
and /scan's failure paths short-circuit before reaching the pipeline.
"""

from __future__ import annotations

import io
import sys
from collections.abc import Iterator

import pytest
from fastapi.testclient import TestClient

from api.main import app


@pytest.fixture
def client() -> Iterator[TestClient]:
    # Use TestClient as a context manager so FastAPI runs the app's
    # startup + shutdown lifespan around each test (the shutdown disposes
    # the database engine and prevents resource leaks across tests).
    with TestClient(app) as test_client:
        yield test_client


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_scan_rejects_missing_file(client: TestClient) -> None:
    response = client.post("/scan")

    # FastAPI emits 422 when a required form field is missing.
    assert response.status_code == 422


def test_scan_rejects_non_image_content_type(client: TestClient) -> None:
    response = client.post(
        "/scan",
        files={"file": ("notes.txt", io.BytesIO(b"hello"), "text/plain")},
    )

    assert response.status_code == 400
    assert "image" in response.json()["detail"].lower()


def test_scan_rejects_file_without_content_type(client: TestClient) -> None:
    # Some clients omit the MIME type entirely; the endpoint must still
    # reject the request rather than crash.
    response = client.post(
        "/scan",
        files={"file": ("blob", io.BytesIO(b"raw bytes"), "")},
    )

    assert response.status_code == 400


def test_app_exposes_scan_router_routes() -> None:
    """The scan router must be mounted at the root, not under a prefix —
    backward compatibility with consumers of /health and /scan."""

    # Assert against the OpenAPI schema (the public path contract) rather
    # than `app.routes`: FastAPI 0.137 stores included routers as opaque
    # `_IncludedRouter` wrappers in `app.routes` (lazy resolution), so
    # introspecting that internal structure is brittle and broke this test
    # on the FastAPI upgrade. `openapi()["paths"]` reflects the
    # actually-exposed routes regardless of the internal representation.
    paths = app.openapi()["paths"]
    assert "/health" in paths
    assert "/scan" in paths


def test_scan_router_imports_without_ml_pipeline(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """Reloading the scan router with ``ml.pipeline`` made unimportable must
    succeed — proving nothing at module scope imports the heavy CV/OCR stack,
    so the service boots on a lean EAN/OpenFoodFacts deployment (ADR-0015).

    A `hasattr(module, "scan_image")` check is too weak: a regression to a
    bare `import ml.pipeline` would still pass it while reintroducing the
    module-load import. Forcing ``ml.pipeline`` to be unimportable and
    reloading the module catches any module-scope import (Copilot review on
    #1177)."""

    import importlib

    import api.routers.scan as scan_module

    monkeypatch.setitem(sys.modules, "ml.pipeline", None)
    try:
        # Must NOT raise: the import is lazy (inside the endpoint). A
        # module-scope `import ml.pipeline` would raise ImportError here.
        importlib.reload(scan_module)
    finally:
        # Restore the genuine module so later tests see the real endpoint.
        monkeypatch.undo()
        importlib.reload(scan_module)


def test_scan_returns_503_when_ml_pipeline_unavailable(
    client: TestClient,
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    """On a deployment without the ML extra installed, the lazy
    `from ml.pipeline import scan_image` raises ImportError; the endpoint must
    degrade to a clean 503, not crash with a 500. Setting the module to None in
    sys.modules makes the import fail with ImportError (the standard
    simulation)."""

    monkeypatch.setitem(sys.modules, "ml.pipeline", None)

    response = client.post(
        "/scan",
        files={"file": ("label.jpg", io.BytesIO(b"\xff\xd8\xff"), "image/jpeg")},
    )

    assert response.status_code == 503
    assert "available" in response.json()["detail"].lower()
