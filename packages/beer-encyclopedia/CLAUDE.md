# CLAUDE.md — packages/beer-encyclopedia

## Package Overview

**Name:** @brasse-bouillon/beer-encyclopedia
**Stack:** Python 3.12 + FastAPI + YOLOv8 (Ultralytics) + EasyOCR + PostgreSQL + SQLAlchemy + Pydantic
**Purpose:** Comprehensive beer encyclopedia with ML label scanning, brewery/beer database, and recipe recommendation

---

## Architecture

```
api/              FastAPI HTTP layer (/health, /scan endpoints)
ml/               Core ML pipeline
  ├── pipeline.py     Orchestration (scan_image entry point)
  ├── infer.py        YOLOv8 label detection + full-image fallback
  ├── ocr.py          EasyOCR text extraction with preprocessing
  ├── extract.py      Regex-based field parsing (name, style, ABV, brewery)
  ├── recommender.py  Deterministic recipe ranking algorithm
  ├── schemas.py      Pydantic models (ExtractedFields, ScanResponse, etc.)
  └── train.py        YOLOv8 training script
scripts/          CLI tools and dataset utilities
tests/            pytest test suite
configs/          Training configuration (YAML)
data/             Sample recipes + dataset templates
docs/             Governance (AGENT.md), ADRs, dataset guides
```

**Data flow:** API → pipeline → infer → ocr → extract → recommender → response

---

## Python Conventions

### Style

- **Type hints** on all function signatures and return types
- **Pydantic** for all request/response models (no raw dicts at API boundaries)
- **`@dataclass`** for internal data structures when Pydantic is overkill
- **Snake_case** for functions and variables, **CamelCase** for classes
- **English only** — all code, comments, docstrings, commit messages

### Patterns

- **Fallback strategies** at every layer (YOLO fallback → full image, OCR → preprocess retry)
- **Confidence tracking** — all subsystems produce confidence scores
- **`@lru_cache`** for expensive model loading (EasyOCR reader)
- **Boundary safety** — always clamp bounding box coordinates to image dimensions

### Forbidden

- `typing.Any` without justification
- Hardcoded file paths (use relative paths or env vars)
- Dev-agent logic in runtime code (see AGENT.md § Runtime Boundary)
- Silent exception swallowing — always log context

---

## Testing

- **Framework:** pytest
- **Naming:** `tests/test_<module>_<behavior>.py` → `test_<expected_behavior>()`
- **Coverage target:** >= 70% (MVP), >= 80% (pre-release)
- **Run tests:** `pytest -q tests/`

---

## Dependencies

- Defined in `ml/requirements.txt`
- **No version pinning yet** — add `pip-compile` lock file before production
- Key deps: ultralytics, easyocr, opencv-python, numpy, pydantic, fastapi, uvicorn, pytest

---

## Running Locally

```bash
# Setup
python -m venv .venv
source .venv/bin/activate
pip install -r ml/requirements.txt

# Start API
uvicorn api.main:app --reload

# Run tests
pytest -q tests/
```

---

## CI (monorepo)

Path-filtered in `.github/workflows/ci.yml`:
- Python 3.12 setup
- `pip install -r ml/requirements.txt`
- `python -m py_compile` sanity check
- `pytest -q tests/`

---

## Governance

See [docs/AGENT.md](docs/AGENT.md) for development agent governance rules (v1.1.0).
See [docs/adr/](docs/adr/) for architecture decision records.
