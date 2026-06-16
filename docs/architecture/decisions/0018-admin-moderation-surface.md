# ADR-0018 — Admin/moderation surface: in-app CREATOR moderation, secured at the NestJS API

**Status**  Accepted
**Date**    2026-06-15 (accepted 2026-06-16)
**Owners**  @benoit-bremaud

> Settles the one open question left by ADR-0011 (the `CREATOR` role) and
> ADR-0015 (staging → human-gated promotion): **where** the privileged actor
> moderates the catalogue. Reconciles the contradiction between #1152
> ("dedicated web admin, never via mobile") and #940 (a mobile admin review
> screen), and re-scopes #1152 accordingly. Tracked by epic #1175.

---

## Context

- **The conception already mandates a human moderation step.** ADR-0015 (D1)
  writes every ingested `Beer` as `is_verified = false` (staging) and keeps it
  **out of the shared canonical catalogue until promoted**; (D4) the
  `false → true` promotion is performed **only** by human moderation (UC9).
  ADR-0011 defines the `CREATOR` role (single-holder, above `ADMIN`) that holds
  this authority.
- **The "where" was never reconciled.** The encyclopedia use-case study
  ([`diagrams/beer-encyclopedia/01-use-case.md`](../diagrams/beer-encyclopedia/01-use-case.md))
  and **#1152** record an intent — maintenance/moderation via a *dedicated web
  admin interface, never via mobile*. Yet **#940** already proposes a **mobile**
  admin review screen for scan suggestions, and the encyclopedia study itself
  flags scan-suggestion validation as "distinct from UC9, to reconcile". The
  position is internally contradictory.
- **"Never mobile" is not a security control.** The encyclopedia write endpoints
  have **no authentication at all today** (**#1151**, `priority:high`,
  `area:security`). Hiding a button from the mobile UI provides zero protection
  while the API is open: a deleted row earlier in this epic was removed by an
  unauthenticated `DELETE`. Access control must live at the API, not in which
  client surfaces the action.
- **The founder works on mobile.** The triggering incident — an OpenFoodFacts
  import (`is_verified = false`: a bottled water, an energy drink, a red wine)
  leaking into the public catalogue, in violation of ADR-0015 D1 — was spotted
  by the `CREATOR` while browsing the catalogue **on his phone**. He needs to act
  where he sees the problem.

---

## Decision

**Moderation is surfaced in the mobile app for the `CREATOR`, with all authority
enforced at the NestJS API boundary; moderation actions are reversible
(depublish, not hard-delete) and audited.**

1. **In-app creator surface.** A "creator mode" is visible **only** to a
   `CREATOR` (ADR-0011, via `hasAtLeast(user.role, …)`, never a raw
   `role === 'creator'`). **Build note:** the current `RolesGuard` does
   *exact-match* (`requiredRoles.includes(user.role)`), so it must migrate to the
   rank-based `hasAtLeast` (ADR-0011) — otherwise a `CREATOR` is wrongly rejected
   by an `@Roles(ADMIN)` route. It exposes **targeted** moderation actions on a single
   catalogue entry: **promote** (`is_verified false → true`, realizes UC9 /
   ADR-0015 D4), **depublish** (hide a non-conforming or erroneous entry), and
   **triage the staging queue**.
2. **Trust boundary at the API (ADR-0002).** The mobile app calls **NestJS admin
   endpoints only** — it never writes to the encyclopedia directly. NestJS
   authenticates (JWT) and authorizes (`RolesGuard`, `CREATOR` rank), then
   proxies the write to the encyclopedia service. This is the design that
   **closes #1151** at the correct layer and keeps the mobile→backend contract
   uniform (ADR-0002, ADR-0005). **Current state (not yet built):** the
   encyclopedia `POST`/`PATCH`/`DELETE` are **unauthenticated today** (#1151
   open) and the NestJS proxy layer does **not** exist yet (the
   `beer-contribution` approve path is a `501` stub) — readers must not assume
   the protection is in place; it ships with the build slice that closes #1151.
3. **Reversible + audited.** A moderation action toggles a **status**
   (publication / verification flag); it is **not** a hard `DELETE`. Each action
   records who / when / old → new in the catalog change history (**#1155**),
   compatible with the RGPD audit posture (ADR-0012). Hard delete stays an
   exceptional maintainer operation, never the default moderation gesture.
4. **Web admin console deferred, not cancelled.** The dedicated web back-office
   (#738 / #1152) becomes the home for **bulk / heavy** curation — reference-data
   seeding (UC8), mass operations, multi-maintainer workflows — and is built when
   a real need or a second maintainer appears (ADR-0001 "build for today"). The
   mobile surface covers the founder's **daily targeted** moderation.
5. **#1152 is re-scoped.** Its "no maintenance via mobile" clause is **revised**:
   targeted, role-gated, API-secured moderation **is** allowed on mobile.
   #1152 now reads "heavy/bulk curation belongs on web; security is enforced at
   the API, not by hiding the UI".

---

## Consequences

### Positive

- The `CREATOR` cleans the catalogue **where the problem is seen** (mobile),
  matching how a solo founder actually works.
- Security moves to the **API** (#1151 closed properly), instead of relying on an
  illusory client-side hiding.
- Moderation is **safe by construction**: reversible depublish + audit trail
  (#1155), no destructive default.
- No premature web-console build (KISS / ADR-0001); the heavy surface arrives
  only when justified.

### Trade-offs

- The mobile app gains a **privileged surface** → it must be strictly role-gated,
  and the API must reject **any** write that does not carry `CREATOR` (the UI is
  not the gate — the API is). Defense lives server-side.
- A compromised `CREATOR` session is **high-impact**. Mitigations: single-holder
  `CREATOR` (ADR-0011), reversible depublish + audit (#1155), and a follow-up
  **step-up confirmation** on destructive actions (tracked under the epic).

### Rejected alternatives

- **Web-admin-only now (#1152 as-is).** Heavy to build / host / secure for a solo
  pre-public project, does not match where the founder works, and — crucially —
  does **not** itself fix #1151. Deferred to when bulk curation needs it.
- **Direct mobile → encyclopedia writes.** Violates ADR-0002 and re-opens #1151;
  the encyclopedia must trust no unauthenticated caller.
- **Hard delete as the moderation action.** Not reversible, loses the audit
  trail; conflicts with #1155 and the RGPD-friendly history posture (ADR-0012).

---

## Realization

Tracked by **epic #1175**. Conception deliverables:
[`docs/architecture/diagrams/catalog-moderation/`](../diagrams/catalog-moderation/)
— use-case (Curate domain + `CREATOR`), state (entry publication lifecycle),
sequence (`CREATOR` promotes / depublishes), component (auth boundary). Build
slices: enforce ADR-0015 D1 read filter + promote the curated `internal` seed,
close #1151 (auth on writes), NestJS moderation endpoints + in-app creator mode,
UC9 queue (#1153 / #1154 / #1155).

## Relation to other ADRs

- **Depends on ADR-0011** (`CREATOR` role) and **ADR-0015** (staging /
  human-gated promotion) — this ADR decides the *surface* they left open.
- **Respects ADR-0002** (auth/authz owned by NestJS; mobile talks only to NestJS)
  and **ADR-0005** (encyclopedia / product backend split).
- **Aligns with ADR-0001** (build for today: defer the web console) and
  **ADR-0012** (audited, RGPD-friendly history).
