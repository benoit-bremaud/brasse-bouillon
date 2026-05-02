# scan-photos — local manual test photos

Local-only directory for **real beer label photos** used to manually
exercise the `POST /scan` endpoint end-to-end. Photos themselves are
**never committed** (1–5 MB each, personal data, low repository value);
only the folder structure + this README + the findings log are version
controlled.

## Why this exists

Until a YOLO checkpoint is trained and a mobile barcode scanner ships
(see issue #803 and the PR2.5a chantier), the only way to validate the
full ML pipeline (`infer.py` → `ocr.py` → `extract.py` → `recommender.py`)
on real-world input is to capture photos by hand and feed them to the
`/scan` route locally. This folder centralises those photos so they
are easy to find, easy to re-run after pipeline changes, and easy to
augment over time.

## Suggested naming convention

No enforcement, but to navigate the folder after several sessions:

```
YYYY-MM-DD_<beer-slug>_<face>.jpg
```

Examples:

```
2026-05-02_pelforth-brune_front.jpg
2026-05-02_chouffe-blonde_back.jpg
2026-05-02_unknown-craft-no-name.jpg
```

Where:

- `YYYY-MM-DD` — capture date, helps sort the folder chronologically.
- `<beer-slug>` — descriptive name; use `unknown-...` when the goal of
  the test is precisely to see what the OCR pipeline guesses.
- `<face>` — `front`, `back`, `top` or `macro`.

## Workflow

1. Take a photo on a phone (Android: JPEG by default; iPhone: configure
   *Settings → Camera → Formats → Most Compatible* to get JPEG instead
   of HEIC, otherwise convert before transfer).
2. Transfer the photo into this folder by any means (USB, KDE Connect,
   Telegram desktop, Quick Share, …).
3. Tell the assistant: *"new photo added"* or *"check the scan-photos
   folder"*. The assistant will `ls` the folder, run `curl -X POST
   /scan -F file=@<path>` for each fresh entry, parse the JSON
   response, and compare against the human-readable label.
4. Findings are appended to [`findings.md`](./findings.md) as a session
   log: ground truth (what the label actually says), pipeline output,
   delta, observations.

## What is `.gitignore`d

Everything in this directory **except**:

- `.gitignore`
- `README.md` (this file)
- `findings.md` (the persistent test log)

Verify with `git check-ignore -v packages/beer-encyclopedia/scan-photos/<filename>`.

## Cleanup policy

Photos accumulate over time. Manage manually for now: once `findings.md`
references the relevant takeaways, the source photo can usually be
deleted. The folder is not meant to grow into a long-term archive — for
that, ingest curated entries into the encyclopedia DB (see the
upcoming book-ingestion pipeline in issue #857).

## Out of scope

- **Test fixtures committed to the repo for CI**: a separate pattern
  (small, license-clear photos under `tests/fixtures/`) handled in a
  later issue when the YOLO training dataset workflow lands.
- **Photo storage as `Media` rows in the DB**: that is the responsibility
  of the community contribution loop (PR3, issue #803), not this manual
  testing folder.

## References

- [`api/routers/scan.py`](../api/routers/scan.py) — endpoint we exercise
- [`ml/pipeline.py`](../ml/pipeline.py) — orchestration
- [`ml/schemas.py`](../ml/schemas.py) — `ScanResponse` shape
- [`docs/dataset/DATASET_STRATEGY_SPRINT1.md`](../docs/dataset/DATASET_STRATEGY_SPRINT1.md)
  — broader dataset strategy this folder is a stepping stone toward
