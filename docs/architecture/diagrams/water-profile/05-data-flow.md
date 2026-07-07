# Data-flow diagram — water-profile — what flows where, and what is PII

> **Feature**: water-profile epic — slices 1 & 2 ([[project_water_profile_epic]])
> **Related ADRs**: ADR-0025, ADR-0003 (consent single source of truth), ADR-0004
> **Decisions captured**: location = coarse PII kept ephemeral in slice 1; water data = public

## Context

Traces the data and flags the **privacy boundary** that drives ADR-0025: the user's
**location** (postal code / chosen commune) is coarse PII, whereas the **water measurements**
are public ARS/Hub'Eau reference data. Slice 1 keeps the location **ephemeral** (never
persisted → no consent surface); the slice-2 cache stores **only public water data**. Persisting
the location is a **deferred, consented** flow (dashed), not part of these slices.

## Diagram

```mermaid
flowchart LR
  Brewer(("Brasseur"))
  Mobile["Mobile — onglet Eau"]
  GeoApi["geo.api.gouv.fr"]
  API["API /water"]
  HubEau["Hub'Eau"]
  Cache[("Cache mesures eau (slice 2)")]
  UserStore[("Profil utilisateur (différé)")]

  Brewer -->|"code postal — PII: localisation (grossière), éphémère"| Mobile
  Mobile -->|"code postal — PII: localisation, transit vers tiers (éphémère)"| GeoApi
  GeoApi -->|"communes + INSEE (public)"| Mobile
  Mobile -->|"code INSEE (localisation résolue, éphémère — non persistée)"| API
  API -->|"code commune → réseau + année"| HubEau
  HubEau -->|"mesures ions (public)"| API
  API -.->|"mesures (public, NON-PII)"| Cache
  API -->|"profil eau (public)"| Mobile
  Mobile -->|"profil affiché"| Brewer

  Brewer -.->|"« retenir mon eau » — PII: commune stockée (consentement ADR-0003)"| UserStore

  classDef deferred stroke-dasharray:4 3,stroke:#a67,color:#a67
  class UserStore,Cache deferred
```

## Notes

- **The privacy line**: only the **location** edges carry PII. The postal code / commune is
  coarse location; in slice 1 it is **transient** (used to resolve INSEE, then dropped) — no
  storage, **no consent surface opened**.
- **Public data ≠ PII**: the slice-2 cache holds commune water measurements (ARS/Hub'Eau public
  data). Storing it triggers **no** RGPD obligation — this is what makes the cache safe to build.
- **Deferred consented flow** (dashed `UserStore`): "remember my water" would persist the chosen
  commune (stored PII) → falls under **ADR-0003** consent + a retention decision. Explicitly out
  of ADR-0025's slices.
- **Minimisation**: we send Hub'Eau only a commune code + year; we send geo.api.gouv.fr only a
  postal code. No name, no address, no precise geolocation (lat/lon) is ever collected.
