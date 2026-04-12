# Quick Setup (PoC/MVP)

## 1) Install Python dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -e ".[ml,dev]"
```

## 2) Create your `.env` file

```bash
cp .env.example .env
# Open .env and replace every CHANGE_ME value with real ones.
# `.env` is gitignored — credentials never reach the repo.
```

All entry points (`uvicorn`, `alembic`, `pytest`) automatically load this file
via `python-dotenv` (called once in `db/engine.py`), so no manual `export` is
needed. `DATABASE_URL`, `POSTGRES_USER` and `POSTGRES_PASSWORD` are mandatory
— the app and `docker compose` both fail fast with a clear message if missing.

## 3) Start local PostgreSQL

```bash
docker compose up -d         # postgres on :5432, pgadmin on :5050
alembic upgrade head
```

## 4) Start the scan API

```bash
uvicorn api.main:app --reload
```

Then test:
- `GET http://127.0.0.1:8000/health`
- `POST http://127.0.0.1:8000/scan` (multipart image file)

## 5) Run a CLI scan demo

```bash
python scripts/run_scan_demo.py --image /path/to/beer-photo.jpg
```

## 6) Train YOLOv8

```bash
python ml/train.py --data /path/to/data.yaml --epochs 50 --imgsz 640 --batch 16
```

Use a trained model for inference:
```bash
python scripts/run_scan_demo.py --image ./sample.jpg --model runs/detect/train/weights/best.pt
```

## Optional: CPU-only PyTorch install (to avoid large CUDA downloads)

```bash
pip install --index-url https://download.pytorch.org/whl/cpu torch torchvision
```

Run this before `pip install -e ".[ml,dev]"` if you do not need GPU.

## Development governance

Development-agent behavior is documented in `docs/AGENT.md`.
