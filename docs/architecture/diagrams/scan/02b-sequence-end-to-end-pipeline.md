# Sequence diagram — scan / end-to-end pipeline — Upload → Suggestion

> **Feature**: epic [#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) — Smart bottle photo capture. Covers phases 5 → 8 of the panoramic algorithm + shared with epic #934 enrichment pipeline at phase 8.
> **Source specs**: [`scan-algorithms.md`](../../specs/scan-algorithms.md) §3 phases 4.5 (SSE), 5 (Upload + stitching), 6 (OCR), 6.5 (conditional ensemble), 7 (Claude), 8 (Web verification + suggestion creation).
> **Related ADRs**: [ADR-0002](../../decisions/0002-centralized-nestjs-backend.md), [ADR-0005](../../decisions/0005-backend-split-encyclopedia-vs-product.md) (backend split).

## Context

Time-ordered view of what happens **between the end of burst capture and the maintainer notification**. This is the asynchronous server-side pipeline plus the SSE progression stream the mobile subscribes to.

Captures the **happy path** + two conditional branches:

- `opt` — Phase 6.5 OCR ensemble escalation (fires only when single-pass `avg_confidence < 0.7`).
- `opt` — Lever C "fire and forget" (user leaves the analysis screen ≥ 10 s after upload received; backend continues regardless).

Companion to [02a sequence — burst capture frame](02a-sequence-burst-capture-frame.md), which covers the per-frame loop *before* this pipeline starts.

This diagram does **not** show:

- Frame-level cost inside the burst loop — see [02a](02a-sequence-burst-capture-frame.md).
- Component dependency wiring — see [03 component](03-component.md).
- Capture session state machine — see [05 state](05-state-capture-session.md).
- Data fields and PII — see [06 data flow](06-data-flow.md).

## Diagram

```mermaid
sequenceDiagram
    actor U as EndUser
    participant Capture as CaptureScreen<br/>(mobile)
    participant Analysis as AnalysisScreen<br/>(mobile)
    participant NestNotif as NestJS<br/>(notifications table)
    participant Py as Python beer-encyclopedia<br/>(catalog + ML)
    participant CV as CloudVision<br/>(external)
    participant Cl as Claude vision<br/>(external)
    participant Brave as Brave + 2nd<br/>(external)

    Capture->>Py: POST /panoramic-captures<br/>(multipart: 15-30 JPEG frames + metadata)
    Py-->>Capture: 201 Created {capture_id}
    Capture->>Analysis: navigate (capture_id)
    Analysis->>Py: SSE subscribe /panoramic-captures/{id}/stream

    Note over Py,Analysis: SSE replay-on-connect: emit state.snapshot<br/>of phases already completed

    Py-->>Analysis: event: upload.received (10%)
    Analysis-->>U: "Envoi des images terminé"

    Py->>Py: PanoramicStitchingService — OpenCV stitcher<br/>(in-process, no FFI)
    Py-->>Analysis: event: stitching.completed (30%)
    Analysis-->>U: "Reconstruction de l'étiquette OK"

    Py->>CV: OCR pass 1 — panorama + 2-3 keyframes
    CV-->>Py: ocr_text, blocks, avg_confidence
    Py-->>Analysis: event: ocr.completed (50%)<br/>payload includes best-effort partial parse {name, brewery}
    Analysis-->>U: "Lecture du texte OK"<br/>+ display partial card (Lever B)

    opt avg_confidence < 0.7 (Phase 6.5 escalation)
        Py-->>Analysis: event: ocr.escalated
        Analysis-->>U: "Lecture approfondie..."
        par 5 monochrome variants in parallel
            Py->>CV: OCR pass — R channel
            Py->>CV: OCR pass — G channel
            Py->>CV: OCR pass — B channel
            Py->>CV: OCR pass — luminance grayscale
            Py->>CV: OCR pass — adaptive threshold
        end
        CV-->>Py: 5 OCR result sets
        Py->>Py: consolidate per-token (≥3 variants = 0.95, etc.)
        Py-->>Analysis: event: ocr.escalated.completed (60%)
    end

    opt Lever C — Fire and forget (≥10 s elapsed on Analysis screen)
        U->>Analysis: tap "Continuer ailleurs"
        Analysis->>Analysis: drop SSE, close screen
        Note over Analysis,Py: Backend pipeline continues regardless
    end

    Py->>Cl: Claude vision call<br/>(OCR tokens + panorama + keyframes)
    Cl-->>Py: structured Partial&lt;ScanCatalogItem&gt; with per-field confidence
    Py-->>Analysis: event: ai.completed (80%)
    Analysis-->>U: "Analyse intelligente OK"

    loop For each field with confidence &lt; 0.7
        Py->>Brave: Brave Search + 2nd source
        Brave-->>Py: web evidence (per #938 consolidation rules)
    end
    Py-->>Analysis: event: webcheck.completed (95%)
    Analysis-->>U: "Vérification croisée OK"

    Py->>Py: persist BeerDataSuggestion<br/>+ new scan_catalog_items row<br/>(source='panoramic', barcode=NULL)
    Py->>NestNotif: webhook SuggestionCreated
    NestNotif->>NestNotif: insert into notifications table
    Py-->>Analysis: event: suggestion.created (100%)
    Analysis-->>U: "✅ Prêt à valider"<br/>auto-navigate to result screen
```

## Notes

### What this diagram makes structurally visible

- **Mobile never calls Cloud Vision, Claude, or Brave directly.** Only `Python beer-encyclopedia` does. Per [ADR-0002](../../decisions/0002-centralized-nestjs-backend.md), the mobile bundle has no path to external providers. If a future implementation wires a direct call, it deviates from this diagram.
- **Backend ownership split.** `Python beer-encyclopedia` is the workhorse — it owns stitching, OCR orchestration, Claude vision, web search, suggestion persistence. `NestJS` is reduced to a single role here: receiving the `SuggestionCreated` webhook and writing the notification row. Per [ADR-0005](../../decisions/0005-backend-split-encyclopedia-vs-product.md).
- **SSE replay-on-connect.** The first message on a fresh SSE connection is a `state.snapshot` of completed phases, so a late subscriber catches up to the live stream. Without this, the mobile can race past `upload.received` and miss the gate that arms Lever C.
- **Lever C does not abort the backend.** The user tapping "Continuer ailleurs" only drops the SSE connection client-side. The pipeline continues, suggestion is persisted, notification is posted, and the user is informed via the polling loop of [#939](https://github.com/benoit-bremaud/brasse-bouillon/issues/939).
- **Phase 6.5 escalation is conditional.** The common case (industrial / classic label, single-pass `avg_confidence ≥ 0.7`) skips the 5 monochrome variants entirely. Only ~$0.006 / scan. Escalated case ~$0.036 / scan. Per spec §3 phase 6.5 cost table.

### Cost / latency markers (from spec §3 phase 6.5)

| Path | Cloud Vision calls | OCR latency | Notes |
|---|---|---|---|
| Common (no escalation) | 1× (panorama + 2-3 keyframes) | ~2 s | ~$0.006 / scan |
| Escalated (Phase 6.5 fired) | 1× initial + 5× variants = 6× | ~3-5 s | ~$0.036 / scan; logged in #942 cost monitoring |

End-to-end p50 budget for the happy path (Phase 5 → 8): **~10 s**. Above 20 s, the user has likely tapped Lever C.

### Anti-patterns this diagram makes visible

- **Synchronous response to the multipart upload.** The `201 Created` returns immediately after multipart parse, NOT after stitching completes. Stitching, OCR, AI, web all run async. Implementations that block the HTTP response until stitching is done re-introduce the 10–20 s blocking wait the SSE stream is designed to avoid.
- **Direct mobile → external arrow.** Already noted above.
- **Webhook → NestJS notification → mobile polling.** Notifications cross the ADR-0005 boundary (Python emits, NestJS receives). If a future implementation has the Python service write directly to the NestJS notifications table (cross-database write), it violates the boundary. The cross-package call must remain an explicit webhook.

### Open questions

- The escalation threshold (`avg_confidence < 0.7`) is a first-cut. The diagram does not show the per-field weighting (block char-count). Tune post-launch per #942 data.
- The Brave + 2nd-source consolidation rules (in the loop) live in [#938](https://github.com/benoit-bremaud/brasse-bouillon/issues/938). This diagram refers to them but does not draw the per-field decision logic — that belongs to its own sub-issue spec.
- The mobile auto-navigates to the result screen on `suggestion.created`. If the user has already left via Lever C, the auto-navigate must be a no-op (not a deep-link interrupt). Document under #939 (notification polling).
