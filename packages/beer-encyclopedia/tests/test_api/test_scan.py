"""Behavior tests for the /health and /scan HTTP endpoints.

These tests pin down the HTTP contract that must remain stable across the
router refactor: identical paths, identical request/response shapes,
identical status codes. They use FastAPI's ``TestClient`` for synchronous
calls — no live database or ML model is required because /health is pure
and /scan's failure paths short-circuit before reaching the pipeline.
"""

from __future__ import annotations

import io
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

    paths = {route.path for route in app.routes if hasattr(route, "methods")}
    assert "/health" in paths
    assert "/scan" in paths
