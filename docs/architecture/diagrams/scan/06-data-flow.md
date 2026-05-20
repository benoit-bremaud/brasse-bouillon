# Data flow diagram — scan — bytes, fields, and PII

> **Feature**: epics [#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) (panoramic) + [#934](https://github.com/benoit-bremaud/brasse-bouillon/issues/934) (barcode).
> **Source specs**: [`scan-algorithms.md`](../../specs/scan-algorithms.md) §3 phases 5-8 (server-side pipeline), §4 (data model).
> **Related ADRs**: [ADR-0003](../../decisions/0003-consent-single-source-of-truth.md) (consent + privacy), [ADR-0005](../../decisions/0005-backend-split-encyclopedia-vs-product.md).

## Context

Where does each piece of data come from, where does it go, which fields are sensitive? This diagram is the **PII inventory** for the scan feature. Every edge that carries a sensitive field is annotated `PII: <field>` so a privacy review cannot miss it.

This diagram exists because PR [#996](https://github.com/benoit-bremaud/brasse-bouillon/pull/996)'s tech-spike harness leaked `Constants.deviceName` (e.g. *"Alice's iPhone"*) into a JSON payload shared via the OS share sheet. A data flow diagram drawn before the spike would have made that leak structurally visible. This is the diagram that catches that class of bug at design time.

This diagram does **not** show:

- Temporal ordering of the pipeline — see [02b end-to-end sequence](02b-sequence-end-to-end-pipeline.md).
- Component structure — see [03 component](03-component.md).
- Entity relationships — see [04 class](04-class.md).
- Session lifecycle — see [05 state](05-state-capture-session.md).

## Diagram

```mermaid
flowchart LR
    %% Sources
    User((User<br/>«Léa la curieuse»))
    Sensors[ExpoSensors<br/>gyro / accel]

    %% Mobile-side transformations
    Camera[expo-camera<br/>takePictureAsync]
    Stripper[EXIF stripper<br/>before-upload sanitiser]
    Hasher[PerceptualHash<br/>+ Laplacian variance]
    LocalArray[LocalFrameArray<br/>in memory]
    Multipart[multipart builder<br/>http-client.ts]

    %% Backend transformations
    Stitcher[OpenCV stitcher<br/>Python]
    CV[Cloud Vision<br/>OCR pipeline]
    Claude[Claude vision<br/>structuring]
    Brave[Brave + 2nd source<br/>web verify]

    %% Sinks
    PyDB[(Python Postgres<br/>scan_catalog_items<br/>panoramic_capture<br/>beer_data_suggestions)]
    Files[(Object storage<br/>panorama.jpg<br/>keyframe_*.jpg)]
    NestNotif[(NestJS<br/>notifications table)]

    %% Data edges — user → device
    User -->|raw photo bytes| Camera
    Camera -->|JPEG + EXIF<br/>(local URI)| Stripper
    Sensors -.->|angular speed<br/>**non-PII**| LocalArray

    %% Mobile pipeline
    Stripper -->|sanitised JPEG<br/>EXIF removed| Hasher
    Hasher -->|hash + sharpness score<br/>**non-PII**| LocalArray
    LocalArray -->|N JPEGs<br/>+ metadata| Multipart

    %% Edges leaving the device — ALL via http-client.ts
    Multipart -->|multipart POST<br/>frames + capture_id<br/>**PII: user_id (JWT-derived)**<br/>**PII: gyro path may correlate to location**| Stitcher

    %% Backend pipeline
    Stitcher -->|panorama JPEG<br/>+ keyframe JPEGs| Files
    Stitcher -->|stitching metadata<br/>**non-PII**| PyDB
    Files -->|panorama + 2-3 keyframes| CV
    CV -->|OCR text + boxes<br/>**non-PII (label content)**| Claude
    Claude -->|structured fields<br/>+ confidence per field<br/>**non-PII**| Brave
    Brave -->|verified field values<br/>**non-PII**| PyDB

    %% Cross-backend: webhook only (no DB write)
    PyDB -.->|SuggestionCreated webhook<br/>**PII: submitted_by_user_id**| NestNotif

    %% Anti-pattern edges — must NEVER happen (drawn dashed-red below)
    User -.->|raw EXIF (GPS) | Multipart
    Camera -.->|deviceName<br/>**PII LEAK**| Multipart

    %% Styling
    classDef source fill:#F4D35E,stroke:#333,color:#000
    classDef sink fill:#9CC,stroke:#333,color:#000
    classDef pii fill:#EE6C4D,stroke:#000,stroke-width:2px,color:#fff
    classDef forbidden stroke:#F00,stroke-width:3px,stroke-dasharray:6 3
    class User,Sensors,Camera source
    class PyDB,Files,NestNotif sink
```

## Notes

### PII inventory — what crosses the wire

The scan feature touches **three classes of data**:

| Class | Examples | Crosses BB system boundary? |
|---|---|---|
| **User identity** (PII) | `user_id` (UUID), `submitted_by_user_id`, JWT claims | Mobile → BB backends only. Never to Cloud Vision / Claude / Brave. |
| **Device / location signals** (PII) | EXIF GPS coordinates, `Constants.deviceName`, IP-derived geo, raw gyro path | **MUST be stripped at the mobile boundary** before upload. They never leave the device. |
| **Label content** (non-PII about the product) | OCR text, name, brewery, ABV, color, ingredients, panorama image | Crosses freely to Cloud Vision / Claude / Brave. About the bottle, not the user. |

### Hard rules this diagram encodes

1. **EXIF stripping is mandatory before upload.** The `EXIF stripper` node sits between `expo-camera` and the `multipart builder`. Any path that bypasses it (e.g. a feature module that uploads the raw `takePictureAsync` URI directly) leaks GPS + device metadata. The PR #996 tech-spike's `fetch(photo.uri).blob()` path bypassed this stripper — captured here as the dashed-red anti-pattern edge `User → Multipart` (raw EXIF).
2. **`Constants.deviceName` is never written into any outbound payload.** The dashed-red edge `Camera → Multipart (PII LEAK)` is the PR #996 bug made visible. Implementations that include `Constants.deviceName`, `Device.modelName` with user-set name, or any user-customisable device identifier in JSON / multipart body violate the diagram.
3. **External providers never see the `user_id`.** Cloud Vision, Claude, and Brave receive **only** the product-content data (panorama image, OCR text, brewery+name candidates). They never receive `user_id`, `device*`, or any identity field. The diagram has no arrow from `Multipart` (mobile-side) directly to any external provider — everything flows through `Stitcher` / `CV` / `Claude` / `Brave` server-side, and the Python backend is responsible for stripping identity before each external call.
4. **Cross-backend notification is identity-bearing.** The `SuggestionCreated` webhook from Python to NestJS carries `submitted_by_user_id` (so the notification can be addressed to the user). This is the **only** path where user identity crosses the package boundary. It stays within the BB system — never to external providers.

### Sinks and retention

| Sink | What lives there | Retention |
|---|---|---|
| Python Postgres (`scan_catalog_items`, `panoramic_capture`, `beer_data_suggestions`) | Catalog + capture metadata + pending suggestions | Indefinite (catalog is the product) |
| Object storage (panorama.jpg, keyframe_*.jpg) | Stitched panorama + 2-3 keyframes | Indefinite, tied to `panoramic_capture.id` |
| NestJS `notifications` table | Maintainer-facing alerts | Until acknowledged + read in-app |
| Cloud Vision / Claude | OCR / vision API calls — **may be retained per provider's policy** | Per provider; review terms before scaling |
| Brave + 2nd source | Web queries — provider-side logs | Per provider |
| Mobile `OfflineCapture` (filesystem + AsyncStorage) | Up to 3 captures with file_uris | 7 days TTL, max 5 retry attempts |

### Anti-patterns this diagram makes visible

- **Raw EXIF in upload** (dashed-red `User → Multipart`). PR #996 introduced this via `fetch(photo.uri).blob()` returning the raw file with EXIF intact. Fix in #996 is to insert the EXIF stripper.
- **`deviceName` in any payload** (dashed-red `Camera → Multipart`). PR #996 captured `Constants.deviceName` into the BenchmarkResult JSON that was then shared via the OS share sheet. The PII leak escaped Brasse-Bouillon's control entirely.
- **External provider receiving `user_id`.** No edge from `Multipart` to any external provider. If a future implementation calls Cloud Vision / Claude / Brave with the JWT or `user_id` in headers / body, it violates the diagram.
- **Direct database write from Python to NestJS.** The cross-backend transfer is a webhook (HTTPS POST), not a cross-database write. Per ADR-0005.
- **Mobile sharing a payload containing `user_id`.** The tech-spike share sheet in #996 is a "results out" path that crosses the device boundary. Anything shared via the OS share sheet must be stripped of identity (`Constants.deviceName` is the obvious one; `user_id` would be worse). The diagram does not show a share-sheet edge here because the tech-spike is throwaway code; the production scan flow never shares the raw payload.

### Open questions

- **EXIF stripper implementation** — Expo Managed has no first-class EXIF library. The candidates are `expo-image-manipulator` (which re-encodes the JPEG, stripping all metadata) or a JS-side EXIF rewriter. Decide before #946 — the simpler `expo-image-manipulator` approach has a re-encode cost worth measuring on the 5–10 fps target.
- **Cloud Vision / Claude retention** — both providers retain user content per their terms unless we explicitly opt out. Review for the soutenance demo (private data) vs production. Track under [#942](https://github.com/benoit-bremaud/brasse-bouillon/issues/942) cost monitoring + privacy policy.
- **Photo content beyond the label** — the panorama may capture faces or signs in the bar background. Should the mobile crop to a label-only region before upload? Open. Discuss in #946 (burst capture); affects the OCR pipeline reliability too.
