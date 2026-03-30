# Legal Image Collection Playbook V1 (Sprint 1)

> This document is an operational guideline for dataset governance.
> It is not legal advice.

## Objective

Collect a legally compliant pilot dataset (100 images) with full traceability,
ready for annotation and Sprint 1 training.

## Target outputs

At the end of collection, you must have:

1. `dataset_manifest.csv` with one row per image.
2. Legal evidence files referenced by `evidence_ref`.
3. Images stored under dataset splits (`train`, `val`, `test`).

## Scope and source policy

### Allowed source categories

1. Public datasets with explicit reusable license.
2. Self-produced photos.
3. Partner-provided images with written permission.

### Forbidden source categories

1. Copyrighted images with unknown or restrictive terms.
2. Protected platforms with no training usage rights.
3. Images downloaded from pages that explicitly forbid reuse.
4. Watermarked samples that cannot be legally reused.

---

## Step-by-step process

## 1) Prepare local legal-evidence workspace

Inside your local dataset root, create:

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
├── evidence/
│   ├── source-pages/
│   └── permissions/
├── dataset_manifest.csv
└── data.yaml
```

## 2) Perform source-level pre-check

Before downloading any image, confirm:

1. License/terms are explicit.
2. Model-training usage is allowed.
3. Redistribution requirements are known (attribution, etc.).

If one item is unclear, do not collect from that source.

## 3) Capture legal evidence first

For each source, save evidence files in `evidence/source-pages/`:

- source URL snapshot (HTML/PDF/screenshot)
- license text snapshot
- collection date

For partner content, store written authorization in
`evidence/permissions/`.

## 4) Download candidate images

Rules:

1. Keep original source URL for each image.
2. Keep deterministic file naming (e.g. `img_0001.jpg`).
3. Reject corrupted, heavily watermarked, or unusable files.

## 5) Register each image in `dataset_manifest.csv`

Required fields (must be non-empty):

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

Optional fields:

- `style_hint`
- `notes`

Use `usage_allowed` values:

- `yes` -> approved for training
- `no` -> rejected
- `pending` -> requires legal clarification (do not use in training)

## 6) Apply image-level legal decision gate

An image is accepted only if all are true:

1. explicit source/license captured
2. `usage_allowed == yes`
3. `evidence_ref` points to an existing proof file

Otherwise, exclude image from training set.

## 7) Build pilot split (100 images)

Recommended split for pilot:

- `train`: 80
- `val`: 10
- `test`: 10

## 8) Pre-annotation legal QA checklist

Before annotation starts, verify:

- 100% accepted images have `usage_allowed=yes`
- 100% accepted images have valid `evidence_ref`
- no forbidden source category appears in accepted rows

## 9) Handoff to annotation and sanity checks

Then continue with:

1. `docs/dataset/ANNOTATION_GUIDELINES_V1.md`
2. `docs/dataset/BATCH1_WORKFLOW.md`
3. `python scripts/dataset_sanity_check.py --dataset /absolute/path/to/dataset`
