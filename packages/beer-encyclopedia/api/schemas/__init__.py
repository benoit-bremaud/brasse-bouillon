"""Pydantic schemas exposed by the HTTP API.

API schemas are kept separate from internal ML schemas (``ml/schemas.py``)
so the two contracts can evolve independently — the API may add pagination
wrappers or strip ML-internal confidence metadata, while the pipeline keeps
its richer structures.
"""
