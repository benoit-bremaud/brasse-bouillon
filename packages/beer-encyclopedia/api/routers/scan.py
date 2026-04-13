"""Scan + healthcheck router.

Hosts the legacy ``/health`` and ``/scan`` endpoints, moved verbatim from
the original ``api/main.py`` so the request/response contract — paths,
parameters, status codes, response model — is byte-for-byte preserved.
"""

from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from api.schemas.scan import ScanResponse
from ml.pipeline import scan_image

router = APIRouter(tags=["scan"])


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/scan", response_model=ScanResponse)
async def scan_endpoint(
    file: UploadFile = File(...),
    model_path: str | None = None,
    recipes_path: str = "data/recipes.sample.json",
    top_n: int = 3,
) -> ScanResponse:
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail="Uploaded file must be an image.",
        )

    suffix = Path(file.filename or "upload.jpg").suffix or ".jpg"
    with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
        tmp_path = Path(tmp.name)
        content = await file.read()
        tmp.write(content)

    try:
        response = scan_image(
            image_path=tmp_path,
            recipes_path=recipes_path,
            model_path=model_path,
            top_n=top_n,
        )
        return response
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=500,
            detail=f"Scan pipeline failed: {exc}",
        ) from exc
    finally:
        if tmp_path.exists():
            tmp_path.unlink(missing_ok=True)
