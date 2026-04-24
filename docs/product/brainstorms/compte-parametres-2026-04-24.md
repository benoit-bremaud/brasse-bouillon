# Brainstorm — Compte & Paramètres (2026-04-24)

**Session** : 45 min structured Q&A with the product owner.
**Status** : 7 decisions taken (A→G), adjusted with conservative MVP cuts.
**Next step** : translate into GitHub sub-issues, execute alongside the Scan Tranche 2 before the 2026-05-27 defense.

---

## Product context

`Profil` and `Paramètres globaux` are the same thing (KISS / YAGNI / DRY).
Decision recorded on 2026-04-23 and formalized as backlog item **B-45** : merge them into a single "Mon compte" screen.

The current Profil screen is read-only and exposes only three fields
(email, username, role) plus a refresh button and a logout button. This
session scopes what the merged screen must contain in the v0.1.0 MVP that
ships for the defense, and what moves to v0.2.

The goal is **not** to specify every pixel, but to lock in the axes and the
MVP scope so Tranche 2 execution stays predictable alongside the Scan work.

---

## 1. Scope axes — overview

The merged screen is organised around six functional axes plus one demo-readiness
axis. Each axis is taken one by one with an explicit cut policy for the MVP.

| Axis | Theme | MVP scope |
|------|-------|-----------|
| A | Identity (account level) | Display name + bio + **text-only avatar** |
| B | Brewer identity (stats + level + badges) | Stats + Level (N2) — badges deferred |
| C | Preferences (theme, units, notifications, privacy) | Theme full + Units **stub on one screen** + Notifications/Privacy stubs |
| D | Data & RGPD | Export stub + Delete real + **Consent collection only** |
| E | Social / community | **None in MVP** |
| F | About / support | Full "About" panel (version + commit + build + OTA info) |
| G | Demo readiness | Reviewed during rehearsal session |

---

## 2. Conservative cuts — rationale

Budget synthesis (2026-04-24) projected the total scope at 25-36 days against
24 working days available before the defense. The product owner chose the
**conservative cuts** strategy, saving approximately 7-8 days by deferring
five concrete items to v0.2 :

| Cut | MVP fallback | Saving |
|---|---|---|
| Units toggle on every screen | Single stub on one representative screen | ~2 days |
| Browseable consent log | Silent consent collection into storage | ~1 day |
| Badges (complete set) | Level only (N2), no badge grid | ~2 days |
| Avatar upload | Text-only initial avatar | ~0.5 day |
| RGPD ZIP export (real build) | "Coming soon" stub message | ~1 day |

**Net MVP estimate** : ~18 days of focused work for the merged screen, fitting within
the 24-day runway once Scan Tranche 2 is factored in.

---

## 3. Axis A — Identity

### Scope — MVP

- Editable **display name** (required).
- Editable **bio** (free text, reasonable max length).
- **Text-only initial avatar** : first letter of the display name rendered in
  a coloured disc. No upload pipeline, no crop, no storage of an image blob
  in the MVP.

### Deferred to v0.2

- Change email / change password (requires backend verification flows — out of
  scope until auth is fully wired, cf. B-13 bis).
- Real avatar upload (cropping, resizing, CDN storage).
- Social login linking.

### Rationale

Text-only avatar removes image pipeline complexity (native picker,
cropping, upload, CDN, moderation) while still giving a personalised visual
on the screen and across the app. One-line fallback : the user can always
adjust their display name to drive the initial, which is the only creative
degree of freedom they need for the defense demo.

---

## 4. Axis B — Brewer identity

### Scope — MVP (Level N2 : Stats + Level)

- **Brewer stats card** : number of active batches, number of authored
  recipes, number of submitted scans. Values are read from existing data
  sources, no new backend endpoint required.
- **Brewer level** : one of `Apprenti` / `Brasseur` / `Maître Brasseur`,
  computed from stats with published thresholds (see Appendix).
