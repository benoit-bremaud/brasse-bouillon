# Sequence diagram — beer-encyclopedia — scan a label

> **Feature**: `POST /scan`
> **Source code**: `ml/pipeline.py`, `ml/infer.py`, `ml/ocr.py`, `ml/extract.py`,
> `ml/recommender.py`
> **Related ADRs**: ADR-0001 (detection-first sprint 1)

## Context

The **real** scan pipeline as coded: a single uploaded image runs through
local detection, OCR, regex extraction, and a deterministic recipe ranking.
There is **no** stitching, Cloud Vision, Claude, web check, SSE, or persistence
— that advanced pipeline is a separate, not-yet-built study under
`docs/architecture/diagrams/scan/`.

## Diagram

```mermaid
sequenceDiagram
  actor U as End user
  participant API as FastAPI (/scan)
  participant PIPE as scan_image (pipeline)
  participant YOLO as infer (YOLOv8)
  participant OCR as ocr (EasyOCR)
  participant EX as extract (regex)
  participant REC as recommender
  participant FILE as data/recipes.sample.json

  U->>API: POST /scan (image file)
  API->>PIPE: scan_image(image, recipes_path, model_path?)
  PIPE->>YOLO: detect_label_regions(image)
  alt Model present and detects regions
    YOLO-->>PIPE: bounding boxes (clamped) + conf
  else No model or no detection
    YOLO-->>PIPE: full-image fallback region (conf 0.30)
  end
  PIPE->>OCR: ocr_regions(image, regions)
  alt Text found
    OCR-->>PIPE: text + confidence
  else Empty
    OCR->>OCR: preprocess (grayscale, bilateral, adaptive threshold) + retry
    OCR-->>PIPE: text + confidence
  end
  PIPE->>EX: extract_fields_from_text(text)
  EX-->>PIPE: ExtractedFields{name, style, abv, brewery}
  PIPE->>FILE: load_recipes(recipes_path)
  FILE-->>PIPE: recipes[]
  PIPE->>REC: recommend_recipes(fields, recipes, top_n=3)
  REC-->>PIPE: RecipeSuggestion[] (score + reasons)
  PIPE-->>API: ScanResponse{extraction, recommendations}
  API-->>U: 200 OK (ScanResponse)
```

## Notes

- **Stateless**: `POST /scan` writes nothing to the database — it returns extraction
  + recommendations only. No `Beer` row is created from a scan today.
- **Fallback at each layer** (per the package convention): YOLO → full image,
  EasyOCR → preprocess-and-retry.
- **Deterministic ranking** (`ml/recommender.py`): `score = 0.60·style + 0.25·abv +
  0.15·ibu`. This weighting is a decision captured in the backfilled ADR, not a tuned
  model.
- The recipes come from a bundled sample file (`data/recipes.sample.json`), not from
  the `beers` catalog — scan recommendation and the encyclopedia catalog are decoupled
  today.
