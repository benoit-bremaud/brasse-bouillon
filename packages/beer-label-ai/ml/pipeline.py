from __future__ import annotations

from collections.abc import Sequence
from pathlib import Path

from ml.extract import extract_fields_from_text
from ml.infer import detect_label_regions
from ml.ocr import ocr_regions
from ml.recommender import load_recipes, recommend_recipes
from ml.schemas import DetectionRegion, ScanExtraction, ScanResponse


def _clamp01(value: float) -> float:
    return max(0.0, min(1.0, value))


def scan_image(
    image_path: str | Path,
    recipes_path: str | Path,
    model_path: str | Path | None = None,
    top_n: int = 3,
    languages: Sequence[str] = ("en", "fr"),
) -> ScanResponse:
    regions_raw, detection_notes = detect_label_regions(
        image_path=image_path,
        model_path=model_path,
    )
    text, ocr_conf, ocr_notes = ocr_regions(
        image_path=image_path,
        regions=regions_raw,
        languages=languages,
    )

    fields = extract_fields_from_text(text)
    recipes = load_recipes(recipes_path)
    recommendations = recommend_recipes(
        extracted=fields,
        recipes=recipes,
        top_n=top_n,
    )

    detection_conf = sum(
        region.confidence for region in regions_raw
    ) / max(len(regions_raw), 1)
    combined_conf = _clamp01(0.4 * detection_conf + 0.6 * ocr_conf)

    notes = [*detection_notes, *ocr_notes]
    if not fields.style:
        notes.append(
            "Style could not be detected; ranking may be less accurate."
        )
    if fields.abv is None:
        notes.append("ABV could not be detected.")

    extraction = ScanExtraction(
        detected_text=text,
        fields=fields,
        confidence=combined_conf,
        notes=notes,
        regions=[
            DetectionRegion(
                x1=region.x1,
                y1=region.y1,
                x2=region.x2,
                y2=region.y2,
                confidence=region.confidence,
                label=region.label,
            )
            for region in regions_raw
        ],
    )

    return ScanResponse(extraction=extraction, recommendations=recommendations)
