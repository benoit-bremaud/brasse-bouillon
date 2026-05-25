# ADR-0011 — Introduce a single-holder `CREATOR` role above `ADMIN`

**Status**  Proposed
**Date**    2026-05-25
**Owners**  @benoit-bremaud

> Records the RBAC decision surfaced by the account/profile conception
> (PR #1100) and tracked by epic #821.

---

## Context

The API role enum (`packages/api/src/common/enums/role.enum.ts`) today has three
values: `USER`, `MODERATOR`, `ADMIN`. The product needs a **supreme owner** role
above `ADMIN` — the founder/super-admin who can do everything an admin can plus
manage admins themselves (grant/revoke `ADMIN`, hold ownership of the platform
account, seed-once operations).

Reusing `ADMIN` for this is unsafe: any admin could then demote/lock out the
owner. A distinct top role makes "who can manage admins" unambiguous.

---

## Decision

**Add a `CREATOR` role as the highest privilege, held by exactly one account,
seeded once.**

- `UserRole` stays a **string enum**; privilege order is expressed by an explicit
  rank map, not by comparing the strings. Define `ROLE_RANK = { user: 0,
  moderator: 1, admin: 2, creator: 3 }` and a helper
  `hasAtLeast(role, min) => ROLE_RANK[role] >= ROLE_RANK[min]`.
- **Single-holder invariant**: at most one `CREATOR` exists, created by a
  one-time seed; the role is **not** grantable through the normal role-assignment
  UI/endpoint. Enforced in application code + a DB uniqueness guard.
- `CREATOR` inherits all `ADMIN` capabilities and additionally may assign/revoke
  `ADMIN`/`MODERATOR`.
- Authorization checks use the rank helper, so an admin-or-above check is
  `hasAtLeast(user.role, UserRole.ADMIN)` — never a raw `role === 'admin'` or a
  string `>=`.

---

## Consequences

### Positive

- Unambiguous platform ownership; admins cannot lock out the owner.
- Seed-once + non-grantable closes the privilege-escalation path to the top role.

### Trade-offs

- The single-holder invariant must be enforced in **two** places (app guard + DB
  constraint) and covered by tests — a uniqueness rule, not just data.
- Existing role checks that used `=== ADMIN` must migrate to
  `hasAtLeast(role, ADMIN)` to avoid accidentally excluding `CREATOR`.

### Rejected alternatives

- **Reuse `ADMIN`** — no protection against an admin demoting the owner.
- **A boolean `isOwner` flag on `users`** — splits authorization across an enum
  and a flag; the ordered enum keeps one source of truth for privilege.

---

## References

- Account/profile UML [`docs/architecture/diagrams/account/`](../diagrams/account/) (class `Role`).
- Epic #821 (CREATOR role). Role enum `packages/api/src/common/enums/role.enum.ts`.
- [ADR-0002](0002-centralized-nestjs-backend.md) — auth/authz owned by NestJS.
