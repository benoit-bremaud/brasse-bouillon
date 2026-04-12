# CLAUDE.md — packages/beer-encyclopedia

## Package Overview

**Name:** @brasse-bouillon/beer-encyclopedia
**Stack:** Python 3.12 + FastAPI + YOLOv8 (Ultralytics) + EasyOCR + PostgreSQL + async SQLAlchemy 2.0 + Alembic + Pydantic
**Purpose:** Beer encyclopedia with ML label scanning (detection + OCR + field extraction), persistent brewery/beer database, and recipe recommendation

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
db/               Database layer (async SQLAlchemy 2.0)
  ├── engine.py       Async engine factory + get_db FastAPI dependency
  └── models/         ORM models (Base, TimestampMixin, UUIDMixin, …)
migrations/       Alembic migrations (async-aware env.py)
  └── versions/       Individual migration scripts
scripts/          CLI tools and dataset utilities
tests/            pytest test suite (pytest-asyncio auto mode)
configs/          Training configuration (YAML)
data/             Sample recipes + dataset templates
docs/             Governance (AGENT.md), ADRs, dataset guides
```

**Data flow (scan):** API → pipeline → infer → ocr → extract → recommender → response
**Data flow (encyclopedia):** API → db session → ORM models → PostgreSQL

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

- Defined in `pyproject.toml` (single source of truth)
- Core runtime deps are mandatory; ML deps are gated behind the `[ml]` extra; test/lint deps are under `[dev]`
- Install locally with `pip install -e ".[ml,dev]"`

---

## Running Locally

```bash
# 1. Python environment
python -m venv .venv
source .venv/bin/activate
pip install -e ".[ml,dev]"

# 2. Local PostgreSQL (Docker Compose)
cp .env.example .env         # edit DATABASE_URL if needed
docker compose up -d         # starts postgres on :5432 and pgadmin on :5050

# 3. Database migrations
alembic upgrade head

# 4. Start API
uvicorn api.main:app --reload

# 5. Run tests
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
