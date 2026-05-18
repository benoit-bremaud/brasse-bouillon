---
name: uml-diagram-new
description: Scaffold a UML diagram in Mermaid for a feature under `docs/architecture/diagrams/<feature>/`. Picks the right diagram type (use-case, sequence, component, class, state, data-flow) per the feature's conception stage and the brasse-bouillon Mermaid conventions. Use when designing a new feature, formalizing an existing one before implementation, or filling a UML gap discovered during code review. **v0 — refined iteratively as we use it.**
---

# UML diagram — brasse-bouillon Mermaid conventions

Markdown + Mermaid is the project standard. GitHub renders Mermaid natively, the source is diffable, and there is no external tool to install. Reach for the diagram type that **answers the question your reviewers will ask** — not "all of them by default".

## When to use which diagram

| Type | Question it answers | Use when |
|---|---|---|
| **use-case** | Who interacts with the feature, and to do what? | Phase 0 — before any code. One per epic. |
| **sequence** | What happens *in time* during a critical scenario? | Phase 1 — for any flow that crosses 2+ components, especially loops (catches per-iteration bugs upstream). |
| **component** | What are the structural boundaries and dependencies? | Phase 1 — when a feature touches more than one package or service. Forces the egress point to be explicit (catches direct-`fetch` bypasses, etc.). |
| **class** | What are the domain entities and their relationships? | Phase 1 — when a feature introduces ≥ 3 new types or relations. |
| **state** | What lifecycle does an object go through? | Phase 1 — when an object has a state machine (capture session, order, draft → published → archived, etc.). |
| **data-flow** | What data flows where, and which fields are sensitive? | Phase 1 — for any feature that processes user data (forces PII flagging). |

The 6 types are complementary, not interchangeable. Skipping any of them is fine if the question it answers does not apply to the feature.

## Path + naming convention

```
docs/architecture/diagrams/<feature>/
  01-use-case.md
  02-sequence-<scenario>.md
  03-component.md
  04-class.md
  05-state-<entity>.md
  06-data-flow.md
```

- `<feature>` = the epic's short slug (e.g. `scan`, `recipes`, `batches`).
- Numeric prefix `NN-` keeps the directory ordered by conception stage (use-case first, data-flow last).
- For multi-scenario sequence diagrams, use `02a-sequence-burst-capture.md`, `02b-sequence-ocr-pipeline.md`, etc.

## File template

```markdown
# <Diagram type> — <feature> — <short context>

> **Feature**: epic #<N> — [<epic title>](../../../specs/<feature>-roadmap.md)
> **Source specs**: `docs/architecture/specs/<feature>-algorithms.md` §<section>
> **Related ADRs**: ADR-<NNNN>, ADR-<MMMM>
> **Decisions captured**: D<X> (from `<feature>-algorithms.md`)

## Context

<2-3 lines explaining what this diagram clarifies and what it does NOT cover.>

## Diagram

​```mermaid
<the Mermaid block>
​```

## Notes

- <Key calls out reviewers should look at>
- <Anti-patterns this diagram makes visible>
- <Open questions / follow-up>
```

## Mermaid syntax — minimal cheatsheet

### Use-case (no native — use flowchart)

Mermaid has no native use-case diagram. Use a `flowchart LR` with actors as rounded nodes and use cases as ellipses. See an example under [adr-new](../adr-new/SKILL.md) once the first one is produced.

### Sequence

```
sequenceDiagram
  actor U as User
  participant M as Mobile (BenchmarkScreen)
  participant API as NestJS API
  U->>M: Tap "Start"
  loop For each frame in burst
    M->>M: takePictureAsync (skipProcessing)
    M->>M: hashJpegAsset (FNV-1a 64-bit)
  end
  M->>API: POST /scan/upload
  API-->>M: 201 + capture_id
```

### Component (flowchart with subgraphs)

```
flowchart LR
  subgraph Mobile [packages/mobile-app]
    Screen[BenchmarkScreen]
    UseCase[benchmark.use-cases]
    HTTP[core/http/http-client]
    Screen --> UseCase
    UseCase --> HTTP
  end
  subgraph Backend [packages/api]
    NestAPI[ScanController]
  end
  HTTP --> NestAPI
```

### Class

```
classDiagram
  class PanoramicCapture {
    +UUID id
    +Frame[] frames
    +Date createdAt
  }
  class Frame {
    +String uri
    +String hash64
    +Number sequence
  }
  PanoramicCapture "1" o-- "1..*" Frame
```

### State

```
stateDiagram-v2
  [*] --> PreCapture
  PreCapture --> Capturing: Commencer tap
  Capturing --> LoopClosed: gyro ≈ 360°
  Capturing --> PreCapture: cancel
  LoopClosed --> Uploading
  Uploading --> Done
  Uploading --> Failed: network error
  Failed --> Uploading: retry
  Done --> [*]
```

### Data flow (flowchart with PII annotation)

```
flowchart LR
  User((User)) -->|Photo bytes + EXIF| App
  App -->|hash64 + size + fps| Doc[scan-tech-spike-results.md]
  App -.->|⚠️ PII: deviceName| Doc
  Doc -->|Shared via OS share sheet| External([External recipients])
```

Annotate **every PII-bearing edge** with `⚠️ PII: <field>`. This makes a privacy review impossible to skip.

## Procedure

1. Read the feature's spec docs (`docs/architecture/specs/<feature>-*.md`) and the epic issue body end-to-end. Note the actors, scenarios, decisions (D1, D2, …), and risk register.
2. For each diagram type whose question applies (see table above), create the file with the template + a *minimal* Mermaid block. Don't fight to make one diagram explain everything — keep each focused.
3. Cross-link: every diagram cites the spec sections it summarizes and the ADRs it implements.
4. Open a PR titled `docs(<feature>/architecture): add UML deliverables for <feature>` with the label triptych (`type:docs` + `scope:<area>` + `priority:<level>`).

## Conventions for brasse-bouillon

- Spec docs are the source of truth — Mermaid is the **visual index**, not a parallel specification. Never duplicate prose, link to it.
- ADRs are the source of truth for **decisions**. If a UML choice encodes a decision that is not in an ADR yet, **open an ADR first** (see [adr-new](../adr-new/SKILL.md) skill).
- Decisions captured loosely in spec docs (e.g. "D1–D7" in `scan-algorithms.md`) should be promoted to formal ADRs when they cross a feature boundary or constrain another package.

## Skill maturity — v0

This is a v0. After producing the first complete set of diagrams for a feature, **refine this file** with:

- The Mermaid gotchas actually encountered (quoting, special characters, edge labels).
- Conventions of naming inside diagrams (color codes for PII / external / TODO, edge label format, …).
- A "do not do this" section of patterns to avoid.

Treat the refinement pass as a deliverable of the first use of this skill, not a "nice to have".
