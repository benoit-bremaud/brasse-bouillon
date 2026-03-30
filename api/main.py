from __future__ import annotations

import tempfile
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, File, HTTPException, UploadFile

from ml.pipeline import scan_image
from ml.schemas import ScanResponse

app = FastAPI(
    title="Brasse-Bouillon Beer Label AI API",
    version="0.1.0",
    description="Beer label scanning and closest recipe recommendation API.",
)


@app.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/scan", response_model=ScanResponse)
async def scan_endpoint(
    file: UploadFile = File(...),
    model_path: Optional[str] = None,
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
