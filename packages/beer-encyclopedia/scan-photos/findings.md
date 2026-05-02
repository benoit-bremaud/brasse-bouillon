# scan-photos — manual test session log

Persistent log of `/scan` endpoint test sessions against real beer
label photos collected in this folder. Each session captures **what
was tested**, **what the pipeline returned**, and **what we learned**
— so future contributors can see how the ML accuracy evolves over
time and what the recurring failure modes are.

## Format

One H2 section per test session, dated. Within a session, one H3 per
photo. Within a photo, three subsections:

- **Ground truth** — what a human reading the label sees (for
  comparison).
- **`/scan` output** — relevant fields from the JSON response.
- **Observations** — what worked, what failed, hypotheses, follow-up
  issues to open.

Sessions are append-only — never edit past entries, only add new
ones. Treat this file like an experimental notebook.

## Sessions

<!-- Add new sessions below this line, most recent on top. -->

---

## 2026-05-02 — Session 1 (template)

First test session against the live `/scan` endpoint after merging
PR #847 (Open Food Facts connector) and PR #848 (DB-first lookup).
The encyclopedia pipeline runs in **full-image fallback** mode (no
YOLO checkpoint trained yet), so detection is the entire frame and
EasyOCR is asked to read everything.

Goal: surface the regex extractor's weak spots on real-world labels
before committing time to PR2.5a (live barcode scanner).

### Photo 1 — pending

- **File**: `<filename to be added>`
- **Ground truth**: _(to fill after capture)_
- **`/scan` output**: _(to fill after running the endpoint)_
- **Observations**: _(to fill after analysis)_
