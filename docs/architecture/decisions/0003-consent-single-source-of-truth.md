# ADR-0003 — Consent as a single source of truth

**Status**  Accepted
**Date**    2026-04-24
**Owners**  @benoit-bremaud

---

## Context

Two independent features both collect user consent decisions:

- **Scan** — at the moment the user first uses the scanner, four
  consent axes are gathered (barcode value storage, photo storage,
  metadata collection, ML-training opt-in). Each axis is stored with
  the pending scan and can be revoked by purging local scan data.
- **`Compte` screen (Axis C, "Privacy" section)** — the future
  account / settings screen exposes two global toggles: telemetry
  opt-in / opt-out and ML-training opt-in / opt-out. The second
  overlaps directly with the Scan `training` axis.

If these two surfaces each write to their own storage, the user
experiences contradictions: toggling ML training off in the settings
screen may leave the Scan store still recording training data, or
vice-versa. That is a GDPR consistency failure.

---

## Decision

We commit to **one canonical consent store** on the mobile app. Every
feature that reads or writes a consent decision uses this store.

### Canonical shape

```ts
// domain/consent/consent.types.ts
interface ConsentDecision {
  axis: ConsentAxis;           // 'scan.barcode' | 'scan.photos' |
                                //  'scan.metadata' | 'ml.training' |
                                //  'telemetry' | …
  value: boolean;
  decidedAt: string;            // ISO timestamp
  source: ConsentSource;        // 'scan.onboarding' | 'settings.privacy'
                                //  | 'scan.purge' | …
}
```

- **Axis** is a stable identifier, namespaced by feature prefix when
  the axis is feature-local (`scan.barcode`, `scan.photos`,
  `scan.metadata`) and un-prefixed when it crosses features
  (`ml.training`, `telemetry`).
- **Source** records *where* the decision was taken, for audit
  purposes (the user flipped telemetry off from the Settings screen;
  the user granted scan.training from the onboarding modal).

### Write and read contracts

- **Writers** (Scan onboarding modal, Settings privacy toggles, any
  future surface) **must** go through the `consent.use-cases.ts`
  use-case. Direct writes to `AsyncStorage` / `SQLite` are forbidden.
- **Readers** query the use-case for the latest decision per axis.
  If a feature needs both a feature-local axis and the global axis,
  it reads both (e.g. ML training in Scan reads `scan.training` OR
  `ml.training`, falling back to `false`).
- A decision is **never overwritten silently**. Every new write
  appends a new `ConsentDecision` record. The current value is the
  latest record per axis. This gives us a free consent log for GDPR.

### Storage

- v0.1 — local `AsyncStorage` JSON blob keyed by axis.
- v0.2 — when auth lands (see ADR-0002's roadmap), the consent log
  syncs to the backend and becomes downloadable / deletable on
  request.

---

## Consequences

### Positive

- **No cross-surface contradictions.** Toggling ML training off in
  the Settings privacy section immediately hides training data from
  the Scan flow, and vice-versa.
- **Free GDPR consent log.** The append-only store IS the consent
  history the regulator expects. Per the `Compte` brainstorm (Axis
  D, conservative cuts), the v0.1 MVP collects the log silently; v0.2
  adds the browseable UI, but no data backfill is needed because the
  v0.1 store is already the right shape.
- **Testability.** A single use-case to mock in unit tests for Scan,
  for Settings, and for any future consent-touching feature.
- **Aligned with ADR-0001.** The axis namespace (`scan.*`, `ml.*`,
  `telemetry`) is wider than what v0.1 uses, but that is intentional
  — the shape anticipates v0.2 axes (push notifications, social
  sharing) without needing a store migration.

### Negative

- **Two-axis reads.** A feature that cares about "ML training
  allowed?" has to read both `scan.training` and `ml.training`. We
  encapsulate this in a small helper (`canUseForTraining()`) so the
  two-axis logic does not leak into presentation code.
- **Append-only store grows.** A very chatty user could accumulate
  hundreds of records over time. Acceptable at v0.1 volumes. v0.2
  compaction (keep only the last N records per axis for display,
  full log for regulator export) is a known migration, documented
  in the roadmap.

---

## Roadmap

- **v0.1 (pre-defense)** — single `AsyncStorage` store, two writers
  (Scan onboarding, Settings privacy), namespaced axes.
- **v0.2** — backend sync when auth is wired (B-13 bis resolved),
  browseable consent log UI in the Settings screen, real GDPR
  export.
- **v0.3+** — compaction policy for old records; export format
  negotiation with any external regulator reporting requirement.

---

## References

- `docs/product/brainstorms/scan-2026-04-24.md` § 2 — Scan consent
  axes decided.
- `docs/product/brainstorms/compte-parametres-2026-04-24.md` § 6 —
  `Compte` screen Axis D (GDPR) decided to plumb consent into the
  same store as Scan.
- ADR-0001 — "Build for today, design for tomorrow" — dictates that
  the v0.1 store shape carries the v0.2 axes already.
- ADR-0002 — "Centralized NestJS backend" — sets the contract for
  the v0.2 backend sync.
