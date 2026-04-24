# ADR-0002 — Centralized NestJS backend for all external data sources

**Status**  Accepted
**Date**    2026-04-24
**Owners**  @benoit-bremaud

---

## Context

The Scan feature needs data about a bottle after a barcode is captured.
In v0.1 the only source is OpenFoodFacts. In v0.2 and beyond we
anticipate adding Wikipedia (for brewery stories), Untappd and RateBeer
(for community ratings), brewery websites (for official published
recipes), and a private database (for recipes submitted by our own
community). Similar cross-source needs exist for the Ingredients and
Equipment catalogues when they graduate from seed data to live data.

Two architectures compete:

- **Mobile talks directly to each external API.** Short-term speed; the
  mobile team wires an HTTP client per provider.
- **Mobile talks only to our NestJS backend, which proxies every
  external source.** One integration surface for the mobile app, one
  place to manage keys, caches, and retries.

---

## Decision

The mobile app talks **only** to our NestJS backend. The backend proxies
every external data source.

```
┌─────────────┐         ┌──────────────────┐
│ Mobile app  │ ──────▶ │  NestJS backend  │
└─────────────┘         └──────────────────┘
                              │    │    │
                              ▼    ▼    ▼
                           ┌────┐ ┌──┐ ┌──┐
                           │ OFF│ │WP│ │DB│
                           └────┘ └──┘ └──┘
```

Concretely:

- The mobile app's **sole HTTP client** points at the NestJS base URL.
- Every external API integration (OpenFoodFacts today; Wikipedia /
  Untappd / RateBeer / brewery scrapers tomorrow) lives server-side.
- The backend owns **caching** (in-memory now, Redis when justified),
  **retry / timeout** policies, and **response shape normalisation**
  (mobile sees a single canonical `BeerData` regardless of the source
  chain that produced it).
- External API **credentials** (keys, tokens, OAuth secrets) are held
  server-side. None ever ships in a mobile bundle.

---

## Consequences

### Positive

- **No key leakage on mobile.** API credentials for paid or
  rate-limited sources never reach the device.
- **One mobile surface.** Adding a new data source is a server-side
  task. No mobile deployment, no App Store / Play Store wait, no
  forced client-side update.
- **Central caching and rate-limiting.** A cache hit on the server
  serves every mobile client. OpenFoodFacts free-tier rate limits do
  not leak into UX flakiness per user.
- **Response normalisation.** Mobile consumes a stable `BeerData`
  shape. Source substitution (OFF → brewery API for a given SKU) is
  invisible to the mobile code.
- **Aligned with ADR-0001.** The `source` discriminant on `BeerData`
  exists from day one even though only `'openfoodfacts'` is populated
  in v0.1.

### Negative

- **Extra hop on every request.** Mobile → backend → external source
  adds network latency. Mitigated by the server-side cache (1-hour
  TTL on the Scan responses in v0.1).
- **Backend becomes a single point of failure.** If our NestJS API is
  down, mobile cannot scan even if OpenFoodFacts is up. Mitigated
  short-term by bundling six demo beers in the app (see
  `docs/product/brainstorms/scan-2026-04-24.md` § 4.3) and by the
  1-hour memory cache; long-term by health-check monitoring and
  autoscaling.
- **Server cost.** Proxying every call means we pay compute and
  bandwidth for traffic that could have gone peer-to-peer with OFF.
  Acceptable at v0.1 volumes; revisit if the scan volume crosses
  paying-tier thresholds.

---

## Roadmap

- **v0.1 (pre-defense)** — single endpoint `GET /beers/:barcode`
  proxying OpenFoodFacts, with a 1-hour in-memory cache. 501 stubs
  for `POST /beer-contributions` and community endpoints (per
  ADR-0001 clause 3).
- **v0.2** — add Wikipedia enrichment + a real beer DB for
  hand-curated official recipes (BrewDog DIY Dog, Chouffe, Rochefort,
  Karmeliet). Redis cache replaces in-memory.
- **v0.3+** — Untappd / RateBeer integrations (paid APIs) ship behind
  a feature flag that **actually gates a running feature**, not a
  speculative one — so the flag complies with ADR-0001's
  "Feature flags for non-existent features" anti-pattern (the
  feature exists and the flag controls its exposure, which is a
  legitimate usage, not an exception).

---

## References

- `docs/product/brainstorms/scan-2026-04-24.md` § 4 — original
  architecture decision captured during the Scan Q&A.
- ADR-0001 — "Build for today, design for tomorrow" — dictates that
  the `source` discriminant and the 501-stub endpoints exist from day
  one.
