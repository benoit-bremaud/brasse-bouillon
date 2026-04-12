# Brasse-Bouillon Beer Label AI

AI project to scan beer bottle/can labels and recommend Brasse-Bouillon recipes that best match the detected profile.

## MVP Goal
- Label detection (YOLOv8)
- Text extraction (EasyOCR)
- Top-3 recipe ranking based on style/ABV/IBU

## Project Structure
- `api/`: backend API (`/health`, `/scan`)
- `ml/`: training, inference, OCR, extraction, recommendation
- `data/`: datasets and sample assets (`recipes.sample.json`)
- `scripts/`: utility scripts (scan demo)
- `docs/`: technical docs and roadmap
- `tests/`: automated tests

## Quickstart
See `docs/SETUP.md`.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r ml/requirements.txt
uvicorn api.main:app --reload
```

## MVP Scan Pipeline
1. Detect label regions (YOLOv8 if a model is provided, full-image fallback otherwise)
2. Run OCR on detected regions
3. Extract structured fields (`name`, `style`, `abv`, `brewery`)
4. Return top-3 recipe recommendations with explainable scores

## Example
```bash
python scripts/run_scan_demo.py --image /path/to/beer-photo.jpg
```

## Roadmap
See `docs/ROADMAP.md`.

## Development Agent Governance
See `docs/AGENT.md` for the development-agent collaboration rules.


## Sprint 1 Dataset Assets

- Taxonomy: `docs/dataset/TAXONOMY_V1.md`
- Dataset strategy: `docs/dataset/DATASET_STRATEGY_SPRINT1.md`
- Legal collection playbook:
  `docs/dataset/LEGAL_COLLECTION_PLAYBOOK_V1.md`
- Annotation rules: `docs/dataset/ANNOTATION_GUIDELINES_V1.md`
- Execution plan: `docs/dataset/SPRINT1_EXECUTION_PLAN.md`
- Batch 1 operational workflow: `docs/dataset/BATCH1_WORKFLOW.md`
- Source registry template:
  `data/templates/dataset_manifest.template.csv`
- Dataset sanity check:

```bash
python scripts/dataset_sanity_check.py --dataset /absolute/path/to/dataset
```
