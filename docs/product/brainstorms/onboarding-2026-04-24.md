# Brainstorm — Onboarding & Auth (2026-04-24)

**Session** — ~90 min structured Q&A with the product owner.
**Status** — 20 decisions taken and validated across 3 phases (scope / identity / scan auth pattern). 2 phases parked for a future session (UX redesign + stack selection).
**Next step** — Phase 4 (UX redesign of the signup/login forms) and Phase 5 (auth stack selection: Custom NestJS JWT vs Supabase vs Clerk vs Firebase). Both in a future session, then translate into GitHub sub-issues for pre-soutenance execution.

---

## Product context

The Onboarding journey is Tier 1 in the demo narrative. It is the first screen the jury will see on 2026-05-27. Today, the auth page is a 3-tab form (login / signup / forgot-password) that is not wired to the backend (B-13 bis) and that the product owner flagged as *"nulle à chier"* — to be redesigned from scratch.

This session does **not** redesign pixels. It scopes what an account is *for*, how it is acquired, what it requires, and how the scan hero (Tier 1 journey #2) interacts with it. The UX redesign and the stack selection happen in a follow-up session, once the scope is unambiguous.

The session also surfaces a fundamental tension between two data-locality needs: most of the app benefits from a cloud-first backend (sync + community + persistence), but the **brewing assistant journey** cannot afford to lose network during a live brew. This tension is resolved explicitly.

---

## 1. Scope & philosophy

### 1.1 Value of an account (what does it unlock?)

**Decision** — An account unlocks **three** distinct values in Brasse Bouillon:

1. **Persist user-owned data** — recipes, batches, favourites, scan history, personal notes. Without an account, data is bound to the device and vanishes on reinstall.
2. **Sync across devices** — the same user opens mobile + tablet + web and retrieves their state. Implies a real-time backend.
3. **Participate in the community** — publish recipes, rate, comment, earn reputation. Account = public identity on the platform.

All three values are in scope. The account is therefore a full identity (not just a sync key or a rating pseudonym).

### 1.2 Account gating — Pattern β Hybrid

**Decision** — **Hybrid gating**: the app is usable in guest mode for discovery, browsing and scanning; the account is required only for actions that need identity.

Details of what requires an account vs what is guest-accessible are finalised in §3 (Scan auth pattern debate) because the scan is the central acquisition hook. The principle is: *never force signup at app open, always at the moment of realised value*.

### 1.3 Data locality — hybrid principle

The session validated a **hybrid principle** instead of a single-mode architecture:

> **Critical-path operations during an active brewing session MUST work 100% offline. Every other journey is cloud-first with HTTP cache fallback.**

This principle decouples two worlds cleanly:

- The **brewing assistant** is local-first by necessity (a brew day lasts 4-6 hours in a garage, often without wifi; losing network mid-boil ruins the batch).
- Every other journey (discovery, auth, community, scan, calculators) is cloud-first because it benefits from real-time sync and a shared backend; offline is a *nice-to-have* tolerated via HTTP caching, not a hard requirement.

### 1.4 Critical-path framework — 4-level criticality scale

For every user journey, we score the criticality of *losing network mid-action*:

| Level | Symbol | Definition | Consequence if offline |
|---|:---:|---|---|
| **Critical** | 🔴 | Network loss = data loss or irreversible missed step | Batch ruined, measurement lost, timer stopped |
| **High** | 🟠 | Network loss = broken UX, action blocked | Recipe unreadable mid-brew, checklist inaccessible |
| **Medium** | 🟡 | Network loss = tolerable degradation | Recommendation missing, image not loaded |
| **Low** | 🟢 | Network expected, failure = "retry" acceptable | Publish recipe, see community, log in |

**Rule of decision**: every journey scored 🔴 or 🟠 MUST go local-first. Journeys scored 🟡 or 🟢 are cloud-first with cache.

### 1.5 Critical paths inventory (validated)

Applying the framework to the current feature tree:

| # | Journey | Score | Justification |
|---|---|:---:|---|
| C1 | Brew session active (cooking in progress) | 🔴 | Timer + critical measurements, loss = ruined batch |
| C2 | Consulting a recipe during brewing | 🔴 | Hands in the kettle, next step must load |
| C3 | Recording a measurement (OG, FG, temp) | 🔴 | Point-in-time data, loss = false log |
| C4 | Boiling / mashing timer | 🔴 | A timer stopped by 4G = ruined beer |
| C5 | Equipment checklist before brew | 🟠 | Frustrating but recoverable |
| C6 | Calculator during brewing | 🟠 | Decision imminent, loss = improvise |
| C7 | Ingredient sheet (mid-shopping, mid-brew) | 🟠 | Hassle not to know if a malt fits the recipe |
| C8 | Scanning a bottle (at a bar, friend's place) | 🟡 | Often no wifi, but retry-friendly |
| C9 | Reading an Academy article | 🟡 | Pleasant offline (transit), not critical |
| C10 | Tasting notes post-brewing | 🟠 | Impression fades, if we cannot write it is lost |
| C11 | Login / signup | 🟢 | Network expected |
| C12 | Publishing a recipe to the community | 🟢 | Can be queued |
| C13 | Reading / rating a community recipe | 🟡 | Read cache possible |
| C14 | Profile / settings edit | 🟢 | No impact |
| C15 | Passive fermentation measurements (day 3/5/7) | 🟠 | Ad-hoc moment, if network down we lose the data unless queued |

**Result** — 4 🔴 + 6 🟠 = **10 journeys where local-first is required**. They all revolve around Mes Brassins and the brewing assistant, with transversal dependencies on calculators, ingredient sheets, and recipe detail.

### 1.6 Brew phases inventory (validated)

Drilling into the 11 brewing phases themselves:

| # | Phase | Typical duration | Score | Justification |
|---|---|---|:---:|---|
| 1 | Recipe selection | 10-30 min, pre-brew | 🟡 | Usually on couch, if offline the recipe is already cached |
| 2 | Ingredient preparation | 30-60 min | 🟠 | Checklist + weighing while reading the recipe |
| 3 | Mashing | 60-90 min | 🔴 | Temperature hold 65-72 °C, timer active, spot measurements |
| 4 | Lautering / sparging | 30-60 min | 🔴 | Continuous, volumes real-time, sparge water temp |
| 5 | Boiling & hopping ⭐ | 60-90 min | 🔴 | **The most critical phase.** Hop additions at precise minutes |
| 6 | Chilling | 20-60 min | 🟠 | Temperature tracked for yeast pitch |
| 7 | Pitching + primary fermentation | 5-14 days | 🟠 | Pitch moment 🔴, then passive 🟡 — average 🟠 |
| 8 | Secondary fermentation (optional) | 1-3 weeks | 🟡 | Ad-hoc measurements, no timer, tolerates delayed offline |
| 9 | Maturation / conditioning | 2-8 weeks | 🟢 | Fully passive |
| 10 | Bottling | 2-4 h active | 🟠 | Priming sugar calc critical, sanitization checklist |
| 11 | Carbonation & storage | 2-6 weeks | 🟢 | Passive, occasional taste checks |

**Result** — 3 🔴 + 4 🟠 + 2 🟡 + 2 🟢 = 11 phases. The **core brew day** (phases 2 → 6, Preparation → Chilling) = **5-6 continuous hours** where the brewer is standing, hands dirty, potentially offline. This is the **sacred zone** for local-first.

### 1.7 Final scope of local-first

**Decision** — The local-first scope is bound to **Mes Brassins** (the full flow from batch creation to bottling) plus its direct dependencies:

- Linked recipe detail (read-only during brew)
- Referenced ingredient sheets (read-only)
- Contextual calculators (IBU, ABV, carbonation)
- Local measurement + observation journal
- Equipment checklist

Everything else (onboarding, auth, community reads, community writes, scan, discovery, shop, academy, labels, profile, settings) is **cloud-first with HTTP cache**.

---

## 2. Identity minimum — signup content

### 2.1 Signup philosophy — Progressive mix

**Decision** — **Progressive mix** pattern (Duolingo, Linear style):

1. **Minimal signup form** — just email + password (or Google OAuth). One screen, 3 fields max.
2. **Optional onboarding right after signup** — 2-3 questions to personalise the experience. Skippable. Default values if skipped.
3. **Everything else** — editable later from the merged Compte & Paramètres screen (see brainstorm compte-parametres-2026-04-24.md).

Rejected alternatives:

- **Minimum friction** (Medium/Notion pattern): too pauvre, the profile stays empty and the community UX lacks texture.
- **Full identity at signup** (Untappd/Strava pattern): conversion-killer at the critical moment.

### 2.2 Auth methods — Google OAuth (primary) + password (fallback)

**Decision** — Both methods offered side by side, Google promoted visually.

Rationale:

- Google OAuth = 2-tap login, industry-standard, zero friction for users already signed in Chrome / Android.
- Password = universal fallback for users who refuse Google or do not have a Google account.
- Magic link (passwordless) = rejected for v0.1; the FR brewer audience (30-50 y/o) is not ready for this pattern, and it requires solid SMTP.
- Apple Sign in — deferred to v0.2 when iOS build is prioritised (today the mobile app is Android-first via Expo).

### 2.3 OAuth + password rule — Simplified v0.1

**Decision** — One user = one email = one canonical account, with an array of linked providers.

Rules:

- Signup with Google → account created with `providers: ['google']`.
- Signup with password → account created with `providers: ['password']`.
- Adding a second method (e.g. adding a password to a Google account) happens in Paramètres > Sécurité: the user is re-authenticated, the additional method is configured, the `providers` array is extended.
- **No auto-merge in v0.1** — if a user tries to sign up with password for an email that already exists as Google, we display a clear message ("This email uses Google, tap 'Sign in with Google'") and refuse the signup. Auto-merge is deferred to v0.2, when email verification will be solid enough to gate it safely.
- **Removal rule** — a provider cannot be removed if it is the last remaining method on the account.

This rule is industry-standard (Apple, Shopify, Google itself) and protects against account takeover via a compromised OAuth provider.

### 2.4 Email verification — Optional, gating community writes only

**Decision** — Email verification is sent but not required to use the app.

Rules:

- Signup → welcome email sent with a verification link.
- The app is fully usable immediately after signup, verified or not.
- Community **write actions** (publish recipe, rate, comment) are gated on `email_verified = true`. Reading and browsing are not gated.
- The verification link is valid 24 h, regenerable from the Profile screen.

This preserves signup conversion while protecting the community from spam and sockpuppets.

### 2.5 Onboarding skippable — content

**Decision** — After signup, a single screen "Personalise your experience" with the following fields, all optional, skip button clearly visible:

| Field | Type | Default if skipped | Impact |
|---|---|---|---|
| Display name | Text (30 chars) | Derived from email (`marie.dupont@gmail.com` → `marie.dupont`) | Community attribution |
| Avatar | Photo upload or emoji picker | Default generated from display name initials | Community, profile |
| Experience level | Select (Débutant / Amateur / Expert) | Amateur | Routes the app mode (essential vs expert on calculators) |
| Preferred beer styles | Multi-select (IPA, Stout, Saison, Lambic, Lager, Witbier, Porter, Sour, Belgian, Other) | Empty | Personalises discovery + recommendations |
| Unit system | Segmented (metric / imperial) | Metric | Binds to Epic #713; display-layer only |

The screen has a "Continue" button (confirms the answers) and a "Skip for now" link (applies defaults, closes the screen).

### 2.6 Session duration — 30 days + silent refresh

**Decision** — **Long token 30 days + silent refresh** (Instagram / TikTok pattern).

Rules:

- Access token: short-lived JWT (15-30 min).
- Refresh token: 30 days, stored in `expo-secure-store` on mobile (never in AsyncStorage — security requirement).
- Silent refresh in the background when access token expires; user never sees it.
- Biometric re-auth (FaceID / TouchID / Android biometric prompt) — deferred to v0.2, not needed for v0.1 demo.
- Manual logout revokes both tokens server-side.

### 2.7 Password recovery — Email reset link

**Decision** — Standard email reset link, not 6-digit code.

Rules:

- Forgot password screen → email input → "Send reset link".
- Email sent with a tokenised link valid 1 h.
- Clicking the link opens the app (deep link) on a new-password screen.
- If the email is Google-only (no password provider), clear message "This account uses Google, tap 'Sign in with Google' on the login screen". No reset email sent.
- Rate limit: max 3 reset emails per hour per address.

---

## 3. Scan auth pattern — Pattern β Hybrid

### 3.1 Context

The scan is the demo hero (Tier 1 journey #2, see scan-2026-04-24.md). It captures 90 s of the soutenance narrative: *"I scan a beer I have never brewed, the app recognises it, proposes a recipe, I import it into My Recipes, now I can brew it."* The scan is therefore also the primary acquisition hook — it must showcase product value *before* asking the user to commit to an account.

Three patterns were debated:

- **α Full gated** — account required before scanning at all.
- **β Hybrid** — scan is free in guest mode, login wall appears only at import / rating / publishing.
- **γ Fully open** — scan + import anonymous, login required only for community writes.

### 3.2 MUST HAVE constraints (all 8 validated)

The product owner validated the following 8 constraints as non-negotiable:

| # | Constraint | Rationale |
|---|---|---|
| MH1 | Jury can scan live without an account (immediate wow effect) | 90 s demo narrative must flow |
| MH2 | Import into Mes Recettes requires identity | Mes Recettes = identity-required (Phase 1 decision) |
| MH3 | Rating / publishing requires identity | Community governance |
| MH4 | Scan backend stays stateless (not user-bound) | Shared cache, simple API, no device-id migration |
| MH5 | Reading community recipes without an account | Discovery is free, writes are gated |
| MH6 | Guest → user migration at signup | Data created in guest (scans, favourites) is preserved |
| MH7 | Signup coincides with realised value | No login wall at app open |
| MH8 | Maximum GDPR compliance by default | Prefer anonymity when possible |

### 3.3 Scoring — which pattern satisfies all MUST HAVEs?

| MUST HAVE | α Full gated | β Hybrid | γ Fully open |
|---|:---:|:---:|:---:|
| MH1 — Scan demo without account | ❌ | ✅ | ✅ |
| MH2 — Import Mes Recettes = identity | ✅ | ✅ | ❌ |
| MH3 — Community = identity | ✅ | ✅ | ✅ |
| MH4 — Scan backend stateless | ❌ | ✅ | ✅ |
| MH5 — Read community without account | ❌ | ✅ | ✅ |
| MH6 — Guest → user migration | ❌ | ✅ | ✅ |
| MH7 — Signup at realised value | ❌ | ✅ | ✅ |
| MH8 — GDPR minimal by default | ❌ | ✅ | ✅ |
| **Total** | **2/8** | **8/8** | **7/8** |

γ fails MH2 (anonymous import contradicts the identity-required Mes Recettes). β is the **only** pattern satisfying all 8 MUST HAVEs. **Pattern β Hybrid is therefore the decision, not by preference but by constraint.**

### 3.4 β Hybrid — concrete UX flow

```
App open
  └─ Dashboard guest (no account)
       │
       ├─ Tap "Scan" → camera + scan → beer recognised + 3 recipes
       │    │
       │    └─ Tap "Import" on a recipe
       │         └─ Modal "To save this recipe, create your account in 15 s"
       │              └─ Minimal signup (email + password OR Google)
       │                   └─ Import + redirect Mes Recettes
       │
       ├─ Tap "Community" → free read of recipes, ratings visible
       │    │
       │    └─ Tap "Rate" → signup modal (same flow)
       │
       ├─ Tap "Calculators" → all free, "Save" / "History" = signup modal
       │
       └─ Tap "Mes Recettes" / "Mes Brassins" / "Profile"
            └─ Dedicated screen "Sign in to access your data" (clean login wall)
```

### 3.5 Backend implications

Three architectural costs hidden behind β, flagged for the stack selection:

1. **Guest session storage** — temporary `AsyncStorage` bucket on the mobile that holds guest-created artefacts (recent scans, favourites, draft recipes). Migrated on account creation.
2. **Scan backend anonymous** — `POST /scan/lookup` does NOT require a JWT. Rate-limit is IP-based (or device-id based via client-generated UUID).
3. **Dual route conventions** — the NestJS API has auth-protected routes (Mes Recettes, Mes Brassins, Profile, community writes) and anonymous routes (scan, community reads, Academy). A clear convention must be established at the stack selection phase (most probably: `@Public()` decorator on anonymous routes, JWT guard global default).

---

## 4. Parked for future sessions

### 4.1 Phase 4 — UX redesign of signup / login / reset

Out of scope of this session. To tackle in a follow-up brainstorm:

- Wireframe or ASCII mockup of each screen.
- Google button prominence + placement.
- Password strength UI feedback.
- Keyboard handling on mobile (auto-focus, auto-advance).
- Error states (network, wrong credentials, rate-limited, email already exists).
- Onboarding skippable screen layout (single-scroll vs multi-step).
- Accessibility (contrast, screen reader, reduced motion).

### 4.2 Phase 5 — Auth stack selection

Out of scope of this session. To tackle after Phase 4:

- **Custom NestJS JWT + bcrypt + Passport** — full control, most code, highest alignment with the current `packages/api/`. Maximum flexibility but slowest to ship.
- **Supabase Auth** — managed Postgres + auth + Row Level Security. Drop-in, strong ecosystem, generous free tier. Requires rethinking how `packages/api/` coexists with Supabase as the source of truth.
- **Clerk** — managed auth-as-a-service with beautiful React Native UI components. Fastest to ship, opinionated, potentially costly at scale.
- **Firebase Auth** — mature, free, Google-native (perfect for Google OAuth), but locks us into Firestore / Firebase ecosystem which conflicts with our NestJS + SQLite story.
- **Lucia Auth + NestJS** — lightweight, Postgres-friendly, great TypeScript DX, replaces Passport with a modern equivalent.

Decision matrix will weigh: time to ship vs control vs cost vs fit with the current NestJS monorepo vs scan backend anonymity (MH4) vs Mes Brassins local-first compatibility.

### 4.3 Phase 6 — Onboarding full journey implementation

Out of scope until Phase 4 + 5 are done. Will be decomposed into GitHub issues per screen (login, signup, Google OAuth callback, password reset, email verification, onboarding skippable) and scheduled for pre-soutenance execution.

---

## 5. Impact on existing backlog

The decisions in this session have the following impact on the existing backlog:

| Backlog item | Impact |
|---|---|
| **B-13 bis — Auth backend not wired** | Fully scoped. Ready for execution once stack is chosen in Phase 5. |
| **#602 — feat(auth): wire login endpoint + JWT expo-secure-store** | Confirmed approach: short access + long refresh, both via expo-secure-store. No change to the issue description. |
| **#603 — feat(auth): wire signup + forgot-password endpoints** | Signup content expanded: email + password OR Google, followed by skippable onboarding. Forgot-password = standard email link. |
| **#604 — fix(auth): error states polish** | Confirmed in scope. Phase 4 will detail the visual states. |
| **#644 — Merge Paramètres into Profil** | Impact: the merged screen hosts the "Add provider" / "Add password to Google account" flows defined in §2.3. Hosts the unit toggle binding for Epic #713. |
| **#645 — Complete Profil (editable fields, avatar, password, stats, RGPD)** | Confirmed. The onboarding skippable (§2.5) generates default values; the user edits them here. |
| **#647 — About footer line (version + commit + build date)** | Unchanged, still ships with B-70. |
| **#593 — Epic auth wiring (login / signup / forgot-password)** | This brainstorm is the product scoping for #593. Next step: translate §4.1 + §4.2 into sub-issues. |
| **#713 — Epic unit conversion** | Linked: the unit toggle is set in the onboarding skippable (§2.5). |
| **#598 / #599 / #600 / #601 — Scan tranche 2 sub-issues** | Confirmed: scan is anonymous backend (§3.5 implication #2), login wall at import (§3.4). |
| **#611 — Epic unify 3 overlapping nav layers** | Unchanged. The auth flow lands on a cleaned navigation shell whose scope is owned by #611. |

New backlog items to open after this brainstorm ships:

- **[chore] Guest session storage + migration on signup** — implement the `AsyncStorage` bucket described in §3.5 implication #1.
- **[chore] Dual route conventions for anonymous vs auth endpoints** — §3.5 implication #3.
- **[ADR] Data locality principle** — translate §1.3 into a formal ADR (`docs/architecture/decisions/0004-data-locality-principle.md`).

---

## 6. Open questions (for Phase 4 + Phase 5 sessions)

1. **Wireframe of the signup screen** — single-screen vs multi-step? Google button above or below the email field?
2. **Wireframe of the post-signup onboarding** — single long scroll vs 3 swipeable cards?
3. **Stack selection** — which of the 5 candidates in §4.2 wins the decision matrix?
4. **Email deliverability strategy** — which SMTP provider (SendGrid / Postmark / SES / Mailjet / Resend)? Or does the stack choice already ship with one (Supabase: yes; Clerk: yes; Custom NestJS: no)?
5. **Biometric re-auth in v0.2** — confirmed deferred, but worth a design sketch.
6. **i18n of all auth copy (FR/EN)** — deferred until after soutenance; v0.1 keeps French-only copy, full FR/EN internationalization moved to the v0.2 roadmap.
7. **Analytics of the funnel** — how do we measure signup drop-off (which step, what error)? Is PostHog / Plausible / Mixpanel in scope for v0.1?
