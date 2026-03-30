from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import List, Optional, Tuple

import cv2


@dataclass
class DetectedRegionRaw:
    x1: int
    y1: int
    x2: int
    y2: int
    confidence: float
    label: str


def detect_label_regions(
    image_path: str | Path,
    model_path: Optional[str | Path] = None,
    conf_threshold: float = 0.25,
) -> Tuple[List[DetectedRegionRaw], List[str]]:
    """Detect label regions with YOLO if available, otherwise return full-image fallback."""
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {path}")

    image = cv2.imread(str(path))
    if image is None:
        raise ValueError(f"Unable to read image: {path}")

    h, w = image.shape[:2]
    notes: List[str] = []
    regions: List[DetectedRegionRaw] = []

    if model_path:
        model_file = Path(model_path)
        if model_file.exists():
            try:
                from ultralytics import YOLO

                model = YOLO(str(model_file))
                results = model(str(path), conf=conf_threshold, verbose=False)
                if results:
                    result = results[0]
                    names = result.names if hasattr(result, "names") else {}
                    for box in result.boxes:
                        x1, y1, x2, y2 = [int(v) for v in box.xyxy[0].tolist()]
                        confidence = float(box.conf[0])
                        cls_id = int(box.cls[0]) if box.cls is not None else -1
                        label = names.get(cls_id, str(cls_id)) if isinstance(names, dict) else str(cls_id)
                        regions.append(
                            DetectedRegionRaw(
                                x1=max(0, x1),
                                y1=max(0, y1),
                                x2=min(w, x2),
                                y2=min(h, y2),
                                confidence=max(0.0, min(1.0, confidence)),
                                label=label,
                            )
                        )
            except Exception as exc:  # noqa: BLE001
                notes.append(f"YOLO unavailable ({exc}); using full-image fallback.")
        else:
            notes.append(f"YOLO model file not found: {model_file}. Using full-image fallback.")

    if not regions:
        regions = [
            DetectedRegionRaw(
                x1=0,
                y1=0,
                x2=w,
                y2=h,
                confidence=0.30,
                label="full_image_fallback",
            )
        ]
        notes.append("No bounding box detected; using full image as fallback.")

    return regions, notes
