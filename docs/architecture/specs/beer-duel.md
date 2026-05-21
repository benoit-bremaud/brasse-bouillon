# Beer duel — community preference ranking via pairwise duels

> **Status:** specification — implementation pending. Driven by epic [#1050](https://github.com/benoit-bremaud/brasse-bouillon/issues/1050) (`epic(beer-duel)`), sub-issues #1051–#1056. Priority **Nice-to-Have / v0.2+**.

> ⚠️ **Backend ownership per [ADR-0005](../decisions/0005-backend-split-encyclopedia-vs-product.md) + [ADR-0009](../decisions/0009-beer-duel-preference-data-ownership.md)** — the **NestJS API** owns the votes and the derived Elo scores (they are *ratings / social features* tied to `users.id`; the Python encyclopedia "carries no user data"). The **beer reference** inside a duel is a cross-backend pointer (NestJS `scan_catalog_items` transitionally, Python `beers` at v0.2+), enforced in application code, not as a DB foreign key. See ADR-0009 for the full rationale and the "promote aggregate ranking to encyclopedia later" escape hatch.

## 1. Vocabulary

A single source of truth for the terms used across this spec, the codebase, the issue tracker, and the mobile UI copy. **Use these terms verbatim**; do not paraphrase in code or in user-facing strings.

| Term (FR) | Term (EN) | Definition |
|---|---|---|
| Duel de bières | Beer duel | A single comparison shown to the user: two beers, side by side as cards, asking which one they prefer. The atomic unit of data collection. |
| Vote | Vote | The user's act of picking the preferred beer in a duel by tapping its card. Produces one `BeerDuelVote` with a `winner_id`. |
| Match annulé | Cancelled match | The outcome when the user taps "Je ne connais ni l'une ni l'autre". Recorded as a `BeerDuelVote` with `winner_id = null`. **No Elo points are exchanged**, but the exposure of both beers is counted (feeds the weighted pairing). |
| Refus | Dismissal | The user closes the pop-up via the cross without answering. **Nothing is persisted server-side** — it only updates the local cooldown so the pop-up does not re-appear immediately. |
| Score Elo | Elo score | A per-beer rating (default `1500`) that rises when the beer wins a duel and falls when it loses, by an amount that depends on the score gap between the two beers. Stored in `BeerEloScore`. |
| K-factor | K-factor | The Elo sensitivity constant controlling how many points change hands per match. Higher K = faster convergence but noisier. **Default `32`, env var `BEER_DUEL_ELO_K` — to be tuned with real volume.** |
| Appariement pondéré | Weighted pairing | The selection of the two beers for a duel: random, but biased toward beers with a low `exposure_count`, so coverage stays balanced and no beer is over/under-sampled. |
| Exposition | Exposure | The number of times a beer has been *shown* in a duel (win, loss, or cancelled match all count). Stored as `exposure_count` on `BeerEloScore`; drives weighted pairing. |
| Classement | Ranking | The ordered list of beers by descending Elo score. The end goal of the feature: surfaced once enough volume exists. |
| Cooldown | Cooldown | The minimum delay before the duel pop-up may re-appear after the user has voted, cancelled, or dismissed it. Persisted client-side. |

---

## 2. Why duels (pairwise) instead of a 1–5 star rating

Pairwise comparison ("I prefer A over B") is psychologically more reliable than an absolute score ("A deserves 3.5/5"): it removes the per-user scale bias (some users never give 5, some never give below 3) and is a faster, lower-friction interaction. The Elo model is purpose-built for turning a stream of pairwise outcomes into a stable global ranking, even when each user only judges a handful of pairs. This is the same family of methods used for chess ratings and "this-or-that" preference engines.

The trade-off — pairwise comparison needs **many** duels before the ranking stabilises — is exactly why this feature is gated at **v0.2+**: it only produces value once there is both a beer corpus and an active user base.

---

## 3. Canonical rules

### 3.1 Elo update

On a **vote** (one winner, one loser):

```
# note: ** / pow() is exponentiation — NOT ^ (which is bitwise XOR in TS/JS/Python)
expected_winner = 1 / (1 + 10 ** ((score_loser - score_winner) / 400))
expected_loser  = 1 - expected_winner

score_winner += K * (1 - expected_winner)
score_loser  += K * (0 - expected_loser)
```

- Default score for a never-seen beer: `1500`.
- `K = 32` by default (`BEER_DUEL_ELO_K`). To be revisited once real vote volume exists — a lower K (e.g. 16) may be warranted as the corpus matures.
- Scores are stored as floats; the ranking rounds for display only.

On a **cancelled match** (`winner_id = null`): **no score change**. Only `exposure_count += 1` on both beers (so the pair is less likely to be shown again soon, but the "I know neither" signal does not pollute the preference ranking).

### 3.2 Weighted pairing

`GET /beer-duels/next` returns two distinct beer references chosen as follows:

1. Build the candidate pool from the available beer corpus (see §4).
2. Weight each beer inversely to its `exposure_count` (e.g. `weight = 1 / (1 + exposure_count)`), so low-exposure beers are favoured. This keeps coverage even and avoids the same popular beers always duelling.
3. Draw the first beer by weight; draw the second by weight excluding the first.
4. **Never** return a pair this user has already voted on within the per-user pair cooldown (see §3.4).

Purely-random pairing (uniform draw) is the rejected simpler alternative — it over-samples whatever happens to be drawn early and biases the ranking. (Decision: **weighted**, agreed 2026-05-21.)

### 3.3 Pop-up appearance frequency

The duel pop-up is **occasional**, surfaced on the dashboard right after login — never on every visit. It reuses the client-side persisted-flag pattern of [`scan.storage.ts`](../../../packages/mobile-app/src/features/scan/data/scan.storage.ts):

- Show at most once per session.
- After any outcome (vote / cancelled / dismissed), set a cooldown before it may re-appear. **Default cooldown: 24h — to be tuned.**
- Never show if the beer corpus is too small to form a meaningful pair (guard against an empty/one-item catalog).

### 3.4 Anti-abuse

- **Authenticated only.** Votes are tied to `users.id` (contrast with the anonymous `POST /feedback` endpoint). A logged-out client never sees the duel.
- **Per-user pair cooldown.** A user cannot re-vote the same beer pair in a loop to farm a beer's score. Enforced server-side at `GET /beer-duels/next` (exclusion) and validated at `POST /beer-duels/vote`.
- **Server-side Elo computation.** The client never sends scores; it sends only the chosen `winner_id` (or `null`). The API recomputes the Elo transaction authoritatively.

---

## 4. Dependencies

| Dependency | v0.1 (transitional) | v0.2+ (target) |
|---|---|---|
| Beer corpus | NestJS `scan_catalog_items` (`ScanCatalogItem.id`) — the only "beer" object that exists today | Python encyclopedia `beers.id` once the `beer-contribution` module ships and the ADR-0005 scan deprecation roadmap completes |
| Auth | NestJS `users.id` + `JwtAuthGuard` (exists today) | unchanged |
| Beer reference type | cross-backend pointer, **not a hard FK** (per ADR-0005 / ADR-0009) | unchanged |

**Blocking note:** the duel is meaningless without a populated beer corpus *and* active users. Both conditions land naturally at v0.2+, which is why this epic is filed at `priority:nice-to-have` and not scheduled into a demo sprint.

---

## 5. Roadmap (phases + exit criteria)

| Phase | Scope | Exit criterion |
|---|---|---|
| **P0 — Spec & UML (this deliverable)** | This document + 6 Mermaid diagrams + ADR-0009 | Merged; epic + sub-issues filed |
| **P1 — Backend data + vote** | `BeerDuelVote` + `BeerEloScore` entities, migration, `POST /beer-duels/vote` (authed, cancelled-match handled), Elo update service | H/S/E tests green; a vote moves both scores; a cancelled match moves neither |
| **P2 — Backend pairing + ranking** | `GET /beer-duels/next` (weighted), `GET /beer-duels/ranking` | Pairing favours low-exposure beers; ranking returns beers sorted by Elo desc |
| **P3 — Mobile pop-up** | Duel modal on dashboard (2 beer cards + "ni l'une ni l'autre" + cross + "merci" acknowledgement), use-case layer | Tapping a card votes & thanks; "ni l'une ni l'autre" cancels; cross dismisses; all via `http-client.ts` |
| **P4 — Mobile cooldown** | Persisted appearance logic (once-per-session + cooldown) à la `scan.storage.ts` | Pop-up respects cooldown across app restarts; never shows with an empty corpus |

### Out of scope (explicit)

- A user-facing ranking screen / leaderboard UI (capture later if the data proves interesting).
- Creating the Python `beers` entity or the `beer-contribution` module (separate v0.2+ epic).
- Final K-factor and cooldown values (tuned with real data, not fixed here).
- Anti-Sybil / multi-account abuse beyond the per-user pair cooldown.
