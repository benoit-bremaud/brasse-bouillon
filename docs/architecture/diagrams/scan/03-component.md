# Component diagram — scan — structural decomposition

> **Feature**: epics [#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) + [#934](https://github.com/benoit-bremaud/brasse-bouillon/issues/934) — both panoramic and barcode scan paths.
> **Source specs**: [`scan-algorithms.md`](../../specs/scan-algorithms.md) §6 (Tech stack constraints), §3 phase 5 (backend handoff).
> **Related ADRs**: [ADR-0002](../../decisions/0002-centralized-nestjs-backend.md) (mobile talks only to BB backends), [ADR-0005](../../decisions/0005-backend-split-encyclopedia-vs-product.md) (backend split).

## Context

Structural view of *how the scan feature is split across packages and services* and where the **egress points** live. This is the diagram that answers *"what calls what?"*. The use cases ([01a barcode](01a-use-case-barcode.md), [01b panoramic](01b-use-case-panoramic.md)) do not show this — they were deliberately scoped to actor goals, not architecture.

This diagram makes one rule structurally explicit: **`packages/mobile-app/src/core/http/http-client.ts` is the only egress from the mobile bundle to any backend**. Per ADR-0002, the mobile app calls only Brasse-Bouillon's own backends, and all such calls funnel through `http-client.ts`. Any feature module that uses `fetch()` directly violates the diagram and the ADR — this is the bug PR [#996](https://github.com/benoit-bremaud/brasse-bouillon/pull/996)'s tech-spike reintroduced.

This diagram does **not** show:

- Actor goals — see [01a](01a-use-case-barcode.md), [01b](01b-use-case-panoramic.md).
- Temporal flow — see [02a](02a-sequence-burst-capture-frame.md), [02b](02b-sequence-end-to-end-pipeline.md).
- Domain entities — see [04 class diagram](04-class.md).
- Field-level data + PII — see [06 data flow](06-data-flow.md).

## Diagram

```mermaid
flowchart LR
    %% External providers (outside the system)
    OFF[/OpenFoodFacts/]
    CV[/Google Cloud Vision/]
    Claude[/Anthropic Claude vision/]
    Brave[/Brave Search + 2nd/]

    %% Mobile app — by Clean Architecture layer
    subgraph Mobile ["packages/mobile-app (React Native + Expo Managed)"]
        direction TB
        subgraph MobPres ["presentation/"]
            Screens[BenchmarkScreen / CaptureScreen / AnalysisScreen / BeerInfoCardScreen]
        end
        subgraph MobApp ["application/"]
            UC1[burst-capture.use-cases]
            UC2[scan-result.use-cases]
            UC3[offline-queue.use-cases]
        end
        subgraph MobDomain ["domain/"]
            Types[Frame / BenchmarkResult / OfflineCapture types]
        end
        subgraph MobData ["data/ + core/"]
            HTTP[core/http/http-client.ts<br/>**CANONICAL EGRESS**]
            Storage[AsyncStorage<br/>+ expo-file-system]
        end
        Screens --> UC1
        Screens --> UC2
        Screens --> UC3
        UC1 --> Types
        UC2 --> Types
        UC3 --> Storage
        UC1 --> HTTP
        UC2 --> HTTP
        UC3 --> HTTP
    end

    %% NestJS API — user-side only per ADR-0005
    subgraph Nest ["packages/api (NestJS — user-side only per ADR-0005)"]
        direction TB
        NestAuth[auth/ module]
        NestNotif[notifications/ module<br/>(table + polling endpoint)]
        NestScan[scan/ module<br/>(TRANSITIONAL — see ADR-0005 §Roadmap)]
        ProxyMaint[maintainer-review proxy]
        ProxyMaint --> NestNotif
    end

    %% Python beer-encyclopedia — catalog + ML
    subgraph Py ["packages/beer-encyclopedia (Python — catalog + ML per ADR-0005)"]
        direction TB
        PyAPI[api/routers/ — FastAPI]
        PyCatalog[db/models/ — scan_catalog_items, panoramic_capture, beer_data_suggestions]
        subgraph PyML ["ml/ + services/"]
            PyStitch[PanoramicStitchingService<br/>(OpenCV in-process)]
            PyOCR[OCR orchestration]
            PyEscalate[Phase 6.5 monochrome ensemble]
            PyClaude[Claude vision client]
            PyEnrich[Web enrichment — Brave + 2nd]
        end
        PySSE[SSE progression stream]
        PyAPI --> PyCatalog
        PyAPI --> PyStitch
        PyAPI --> PyOCR
        PyOCR -.->|when conf &lt; 0.7| PyEscalate
        PyAPI --> PyClaude
        PyAPI --> PyEnrich
        PyAPI --> PySSE
    end

    %% Cross-package calls — ALWAYS via http-client (per ADR-0002)
    HTTP -->|barcode| NestScan
    HTTP -->|auth| NestAuth
    HTTP -->|panoramic upload + SSE| PyAPI
    PyAPI -->|webhook SuggestionCreated| NestNotif

    %% Egress to external providers — only from Python beer-encyclopedia (per ADR-0002)
    NestScan -.->|legacy, to be deprecated| OFF
    PyEnrich -.-> Brave
    PyOCR -.-> CV
    PyEscalate -.-> CV
    PyClaude -.-> Claude

    %% Styling
    classDef egress fill:#F4D35E,stroke:#000,stroke-width:2px,color:#000
    classDef external fill:#EE6C4D,stroke:#333,stroke-width:1px,color:#fff
    classDef transitional fill:#999,stroke:#333,stroke-dasharray: 4 4,color:#fff
    class HTTP egress
    class OFF,CV,Claude,Brave external
    class NestScan transitional
```

## Notes

### Egress contract — what this diagram enforces

- **The only path from the mobile bundle to any backend is `core/http/http-client.ts`.** Every `application/` use case that needs HTTP must call into `core/http/http-client.ts`. Any module that imports `fetch` directly (or uses `axios` / `expo-fetch` outside that file) violates the diagram and ADR-0002. This was the root cause of PR #996's Copilot finding *"Direct fetch() usage here (reading `photo.uri`) bypasses the project's HTTP abstraction"*.
- **The only path from the mobile bundle to external providers is via a Brasse-Bouillon backend.** Mobile never talks to OpenFoodFacts, Cloud Vision, Claude, or Brave directly. Per ADR-0002. Even the photo URIs that the camera captures stay local on the device until they are uploaded via `http-client.ts` to `Py.api`.
- **External provider egress lives in Python beer-encyclopedia.** Brave, Cloud Vision, Claude — all called by `PyEnrich`, `PyOCR`, `PyEscalate`, `PyClaude`. NestJS does **not** call these. Per ADR-0005.
- **`NestJS scan/ module` is transitional.** It still serves `barcode` and `OpenFoodFacts` lookup (legacy). Per [ADR-0005 §Roadmap](../../decisions/0005-backend-split-encyclopedia-vs-product.md), the catalog work moves to Python beer-encyclopedia. The dashed border in the diagram makes the transitional status visible to anyone reading it.

### Cross-package call patterns

| From | To | Pattern | Purpose |
|---|---|---|---|
| `Mobile/core/http/http-client.ts` | `Nest/scan` | HTTPS request, JWT-authenticated | Barcode lookup (legacy path) |
| `Mobile/core/http/http-client.ts` | `Nest/auth` | HTTPS request | Auth + session refresh |
| `Mobile/core/http/http-client.ts` | `Nest/notifications` | HTTPS request, polling per #939 | Maintainer notifications |
| `Mobile/core/http/http-client.ts` | `Py/api` | HTTPS multipart upload | Panoramic frames upload |
| `Mobile/core/http/http-client.ts` | `Py/api/...stream` | SSE long-lived connection | Pipeline progression |
| `Py/api` | `Nest/notifications` | HTTPS webhook | SuggestionCreated handoff |
| `Py/PyOCR` `Py/PyEscalate` | `Cloud Vision` | HTTPS, Google SDK | OCR (single + ensemble) |
| `Py/PyClaude` | `Claude vision` | HTTPS, Anthropic SDK | Multimodal structuring |
| `Py/PyEnrich` | `Brave` | HTTPS | Web verification (shared with #934 / #938) |
| `Nest/scan` *(legacy)* | `OpenFoodFacts` | HTTPS | Barcode legacy lookup (to be moved to Python per ADR-0005) |

### Anti-patterns this diagram makes visible

- **Direct fetch from `application/`** — any code under `packages/mobile-app/src/features/.../application/` that calls `fetch(...)` directly bypasses `http-client.ts`. The diagram has no arrow from `MobApp` to any external box. PR #996 introduced this; the diagram should have been drawn first.
- **Cross-database write from Python to NestJS** — Python does not write into NestJS's database directly. It posts a webhook. If a future implementation does direct DB write across the package boundary, it violates the diagram and ADR-0005.
- **Mobile → external direct** — already covered above. There is no arrow from `Mobile` to any external box without going through a backend.

### Open questions

- The exact shape of the SSE endpoint URL (`/panoramic-captures/{id}/stream` vs `/captures/{id}/events`) is TBD per [scan-algorithms.md §3 phase 4.5](../../specs/scan-algorithms.md). The diagram references the spec, not a hard-coded URL.
- Whether the maintainer-review proxy in NestJS (`ProxyMaint`) calls the Python `scan_catalog_items` table read-only or via a structured RPC is open. Resolve before the maintainer-review screen ships ([#940](https://github.com/benoit-bremaud/brasse-bouillon/issues/940)).
- The deprecation timeline for the NestJS `scan/` module is captured in ADR-0005 §Roadmap. The diagram flags it as `TRANSITIONAL` so reviewers know not to land new code there.
