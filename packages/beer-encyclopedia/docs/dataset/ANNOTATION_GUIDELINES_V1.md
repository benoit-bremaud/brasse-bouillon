# Annotation Guidelines V1 (Beer Label Detection)

## Goal

Create consistent YOLO bounding boxes for `beer_label` detection.

## Annotation target

- Class name: `beer_label`
- One bounding box per visible main label

## Bounding box rules

1. Include the full visible label boundary.
2. Do not include unrelated bottle background if avoidable.
3. If label is partially occluded, annotate only visible part.
4. Ignore tiny unreadable labels that are not the main commercial label.
5. If multiple bottles are present:
   - annotate each clearly visible main label

## Ambiguous cases

- If no label is visible: do not annotate box.
- If label is too blurry to localize confidently: skip image or flag for review.

## Minimum quality checks

- Box corners aligned with label area
- No negative width/height
- No duplicated boxes for same label

## Review protocol

- Reviewer checks at least 10% sampled images.
- If error rate > 5%, perform corrective pass on full batch.

## Annotation export

- Export format: YOLO detection
- Keep file/image base names synchronized
