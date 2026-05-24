# Sequence diagram — tools & academy — run a calculator & glossary lookup

> **Feature**: calculators E03; glossary tooltip #783/#914.

## Context

The two interactions: running a calculator (live, local, stateless) and looking
up a glossary term from a topic/tip. Calculators need no network; the glossary
becomes API-backed (#914) shared across the app.

## Run a calculator

```mermaid
sequenceDiagram
  actor B as Brewer
  participant S as "Mobile — <X>CalculatorScreen"
  participant Calc as "core/brewing-calculations (pure)"

  B->>S: Enter inputs (weights, times, %, volume)
  S->>Calc: compute(inputs)
  Calc-->>S: result (e.g. IBU = 42)
  S-->>B: live output (no network)
  opt Save (#657)
    B->>S: Tap "Enregistrer"
    S->>S: persist SavedCalculation (local / profile)
  end
```

## Glossary lookup

```mermaid
sequenceDiagram
  actor B as Brewer
  participant S as "Mobile — topic / tip with term"
  participant UC as "Mobile — glossary.use-cases"
  participant HTTP as "core/http/http-client"
  participant API as "API — glossary (#914)"

  B->>S: Tap a highlighted term
  S->>UC: getGlossaryTerm(slug)
  alt cached / bundled
    UC-->>S: term + definition (local)
  else API-backed
    UC->>HTTP: GET /glossary/:slug
    HTTP->>API: forward
    API-->>S: term + definition
  end
  S-->>B: tooltip / modal
```

## Notes / suggestions

- **Calculators stay client-side** (pure functions) — fast, offline, testable in
  isolation (existing tests). No state diagram applies (stateless).
- **Glossary**: ship bundled for v0 (offline), move to API (#914) when it must be
  shared/edited centrally — **one glossary** feeding tools + brewing tips + recipe
  tooltips (suggestion).
- **Save (#657)** is optional persistence; until built, calculators are
  ephemeral — that's fine (KISS).
