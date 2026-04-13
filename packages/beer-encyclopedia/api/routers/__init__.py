"""HTTP routers grouped by domain.

Each router module exports a ``router`` attribute (an APIRouter instance).
``api/main.py`` is responsible for mounting them on the FastAPI app — the
router modules themselves stay free of app-level concerns so they can be
imported and tested in isolation.
"""
