# Class diagram — scan — domain entities

> **Feature**: epics [#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) (panoramic) + [#934](https://github.com/benoit-bremaud/brasse-bouillon/issues/934) (barcode).
> **Source specs**: [`scan-algorithms.md`](../../specs/scan-algorithms.md) §4 (Data model impact), §3 phase 2 (Burst capture), §3 phase 2.5 (Offline queue), §3 phase 6 (OCR), §3 phase 6.5 (Token consolidation).
> **Related ADRs**: [ADR-0005](../../decisions/0005-backend-split-encyclopedia-vs-product.md) (catalog entities live in Python).

## Context

Domain entities and their relationships across the scan feature. Three persistence boundaries are visible:

- **Server-side persisted** (Python beer-encyclopedia Postgres): `ScanCatalogItem`, `PanoramicCapture`, `BeerDataSuggestion`, `Keyframe`.
- **Mobile-side persisted** (AsyncStorage + filesystem): `OfflineCapture`.
- **Transient / in-memory** (mobile only, never written): `Frame`, `BoundingBox`, `Token`.

This diagram does **not** show:

- Behavior (methods are minimal — see use cases [01a](01a-use-case-barcode.md) / [01b](01b-use-case-panoramic.md) and sequences [02a](02a-sequence-burst-capture-frame.md) / [02b](02b-sequence-end-to-end-pipeline.md) for behaviors).
- Implementation packages — see [03 component](03-component.md).
- Lifecycle (state transitions) — see [05 state](05-state-capture-session.md).
- Field-level PII flagging — see [06 data flow](06-data-flow.md).

## Diagram

```mermaid
classDiagram
    %% Server-side persisted entities (Python Postgres)
    class ScanCatalogItem {
        +UUID id
        +String barcode  /* nullable in Python catalog */
        +String source   /* 'seed' | 'openfoodfacts' | 'panoramic' | 'manual' */
        +String name
        +String brewery
        +Float abv
        +Int ibu
        +Int color_ebc
        +String fermentation_type
        +String ingredients_text
        +String image_url
        +Datetime created_at
        +Datetime updated_at
    }

    class PanoramicCapture {
        +UUID id
        +UUID catalog_item_id
        +UUID triggered_by_request_id  /* cross-backend, nullable */
        +String panorama_url
        +Jsonb keyframe_urls
        +Int frame_count
        +Boolean loop_closure_detected
        +Float gyro_total_angle_deg
        +UUID submitted_by_user_id  /* cross-backend, nullable */
        +Datetime created_at
    }

    class Keyframe {
        +UUID id
        +UUID panoramic_capture_id
        +String url
        +Int sequence_index
        +Float text_density_score
        +Float sharpness_score
    }

    class BeerDataSuggestion {
        +UUID id
        +UUID catalog_item_id
        +String status  /* PENDING | APPROVED | REFUSED | REFINED */
        +Jsonb proposed_fields
        +Jsonb source_summary
        +Float confidence
        +Datetime created_at
        +Datetime reviewed_at
    }

    %% OCR primitives (transient, returned by Cloud Vision + Phase 6.5 consolidation)
    class BoundingBox {
        +Int x
        +Int y
        +Int width
        +Int height
        +String text
        +Float confidence
    }

    class Token {
        +String text
        +BoundingBox bbox
        +Float confidence
        +Int variant_count  /* 1-5 from Phase 6.5 ensemble */
        +Boolean needs_review  /* true if variant_count == 1 */
    }

    %% Mobile-side persisted (AsyncStorage manifest + filesystem files)
    class OfflineCapture {
        +UUID capture_id
        +String[] file_uris  /* paths in expo-file-system document directory */
        +Datetime created_at
        +Int attempts  /* retry counter, capped at 5 */
    }

    %% Mobile-side transient (in-memory only — never persisted)
    class Frame {
        +String uri  /* local file URI from takePictureAsync */
        +String hash64
        +Datetime timestamp
        +Float gyro_angle_deg
    }

    %% Relations
    ScanCatalogItem "1" o-- "0..*" PanoramicCapture : produces
    ScanCatalogItem "1" o-- "0..*" BeerDataSuggestion : has pending
    PanoramicCapture "1" o-- "0..*" Keyframe : extracts
    BeerDataSuggestion ..> Token : consumes during creation
    Token "1" *-- "1" BoundingBox : has
    OfflineCapture ..> Frame : references via file_uris

    %% Styling
    classDef server fill:#9CC,stroke:#333,color:#000
    classDef mobile fill:#FCB,stroke:#333,color:#000
    classDef transient fill:#FFC,stroke:#666,stroke-dasharray: 4 4,color:#000
    class ScanCatalogItem,PanoramicCapture,Keyframe,BeerDataSuggestion server
    class OfflineCapture mobile
    class Frame,BoundingBox,Token transient
```

## Notes

### Persistence boundaries this diagram makes explicit

- **`ScanCatalogItem.barcode` is NULLABLE in the Python catalog** (unlike the legacy NestJS `scan_catalog_items` table where it is `NOT NULL`). The panoramic flow creates rows with no barcode. The schema requirement is captured in [scan-algorithms.md §4.1](../../specs/scan-algorithms.md#41-scan_catalog_items-python--postgres--schema-requirements).
- **`PanoramicCapture.submitted_by_user_id` is a cross-backend reference** to `users.id` (NestJS table). It is **not** a hard foreign key — referential integrity across the package boundary is the application's responsibility, per ADR-0005. Same for `triggered_by_request_id`.
- **Raw frames are not persisted server-side.** Only the stitched panorama and the 2-3 keyframes survive (per the spec storage decision). The mobile `Frame` in-memory array is discarded once the upload returns 201. The mobile-persisted `OfflineCapture` references **JPEG files** in the filesystem, not `Frame` objects — when the upload retries succeed, those files are deleted and the manifest entry is dropped.
- **`Token` consolidates the Phase 6.5 ensemble output**, not the single-pass Phase 6 result. After Phase 6 alone, only `BoundingBox` instances are surfaced (no `variant_count`, no `needs_review`). Phase 7 (Claude vision) consumes `Token` (escalated) or `BoundingBox` (non-escalated) depending on what Phase 6 / 6.5 produced.

### Cross-backend references — not foreign keys

The diagram uses solid composition / aggregation arrows for in-database relationships. Dashed dependency arrows (`..>`) mark cross-backend references that must be enforced in application code, not in the database:

- `PanoramicCapture.submitted_by_user_id` → `users.id` (NestJS)
- `PanoramicCapture.triggered_by_request_id` → `scan_requests.id` (NestJS, legacy)
- `BeerDataSuggestion` notification → `notifications.id` (NestJS, via webhook)

Implementations that try to create a real DB FK across these boundaries violate ADR-0005.

### Anti-patterns this diagram makes visible

- **Adding a `Frame` table on the server side.** The diagram has no server-side `Frame` entity — the burst frames are throwaway. If a future change wants to persist them (for forensics, retraining, etc.), it must add a new explicit entity with an ADR.
- **`Token` with `variant_count: 0`.** Tokens never come from nothing — they always trace back to ≥ 1 OCR pass. A `variant_count: 0` would be a bug. Enforce in the consolidator code.
- **`OfflineCapture.attempts > 5`.** The spec caps retry count at 5 (§3 phase 2.5). Above 5, the manifest entry must be dropped, not retried. Enforced in the upload-retry use case.
- **A `BeerDataSuggestion` directly writing back into `ScanCatalogItem`.** Suggestions live in `PENDING` until the maintainer acts. Never written directly. The diagram shows them as a separate entity with a relation, not as an update path. Per [scan-algorithms.md §1 vocabulary](../../specs/scan-algorithms.md#1-vocabulary).

### Open questions

- The `Keyframe.text_density_score` and `Keyframe.sharpness_score` are the ranking criteria for the 2-3 keyframe selection from the burst. The threshold values are TBD (resolve during #751-5 — backend stitching service). Surface as ADR if they encode a behavioral choice.
- The `BeerDataSuggestion.proposed_fields` JSON shape is currently free-form. As the Phase 7 Claude schema stabilises (see [scan-algorithms.md §3 phase 7](../../specs/scan-algorithms.md#phase-7--multimodal-ai-structuring-claude-vision)), it should be tightened to a typed schema (Pydantic on the Python side). Track under #751-7.
- The `OfflineCapture.created_at` triggers the 7-day TTL eviction. Should `last_attempt_at` also be tracked for monitoring? Track under #946.