- **Public vs private toggle** : deferred, defaults to private — no community
  surfaces exist in MVP.

### Deferred to v0.2

- Full badge grid with earned / locked states.
- Authored recipes list, ratings history, scan submissions list.
- Public profile URL.

### Rationale

Stats + Level is already a strong visual on the screen and carries the
narrative ("Marie is an Apprentice today — she'll become Brasseur on her
10th batch"). A full badge grid needs artwork, trigger rules, and a
notification system — all of that is discretionary for v0.1.

---

## 5. Axis C — Preferences ("soyons fou")

### Scope — MVP

- **Theme** : system / light / dark, applied across every screen via the
  existing theme tokens.
- **Units** : stub on **one representative screen** (Recipe detail) — a
  metric ↔ imperial toggle that changes the displayed units on that screen
  only, with the plumbing written so it can be extended to the rest of the
  app in v0.2 without refactor.
- **Notifications** : three stub sections (Batches alerts, Community, Releases)
  each with a per-channel switch. Switches persist locally but do not wire a
  real push / email pipeline in MVP.
- **Privacy** : telemetry opt-in/out + ML training opt-in/out. Consent values
  are written through to the same consent store used by the Scan feature so
  there is a single source of truth.

### Deferred to v0.2

- Units toggle applied on every screen (Recipes list, Batches, Ingredients,
  Tools, Labels…).
- Real push notifications pipeline (Expo Notifications + backend dispatch).
- Real email notifications pipeline.

### Rationale

Theme is cheap and a visual wow for the jury. Units **stub on one screen**
proves the pattern without paying for app-wide coverage — the architecture
is designed forward (`build for today, design for tomorrow`, ADR-001) so
the extension to other screens is a linear v0.2 task, not a refactor.
Notifications stubs keep the screen credible without taking on the
dispatch infrastructure.

---

## 6. Axis D — Data & RGPD

### Scope — MVP

- **Export my data** : button + "Coming in v0.2 — your data is safe and
  exportable on request" message. No ZIP builder in MVP.
- **Delete my account** : real deletion pipeline. Confirmation modal with
  typed confirmation (the user types their username to enable the destructive
  button), grace period of 30 days documented in the modal copy, hard delete
  after the grace period.
- **Consent log** : collection only. Every consent decision (Scan axes,
  Privacy toggles) is written into local storage with a timestamp and the
  decision value. No UI to browse the log in MVP.

### Deferred to v0.2

- Real ZIP export (account + batches + recipes + scans + labels), async with
  email notification.
- Browseable consent log UI.
- Cookie / tracker preferences (we have none today).

### Rationale

The RGPD obligation that matters for the defense is **the ability to delete
an account**. Export is a "coming soon" message that keeps the regulator
happy without a build cost. Consent is collected silently — the legal trace
exists, the UI to browse it is nice-to-have.

---

## 7. Axis E — Social / community

### Scope — MVP

**None.** No community surfaces in the merged screen.

### Deferred to v0.2+

- Public profile URL.
- Followers / following.
- Recipes I authored (list view).
- My ratings.

### Rationale

Community is a full vertical on its own (see Scan brainstorm §D — the
community concept the Scan feature depends on). Until the community vertical
ships, there is nothing to surface on this screen.

---

## 8. Axis F — About / support ("full panel")

### Scope — MVP

- **App version** (e.g. `v0.1.0-alpha2`), read from `expo-constants`.
- **Commit hash** (short SHA), injected at build time.
- **Build date**, injected at build time.
- **OTA channel info** (release channel + last OTA update timestamp), read
  from Expo Updates APIs.
- **What's new** link pointing at `CHANGELOG.md` (external link in MVP).
- **Legal** : terms, privacy policy, mentions légales — pages exist as
  static screens with placeholder copy, real text lands during the defense
  rehearsal week.
- **Acknowledgements** : credits + open-source licences auto-generated.

### Deferred to v0.2

- In-app help centre.
- In-app contact support form (mailto for now).

### Rationale

The About panel is **small surface, high jury value** : it proves the app
is versioned, tagged, reproducibly built. Ships alongside B-70 (version
display) scheduled this afternoon.

---

## 9. Axis G — Demo readiness

Reserved for the defense rehearsal session. The content reviewed there :

- Which screen opens first when the jury taps "Compte" from the bottom nav.
- The pre-populated "Marie" stats that make the brewer-level card look alive.
- The Units toggle demo line on Recipe detail.
- The Theme toggle sequence (system → dark → light) on stage.

The rehearsal decisions are not scoped here — they are rehearsal output.

---

## 10. Decomposition into codable chunks

For the translation into GitHub sub-issues :

| # | Chunk | Effort | Suggested order |
|---|-------|--------|-----------------|
| 1 | Merge `Profil` + `Paramètres globaux` routes into a single `Compte` screen (remove the duplicate entry in "Voir plus") | 0.5 day | 1 |
| 2 | Axis A — Display name + bio + text-only initial avatar | 1 day | 2 |
| 3 | Axis B — Brewer stats card + Level computation + display | 1.5 days | 3 |
| 4 | Axis C — Theme toggle full + Units stub on Recipe detail + Notifications/Privacy stubs | 2 days | 4 (parallel to #3) |
| 5 | Axis D — Delete account real + consent collection plumbing | 1.5 days | 5 |
| 6 | Axis F — About panel (version, commit, build date, OTA info) | 0.5 day | Parallel, ties into B-70 |
| 7 | QA pass + screenshots for the defense deck | 0.5 day | End |

**Total estimate** : ~7-8 focused dev days on the merged Compte & Paramètres
MVP — fits alongside Scan Tranche 2 within the remaining runway.

---

## 11. Complete decisions — Summary table

| # | Category | Decision |
|---|----------|----------|
| 1 | Architecture | Merge `Profil` + `Paramètres globaux` into a single `Compte` screen (B-45) |
| 2 | Axis A (identity) | Display name + bio editable + text-only initial avatar |
| 3 | Axis A deferred | Email / password change + real avatar upload → v0.2 |
| 4 | Axis B (brewer) | Stats card + Level N2 (Apprenti / Brasseur / Maître Brasseur) |
| 5 | Axis B deferred | Badges grid + authored recipes list + public profile → v0.2 |
| 6 | Axis C (prefs) | Theme full + Units stub (one screen) + Notifications/Privacy stubs |
| 7 | Axis C deferred | Units on every screen + real notification pipelines → v0.2 |
| 8 | Axis D (RGPD) | Export stub message + Delete real + Consent collection only |
| 9 | Axis D deferred | Real ZIP export + browseable consent log → v0.2 |
| 10 | Axis E (social) | None in MVP |
| 11 | Axis F (about) | Full panel : version + commit + build + OTA channel |
| 12 | Axis G (demo) | Reserved for rehearsal session |
| 13 | Cuts strategy | Conservative cuts — ~7-8 days saved vs full scope |
| 14 | Consent source of truth | Shared consent store with Scan feature |
| 15 | Principle | Build for today, design for tomorrow (ADR-001) |

---

## 12. Session follow-up actions

- [ ] Translate decisions into GitHub sub-issues (afternoon planning session).
- [ ] Ship B-70 (version display in About panel) — 30 min coding slot today.
- [ ] Align consent storage schema with Scan feature (cross-reference in
      ADR-001 implementation).
- [ ] Reserve a dedicated rehearsal slot for Axis G (demo readiness) during
      the week of 2026-05-20.

---

## Appendix — Brewer level thresholds

For the MVP level computation :

| Level | Trigger |
|-------|---------|
| `Apprenti` | < 5 batches brewed |
| `Brasseur` | 5-19 batches brewed |
| `Maître Brasseur` | 20+ batches brewed |

Thresholds are placeholders — adjusted during defense rehearsals to make
Marie's seed data land on an interesting level.
