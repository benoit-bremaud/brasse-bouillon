from __future__ import annotations

from collections.abc import Iterable, Sequence
from functools import lru_cache
from pathlib import Path

import cv2
import numpy as np

from ml.infer import DetectedRegionRaw


@lru_cache(maxsize=8)
def _get_reader(languages: tuple[str, ...]):
    import easyocr

    return easyocr.Reader(list(languages), gpu=False)


def _preprocess_for_ocr(crop: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 7, 75, 75)
    return cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        7,
    )


def _read_text(crop: np.ndarray, languages: Sequence[str]) -> tuple[str, float, list[str]]:
    notes: list[str] = []
    if crop.size == 0:
        return "", 0.0, ["Empty crop for OCR."]

    try:
        reader = _get_reader(tuple(languages))
    except Exception as exc:  # noqa: BLE001
        return "", 0.0, [f"EasyOCR unavailable: {exc}"]

    def parse(results: Iterable) -> tuple[list[str], list[float]]:
        texts: list[str] = []
        confs: list[float] = []
        for item in results:
            if len(item) < 3:
                continue
            text = str(item[1]).strip()
            conf = float(item[2])
            if text:
                texts.append(text)
                confs.append(conf)
        return texts, confs

    raw_results = reader.readtext(crop, detail=1, paragraph=True)
    texts, confs = parse(raw_results)

    if not texts:
        preprocessed = _preprocess_for_ocr(crop)
        pre_results = reader.readtext(preprocessed, detail=1, paragraph=True)
        texts, confs = parse(pre_results)
        if texts:
            notes.append("OCR succeeded after preprocessing.")

    if not texts:
        return "", 0.0, notes + ["No OCR text extracted."]

    text = "\n".join(dict.fromkeys(texts))
    conf = sum(confs) / max(len(confs), 1)
    conf = max(0.0, min(1.0, conf))
    return text, conf, notes


def ocr_regions(
    image_path: str | Path,
    regions: Sequence[DetectedRegionRaw],
    languages: Sequence[str] = ("en", "fr"),
) -> tuple[str, float, list[str]]:
    path = Path(image_path)
    image = cv2.imread(str(path))
    if image is None:
        raise ValueError(f"Unable to read image for OCR: {path}")

    h, w = image.shape[:2]
    all_notes: list[str] = []
    chunk_texts: list[str] = []
    chunk_confs: list[float] = []

    for region in regions:
        x1 = max(0, min(w, region.x1))
        x2 = max(0, min(w, region.x2))
        y1 = max(0, min(h, region.y1))
        y2 = max(0, min(h, region.y2))

        if x2 <= x1 or y2 <= y1:
            all_notes.append("Invalid bounding box skipped during OCR.")
            continue

        crop = image[y1:y2, x1:x2]
        text, conf, notes = _read_text(crop, languages)
        all_notes.extend(notes)
        if text:
            chunk_texts.append(text)
            chunk_confs.append(conf)

    merged_text = "\n".join(chunk_texts).strip()
    merged_conf = sum(chunk_confs) / max(len(chunk_confs), 1) if chunk_confs else 0.0
    merged_conf = max(0.0, min(1.0, merged_conf))

    return merged_text, merged_conf, all_notes
