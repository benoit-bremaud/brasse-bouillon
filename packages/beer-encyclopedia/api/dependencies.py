"""FastAPI dependency providers shared across routers.

Re-exports ``get_db`` from the database engine layer so route handlers can
declare ``session: AsyncSession = Depends(get_db)`` without importing from
``db.engine`` directly. Keeps the API layer's import surface narrow and
makes future test overrides (e.g. ``app.dependency_overrides[get_db]``)
discoverable in one place.
"""

from __future__ import annotations

from db.engine import get_db

__all__ = ["get_db"]
