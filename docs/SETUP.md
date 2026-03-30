# Quick Setup (PoC/MVP)

## 1) Install Python dependencies

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r ml/requirements.txt
```

## 2) Start the scan API

```bash
uvicorn api.main:app --reload
```

Then test:
- `GET http://127.0.0.1:8000/health`
- `POST http://127.0.0.1:8000/scan` (multipart image file)

## 3) Run a CLI scan demo

```bash
python scripts/run_scan_demo.py --image /path/to/beer-photo.jpg
```

## 4) Train YOLOv8

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

Run this before `pip install -r ml/requirements.txt` if you do not need GPU.

## Development governance

Development-agent behavior is documented in `docs/AGENT.md`.
