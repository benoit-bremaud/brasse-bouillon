"""Scan + healthcheck router.

Hosts the ``/health`` and ``/scan`` endpoints. The recipes database and
optional YOLO model path are operator-configured (constants or env vars) —
never client-controlled — so the endpoint cannot be abused to read
arbitrary files from the server.
"""

from __future__ import annotations

import logging
import os
import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.concurrency import run_in_threadpool

from api.schemas.scan import ScanResponse
from ml.pipeline import scan_image

logger = logging.getLogger(__name__)

router = APIRouter(tags=["scan"])

# Operator-configured paths. Exposed as env vars so ops can swap the
# recipes catalog or point at a trained YOLO checkpoint without editing
# code — but never as HTTP query parameters.
_RECIPES_PATH = os.environ.get("SCAN_RECIPES_PATH", "data/recipes.sample.json")
_MODEL_PATH = os.environ.get("SCAN_MODEL_PATH") or None


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/scan", response_model=ScanResponse)
async def scan_endpoint(
    file: UploadFile = File(...),
    top_n: int = 3,
) -> ScanResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be an image.",
        )

    # Read the upload once (async, quick) then hand the CPU/IO-heavy work
    # off to a worker thread so the event loop stays free for other
    # requests (e.g. /health) while YOLO + EasyOCR run.
    content = await file.read()
    suffix = Path(file.filename or "upload.jpg").suffix or ".jpg"

    def _run_scan() -> ScanResponse:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp_path = Path(tmp.name)
            tmp.write(content)
        try:
            return scan_image(
                image_path=tmp_path,
                recipes_path=_RECIPES_PATH,
                model_path=_MODEL_PATH,
                top_n=top_n,
            )
        finally:
            if tmp_path.exists():
                tmp_path.unlink(missing_ok=True)

    try:
        return await run_in_threadpool(_run_scan)
    except Exception:
        # Log the full traceback server-side for debugging, but keep the
        # client-facing message generic to avoid leaking filesystem paths,
        # library versions, or other internals.
        logger.exception("Scan pipeline failed")
        raise HTTPException(
            status_code=500,
            detail="Scan failed.",
        ) from None
