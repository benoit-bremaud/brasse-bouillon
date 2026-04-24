# ADR-0004 — Data locality: hybrid principle

**Status**  Accepted
**Date**    2026-04-24
**Owners**  @benoit-bremaud

---

## Context

Brasse-Bouillon mixes two very different modes of use:

1. **Discovery / communication / planning** — browsing recipes, scanning
   a beer at a bar, consulting an Academy article, rating a community
   recipe, editing the profile. These journeys are typically done on
   the couch or in public spaces with working Wi-Fi / 4G.
2. **Brewing assistance during an active session** — reading the next
   step with hands in the kettle, starting a timer for the 60-minute
   boil, recording an OG measurement, ticking an ingredient off the
   checklist. A brew day lasts 4 to 6 continuous hours and typically
   happens in a garage, a cellar, or a kitchen corner where network
   coverage is patchy at best.

These two modes have opposite requirements:

- The first benefits enormously from a cloud-first backend. Sync across
  devices, real-time community ratings, personalised recommendations,
  centralised moderation — all require a shared source of truth
  reachable over the network.
- The second cannot afford to lose the network mid-action. A timer that
  stops because 4G dropped = ruined beer. A recipe that fails to load
  between mashing and boiling = the batch falls apart. A measurement
  that cannot be logged = a data gap in the fermentation journal.

A single-mode architecture fails both modes:

- A **pure cloud-first** architecture makes the brewing assistant
  unreliable during the exact window where it must be bulletproof.
- A **pure local-first** architecture introduces conflict resolution,
  delta sync, and schema versioning across every feature — a massive
  complexity tax applied to the 80 % of the app that does not need it,
  three weeks before the 2026-05-27 defense.

The 2026-04-24 onboarding brainstorm
(`docs/product/brainstorms/onboarding-2026-04-24.md`) surfaced this
tension explicitly and validated the principle recorded below by
applying a 4-level criticality framework to 15 user journeys and
11 brewing phases.

---

## Decision

We commit to a **hybrid data locality principle**:

> **Every operation in the critical path of an active brewing session
> MUST work 100 % offline. Every other journey is cloud-first with
> HTTP cache fallback.**

The principle splits the app into two worlds cleanly, keeps the
architecture tractable, and targets complexity only where it is
unavoidable.

### Criticality framework

Every user journey is scored on how *losing network mid-action* affects
the user:

| Level | Symbol | Definition | Example consequence |
|---|:---:|---|---|
| **Critical** | 🔴 | Network loss = data loss or irreversible missed step | Batch ruined, measurement lost, timer stopped |
| **High** | 🟠 | Network loss = broken UX, action blocked | Recipe unreadable mid-brew, checklist inaccessible |
| **Medium** | 🟡 | Network loss = tolerable degradation | Recommendation missing, image not loaded |
| **Low** | 🟢 | Network expected, failure = "retry" acceptable | Publish recipe, see community, log in |

**Rule of decision**: every journey scored 🔴 or 🟠 MUST go local-first.
Journeys scored 🟡 or 🟢 are cloud-first with HTTP cache.

### Scope of local-first (v0.1)

The local-first scope is bound to **Mes Brassins** (the full flow from
batch creation to bottling, across brew phases 2 to 10 of the 11-phase
decomposition) plus its direct dependencies:

- Linked recipe detail (read-only during an active brew).
- Referenced ingredient sheets (read-only during an active brew).
- Contextual calculators (IBU, ABV, carbonation) when invoked from a
  batch.
- Local measurement + observation journal (OG, FG, temperature, pH,
  free-text notes, photos).
- Equipment checklist for the selected batch.

The passive fermentation and maturation tails (brew phases 8–11:
secondary fermentation, maturation, bottling, carbonation / storage)
can tolerate occasional network use because the user interaction is
ad-hoc. Bottling (phase 10) stays within the local-first boundary
because the priming-sugar calculation and sanitization checklist
happen in a single active session similar to the brew day.

### Scope of cloud-first (v0.1)

Everything else is cloud-first with HTTP cache:

- Authentication (login, signup, OAuth, password reset, email
  verification).
- Onboarding skippable (display name, avatar, experience level, styles,
  unit system).
- Discovery: scanning a beer, community recipe browsing, Academy
  articles.
- Community writes: publishing a recipe, rating, commenting.
- Shop catalogue and partner deeplinks.
- Profile, settings, unit toggle, RGPD export / delete.
- Statistics screen (moved out of the home — see brainstorm).

---

## Consequences

### Positive

- **Brew day reliability** — the brewer can brew a full 5 to 6 hour
  session in a garage without Wi-Fi. The app behaves identically
  offline and online for the critical phases.
- **Feature velocity where it matters** — 80 % of the app is cloud-first
  and therefore benefits from a simple request/response model without
  sync-engine complexity.
- **Demo resilience** — the 2026-05-27 defense can show the scan + import
  flow on cloud-first while the Mes Brassins demo can be shown with a
  toggled-off wifi to highlight offline capability.
- **Scales to v0.2 community** — the cloud-first half naturally grows
  into a multi-device + community platform without re-architecting.

### Negative

- **Two implementations of many features** — recipe read, ingredient
  read, calculators: one version in NestJS (cloud-first) and one
  cached in the mobile app (local-first). Duplication risk mitigated
  by strict domain alignment (same Pydantic / TypeScript types on
  both sides).
- **Sync engine required for Mes Brassins** — the mobile app must
  eventually reconcile local-first batch data with the NestJS backend
  (for multi-device, for the community "I brewed this recipe" signal).
  That engine is non-trivial and will need its own ADR when it is
  built.
- **Storage on device** — SQLite or an equivalent structured store is
  required on the mobile side for the batch journal. `AsyncStorage` is
  insufficient for the volume and query patterns expected.
- **Developer discipline** — every new feature must explicitly choose a
  world and justify it. The default is cloud-first; crossing into
  local-first requires an explicit note in the feature's design doc
  citing this ADR.

### Neutral

- **Testing matrix doubles** for the local-first features (online path
  + offline path + reconciliation path). Accepted as the cost of the
  reliability promise.
- **Telemetry fidelity** — analytics events recorded offline are
  queued and flushed on reconnection. A small amount of event loss is
  acceptable if the device's queue overflows; that rate is expected to
  be < 0.1 % in practice.

---

## Compliance

New features, refactors, and PRs that touch any of the listed
local-first journeys (Mes Brassins, live recipe reading, measurement
recording, calculator invocation from a batch, equipment checklist)
MUST:

1. Store state locally first, queue sync operations.
2. Render the UI from local state, never block on a network call.
3. Treat network errors as informational (a banner) rather than
   blocking.
4. Emit a Decision record or ADR entry if they deviate.

New features in the cloud-first world MAY cache responses with HTTP
semantics (`Cache-Control`, `ETag`) to improve perceived latency, but
they MUST NOT build a sync engine on top of the cache.

---

## Links

- `docs/product/brainstorms/onboarding-2026-04-24.md` — §1.3 to §1.7,
  the brainstorm where this principle was validated.
- `docs/product/brainstorms/scan-2026-04-24.md` — scan flow scoped as
  cloud-first with anonymous backend (compatible with this ADR).
- ADR-0001 — Build for today, design for tomorrow. This ADR applies
  clause 2 (anticipate shape without anticipating implementation).
- ADR-0002 — Centralised NestJS backend. Unchanged by this ADR — the
  backend stays the canonical source for cloud-first journeys; local
  stores on the mobile side mirror a subset of the NestJS schema for
  local-first journeys.
- ADR-0003 — Consent as single source of truth. Unchanged.
