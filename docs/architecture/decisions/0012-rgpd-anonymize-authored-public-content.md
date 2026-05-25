# ADR-0012 — On account deletion, anonymize authored public content (don't hard-delete)

**Status**  Proposed
**Date**    2026-05-25
**Owners**  @benoit-bremaud

> Records the RGPD decision surfaced by the account/profile data-flow conception
> (PR #1100, `account/06-data-flow.md`) and epic #645.

---

## Context

A user may exercise their RGPD right to erasure (art. 17). But a user can also
author **public** content others depend on: published recipes that other brewers
have **cloned** (clone → a new private root with `importedFromRecipeId` provenance,
per the recipes conception). Hard-deleting an account that authored public
recipes would either break those clones' provenance/lineage or cascade-delete
content other users legitimately reuse.

We must reconcile the user's erasure right with the integrity of content the
community has built on.

---

## Decision

**On account deletion, erase personal data but anonymize authored *public*
content rather than hard-deleting it.**

- **Erase**: identity + PII (email, names, avatar, preferences, sessions),
  private recipes/batches/labels the user did not publish, and the link from
  public content to the personal identity.
- **Anonymize, keep**: published (public) recipes the user authored are
  re-attributed to an `"Auteur supprimé"` / anonymized owner — the **content and
  its lineage survive** (clones keep working, provenance stays valid) but carry
  no PII.
- **Export (art. 20)** returns the full personal bundle (incl. the user's own
  recipes/batches) to the app, which writes the file locally (the API does not
  write it) — per the data-flow diagram.
- Deletion + anonymization run server-side in one transaction; the operation is
  idempotent and logged (without PII) for audit.

---

## Consequences

### Positive

- Honours erasure (no PII remains) **and** preserves community content + clone
  lineage — no orphaned/broken provenance.
- Public recipes don't vanish from under other users who cloned/brew them.

### Trade-offs

- "Anonymize vs erase" is a per-entity policy the deletion service must encode
  (private → erase, authored-public → anonymize); needs tests per entity type.
- An anonymized author is a tombstone identity that must never be reused or
  re-personalised.

### Rejected alternatives

- **Hard-delete everything the user authored** — breaks clones' provenance and
  removes content others rely on; also risks referential dangling.
- **Refuse deletion while the user has public content** — violates the erasure
  right; not acceptable.
- **Keep the author name but drop the account** — leaves PII (the name) in public
  content; fails erasure.

---

## References

- Account/profile data-flow [`docs/architecture/diagrams/account/06-data-flow.md`](../diagrams/account/06-data-flow.md).
- Recipes UML [`docs/architecture/diagrams/recipes/`](../diagrams/recipes/) (clone/version lineage, provenance).
- [ADR-0003](0003-consent-single-source-of-truth.md) — consent SSOT.
- Epic #645 (profile completion incl. RGPD export + delete).
