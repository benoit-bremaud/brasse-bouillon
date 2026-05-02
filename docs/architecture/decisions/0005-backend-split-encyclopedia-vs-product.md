# ADR-0005 — Backend split: Python beer-encyclopedia is the knowledge base, NestJS is the product

**Status**  Accepted
**Date**    2026-05-02
**Owners**  @benoit-bremaud

> **Supersedes the implicit "single backend" assumption** that ADR-0002
> ("Centralized NestJS backend for all external data sources") relied
> on. ADR-0002 itself stays valid for the **product** APIs it describes
> (auth, recettes utilisateurs, academy, feedback) — only the part
> covering external beer-data sources is replaced by this ADR.

---

## Context

Two backends have evolved in parallel inside this monorepo:

- **NestJS API** (`packages/api/`) — TypeORM, SQLite (`better-sqlite3`)
  in dev/CI, Postgres-ready for production. Owns auth, user accounts,
  user-submitted recettes, brassins, academy progress, feedback, and
  (until now) a `scan_catalog_items` table that caches beer data
  fetched from Open Food Facts on barcode scan.
- **Python beer-encyclopedia** (`packages/beer-encyclopedia/`) —
  FastAPI, async SQLAlchemy, SQLite (`aiosqlite`) in dev/CI,
  Postgres-ready for production. Owns a richer beer/brewery domain
  (`beers`, `breweries`, `styles`, `legal_denominations`, `sources`,
  `entity_sources`, `tasting_profiles`, `ingredients`,
  `community_corrections`, `media`) plus the ML pipeline
  (YOLOv8 + EasyOCR) and an Open Food Facts importer.

Both backends ended up implementing roughly the same "barcode → beer
fiche" flow with their own Open Food Facts client, their own cache,
and their own table. The mobile app today only talks to
NestJS for that flow; the Python backend, despite shipping a complete
solution in PR #847 + #848, is consumed by no production code path.

We discovered this duplication while planning to wire the mobile app
to the Python backend. Continuing to evolve both in parallel would
double the maintenance cost forever and silently fork the data: the
same beer could exist independently in `scan_catalog_items` (NestJS)
and `beers` (Python) with no synchronisation between the two.

---

## Decision

**One concern per backend.** The two backends keep coexisting, but
each owns a **clearly distinct domain** with no overlap.

### Python beer-encyclopedia = the **knowledge base**

> *"The world's beer reference, started in France."*

Owns every fact about beers, breweries, styles, regulatory metadata,
ingredients, and tasting profiles. Multi-source by design (OFF today,
Untappd / RateBeer / AI-research / community / printed books later,
all unified by `Source` + `EntitySource`). Carries no user data.
**Public-facing in vocation**: could one day be queried by other
products beyond Brasse-Bouillon.

Owns:

- `beers`, `breweries`, `styles`, `legal_denominations`
- `sources`, `entity_sources` (audit trail of ingestions)
- `tasting_profiles`, `ingredients`, `beer_ingredients`
- `community_corrections`, `media`
- The OFF importer + future Untappd / RateBeer / AI-research importers
- The ML pipeline (YOLO + EasyOCR + extractors)

### NestJS API = the **product backend**

> *"The Brasse-Bouillon app: users, their recettes, their brassins, their academy."*

Owns everything that belongs to a single user or to the Brasse-Bouillon
product specifically. Stays as the authentication + sessions + user-data
backend. Calls the Python knowledge base **read-only** when it needs
factual beer data inside a user-facing flow.

Owns:

- `users`, sessions, OAuth, password hashing
- `recipes` (user-submitted), `brassins` (brewing day calendar)
- `academy` articles + per-user progression
- Feedback, ratings, social features
- All other product-specific concerns
- **Will lose** the `scan_catalog_items` table and the `scan/` module,
  which become Python's responsibility (deprecation roadmap below).

### Mobile app

The mobile app is allowed to talk to **both** backends:

