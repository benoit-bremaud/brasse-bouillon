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

    # Import the ML pipeline lazily, here, rather than at module load.
    # `ml.pipeline` pulls in the heavy CV/OCR stack (cv2, numpy, and
    # optionally ultralytics/easyocr), which is intentionally NOT installed
    # on the lean EAN/OpenFoodFacts deployment (ADR-0015: UC4 first, UC5/OCR
    # later). Keeping the import out of module scope lets the app boot
    # without those deps; a request to this endpoint then degrades to a
    # clean 503 instead of crashing the whole service at startup.
    #
    # It is done BEFORE the threadpool block on purpose: the broad
    # `except Exception -> 500` around `_run_scan` would otherwise swallow
    # this HTTPException and mislabel a missing-dependency as a server error.
    try:
        from ml.pipeline import scan_image
    except ImportError as exc:
        raise HTTPException(
            status_code=503,
            detail="Image analysis (ML pipeline) is not available on this deployment.",
        ) from exc

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
