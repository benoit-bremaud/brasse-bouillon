# Sprint 1 Execution Plan (Dataset + Baseline Training)

## Sprint goal

Deliver a training-ready dataset baseline and first YOLOv8 detection model metrics.

## Priority order

### P0 — Must Have

1. Confirm taxonomy V1 (`docs/dataset/TAXONOMY_V1.md`)
2. Enforce data source and legal policy (`docs/dataset/DATASET_STRATEGY_SPRINT1.md`)
   - Collection playbook:
     `docs/dataset/LEGAL_COLLECTION_PLAYBOOK_V1.md`
3. Apply annotation rules (`docs/dataset/ANNOTATION_GUIDELINES_V1.md`)
4. Build first annotated batch (target: 400–800 images)
   - Operational guide: `docs/dataset/BATCH1_WORKFLOW.md`
   - Source registry template:
     `data/templates/dataset_manifest.template.csv`
5. Validate dataset with:
   ```bash
   python scripts/dataset_sanity_check.py --dataset /absolute/path/to/dataset
   ```
6. Train baseline model:
   ```bash
   python ml/train.py --data /absolute/path/to/dataset/data.yaml --epochs 50 --imgsz 640 --batch 16
   ```
   - Create dataset-local `data.yaml` from:
     `data/templates/data.sprint1.yaml`
   - Update `path` in `data.yaml` before training
7. Save baseline outputs and report:
   - best weights path
   - mAP metrics
   - top failure patterns

### P1 — Should Have

1. Rebalance underrepresented classes if needed
2. Improve annotation consistency on flagged subsets
3. Retry baseline with tuned parameters (if mAP below target)

### P2 — Could Have

1. Prepare OCR-focused error bucket for Sprint 2
2. Create candidate backlog for recommendation model improvements

## Acceptance criteria

- Dataset sanity script returns `Status: OK`
- Baseline training completed successfully
- Metrics and error analysis documented
- Next actions prepared for Sprint 2

## Suggested branch workflow for Sprint 1

- `feat/dataset-sprint1-foundation` (current)
- then split into follow-up branches if needed:
  - `feat/dataset-collection-batch1`
  - `feat/dataset-annotation-review`
  - `feat/train-baseline-report`
