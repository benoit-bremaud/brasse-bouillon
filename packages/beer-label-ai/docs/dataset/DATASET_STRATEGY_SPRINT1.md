# Dataset Strategy — Sprint 1

## Objective

Build a legally safe, annotation-consistent, and training-ready dataset for first YOLOv8 baseline.

## Scope

- Task type: object detection (`beer_label` bounding box)
- Optional metadata file: style class from Taxonomy V1
- Split target: `80 / 10 / 10` (train / val / test)

## Data sources policy

### Allowed sources

1. Public datasets with explicit reusable license
2. Self-produced photos
3. Partner-provided images with written permission

### Forbidden sources

1. Copyrighted images with unknown or restrictive terms
2. Images scraped from protected sources without usage rights
3. Watermarked samples that cannot be legally reused

## Dataset directory standard

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

## Quality requirements (Sprint 1)

1. Minimum first batch target: `400–800` images
2. Label visibility diversity:
   - front labels
   - angled views
   - reflective surfaces
   - low light cases
3. Duplicate control:
   - perceptual duplicate check preferred
4. Annotation review:
   - review at least 10% random sample before training

## Compliance checklist

Before adding images to training:

- [ ] Source and license recorded
- [ ] Usage allowed for model training
- [ ] No legal ambiguity
- [ ] File quality acceptable (not corrupted)

## Risks and mitigation

- Risk: legal uncertainty on web images
  - Mitigation: maintain source registry and license proof
- Risk: noisy boxes
  - Mitigation: annotation guideline + spot review
- Risk: class imbalance
  - Mitigation: monitor per-class counts and rebalance collection
