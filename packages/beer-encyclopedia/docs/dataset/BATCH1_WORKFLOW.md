# Batch 1 Workflow (Collection + Annotation + Validation)

## Goal

Prepare a first legal and annotation-consistent dataset batch for Sprint 1 detection training.

## 1) Local dataset structure

Create and maintain the dataset structure below:

```text
dataset/
├── images/
│   ├── train/
│   ├── val/
│   └── test/
├── labels/
│   ├── train/
│   ├── val/
│   └── test/
└── data.yaml
```

> For Sprint 1 sanity checks, `train/` and `val/` are required under both `images/` and `labels/`.

## 2) Source traceability (mandatory)

Copy `data/templates/dataset_manifest.template.csv` into your dataset root and
use it as the working per-image source registry:

```bash
cp data/templates/dataset_manifest.template.csv \
  /absolute/path/to/dataset/dataset_manifest.csv
```

### Required fields

- `image_path`
- `split`
- `source_type`
- `source_name`
- `source_url`
- `license`
- `usage_allowed`
- `evidence_ref`
- `collected_by`
- `collected_at`

### Optional fields

- `style_hint`
- `notes`

Rules:

1. `usage_allowed` must be `yes` before using an image for training.
2. Keep `evidence_ref` pointing to proof files (for example under
   `dataset/evidence/`).
3. If rights are unclear, exclude the image from the dataset.

## 3) Annotation process

Apply `docs/dataset/ANNOTATION_GUIDELINES_V1.md` strictly.

Operational checklist:

1. Annotate only visible main commercial labels.
2. Keep one YOLO `.txt` per image with matching base filename.
3. Use class id `0` for all boxes in Sprint 1 (`beer_label`).
4. Empty label files are valid for negative images.

## 4) Batch validation

Run sanity validation before any training:

```bash
python scripts/dataset_sanity_check.py --dataset /absolute/path/to/dataset
```

Expected outcome:

- `Status: OK`
- No missing required split directories
- No invalid YOLO lines
- No unreadable label files

## 5) Training handoff

Use a dataset-local `data.yaml` generated from the Sprint 1 template:

```bash
cp data/templates/data.sprint1.yaml /absolute/path/to/dataset/data.yaml
```

Then update the `path` field in `/absolute/path/to/dataset/data.yaml` to point
to your dataset root and run baseline training:

```bash
python ml/train.py --data /absolute/path/to/dataset/data.yaml --epochs 50 --imgsz 640 --batch 16
```

Then record:

- best weights path
- key metrics (mAP)
- top failure patterns