- **NestJS** for everything user-related (login, the user's recettes,
  the user's brassins, the academy progress, feedback).
- **Python beer-encyclopedia** for everything beer-fact related (the
  scan→fiche flow, beer detail browse, future catalog search).

This explicitly relaxes ADR-0002's "mobile talks only to NestJS"
constraint **for the knowledge-base axis only**. The principle
ADR-0002 defended (one integration surface for cross-source data)
still applies, just delegated to Python instead of NestJS for the
beer-data axis.

---

## Why the previous duplication is not wasted work

Both backends shipped working code. Neither effort is thrown away:

- **NestJS scan module** (`scan_catalog_items`, OFF client, `GET /scan/lookup/:ean`,
  rate limiter, "not a beer" detection) made it possible to ship the
  mobile scan UX **before** Python beer-encyclopedia was production-ready.
  It is a transitional layer that will be retired.
- **Python beer-encyclopedia** (`beers`, `breweries`, `legal_denominations`,
  `Source`/`EntitySource` audit trail, OFF importer, conservative
  refresh, regression tests around `paragraph=False`, …) is the
  long-term home. PRs #841 → #861 are **exactly** what we want;
  they were just isolated until this ADR.

The duplication is the cost of two parallel sprints discovering they
solved the same problem independently. The fix is consolidation, not
rewrite.

---

## Roadmap (deprecation of NestJS scan module)

Sequenced over post-soutenance, no soutenance blocker:

1. **Wire the mobile fallback** (this PR): when NestJS `GET /scan/lookup/:ean`
   returns 404, the mobile app calls Python `POST /beers/import-by-ean`.
   First mobile↔Python connection in production.
2. **Promote Python to primary** (separate PR, post-soutenance):
   the mobile app calls Python first, NestJS only as a transitional
   read-through cache while data migrates.
3. **ETL** (separate PR): script that copies every `scan_catalog_items`
   row from NestJS into Python `beers` (idempotent, source-tagged).
4. **Retire** (separate PR): remove the `scan/` module from NestJS
   along with its database table, OFF client, controller, service,
   and tests. NestJS `EXPO_PUBLIC_API_URL` continues to serve
   everything else.

The mobile app evolves in lockstep across these steps; no big-bang
migration on either side.

---

## Consequences

### Positive

- **Strategic clarity**: every contributor knows where new code goes
  for any given concern. No more "should this go in NestJS or Python?"
  hesitation.
- **Domain alignment**: the encyclopedia evolves toward a public-facing
  reference; the product backend evolves toward Brasse-Bouillon-specific
  features. The two stop competing.
- **Re-usability**: the Python knowledge base can one day be consumed
  by other products (a public web encyclopedia, a sommelier tool,
  partner integrations) without dragging user data with it.
- **Clear ownership of new beer-data sources**: Untappd, RateBeer,
  AI-research, community contributions, the printed-book ingestion
  (#857) all land in Python without question.

### Trade-offs

- **Two backends to operate**: both must run, both maintain their own
  schema and migrations (SQLite in dev/CI, Postgres-ready for
  production), both have CI. Mitigated by: NestJS already exists and
  is mature; Python is small and self-contained.
- **Mobile app speaks two HTTP base URLs**: a small amount of plumbing
  in `core/http/http-client.ts` to support a `baseUrl` override. Done
  in the PR that ships this ADR.
- **Temporary data fork**: between steps 1 and 4 of the roadmap, the
  same beer can transiently live in `scan_catalog_items` and `beers`.
  Acceptable because (a) reads always come from one or the other,
  never merged, and (b) the ETL step reconciles them at the cutover.

### Rejected alternatives

- **Stay single-backend (NestJS only)**: would require porting Python
  beer-encyclopedia features (legal reference, importer pattern,
  `EntitySource`, ML pipeline in TypeScript) — significantly more
  work than the consolidation we propose, with no architectural gain.
- **Stay single-backend (Python only)**: would require porting
  user-facing modules (auth, recettes, brassins, academy) to Python.
  Even more work, throws away the mature NestJS user product.
- **Sync the two backends at the data layer**: replicate beer data
  bidirectionally between the two databases. Complicates everything
  for no clear benefit; concerns are not actually shared.
- **Have NestJS proxy Python**: the mobile keeps calling NestJS,
  which forwards beer-data calls to Python. Adds one HTTP hop, hides
  the architecture from the mobile, no real upside.

---

## References

- ADR-0002 (`0002-centralized-nestjs-backend.md`) — partially
  superseded for the beer-data axis
- ADR-0001 (`0001-build-for-today-design-for-tomorrow.md`) — guides
  the "consolidate when ready, not before" cadence
- Issue #853 — DB autonomy strategy (Python-side)
- PRs #841, #847, #848, #860, #861 — Python beer-encyclopedia work
  this ADR retroactively legitimises
- Issue #696 / PR #697 — NestJS scan-lookup work, transitional
