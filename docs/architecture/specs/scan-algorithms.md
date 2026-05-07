# Scan algorithms — barcode + panoramic label

> **Status:** specification — implementation pending. Driven by epic [#934](https://github.com/benoit-bremaud/brasse-bouillon/issues/934) (barcode enrichment) and epic [#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) (panoramic capture).

> ⚠️ **Backend ownership per [ADR-0005](../decisions/0005-backend-split-encyclopedia-vs-product.md)** — the **Python beer-encyclopedia** owns every catalog-related concern (`scan_catalog_items`, `beer_data_suggestions`, `panoramic_capture`, the OpenCV stitching service, server-side OCR, Claude vision orchestration, the web-search enrichment pipeline). The **NestJS API** owns user-side concerns only (auth, sessions, the `notifications` table, the maintainer's review actions exposed to the mobile app — which proxy to Python). The mobile app is allowed to talk to **both** backends, per ADR-0005's relaxation of ADR-0002. Wherever this spec says "backend", read "Python beer-encyclopedia" unless explicitly stated otherwise. The current NestJS `scan/` module is **transitional** and on a deprecation roadmap (ADR-0005 §Roadmap).

## 1. Vocabulary

A single source of truth for the terms used across this spec, the codebase, the issue tracker, and the mobile UI copy. **Use these terms verbatim**; do not paraphrase in code or in user-facing strings.

| Term (FR) | Term (EN) | Definition |
|---|---|---|
| Scan code-barre | Barcode scan | Reading the EAN-13 / UPC barcode of a beverage container with the camera. The default first action of the scan feature. |
| Scan d'étiquette | Label scan | The fallback / complement to barcode scan when barcode data is missing or insufficient. Captures the label visually via the panoramic algorithm below. |
| Scan panoramique | Panoramic scan | Synonym of "scan d'étiquette". Refers specifically to the rotational capture algorithm: the user rotates the bottle while the app takes a continuous burst of photos and stitches them into one panoramic image of the label. |
| Bouclage / fermeture de boucle | Loop closure | The moment the panoramic algorithm detects that the current frame matches a previously captured frame (typically the very first one), proving the user has done a full 360° rotation. Triggers automatic end-of-capture. |
| Mosaïque cumulative | Cumulative mosaic | The progressively-built panoramic image, updated each time a new frame is added. Powers the live progress indicator on screen. |
| Image-clé | Keyframe | A single still extracted from the capture burst that is judged sharp + non-redundant + visually informative (front face, back face, neck, etc.). Used to feed the multimodal AI step and stored for the admin review screen. |
| OCR | OCR | Optical Character Recognition: extracting text from a captured image. Runs in two stages: live on-device (UX feedback), final on-server (high accuracy). |
| BB | Brasse-Bouillon | The product as a whole, and shorthand for "the BB-controlled databases" (whichever backend currently owns a given table). |
| OFF | OpenFoodFacts | The public open-data product database used as the first lookup source for barcode scans. "OFF 404" = OpenFoodFacts has no record for that EAN. |
| Ratio de complétude | Completeness ratio | A score in `[0..1]` measuring how full a `scan_catalog_items` row is. Computed as `Σ weight(field) · isPresent(field) / Σ weight(field)`. Drives whether enrichment / panoramic prompt fires. |
| Seuil de complétude | Completeness threshold | The minimum acceptable ratio (env var `SCAN_COMPLETENESS_THRESHOLD`, default `0.5`). Below this value, the enrichment pipeline runs and the panoramic-label prompt is offered. |
| Suggestion | Suggestion | An auto-generated enrichment proposal stored in `beer_data_suggestions`. Lives in `PENDING` until the maintainer (Benoît) explicitly approves, refuses, refines, or instructs. **Never written directly to `scan_catalog_items`.** |
| Enrichissement | Enrichment | The multi-source pipeline (Brave + 2nd web search + Claude) that produces a suggestion when completeness is too low. |
| Validation | Validation | The maintainer's act of reviewing a pending suggestion via one of the four actions: approve / refuse / refine / instruct. |
| Mainteneur | Maintainer | In MVP, Benoît (the application's creator). Single source of truth for validation. KYB / verified-brewery accounts are deferred to v0.3+. |

---

## 2. Decision tree — which scan mode runs when

```
                    ┌────────────────────────────────┐
                    │  User triggers the scan flow   │
                    └───────────────┬────────────────┘
                                    │
                                    ▼
                    ┌────────────────────────────────┐
                    │ Barcode scan (default first)   │
                    └───────────────┬────────────────┘
                                    │
                ┌───────────────────┴───────────────────┐
                │                                       │
                ▼                                       ▼
    ┌────────────────────────┐         ┌────────────────────────────┐
    │  No data anywhere      │         │  Some data found           │
    │  (BB miss + OFF 404)   │         │  (BB hit OR OFF returned)  │
    └────────────┬───────────┘         └─────────────┬──────────────┘
                 │                                   │
                 ▼                                   ▼
    ┌────────────────────────┐         ┌────────────────────────────┐
    │ AUTO-SWITCH to         │         │ Compute completeness ratio │
    │ Panoramic scan         │         └─────────────┬──────────────┘
    │ (no user prompt)       │                       │
    └────────────────────────┘            ┌──────────┴──────────┐
                                          │                     │
                                          ▼                     ▼
                              ┌─────────────────┐  ┌──────────────────────┐
                              │ ratio ≥ 0.5     │  │ ratio < 0.5          │
                              │ DISPLAY only    │  │ - Run enrichment     │
                              │ (no panoramic)  │  │   (Brave + 2nd + AI) │
                              └─────────────────┘  │ - Display partial    │
                                                   │ - Offer button       │
                                                   │   "Compléter via     │
                                                   │    scan d'étiquette" │
                                                   │   (user choice)      │
                                                   └──────────────────────┘
```

**Wording rules for the panoramic prompt:**

- When auto-switching (barcode returned nothing): no prompt, the camera flips silently to panoramic mode with a one-line banner explaining why ("*Aucun code-barre reconnu — capture l'étiquette*").
- When ratio is below threshold but barcode returned partial data: an explicit, non-blocking call-to-action ("*Données partielles. Veux-tu compléter via le scan d'étiquette ?*") with two buttons, **Continuer sans** / **Scanner l'étiquette**.
- When ratio is at or above threshold: no panoramic prompt at all, just the enriched card.

---

## 3. Panoramic scan algorithm — phase by phase

The panoramic flow is designed for **Expo Managed** (no eject, no custom dev client). This forces some of the heavier computer-vision work to the backend. The split is detailed under each phase.

### Phase 1 — Pre-capture (UX guidance)

**Goal:** make the user understand within 3 seconds *what to do*.

**Mobile:**

- Camera opens with a static SVG overlay of a bottle silhouette. The user is told to align the bottle with the silhouette.
- A live distance indicator analyses the bottle's vertical pixel coverage:
  - `< 40%` of frame height → "*Approche-toi un peu*"
  - `40–70%` → "*Distance optimale ✅*"
  - `> 70%` → "*Recule un peu, tout le label doit être visible*"
- A live blur indicator (Laplacian variance via on-device JS) shows a red dot if the frame is too blurry to capture. Fades to green when sharp.
- A "**Commencer**" button is enabled only when both indicators are green for ≥ 1 s.

**Why on-device:** the user cannot wait for backend round-trips during a guidance loop. All the heuristics here run in pure JS over `expo-camera` frames sampled at ~5 fps (we down-sample because we don't need 30 fps for guidance).

### Phase 2 — Burst capture

**Goal:** capture enough non-redundant, sharp frames to cover the full 360° of the label.

**Mobile:**

- On the user's "Commencer" tap, the app starts a continuous photo burst at 5–10 fps. Each photo is a JPEG ≤ 1024 px on the long side (smaller than full-resolution to keep memory + upload size reasonable).
- For each photo:
  1. Reject if Laplacian variance below threshold (blur).
  2. Compute a fast hash of the central region (e.g. perceptual hash). If hash is too close to any previous accepted frame, reject (deduplication).
  3. Otherwise add to the local frame array.
- Display a circular progress indicator that advances based on a heuristic estimate of rotation (using accelerometer/gyro data via `expo-sensors` to measure angular speed since "Commencer"). Not exact — this is just a progress hint, not the loop-closure detector.

**Constraints in Expo Managed:**

- We cannot run native frame processors (e.g. `react-native-vision-camera`'s `useFrameProcessor`). We rely on `expo-camera`'s `takePictureAsync` in a loop.
- The 5–10 fps target is realistic with Expo Managed; 30 fps is not.

### Phase 3 — Loop-closure detection (live, on-device)

**Goal:** detect that the user has done a full revolution and the latest frame visually matches the first frame, then end capture automatically.

**Algorithm:**

- Maintain a small reference set of the first 3 captured frames (the "anchor" set).
- For each new accepted frame, compute a perceptual hash + a small ORB-like feature signature in pure JS (a lightweight implementation suffices — we only need a coarse match).
- Compare the new frame against the anchor set:
  - If the match score crosses a threshold AND at least 12 frames have been captured (so we don't trigger on the very second frame), declare loop closure and stop the burst.
- Fallback exits:
  - 30-second timeout.
  - User's manual "**Terminer**" button (always visible during capture).

**Output of phases 2-3:**

- A list of 15–30 JPEGs locally on the device.
- Capture metadata: per-frame timestamp, gyro-derived angle estimate, perceptual hash.

### Phase 4 — Live OCR snapshot (UX-only feedback)

**Goal:** show the user that text is being detected so they trust the capture is working. No durable artifact.

- After every 5th accepted frame, run an async OCR pass on that frame using a pure-JS library (`tesseract.js` configured for French + English). The recognised text is shown briefly as a translucent overlay ("*Texte détecté: 'Brasserie Chouffe — Belgian Strong Ale'*").
- **This OCR result is NOT persisted.** It is purely UX feedback. The authoritative OCR runs server-side in phase 6.

### Phase 5 — Upload + final stitching (backend)

**Goal:** produce one high-quality panoramic image plus 2-3 keyframes from the raw frames the mobile uploaded.

**Mobile → backend handoff:**

- The mobile uploads the raw JPEG frames + capture metadata to a new endpoint hosted by the **Python beer-encyclopedia** (per ADR-0005): `POST /panoramic-captures` (FastAPI route, exact path TBD when the service is wired). Multipart upload, frames bundled in a single request (typical payload: 15 × ~80 KB = ~1.2 MB).
- The endpoint returns a `capture_id`; subsequent requests reference this id.

**Python beer-encyclopedia service:**

- A new service `PanoramicStitchingService` calls **OpenCV directly** (`opencv-python` is already a transitive dependency of the existing ML pipeline — YOLO + EasyOCR — so no new infra). No sub-process, no FFI: native Python in-process.
- OpenCV's `cv2.Stitcher_create(cv2.Stitcher_PANORAMA)` produces a single panoramic JPEG.
- A keyframe selector picks 2-3 representative frames from the burst (most likely: highest-text-density front, highest-text-density back, neck if detected). Algorithm: rank frames by detected text area + sharpness, then pick non-overlapping ones (using the gyro-derived angle estimates to avoid duplicates).
- Output:
  - `panorama.jpg` — saved to file storage with a stable URL.
  - `keyframe_{0,1,2}.jpg` — saved separately.
  - `stitching_metadata` — the per-frame transformations OpenCV computed (useful for debugging).

**Why Python:** beer-encyclopedia is the canonical home for catalog + ML work per ADR-0005. OpenCV is a first-class dependency there. NestJS would have required Node FFI or sub-process — Python avoids all of that.

### Phase 6 — Server-side OCR

**Goal:** extract structured text from the stitched panorama and the keyframes.

- Send `panorama.jpg` + each keyframe to **Google Cloud Vision OCR** (fully managed, ~$1.50 per 1000 pages, robust on French + English + decorative fonts).
- For each image: collect both raw text and bounding boxes.
- Concatenate raw texts (deduplicating obvious repeats) → final OCR text blob.
- Output: `{ ocr_text: string, blocks: BoundingBox[] }`.

### Phase 7 — Multimodal AI structuring (Claude vision)

**Goal:** turn the OCR text + visual context into a structured `Partial<ScanCatalogItem>`.

- Single call to Claude with:
  - System prompt instructing strict JSON output with the catalog schema.
  - User content: the OCR text blob + the panorama image + the keyframes (multimodal).
- Schema (see [§ 4](#4-data-model-impact)):

  ```json
  {
    "name": { "value": "...", "confidence": 0.95 },
    "brewery": { "value": "...", "confidence": 0.92 },
    "abv": { "value": 8.0, "confidence": 0.99 },
    "ibu": { "value": 22, "confidence": 0.4 },
    "color_ebc": { "value": 12, "confidence": 0.55 },
    "fermentation_type": { "value": "ALE", "confidence": 0.8 },
    "ingredients_text": { "value": "...", "confidence": 0.9 },
    "generic_name": { "value": "...", "confidence": 0.85 },
    "country": { "value": "...", "confidence": 1.0 }
  }
  ```

- For fields with `confidence < 0.7`, mark them as needing web-search verification (consumed by the next phase).

### Phase 8 — Web-search verification + suggestion creation

**Goal:** consolidate low-confidence fields with two web sources, then materialise a `BeerDataSuggestion` in the **Python beer-encyclopedia** (the catalog owner per ADR-0005).

This phase is **shared with the barcode-enrichment pipeline** ([epic #934, sub-issue #938](https://github.com/benoit-bremaud/brasse-bouillon/issues/938)). The only difference is the seed (OCR-derived vs OFF-derived). The downstream code path is identical:

1. For each low-confidence field, run a Brave Search and a 2nd-source web search; consolidate per the rules in #938.
2. The Python service persists a `BeerDataSuggestion` with:
   - `catalog_item_id` referencing a **newly created** `scan_catalog_items` row (`barcode = NULL`, `source = 'panoramic'`, panorama URL stored in `image_url`).
   - `proposed_fields` = all fields with their final consolidated values.
   - `source_summary` = per-field provenance (`["ocr+ai", "web1", "web2"]` etc.).
   - `confidence` = average of per-field confidences.
3. The Python service POSTs a `SuggestionCreated` webhook to NestJS → NestJS writes a row in its own `notifications` table → maintainer notified in-app via the polling loop of [#939](https://github.com/benoit-bremaud/brasse-bouillon/issues/939). The split (Python emits, NestJS notifies) keeps the `notifications` table next to the `users` table where it belongs (ADR-0005).

**Cross-backend reconciliation note for epic #934:** the original epic was filed before this spec sized up the ADR-0005 implications. The data model + endpoints in #934/#937/#938 must move from NestJS to Python beer-encyclopedia. This is non-blocking for the spec but should be tracked as an explicit follow-up issue under #934.

### Phase 9 — Maintainer review

Identical to [#940](https://github.com/benoit-bremaud/brasse-bouillon/issues/940). The review screen displays the panorama and the keyframes alongside the catalog/suggestion diff so the maintainer can sanity-check what the algorithm "saw".

---

## 4. Data model impact

In addition to the columns added by epic #934, the panoramic feature introduces:

All new entities below live in the **Python beer-encyclopedia** (Postgres) per ADR-0005. The current NestJS `scan_catalog_items` (SQLite, `barcode` `NOT NULL`) is a transitional artefact and stays as-is; the equivalent Python table is the canonical home going forward.

### 4.1 `scan_catalog_items` (Python / Postgres) — schema requirements

- `source` enum includes `panoramic` (alongside `seed`, `openfoodfacts`, `manual`).
- **`barcode` is `NULLABLE`** in the Python table (in contrast with the legacy NestJS table where it is `NOT NULL`). This is a **required schema property** of the Python catalog — the panoramic flow creates rows with no barcode.
- `image_url` stores the panorama URL when `source = 'panoramic'`.

### 4.2 New entity `panoramic_capture` (Python / Postgres)

| Column | Type | Notes |
|---|---|---|
| `id` | UUID, PK | |
| `catalog_item_id` | FK → `scan_catalog_items.id` | The catalog row this capture produced |
| `triggered_by_request_id` | UUID, nullable | The originating barcode-scan request (if any). Cross-backend reference; not a hard FK because `scan_requests` lives in NestJS for now |
| `panorama_url` | text | URL of the stitched output |
| `keyframe_urls` | `jsonb` | `[url1, url2, url3]`. `jsonb` is correct because Python beer-encyclopedia runs on Postgres (the current NestJS-side SQLite would have used `text` JSON-serialised — that compromise is irrelevant here since this entity lives in Python only) |
| `frame_count` | int | Number of raw frames the user captured |
| `loop_closure_detected` | bool | `true` if phase 3 ended capture, `false` if timeout/manual |
| `gyro_total_angle_deg` | real, nullable | Sum of gyro-estimated rotation, sanity-check |
| `submitted_by_user_id` | UUID, nullable | Cross-backend reference to `users.id` (NestJS); not a hard FK |
| `created_at` | timestamp | |

The captured raw frames themselves are **not** persisted — only the stitched output and the 2-3 keyframes survive (per the storage decision: *Panorama final + 2-3 keyframes*).

---

## 5. UX copy (canonical strings)

All user-facing strings stay French (per the project's "UI stays French" rule). Anchor copy below; treat as canonical until product writes a final tone pass.

### Pre-capture screen

- Title: **Capture l'étiquette**
- Subtitle: *"Tiens la bouteille devant la caméra. Aligne-la avec la silhouette."*
- Distance hints: *"Recule un peu"*, *"Approche-toi"*, *"Distance optimale ✅"*
- Blur hint: *"Stabilise la prise de vue ✋"*
- Primary CTA: **Commencer**

### During capture

- Top banner (when triggered automatically because barcode missed): *"Aucun code-barre reconnu — capture l'étiquette à la place."*
- Top banner (when triggered after low ratio): *"Données partielles. Capture l'étiquette pour compléter."*
- Live coaching:
  - 0–30%: *"Tourne doucement la bouteille vers la droite →"*
  - 30–70%: *"Continue, tu y es presque..."*
  - 70–95%: *"Encore un peu, on touche au but"*
  - 95–100%: *"Reviens au point de départ pour fermer la boucle"*
  - 100% closed: **Capture terminée ✅**
- Manual exit: **Terminer**

### Post-capture (while phase 5–8 run)

- Title: **Analyse en cours...**
- Subtitle: *"On reconstruit l'étiquette puis on cherche les infos manquantes. ~10 secondes."*

### Post-suggestion

- Toast: *"Une suggestion est en attente de ta validation. Vérifie l'onglet 🔔."*

---

## 6. Tech stack constraints — Expo Managed pure

We commit to **staying in Expo Managed** for the mobile app (no eject, no custom dev client). The implications:

| Need | Expo Managed solution | Fallback if unavailable |
|---|---|---|
| Camera burst | `expo-camera` `takePictureAsync` in a loop at 5–10 fps | Acceptable. Higher fps would need `react-native-vision-camera` (not Managed). |
| Gyro / accelerometer | `expo-sensors` | Available out of the box. |
| Live OCR (UX feedback only) | `tesseract.js` configured for fr+en | Pure JS. May be slow on low-end phones; acceptable for a UX hint. |
| Loop-closure detection | Pure JS perceptual hash + lightweight feature compare | Simple; needs benchmarking on actual hardware. |
| Image stitching | **Backend only** (OpenCV via Python sub-process or Node FFI) | This is the deliberate choice. JS stitching is not production-ready. |
| Server OCR | Google Cloud Vision API (or equivalent) | Drop-in replacement is AWS Textract if Cloud Vision pricing becomes an issue. |
| Multimodal AI | Anthropic Claude with vision input (already an API in use) | Drop-in replacement is OpenAI GPT-4o vision; we keep the abstraction provider-agnostic. |
| Web search | Brave Search API + 2nd source (TBD in #938) | Same provider list as the barcode-enrichment epic. |

**Open: live stitching preview.** The user requested that the live progress indicator give a sense of "how much of the label has been captured". With pure-Managed Expo, we can't run native OpenCV stitching on-device for live preview. The chosen approach is a *gyro-derived* progress estimate (no live mosaic on screen — just a rotation gauge). If we need a real live mosaic later, we'd revisit the Expo Managed commitment.

---

## 7. Open implementation choices

These are deliberately deferred to the implementation issues. They do not block the spec from being approved.

1. **Server-side stitching backend technology:**
   - Option A: spawn a Python sub-process per request (`opencv-python` + `cv2.Stitcher`). Simple, high quality, +~100 ms cold-start.
   - Option B: Node FFI binding to OpenCV (e.g. `@u4/opencv4nodejs`). Lower latency, harder to deploy.
   - Option C: an external micro-service (FastAPI + OpenCV) running alongside the NestJS API. Cleanest separation, more infra.
   - Decision recorded in [#751 sub-issue](#9-implementation-roadmap) once benchmarked.

2. **2nd web-search provider:** Google Programmable Search Engine vs SerpAPI vs DuckDuckGo HTML. Decided in #938.

3. **Loop-closure threshold values:** `min_frames_before_closure = 12`, `match_score_threshold = 0.7`. Both are first-cut guesses; tune on real captures during the spike.

4. **Frame upload chunking:** if total payload exceeds 5 MB, switch to chunked upload (signed URLs). Probably not needed for 15 × 80 KB but document the constraint.

---

## 8. Risks & mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| `expo-camera` `takePictureAsync` is too slow at 10 fps on mid-range Android phones | Med | High | Tech-spike before committing; fallback to 5 fps which still works for a 360° rotation in ~6 s. |
| `tesseract.js` blocks the JS thread and freezes the UI during live OCR | Med | Med | Run OCR in a Web Worker via `expo-workers` or skip live OCR entirely (keep loop-closure as the only live feedback). |
| OpenCV stitching produces a distorted output for very curved labels (e.g. small 250 mL bottles) | Low | Med | Validate on diverse bottles during the spike; document known-bad shapes; offer a "manual capture" fallback (one photo per face). |
| Cloud Vision OCR + Claude vision per scan costs ≥ €0.05 | Med | Low | Cap enrichment frequency per user (#942), cache results, surface per-day cost in #942. |
| User stops mid-rotation and the partial panorama is unusable | Low | Med | Detect short captures (< 12 frames) and either retry or fall back to "show what we have, no enrichment". |
| Loop-closure false-positives on label patterns that legitimately repeat (e.g. La Trappe with 4 identical motifs) | Low | Med | Combine perceptual hash with feature matching, not just one signal; minimum frame threshold reduces risk. |

---

## 9. Implementation roadmap (sub-issues to file under #751)

The barcode-side roadmap lives in epic #934. The panoramic-side roadmap lives in epic #751. The proposed sub-issues under #751:

| # | Title | Phase covered | Depends on |
|---|---|---|---|
| 751-1 | Tech-spike: benchmark `expo-camera` burst rate, perceptual-hash JS perf, `tesseract.js` blocking on real Android + iOS devices | — | — |
| 751-2 | Pre-capture screen: silhouette overlay, distance + blur indicators, "Commencer" CTA | Phase 1 | 751-1 |
| 751-3 | Burst capture loop + frame deduplication + gyro progress gauge | Phase 2 | 751-1 |
| 751-4 | Loop-closure detection (perceptual hash + feature compare) + manual end button | Phase 3 | 751-3 |
| 751-5 | Backend stitching service + frame upload endpoint | Phase 5 | — |
| 751-6 | Backend OCR via Cloud Vision integration | Phase 6 | 751-5 |
| 751-7 | Multimodal Claude pass + handoff to the shared enrichment pipeline | Phase 7–8 | #938, 751-6 |
| 751-8 | New `panoramic_capture` entity + linkage to `scan_catalog_items` | Phase 5–8 | 751-5 |
| 751-9 | Decision-tree wiring on the mobile side (auto-switch vs prompt vs no panoramic) | § 2 | #936, 751-2 |

The two epics converge at sub-issues #938 (shared pipeline) and #940 (shared review screen).

---

## 10. Out of scope (not now)

- Stitching for non-cylindrical containers (cans, growlers, bag-in-box).
- Multi-angle or 3D capture (top, bottom).
- Real-time collaborative review (more than one maintainer at once).
- Machine learning that learns from the maintainer's approve/refuse decisions to auto-approve high-confidence suggestions.
- Push notifications. The MVP relies on in-app polling per #939.
- Verified-brewery accounts (KYB).

---

## 11. References

- Epic [#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) — Smart bottle photo capture
- Epic [#934](https://github.com/benoit-bremaud/brasse-bouillon/issues/934) — Barcode enrichment with maintainer validation
- [`packages/api/src/scan/services/openfoodfacts.client.ts`](../../../packages/api/src/scan/services/openfoodfacts.client.ts) — current barcode flow
- [`packages/mobile-app/src/features/scan/presentation/BeerInfoCardScreen.tsx`](../../../packages/mobile-app/src/features/scan/presentation/BeerInfoCardScreen.tsx) — current scan result screen
- OpenCV Stitcher documentation: <https://docs.opencv.org/4.x/d2/d8d/classcv_1_1Stitcher.html>
- Google Cloud Vision OCR pricing: <https://cloud.google.com/vision/pricing>
- Anthropic vision API: <https://docs.anthropic.com/en/docs/build-with-claude/vision>
