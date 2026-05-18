# Use case diagram — scan — actors and goals

> **Feature**: epic [#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) — Smart bottle photo capture (panoramic label) + epic [#934](https://github.com/benoit-bremaud/brasse-bouillon/issues/934) (barcode enrichment).
> **Source specs**: [`docs/architecture/specs/scan-algorithms.md`](../../specs/scan-algorithms.md) §2 (decision tree) and §3 (panoramic algorithm).
> **Related ADRs**: [ADR-0002](../../decisions/0002-centralized-nestjs-backend.md), [ADR-0005](../../decisions/0005-backend-split-encyclopedia-vs-product.md).
> **Decisions captured**: D1–D7 (`scan-algorithms.md`, 2026-05-08) — *to be promoted to ADR-0006…*.

## Context

Highest-level view of who interacts with the scan feature and what each actor is trying to achieve. Boundaries between **internal services** (mobile, NestJS API, Python beer-encyclopedia) and **external providers** (Cloud Vision, Claude, OpenFoodFacts, Brave) are made explicit, because ADR-0005 splits backend ownership and ADR-0002 forbids the mobile bundle from calling external providers directly.

This diagram does **not** show timing (see [02a sequence — burst capture](02a-sequence-burst-capture-frame.md) + [02b sequence — end-to-end pipeline](02b-sequence-end-to-end-pipeline.md)) nor data structures (see [04 class diagram](04-class.md)).

## Diagram

```mermaid
flowchart LR
    %% Actors
    Buyer((End user<br/>«Léa la curieuse»))
    Maintainer((Maintainer<br/>«Benoît»))

    %% External providers (boundary)
    OFF[/OpenFoodFacts/]
    CloudVision[/Google Cloud Vision OCR/]
    Claude[/Anthropic Claude vision/]
    Brave[/Brave Search + 2nd web source/]

    %% System boundary
    subgraph BB ["Brasse-Bouillon system"]
        direction TB

        UC1(("Scan a barcode<br/>(EAN-13 / UPC)"))
        UC2(("Capture a panoramic label<br/>(360° rotation)"))
        UC3(("View the resulting<br/>catalog card"))
        UC4(("Manage offline<br/>capture queue"))
        UC5(("Receive 'suggestion ready'<br/>notification"))

        UC6(("Review pending<br/>BeerDataSuggestion"))
        UC7(("Approve / Refuse / Refine /<br/>Instruct a suggestion"))
        UC8(("View capture + keyframes<br/>alongside diff"))

        %% Internal boundaries (ADR-0005 split)
        subgraph Mobile ["packages/mobile-app"]
            UC1
            UC2
            UC3
            UC4
            UC5
        end

        subgraph Nest ["packages/api (NestJS — user-side only)"]
            NestAuth[/Auth + sessions/]
            NestNotif[/Notifications table/]
            NestReview[/Maintainer review proxy/]
            UC6
            UC7
            UC8
        end

        subgraph Python ["packages/beer-encyclopedia (Python — catalog + ML)"]
            PyCatalog[/scan_catalog_items + panoramic_capture/]
            PyStitch[/PanoramicStitchingService — OpenCV/]
            PyOCR[/OCR orchestration — Cloud Vision/]
            PyAI[/Claude vision call/]
            PyWeb[/Web enrichment — Brave + 2nd/]
            PySSE[/SSE progression stream/]
        end
    end

    %% Actor → use case wiring
    Buyer --> UC1
    Buyer --> UC2
    Buyer --> UC3
    Buyer --> UC4
    Buyer --> UC5
    Maintainer --> UC6
    Maintainer --> UC7
    Maintainer --> UC8

    %% Cross-package interactions (ADR-0005)
    UC1 -.->|reads| OFF
    UC1 -.->|reads| PyCatalog
    UC2 -.->|uploads frames| PyStitch
    UC2 -.->|subscribes| PySSE
    UC3 -.->|reads| PyCatalog
    UC5 -.->|polled via| NestNotif
    UC6 -.->|served by| NestReview
    NestReview -.->|proxies to| PyCatalog
    PyOCR -.->|calls| CloudVision
    PyAI -.->|calls| Claude
    PyWeb -.->|calls| Brave
    PyCatalog -.->|webhook| NestNotif

    %% Styling
    classDef actor fill:#F4D35E,stroke:#333,stroke-width:1px,color:#000
    classDef external fill:#EE6C4D,stroke:#333,stroke-width:1px,color:#fff
    classDef useCase fill:#E5E5E5,stroke:#333,stroke-width:1px,color:#000
    class Buyer,Maintainer actor
    class OFF,CloudVision,Claude,Brave external
    class UC1,UC2,UC3,UC4,UC5,UC6,UC7,UC8 useCase
```

## Notes

### Actor / use-case anti-patterns this diagram makes visible

- **No actor-to-external arrow.** End user and maintainer never talk directly to Cloud Vision, Claude, OpenFoodFacts, or Brave. Per [ADR-0002](../../decisions/0002-centralized-nestjs-backend.md), the mobile app calls **only** the project's own backends. If a future implementation wires a direct `fetch(cloudvision.googleapis.com/...)` from `packages/mobile-app/`, it violates this diagram and ADR-0002. The [component diagram](03-component.md) makes the egress point (`packages/mobile-app/src/core/http/http-client.ts`) explicit.

- **Backend ownership split — ADR-0005.** Anything *catalog* (`scan_catalog_items`, `panoramic_capture`, OCR orchestration, OpenCV stitching, Claude vision, Brave web search) lives in Python. NestJS keeps **only** auth + notifications + maintainer-review proxy. The "scan" module currently in NestJS is **transitional** and on a deprecation roadmap. Any sub-issue under #751 that lands new catalog code in `packages/api/src/scan/` must be flagged for migration to `packages/beer-encyclopedia/`.

- **Maintainer ≠ end user.** The end user (`Buyer`) and the maintainer (`Maintainer`) are distinct actors with disjoint use-case sets. Conflating them in the code (one Permission class, one route) would obscure the fact that approve/refuse/refine/instruct lives behind a maintainer-only gate.

### What this diagram intentionally omits

- **Real-time mechanics of the burst capture** (per-frame loop, hash, blur check, gyro). See [02a sequence — burst capture frame](02a-sequence-burst-capture-frame.md).
- **End-to-end pipeline timing** (upload → stitching → OCR → AI → web verification → suggestion). See [02b sequence — end-to-end pipeline](02b-sequence-end-to-end-pipeline.md).
- **State of a capture session** (PreCapture → Capturing → Uploading → …). See [05 state — capture session](05-state-capture-session.md).
- **Data fields and PII**. See [06 data flow](06-data-flow.md).

### Open questions surfaced by this diagram

- The `notifications` table sits in NestJS today (ADR-0005). Should the Python beer-encyclopedia expose a `subscribe` interface for the maintainer's UI to read directly, bypassing the NestJS proxy? Tracked as part of the ADR-0005 §Roadmap deprecation of the NestJS `scan/` module.
- The "Manage offline capture queue" use-case (`UC4`, [D7](../../specs/scan-algorithms.md#phase-25--offline-upload-queue-decision-d7-2026-05-08)) currently has no maintainer-facing visibility. If a user's capture sits queued for 7 days then expires, the maintainer never sees it. Should a `dropped_offline_capture` metric land in #942 cost monitoring? Follow-up.
