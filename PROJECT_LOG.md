# Project Log — Brasse-Bouillon

Reverse-chronological record of all project activity (most recent entries first).
This is the operational logbook, not the release changelog (see [docs/changelog.md](docs/changelog.md)).

---

## 2026-07-13

### PR #1433 merged (`1e2f143`) — fix(faq-bot): [CONTACT] placeholder → real sign-up link

- Branch `fix/faq-bot-contact-link` (squash `bf379c1` + `9bf6903`). `chat-widget.js` linkifies the bot's leaked `[CONTACT]` placeholder into a first-party `<a>` to the on-page Participate section (`#participerFr`/`#participerEn`); click closes/scrolls/focuses + URL-hash; model text stays `createTextNode`-only (no XSS). `system-prompt.md` keep-verbatim rule + eval case `contact-token-verbatim-fr` (23 cases, ADR-0022).
- Deploy split: widget live via Cloudflare Pages on merge; prompt hardening at next Fly API deploy. Edge: link label follows page language, not answer language (deferred to widget UI-line).
- Reviews: pre-push (pr-pre-reviewer + Codex) 0 Must Have; Copilot 2 inline fixed in `9bf6903`. CI green.

### PR #1431 merged (`205dc3e`) — docs(website): freeze the r/Homebrewing launch post + account runway plan

- Branch `docs/website-reddit-launch-post`, 5 commits (`399d569`, `9c3fdb6`, `75aeb58`, `9a73835`, `2f4d7c9`). Playbook §8: the maintainer-validated launch post (3 title options, body, the two prepared replies, mod pre-message) + the account runway plan (existing personal account, aged/low-karma; handle deliberately NOT recorded — the account↔project link is made at posting time; runway = r/Homebrewing participation + the real first-brew post, then the launch post referencing it).
- Constraints baked in: no "build in public" claim, no beta-tester recruiting (app UI French-only), no "free" claim (pricing undecided; §6 example aligned), waitlist as only CTA.
- Three reviewers fact-checked the draft against the repo: pre-push ritual caught the demo-only fermentation card over-claim (live = manual measurement logging); Codex caught that recipe write CRUD (#410–#420) is entirely open → the recipe studio is pitched as the beta's headline feature, not shipped, and the scan claim was corrected to barcode (label OCR = epic #751, v0.2); Copilot polished the opener + identity wording. Every present-tense claim in the frozen draft now maps to shipped code.


### PR #1423 merged (`c813529`) — feat(website): add "buy me a beer" Ko-fi donation link (ADR-0028)

- Branch `feat/website-donation-link` (squash-merged; `origin/main` integrated mid-flight to absorb the #1428 SEO-switch conflicts, `en.html` regenerated not hand-edited). New **ADR-0028** (Accepted): Ko-fi one-off tip, **plain outbound link only** (no widget/iframe), chosen over Liberapay/Tipeee/Buy-Me-a-Coffee/Stripe-link via a weighted decision matrix on official July-2026 sources (guest one-off checkout, 0 % platform fee, direct PayPal payout, no SIREN needed). Sovereignty deviation (Ko-fi = UK) recorded + bounded with re-evaluation triggers (clause 6). Refs #1075.
- CTA in two home placements via the ADR-0027 i18n pipeline: a support line at the end of the Participate section (below the waitlist form, so it never competes with the primary CTA) + a footer brand line (`participate.support` / `footer.donate`; `en.html` regenerated). `.support-note` uses `--ink-soft` for AA contrast (9.17:1) on the Participate gradient corner; cache-bust `site.css?v=20260713c` on index/en/404.
- ADR-0028 clause 2 is CI-enforced: `quality_gate.py` `DISALLOWED_HTML_PATTERNS` now bans a Ko-fi `script`/`iframe` on both homes, with a fixture test (47 → 50 unit tests). Privacy posture unchanged (a plain outbound link processes no visitor data — no subprocessor/cookie-policy change). Ko-fi account: handle `brassebouillon`, Contributor OFF (0 %), EUR, PayPal payout.
- Reviews — pre-push ritual (pr-pre-reviewer + Codex CLI): 0 Must Have; both Should Have implemented (CI-enforced clause 2, AA-contrast token). Copilot 10/10 files, 0 comments. CI green; live prod FR+EN verified (`ko-fi.com/brassebouillon`).

### PR #1428 merged (`1cfe565`) — feat(website): flip the i18n S2 SEO switch — EN pages indexable (ADR-0027 D5)

- Branch `feat/website-i18n-s2-seo-switch`, 4 commits (`966411c`, `fc6271e`, `cc2558b`, `c3e20e6`). Slice S2 of ADR-0027 — the site is now **Reddit-ready SEO-side**. Refs #1075.
- De-noindex: `en.html` (the generator no longer inserts the S1 ship-dark robots meta) + the 4 EN legal twins; the gate now FORBIDS a noindex on all five EN pages (order/quote-agnostic lookahead pattern per Codex review) so the switch cannot silently regress.
- Reciprocal hreflang: `index.html` gains the missing `hreflang="en"` return tag, all 8 legal pages gain `x-default` → FR clean URL, `en.html` carries the cluster verbatim; new gate check `check_hreflang_reciprocity` (completeness + reciprocity + duplicate-declaration detection on the 5 pairs). Latent gate bug fixed in passing: `check_html_files` never scanned files that only had DISALLOWED patterns.
- Sitemap: `/en` added (exact-set `SITEMAP_URLS`); EN legal twins deliberately excluded (secondary pages, hreflang-paired); Lot 5 rationale comment updated.
- Localized EN share card `og-image-en.png` (the FR card's tagline is French): mascot/gradient/wordmark byte-identical to the FR master, EN tagline in the same copper-deep DejaVu Bold; `scripts/generate_og_card.py` helper pins the composition (byte-identical reproduction verified, `OG_CARD_FONT` override); generator swaps `og:image`/`twitter:image` from the catalog; gate dimension check covers both cards. Closes the deferral recorded on #1413.
- `SEO_RUNBOOK.md` rewritten: 2026-07-13 reversal of the EN de-index decision recorded; stale GA4 section dropped (analytics removed in #817, privacy pages promise none).
- Tests 46 → 49 (reciprocity happy/sad/edge incl. duplicates, noindex-reintroduced guard variants, head-transform S2 expectations).
- Reviews — pre-push: 0 Must Have; Copilot 2 inline + Codex 1 inline P2, all fixed in-branch with inline replies. CI green. Operator follow-up: GSC re-submit `sitemap.xml` + URL-inspect `/` and `/en` (runbook §3).


### PR #1421 merged (`39033fc`) — style(website): plain hyphens across public copy + restyled language toggle

- Branch `fix/website-copy-polish`, 2 commits (`ed495b5`, `502a83f`).
- 71 em/en-dash → plain-hyphen replacements across all public site text (both homes incl. titles/JSON-LD/labels, 8 legal twins, 404, EN catalog, the 2 chat-widget notices); code comments and internal docs deliberately excluded; catalog `srcHash` refreshed, `en.html` regenerated.
- Language toggle restyled — the flag request was declined per ADR-0027 D4 clause 2 (flags ≠ languages; emoji flags render as bare letters on Windows): active = solid `--copper-deep` (6.07:1 AA, badge precedent), accent-soft hover with lift, `color-mix` foam backdrop, `:focus-visible` outline; lang links excluded from the generic nav hover rule (Codex P2: the cascade flipped the active pill to ink-on-copper-deep on hover).
- Hero EN honesty note: hard break after the dash + `max-width: 58ch` — the note had no width limit and its right third ran under the absolutely-positioned mascot at wide viewports.
- Pre-existing FR drift fixed: visible FAQ Q4 said "L'app post-mortem chaque étape" (ungrammatical) vs the FR JSON-LD "fait le point sur chaque étape" — aligned on the latter (the gate only guards the EN side).
- Reviews — pre-push ritual: 3 Must fixed before push (AA contrast on the active pill, hardcoded rgba, Q4 drift); Copilot 14/14 files 0 comments; Codex 1 P2, fixed + replied. CI green.

### PR #1419 merged (`40b73c7`) — refactor(website): drop the redundant footer language switcher

- Branch `refactor/website-drop-footer-lang-switch`, 2 commits (`a77c0e2`, `90b804a`).
- Maintainer UX review: the header is sticky, so the primary FR/EN switcher is always visible — the S1 footer mirror was redundant (and duplicated an identically-labelled `role="group"` landmark). Removed; no cache-bust (the dead CSS rule only matched markup deleted in the same commit).
- ADR-0027 D4 clause 1 amended in the same PR (header `Amended 2026-07-13` line per the ADR-0021 precedent); the translated-equivalent rule rescoped with inline examples after Copilot flagged the "never the homepage" phrasing as contradictory.
- Reviews — pre-push: 0 Must; Copilot 1 comment, fixed + replied. CI green.

### PR #1417 merged (`691166c`) — fix(website): disclose the FR-interface screenshots on the EN home

- Branch `fix/website-en-screens-note`, 1 commit (`ce1d63b`).
- The EN home shows 11 French-UI app screenshots with no explanation at the point of dissonance (the app is French-only until the mobile i18n epic). Adds an EN-only note above the first screenshots section via `data-i18n-en-only` (empty + hidden on FR); mocked-up English screens rejected per the playbook honesty rules; EN re-shoot deferred to the app i18n epic. Single-note placement documented as an accepted tradeoff in `EN_LAUNCH_PLAYBOOK.md`.
- Reviews — pre-push: 0 Must, Shoulds applied (404 cache-bust, playbook wording); Copilot 6/6 files 0 comments. CI green.

### PR #1415 merged (`a52d091`) — chore(website): post-S1 quality hardening (CI tests, og:locale, dead code, docs)

- Branch `chore/website-post-s1-hardening`, 6 commits (`ee2aa2b`, `b236e1e`, `3fa08c3`, `bb97f66`, `bd212bf`, `6a41d8a`).
- Implements the confirmed findings of a multi-lens quality audit of the merged S1 (#1394): the `website:` CI job now runs the 44-test unit suites (previously gate-only — a generator regression could merge green); `og:locale` pair declared on both homes, mirrored `en_US`/`fr_FR` by the generator (ADR-0027 D5.4 gap); dead `site.js` override params removed + JSDoc on the exported API; `build_i18n.py` hardening (unknown CLI mode exits 2, public-API docstrings, `sha1(usedforsecurity=False)`, dataclasses/`pairwise`, redundant `handle_startendtag` removed); near-tautological idempotence test replaced by byte-verbatim + determinism assertions plus head-transform/overlap/CLI coverage (38 → 44 tests); README/package CLAUDE.md/GOVERNANCE purged of stale GitHub-Pages/CNAME claims (ADR-0014: Cloudflare Pages via wrangler).
- Reviews — pre-push: 0 Must (the reviewer flagged the concurrent #1413 merge on the same files → rebased before push); Copilot 12/13 files 0 comments. CI green.

### PR #1413 merged (`0833968`) — feat(website): real mascot og-image (1200×630) + dimension gate

- Branch `feat/website-og-image-mascot`, 2 commits (`60ea712`, `6c2e1e0`).
- Closes the deferred og-image item of the 2026-07 audit: real cut-out mascot card at the 1.91:1 social ratio, `og:image:width/height` meta + cache-bust across the 11 public pages (`en.html` regenerated); dependency-free `check_og_image_dimensions` gate check (PNG IHDR read) + 2 tests. Localized EN card deferred to i18n S2 (EN pages still noindex).
- Reviews — Copilot nits fixed pre-merge. CI green.

### FAQ chatbot — language lock closed + production go-live (ADR-0022)

- **Language lock, 3 slices, all merged+deployed to Fly**: PR #1414 (`cc5bddf`) hardened the prompt rule (FR/EN scope, EN fallback for other languages, mixed message = word-majority dominant; eval 13→21 cases). PR #1416 (`6c44df1`) founder clause + `founder-who-en` case, after the production canary caught English founder questions answered in French (eval 22). PR #1418 (`d23d342`) few-shot founder example — A/B vs real `mistral-small` (exact prod assembly, temp 0.3, N=6/variant): rule-only 4/6 English, +example 6/6; offline-judge limits + live A/B methodology documented in `evals/AGENT.md`. Final production canary 4/4 English.
- **Activation completed (Option A, single live API + kill-switch)**: Fly secrets set by the operator (`MISTRAL_API_KEY`, `ALTCHA_HMAC_KEY`, staged via `FAQ_BOT_ENABLED=false` then flipped `true`); ALTCHA challenge live; guardrail smoke green (off-topic / PII / founder / jailbreak). Plan: **free Experiment tier retained** (paid + ~20 EUR hard cap deferred until free-tier limits actually block the bot); **GDPR guards confirmed 2026-07-13** (Mistral console "Data usage for improving our services" disabled; no Labs models). Deploy gotcha recorded: `fly deploy` must run from the monorepo root with `--config packages/api/fly.toml --dockerfile packages/api/Dockerfile` (root build context).
- **Post-go-live hotfix PR #1424 — user-turn language enforcement**: first real visitor got a French answer to an English "What is Brasse-Bouillon?"; broad canary = 4/5 happy-path EN flips. Bench vs real `mistral-small` (12 EN + 4 FR runs/candidate): system-prompt rules 0/12 EN even as a final reminder; directive appended to the user turn after the question 12/12 + FR 4/4; risk bench (mixed/ES/jailbreak, 14 runs) = no regression, 0 echoes, 0 leaks. Directive versioned prompt-as-spec (`prompts/language-directive.md` + `FaqBotPrompts.languageDirective`); third ADR-0022 addendum; eval 22/22 (+`no_directive_echo`); unit 46/46. Lesson recorded (AGENT.md): system-prompt language rules are documentation, enforcement lives adjacent to the question.
- **Go-live PR #1420**: production hosts added to `WIDGET_HOSTS` (cache-bust `v=20260713`, `en.html` regenerated); privacy twins list Mistral AI (France, EU) as processor + FAQ purpose + collected-data + no-retention lines; ADR-0022 go-live addendum; README de-staled. Rollback = `FAQ_BOT_ENABLED=false` (server-side, no redeploy). Refs ADR-0022, #1075.

## 2026-07-10

### PR #1394 merged (`801049c`) — feat(website): real English home at /en (i18n epic S1)

- Branch `feat/website-i18n-s1-en-home`, 6 commits. Slice S1 of ADR-0027: a real, promotable English marketing home at `/en`, **generated** from the single authored FR `index.html` (build-less per ADR-0014). Ships **dark** — `noindex`, self-canonical `/en`, no hreflang yet (deferred to S2 by design so the cluster never points at a noindex page). `scripts/build_i18n.py` (stdlib) splices a committed, byte-stable `en.html` from `data-i18n`-annotated source + `i18n/home.en.json` (transcreation for r/Homebrewing; survey option *values* kept FR so responses aggregate; `lang=en`), rebuilding the FAQPage/Organization JSON-LD from the same catalog keys; a per-entry `srcHash` drift guard fails CI when FR changes without its EN update. Full parity incl. the Académie section (#1388), FR/EN header+footer switcher (autonym, no flags, plain `<a>`, `aria-current`), `_redirects` `/index-en`→`/en` (301). Quality gate rekeyed `index-en.html` → `en.html` + new in-process `check_i18n_home_generated()` (key parity + srcHash + regen-diff). Refs #1075.
- Reviews — pre-push (`pr-pre-reviewer` + Codex): all Must + Should addressed in-branch (EN logo/footer links, footer switcher, generator overlap guard, gate tests, stale README). S2 (SEO switch: de-noindex, reciprocal hreflang, `/en` in sitemap) follows. CI green.

### PR #1388 merged (`98430bf`) — feat(website): add Académie brassicole feature section (FR)

- Branch `feat/website-academy-section`, 1 commit. New dedicated `#academieFr` section on the FR home, placed after the Scan block (kept out of the "trois piliers" tools block — the Academy is *learning*, a distinct category, so that copy stays true). Two `feature-card`s reusing the existing phone-frame pattern (zero CSS/JS change → no cache-bust): the Academy hub (synthesis card 10 articles / 8 calculateurs, search, theme filters, article list) and a glossary term detail (IBU) showing its bibliographic source — the pedagogical differentiator vs tool-only competitors. Copy grounded in what ships (10 sourced articles, 17-term sourced glossary); no over-promise (no progression/quiz/chatbot claims). EN twin left as the deliberate coming-soon stub (feature sections are FR-only until the i18n epic #1383).
- Both screenshots captured from the same current app state on the `bb_pixel_academy` emulator (720×1527) so the two cards share an identical bottom-nav bar; the prior `feature-academie.webp` (#1122) was stale (older 7-icon nav + older hub) and was replaced.
- Reviews — pre-push ritual (Claude `pr-pre-reviewer` + Codex CLI): 0 Must Have; alt-text completeness + copy-redundancy fixes applied; the EN-twin sync finding reconciled as intentional. Copilot 0 comments; CI green.

### PR #1393 merged (`152b470`) — refactor(website): exact-set sitemap policy + O(n) duplicate check

- Branch `chore/website-sitemap-gate-hardening`, 1 commit. Salvages the unique content of the closed/superseded #1387: `check_sitemap_policy` now enforces the sitemap advertises **exactly** the indexable clean URLs (`SITEMAP_URLS`) — a *missing* legal page is now caught (the prior allowlist only flagged extras + a missing home); duplicate detection moves O(n²) `list.count()` → linear `collections.Counter` (Copilot note on #1387). Lot 5 itself shipped via #1384.
- Reviews — pre-push; `ruff` clean, 22 gate tests green (happy/sad/edge: missing legal page, renamed = missing+forbidden, duplicate), gate passes on the live site, no behaviour change to other checks. CI green.

### PR #1391 merged (`155f44c`) — fix(review): pin --output-last-message to exec level in codex-review.sh

- Branch `claude/kind-napier-bd7802`, 1 commit. Fixes `scripts/codex-review.sh` failing with `unexpected argument '--output-last-message'` (version-skew, not credits): the flag is `exec`-level, so it now precedes the `review` subcommand. `--base`/`--out` contract for the `pre-push-review` skill unchanged; `--help` made drift-proof. Rationale + verification in #1391. Config `review_model`/`model` = `gpt-5.5` confirmed already correct.
- Reviews — pre-push ritual: 0 Must, 2 Should fixed pre-push; Copilot 0 findings; CI green.

### PR #1389 merged (`b0b43f2`) — fix(website): newsletter honeypot, badge contrast (AA), honest widget comment (Lot 6)

- Branch `fix/website-hygiene`, 1 commit. Lot 6 (last site-side lot of the 2026-07-09 audit): the newsletter form gains the Formspree `_gotcha` honeypot the questionnaire already had (Refs #1036); the "18+" responsibility-band badge `--copper` → `--copper-deep` (foam text 3.2:1 → 6.07:1, fixes the sole Lighthouse A11y contrast failure); the feedback-widget loader comment corrected on all 10 pages (claimed "mounts on prod only" — the opposite of its staging/localhost gating); `site.css?v=20260710` cache-bust on index/index-en/404.
- Reviews — pre-push: 0 Must, 1 Should (a missed 404 cache-bust) fixed pre-push; gate + 20 tests green; badge computed color (`rgb(141,74,19)`, 6.07:1) + honeypot hidden state verified in preview. CI green. After this, audit Lots 2–6 are complete; remaining Lot 1 DNS (user) + deferred og-image 1200×630 (design).

### PR #1385 merged (`682ca1f`) — fix(academy): align navigation onto the (app) route group + article scroll reset

- Branch `fix/academy-route-groups`, 3 commits. Two stray mobile Academy navigation calls still using the un-grouped form moved to the `(app)` route group — « En savoir plus » → `/(app)/academy/[slug]/learn`, « Retour à la fiche thématique » → `/(app)/academy/[slug]` — aligning with the 40+ other call sites. Plus two UX fixes: the article `ScrollView` remounts on `slug`/`termSlug` change (via `key`) so opening another article or glossary term starts at the top (was preserving the previous scroll offset); the highlighted glossary-term sources heading now reads « Sources du terme » (was the ambiguous « Sources »). New `AcademyTopicPlaceholderScreen.test.tsx` covers happy + sad (unknown topic) + edge (header back history/fallback, calculator-mode variant); 46 targeted tests green, `ci:check` green.
- Branch was reconstructed in-session (the original `/tmp` clone from the prior session was unreachable from the sandbox), verified byte-identical to the intended diff before push.
- Reviews — pre-push (`pr-pre-reviewer` + manual): 0 Must Have; 1 Should implemented (the placeholder H/S/E tests); 1 Should → fast-follow #1386. Copilot clean (0 comments); Codex absent (out of credits). **Live emulator pass** (Expo Go, demo mode, Pixel): the four Academy nav paths, the top-of-page scroll-reset invariant (article → related article, term → related term), and the « Sources du terme » heading all verified, 0 navigation errors. Finding: Expo Router elides route-group segments from the URL, so the un-grouped form also resolves at runtime — this is a consistency/convention alignment (plus two real scroll/heading UX fixes), not a broken-navigation fix.

### PR #1386 merged (`6583016`) — fix(tools): use app route group for calculator navigation

- Branch `fix/tools-route-groups`, 1 commit. Fast-follow from #1385's pre-push review: the three calculator-CTA `router.push` calls in `AcademyTopicDetailsScreen` now use `/(app)/tools/[slug]/calculator` (was the un-grouped form), matching every other call site; the calculator-CTA test assertion updated to match. 12 tools presentation suites / 169 tests green, `ci:check` green.
- Reviews — Copilot clean (0 comments); Codex absent. Live emulator pass: the calculator CTA navigates correctly to the Fermentescibles calculator. Consistency alignment with no behavior change (the un-grouped form also resolved at runtime).

### PR #1383 merged (`2184856`) — docs(website/architecture): website i18n epic conception (ADR-0027, UML, EN launch playbook)

- Branch `docs/website-i18n-conception`, 4 commits. Conception-only (no implementation) for making the marketing site genuinely bilingual FR+EN (Reddit / international outreach). ADR-0027 (Proposed): D1 hybrid content (EN home *generated* from the annotated FR source + `i18n/home.en.json` + stdlib `build_i18n.py`, output committed so deploy stays build-less; legal pages hand-maintained twins with a CI freshness stamp), D2 EN home at `/en` (301 from `/index-en`), D3 reuse Formspree with `lang=en`, D4 visible FR/EN switcher + no auto-redirect + `bb-lang` localStorage disclosed on the cookies pages, D5 de-noindex EN + reciprocal hreflang. UML (use-case / sequence / data-flow) under `docs/architecture/diagrams/website-i18n/`; EN launch playbook (transcreation voice, honesty rules, Reddit checklist). Refs #1075.
- Validated with Benoît 2026-07-10 (hybrid, `/en`, Reddit after S1+S2). Slices S1–S4 follow. CI green.

### PR #1381 merged (`f738b2b`) — fix(website): faq-bot widget 400-vs-503 UX (#1314) + wire live API origin

- Branch `claude/zealous-tu-65a33b`, 2 commits. Last-mile activation prep for the public FAQ chatbot (ADR-0022) — the widget stays gated **off** production. `errorFor(status, hadProof)` maps an HTTP 400 on `/ask` with no anti-bot proof to the "unavailable" message (was the generic retry) — Closes #1314; local dev path unaffected. Option A topology: single live API + `FAQ_BOT_ENABLED` kill-switch; staging + (inert, pre-wired) prod hosts point at `brasse-bouillon-api.fly.dev`, prod stays out of `WIDGET_HOSTS` until go-live. `chat-widget.js?v=20260709` FR+EN; ADR-0022 activation addendum.
- Activates nothing on its own (needs Fly secrets `MISTRAL_API_KEY` / `ALTCHA_HMAC_KEY` + `FAQ_BOT_ENABLED=true`, separate operator steps). Prompt eval 13/13; gate + `node --check` green. CI green.

### PR #1384 merged (`803693a`) — fix(website): sitemap legal pages, social meta, drop 197KB SVG favicon (Lot 5)

- Branch `fix/website-sitemap-social`, 3 commits. Lot 5 of the 2026-07-09 audit: the sitemap adds the 4 FR legal pages (clean URLs) + `lastmod` 2026-07-10 (EN legal stay out — `noindex`), `check_sitemap_policy` relaxed home-only → allowlist rejecting EN / `.html` / unknown / duplicate; OG + Twitter Card meta added to the 8 legal pages + `index-en` (`summary` card, `og:url == canonical`); favicon drops the **197 KB** `logo-icon.svg` `<link>` from all 11 pages (`favicon.ico` 2.8 KB + apple-touch-icon cover browsers). Refs #1038, #1039.
- Reviews — two-lens pre-push (parity + adversarial SEO): 0 Must / 0 Should; FR/EN parity, no double OG, sitemap↔noindex consistency verified; gate + 20 tests green. Deferred: og-image as a real 1200×630 asset (design), prune the orphaned `logo-icon.svg`. CI green.

## 2026-07-09

### Prod deploy `brasse-bouillon-api` — water-profile slice 2 + accumulated backend live (migrations 1808/1809)

- `flyctl deploy` of `main` to Fly (app `brasse-bouillon-api`, region `cdg`; build context = monorepo root, `--config packages/api/fly.toml --dockerfile packages/api/Dockerfile --local-only`). Brought the backend accumulated since the 2026-07-03 deploy (which reached migration `1807`) to prod: recipe brewing-difficulty (#1342) + water-profile slice 2 (#1374). Migrations `1808` (recipe difficulty columns) + `1809` (`water_measurements` table) applied at boot on the `bb_data` volume (`migrationsRun: true`); `/health` 200; `water_measurements` confirmed present in the prod DB. The #1350 difficulty-backfill CLI has not been run yet (pre-1808 rows stay placeholders until recomputed).
- Preflight de-risk before the deploy: the production Docker image was built and booted locally first — full migration chain + `/health` + the `/water` and `/recipes/:id/equipment-fit` routes verified.
- Live re-test on the Android emulator (Expo Go against the live API, authenticated session): recipe difficulty badges + « Pourquoi ce niveau ? » modal (1808), brew-day step timer (F1), and the water freshness pastille (#1376) rendering green « Récent » / « Dernière analyse : 15/04/2026 » for the LILLE network — confirming slice-2 `freshnessDate` end-to-end in prod. Follow-up: rebuild the EAS preview APK for an on-device novice re-test.

### PR #1379 merged (`e59303e`) — fix(website): legal pages compliance — real host, drop false claims (LCEN/RGPD)

- Branch `fix/website-legal-pages-compliance`, 2 commits (`e4ec47e`, `8485a30`). Rewrites all 8 legal pages (FR + EN twins) against LCEN art. 1-1 (loi SREN 2024) + RGPD art. 13: hosting disclosure corrected GitHub Pages → Cloudflare Pages (Cloudflare Portugal, Unipessoal, Lda. block), directeur de la publication added, false "audience-measurement cookies opt-in" claim removed (no such cookies exist — it contradicted the cookies/privacy pages), the inactive « Signaler » widget data flows (Cloudflare Workers + localStorage) removed from privacy/cookies (the widget is host-gated off in production), sub-processors + transfer safeguards fixed (Formspree → SCC art. 46; Cloudflare → EU-US DPF adequacy), CNIL complaint right made explicit, dates harmonised to 2026-07-09, contact routed to the site form. Homepages cleaned of the dead `contact@` mailbox (mailto CTAs, footer, JSON-LD `email`/`contactPoint`) — « Nous écrire » now opens the questionnaire.
- Refs #1044. New quality-gate guard `check_no_stale_host` (forbids "GitHub Pages" in any HTML) + test; 17 gate tests green.
- Reviews — two-lens pre-push (standards/ADR + adversarial legal-accuracy): 0 Must Have, 0 factual error (host block exact, DPF/SCC attribution verified, all art. 13 elements present, FR/EN parity clean). One Copilot a11y finding (unsynced `aria-controls` on the secondary « Nous écrire » button) fixed in `8485a30`. CI green; verified in prod post-deploy.

### PR #1378 merged (`c003d8e`) — feat(website): self-host Inter & Fraunces fonts (drop Google Fonts CDN)

- Branch `feat/website-self-host-fonts`, 1 commit (`12f86b7`). Removes the Google Fonts CDN dependency: 16 local `.woff2` files (Inter 400/500/600/700/800, Fraunces 500/700/900 — latin + latin-ext) served from `/fonts/` + a `fonts.css` linked by all 11 pages; the deploy workflow stages `fonts/` into `_site/`; `_headers` caches `/fonts/*` as immutable (1 y). RGPD driver: visitor IP is no longer sent to Google pre-consent — removes Google as a data sub-processor and unblocks accurate legal pages; also drops a render-blocking third-party request. Refs #1035. Regeneration script `scripts/fetch_fonts.py` (re-running it reproduced byte-identical files).
- Quality gate: `check_no_external_fonts` forbids re-introducing the CDN in any HTML or CSS (+ tests); `fonts.css` added to `REQUIRED_FILES`.
- Reviews — two-lens pre-push (standards + consistency): consistency verdict clean (11/11 pages switched, 16/16 woff2 referenced↔present, no weight missing vs the old CDN request). Copilot: 4 findings fixed in the squashed commit (gate scans CSS too, `_source.txt` kept out of the deploy payload, fetch script added). CI green; verified in prod: zero Google requests, 16/16 woff2 served.

### PR #1376 merged (`c8049bc`) — feat(mobile/recipes): dated water freshness pastille (water-profile PR-B)

- Branch `feat/mobile-water-freshness`, 1 commit (`9281021`). Mobile PR-B of the water-profile epic — the dated freshness pastille on the recipe Water tab, consuming the additive `freshnessDate` from slice-2 #1374. `LiveWaterProfilePanel` renders green « Récent » (< 6 mo) / orange « À confirmer » (6–24 mo) / grey « Ancien » (> 24 mo) + « Dernière analyse : JJ/MM/AAAA », falling back to the year-granular line when no date. Pure `describeWaterFreshness(date, now)` in the use-case (now injected, testable); `LiveWaterProfile` + the DTO mapper gain the field. Full mobile suite green (1376 tests). **The water leg is now complete end-to-end** (slice-1 #1358, slice-2 backend #1374, this pastille).
- Refs #1374, #1355.
- Reviews — pre-push `pr-pre-reviewer` (0 Must, 1 Should): a future `freshnessDate` no longer renders a reassuring « Récent » (ADR-0025 anti-anomaly), with a test. A follow-up automated review: boundary alignment — exactly 24 months is now orange (was grey), matching the documented 6–24 / > 24 rule; both sides of the boundary tested. CI green, 2 threads resolved.

### PR #1373 merged (`79dda0c`) — fix(website): point canonical/hreflang/links at clean URLs; noindex EN legal

- Branch `fix/website-clean-urls`, 2 commits (`5f0ea26`, `830fac9`). Clean-URL SEO sweep (Lot 4 of the 2026-07-09 website audit): every self-canonical, hreflang alternate and internal link now targets the clean URLs Cloudflare Pages serves — the `.html` forms 308-redirect, so canonicals previously pointed at redirecting URLs. `noindex,follow` added to the 4 EN legal pages (consistent with the noindexed EN coming-soon home). New quality-gate guard `check_clean_seo_urls` forbids a canonical/hreflang target ending in `.html`.
- Refs #1045 (partial — the canonical/hreflang half; OG/social tags are a later lot).
- Reviews — two-lens pre-push (standards/ADR + adversarial sweep-correctness: self-canonicals, hreflang reciprocity, no residual `.html` links, no over-replacement — all verified). Copilot: the guard was attribute-order dependent (`rel`-before-`href` only) → made order-independent + covering test in `830fac9`. CI green (one CodeQL infra failure re-run to green); verified in prod post-deploy.

### PR #1374 merged (`7b91011`) — feat(api/water): append-only cache + conditional sync for /water (water-profile slice 2)

- Branch `feat/api-water-cache`, 1 commit (`d71f494`). Backend slice-2 of the water-profile epic ([ADR-0025](docs/architecture/decisions/0025-water-profile-geolocation-and-caching.md) § Slice-2), on top of slice-1 #1358. `GET /water` is now cache-backed: new append-only `water_measurements` table (migration `1809`) keyed uniquely on `(code_reseau, code_parametre, date_prelevement, code_prelevement)`; `WaterMeasurementCacheService` (append idempotent via `INSERT OR IGNORE`, max-date, bounded newest-N read); `WaterService` gains a conditional sync (cheap `size=1` `sort=desc` date-check gate → full fetch + append only when Hub'Eau is newer) with a DB fallback on any Hub'Eau outage; the DTO gains an additive `freshnessDate` (`max(date_prelevement)`). Endpoint contract otherwise unchanged (mobile unaffected; the dated-pastille render is a follow-up PR-B). 69 water unit tests; migration validated end-to-end. Public ARS/Hub'Eau data, not PII. ADR-0025 promoted `Proposed` → `Accepted` + added to the CLAUDE.md index in this same docs PR.
- Refs #1358, #1355.
- Reviews — pre-push adversarial multi-lens review: 1 MUST fixed (the full fetch was `size=100` unsorted vs the `sort=desc` gate → an arbitrary subset on a busy réseau that could gate off future syncs on an incomplete set; fixed with `sort=desc`) + 5 Should (bounded read, honest docs, test gaps). A follow-up automated review (fixed in `d71f494`): an empty-cache Hub'Eau outage now surfaces `502` not `404`; stale DTO description; `as string` casts replaced by a type guard. CI green, 3 threads resolved.
- **Decisions**:
  - `water-slice2-most-recent-bounded` — slice-2 aggregates the most-recent, bounded window of samples (DB read `sort=desc` + `limit`), a deterministic improvement over slice-1's arbitrary Hub'Eau-order page. Recorded in ADR-0025.

### PR #1370 merged (`dbb704e`) — feat(website): add security response headers via Cloudflare Pages _headers

- Branch `feat/website-security-headers`, 3 commits (`5ead41b`, `f090f94`, `c3254c3`). Lot 3 of the website audit: new `packages/website/_headers` serving `Strict-Transport-Security` (1 y, apex-only), `X-Frame-Options: DENY`, `Permissions-Policy` (camera/microphone/geolocation/usb/payment all denied) and `Cross-Origin-Opener-Policy: same-origin` on `/*`; the deploy workflow stages the file into `_site/` in the fail-loud required-files loop.
- Refs #1032, #1033 (partial): CSP and HSTS `includeSubDomains`/`preload` deliberately deferred pending an origin/subdomain audit — rationale documented in-file.
- Reviews — two-lens pre-push (standards/ADR + adversarial deploy-risk: all four headers verified inert against actual code paths — no iframes/popups/gated features; no duplication with the two edge-emitted headers). CI green; verified in prod post-deploy: 4 headers served exactly once each.

### PR #1367 merged (`a8b9e28`) — fix(website): serve a real 404 page for unknown routes

- Branch `fix/website-404-page`, 2 commits (`7bc7db6`, `6993eec`). Lot 2 of the website audit: root `404.html` that Cloudflare Pages serves with a genuine HTTP 404 for unmatched routes — previously every unknown path returned 200 with a byte-identical copy of the home page (site-wide soft-404 polluting the index). Single locale-agnostic FR page with an EN fallback line, `noindex`, root-absolute asset URLs so styling resolves on any path, on-brand (mascot + « Retour à l'accueil »).
- Refs #1043.
- Quality gate: `404.html` added to `REQUIRED_FILES` + structural rules (doctype, lang, noindex).
- Reviews — pre-push `pr-pre-reviewer` (0 Must Have). CI green; verified in prod post-deploy: unknown paths return a styled 404.

### PR #1366 merged (`b22477c`) — docs(adr): promote ADR-0026 to Accepted + CLAUDE.md index

- Branch `docs/adr-0026-accepted`, 2 commits (`26c0b98`, `f5288e9`). Closes out the equipment fit-check leg (built end-to-end by #1362 + #1364): [ADR-0026](docs/architecture/decisions/0026-equipment-capacity-fit-check.md) `Proposed` → `Accepted` and added to the root [CLAUDE.md](CLAUDE.md) accepted-ADR index. Review also corrected [ADR-0022](docs/architecture/decisions/0022-public-faq-chatbot-llm.md) (FAQ chatbot), which was still `Proposed` while listed in that index though its decision shipped in #1293 → set to `Accepted`; verified the other 13 indexed ADRs are all Accepted. ADR-0026 header spacing realigned to the `README.md` template.
- Reviews — automated review (2 findings, both fixed in `f5288e9`): template header alignment + the stale ADR-0022 status. CI green, threads resolved.

### PR #1364 merged (`df42a92`) — feat(mobile/recipes): render the equipment capacity fit-check (ADR-0026, PR-B)

- Branch `feat/mobile-equipment-fit`, 2 commits (`30ec85a`, `1836c10`). Mobile (PR-B) of the brew-prep equipment leg — renders the [ADR-0026](docs/architecture/decisions/0026-equipment-capacity-fit-check.md) advisory fit-check on `BrewPrepScreen`. New self-fetching `CapacityFitPanel` (react-query) placed above the ingredient checklist: two legs (fermenteur / bouilloire), each a verdict badge + advisory copy; when no equipment is declared it shows a just-in-time "declare my equipment" CTA → `/equipment`. Pure `describeFit()` display mapper (verdict/reason → badge tone + message; explicit `HARD_STOP` copy though the backend never emits it in v1); defensive `mapCapacityFit()` (unknown verdict → `NOT_EVALUATED`, non-finite → null, reason dropped unless `NOT_EVALUATED`). Launch gate untouched (ingredients-only). New `domain/equipment-fit.types.ts`, `data/equipment-fit.api.ts`, `application/equipment-fit.use-cases.ts`, `presentation/components/CapacityFitPanel.tsx`; 3 new unit-test suites (23 tests across api / use-cases / panel, H/S/E) plus a composition assertion on the existing `BrewPrepScreen` suite.
- Refs #1247, #1248.
- Reviews — pre-push local review + automated review rounds. First round (5 findings, all fixed): drop a reason on an evaluated verdict, `showProfileCta` requires both legs `NO_PROFILE`, type-safe `Record<FermenterReason | KettleReason, string>`, `litres(null)` keeps the unit (`"? L"`), test `gcTime` `Number.POSITIVE_INFINITY`. Follow-up round (2 findings, fixed in `1836c10`): demo prep no longer calls the live JWT-guarded endpoint (`loadEquipmentFit` short-circuits to a curated demo fit); the panel refetches on screen focus (`useFocusEffect`) so the verdict refreshes after the user declares equipment and returns. `BrewPrepScreen` unit test now mocks the panel as a collaborator and asserts it is composed in. CI green, 7 threads all resolved.

## 2026-07-08

### PR #1362 merged (`73feaa0`) — feat(api/equipment-fit): advisory capacity fit-check endpoint (ADR-0026)

- Branch `feat/api-equipment-fit`, 1 commit (`098a8e6`). Backend (PR-A) of the brew-prep equipment leg — implements the merged [ADR-0026](docs/architecture/decisions/0026-equipment-capacity-fit-check.md). New `packages/api/src/equipment-fit/` module: pure `computeCapacityFit()` (fermenter usable = `fermenter_volume_l × (1 − HEADSPACE_RATIO 0.10)` vs recipe `batch_size_l` → `FITS`/`TOO_LARGE` strict `>` + `scaleRatio` only when usable > 0; kettle vs approximate pre-boil from optional `recipe_water` → `OK`/`WARNING`, `HARD_STOP` modelled-but-never-emitted; any missing/degenerate input → `NOT_EVALUATED` + per-verdict `reason`), `GET /recipes/:id/equipment-fit?profileId=` (JWT-guarded, `ParseUUIDPipe`, access-checked recipe read via `RecipeService.getReadableById`, profile resolved by explicit id or most-recent), `CapacityFitDto`. No migration (no schema change); launch gate untouched. Unit tests across domain, service, and controller (H/S/E). Mobile render is follow-up PR-B.
- Refs #1247, #1248.
- Reviews — pre-push local review: 0 Must, 3 Should addressed (`ParseUUIDPipe` on the recipe id, a controller spec, a comment on the deliberate `recipe_water` repo registration). A later automated review flagged an unvalidated `headspaceRatio` — a degenerate ratio could fabricate a `TOO_LARGE` with a NaN/Infinity `scaleRatio`; fixed by guarding the derived `usableL` with `isPositiveFinite` (+ test). CI green, 0 unresolved threads.
- **Decisions**:
  - `equipment-fit-headspace-0.10` — the v1 `HEADSPACE_RATIO` default is 0.10 (below the 20–25 % krausen norm) so the shipped guided first brew (`batch_size_l 4.3` in a 5 L demijohn) reads `FITS`; per-style headspace deferred. Recorded in ADR-0026.

## 2026-07-07

### PR #1360 merged (`a0dc6dd`) — docs(brew-prep/architecture): ADR-0026 equipment capacity fit-check + brew-prep UML refresh

- Branch `docs/brew-prep-equipment-fit-adr-0026`, 3 commits (`2e9c6c0`, `4bc887b`, ...). Conception-refresh (docs only) for the brew-prep readiness journey's equipment leg: reconciling the conceived UC5 *equipment checklist* against shipped code — the equipment profile is capacity-based (3 volumes), not an item list, and the ADR-0020 volume cascade is not built — so UC5 becomes an **advisory capacity fit-check** computed in the backend. **[ADR-0026](docs/architecture/decisions/0026-equipment-capacity-fit-check.md)** (Proposed) + brew-prep UML (`01`/`02`/`02b`/`03`/`04`/`05`). Fermenter usable = `fermenter_volume_l × (1 − HEADSPACE_RATIO 0.10)` vs recipe `batch_size_l` → `FITS`/`TOO_LARGE` (strict `>`, + `scaleRatio` manual escape; no auto-rescale v1); kettle vs approximate pre-boil (`recipe_water` mash+sparge) → non-blocking `WARNING`; every non-evaluable input returns one `CapacityFit` shape tagged with a per-verdict `reason`. v1 launch gate stays ingredient-only. Build (`CapacityFitService` + `GET /recipes/:id/equipment-fit` + mobile render) is a follow-up PR.
- Refs #1247, #1248.
- Reviews — 3 adversarial multi-agent rounds + independent per-finding verification pre-push (caught a wrong backend field name → silent permanent `FITS`; null/degenerate inputs fabricating verdicts; a `NOT_EVALUATED` discriminator gap). GitHub Copilot + Codex: 7 threads, all resolved in `4bc887b` — notably `HEADSPACE_RATIO` 0.20 → 0.10 so the shipped guided first brew (`batch_size_l 4.3` in a 5 L demijohn) reads `FITS`, not `TOO_LARGE`. CI green, 0 unresolved threads.
- **Decisions**:
  - `equipment-fit-advisory` — the equipment readiness leg is an advisory capacity fit-check, backend-computed, never blocking the v1 launch (gate stays ingredient-only); a strict physical hard-stop returns only once the ADR-0020 D2 method logic lands. Recorded in ADR-0026.

### PR #1358 merged (`1f7bfb2`) — feat(mobile/recipes): local water profile by postal code (water-profile slice 1)

- Branch `feat/water-local-by-postal`, first build increment of the water-profile epic ([ADR-0025](docs/architecture/decisions/0025-water-profile-geolocation-and-caching.md)). On the recipe Water tab: postal code → `geo.api.gouv.fr` (sovereign, keyless) resolves communes → disambiguation picker when several share a code → backend `/water` proxy (existing, JWT-guarded) → `LiveWaterProfilePanel` (5 ions, French hardness °fH, freshness year, one pedagogy sentence, Na flagged "non mesuré", partial-data notice). Location ephemeral — nothing persisted (slice-2 = append-only cache keyed on `code_reseau`). New `domain/water-profile.types.ts`, `data/water-profile.api.ts`, `application/water-profile.use-cases.ts` (incl. current-year → previous-year fallback on 404 for Hub'Eau lag), 2 presentation components; wired into `WaterTab` under the `canCompare` block. Compatibility scoring stays DEFERRED (the existing 6-ion score coerces null/na→0, unsafe for the live nullable 5-ion profile).
- Verification — emulator (2026-07-07): `59000` → Lille (single commune auto-selected), `/water?codeInsee=59350` fires, loading + error paths render. Happy-path green panel deferred to the final test pass (demo session carries a synthetic token → the guarded `/water` returns 401; backend `/water` Lille already E2E-validated in #1352). 52 water unit tests (mappers, use-cases, panel, component H/S/E). Deferred follow-up: demo-mode shows a raw "Unauthorized" → screen-by-screen UX review.
- Reviews — two adversarial pre-push reconciliation rounds (year-fallback MUST-fix, `retry:false` simplification, badge-uppercase test assertions); a later review round corrected the no-data message wording. CI green, 0 unresolved threads.

## 2026-07-06

### PR #1355 merged (`6d9f0f1`) — docs(water-profile/architecture): ADR-0025 + UML deliverables for local water geolocation

- Branch `docs/water-profile-conception`, 3 commits. UML-first conception for the water-profile epic's first increment (no app code): **ADR-0025** — postal-code geolocation via sovereign `geo.api.gouv.fr`; **live `/water` proxy first, append-only cache + conditional sync second**; three weighted decision matrices (geo input, INSEE resolution, data locality); 2-slice roadmap; map/analytics/corrective-salts/Na/location-persistence explicitly deferred. Plus **5 UML diagrams** (use-case, sequence slice-1, sequence slice-2, component, data-flow) under `docs/architecture/diagrams/water-profile/`. ADR-0025 stays **Proposed** (promote to Accepted + CLAUDE.md index on the slice-1 build landing).
- Reviews — pre-push **4-lens adversarial workflow** (UML orthodoxy, ADR/matrix arithmetic, tech-accuracy vs live APIs + the #1352 backend, decision fidelity): fixed 6 matrix arithmetic errors, removed a non-existent `code_prelevement` dedupe + `code_commune` keying claim, added invalid-postal-code + external-unreachable (no-fallback) sequence branches, a PII-egress annotation, and a slice-boundary reword. Copilot round: 5 threads (imprecise `/water` claim → "no HTTP call"; process-level cache ×2; unified append-only key to `code_reseau`; French diagram labels = repo convention) all resolved. CI green.

### PR #1352 merged (`6595786`) — fix(api/water): restore the Hub'Eau water-quality check (v1 API contract drift)

- Branch `fix/hubeau-water-quality-field-names`, 2 commits. Hub'Eau v1 silently renamed the `communes_udi`/`resultats_dis` response fields (`code_udi`→`code_reseau`, `nom_udi`→`nom_reseau`, `nom_parametre`→`libelle_parametre`, `..._pc`→`conformite_limites_pc_prelevement`) and dropped `nb_prelevements`, so the water check returned nothing. Provider now tracks the current shapes, fetches the brewing ions by SANDRE `code_parametre` (Ca/Mg/SO4/Cl/HCO3 — a generic size-N page missed Ca/Mg entirely), and picks the dominant network by a 3-tier rule (highest population-coverage percentage → commune-name match → first record, `nb_prelevements` being gone). Aggregation label→ion matching tightened: `chlorures` no longer sweeps chlorinated compounds/pesticides, `hydrogenocarbonates` now captures HCO3 (was `bicarbonate`, never matched). Foundation brick for the prep-readiness « eau » checks epic. Live E2E: Lille (59350) → Ca 114.8 / Mg 22.8 / Cl 50.3 / SO4 106.4 / HCO3 341.5 mg/L, hardness 124.1 °fH (French hydrotimetric degrees).
- Reviews — pre-push `pr-pre-reviewer` (0 Must / 3 Should / 2 Nice / 1 intentional Disagree): all Should (coverage tie-break + `selectDominantRecord` edge tests) and the shared-helper Nice implemented — duplicated NFD/diacritic normalizer extracted to `common/normalize-french-label.ts`; `foldStyleKey` left distinct (extra apostrophe/whitespace folding). Copilot: 0 inline comments. `nest build` green; water suite 25/25; full CI green.

### PR #1353 merged (`fafc75f`) — refactor(mobile): remove the orphaned /social route + SocialFeedScreen mockup

- Branch `refactor/remove-orphaned-social-route`, 1 commit. Dead-code cleanup flagged by #1348: once the demo-only « Communauté » nav tab was dropped, the `app/(app)/social.tsx` route, the `src/features/social/` SocialFeedScreen mockup (a soutenance-era placeholder), and the `<Tabs.Screen name="social">` entry in the app layout were all unreferenced. Removed. Mobile suite + tsc + lint green.
- Reviews — refactor-only removal; CI green.

## 2026-07-05

### PR #1350 merged (`0126536`) — feat(api/db): one-off difficulty backfill CLI (recompute existing recipes)

- Branch `feat/api-difficulty-backfill-cli`, 2 commits. Migration 1808 added the difficulty columns with **no backfill**, so pre-feature recipes are `'facile'` placeholders with empty reasons — and the mobile hides the badge for those (gates on `difficulty_reasons`). New/edited recipes recompute on save, but existing ones stay placeholders until touched. Adds `recompute-difficulty-cli` (mirrors `seed-cli`): compiles to `dist/database/recompute-difficulty-cli.js`, runs on the Fly app machine via `fly ssh console --app brasse-bouillon-api -C "node dist/database/recompute-difficulty-cli.js"`, recomputes+persists every recipe's difficulty by reusing `RecipeDifficultyService` verbatim (no duplicated logic). Idempotent. Prep for the prod-representative live APK: deploy → backfill → the badge renders on the real catalogue. **Not yet run in prod** (needs the operator to deploy + run it).
- Reviews — unit-tested H/S/E (5 cases, using the same DataSource-mocking approach as `seed-cli.spec`), CI green. Copilot round: JSDoc corrected (the function doesn't itself run migrations — that's the DataSource's `migrationsRun` option) + a recompute-failure propagation test added; both resolved.

### PR #1348 merged (`4571eee`) — fix(mobile/ui): demo/live nav parity — drop the demo-only « Communauté » tab

- Branch `fix/nav-footer-demo-live-parity`, 1 commit. The bottom nav diverged between demo and live: demo inserted a « Communauté » tab (a soutenance-era teaser for the social feature deferred to v0.2), absent in live/prod — spotted by the founder testing the demo APK (#1344's build). The demo must represent the real app, so the nav is now identical in both modes (Accueil · Brassins · Recettes · Scan · Académie · Profil); removed the demo-only branch + `COMMUNITY_NAV_ITEM`, the footer no longer reads the demo flag. The now-orphaned `/social` placeholder route (`app/(app)/social.tsx`) is flagged for a separate dead-code cleanup.
- Reviews — local `pr-pre-reviewer` skipped for this small removal (CI + the added regression guard cover it); verified live on the emulator (demo footer now shows the six live items). Full mobile suite green (1219).

### PR #1346 merged (`f78e22b`) — feat(mobile/recipes): default the Brassage tab to the recipe's own steps (ADR-0024 D5)

- Branch `feat/brewing-tab-recipe-steps-default`, 1 commit. **ADR-0024 D5 (part a)**: the recipe detail's Brassage tab now defaults its process-display mode to `recipe` (« Étapes de la recette » — this recipe's own steps) instead of `phases` (the generic brewing-phase glossary), and the toggle chips are reordered so the default leads. The novice lands on what to do for the recipe in front of them. The glossary stays reachable as a non-default mode; **D5 part b (move « Phases de brassage » to the Academy) is deferred to the Academy epic #1333.** Empty-steps recipes keep the pre-existing empty-state hint.
- Reviews — local `pr-pre-reviewer` (0 Must / 0 Should; 1 Nice applied — dropped a redundant press on the now-default chip). Full mobile suite green (1218); verified live on the emulator (Brassage opens on the recipe's steps).

### PR #1344 merged (`105a0b3`) — feat(mobile/recipes): brewing-difficulty badge + tap-to-explain (Tranche B slice 3)

- Branch `feat/recipe-difficulty-badge-mobile`, 5 commits. The **mobile** half of the difficulty badge (ADR-0024) — the user-visible completion of Tranche B (backend was #1342). Mobile is a **pure consumer**: renders `difficultyEffective` (= override ?? computed) + stored `difficultyReasons`, never scores. Extends the generic `core/ui/Badge` (warning/error variants); new `DifficultyBadge` (level → brand-palette variant + FR label) — display-only on list cards (no nested touchable), interactive on the recipe « Vue » where a tap opens a read-only `DifficultyExplainModal` (reasons + a « calculé : … » hint on override). `Recipe` type + `mapRecipe` gain the 4 difficulty fields (snake→camel, all optional); demo data carries a pre-computed difficulty on a representative subset (3 levels + one override). **ADR-0024 promoted Proposed → Accepted + added to the CLAUDE.md index** (build landed).
- Reviews — adversarial multi-lens workflow + pr-pre-reviewer + Copilot. **MUST (a11y)**: the amber `warning` badge text was illegible on the amber bg (1.8:1) → darkened to `brand.secondary` (~5.3:1), border stays amber; **verified live on the emulator**. **Palette reconciled** to the brand traffic-light (olive/amber/terracotta), ADR-0024 D4 + spec updated (founder decision 2026-07-04). **Copilot**: badge gated on `difficultyReasons?.length` (not just the level) so a backend placeholder — un-recomputed row defaulting to `facile` + empty reasons — degrades away instead of a misleading pill. **CI de-flake**: the pre-existing concurrent-import guard test (#1337) was flaky under CI (single micro-task flush) → deterministic `waitFor` on the row's busy state. Live-verified end-to-end (badge on Vue + tap-to-explain, cards across 3 levels, override « Avancé », no badge for un-computed rows). Full mobile suite green (1217+). **Tranche B (difficulty) is complete.**

## 2026-07-04

### PR #1342 merged (`45bdfd3`) — feat(api/recipe): brewing-difficulty compute + storage (Tranche B slices 1+2)

- Branch `feat/recipe-difficulty-service`, 4 commits. Backend for the per-recipe brewing-difficulty badge (ADR-0024). **Slice 1** = pure `RecipeDifficultyDomainService` (rule-based, max-dominates + bounded compounding, factors F1 yeast / F2 gravity / F3 fault-tolerance lager-gated / F4 water / F5 mash *deferred* / F6 complexity, glossed FR tap-to-explain sentences). **Slice 2** = `RecipeDifficultyService` adapts a recipe + sub-entities → domain input (worst-case yeast reduction ordered by `created_at`, distinct fermentable/hop-variety counts) and persists `difficulty_computed` + `difficulty_reasons`; recompute wired into recipe create/update (in-tx) + import (after satellites) + all 15 ingredient mutations (ingredient path is fire-and-forget: logged, never fails a committed edit). 3 new `recipes` columns (migration 1808, `difficulty_computed` not-null `'facile'` default, `difficulty_override` nullable, `difficulty_reasons` nullable json, no backfill). DTOs expose effective = `override ?? computed` + reasons on `RecipeDto`/`PublicRecipeDto`; override accepted+validated on create/update.
- Reviews — pre-push multi-lens adversarial workflow (5 lenses, skeptic-verified) + local `pr-pre-reviewer`: 2 MUST (recompute wiring at the 15 ingredient sites + via `updateMine` was untested — mutation-testing proved neutralising it kept the suite green) → integration tests through the real methods; 1 real bug (ingredient recompute failure surfaced as a 5xx on a committed edit) → swallowed+logged; import/override/effective-fallback coverage + spec §6 multi-yeast note added. Copilot round: deterministic yeast ordering + correct `Logger.warn` usage, both resolved. Full API suite green (956 tests, +10). **ADR-0024 stays Proposed** — promoted to Accepted + CLAUDE.md index with slice 3 (mobile badge).

## 2026-07-03

### PR #1340 merged (`1c55ab4`) — feat(mobile/demo): non-owned community recipe so community flows are demoable

- Branch `feat/demo-community-recipe`, 2 commits. Adds a demo recipe « Blonde de la Communauté » (`r-demo-community-1`) with **no `ownerId`**, so demo mode finally carries a community (non-owned) recipe. `listRecipes` (« Mes recettes ») filters to `ownerId != null` → it stays out of the carnet and surfaces only in « Découvrir » via `listPublicRecipes` (public visibility). Unblocks live verification of Tranche A (#1331) — the add-to-carnet undo snackbar and the lighter unsaved-recipe Water tab were previously unreachable on-screen for lack of a non-owned recipe. Verified live on the emulator during the follow-up run (the PR body's « verification to follow » predates that check): « Ajouter à mon carnet », the lightened Water tab, and the « Recette ajoutée · Annuler » snackbar all fire.
- Reviews — the shape test asserting every public recipe carries an `ownerId` was audited, not forced green: a public/community recipe legitimately has none (the backend strips it, which is what drives « Ajouter à mon carnet »), so it now checks `visibility` plus a positive « stays out of Mes recettes, in Découvrir » test. Copilot: 1 stale-comment thread (the owned-only filter is no longer a no-op) reworded (`9cc9c62`) + resolved. CI green; full mobile suite green.

### PR #1339 merged (`fd4232b`) — fix(mobile/ui): Snackbar floats above a sticky CTA instead of overlapping it

- Branch `fix/snackbar-sticky-cta-overlap`, 2 commits. Screen-review follow-up from Tranche A: the app-level Snackbar overlapped the recipe detail's sticky « Ajouter à mon carnet » CTA (confirmed live on the emulator). New `core/ui/sticky-cta-clearance` provider tracks mounted sticky CTAs — split register/clearance contexts so a mounted CTA never re-triggers its own register effect — and exposes the extra bottom clearance; `RecipeStickyCta` calls `useMarkStickyCtaPresent()`, and the Snackbar adds that clearance to its `paddingBottom` so it floats above the bar instead of covering it.
- Reviews — Copilot round: hardcoded `48` → height derived from the same theme tokens `PrimaryButton` uses (`spacing.sm * 2 + typography.lineHeight.label`, `f098820`); missing coverage → new `sticky-cta-clearance.test.tsx` (clearance hook 0 → bar height → 0 on unmount, plus an integration check that the Snackbar overlay `paddingBottom` grows by exactly the bar height). Both threads resolved. CI green; mobile suite green.

### PR #1338 merged (`f7c193e`) — docs: remove redundant root user_stories.md (both were superseded by the Product Backlog)

- Branch `docs/dedup-user-stories`, 1 commit. Repo-hygiene: the two `user_stories.md` copies were **both already superseded stubs** pointing at the Product Backlog — not two divergent live copies as first assumed. Deleted the redundant root `docs/user_stories.md`, updated the Product Backlog's supersedes line to drop the dead path, and annotated `docs/README.md`. The mistaken « consolidate two divergent copies » premise was surfaced and the correct clean action taken instead.
- Reviews — docs-only; no review threads. CI green.

### PR #1337 merged (`a300240`) — test(mobile/scan): regression test for the concurrent-import guard (#766)

- Branch `test/scan-concurrent-import-guard`, 1 commit. Fills the deferred coverage gap from #1327: a regression test on `BeerInfoCardScreen` asserting a second import cannot launch while one is already pending (react-query `isPending` guard). Holds the first import mid-flight with a deferred promise + a micro-task flush (`await act(async () => { await Promise.resolve(); })`) to propagate the pending-state re-render before the second tap, then asserts the import use-case fired exactly once.
- Reviews — test-only; no review threads. CI green; 36/36 BeerInfoCard tests green.

### PR #1334 merged (`89491c4`) — docs(recipe-difficulty/architecture): ADR-0024 + spec + UML for the difficulty badge (Tranche B)

- Branch `docs/recipe-difficulty-conception`, 3 commits. **Conception-first** for the per-recipe brewing-difficulty badge (screen-review Tranche B): **ADR-0024** (rule-based scoring, max-dominates + bounded compounding, backend-computed + author override, 3 levels, all-grain baseline; weighted decision matrix + a documented web study), a **spec** (`recipe-difficulty-algorithm.md` — factors F1 yeast / F2 gravity / F3 fault-tolerance lager-gated / F4 water / F5 mash *deferred* / F6 complexity, v1 thresholds, glossed plain-French explanation strings, aggregation, 3 new `recipe` fields, worked H/S/E examples), and **4 diagrams** (`diagrams/recipe-difficulty/` use-case, sequence, component, class).
- Reviews — model grounded in a 4-angle sourced study, then hardened by two local reviews (generalist pr-pre-reviewer + a 4-lens adversarial workflow): 20+ confirmed findings fixed (Bohemian Pilsner contradiction, the IBU-makes-lagers-easier bug, F6 over-scoring APAs, saison blindness, jargon in tap-to-explain strings, yeast-enum / field-name drift). GitHub Copilot round: 6 minor doc points (RecipeYeast `0..*`, `DifficultyResult` defined, phantom `stats` arg, stable `reasons` order, « Vue » disambiguation) fixed in `45c08b3` + resolved. **ADR-0024 stays Proposed** (promoted to Accepted + added to the CLAUDE.md index when the build lands). Docs-only; CI green; diagrams render.

### PR #1331 merged (`266a2d7`) — feat(mobile/recipes): add-to-carnet undo snackbar + lighter Water tab for unsaved recipes (Tranche A)

- Branch `feat/community-recipe-ux-tranche-a`, single commit (`973a2c8`). **Tranche A** of the screen-by-screen review — two community-recipe UX fixes. (1) New app-level `SnackbarProvider` / `useSnackbar` primitive (`core/ui`, mirrors `ConfirmProvider`): one branded auto-dismissing bottom bar with an optional action, mounted at the app root. Importing a community recipe from its detail no longer navigates silently — it lands on the owned copy and shows « Recette ajoutée à ton carnet · Annuler »; the undo deletes the copy and returns to the source (`undoImport` runs from the app-level snackbar, so it survives the screen unmounting — calls the use-case directly + stable queryClient/router). (2) `WaterTab` gains `canCompare` (= `isOwned`): an unsaved community recipe shows only the recommended profile + a « enregistre pour comparer » hint, hiding the local-water comparison, compatibility score, salts and calculator until owned.
- Reviews — local `pr-pre-reviewer` (0 Must Have; the flagged undo delete-fails sad-path test was added). Local Codex CLI unavailable this run (arg incompatibility). Follow-ups tracked separately: a concurrent-import guard test, and the snackbar / sticky-CTA visual overlap. CI green; full mobile suite green. Verified live on an emulator: the full (owned) Water tab renders with no regression; the unsaved-recipe paths are unit-tested (the demo dataset has no non-owned recipe to drive them on-screen).

### PR #1328 merged (`cba5497`) — docs(academy): design generated knowledge base architecture

- Branch `chore/beer-academy-audit`, squash-merged from 8 commits. Documentation-only conception slice for the Brewing Academy refactor: product framing, ADR-0023, a coding-ready design pack, and a UML package for turning the hardcoded Academy into a Markdown/front matter driven, generated, typed, mobile-first reference knowledge base. V1 is explicitly scoped to local generated content and the `houblons` / `levures` / `eau` vertical slice: no database, CMS, backend publishing, vector search, or chatbot runtime yet. The future brewing chatbot is prepared through sourced retrieval contracts, strict citation/RGPD constraints, and shared glossary/source/link models.
- Architecture — Clean Architecture boundaries, SOLID responsibilities, and pragmatic patterns are documented before implementation: repositories and adapters around generated payloads, use cases behind ports, presenter/view-model shaping for UI, semantic link resolution, source validation, lifecycle rules, local search, renderer constraints, mobile/tablet UX flows, security/RGPD, migration path, and test strategy. Copilot review found 6 documentation consistency gaps; all were fixed and answered before merge. CI checks green for the docs-only diff.

### PR #1327 merged (`77f00a7`) — refactor(mobile): migrate remaining native confirmations to the branded ConfirmDialog (#1324)

- Branch `refactor/native-dialogs-to-confirmdialog`, 2 commits (`676e4a0`, `b917a27`). Closes #1324. Finishes the migration begun in #1323: the 7 remaining yes/no `Alert.alert` confirmations now route through the branded `ConfirmDialog` via `useConfirm()` — delete recipe (RecipeDetails), delete equipment (EquipmentDetail), import a community recipe (BeerInfoCard / `MatchingRecipesSection`, #766), and the four BatchDetails actions complete-step (F6) / delete (F25) / cancel (F16) / archive (F25). Destructive flags preserved 1:1 from the prior native styling (cancel destructive, archive not — #1292); the `missingBatchId` early-returns and the scan concurrent-import re-check kept. Informational single-OK notices (onError, "coming soon", "copied", the post-import toast) intentionally left native (out of scope). Each screen's tests re-wired through the real `ConfirmProvider`, driving the dialog by `accessibilityLabel`.
- Reviews — local pre-push ritual (pr-pre-reviewer 0 Must Have; Codex clean); 2 pre-existing sad-path gaps flagged → batch cancel (F16) + archive (F25) failure-path tests added (`b917a27`); scan concurrent-import guard test deferred (tracked). CI green; full mobile suite green.

### PR #1326 merged (`a56c41e`) — fix(mobile/auth): keep the submit button reachable when the keyboard is up

- Branch `fix/login-keyboard-covers-button`, 2 commits (`2a26246`, `635b0bf`). Screen-review point found live on the emulator: on `LoginScreen`, the open keyboard hid the « Se connecter » button with no way to reach it. Root cause: Android `softwareKeyboardLayoutMode: "pan"` (set by #1080 to keep the focused field visible) leaves the button below it under the keyboard. Fix scopes the `KeyboardAvoidingView` behavior per platform — `android` → `height` (the ScrollView reveals the button), `ios` → `padding`, `web`/other → `undefined` — leaving the deliberate `pan` mode untouched. Verified live on an Android emulator.
- Reviews — local pre-push ritual (pr-pre-reviewer + Codex clean, 0 Must Have); Copilot flagged the initial non-iOS `height` reaching `web` → scoped explicitly to `Platform.OS` + a regression test asserting `web` stays `undefined` (`635b0bf`). CI green; 23 LoginScreen tests + full mobile suite green.

### PR #1323 merged (`028a021`) — feat(ui): branded ConfirmDialog + useConfirm hook (replaces native Alert)

- Branch `feat/branded-confirm-dialog`, 2 commits. Screen-review point (« le pop-up est dégueulasse »): confirmations used RN `Alert.alert()` → the unstylable OS-native dialog, off-brand. Adds `ConfirmDialog` (`core/ui`, branded modal, red destructive variant) + `ConfirmProvider` + `useConfirm()` (single dialog at the app root, imperative `confirm(options): Promise<boolean>`); call sites move from `Alert.alert(title, msg, [cancel, confirm])` to `if (await confirm({…})) {…}`. **First migration**: `BrewPrepScreen` « Lancer le brassage ? ». Remaining confirmations (delete recipe/batch, cancel, archive, equipment, scan) tracked in **#1324**, before the next APK build; single-button info alerts out of scope.
- Reviews — local pre-push (Claude 0 Must Have) then Copilot round 1: **re-entrancy** hardened (a 2nd `confirm()` settles the 1st promise as declined, never leaks) + unmount-while-pending cleanup + tests; async launch handler voided at the call site; backdrop a11y role. CI green; mobile 1183 tests.

### PR #1322 merged (`06cf5a0`) — fix(recipes): explain why a recipe used by a batch cannot be deleted

- Branch `fix/recipe-delete-referenced-message` (API + mobile), 3 commits. Screen-review blocking point: deleting a recipe referenced by a batch showed a misleading « Vérifie ta connexion » — the user retried in vain. Backend `deleteMine` now throws its FK-violation `BadRequestException` with a structured `errorCode: 'RECIPE_REFERENCED_BY_BATCH'` (mirrors `NotABeerException`), so mobile discriminates it from other 400s (e.g. `ParseUUIDPipe`); the delete `onError` keys off that errorCode and shows « Cette recette est utilisée par un brassin… supprime d'abord le brassin ». Behaviour unchanged (still blocked). Reviews — Claude round-1 Must Have (status-only ambiguity → errorCode); Copilot (type predicate) + Codex P2 (dropped the wrong « ou archive » advice — archiving keeps the FK). CI green; API 920, mobile 1179.

### PR #1320 merged (`8fd4221`) — fix(batches): make the brew-day detail screen scroll + sticky primary CTA

- Branch `fix/batch-details-scroll-sticky-cta`. First fix of the **screen-by-screen UX review** (post-APK live test). Bug: on `BatchDetailsScreen`, a step with a tall F4 « Avant de démarrer » checklist (fermentation) pushed the primary button under the floating footer with no scroll to reach it. Root cause: only the inner steps `FlatList` scrolled; the upper column (progression/timer/doneWhen/F4/CTA) was fixed-height. Fix mirrors `BrewPrepScreen`: whole body is one `ScrollView`, and the single primary action (Mettre en bouteille / Démarrer / Terminer, computed via a `primaryCta` object, null in live-closure) is a sticky `RecipeStickyCta` bar pinned above the footer; steps render as a mapped list (≤5, no virtualization). Follow-up #1319: promote `RecipeStickyCta` → `core/ui` (3rd, cross-feature consumer).
- Reviews — local pre-push ritual (Claude 0 Must Have; ≤5-steps assumption documented inline; the 3 former inline CTAs verified preserved 1:1). CI green; mobile 1177 tests. Mobile-only — needs an APK rebuild to reach the device.

### PR #1317 merged (`2f607c8`) — chore(mobile): drop the dead encyclopedia URL from EAS build profiles

- Branch `chore/eas-drop-dead-encyclopedia-url`. Removes `EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL` (the `brasse-bouillon-encyclopedia` Fly app was destroyed 2026-07-02) from the `preview` and `preview-demo` EAS profiles; `env.encyclopediaUrlIsConfigured` now reads false so consumers stop dialing a dead host. Per-surface behaviour (review-verified): beer-catalog fails fast (« encyclopedia not configured », Codex #871 guard); scan falls back to the legacy NestJS `/scan/lookup` path (#1186) — NOT a fail-fast. Brew-day novice journey unaffected. Prep for the `preview`-profile APK (live prod API, migrations 1805-1807 live) for the novice re-test.
- Reviews — local pre-push ritual (Claude 0 Must Have; the review corrected the initial commit narrative, which overstated scan as fail-fast). Config-only; CI green.

### EAS Android build submitted (2026-07-03) — `preview` profile for the novice re-test

- `preview` profile Android APK (id `a78138ba-c6e4-494b-bda1-c7c89725ff66`), live data against the freshly-deployed prod API (`EXPO_PUBLIC_USE_DEMO_DATA=false`), built from the encyclopedia-URL-cleanup branch. First real-conditions build carrying novice-journey block B (F1/F3/F4/F5/F9a + F14/F15 draft tier). Note for the test: the prod API is scale-to-zero, so the first backend call wakes it in ~10 s.

### PR #1315 merged (`c58a4b5`) — fix(faq-bot): fail closed on GET /challenge when the HMAC secret is missing

- Branch `fix/faq-bot-challenge-fail-closed`, 2 commits (`cb65638`, `9f8556e`). Discovered on the first post-H3 prod deploy: with no `ALTCHA_HMAC_KEY`, `GET /faq-bot/challenge` returned an unhandled 500 (altcha-lib `DataError: Zero-length key` inside `issueChallenge`) instead of the fail-closed 503 the design mandates — the `BotCheckGuard` covered verification but not issuance. `FaqBotService.issueChallenge()` now fails closed (logged error + `FaqBotUnavailableException`, port never called), deliberately independent of the dev/test bypass flag (issuing is cryptographically impossible without a key in any environment); `faqBotConfig()` trims `ALTCHA_HMAC_KEY` so a whitespace-only secret reads as missing in both the guard and the service. Follow-up filed for the widget's 400-vs-503 error-message gap: #1314.
- Reviews — local pre-push ritual (Claude 0 Must Have; both Should Haves addressed: config trim implemented, widget gap → issue); Copilot round 1 (2 test-hygiene threads) accepted in `9f8556e` (env save/restore, `getStatus() === 503` pinned). CI green; API 920 tests.

### API deployed to Fly (2×, 2026-07-03) — `main` live in production again

- First deploy after the H3 fix (#1311): boot green in ~10 s, `ENOENT dist/faq-bot/prompts/system-prompt.md` gone, migrations `1805`-`1807` applied (draft batch tier, PRÉP actions, doneWhen — the whole novice-journey block B is now server-side in prod). Second deploy after #1315: `GET /faq-bot/challenge` verified returning a clean 503 (`Anti-bot challenge unavailable`); `/health` 200. Prod no longer runs the pre-#1293 rollback image. Faq-bot remains inert by design until the activation prerequisites are met (budget-counter persistence, Fly secrets, widget origin).

### PR #1311 merged (`7641480`) — fix(api): copy faq-bot prompt assets to the runtime dist root

- Branch `fix/api-nest-cli-assets-outdir`, 2 commits (`12e01c0`, `9f499a8`). Closes the **H3 blocker** (2026-07-02 hosting session): the faq-bot module (#1293) crashed NestJS at boot in the production image (`ENOENT dist/faq-bot/prompts/system-prompt.md`), leaving `main` undeployable to Fly. Root cause: the Docker build copies `src/` only → tsc infers `rootDir=src` → compiled loader at `dist/faq-bot/prompts/`, while the nest-cli assets glob shipped the `.md` to `dist/src/…`. Fix in two moves: assets `outDir` → `dist`, then (Codex P1, accepted) `scripts/` excluded from `tsconfig.build.json` so **every** build — Docker src-only, CI full checkout, local — emits the same layout (`dist/main.js`, prompts beside the compiled loader). Verified by reproducing both layouts and executing the compiled `loadFaqBotPrompts()`.
- Reviews — local pre-push ritual (Claude 0 Must / 0 Should); **Codex GitHub review returned** (quota refilled) with 1 P1, accepted in `9f499a8`. CI green. **Unblocks**: Fly API deploys from `main` (migrations 1805-1807 queued) and the faq-bot activation prerequisites (budget-counter persistence + secrets, tracked separately).

## 2026-07-02

### PR #1309 merged (`30c075e`) — feat(batches): T-minus pre-announce + calm elapsed timer state (F9a)

- Branch `feat/brew-step-anticipation` (mobile-only), 3 commits (`df50f6e` conception, `353e647` implementation, `8c263fc` review fix). **Conception-first**: brew-day `06-state-brew-step` derived-state note amended (F9a realised; **F9b cross-screen persistent reminder explicitly deferred** to the background-notifications epic). Fixes novice-journey friction **F9** (in-app v1): two purely **derived** cues in `BrewStepTimer` — (1) **T-minus pre-announce** (≤ 5 min remaining on a timed ACTIF step): « Bientôt : <next step> » + its first F4 PRÉP gesture (nextStep wired from `BatchDetailsScreen`, nothing on the last step); (2) **calm elapsed state** at 00:00: the countdown yields to « Temps écoulé » pointing at the F5 `doneWhen` card and the ✋ Terminer — no alarm styling, nothing auto-completes. Nothing persisted, no API change, no migration. **This closes structural block B of the audit** (F1/F4/F5/F6/F9 shipped; F7/F7b assessed covered by F1+F4).
- Reviews — local pre-push ritual: Claude **0 Must Have**, Should Have (screen-level next-step integration test) implemented pre-push; Copilot round 1 (4 threads): the elapsed hint now adapts to `doneWhen` presence (`8c263fc` — no misleading pointer on legacy steps), and the 3 grammar comments **rejected with rationale** (« profites-en » is correct — euphonic s before « en »/« y » in the imperative). **Codex unavailable locally AND on GitHub** (OpenAI quota). CI green; mobile 1175 tests.

### PR #1307 merged (`3a51dd2`) — feat(batches): explicit end condition (doneWhen) in the ACTIF phase (F5)

- Branch `feat/brew-step-done-when` (API + mobile), 2 commits (`74c8047` conception, `7779e86` implementation). **Conception-first**, same pattern as #1305: brew-day `01-sequence-step-enrichment` + `06-state-brew-step` amended and validated before code. Fixes novice-journey friction **F5** (timer-only step model — nothing said *when a step is over*): `StepGuidance.doneWhen` = one pedagogical FR sentence per type, rendered as a « C'est terminé quand… » card in the **ACTIF** phase near the complete CTA. Timed steps frame the countdown as an aid, not an order; event-gated steps get their condition as THE end signal (FERMENTATION: gravity stable over 2-3 days, never a fixed date). Snapshot at launch persists `batch_steps.done_when` (nullable text, additive reversible migration `1807000000000`, no backfill); domain round-trip preserves it across transitions; `BatchStepDto.done_when` (Swagger). Hidden in PRÉP and on legacy steps; **never gates « Terminer »** (unified ✋ end, brew-day/06). **Scoping decision recorded**: F7 (systemic pre-phase + premature timer) and F7b (inter-phase guidance) assessed as COVERED by F1 (#1286) + F4 (#1305) — the audit's joint gestures are exactly the shipped PRÉP actions; to re-verify at the next live novice test. Remaining block-B item: **F9** (T-minus pre-announce + persistent current-action reminder).
- Reviews — local pre-push ritual: Claude **0 Must Have** (1 intentional pattern documented); **Codex unavailable locally AND on GitHub** (OpenAI quota — flagged on the PR). CI green first run (all checks local before push). API 917 tests; mobile 1169 tests. Migration reaches prod with the next Fly `api` deploy (still behind the H3 `nest-cli.json` fix).

### PR #1305 merged (`48654e8`) — feat(batches): PRÉP-phase physical prep actions with pedagogical why (F4)

- Branch `feat/brew-step-prep-actions` (API + mobile), 3 commits (`eb01ecc` conception, `7a7de1a` implementation, `6bc02ea` review fixes). **Conception-first**: brew-day `01-sequence-step-enrichment` (launch-time enrichment now carries `prepActions` `{action, why}` pairs; also re-synced on the 07b prepare/launch flow) + `06-state-brew-step` (PRÉP content note) amended and validated — architecture AND brewing content — before any code. Fixes novice-journey friction **F4**: the PRÉP phase of each step lists the physical gestures (heat ~7 L strike water, clean/rinse, dough-in; bag out + rolling boil + hop staging; whirlpool + chiller; chill + sanitize + pitch + airlock), **each with its one-line pedagogical why** — the app teaches, a novice must learn to brew alone (educational vocation, ADR-0021 D5). `StepGuidance.prepActions` per type; snapshot at launch persists `batch_steps.prep_actions` (nullable simple-json, additive reversible migration `1806000000000`, no backfill) and the domain round-trip preserves it across step transitions; `BatchStepDto.prep_actions` (Swagger `StepPrepActionDto`); mobile « Avant de démarrer » `ChecklistRow` list in the PRÉP phase — UI-local ticks, « Démarrer » **never hard-gated** (guidance + escape hatch). PACKAGING deliberately empty (the B3 bottling gate covers it). Figures are assumed approximations; ADR-0020 computed values + per-recipe override deferred.
- Reviews — local pre-push ritual: Claude **0 Must Have** (2 intentional patterns documented); **Codex unavailable BOTH locally and on GitHub** (OpenAI workspace out of credits / code-review usage limit — flagged explicitly on the PR, not silently skipped); Copilot round 1 (2 threads) accepted in `6bc02ea`: `StepPrepAction` moved to the domain entities (dependency direction services → entities) and the mobile ticks comment made accurate (namespaced per step, bounded, mount-scoped — no reset claimed). CI green first run (everything verified locally pre-push); API 915 tests; mobile 1166 tests. Migration reaches prod with the next Fly `api` deploy (still behind the H3 `nest-cli.json` fix).

### PR #1302 merged (`9a80e6f`) — chore(review): fix codex-review.sh for codex-cli >= 0.142 review targets

- Branch `chore/codex-review-target-fix`, 2 commits (`4a208f1`, `c51bf48`). codex-cli 0.142 made `--base` and a custom PROMPT mutually exclusive review targets, breaking the pre-push ritual's Codex leg; the base-diff scope now rides in the prompt, with the base ref resolved in bash (prefer `refs/remotes/origin/<base>` when present) so Codex receives one concrete range. Review — Copilot 1 thread (resolve-in-bash) accepted in `c51bf48`. Related: #1298 closed as duplicate (superseded by #1301 + this PR).

### PR #1301 merged (`a542c49`) — chore(review): align review pipeline with reversed AI-attribution policy

- Branch `chore/review-ai-attribution-policy`. Removes the stale "no AI attribution" instructions from the local review pipeline (codex-review.sh prompt, pr-pre-reviewer agent, pre-push-review skill) — the attribution policy was reversed 2026-07-02 (transparency; see PR #1296 for the repo-wide CLAUDE.md alignment).

### PR #1300 merged (`53f34a9`) — feat(batches): draft/prep batch tier with persisted checklist (F14/F15)

- Branch `feat/batch-draft-prep` (API + mobile), 2 commits (`d185a7e` feature, `f1d178a` review fix). Slice **07b** of the brew-day structural block. A batch now exists as an « en préparation » **draft** before launch: nullable `launched_at` + `prep_checked_ids` columns (same soft-lifecycle model as 07a — no CHECK rebuild), derived precedence archived > cancelled > draft > raw status; migration `1805000000000` backfills `launched_at = started_at` for legacy rows and adds a **partial unique index** (one unlaunched draft per owner+recipe) backing `prepareMine`'s idempotency under concurrent calls (race recovery in the service). Domain `startBatch` split into `prepareBatch()` / `launchBatch()` (steps snapshotted at launch, not at prepare); `updateMinePrepChecklist()` persists the checklist ticks on the draft; draft guards freeze every journal operation on an unlaunched batch. Endpoints: `POST /batches/prepare`, `PATCH /batches/:id/prep-checklist`, `PATCH /batches/:id/launch`. Mobile: `BrewPrepScreen` backed by the persisted draft (optimistic toggles; checklist PATCHes **serialized client-side** — one in flight, latest list coalesced — so out-of-order full replacements cannot lose ticks); `BatchesScreen` shows « En préparation » and routes drafts back to the prepare screen; demo seed stamps `launched_at` so the completed demo brew never derives as a draft. UML synced (brew-day `07-state-batch-lifecycle`, brew-prep `02-sequence-plan-and-confirm` + `04-class`). Fixes F14/F15.
- Reviews — local pre-push ritual (0 Must Have; 3 P2 fixed pre-push: unique-index idempotency backstop, demo-seed stamp, PATCH serialization) then GitHub round 1 (Copilot + Codex, 4 threads): launch now **gated until checklist saves settle** (`f1d178a` — a launch racing an in-flight PATCH lost the last tick); prepare-on-readable-recipe semantics **kept with rationale** (mirrors `startMine`, #779) — import-first vs brew-readable flagged as a product-level follow-up candidate. CI green; API 908 tests; mobile 1163 tests. Migration applies on the next Fly `api` deploy (still blocked by the H3 `nest-cli.json` fix).

### PR #1299 merged (`6459945`) — chore(review): sync codex-review.sh checklist with pr-pre-reviewer agent

- Branch `chore/codex-review-checklist-sync`. Item-by-item diff of the script's condensed `INSTRUCTIONS` heredoc against `.claude/agents/pr-pre-reviewer.md` found drift; re-aligned (three missing Must Have items plus Should Have additions) while keeping the script's terse style — the two checklists must stay in sync so both local reviewers grade against the same bar.

### Fly.io hosting cost session (decisions H1–H3)

- `H1 — Fly auto-stop / scale-to-zero` — both product apps ran always-on (a 27 May live-demo leftover) costing ~8 EUR/month for a single-user pre-launch project. `fly.toml` switched to `auto_stop_machines = "stop"` + `min_machines_running = 0` and applied in production (config-only deploys reusing the running images). Measured: API sleeps after ~10 idle minutes, wakes in ~9-10 s (NestJS boot + migrations), warm requests <100 ms. Expected bill ~1 EUR/month. Alternatives rejected: free-tier migrations (Render/Koyeb/Vercel + external Postgres — cold starts up to 1 min, SQLite-on-volume unsupported, Vercel non-commercial clause) and immediate homelab move (kept as a future Tailscale-only epic).
- `H2 — encyclopedia Fly app destroyed` — `brasse-bouillon-encyclopedia` (machine + `enc_data` volume + IPs) destroyed on request: near-zero real usage, pure development. SQLite backed up locally first (integrity-checked) to `~/backups/fly/encyclopedia-20260702.db`. Development continues on `localhost:8000`; `packages/beer-encyclopedia/fly.toml` is kept in-repo to allow re-creating the app. Known impact: the EAS demo-APK profiles still point `EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL` at the dead fly.dev URL — re-point at the next EAS build (none planned).
- `H3 — main is currently undeployable to Fly (API)` — discovered while deploying: the faq-bot module (#1293) crashes NestJS at boot in the production image (`ENOENT dist/faq-bot/prompts/system-prompt.md`); `nest-cli.json` copies prompt assets to `outDir: "dist/src"` while the build emits to `dist/`. Production was rolled back to the previous image (`deployment-01KWFQJSP0…`) with the new auto-stop config. Fix required before the pending faq-bot deploy or any API deploy from `main`.

### PR #1293 merged (`28a1535`) — feat(faq-bot): public FAQ chatbot — API (Mistral + ALTCHA) + website widget

- Branch `feat/faq-bot`, 11 commits (API + website). **Conception-first**: ADR-0022 (accepted; EU-sovereign decision matrices → Mistral + ALTCHA) + 4 UML diagrams under `docs/architecture/diagrams/faq-bot/`. Adds an isolated `faq-bot` NestJS module — `POST /faq-bot/ask` + `GET /faq-bot/challenge` (public, anonymous) — with two DIP seams: `LlmPort` → `MistralLlmAdapter` (`mistral-small-latest`, native `fetch`, key server-side only) and `BotCheckPort` → `AltchaBotCheckAdapter` (self-hosted `altcha-lib`, no third-party call). Anti-abuse: throttle 5/min/IP, **single-use ALTCHA proofs** (in-memory replay rejection), **fail-closed guard** when the HMAC secret is missing outside dev/test (503; derivation via the canonical `resolveBootstrapEnvironment`), kill-switch + monthly budget cap, Mistral adapter fails fast on a missing key. RGPD: no conversation content logged — anonymous aggregate counters only. Website: self-hosted `chat-widget.js`, staging/localhost-gated (never prod in v1), solves the ALTCHA proof-of-work with Web Crypto, XSS-safe (`textContent`), no network call on page load, bilingual FR/EN. Prompt guardrails: project-only FAQ (NOT a brewing assistant), abstain → `[CONTACT]`, founder first-name-only (no links/contact), no emojis. Prompt-as-spec eval harness (`evals/AGENT.md` judge protocol) re-judged pre-merge — **13/13 GREEN**; 865 API unit tests.
- Reviews — Copilot (8 threads) + Codex (2 × P2) all addressed, then a **three-agent adversarial follow-up** (architecture / test-quality / security): env derivation moved to the canonical resolver (DRY, case-normalised), new `faq-bot.config.spec.ts` pins the bypass derivation, new concurrent-replay spec pins check-and-claim atomicity; one flagged TOCTOU race **rejected with rationale** (synchronous has/set after the await) and locked in by that spec. Conception docs re-aligned in the same pass (fail-closed + single-use reflected in ADR-0022 and the sequence/component/class diagrams). CORS restriction deferred to a cross-consumer review (documented in ADR-0022). **Deploy config pending**: Fly secrets (`MISTRAL_API_KEY`, `ALTCHA_HMAC_KEY`) + the widget's staging API origin — at deploy time.

## 2026-07-01

### PR #1292 merged (`3f99584`) — feat(batches): cancel + archive batch soft-lifecycle (F16/F25)

- Branch `feat/batch-lifecycle-soft-status` (API + mobile). Slice **07a** of the brew-day structural block. Adds a **soft lifecycle** that preserves the journal: `PATCH /batches/:id/cancel` (in_progress only → sets `cancelled_at`) and `PATCH /batches/:id/archive` (completed/cancelled → sets `archived_at`). Model = **nullable timestamp columns** + a derived `EffectiveBatchStatus` (archived > cancelled > raw status), NOT new enum values — a safe `ADD COLUMN` migration (`1804000000000`) that avoids a SQLite CHECK-constraint table rebuild on the cascade-FK-heavy `batches` table. A shared `assertMutable` guard freezes a cancelled/archived batch against every workflow endpoint (fermentation, step transitions, bottling, tasting). Mobile: confirm-gated « Annuler ce brassin » / « Archiver ce brassin »; cancelled/archived filtered out of the active batch list and label candidates.
- Reviews — local pre-push (Must-Have = the cross-endpoint freeze guard) + Codex + Copilot: fixed a mobile typecheck regression (widening `BatchStatus` rippled into the labels feature → filter cancelled/archived out of label candidates via a narrowing predicate), `assertMutable` precedence (archived before cancelled, mirrors `deriveEffectiveStatus`), and the OpenAPI `status` enum. Codex P2 (the header hard-delete still bypasses the soft lifecycle and drops the journal) **deferred to slice 07b** — the proper gate needs the `draft` state 07b introduces. CI green; API `batch.service.spec` 45/45; mobile labels 7/7 + batches 164/164. Migration applies on the next Fly `api` deploy. Refs #868.

### PR #1291 merged (`180c29c`) — feat(batches): gate density prompts to fermentation + novice estimate (F3)

- Branch `feat/brew-density-jit` (mobile-only). Slice **08**. The « densité & alcool » card no longer shows for the whole batch — it appears **just-in-time**, only on the fermentation-active step and packaging (conforms to `docs/architecture/diagrams/brew-day/08-sequence-jit-density.md`). Adds a novice **escape**: a brewer who cannot measure sees a **display-only** ABV estimate computed from the recipe OG/FG (never persisted; `plausibleGravity` normalizes the 0 sentinel to null). Fixes F3.
- Reviews — Codex + Copilot: 5 findings fixed (demo gate applied, `batch != null`, `plausibleGravity` for the 0 sentinel, `accessibilityRole="link"` on the two density affordances). CI green; 59 mobile tests. Mobile-only — APK rebuild, no redeploy. Refs #868.

### PR #1287 merged (`5a2cada`) — fix(beer-encyclopedia/ml): ABV parsing, name fallback, dead IBU weight

- Branch `fix/beer-encyclopedia-scan-extraction` (Python encyclopedia). Corrects the ML extraction: the brewery filter uses `_normalize(brewery)`; `extract_name` gains a two-pass fallback (`_carries_content_beyond_style` keeps « Punk IPA », drops a bare style token like « IPA »); ABV parsing and a dead IBU weight fixed.
- Reviews — Codex + Copilot: 2 threads resolved. CI green (`tests/test_ml/test_extract.py` added). Encyclopedia is a separate Fly app — needs a `fly deploy` of the encyclopedia service to take effect.

### PR #1286 merged (`421dc9f`) — feat(batches): derive PRÉP/ACTIF step phase from startedAt (F1)

- Branch `feat/brew-step-prep-active` (API + mobile). First **implementation slice of the brewing-assistant structural block** (conforms to the merged conception `docs/architecture/diagrams/brew-day/06-state-brew-step.md`). Splits each brew step into **PRÉP** (in progress, no timer) and **ACTIF** (timer running), fixing novice-journey friction **F1** — the countdown no longer starts before the brewer taps « Démarrer ». The phase is **derived** from the existing nullable `started_at` (no new column, no migration, no new enum): PRÉP = current step `in_progress` + `started_at` null; ACTIF = `started_at` set. Backend: steps open in PRÉP (no `startedAt` on entering `in_progress`, on start and on advance); new `startCurrentStep` domain transition + `POST /batches/:id/steps/current/start`; a shared `applyCurrentStepTransition` helper (DRY) backs both start and complete. Mobile: `use-step-countdown` gates the timer on activation (PRÉP → no timer); conditional CTA « Démarrer » (PRÉP) / « Terminer » (ACTIF); packaging keeps « Mettre en bouteille » (B3 preserved). Backward-compatible (existing prod `in_progress` steps carry `started_at` → read as ACTIF); completing stays permissive server-side (order enforced by the UI).
- Reviews — local pre-push (pr-pre-reviewer, 0 Must Have) + Codex + Copilot: round-2 fixes in `01e72ed` — (1) domain step-transition errors now map to 4xx via a `runStepTransition` wrapper (409 « already active », 400 invalid-state, 500 unknown; covers start + complete), previously an HTTP 500 for a normal conflict; (2) `recipeVolumeL` preserved in both mutations' `setQueryData` (was dropped after a transition). Codex's dashboard-PRÉP-alert note deferred as out of scope (derives from batch-level `startedAt`; → F9/F11). CI green (api + mobile-app); API 830 unit tests + `BatchDetailsScreen` 30/30. Refs #868.

### PR #1285 merged (`33d1b41`) — docs(brew-day/architecture): UML deliverables for the brewing-assistant step machine

- Branch `docs/brew-day-step-machine`. **UML-first conception (contract) for the brewing-assistant structural block** — no code. Three Mermaid diagrams under `docs/architecture/diagrams/brew-day/`: `06-state-brew-step` (composite step machine **PRÉP → ACTIF → TERMINÉ**; `prep`/`active` = inner phases of the existing `in_progress` status, `paused` = new inner phase, `skipped` = new top-level status; Complete = explicit exit from ACTIF, reversible via Reopen; timer optional; T-minus/overdue = derived state), `07-state-batch-lifecycle` (`draft` « en préparation » → `in_progress` → `completed` → `archived`, + `draft → discarded` hard-delete, `in_progress → cancelled`), `08-sequence-jit-density` (OG at pitch, FG at fermentation end — F3). Renvoi notes added on `brewing-session/05` + `batches/05` (subsumed/refined).
- Reviews — local pre-push + Copilot: 7 threads (all valid internal-consistency issues) fixed in `e63f71a` — Complete drawn from ACTIF (`active --> completed`); phase-vs-status levels disambiguated; Cancel = a soft status update (`PATCH`), NOT the hard-deleting `DELETE /batches/:id`; `discarded` = terminal "row removed" outcome, not a stored status. CI green (docs-only, path-filtered). Refs #868.

### PR #1283 merged (`182ee31`) — feat(equipment,batch): equipment detail/delete (F22) + delete a batch (F25)

- Branch `feat/equipment-batch-reversibility` (mobile-only). Fourth **baby-step slice** — finishes the « gérer mon contenu » reversibility cluster (the backend DELETE + GET endpoints already existed). **F22** — the equipment card in « L'Office » is now tappable → a new detail route (`app/(app)/equipment/[id].tsx` → `EquipmentDetailScreen`) shows the profile with a confirm-gated destructive delete (`getEquipmentProfileById` + `deleteEquipmentProfile`, demo-branched; a 404 maps to `null` so the screen shows the French « Matériel introuvable »); edit deferred. **F25** — a confirm-gated destructive « Supprimer ce brassin » in the batch detail header (visible live + completed) recovers an accidental / phantom batch (`deleteBatch`, demo-branched); archiving deferred. Completes the mobile CRUD gap (the backend already had full CRUD; the UI only did create+read — recipes shipped in #1281, equipment + batches here).
- Reviews — local pre-push + Copilot: the pre-push pass added four sad-path tests + fixed the import order; Copilot caught a 404-not-mapped-to-null gap (fixed, mirroring `getTasting`). Library usage verified up to date via Context7 (TanStack Query v5, Expo Router SDK 54). CI green; equipment + batches suites green. Mobile-only — no redeploy.

### PR #1282 merged (`5bfffa7`) — feat(equipment): unique profile names per owner (F21) + equipment-axis labels (F17)

- Branch `feat/equipment-wizard-polish` (API + mobile). Third **baby-step slice**. **F21** — block duplicate equipment profile names per owner: a composite unique index on `(owner_id, name)` (the migration de-dups pre-existing rows first so the boot-time `migrationsRun` cannot fail); `EquipmentProfileService` rejects a duplicate up front with a 409 `EquipmentProfileNameTakenException` AND converts a unique-constraint `QueryFailedError` from save into the same 409 (covers create + `updateMine` rename via a shared `saveOrThrowOnDuplicateName`); the mobile wizard maps the 409 to a French message. **F17** — relabel the three system types on the equipment axis: « Extrait » / « Cuves séparées » / « Cuve unique (BIAB) ».
- Reviews — local pre-push + Codex + Copilot: Codex caught the `updateMine` rename 500→409 gap (fixed); Copilot caught the over-broad UNIQUE detection (scoped to the `(owner_id, name)` columns, aligned with `user.service.isSingleCreatorViolation`). Library usage verified via Context7 (TypeORM 0.3 migration idiom + `QueryFailedError.driverError`; NestJS `ConflictException`). CI green (api service spec 18/18 + e2e; mobile). API redeployed to Fly (migration applied at healthy boot); live-validated on a preview APK.

### PR #1281 merged (`25578f5`) — feat(recipes): add-to-carnet import (F23) and delete-from-carnet (F24)

- Branch `feat/recipe-carnet-management`. Second **baby-step slice** of the novice-journey backlog — the recipe « carnet » management layer (mobile-only; the backend endpoints already existed). **F23** — re-enabled « Ajouter à mon carnet »: `RecipeDetailsScreen`'s sticky CTA branches on ownership (the API only projects `ownerId` to the owner) — a public recipe the user does not own shows an import CTA wired to `importRecipeFromCommunity`; on success it invalidates the carnet + catalog queries and lands on the freshly-owned copy. Owned recipes keep the « Préparer mon brassin » CTA. The entry point had been dropped in the #740 detail-screen redesign. **F24** — delete from the carnet: an owned recipe shows a destructive trash button in the header (Alert confirm → new `deleteRecipeFromCarnet` use-case over `DELETE /recipes/:id`); both mutations surface an Alert on failure.
- Reviews — local pre-push + Copilot: Copilot's stale-catalog-cache-on-delete gap fixed (`1ee5353` — delete now also invalidates `['recipes','catalog']`, symmetric with the import); Copilot's demo-mode no-op flagged but deferred (mirrors `importRecipeFromCommunity`'s demo branch; demo is a non-shipped showcase). Library usage verified up to date via Context7 (TanStack Query v5, Expo Router SDK 54). CI green; recipe suites 96+; live-validated on a preview APK.

## 2026-06-30

### PR #1280 merged (`6259a31`) — fix(batches): confirm before completing a step (F6) and keep the step list above the footer (F8)

- Branch `fix/batch-step-ux`. First **baby-step slice** of the novice-journey correction backlog (live-test audit, 25 frictions F1–F25). Mobile-only, no backend. **F6** — completing a brew step happened on a single tap with no confirmation/undo, inconsistent with the bottling step's acknowledgment gate; now wrapped in an `Alert.alert` confirm (Annuler / Terminer) in `BatchDetailsScreen.handleComplete`. **F8** — the brew-day step `FlatList` grew inside a non-scrolling container, clipping the last steps behind the floating nav footer; gave the list `flex: 1` so it scrolls in a bounded region (the existing `paddingBottom` keeps footer clearance).
- Reviews — local pre-push (pr-pre-reviewer) + Codex + Copilot reconciled: Copilot test-hygiene fix applied (`afterEach(jest.restoreAllMocks)` so the `Alert` spy can't leak on a thrown assertion); Codex P2 (`Alert.alert` is a no-op on `react-native-web`) **deferred** with rationale — it is the app-wide pattern (BrewPrep / scan / login) and web is not a shipped target; a shared cross-platform `confirmAsync()` helper is the right fix if web ever ships. Codex CLI unavailable locally (noted, not skipped). CI green (mobile-app incl. typecheck — local typecheck false-fails on stale `.expo` route types); `BatchDetailsScreen` 26/26.

## 2026-06-29

### PR #1277 merged (`a3dc240`) — feat(equipment): equipment wizard — 3-question profile + server-side defaults (E1)

- Branch `feat/e1-equipment-wizard`. First **P1** slice of the equipment+cleaning epic (ADR-0021): the missing **mobile capture** for a reusable equipment profile via a guided **3-question wizard** (system type, fermenter volume, largest kettle), persisted on the existing `/equipment-profiles` API. Backend: the create-DTO's hidden constants (`mash_tun_volume_l`, `evaporation_rate_l_per_hour`, `efficiency_estimated_percent`) become **optional** and are **seeded server-side** from a per-`system_type` defaults table (`equipment/domain/equipment-system-defaults.ts`; mash-tun defaults to the boil-kettle volume); explicit values are never overwritten — keeps the brewing constants backend-owned (ADR-0020). Mobile: new `features/equipment` Clean layers (domain/data/application/presentation) on the http-client, `EquipmentWizardScreen` (3 steps + recap with an auto-generated, editable name), and `EquipmentScreen` now lists real profiles (TanStack Query) with an add-CTA + empty state (was demo-only). Conception synced: ADR-0021 D1 amended + `docs/architecture/diagrams/equipment-cleaning/02-sequence-equipment-wizard.md`.
- **Decisions** (locked with the founder): hidden constants **seeded server-side per `system_type`** (not client-sent from a preset); Q1 maps to the 3-value `EquipmentSystemType` enum; the `equipment_templates` (BeerXML) → profile mapping is **deferred to E2** (fields don't map 1:1 to the profile DTO); scope = **wizard + persistence only** (fit-check / launch-gate / cleaning out of scope → E2/C1).
- Reviews — an architecture-guardian audit (Clean Architecture + SOLID) found 0 must-fix; the local pre-push reviewer added the missing sad-path coverage (use-cases create/list error propagation, EquipmentScreen error card, e2e 401). Codex CLI unavailable locally (noted, not skipped). CI green after a re-run (api unit + e2e; mobile suite) — the single red was a **pre-existing flaky scan timeout** (`ScanScreen.test.tsx`), unrelated to the diff.

## 2026-06-26

### PR #1274 merged (`38bb60c`) — feat(batch): bottling, live closure and first tasting (B3)

- Branch `feat/b3-bottling-closure`. Final **P0** slice — **lifts the live brew-day dead-end** so a novice reaches the bottle in-app. Backend: a pure **priming-sugar calculator** (simple ~6.5 g/L table sugar by default + an optional precise mode via `?targetCo2Vol&beerTempC`), `GET /batches/:id/priming` (volume from the recipe, ADR-0020), `POST /batches/:id/bottling/close` (sets `bottled_at` + completes the in-progress PACKAGING step via the existing engine — no new status), a **Tasting** entity (rating 1-5 + optional note, one per batch, recorded only after closure) with `POST`/`GET /batches/:id/tasting`, plus migrations for `bottled_at` and the tasting table. Mobile: `BottlingScreen` (priming dose + bottling gestures + a required bottle-bomb safety checkbox gating the close), `TastingScreen` (1-5 stars + note), a live `BatchClosureView` replacing the demo-only mock, and the PACKAGING step routed to bottling on `BatchDetailsScreen`. Conception `docs/architecture/diagrams/brew-day/03/04/05`.
- **Decisions** (locked with the founder): simple priming default + precise as an option; table sugar; tasting = stars + free note; closure via a `bottled_at` timestamp (no new status); banner + acknowledgement checkbox for the bottle-bomb safety; tasting only after closure.
- Reviews — the local pre-push reviewer + a **dedicated five-specialist audit** (correctness, silent failures, test coverage, type design, anti-patterns) caught and fixed a blocking priming wire-contract bug (camelCase/snake_case → "undefined g" dose), a swallowed-error path, and a safety gap (close enabled without the dose); automated PR review added the tasting-after-closure guard + precise-param validation. CI green (api 816 unit + 29 e2e; mobile suite); all threads resolved.

### PR #1272 merged (`906b2de`) — feat(batch): record fermentation gravity measurements and compute ABV (B2)

- Branch `feat/b2-measurements`. Second **P0** slice toward live bottling: a mobile measurement-entry flow on a live batch. The brewer records the original gravity (OG) at fermentation start and the final gravity (FG) at the end (specific-gravity format, e.g. `1.050`); the app computes and **explains** ABV = (OG − FG) × 131.25 client-side. Backend unchanged — the measurement API (`POST` / `GET /batches/:id/measurements`) already existed. Adds `MeasurementEntryScreen` + route `batches/[id]/measurement`, a `BatchDetailsScreen` "Densités & alcool" card, domain types, data-layer `createMeasurement` / `listMeasurements`, application use-cases with the demo/live branch, plus `computeAbv` + `validateFinalGravity`. Conception `docs/architecture/diagrams/brew-day/02-sequence-record-gravity-measurement.md`.
- **Decisions** (locked with the founder): SG format only; **OG + FG only** (interim `sg_spot` deferred); fermentation end **taught, not auto-detected** (no `fermentation_completed_at` write); a **no-hydrometer escape** that never blocks (no fabricated ABV); `FG >= OG` blocked client-side; ABV computed client-side (server snapshot deferred).
- Reviews — the local pre-push review caught a missing `["batches","measurements"]` cache invalidation (the card would not refresh after recording); automated PR review caught a FR comma-decimal bug (`1,050` parsed as `1`, corrupting the reading). Both fixed and regression-tested; plus `decimal-pad` input, `accessibilityState` selected on the OG/FG tabs, and restored diagram accents. CI green (mobile-app suite); all threads resolved.

## 2026-06-25

### PR #1270 merged (`d9d75c7`) — feat(batch): live brew-day step guidance (B1-live)

- Branch `feat/b1-live-step-guidance`. First **P0** slice toward a live novice journey to bottling (roadmap TRACKER → ASSISTANT): batch steps now carry a per-step-type **pedagogical tip** + a **default planned duration**, so the live brew-day step card renders the info tip and a countdown timer — previously only the demo data had them. API: `STEP_TYPE_GUIDANCE` (pure domain reference, each `RecipeStepType` → tip + default duration) applied at batch start in `BatchDomainService`; two nullable `batch_steps` columns (`pedagogical_tip`, `planned_duration_min`) + migration `1800000000000-AddBatchStepGuidance`; DTO + `fromEntity`; persisted in **both** the create and the step-completion paths. Mobile: `mapBatchStep` stops dropping the two fields (the `StepCard` + `BrewStepTimer` rendering already existed). Conception folded in: `docs/architecture/diagrams/brew-day/01-sequence-step-enrichment.md`.
- **Decisions**:
  - `per-step-type-guidance-mvp` — guidance source is per-`RecipeStepType` defaults (no recipe↔guidance link yet; deferred). Recipe-authored `description` preserved; `FERMENTATION`/`PACKAGING` carry a tip but no duration; an unknown step type degrades gracefully. New columns nullable → legacy batches keep no enrichment (no backfill).
- A local pre-push review caught a data-loss bug — `completeMineCurrentStep` re-created steps without the two new fields and `toDomainStep` did not map them back, nulling guidance on every step completion; fixed both sites + added a persistence-roundtrip test. CI green (api unit + e2e 785; mobile 1001); all threads resolved.

### PR #1269 merged (`b5aaedc`) — docs(equipment-cleaning): conception (UML + ADR-0021) for the equipment + cleaning epic

- Branch `docs/equipment-cleaning-conception`. Conception for the equipment-readiness + cleaning epic (re-scoped from the former "A3 equipment checklist"): 5 Mermaid diagrams under `docs/architecture/diagrams/equipment-cleaning/` (use-case, sequence equipment wizard, sequence prep fit-and-clean, class, state brew-readiness) + `docs/architecture/decisions/0021-equipment-readiness-cleaning-and-adaptive-pedagogy.md` (Proposed) + the decisions index row.
- **Decisions** (ADR-0021, Proposed):
  - `equipment-is-a-reusable-profile` — declared once via a guided 3-question wizard from a preset (`equipment_templates`); the create-DTO's other required fields are preset-seeded, hidden, still POSTed (snake_case wire format).
  - `readiness-is-fitcheck-plus-cleaning` — per-brew equipment readiness = a graded capacity fit-check + the cleaning ritual, not a possession re-checklist; refines the brew-prep launch gate.
  - `adaptive-pedagogy` — guide intrusiveness tunes to the declared brewer level; help always one tap away.
- Reviews — 10 inline comments (conception accuracy) addressed: API field names documented as snake_case (the class is the camelCase domain model), required fields preset-seeded and still sent, headspace clarified as a fixed krausen constant (no API column), `CleaningProduct.id` added, `CleaningItem.productId` made optional with corrected multiplicity, and the profile GET reworded as a list + client-side selection. CI green; all threads resolved.

## 2026-06-24

### PR #1266 merged (`6a83aa3`) — feat(mobile): gate batch launch behind a pre-brew preparation screen

- Branch `feat/brew-prep-launch-gate`. Brings the launch gate (**UC6** of the brew-prep conception #1248) forward after terrain testing showed the standalone "Vérifier mes ingrédients" entry point (A2) dead-ended. The recipe sticky CTA is renamed **"Lancer un brassin" → "Préparer mon brassin"** and opens a pre-launch preparation screen `BrewPrepScreen` (route `recipes/[id]/prepare`, replacing `IngredientReadinessScreen` + the `readiness` route). The screen hosts the ingredient checklist and a gated **"Lancer le brassage"** CTA: the `startBatch` mutation moves there, the launch is disabled until the checklist is complete and guarded by a confirmation dialog. The Overview "Vérifier mes ingrédients" button is removed.
- **Decisions**:
  - `strict-launch-gate` — the gate blocks (not guidance-with-override) until every ingredient is ticked, deliberately anticipating the future stock/inventory feature where ticking "I have it" becomes a stock movement. Conforms to #1248 UC6 as written; no diagram change. Covers the ingredient checklist only this slice; equipment (A3) will fold into the same screen and extend it.
- CI green (mobile-app lint/typecheck/tests; full suite 999). One Must-Have from the local pre-push review (a forbidden attribution string in a comment) fixed before push; all threads clear.

### PR #1256 merged (`5af5b99`) — chore(ci): add Dependabot config for weekly grouped npm updates

- Branch `chore/deps-security-audit-fix`, 2 commits (`424902f`, `f8cfaca`). Response to the weekly Dependabot security digest. Adds `.github/dependabot.yml` (npm ecosystem, root workspace lockfile, weekly Monday, `open-pull-requests-limit: 10`), grouping minor/patch into one PR and ignoring `version-update:semver-major`. Config-only; no lockfile or dependency change. GitHub's `.github/dependabot.yml` validation check passes.
- **Decisions**:
  - `dependabot-defers-majors` — the weekly run ignores semver-major bumps so the ~42 deferred Expo/Jest/NestJS/sqlite3 majors are not auto-opened; major remediation belongs to the planned security audit, not Dependabot.
  - `no-blanket-audit-fix` — `npm audit fix` (non-force) resolves only 6/76 advisories on the real tree, closes neither critical (both dev-only: `ts-jest`→`handlebars`, `react-devtools-core`→`shell-quote`), and needs `--legacy-peer-deps` (a reanimated fix pulls RN 0.86 vs the Expo-pinned 0.81.5); rejected as non-proportional.
- Reviews — two findings applied in `f8cfaca`: an explicit group `patterns: ['*']` selector, and an `ignore` rule for `version-update:semver-major` to prevent a first-run flood of major-update PRs; all threads resolved. CI green (CodeQL, dependency-review, secret scan, security-audit, Dependabot config validation). Manual follow-up: enable Dependabot security updates in repo settings. The `docs/*` sub-lockfiles are not covered by the `/` directory entry — deferred.

### PR #1255 merged (`17ace5a`) — feat(mobile): pre-brew ingredient readiness checklist (A2)

- Branch `feat/ingredient-readiness-checklist`. Build slice **A2** of the first-real-brew journey: a reversible pre-batch **ingredient readiness checklist** ("j'ai / il manque") with a missing-items recap, reached from the recipe's **Vue** tab via a new "Vérifier mes ingrédients" button. Realises **UC4** of the brew-prep conception (#1248): `domain/brew-readiness.types.ts` (`ChecklistItem` / `ReadinessChecklist` / `ChecklistKind`; `isComplete()` realised as the pure application fn `isChecklistComplete` — domain stays type-only), `application/brew-readiness.use-cases.ts`, `core/ui/ChecklistRow.tsx`, `presentation/IngredientReadinessScreen.tsx` (shares the recipe-detail TanStack Query cache; reversible `useState` overlay, no persistence). **Additive**: the irreversible "Lancer un brassin" CTA is untouched (its gating is **A4**; the equipment checklist is **A3**). Route `recipes/[id].tsx` → `recipes/[id]/index.tsx` + new `recipes/[id]/readiness.tsx` (same URL). `formatQuantity` moved to `core/utils/format.ts` so the application layer no longer imports presentation (Clean Architecture).
- Reviews — Clean-Architecture dependency-rule fix (application off presentation), the readiness scroll view now clears the navigation footer, and a missing/deleted recipe renders a "Recette introuvable" state instead of an empty checklist; all threads resolved. CI green (mobile-app lint/typecheck/tests; full suite green).

## 2026-06-22

### PR #1253 merged (`b565913`) — feat(api): deployable production seeding via a compiled seed CLI

- Branch `feat/api-seed-cli`. Closes the prod-seeding gap: the `packages/api/scripts/` seed scripts never ship in the Fly image (not copied; run via `ts-node`, pruned in prod), so there was no way to seed the deployed DB. Adds `src/database/seed-cli.ts` — a `runProductionSeed(dataSource)` (system curator user then public recipes, idempotent) plus a `require.main` guard so it runs as `node dist/database/seed-cli.js`. It lives in `src/`, so it compiles into `dist/` (in the Docker build the inferred tsc rootDir is `src/`, matching the Dockerfile's `node dist/main`). Spec covers H/S/E (user before recipes for the FK; initialises the DataSource when needed; propagates errors). `docs/fly-deploy.md` gains a *Migrations & seeding in production* section.
- **Decisions**:
  - `prod-deploy-model` — deploy → migrate (automatic) → seed (on demand). Migrations run at app boot (`migrationsRun: true`) on the machine with the volume; seeding runs via `fly ssh console -C "node dist/database/seed-cli.js"`. Rejected a `fly.toml` `release_command` (its ephemeral machine has no volume mounted, so a SQLite-on-volume migrate/seed would hit a throwaway DB).
- Reviews — a doc nit (split the seed verification into two explicit `fly ssh console -C` options so neither reads as a local command); all threads resolved. CI green (api unit + e2e, coverage above the gate).

### PR #1251 merged (`e4da874`) — feat(api): seed the beginner blonde as a PUBLIC recipe (first real-world brew, A1)

- Branch `feat/seed-blonde-first-brew`. Build **A1** of the first-real-brew journey: adds the beginner **Blonde Ale** as a 12th curated PUBLIC recipe in `public-recipes.seed.ts`, conforming to the recipe doc (#1247) and ADR-0020 (#1248). `batch_size_l = 4.3` (volume into the 5 L demijohn, BeerXML semantics — the volume the ~18 IBU Tinseth target is computed against); ~1 kg grain (900 g Pilsner + 100 g Vienna), single-Cascade hops (5 g @ 60 min + 4 g flameout), SafAle US-05, the canonical 5-step workflow (the detailed instruction/duration brew-day guide is the phase-B build). Not a demo-bottle equivalent; `is_official` stays false; carries full content so the imported recipe is not an empty shell. Spec: curated count 11 → 12, content-bearing set generalised to include the (non-demo-mapped) blonde, blonde H/S/E added.
- **Decisions**:
  - `blonde-batch-size-into-fermenter` — the seed's `batch_size_l` is the ~4.3 L into the fermenter (not the ~4 L bottled nor the 5 L demijohn nominal), so the displayed Tinseth IBU stays consistent with the ~18 IBU target. Recorded against ADR-0020.
  - `first-brew-recipe-participates-in-matching` — the blonde is PUBLIC, so `/recipes/match` ranks it like any public recipe (it scores well for blonde beers by style). Accepted as correct matcher behaviour rather than excluded: backend matching has no curated editorial top-3, and the demo "official recipe" beats run off the mobile `demoEquivalentRecipes` mock (which excludes this row). An exclusion mechanism (flag + matcher filter) is deferred (YAGNI) — easy to add later if real scans show it being a poor equivalent.
- Reviews — verified the matcher impact numerically (a Blonde-Ale-normalised beer scores the blonde ~59/100 ≥ the 45 acceptance bar); the misleading "not scan-reachable" comment was corrected to state the matching participation explicitly. CI green (api unit + e2e, coverage above the gate); all threads resolved.

### PR #1248 merged (`2ce799a`) — docs(brew-prep/architecture): UML deliverables + ADR-0020 (equipment-driven volume planning)

- Branch `docs/brew-prep-conception`. Conception for the first real-world brew's reversible **pre-batch** journey: `docs/architecture/decisions/0020-equipment-driven-volume-planning.md` + 5 diagrams under `docs/architecture/diagrams/brew-prep/` (use-case / sequence / component / class / state). ADR-0020 settles two coupled questions — **D1** the fermenter (minus headspace) caps the batch, **D2** the kettle selects the BIAB method, **D3** the volume plan is computed in a NestJS domain service and snapshotted onto the batch, **D4** boil-off/losses are calibratable. Joint diagram review with the founder: all 5 validated. **Design patterns named** (vocabulary, no speculative code): Domain Service (`VolumePlanner`), Value Object (`VolumePlan`, `«value object»`), Snapshot/Memento (launch-time plan freeze), Strategy seam (`Method`, a conditional today). ADR-0020 → **Accepted**; added to the CLAUDE.md ADR list + decisions index.
- **Decisions**:
  - `equipment-drives-the-plan` — batch size is derived from the fermenter capacity, not a free target; the kettle picks full-volume vs dunk-sparge. Recorded on ADR-0020 D1/D2.
  - `volume-math-in-backend` — the cascade is computed by a NestJS domain service (single source of truth, reused by a future web client) and persisted on the batch at launch; frontend-only and hybrid rejected for now. Recorded on ADR-0020 D3, implements ADR-0002.
- Reviews — the method-fit formula was corrected to the mash-in volume `kettleCapacityL >= strikeWaterL + grainVolumeL` (per D2, not the pre-boil wort); the volume-plan endpoint was unified to `GET /recipes/:id/volume-plan`; the cross-doc links to `docs/real-world-test/` were resolved by updating the branch from main after #1247; and a `Batch` stub was added to the class diagram to anchor the snapshot/Memento target. All review threads resolved.

### PR #1247 merged (`f0b4f33`) — docs(brewing): beginner blonde ale recipe + volume cascade (first real-world brew)

- Branch `docs/blonde-first-brew`. Source-of-truth recipe doc `docs/real-world-test/blonde-ale-5l-first-brew.md` for the first real-world brew: a beginner BIAB Blonde Ale (BJCP 18A) scaled to the **fermenter constraint** (5 L demijohn → ferment ~4.3 L → ~4 L bottled, from ~7 L strike water), the full water cascade (strike → mash → pre-boil → boil-off → post-boil → kettle trub → fermenter → bottled), equipment + shopping lists, step-by-step brew day, and §8 the app requirements (fermenter caps the batch, explicit volume planning, equipment-driven process, readiness checklists, step guide, measurements, bottling). Feeds the seeded public recipe (build A1) and ADR-0020 (#1248).
- Reviews — Codex P2 (hop charge: 10 g @ 60 min computes to ~34 IBU per the repo's `RecipeIbuTinsethDomainService` at Cascade 5.5 % AA / 4.3 L → reduced to **5 g** for the stated ~18 IBU, reconciled across the hops section, shopping list, and brew-day step 5), Copilot (pot `>= 12 L` not a range; "let it stand 24 h" wording; "(60 min)" hyphenation), CodeRabbit (demijohn headspace reconciled to ~0.7 L / ~14 % + blow-off tube recommended; footnote 1 splits the -1.2 L into ~1.0 L boil-off + ~0.2 L cooling shrink); all threads resolved.

## 2026-06-19

### PR #1245 merged (`b7cfa60`) — ci(coverage): blocking coverage ratchet + wire API e2e into CI (ADR-0019 D3)

- Branch `ci/coverage-ratchet-and-e2e`. Realizes the core of #1236 (epic #1230): the testing-strategy contract becomes **enforced**, not advisory. The CI api job now runs an **e2e step** (`npm run test:e2e`) so the matcher v2 regression net (#1243) actually executes in CI (it ran unit only). Coverage becomes **blocking** via each package's own config — Jest `coverageThreshold` global (api 90/72/85/90, mobile 82/72/80/82 = statements/branches/functions/lines) and `coverage.py fail_under = 70` for the encyclopedia — so it gates locally and in CI. The three non-blocking "< 70% warning" steps are removed. Floors sit a few points below the current baseline (api ~94/77/89/94, mobile ~86/78/86/86, encyclopedia ~75%) — a ratchet: raise, never lower.
- Verified natively in CI: api (unit threshold + e2e), mobile-app (threshold), beer-encyclopedia (fail_under) all green. Deferred (rest of #1236): Trivy + OSSF Scorecard, and the Maestro / Playwright e2e CI jobs (#1233 / #1234, frameworks not yet set up).

### PR #1243 merged (`c0d9743`) — test(api): e2e for POST /recipes/match — matcher v2 graded-style ranking

- Branch `test/api-recipes-match-e2e`. First quick-win of epic #1230 (#1232): an HTTP-level regression net for matcher v2 (ADR-0016). New `packages/api/test/recipes-match.e2e-spec.ts` (Supertest, in-memory SQLite + migrations) seeds 3 PUBLIC recipes (Blonde Ale / Saison / NEIPA) with identical ABV/IBU/colour so the BJCP style grade is the sole driver, asserting the graded order blonde (1.0) > saison (0.7) > neipa (0.4), the sparse-beer completeness, and the honest empty state; `avg_rating` is inverted across candidates to prove it is only a tie-break. Candidates seeded via the booted app's TypeORM repo (the recipe `style` column isn't settable through `CreateRecipeDto`). Also aligned `POST /recipes/match` to `@HttpCode(200)` — it returned the POST-default 201, contradicting its own `@ApiOkResponse` + the `06-sequence-recipe-matching` conception and the legacy `GET /recipes/match/:beerId`.
- Reviews — CodeRabbit ×3 (named `MatchResponse`/`RegisterResult` interfaces + a threshold-determinism note applied; import-order declined — ESLint is the enforced contract and passes); all threads resolved. #1232 unit gaps (label module, recipe/scan/password services) + e2e CI wiring (#1236) are fast-follows.

### PR #1242 merged (`5feb3ff`) — ci(security): gitleaks + CodeQL + dependency-review (ADR-0019 D4)

- Branch `ci/security-scans`. Realizes the security part of #1236 (epic #1230): the public-repo CI baseline (`security-ci-baseline`) — `gitleaks.yml` (secret scan on push + PR + weekly cron, honours `.gitleaksignore`, fails on any leak), `codeql.yml` (SAST matrix `javascript-typescript` + `python`), `dependency-review.yml` (CVE on PR dependency changes, fail-on-severity high). One workflow per tool; actions pinned by commit SHA.
- Reviews — Copilot (dropped the inaccurate gitleaks "SARIF to the Security tab" claim + the unused `security-events` permission; CodeQL feeds the Security tab) + CodeRabbit Major (`persist-credentials: false` on all security-job checkouts; fixed CodeQL `init` input to `languages` so the matrix is honoured); all threads resolved. The coverage ratchet + the e2e CI jobs (the rest of #1236) follow separately.

### PR #1240 merged (`ececb67`) — docs(testing): fix fixture path + feedback-widget host gating (review of #1238)

- Branch `docs/fix-testing-strategy-doc`. Follow-up to #1238 (merged before its review was addressed). `docs/testing/testing-strategy.md`: §3.2 fixture path gains the missing `src/` prefix; §3.4 corrects the **inverted** feedback-widget host gating — the widget loads on staging + `localhost` only, never public prod (per `packages/website/feedback-widget.js`), so the Playwright smoke runs against a local/staging serve. Docs only. Addressed Copilot + Codex P2.

### PR #1239 merged (`ab51f4a`) — docs(config): align Claude config with reality (ADR list, encyclopedia stack, decisions index)

- Branch `docs/claude-config-conformance`. Part of a Claude Code operational cleanup (memory + session housekeeping done locally). `CLAUDE.md`: added the missing **accepted ADR-0009** to the list. `packages/beer-encyclopedia/CLAUDE.md`: stack + data-flow now say SQLite (prod, on Fly) / PostgreSQL (local dev); restored the package-local `docs/adr/` pointer alongside the repo-wide decisions. `docs/architecture/decisions/README.md`: 0011 & 0015 → Accepted, added index rows for 0016/0017/0018.
- Reviews — Codex P2 + Copilot (the package-local ADRs exist and are referenced by ADR-0013; the index Date column tracks each ADR's creation date) and a CodeRabbit style nit, all addressed (`b5a73f7`, `3fbca75`); all threads resolved.

### PR #1238 merged (`4db7189`) — docs(testing): testing strategy + ADR-0019 (pyramid, e2e tooling, coverage ratchet, CI security)

- Branch `docs/testing-strategy`. The project's first unified **testing strategy** as a conception-first contract. **ADR-0019** (Proposed): adopt the test pyramid (D1); one e2e tool per surface — Supertest (api) / Maestro (mobile) / Playwright (website) / pytest (encyclopedia) (D2); coverage becomes a blocking CI ratchet (D3); public-repo CI security scanning — gitleaks + CodeQL + dependency-review (D4). `docs/testing/testing-strategy.md` = the living detail (pyramid, per-package layer/target map, ratchet policy, target CI shape).
- Realized by epic #1230, with one issue per surface: #1232 (api e2e `/recipes/match` + unit gaps), #1233 (mobile Maestro), #1234 (website Playwright), #1235 (encyclopedia ML pytest), #1236 (CI ratchet + e2e jobs + security scans). Review comments (Copilot/Codex/CodeRabbit) addressed in follow-up #1240.

## 2026-06-17

### PR #1231 merged (`c9b637e`) — feat(api): single-holder CREATOR role above ADMIN, rank-based RolesGuard (ADR-0011)

- Branch `feat/creator-role`. RBAC foundation for the in-app moderation surface (epic #1175 / #821, conception #1224). `UserRole.CREATOR` + `ROLE_RANK` + `hasAtLeast`; `RolesGuard` migrated from exact-match to **rank-based** (`requiredRoles.some(hasAtLeast)`) so a higher role satisfies a lower `@Roles` (a CREATOR passes `@Roles(ADMIN)`) — fixing the gap slice 1 flagged; the 8 existing `@Roles(ADMIN)` usages unchanged. `UserService.assignCreatorRole(email)` = the only path that grants CREATOR (seed-once, idempotent, single-holder; a concurrent DB-index violation → `ConflictException`); `updateUserRole` refuses to grant **or** revoke CREATOR; `UpdateUserDto` exposes no role. Migration rebuilds `users` to extend `CHK_users_role` with `'creator'` + partial unique index `UQ_users_single_creator` (single-holder DB backstop).
- Reviews — `pr-pre-reviewer` pre-push (2 Must Have: block CREATOR demotion + test; 3 Should Have) addressed; then **Codex P1 + Copilot + CodeRabbit Critical caught two real bugs the unit tests missed** — the `CHK_users_role` CHECK rejected `'creator'`, and the unique-violation detection matched the index name (which SQLite never reports; now matches the `driverError` code + the `users.role` message) — fixed (`0af690a`) + an **e2e test on the real migrated DB** proving a `'creator'` row persists and a second is rejected. 768 unit + 19 e2e green; all threads resolved.
- Foundation only — no user-visible effect. Next: NestJS moderation endpoints (`promote`/`depublish`) gated `@Roles(CREATOR)` (close #1151) + mobile creator mode; ops follow-up = deploy API (runs the migration) + promote the founder account via `assignCreatorRole`. Refs #821, #1175.

## 2026-06-16

### PR #1226 merged (`d542637`) — feat(encyclopedia): gate the public catalogue on the published status (ADR-0015 D1)

- Branch `feat/catalog-staging-gate`. Slice 1 of the catalog-moderation epic (#1175), realizing the conception merged in #1224 (ADR-0015 D1 + ADR-0018). The public catalogue now surfaces only **published** rows: `list_beers` / `search_beers` filter `is_verified=true AND is_active=true` (count + page query, on both the SQLite `contains` and Postgres trigram paths); `get_beer` (detail by id) stays **ungated** so a staged / just-scanned beer remains reachable (ADR-0015 D1 — usable to the contributing user). `seed_beers` publishes the curated corpus (`is_verified=true`, the founder-vouched baseline); runtime imports stay staged until promoted (by moderation, or by the seed on an EAN/slug match). Tests H/S/E (190 total): browse/search exclude staged + depublished; a column filter intersects the gate; a staged fiche is reachable by id; an import lands staged; the seed publishes + promotes a matched import + a re-seed preserves depublication. `TODO(#1151)`: the generic PATCH can set is_verified/is_active unauthenticated until auth on writes lands (promotion/depublication move to dedicated endpoints in slice 3).
- Reviews — `pr-pre-reviewer` pre-push (0 Must Have, 5 Should Have applied: search-depublish + filter×gate + re-seed-invariant tests, import-201 assert, #1151 TODO); Copilot ×1 (seed docstring accuracy — a staged import is also promoted by an EAN-matched re-seed) addressed (`50c9d69`); CodeRabbit review completed, no inline comments; 1/1 thread resolved. Squash-merged, all gates green.
- Deployed to Fly (`flyctl deploy`): the seed re-published the corpus and the read gate took effect — **live catalogue 70 → 44 curated beers, all verified; the 26 unverified runtime imports (Monster Energy, Vin rouge, …) dropped to staging** (the future moderation queue). Refs #1175.

### PR #1227 merged (`950a542`) — feat(api): dedicated /health liveness probe; repoint Docker HEALTHCHECK

- Branch `feat/api-liveness-healthcheck`, 1 commit (`065a2f7`). New public `GET /health` liveness probe (`HealthModule`/`HealthController`, returns `{ status: 'ok' }`) — no DB/downstream dependency (liveness, not readiness), no guard, not throttled. Docker `HEALTHCHECK` repointed `/` → `/health` and `--start-period` 10s → 30s; removes the container's reliance on the incidental root route `GET /` (only 2xx because of the `AppController` "Hello World" boilerplate). No new dependency (`@nestjs/terminus` deliberately not added — KISS for a pure liveness check). Aligns with the `vev-smart-evse-adapter` pattern (dedicated liveness route + start period). Unit + e2e (H/S/E: 200 + `ok` through the response envelope, public/no-auth contract, `POST /health` → 404). Verified end-to-end: `docker compose up -d --build`, then `docker inspect --format '{{json .State.Health}}' brasse-bouillon-api` shows `"Status":"healthy"`.
- Reviews — local pre-push review (1 Must Have: DTO literal → `readonly status = 'ok' as const`) addressed; automated PR reviews addressed and all threads resolved — notably, declined adding a `@Public()` decorator (none exists in the codebase yet and there is no global auth guard, matching the `FeedbackController` precedent) and declined a sad-path test (a dependency-free liveness probe has no failure path). The local pre-push review helper script could not run (CLI arg incompat — known follow-up). Squash-merged with all gates green.

### PR #1224 merged (`9285340`) — docs(catalog-moderation): UML moderation study + ADR-0018 (in-app CREATOR, secured at API)
- Branch `docs/catalog-moderation`. Conception-first study for the **in-app CREATOR moderation** of the beer catalogue. Root cause of the catalogue pollution (a scanned water bottle / "Monster Energy" / "Vin rouge" surfacing in the public list) = a **conformance bug vs ADR-0015 D1** (staged `is_verified=false` must stay out of the shared catalogue) **+ a seed bug** (the 41 curated `internal` beers were never promoted). New `docs/architecture/diagrams/catalog-moderation/` (4 diagrams, Mermaid + PlantUML twins, FR): use-case (Curate domain + CREATOR; M1 triage / M2 promote / M3 depublish / M4 republish), sequence (promote/depublish: Mobile → NestJS admin → encyclopedia), component (auth boundary, ADR-0002), state (`staged → published → depublished → deleted`). **ADR-0018 (Accepted)** — moderation surfaced in-app for the CREATOR, authority enforced at the NestJS API boundary (towards #1151), reversible depublish + audit; revises the "never via mobile" clause of #1152; defers the web console (#738). Promoted **ADR-0011** & **ADR-0015** `Proposed → Accepted` + indexed in `CLAUDE.md`; reconciled `beer-encyclopedia/01-use-case` UC7/UC8/UC9 with ADR-0018; traceability-matrix updated.
- Reviews — `pr-pre-reviewer` pre-push (6 fixes + PlantUML twins on user request); then Copilot ×5 (Mermaid accents, `l'UrI`→`l'UI`) + Codex ×1 (read contract = verified AND not depublished) + CodeRabbit ×5 (RolesGuard exact-match → `hasAtLeast` gap, encyclopedia auth gap made explicit, mobile depublish out of UC7, drop `ferme #1151`, add `Deleted` state) addressed (`2abbe79`); 11/11 threads resolved.
- Conception-first (ADR-0013) — **implementation (build slices) follows**: ADR-0015 D1 read filter + promote the 41 `internal` seed; close #1151 (auth on encyclopedia writes); NestJS moderation endpoints + in-app creator mode; UC9 queue (#1153/#1154/#1155). Refs #1175.

## 2026-06-15

### PR #1218 merged (`1042000`) — fix(mobile-app): catalogue & batches back button goes to the wrong tab (missing nav stack)
- Branch `fix/navigation-back-stack`. Expo Router tabs with nested routes lacked a Stack `_layout.tsx`, so `router.back()` fell through to the Tabs navigator and landed on the academy (the only other group with a stack). Added `<Stack screenOptions={{ headerShown: false }} />` to `app/(app)/beer-catalog/` + `batches/` (mirrors `academy/`); `social` (top-level dock tab) back → `router.replace("/dashboard")`. Targeted fix — broader migration of the `router.replace`/return-context flows (scan/labels/ingredients/recipes/shop/tools) = epic **#1217**. Reviews — `pr-pre-reviewer` 0 Must Have (Codex helper down); Copilot ×1 (code-comment apostrophe) addressed (`a759509`). 173 tests across beer-catalog/batches/social. Device-confirmed (catalogue back → list). Refs #1217.

### PR #1212 merged (`e513f9b`) — feat(scan): consume matcher v2 — honest empty state + wire completeness (ADR-0016)
- Branch `feat/scan-matcher-v2-mobile` (opened 2026-06-06, refreshed). Mobile consumption of matcher v2 (#1210): honest empty state ("no recipe cleared the reliability threshold" ≠ "none shared") + `completeness` wired through `ScanRecipeMatch`. Merged `main` up (`adac603`) — drops the obsolete `SonarCloud Code Analysis` check after #1216. Reviews — CodeRabbit ×1 Critical (`RankedRecipeWireDto.completeness` → optional, matches the domain field) addressed (`338208f`). Relates ADR-0016, epic #1175.

## 2026-06-11

### PR #1216 merged (`b585ea5`) — chore(sonar): migrate analysis from SonarCloud to the local self-hosted instance
- Branch `chore/sonarqube-local`. Removed `.github/workflows/sonarcloud.yml` (no Sonar CI job — the Community Build analyses `main` only); `sonar.projectKey` `benoit-bremaud_brasse-bouillon` → `brasse-bouillon`; Makefile now delegates to the shared `sonarqube-stack` repo + auto-reads the analysis token from `~/.config/sonar-tokens/brasse-bouillon`. Provisioned the project + a PROJECT_ANALYSIS_TOKEN on the local instance; validation scan EXECUTION SUCCESS, quality gate OK; deleted the repo `SONAR_TOKEN` Actions secret (cloud project left dormant). Reviews — Copilot ×5 + CodeRabbit ×3 addressed (`4b6aab7`). Trade-off accepted: no PR-time Sonar (AI reviewers + path-filtered CI cover PRs).

### PR #1215 merged (`cc18b20`) — feat(beer-catalog): mobile beer catalogue screens (UC1/2/3)
- Branch `feat/beer-catalog`. Part B of the catalogue chantier: browse (infinite scroll, `useInfiniteQuery` + pure `getNextPageParam`), search (debounce + in-flight cancellation), beer fiche (cache-primed `placeholderData`, tappable brewery/style rows), brewery/style fiches — conforms to the mobile-catalog conception (#1213, ADR-0013). `core/http` gained an additive `signal?: AbortSignal`. ~130 tests (H/S/E). Reviews — local pre-push (1 Must Have: presentation→data layering) + Codex/Copilot/CodeRabbit addressed (`d9308fc`, `96968dd`). Tracked divergence: `brewery_name`/`style_name` null on list/search/detail (VM fallback labels until the API resolves them). Relates epic #1128.

## 2026-06-08

### PR #1213 merged (`79138b0`) — docs(mobile-catalog): UML conception study for the mobile beer catalogue (UC1/2/3)
- Branch `docs/mobile-catalog-conception`. New `docs/architecture/diagrams/mobile-catalog/` (11 diagrams, Mermaid + PlantUML twins, FR per ADR-0013 cl.7): use-case mobile + Cockburn extensions, 4 sequences (browse infinite-scroll/`getNextPageParam`, search debounce, fiche 404 + cache-priming, error variants), component (ADR-0005 boundary, `auth:false`), 2 state machines (list lifecycle + search-input FSM), 2 class diagrams (domain + view-model), data-flow (no PII). Pagination = infinite scroll (`useInfiniteQuery`), one hook for browse + search; MVP = beers; brewery/style browse + filters = fast-follow. Also drew the dangling `PaginationMeta` box in `beer-encyclopedia/07-class-api-contract`; refined the "sequence if non-trivial" rule (judged **per realization**) in the traceability matrix. Conception-first (ADR-0013) — implementation (Part B) follows.
- Reviews — Codex ×2 + Copilot ×12 + CodeRabbit ×4 addressed (`8e5d186`): search `AbortSignal` wording (queryKey change ≠ network abort without forwarding `signal`); `isFetchNextPageError` (v5); `Idle→LoadingMore` contradiction removed; `queryKey` feature-prefix; PlantUML twin sync; matrix ✅→🎯; UC3 precondition vs 404. 1 disagreement (CodeRabbit): the FR conception-journal note stays French (ADR-0013 cl.7). CodeRabbit re-reviewed + confirmed. Codex helper (`scripts/codex-review.sh`) could not run pre-push (CLI `--output-last-message` arg incompat — follow-up).
- Tracked divergence: `GET /beers`, `/beers/search`, `/beers/{id}` return `brewery_name`/`style_name` null today (only `import-by-ean` resolves them) — VM uses fallback labels until the API resolves names on list/search/detail. Relates epic #1128, #1175.

## 2026-06-06

### PR #1210 merged (`7032066`) — feat(recipe): recipe-matching v2 — BJCP-family-graded scorer + completeness + threshold (ADR-0016)
- Implements the ADR-0016 matcher v2 (weighted criteria, completeness signal, BJCP-family-graded style similarity, acceptance threshold). Separate workstream. Relates ADR-0016, epic #1175.

### PR #1209 merged (`f46b149`) — fix(scan): show ADR-0017 IBU/colour intervals on the beer card
- Branch `fix/scan-ibu-color-intervals`. After ADR-0017 shipped intervals, the mobile DTO still read the removed scalar `ibu`/`srm`, so IBU/EBC rendered blank after a scan. Now reads `ibu_min/max` + `srm_min/max`; keeps a representative midpoint scalar for the bucket formatters + recipe-matching scorer; new `formatInterval` renders a range ("20–28") on `BeerInfoCardScreen`; interval bounds added to `ScanCatalogItem`. 215 scan tests.
- Reviews — CodeRabbit (IBU-vs-EBC estimate comment clarity; `isIbuEstimated` single-bound asymmetry → require both bounds) + Copilot ×2 (`formatInterval` no longer fabricates a range from one bound; `isColorEbcEstimated` gates on either SRM bound) addressed (`794b16f`, `9196427`, `dd0f1a9`). Codex skipped (quota). Relates ADR-0017, epic #1175.
- Integration gap found via the end-to-end phone test; rebuilt EAS `preview` APK to verify — IBU + colour now display.

### PR #1208 merged (`ccbb951`) — chore(encyclopedia): seed full corpus on boot
- Branch `chore/encyclopedia-boot-seed-corpus`. Adds `seed_breweries → seed_beers → seed_ingredients` to the Dockerfile boot `CMD` (after `seed_styles`, FK order, idempotent) so every deploy populates the curated corpus and `/beers/import-by-ean` resolves known EANs from a direct DB hit.

### PR #1207 merged (`2066740`) — feat(encyclopedia): seed curated beer corpus (39 breweries, 44 beers, styles, ingredients)
- Branch `feat/encyclopedia-seed-corpus`. Idempotent seed scripts: 39 breweries, +25 BJCP styles, 44 beers (IBU/colour as ADR-0017 intervals, SRM canonical) + tasting profiles, 45-ingredient catalog + 259 links. `is_verified=false` staging (ADR-0015); OFF category errors not propagated (scan spec §8.5). 9 seed tests.
- Reviews — Codex P2 (match seeded beers by EAN before slug) + Copilot ×4 (ingredient upsert refresh, count-delta, `is_verified` docstrings) + CodeRabbit ×5 (EAN-first docstring, split-key conflict guard, atomic rollback, clearer missing-ingredient error; batch-fetch nitpick declined) addressed (`491b5f8`, `78377e3`, `189daae`, `65568fe`, `350cea8`, `c8a2696`). Relates ADR-0013/0015/0016/0017, epic #1175.

### Deploy — encyclopedia (Fly `brasse-bouillon-encyclopedia`)
- `fly deploy` from `packages/beer-encyclopedia` ran migration `005` (ADR-0017) + reseeded the full corpus on the prod **SQLite** volume at boot. Verified `/beers/import-by-ean` resolves Leffe `5410228142218`, Grimbergen `3080216049632`, La Chouffe `5410769100081` from a direct DB hit. Closes the "Deploy pending" note on #1204.

## 2026-06-05

### PR #1205 merged (`076bb67`) — chore(claude-tooling): add local pre-push review ritual (Claude + Codex)
- Branch `chore/pre-push-review`. Adds `.claude/skills/pre-push-review/SKILL.md` + `scripts/codex-review.sh` — local defence-in-depth review (Claude `pr-pre-reviewer` + Codex) before push. Third of the review-service trilogy (#1202/#1203/#1205).
- Reviews — 2 Codex P2 (`codex-review.sh` `--out` flag order; review against `origin/$BASE`) deferred per Must-Have-only scope; both functional, worth a follow-up.

### PR #1204 merged (`00f5d0e`) — feat(encyclopedia): Beer IBU/SRM as min-max intervals + Style.family (BJCP)
- Branch `feat/encyclopedia-beer-intervals-style-family`. Realises ADR-0017 + ADR-0016 D2: `Beer.ibu/srm` → `ibu_min/max` + `srm_min/max` + CHECKs; `Style.family` (BJCP) column seeded for the 15 styles; migration `005` (batch mode, backfill scalars before drop); `BeerBase`/`BeerUpdate` interval schemas + `StyleRead.family`; conception `04-class` + `07-class-api-contract` updated as-built. 160 tests, migration up/down round-trip verified.
- Reviews — Codex P1 (migration data-loss → backfill, proven on SQLite) + Codex/Copilot P2 (interval edge-validation → 422; `StyleRead.family`; +tests) addressed (`f49f84e`). Relates ADR-0016/0017, epic #1175.
- **Deploy pending** — run migration `005` + reseed styles on the Fly encyclopedia DB for the change to take effect.

### PR #1203 merged (`8bd8227`) — chore(ci): add CodeRabbit config as automatic post-push reviewer
- Branch `chore/coderabbit`. Adds `.coderabbit.yaml` (CodeRabbit as the always-on auto post-push reviewer, free tier, path-filtered, per-package instructions). Second of the review trilogy. **Web action required**: install the CodeRabbit GitHub App (config inert until then).

### PR #1202 merged (`dc31425`) — chore(ci): make Copilot review manual, drop Discord notifications
- Branch `chore/review-cost-fix`. Copilot review → manual via the `needs-copilot` label (Copilot now bills 13 premium requests/review); removes the deprecated `discord-notifications.yml`; CONTRIBUTING + PR template + `pr-create-brasse-bouillon` skill aligned. First of the review trilogy.
- Reviews — Codex/Copilot P1 (the workflow lived under `packages/api/.github/workflows/` where Actions never runs it → **moved to repo root** `.github/workflows/copilot-review.yml`, `8664a74`); 4 non-Must-Have comments dropped per scope. **Web action required**: disable the "Copilot review for default branch" ruleset.

### PR #1201 merged (`b7e3fc1`) — docs(architecture): ADR-0017 — Beer IBU/colour as min/max intervals
- Branch `docs/adr-0017-beer-intervals` (from user commit `0cb6397`). ADR-0017 (*Proposed*): `Beer.ibu`/`srm` as min/max intervals, `abv` stays scalar; D1 outward integer rounding, D2 self-describing interval (no estimated flag), D3 SRM canonical, D4 no style imputation, D5 CHECKs on the ABV pattern. Reconciles `04-class.md` with the merged `Style.family` (ADR-0016).
- Reviews — Codex P2 + 3 Copilot (Style has only ABV CHECKs, not ibu/srm; SmallInteger decimal rounding rule) addressed (`6f08411`). Relates ADR-0016, epic #1175.

### PR #1197 merged (`30026aa`) — chore(main): release app libraries (api + mobile-app 0.1.13-alpha1)
- release-please *app-group* release. `.release-please-manifest.json` → `packages/api` + `packages/mobile-app` `0.1.13-alpha1`.
- Root `package-lock.json` synced to `0.1.13-alpha1` (`a71845f`) — release-please bumps `package.json` without regenerating the lockfile (Codex + Copilot P2 addressed). Branch rebased by release-please onto the post-#1196 `main` (no manifest conflict).
- **Tag pending** — `autorelease: pending` still set; no `api-v0.1.13-alpha1` / `mobile-app-v0.1.13-alpha1` tag emitted (group-release tagging lag; manifest was already ahead at `0.1.12-alpha1` with no matching tag). Flagged for follow-up.

### PR #1196 merged (`2cc2025`) — chore(main): release encyclopedia 0.2.4
- release-please component release. Tag **`encyclopedia-v0.2.4`** shipped.
- Root lockfile synced to `0.2.4` (`16f570c`); `.release-please-manifest.json` conflict with the merged #1195 resolved (website `0.1.2` + encyclopedia `0.2.4`, `e98b9ed`). Codex P2 (lockfile) addressed.

### PR #1199 merged (`14881a3`) — docs(architecture): ADR-0016 — recipe-matching v2 (weighted criteria + completeness + BJCP families)
- Branch `docs/adr-0016-matching-v2`. Matcher v2 conception (*Proposed*): D1 full-data weights (style 40, colour 22, ibu 18, abv 14, ingredients 6), D2 BJCP-family-graded style similarity (1.0/0.7/0.4/0), D3 Gower-renormalised match strength over present-and-comparable criteria, D4 completeness ratio (separate confidence signal), D5 acceptance threshold + honest empty state, D6 official style-gate (#1193). Updates `06-sequence-recipe-matching` + `04-class` (`Style.family` target) + `scan-algorithms` §8.5. Conception only (no code): the `POST /recipes/match` request contract is unchanged; the ADR's *target* response adds an additive `completeness` field — proposed, not yet shipped.
- Reviews — Codex P2 + 7 Copilot (filter-before-top-N, ingredients in localSim, OFF-style estimated unconditionally, contract-extension/Appendix/scoreStyle wording) addressed (`b831104`). Relates #1198, epic #1175.
- **Decision** `matcher-v2-bjcp-weighted` — recipe equivalence ranks on weighted, completeness-aware similarity with BJCP-family-graded style; replaces name-only `scoreStyle`. Recorded on #1198. Implementation deferred until acceptance + `Style.family` modelled in the encyclopedia.

### PR #1195 merged (`545d034`) — chore(main): release website 0.1.2
- release-please component release. Tag **`website-v0.1.2`** shipped.
- Root lockfile synced to `0.1.2` (`43430d0`); duplicate changelog bullet removed (`605b156`). Codex P2 (lockfile) + 2 Copilot (changelog scope-noise / duplicate) addressed.

### PR #1194 merged (`1844815`) — fix(recipes): style-gate the official-recipe shortcut (#1193)
- Branch `fix/recipe-match-official-style-gate`. Closes #1193. A Leffe Blonde scan proposed an official BrewDog Punk IPA as the top "recette équivalente". `computeFinalScore`: the official similarity shortcut (100) now applies **only when the official is style-compatible**; an off-style official is ranked on its honest similarity, so a same-style non-official outranks it. Conception note in `06-sequence-recipe-matching`; the two prior official tests updated. 75 recipe tests.
- Reviews — Copilot (2 doc-consistency) addressed; SonarCloud quality gate (Maintainability B→A on new code) fixed via `Array.at(-1)` (S7755).
- **Delivery** — redeployed the NestJS API (matching fix live; `POST /recipes/match` → 401) + built a **fresh `preview` APK** (`a5d39bc9`, runtimeVersion `0.1.13-alpha1`, code baked in — **no OTA**) to bypass the unreliable on-device OTA application that kept the device on the old NestJS-first bundle: <https://expo.dev/artifacts/eas/mtExxRmqXeNBygYdfh8Yyr.apk>. Also opened: matching design item #1193 (now closed), torch toggle #1191. **User-authorized prod deploy + build.**

### Cutover deploy — NestJS API redeploy + mobile OTA
- Redeployed the NestJS API (`brasse-bouillon-api`, manual flyctl from the repo root, `--config packages/api/fly.toml`) for `POST /recipes/match` (#1190) — verified live (401 = endpoint present). Endpoint-only, no migration, SQLite volume preserved. **User-authorized prod deploy.**
- Published the mobile OTA to the `preview` branch (runtimeVersion `0.1.13-alpha1`, matches APK `543d4bd2`): encyclopedia-first scan + recipe-match-by-characteristics. No rebuild.

### PR #1189 merged (`767e8e1`) — feat(scan): resolve barcodes against the encyclopedia first (cutover step 1)
- Branch `feat/scan-encyclopedia-first`. Part of #1186 / #1175. The mobile scan resolves a barcode against the beer-encyclopedia first; NestJS `/scan/lookup` becomes a transitional fallback on `404` **or** `503` (until the `scan_catalog_items → beers` migration #1150). Conforms to #1188.
- Reviews — Codex P2 (fall back on 404 too) addressed; the P1 (recipe matching for encyclopedia beers) resolved on main by #1190.

### PR #1188 merged (`1750df1`) — docs(conception): mobile scan sequence — encyclopedia-first cutover
- Branch `docs/sequence-mobile-scan-cutover`. Part of #1186. New `08-sequence-mobile-scan` (Mermaid + PlantUML); traceability matrix updated.

### PR #1190 merged (`e1d1764`) — feat(recipes): match recipes by characteristics, not a scan-catalog id
- Branch `feat/recipe-match-by-characteristics`. Part of #1186 / #699. Extracts `rankByCharacteristics({style, abv, ibu, color_ebc})`; new `POST /recipes/match` (`MatchByCharacteristicsDto`); the mobile posts the scanned beer's characteristics. **Unblocks the cutover** — the legacy `GET /recipes/match/:beerId` 404'd for encyclopedia-sourced beers (Codex P1 on #1189). Scorer unchanged; legacy id route kept until #1186 step 2. Conception `06-sequence-recipe-matching`.
- Reviews — Codex P2 (drop placeholder styles) + Copilot (blank-style renorm, cross-link) addressed. 73 API + 207 scan tests.
- **Decision** `scan-cutover-to-encyclopedia` (completes ADR-0005) — the barcode scan is encyclopedia-first; recipe matching is source-agnostic. Remaining: retire the NestJS scan path + `scan_catalog_items` (#1186 step 2). Also opened this session: torch toggle #1191, recipe-matching design item on #1186.

## 2026-06-04

### PR #1185 merged (`1a312eb`) — feat(scan): surface brewery + style names on the scanned beer fiche
- Branch `feat/encyclopedia-beerread-names`, 1 commit. Conforms to the DTO contract #1184.
- Part of #1175. `BeerRead` gains read-only `brewery_name`/`style_name`, resolved in `import-by-ean` via `_beer_read_with_names` (`session.get`, no async lazy-load); mobile `beers-import.api` maps them with placeholder fallback. 152 encyclopedia + 44 scan tests.
- Merged via API bypassing the local merge-gate (**user-authorized**): `SonarCloud Scan` failed on an external infra error (`api.sonarcloud.io/analysis/jres` HTTP 403, scanner v7.2.0 JRE provisioning) — no quality signal produced, not a required check; all real gates green + Copilot no-comments.
- Post-merge ops: encyclopedia redeployed (names verified live on EAN `5056025440494` → `Brewdog` / `India Pale Ale`); OTA published to the `preview` branch (runtimeVersion `0.1.13-alpha1`, matches APK `543d4bd2`) — no rebuild.

### PR #1184 merged (`e381861`) — docs(conception): model the beer API DTO contract (BeerRead denormalized names)
- Branch `docs/encyclopedia-api-dto-contract`, conception-only. Part of #1175.
- New class diagram `07-class-api-contract` (Mermaid + PlantUML) for the `beers` router DTOs; captures the target `BeerRead.brewery_name`/`style_name` (domain-preserving). Traceability matrix updated. Copilot (2) resolved: full mobile path, synced `BeerRead` stereotype.

### PR #1182 merged (`1d8d7bb`) — feat(encyclopedia): extract style + description from the OpenFoodFacts response
- Branch `feat/encyclopedia-off-mapping`, 2 commits. Part of #1175.
- `_pick_style_slug` (segment-matched `categories_tags` → seeded `Style.slug`) + `_pick_description` (`ingredients_text`); persistence resolves slug→`style_id`, sets `description`, fills-when-empty on refresh. `seed_styles.py` added to the boot path. 150 tests.
- Reviews — Codex (1, P2) + Copilot (2) resolved: seed styles at boot, segment-match (fixes `en:camembert`→`amber_ale` false positive), DB-first backfill caveat.

### Scan routing diagnosis + decision (issue #1186)
- Device test (Leffe Blonde, EAN `5410228142218`): "recognised, no details". Root cause = **routing**, not data — the mobile scan is NestJS-first; NestJS re-fetches OFF itself and answers thin (`scan.controller.ts` lookup: "otherwise hits OpenFoodFacts… returns the new row"), so the rich encyclopedia (#1182/#1185) is reached only on a NestJS 404. The encyclopedia returns full data for that EAN (`Leffe` / `Blonde Ale` / 6.6% / ingredients).
- **Decision** `scan-cutover-to-encyclopedia` — finish ADR-0005's migration: route the scan to the encyclopedia, retire NestJS `scan_catalog_items` + its OFF lookup. Captured as #1186 (conception-first, deferred). Also opened: QA/testing epic #1183 (Maestro e2e + staging + pre-deploy smoke), non-root hardening #1180.

### PR #1178 merged (`0498adb`) — chore(encyclopedia): Fly.io deployment (Dockerfile + fly.toml, SQLite-on-volume)

- Branch `chore/deploy-encyclopedia`, 2 commits (`5ad2995`, `3ac73e4`).
- Part of #1175. Deploys the beer-encyclopedia (FastAPI) to Fly.io as a lean EAN/OpenFoodFacts image (UC4) — `brasse-bouillon-encyclopedia.fly.dev`, SQLite on the `enc_data` volume (cdg), `pip install . "aiosqlite"` (no `ml` extra), `CMD alembic upgrade head && python scripts/seed_sources.py && exec uvicorn`. `.dockerignore` keeps everything imported at runtime (`ml/`, `db/`, `importers/`, `migrations/`, `scripts/`, `data/`).
- Reviews — Copilot (3) + Codex (1, P2), all resolved: dropped gcc (deps ship cp312 wheels), `exec uvicorn` → PID 1 graceful shutdown, seed `openfoodfacts` Source at boot (import-by-ean FK). Non-root USER → hardening follow-up #1180.
- Verified live: `/health` 200; `POST /beers/import-by-ean {5056025440494}` → 201, `BREWDOG IPA` persisted (`source=openfoodfacts`, `is_verified=false`, brewery + `EntitySource` provenance). Prod seeded: 1 source, 15 styles, 10 FR legal denominations.

### PR #1179 merged (`85ec44d`) — chore(mobile): point the scan fallback at the deployed beer-encyclopedia

- Branch `chore/mobile-encyclopedia-url`, 1 commit (`1336f28`).
- Part of #1175. Sets `EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL = https://brasse-bouillon-encyclopedia.fly.dev` in both `preview` + `preview-demo` EAS profiles. Env-only — the NestJS-404/503 → encyclopedia `import-by-ean` fallback was already coded (PR #847) but had no deployed target. Live APK rebuilt (`543d4bd2`).

### PR #1177 merged (`a12e6b7`) — fix(encyclopedia): import the ML pipeline lazily so the app boots without the ml extra

- Branch `fix/encyclopedia-lazy-ml`, 2 commits (`1bc2dfb`, `320cf49`).
- Part of #1175. `api/routers/scan.py` imported `ml.pipeline` (cv2/numpy) at module load, blocking a lean deploy. Moved the import inside the `/scan` endpoint (before the threadpool so the broad `except → 500` doesn't swallow it) → the app boots without the `ml` extra; OCR degrades to 503. `api/schemas/scan.py` re-exports `ml.schemas` (pydantic-only) — no decoupling needed.
- Reviews — Copilot (1): strengthened the lazy-import guard via module reload (a `hasattr` check missed a bare `import ml.pipeline`). 7 tests; CI `beer-encyclopedia` green.

### PR #1176 merged (`4ff5f8c`) — docs(adr): ADR-0015 — beer ingestion & enrichment strategy

- Branch `docs/adr-0015-ingestion-enrichment`, squash of review commits (`7314ca1` … `4960173`). Status **Proposed**.
- Part of #1175. Crystallizes the scan → enrich → staging → human-gated-promotion strategy; realizes existing conception (UC4/UC5/UC9), no redesign.
- Reviews — Codex (2, P2) + Copilot (4), all resolved: corrected the `Beer.source` whitelist "no schema change" claim, the `EntitySource`-vs-`Beer` provenance, the `security-policy` → `SECURITY.md` reference; added the ADR-0013 index row + removed the stale note.
- **Decisions**:
  - `staging-then-human-promotion` — every ingested beer is `is_verified=false`; promotion is always via the UC9 moderation queue, no auto-promotion (D1/D3/D4). Recorded on ADR-0015 / #1175.
  - `multi-source-veracity` — corroboration × per-source reliability → a per-field veracity coefficient driving moderation-queue priority (D5). Recorded on ADR-0015 / #1175.

## 2026-06-03

### PR #1170 merged (`a3f4d8b`) — feat(api/seeds): seed ingredients + steps for scan-reachable public recipes

- Branch `feat/seed-public-recipe-content`, 2 commits (`649fb35`, `c185745`).
- Part of #1134 (final slice — content data). Public recipes carried metadata only, and a non-owner viewer never triggers the lazy `ensureDefaultSteps` write (#779), so the live recipe-detail screen was an empty shell. Garnished the 4 scan-reachable IPA-family rows — `BrewDog DIY Dog Punk IPA` (`…00b`), `Session IPA Citra` (`…001`), `NEIPA Tropical` (`…002`), `White IPA` (`…003`), all in the mobile `PUNK_IPA_RECIPE_MATCHES` list — with grain bill + hop schedule + yeast + the default 5-step workflow. `PublicRecipeSeed` gains optional `fermentables/hops/yeasts/steps`; `seedPublicRecipes` wipe-and-refills declared sub-tables idempotently (metadata-only behaviour + `{inserted,updated,total}` result shape preserved).
- New exported `buildPublicRecipeSubResourceRepos(dataSource)`; both `run-public-recipes-seed.ts` and `run-demo-batch-seed.ts` wired through it so the documented seed path inserts content, not metadata only.
- Reviews — Codex (2, P2) + Copilot (3), all resolved: NEIPA was scan-reachable yet left empty (now garnished); runners seeded metadata-only (now wired); hardened the no-op test, used `PUBLIC_RECIPES_SEED.length`, reworded the "bulk-insert" doc.
- 18 seed specs + full seeds/recipe suites green (302). Deployed to Fly.io + seeded prod (11 recipes updated; Punk IPA now serves 2 fermentables / 12 hops / 1 yeast / 5 steps over the live API, verified via a throwaway QA account). Idempotent.

### PR #1167 merged (`f0cb399`) — feat(recipes/api): allow reading ingredients of public recipes

- Branch `feat/recipe-ingredients-public-read`, 2 commits (`9f1bf14`, `51356b7`).
- Part of #1134 (backend half — read access). The ingredient sub-resource GET reads (`listFermentables/Hops/Yeasts/Additives` + `getWater`) were owner-only, so a viewer of a PUBLIC recipe got 404. New private `assertReadable` guard → `RecipeService.getReadableById` (owner OR public, NotFound otherwise — no private/unlisted leak). Writes keep `assertOwnership`; steps were already public-readable.
- Copilot (6), all resolved: rename read params `ownerId` → `viewerId` on the 5 read methods + a test-name grammar fix.
- 146 recipe-module specs pass incl. new H/S/E (non-owner reads public / private hidden / writes still owner-only). No migration.
- **Not yet effective on prod**: needs a manual `flyctl deploy` + seeding recipe content (ingredients/steps) for public recipes — the remaining #1134 work.

### PR #1165 merged (`84cd493`) — feat(recipes): show recipe ingredients in live mode

- Branch `feat/recipe-live-ingredients`, 3 commits (`ae5704b`, `9827d34`, `e251ef5`).
- Part of #1134 (mobile half). `GET /recipes/:id` never inlines ingredients, so the live recipe detail fetched the per-type sub-resources (`/fermentables` `/hops` `/yeasts` `/additives`) and aggregates them into the view model; `RecipeDetailsIngredientItem` carries denormalised `name`/`category` (additives → "other" group), demo output unchanged.
- Codex (1, P1) + Copilot (2), all resolved: ingredient endpoints are owner-only, so each fetch now degrades to empty for non-owner/public recipes (no crash); reused `RecipeIngredientGroupKey`; DTO/row shapes → `interface`; added DTO-mapping coverage to clear the new-code gate.
- Known follow-up (#1134 backend half): ingredient/step endpoints are owner-only → PUBLIC recipes won't surface content to a normal user until a public-readable read path is added (+ seeding rows).

### PR #1146 merged (`a5a0296`) — docs(beer-encyclopedia): UML conception study + backfill ADRs

- Branch `docs/beer-encyclopedia-conception`, squash of 18 commits. Documentation-only (no application code, config, or migration).
- Refs #1147 (epic). Retro-documents the as-built backend, which had shipped without a conforming UML-first conception study.
- 7 diagram files (6 UML types; the sequence type covers both UC4 and UC5) under `docs/architecture/diagrams/beer-encyclopedia/` (use-case + 9 Cockburn specs, sequence import-by-ean / scan, component, class, state, data-flow) — French, dual Mermaid + PlantUML, render-validated. System-level traceability matrix added.
- ADRs: repo [ADR-0013](docs/architecture/decisions/0013-beer-canonical-model-and-conception-order.md) + package ADR-0004 (auxiliary entities) / ADR-0005 (recommender scoring weights).
- **Decisions**:
  - `conception-is-source-of-truth` — the UML study is canonical; code conforms, divergences are tracked. Recorded on ADR-0013 clause 6.
  - `beer-normalized-canonical` — normalized `Beer`/`Brewery`/`Style` is the truth; `scan_catalog_items` is a transitional cache. ADR-0013 clauses 1-2.
  - `diagrams-central-by-feature` — all conception lives under `docs/architecture/diagrams/<feature>/`, no in-package exception; monorepo split deferred (no trigger). ADR-0013 clause 4.
  - `conception-study-in-french` — documented exception to the English-only docs rule. ADR-0013 clause 7.
- Reviews — Codex (10), all addressed + replied inline: post-centralization in-package leftovers, broken diagram links, Media CHECK name (`ck_media_parent_required`), 05-state ADR reference; P2 on `contributed_by` triaged as a pre-existing code-vs-ADR divergence.
- Divergences captured as issues: #1148 #1149 #1150 #1151 #1152 #1153 #1154 #1155 #1156 #1161 #1163.

### PR #1160 merged (`f440d27`) — refactor(scan): move BeerInfoCardScreen data-fetching to TanStack Query

- Branch `refactor/scan-beercard-usequery`, 3 commits (`8da5d36`, `2a0be9a`, `e8f69c5`).
- Closes #1133. Part of #1128.
- Beer lookup + equivalent recipes → `useQuery`, community import → `useMutation` (last `useState + useEffect` remote-fetch removed from the screen; `mapErrorToStatus` unchanged; per-row import spinner re-keyed by `recipeId`, fixing a latent live-mode mismatch where `getImportSourceId` could return `publicRecipeId`).
- Reviews — Codex (1) + Copilot (4), all resolved: `staleTime: 0` on both scan queries (re-fetch per scan, not the inherited 30s cache); reordered lookup status so "Réessayer" shows the loader during refetch (+ test); concurrent-import guard on the Alert confirm.

### PR #1145 merged (`2169793`) — feat(auth): purge session on mid-session 401 (token expiry)

- Branch `feat/live-auth-session-expiry`, 2 commits (`6a46629`, `0aac70a`).
- Closes #1130. Part of #1128 (connect mobile app to the live Fly.io API).
- Global mid-session 401 handling: an authenticated request returning 401 (expired/invalidated JWT) clears the persisted session and routes back to sign-in. Unauthorized-handler registry on `session.ts` (`setUnauthorizedHandler`/`notifyUnauthorized`) keeps the HTTP client React-free; gated on `auth === true` so an unauthenticated 401 (bad login credentials, `auth: false`) never logs out; no-op in demo mode.
- Codex (1, P2): stale-401 race — `0aac70a` only purges when the token that produced the 401 is still current (`attachedToken === authSession.getAccessToken()`), so an in-flight request from before a logout/re-login can't drop the fresh session. Copilot: reviewed 6/6 files, no comments.
- Auth chain verified live against `brasse-bouillon-api.fly.dev` (register → login → `/auth/me` with Bearer → `DELETE /auth/me`, 201/200/200/200), throwaway test account deleted (no prod residue).

## 2026-06-01

### PR #1158 — feat(website): feedback widget → staging-only + new staging environment

- Branch `feat/website-widget-staging-only`. The feedback widget is reframed as a dev-only tool: its host gate is flipped from production (`brasse-bouillon.com`) to `staging.brasse-bouillon-website.pages.dev` + `localhost`/`127.0.0.1`, so it no longer loads on prod. Cache-bust `feedback-widget.js?v=20260601` on all 10 pages.
- New **staging** environment: the deploy workflow now also triggers on a long-lived `staging` branch (Cloudflare Pages branch alias → stable URL `staging.brasse-bouillon-website.pages.dev`); `concurrency` scoped per branch so staging/prod deploys don't block each other.
- Cross-repo follow-up: `feedback-pipeline-worker` CORS allow-list must add `https://staging.brasse-bouillon-website.pages.dev` for the submit flow to work on staging.

### Website production domain `brasse-bouillon.com` cut over to Cloudflare

- DNS authority delegated Namecheap → Cloudflare (NS `craig.ns.cloudflare.com` + `noor.ns.cloudflare.com`); Namecheap now registrar-only, no DNSSEC. Zone reduced to `TXT google-site-verification` + proxied `CNAME @` / `www → brasse-bouillon-website.pages.dev` (CNAME flattening on the apex).
- Removed the 4 GitHub Pages apex `A` records (`185.199.108-111.153`), the old `www → benoit-bremaud.github.io` CNAME, and the legacy `A backend → 109.18.26.95` (Ydays/Klouders vestige, unused — real API is `brasse-bouillon-api.fly.dev`).
- Verified live: apex 200, www 200, `http`→`https` 301, Google Trust Services cert (Universal SSL). Decision recorded in ADR-0014, vestigial repo `CNAME` removed → PR #1157.

## 2026-05-29

### PR #1144 merged (`f56ef9f`) — ci(website): deploy to Cloudflare Pages instead of GitHub Pages

- Branch `chore/website-cloudflare-pages`, 2 commits (`524ffc6`, `9496f32`). Replaced the GitHub Pages publish chain (`configure-pages` / `upload-pages-artifact` / `deploy-pages`) with a Cloudflare Pages Direct Upload (`npx wrangler@3 pages deploy`) to the new `brasse-bouillon-website` project; reuses repo secrets `CLOUDFLARE_API_TOKEN` (Pages:Edit) + `CLOUDFLARE_ACCOUNT_ID`. Live at `brasse-bouillon-website.pages.dev`. Reason: repo went private on a GitHub Free plan → Pages stopped serving (apex 404).
- Copilot (2): derive the deploy branch from `github.ref_name` (production on `main`, preview elsewhere); replaced the blanket `continue-on-error` project-create with a targeted bootstrap tolerating only the "already exists" case.

## 2026-05-28

### PR #1124 merged (`80b0588`) — feat(scan): recognize six physical demo bottles in the offline catalogue

- Branch `feat/scan-demo-physical-bottles`, 3 commits (`2770213`, `fe20008`, `882517c`).
- Six real bottles scanned for the soutenance wired into `demoScanCatalog` + `demoEquivalentRecipes` so demo-mode (offline) scan surfaces a beer card + selectable equivalents: Punk IPA UK 0,33L (`5056025440494`) and La Chouffe 0,33L (`5410769100081`) as aliases of existing entries; Bush Caractère, À la fût IPA, Pauwel Kwak, BrewDog Wingman as new entries. Identities resolved via the OpenFoodFacts client; style/IBU/EBC are style-based estimates.
- `DemoOverrideMenu` now renders the full list (`initialNumToRender`) so the stage-emergency menu reaches every beer regardless of count.
- Copilot (5) + Codex (1, P2): IBU/EBC estimation flags were silently exact despite the notesSource → set `isIbuEstimated`/`isColorEbcEstimated: true` on the 4 new bottles + added offline-lookup tests (`882517c`).

### PR #1123 merged (`7cc52a5`) — chore(mobile): add EAS preview-demo profile and exclude local native dirs

- Branch `chore/eas-preview-demo-profile`, 1 commit (`4140e4c`).
- New `preview-demo` EAS profile (internal APK, `EXPO_PUBLIC_USE_DEMO_DATA=true`) to build an offline demo APK; `.easignore` (root + package) excludes `packages/mobile-app/android|ios` so a local prebuild stops flipping EAS into the bare workflow (which rejected the `appVersion` runtimeVersion policy and broke the build).
- Both PRs merged via `--admin --squash` (AI-only reviewers, no human approval possible; CI green + every comment answered).

## 2026-05-27

### PR #1119 merged (`e4fa604`) — feat(website): refresh app captures on beer-gradient bg + dark phone bezel

- Branch `feat/website-refresh-captures-darkframe`, 2 commits (`b22b10e`, `4ea8303`).
- All 9 in-app captures (4 journey + 5 feature) recaptured from the current build on the beer-gradient background (#1093); `.journey-screenshot` / `.feature-screenshot` frames switched to a dark ink bezel; cache-bust bumped (`?v=20260526` on captures, `?v=20260526-3` on `site.css`).
- Part of the app-to-site capture refresh (#1079, #1110).

## 2026-05-26

### PR #1118 merged (`697e17b`) — feat(api/batches): observation entry + list endpoints (#607 slice B)

- Branch `feat/batch-observation-endpoint-607`, 3 commits (`94a4c27`, `f2413e4`, `ffd5544`).
- Owner-scoped `GET`/`POST /batches/:id/observations`, mirroring measurement slice A (#1116); domain-validated via `createObservation` (#605). Part of #607.
- Codex P2: `photo_refs` simple-array storage would split commas → rejected at the DTO (`@Matches`) + the domain factory.

### Soutenance prep + website journey (3 PRs merged)

- PR #1107 (`4e2e9d6`) — feat(brassins): brewing assistant slice — step countdown timer + pedagogical tips (partial #781); + website real `journey-2-brewing` capture.
- PR #1108 (`71a2020`) — docs(soutenance): optional guided-brewing beat in the 90s demo script (#702).
- PR #1109 (`67afba9`) — feat(website): homepage journey now leads with scan→clone (5 steps), retitled "Du scan à la dégustation".

Open: PR #1110 (draft) — website capture worklist (placeholder cards for recipe-detail + Mes Brassins), to be replaced by real captures post-soutenance.

### Mes Brassins data model (#605) + measurement endpoints (#607) + journey fix (4 PRs, drained through a GitHub Actions partial outage)

- PR #1113 (`5637b69`) — feat(api/batches): Observation entity + table (#605 slice 2; integer-mood DB CHECK per Codex).
- PR #1114 (`bec699a`) — fix(website): homepage journey back to 4 steps — scan stays only in « La reconnaissance » (supersedes #1109's 5-step scan-first; captions kept).
- PR #1115 (`82648d9`) — feat(api/batches): Alert entity + table (#605 slice 3).
- PR #1116 (`859c105`) — feat(api/batches): measurement entry + list endpoints `GET`/`POST /batches/:id/measurements` (#607 slice A).

#605 data model now complete on `main` (Measurement #1112 + Observation + Alert, FK CASCADE + CHECK guards + tested domain factories). Merged via `--admin --squash` during a GitHub Actions *Partial Outage*: CI re-run after recovery + validated locally (lint/build/unit/e2e) before each merge; the three API branches rebased on `main` (typeorm.config / batch.module conflicts resolved keeping all three entities).

## 2026-05-25

### UML conception sweep — 9 domain models + refonte study + log (11 PRs merged)

Conception-first / UML-first pass: 9 PRs (#1096–#1104) model every
previously-unmodelled domain under `docs/architecture/diagrams/` (joining the
existing scan / beer-duel / feedback); plus the UX/IA refonte study (#1094) and a
PROJECT_LOG entry (#1095). All squash-merged after Copilot review (fixes + summary
+ resolved threads). Implementation deferred post-soutenance. Listed
most-recent-first (descending PR #):

- PR #1104 (`6ad88c2`) — **equipment & shop** (local shopping list #653 #621 #650).
- PR #1103 (`968d096`) — **tools & academy** (calculators + glossary).
- PR #1102 (`bc7198a`) — **labels** (journey 4, export #629).
- PR #1101 (`ef7d7f2`) — **dashboard + statistics**. Refs #829 #646 #611.
- PR #1100 (`3eabe7c`) — **account/profile**: + data-flow (PII/RGPD). Refs #1081 #645 #836 #644 #821.
- PR #1099 (`edca486`) — **ingredients**: catalog + custom (Strategy B). Refs #915 #624.
- PR #1098 (`e2d6634`) — **batches / Mes Brassins journal**: use-case/sequence/class/state. Refs #595 #605 #606 #607.
- PR #1097 (`16d58c4`) — **recipes**: use-case/sequence/component/class/state (write CRUD #410–#420 + clone/fork modelled). Refs #740 #882 #883.
- PR #1096 (`bebd0bf`) — **brewing-session**: process spec (`docs/architecture/specs/brewing-session.md`, 9 recipe-derived phases, BeerXML/BeerJSON + BrewDog DIY Dog) + use-case/sequence/component/class/state. Refs #868 #781 #605 #608.
- PR #1095 (`0ef42eb`) — PROJECT_LOG entry for #1093 (not domain modelling).
- PR #1094 (`5dd9967`) — **UX/IA refonte study** (`docs/design/ux-refonte/`) + prioritized roadmap (`docs/product-backlog/prioritized-roadmap.md`), epic #1082.

Copilot review caught real accuracy issues, all corrected: SQLite (better-sqlite3) not PostgreSQL; `src/batch` module + `BatchController`; planned-vs-existing API surface (fork, POST steps, label export, custom ingredient = planned); enums/types aligned to code; login enumeration-safety; Mermaid validity.

Decisions surfaced → **ADRs to open**: D1 (`RecipeStepType` 5→9 phases), CREATOR role (#821), RGPD anonymize-vs-erase on public recipes, single shared glossary.

## 2026-05-24

### PR #1093 merged (`c75bdee`) — feat(ui): compact brand header + beer-gradient background + refreshed app captures

- Branch `feat/app-look-refresh-and-captures`. Mobile-app: global tab header mascot 120→38px (header height 152→72), `Screen` top padding 120→64 — dimensions extracted to a `brandHeader` theme token (`packages/mobile-app/src/core/theme/layout.ts`) so the padding derives from the header height; sign-in keeps the 156px hero. Background swapped from the 1.9 MB textured `Yellow_Background.png` to a 13.6 KB "glass of beer" gradient mirroring brasse-bouillon.com. Batch detail: dropped the internal `ID : <id>` header subtitle.
- Website: replaced the last two placeholder visuals with real emulator captures (demo mode) — `feature-pilotage-batches` (Pilotage step timeline) + `journey-4-deguste` (celebration). WebP, `?v=20260524`. Deployed.
- Automated review (P1) addressed: magic numbers (`64`/`72`/logo size) → single `brandHeader` token. Added the first dedicated `Screen` test (render branches) + a `brandHeader` token test → **100% new-code coverage** (SonarCloud Quality Gate green).
- Backlog: the broader UX/IA refonte (5-tab nav + central Scan, unified Statistics, Profile hub, compact-hero recipe detail) is studied UML-first under epic #1082 — dossier `docs/design/ux-refonte/` + prioritized roadmap (PR #1094), implementation post-soutenance.

## 2026-05-22

### PR #1084 merged (`66fc5bb`) — fix(mobile/batches): localize batch detail screen to French

- Branch `fix/batch-details-localization` (`8334b91` localization + `1574b36` review fixes).
- New `getBatchDetailsViewModel` resolves the recipe name (via `getRecipeDetails`, works in demo + backend) so the title shows the recipe name instead of `Batch <id>`, with a `Brassin <id>` fallback. New `batch-display.constants.ts` maps batch/step status + step-phase enums to FR; `BatchDetailsScreen` and `BatchesScreen` localized.
- Automated review (P1) addressed in `1574b36`: recipe lookup is best-effort (try/catch → fallback title) so a recipe API failure no longer breaks the screen; `BatchDetailsViewModel` is an `interface`; test helper typed to `Batch`/`BatchDetailsViewModel`. 41 batches tests pass.
- Backlog: epic #1082 — B1 (EN/debug labels) marked FIXED; new B2 = per-step countdown timer (no timer component exists yet).

### PR #1083 merged (`6aeeb44`) — feat(website): add beer scan recognition section to landing page

- Branch `feat/website-scan-section`. New `#scanFr` section on `index.html` between the features grid and the FAQ, presenting the signature label-scan recognition (instant recognition + community clone-recipes), reusing the existing `.features-grid`/`.feature-card` classes (no new CSS). Two WebP captures added. Cache-bust `?v=20260522`. Deployed to brasse-bouillon.com.

### PR #1080 merged (`e118918`) — fix(mobile/auth): keep login fields visible above the keyboard

- Branch `fix/login-keyboard-avoidance`. `KeyboardAvoidingView` + Android `softwareKeyboardLayoutMode: "pan"` + return-key chaining so the email/password fields stay above the on-screen keyboard. The `pan` behaviour only manifests in a dev/release build (not Expo Go).

### PR #1079 merged (`ef149de`) — feat(website): real app screenshots (catalogue, fermentation, studio, hop calculator)

- Branch `feat/website-real-screenshots-wave1`. Replaced 4 of the placeholder screenshots with real emulator captures (demo mode): journey-1 catalogue, journey-3 fermentation (J+5/J+14), studio recipes, hop calculator. WebP-optimized, status bar cropped. Deployed.

## 2026-05-21

### Quality & security audit of brasse-bouillon.com — epic #1031 + 12 findings

- Owner-requested **exhaustive** audit of the live site + `packages/website` source (security, perf, a11y, SEO, DNS/email, all 10 pages). No code changes; findings filed as issues.
- Live checks (read-only): TLS Let's Encrypt R13 valid; HTTP→HTTPS 301 OK; HSTS present without `includeSubDomains`/`preload`; **missing** CSP / X-Frame-Options / X-Content-Type-Options / Referrer-Policy / Permissions-Policy; no `/.well-known/security.txt`. Lighthouse mobile homepage 100/100/100/100, LCP 152 ms / CLS 0.00. W3C Nu validation: 0 errors on all 6 main pages. DNS: no SPF/DMARC; no MX (advertised `contact@` is dead). Cookie policy accurate (zero cookies set, confirmed in source).
- Epic #1031 tracks 12 sub-issues. Security (`security`+`priority:high`): #1032 security headers (+CSP-readiness note: inline script/onclick must be refactored first), #1033 HSTS, #1034 security.txt, #1035 Google Fonts privacy/GDPR, #1036 Formspree anti-abuse, #1042 SPF/DMARC. Functional (`type:bug`+`priority:high`): #1044 non-functional contact email. Quality: #1037 HTML/CSS lint CI, #1038 Lighthouse CI/link-checker, #1039 perf + image optimization (+CLS 0.75 on privacy.html note), #1043 custom 404, #1045 Open Graph missing on 9/10 pages + EN canonical/hreflang.
- All 13 issues (epic + 12) added to project `PVT_kwHOB8rwIc4AuVew`. Structural constraint: GitHub Pages cannot set custom headers → header remediation needs a Cloudflare edge or `<meta>` fallback. Deferred (per owner): i18n / EN-pages removal (the `lang-switch` "Read in English" link lives on the 4 secondary pages, not the homepage) — to be captured as its own issue.

### PR #1066 merged (`2d1be2b`) — docs(beer-duel): spec + UML + ADR-0009 + backlog audit cleanup

- Conception of epic #1050 (beer-duel community preference ranking, mobile pop-up + Elo): spec `docs/architecture/specs/beer-duel.md`, 6 Mermaid diagrams `docs/architecture/diagrams/beer-duel/01..06`, `ADR-0009` (votes + Elo = product/social data → NestJS per ADR-0005; beer ref cross-backend, not a hard FK). ADR README index backfilled with the missing 0005 row + a note that 0006–0008 are reserved (#833 journal, #834 monetization/AI, #879/#883 recipe license). Sub-issues #1051–#1056.
- ADR renumbered 0006 → 0009 mid-PR after a backlog audit found 0006–0008 already reserved in open epics — avoided a numbering collision (the new ADR took the next free slot after the reserved block).
- Review (Codex P2 + 14 Copilot inline) addressed in `57d8cf2`: broken diagram links (`../../../` → `../../../../packages`), Elo `^`→`**`, `winnerId: beerId|null`, PII at-rest vs JWT in-transit, vote/cancel POST vs dismiss split, corpus-size from `GET /next` 204. Merged `--admin --squash` (REVIEW_REQUIRED block; AI reviewers comment, don't approve).
- Backlog audit (297 open issues, 47 epics) — quick wins applied: closed #753 (dup of #935), linked #643 under epic #740, linked the 12 website-audit findings (#1032-#1039, #1042-#1045) as native sub-issues of epic #1031. Deferred (needs scoping): a parent "Batches / Brew Journal" epic over #595 + #808-814, and the #810↔#811 gravity-metrics merge.

### PRs #1062 + #1063 merged — mobile responsive fix + accessible burger menu

- PR #1062 (`fix(website)`): cards rendered left-shifted with horizontal scroll on mobile. Cause: `setupDew` baked an absolute px width/height into each `.dew-layer`, which went stale on viewport change and overflowed the (unclipped) cards, pushing `scrollWidth` past the viewport (measured 771 vs ~485 at 390px). Fix: size the layer to its host in CSS (`100%/100%`); `offsetWidth/Height` kept only for bead-count scaling. Deployed.
- PR #1063 (`feat(website)`): accessible mobile burger menu (≤760px) — header links collapse behind a toggle into a dropdown panel; desktop unchanged. Re-applied on top of current `main` (the original work sat on a stale pre-ambiance base) so bubbles/foam/dew are fully preserved (verified open + closed locally). `setupMenu()` handles `data-open`, link-close, Escape. Review follow-ups: focus moves to the destination section on link-close (Copilot), and a `js`/`no-js` `<html>` flip keeps the nav visible without JavaScript (Codex P2). Quality-gate rules + regression test added. Deployed.

### PRs #1059 + #1060 merged — website ambiance perf + Firefox compositing fix (follow-ups to #1057)

- PR #1059 (`aa5faa9`) `perf(website)`: the dew "lens" used `backdrop-filter` on ~440 elements (~5500 DOM nodes total) → compositing artifacts + jank. Removed `backdrop-filter` (look kept via highlight/rim/shadow) and cut counts.
- PR #1060 (`12a7d4b`) `fix(website)`: on Firefox the high-contrast mascot ghosted into the fixed bubble/foam layers (GPU artifact; Chrome unaffected). Promoted `.bubbles`/`.beer-foam` to their own GPU layers (`translateZ(0)` + `backface-visibility`) and gave the mascot `.logo` `backface-visibility:hidden`, dropped `mix-blend-mode:multiply` on the grain overlay (kept via opacity), isolated the hero. Density rebalanced (foam 2600, bubbles 170, dew denser) — ~3400 nodes vs ~5500, and no `backdrop-filter` on the droplet/foam ambiance layers (the `.site-header`/`.pill`/questionnaire chrome keep theirs by design). Deployed.

### PR #1057 merged (`bd56bb2`) — feat(website): "glass of beer" ambiance + 18+ band relocation

- Branch `feat/website-responsibility-band`. Moves the Loi Évin 18+ notice from the top of the page to a full-bleed dark bottom band (FR + EN — the EN page previously had no notice, gap closed). Adds the "page = glass of beer" ambiance: rising CO2 bubbles accelerating up to the foam, a compact foam head crowning the top, condensation droplets on every card (perled beads + pear-shaped trickles with tapering fading trails), and an amber/gold backdrop deepening downward. Pure CSS/JS, no framework, `prefers-reduced-motion` respected.
- Notable fixes during build: density scales with card area; dew layer raised in stacking (`.feature-card > *` z-index override) and sized explicitly (the `inset:0` 0-height quirk); for `<details>` FAQ items the dew attaches to the always-visible `<summary>` so it shows when collapsed. Copilot note addressed pre-merge (EN page now loads `site.js`).
- Deployed to brasse-bouillon.com via `website-deploy.yml` (success). Merged `--admin --squash` (SonarCloud still pending; website quality gate + security-audit green).

### Backlog — epic #1050 created: beer-duel community preference ranking (mobile pop-up + Elo)

- New epic `epic(beer-duel)` #1050 (labels `type:epic` · `scope:frontend` · `scope:backend` · `area:ux` · `priority:nice-to-have` · `epic:community`; added to Project `PVT_kwHOB8rwIc4AuVew`). Occasional dashboard pop-up in the **mobile app**: pick the preferred of two beers (tap card), or "I know neither" (cancelled match), or dismiss. Aggregated as per-beer Elo → community ranking. Decisions: Elo (K=32 default), weighted pairing (favour low exposure), priority v0.2+ (needs corpus + active users).
- Children (native sub-issues): #1051 (api: record vote) · #1052 (api: Elo + ranking) · #1053 (api: weighted pairing) · #1054 (frontend: dashboard pop-up) · #1055 (frontend: cooldown logic) · #1056 (docs: spec + UML + ADR).
- Conception deliverables on branch `docs/beer-duel-backlog` (PR pending): spec `docs/architecture/specs/beer-duel.md`, 6 Mermaid diagrams `docs/architecture/diagrams/beer-duel/01..06`, `ADR-0006` (preference data = product/social → NestJS, per ADR-0005; beer ref cross-backend, not a hard FK). ADR README index also backfilled with the missing 0005 row.

### Epic #1026 — C5 + C2 merged (UML conception + feedback endpoint)

- PR #1040 merged (`30d0d77`) — `docs(feedback/architecture)`: 4 UML diagrams under `docs/architecture/diagrams/feedback/` (use-case, sequence, component, data-flow). Closes #1030 (C5). Consent modelled client-side per ADR-0003 (no backend gate at v0.1; backend sync = v0.2).
- PR #1047 merged (`fbf7470`) — `feat(api)`: public anonymous `POST /feedback` endpoint, persisted to a new `feedback` table, rate-limited, with category/sub-category pairing validation. Closes #1027 (C2). Review caught a P1 (Feedback entity missing from `ormEntities` → runtime `EntityMetadataNotFoundError`); fixed + e2e added.
- PR #1041 merged (`541f33b`) — `docs(log)`: the #1026 epic-creation entry below.
- Still open on the epic: C1 (#1007, depends EAS #975/#748), C3 (#1028, now unblocked), C4 (#1029, depends feedback-widget#15).

## 2026-05-20

### Backlog — epic #1026 created: beta distribution Android + in-product feedback loop

- New epic `epic(feedback)` #1026 (label `epic:feedback`, added to the brasse-bouillon GitHub Project `PVT_kwHOB8rwIc4AuVew`). Reframes "APK link on the website?" into a full beta funnel: download + feedback loop on website and mobile app. Channel decided: APK now (EAS build -> GitHub Release asset), Play Store later; Android first.
- Children: #1007 (C1 download page, adopted) · #1027 (C2 API feedback endpoint, foundation) · #1028 (C3 website widget) · #1029 (C4 in-app RN feedback) · #1030 (C5 UML conception). Reuses the `feedback-widget` project (hexagonal core + web adapter; RN adapter = feedback-widget#15).
- Dependencies referenced not duplicated: EAS #975/#748/#967. Distinguished from #571 (Ydays site widget) and #896 (tasting feedback).

## 2026-05-19

### PR #1020 merged (`99f2208`) — ci(website): GitHub Pages deploy workflow + reclaim brasse-bouillon.com from archived repo

- Branch `feat/website-pages-deploy`, 4 commits (`09a5138`, `3374aae`, `59928ba`, `d2c35c7`).
- Adds `.github/workflows/website-deploy.yml`: first GitHub Pages pipeline since the 2026-03-24 subtree merge. Deploys on push to `main` touching `packages/website/**` (+ `workflow_dispatch`), stages the public surface into `_site/`, publishes via `actions/deploy-pages@v4`, per-job permission scoping. `59928ba` scrubs obsolete standalone-website claims from `packages/website/CLAUDE.md`, `README.md`, `CONTRIBUTING.md`.
- Live migration reclaimed the `brasse-bouillon.com` custom domain from the archived `brasse-bouillon-website` repo (drop legacy Pages → enable Pages on the monorepo → bind CNAME). Replay procedure: `.claude/skills/website-pages-deploy/SKILL.md`.

### PR #1018 merged (`e4c8f2d`) — feat(website): new-brewer journey section + screenshot-ready feature cards

- Branch `feat/website-journey-screenshots`, 2 commits (`5c01201`, `441eb38`), +211/−12 net + 10 placeholder PNG assets. First marketing-site refresh consuming the polished mobile demo: a new `#journeyFr` / `#journeyEn` section between hero and features (FR + EN twins) walks the curious newcomer through the four-step parcours `Choisir → Brasser → Fermenter → Déguster`, each step backed by a wired image path under `packages/website/screenshots/`. The six feature cards swap their legacy emoji `.feature-icon` slot for a `.feature-screenshot` wrapper pointing to the matching mobile capture path. Hero card layout untouched in this PR (mascot + iPhone mockup combo deferred to a follow-up).
- Round-1 review fix in `441eb38`: 3 inline comments addressed (1 Codex P1 Must Have + 2 Copilot Should Have). (1) The new `<img>` references pointed to files that did not exist — committed 10 valid 70-byte 1×1 transparent PNGs at the target paths so any deploy renders no broken-image icon while waiting for the real captures. When the real screenshots arrive, the placeholder PNGs get overwritten in place; no HTML edit needed. (2) `.journey-step p` hardcoded `#5b4b3f` — switched to `var(--color-muted)` (same value, single source of truth). (3) Removed the now-dead `.feature-icon` rule plus its two `nth-child(3n+2)` / `nth-child(3n)` background variants (21 lines deleted) once every feature card adopted `.feature-screenshot`.
- Quality gate (`python3 scripts/quality_gate.py`) green throughout; pytest suite at 7/7. SonarCloud Quality Gate also passed. The new section is anchored on the validated "curious newcomer who hesitates to start" persona only — multi-persona is explicitly deferred per the Ydays soutenance scope.

### PR #1017 merged (`996ba03`) — docs(log): add PROJECT_LOG entry for PR #1016

- Branch `docs/log-pr-1016`, 1 commit (`2b8ba46`), +8. Audit-trail entry for PR #1016 (the demo-mode fermentation tracker) per the `project-log-entry` skill convention. No reviewer comments; merged via squash.

### PR #1016 merged (`7f903e5`) — feat(batches): demo-mode fermentation tracker on BatchDetails

- Branch `feat/dashboard-fermentation-tracking`, 2 commits (`9674af2`, `9e32c7d`), +314/−23 net. Adds a dedicated `Fermentation` card to `BatchDetailsScreen`, pinned right under the existing batch header card. Renders only when `dataSource.useDemoData === true` AND the current step is typed `fermentation` AND `status === "in_progress"` AND the step has a parseable `startedAt`.
- Card content: `J+N / J+14` headline, brand-success progress bar (% of the 14-day target), and two metric columns. Densité actuelle is a linear interp between the recipe's OG and FG using the elapsed-vs-target ratio (1.035 at 5/14 of the arc for "La Première du dimanche" — OG 1.048 / FG 1.012) with the target FG and original OG shown as contextual hints. Température is hardcoded to `19 °C` with the `idéal 18–20 °C` hint.
- Demo-only constants (`DEMO_FERMENTATION_TARGET_DAYS = 14`, `DEMO_FERMENTATION_TEMPERATURE_C = 19`) scoped at the top of the file so the heuristic is explicit. Live mode falls back to the canonical step list — faking a gravity / temperature feed on a real user's batch would be misleading (the real sensor integration is deferred to the fermenter integration epic).
- Round-1 review fix in `9e32c7d`: 5 inline comments addressed (1 Copilot Must Have + 4 Copilot Should Have). (1) Dynamic progress width was inlined as a raw style object in the JSX — extracted to a `progressFillWidth(percent)` helper that also clamps the percentage to [0, 100]. (2) Fermentation card had zero test coverage and was the root cause of the 27.9 % SonarCloud coverage failure — added a dedicated `describe("BatchDetailsScreen — demo-mode fermentation tracker")` block with five tests covering the J+N + progress bar render, the gravity numbers vs the OG/FG interp, hidden in live mode, hidden on non-fermentation steps, and hidden when the fermentation step has not started. Mocks refactored so `dataSource.useDemoData` and the `getBatchDetails` resolved payload are mutable per-test. (3) `progressTrack.height: 8` replaced with `spacing.xs`. (4) `metricLabel.letterSpacing: 0.5` dropped — no matching token, labels read fine in caps without the tracking. (5) `metricHint.marginTop: 2` replaced with `spacing.xxs` (4, smallest available token).
- SonarCloud Quality Gate: first run flagged 27.9 % new-code coverage (required ≥ 80 %); recovered to passing by `9e32c7d` (the five demo-mode tests added). Suite grew from 777 to 782 tests on the merge.

### PR #1014 merged (`c556559`) — feat(mobile): demo-mode dashboard refonte — hero, ribbon, exploration

- Branch `feat/dashboard-fil-rouge-hero`, 5 commits (`a2cb79a`, `db4316d`, `bb4ad99`, `29506c6`, `e0317d2`), +740/−170 net. Reshapes the Dashboard for demo mode so the screen opens on a narrative "Marie is mid-brewing 'La Première du dimanche'" surface instead of a cold KPI grid. Live mode rendering untouched (canonical KPI + alerts + active batches path).
- Header restructured into two rows: top row carries the avatar + `Salut <firstName> 👋` bold greeting and two compact icon-only action buttons (Mon compte / Voir plus); bottom row carries a contextual subtitle (`<currentStep> en cours · <recipe name>` in demo, canonical `Tableau de bord brassage` in live). Padding bumped to `spacing.md`, greeting promoted to `typography.size.h2` so it stops cramping on standard phone widths.
- Hero "Brassin en cours" card pinned just under the header in demo mode — brand-primary background (same aesthetic as the BatchFinishedScreen bottle label so the four marketing screenshots share a coherent visual signature), recipe identity, volume / OG / IBU stats, three progress dots across the user-facing brewing steps, elapsed-vs-expected minutes label, and a `Suivre mon brassin` CTA routing to `/(app)/batches/<id>`. Conditional on `dataSource.useDemoData === true` AND a batch with `id === "b-demo-pdd-mash"` AND `status === "in_progress"` being present in the `listBatches` payload.
- Three-figure ribbon (`brassins / recette signée / J+N fermentation`) pinned right under the hero; gated on `heroBatchInfo && ribbonInfo` so it never leaks into the legacy KPI fallback path. Fermentation day derived from `b-demo-pdd-ferm.fermentationStartedAt` vs the reference date with `Math.max(0, …)` clamp (J+0 valid). Recipe-signed count is the demo recipes whose `ownerId` matches the current session.
- `À explorer` launchpad section with three discovery routes (scan flow, academy, recipes catalogue). Turns the Dashboard into a launchpad rather than a passive readout.
- Demo-mode-only: the legacy `Vue d’ensemble` KPI card and the `Alertes & échéances` card are suppressed when the hero shows so the narrative is not diluted. Both kept intact in live mode. Dropped the now-orphaned `HeaderActionButton` helper.
- Round-1 review fix in `e0317d2`: 3 inline comments addressed (2 Copilot Should Have + 1 Codex P2 Should Have). (1) `fermentationDay` clamped to `Math.max(1, …)` hid a valid J+0 state — replaced with `Math.max(0, …)`. (2) Demo-mode rendering path was not covered by tests — added `describe("DashboardScreen — demo-mode hero")` block with five tests (hero identity, ribbon J+N, À explorer launchpad, hero CTA + explore navigation, legacy KPI/alerts suppression). Mocks refactored so `dataSourceMock.useDemoData` and the session user id are mutable per-test; landed in `29506c6` before the explicit review acknowledgement. (3) Ribbon was conditioned solely on `ribbonInfo` and would leak into the KPI / alerts fallback when demo mode is on but no fil-rouge mash batch is present — widened to `heroBatchInfo && ribbonInfo`. Bonus SonarLint S7735 fix on the alerts suppression (`{!heroBatchInfo && (…)}` over `{heroBatchInfo ? null : (…)}`).
- SonarCloud Quality Gate: first run flagged 23.1 % new-code coverage (required ≥ 80 %); recovered to passing by `29506c6` (the five demo-mode tests). Duplication stayed under threshold throughout.

### PR #1013 merged (`294c665`) — docs(log): add PROJECT_LOG entry for PR #1012

- Branch `docs/log-pr-1012`, 1 commit (`c6d8f04`), +15. Audit-trail entry for PR #1012 captured below per the `project-log-entry` skill convention (terse pointers + SHAs + round-1 review record). No reviewer comments; merged via squash.

### PR #1012 merged (`9bb4c9f`) — feat(mobile): showcase screens + demo polish for the marketing site

- Branch `feat/mobile-demo-showcase-screens`, 16 commits squashed, +850/−320 net. Prepares the mobile app to source the 11 marketing screenshots for the Ydays soutenance website refresh (planned in `~/.claude/plans/et-si-on-mettait-polymorphic-cascade.md`). Two non-operational demo-mode mockups added — `BatchFinishedScreen` (celebration / "Déguste") for the parcours #4 step and `SocialFeedScreen` (community feed) to back the "Partage communauté" feature card without a "v0.2 placeholder" tag. Both hardcoded UI, no API calls, scoped to demo mode.
- Fil-rouge seeder for "La Première du dimanche" (recipe `r-demo-pdd` + three batch states `b-demo-pdd-mash` / `-ferm` / `-done`) so the marketing captures and the soutenance live demo share a single source of truth. KISS pass cut the 12 `b-demo-1..12` placeholder batches (and the original `demoBatchSteps` array that only served them) since their absence from the historique screenshot was a UX win — recipes left intact because they are referenced by the scan flow, recipe-details style mapping, and five test suites.
- End-to-end demo-mode polish bundled with the marketing prep: `startBatch` no longer throws a red error in demo mode (returns the fil-rouge mash batch instead); auth bootstrap honours a stored `demo-access-token` without hitting the backend so the sign-in spinner no longer freezes for the HTTP timeout on reload; `BatchesScreen` shows the recipe name instead of a truncated batch id (`getRecipeName` lookup, French `Brassin <id>` fallback in live mode); recipes hub renamed `Recettes` (subtitle widened to `Mon carnet et les recettes de la communauté`) to drop the duplicated "Mes Recettes" section title.
- Promoted the corner-status-badge pattern into the `Badge` primitive via a new `placement="corner"` prop (using new `typography.size.micro` / `typography.lineHeight.micro` tokens and `spacing.xxs`). Migrated four call sites (BatchesScreen, BatchDetailsScreen step rows, RecipeCard visibility, ShopCategory "À venir") so the homogeneity rule applies across tabs. Inline-tag badges (SocialFeed beer style, Equipment type, Academy focus, Ingredients count) intentionally kept in flow.
- Wired the two mockups into the demo-mode navigation so the soutenance jury never has to type a URL: `NavigationFooter` gets a *Communauté* slot between Académie and Profil (rendered only when `dataSource.useDemoData === true`, built from a `buildNavItems()` helper); tapping a completed brassin in demo mode opens `/(app)/batches/celebration` instead of the technical details view (live mode keeps the canonical route).
- Round-1 review fix: 5 inline comments addressed (4 Copilot Must Have + 1 Codex P2 Should Have). (1) `Badge.tsx` corner placement leaked raw `fontSize: 10` / `lineHeight: 14` / `paddingVertical: 1` — replaced with `typography.size.micro` / `typography.lineHeight.micro` / `spacing.xxs` tokens. (2) `SocialFeedScreen.tsx` posts stored raw `beerColor: "#xxxxxx"` — replaced with `beerColorEbc: number` and `getSrmColor(ebcToSrm(ebc))` derivation matching BatchesScreen. (3) `BatchesScreen.tsx` live-mode `getRecipeName` fallback returned English `Recipe X` — switched to French `Brassin <batchId.slice(0, 8)>` using the batch id rather than the recipe id. (4) `BatchDetailsScreen.tsx` long step labels overran the corner badge — dropped the obsolete `stepHeader` flex-row wrapper, added `paddingTop: spacing.md` on `stepCard`, forced `numberOfLines={1}`. (5) `BatchFinishedScreen.tsx` celebration content stacked as plain children of `Screen` (fixed `flex: 1`) — wrapped below the `ListHeader` in a `ScrollView` so the timeline + CTA stay reachable on shorter devices and with larger accessibility text.
- SonarCloud Quality Gate fix: initial run flagged 79.2 % new-code coverage (required ≥ 80 %) and 6.8 % new-code duplication (required ≤ 3 %). Three new BatchesScreen tests added to cover the demo-mode rendering path (recipe-name resolution, French orphan fallback, navigation press) — suite 767 → 772. `sonar-project.properties` extended with `packages/mobile-app/src/mocks/**` in `sonar.cpd.exclusions` so the three intentionally-parallel fil-rouge batch step arrays (mash / fermentation / done — same shape, different status/timestamps) stop counting as duplicated logic. Same rationale as the existing API catalogue exclusion above.
- Acknowledged the dangling `Noter ma dégustation` CTA in `BatchFinishedScreen`: button is intentionally a `router.back()` placeholder. The natural wiring target is sub-issue *"feat(tasting): shortcut from Mes Brassins detail screen"* under epic #896 (`[Epic] feat(tasting): tasting feedback loop + collective events (3 phases)`), Phase 1 V1. Out of scope for this PR.

---

## 2026-05-18

### PR #1010 merged (`ff86f91`) — docs(ydays): proofreading pass on PLAN-REDACTION-DECK

- Branch `docs/ydays-plan-proofreading-fixes`, 1 commit (`ad6e8b6`), +9/−9. Final read-through pass on `PLAN-REDACTION-DECK.md`. Five small corrections: (1) S6 misspelling `bruloosophy` → `brulosophy` (1 occurrence, matches the URL on the same page). (2) Feminine-plural agreement on the past participle "chronométrée" — fixed 4 occurrences across S5, S7, S10, S14; the 8 others were already correct. (3) S2 "dit par Benoît" → "dites par Benoît" (same agreement rule). (4) S2 removed the opaque pointer to the private agent-memory file `reference_team_mapping.md` (same kind of dead reference Copilot flagged on PR #1006); replaced with a self-pointer to the 3×3 team grid in the Layout section above. (5) S6 rounded `42 %` replaced with the exact source value `41,7 %` from p46 of the Canva draft; oral note keeps the natural delivery with both figures.
- No round-1 review iteration on this PR — Copilot review posted with 0 inline comments; no issues raised. Codex review pending at merge time.

### PR #1009 merged (`c99a1c4`) — docs(ydays): correct soutenance venue + rehearsal context

- Branch `docs/ydays-fix-soutenance-info`, 1 commit (`5a2ac94`), +2/−2. Two factual corrections to the soutenance coordination docs before the team-wide Discord broadcast: (1) `PLAN-REDACTION-DECK.md` "Cadrage transversal" — venue line stated `Salle 0.301 (R+3 Ynov Sophia-Antipolis)` as if confirmed; in reality Ynov has not assigned the room and time slot yet — replaced with `Salle + créneau horaire à confirmer par Ynov`. (2) `STATUS.md` row B7 (rehearsal) — Notes column said `Salle campus`; Monday 25 May 2026 is Lundi de Pentecôte (French bank holiday), so the full-deck rehearsal will run remotely via Teams or Discord.

### PR #1006 merged (`a411590`) — docs(ydays): add PLAN-REDACTION-DECK.md as single source of truth for 15 slides

- Branch `docs/ydays-plan-redaction-deck`, 2 commits (`a0688b0`, `f1c5337`). Adds `docs/ydays/livrables-equipe/PLAN-REDACTION-DECK.md` (961 lines): single reference document with one chapter per slide (S0–S14) containing central idea, layout, exact text, timed oral notes, what-NOT-to-do, resources, responsible person, deadline, status, and a Canva annotation block. Replaces the previous model where each Canva slide had to be self-explanatory — now slides carry a small "INSTRUCTIONS" footer pointing to this file. Also links the new plan from `README.md`, and captures the PROJECT_LOG entry for the just-merged PR #1004. FR-language content (soutenance demo script exception).
- Round-1 review fix in `f1c5337`: 5 inline comments addressed (4 Copilot + 1 Codex). (1) S13 dead resource link `legal-structure-options.md` replaced with the actual existing `statut-juridique-analyse.md` plus 2 cross-references (`capex-financement.md`, `financement-options-fr.md`). (2) S9 architecture schema DB box corrected from `Postgres/SQLite (TypeORM)` to `SQLite (TypeORM + better-sqlite3)` — matches `packages/api/src/database/typeorm.config.ts:134`. (3) S9 marketing-website clarification: `packages/website` is static HTML/CSS/JS served by Cloudflare Pages; VitePress only powers the internal `docs/ydays/` documentation site. (4) S10 absolute "0 any" claim softened to "TypeScript strict mode + `no-explicit-any` ESLint rule", with audit-trail bullet flagging the 1 remaining cast in `packages/api/src/auth/decorators/current-user.decorator.ts:55`. (5) S10 opaque `[memory ...]` notation replaced with plain-language description + link to `packages/mobile-app/CLAUDE.md` §Testing.

### PR #1004 merged (`f398fa3`) — docs(ydays): add livrables-equipe coordination folder for 27 May soutenance

- Branch `docs/ydays-livrables-equipe`, 2 commits (`a0b6c10`, `7d75bd1`). Adds `docs/ydays/livrables-equipe/` with 4 atomic-deliverable subfolders (A1 screenshots app, A2 screenshots GitHub+Discord, A3 RGPD bullets, A4 charte) + `STATUS.md` tracking grid (6 team atoms A1–A6, 7 Benoît tasks B1–B7, 3 critical decisions C1–C3). Spoonfed coordination: Benoît absorbs 90 % of the deck production, each team member contributes one ≤30 min atomic input. FR-language content (soutenance demo script exception per memory rule).
- Round-1 review fix in `7d75bd1`: 7 inline comments addressed (5 Copilot + 2 Codex). (1) STATUS A5/A6 deadline `sam 24 mai` → `dim 24 mai` (Codex P1 calendar correction). (2) STATUS B2 deadline `sam 22 mai` → `ven 22 mai` (Codex P1 calendar correction). (3) README dead local-path bullet `~/.claude/plans/...` removed (Copilot P1). (4) README "6 atomes" wording reworded to clarify 4 file deliverables + 2 Discord-only confirmations (Copilot P2). (5) A3 README format restricted to Markdown only (was "markdown ou Word", Copilot P2). (6) A4 README logo split into `logo-bb.png` (required) + `logo-bb.svg` (optional source) + `logo-bb-dark.png` (optional variant) (Copilot P2). (7) STATUS single-editor convention documented (Benoît centralises updates) to prevent Git merge conflicts on parallel edits (Copilot P3).

---

## 2026-05-08

### PR #981 merged (`d9511c9`) — docs(specs): scan feature development roadmap

- Branch `docs/scan-roadmap`, 2 commits (`494d304`, `2e88330`). Companion to `scan-consolidation.md`. Sequences the scan backlog into 6 phases (0 quick wins → 1 data foundations → 2 enrichment pipeline → 3 mobile capture → 4 OCR + AI vision → 5 polish + community → 6 post-MVP) with explicit dependencies, sub-issue mappings, effort estimates, and exit criteria per phase. Adds the soutenance strategy (Plan A live demo / Plan B degraded / Plan C demo override), end-to-end verification gates, and a risk register.
- Round-1 review fix in `2e88330`: 6 inline comments addressed (1 Codex P2 + 5 Copilot Should Have). (1) §12 Phase 1 SSE gate aggressive vs scope (Codex + Copilot duplicates) — gate aligned with Phase 1's actual deliverables (`upload.received` + `stitching.completed`), other 5 events come online with later phases. (2) §2 vs §12 rehearsal count mismatch — both now read "minimum 2 full rehearsals" matching #642 AC. (3) §8 fixture count contradiction — now "the 6 fixture panoramas, at least 5 of 6 times". (4) French agreement Plan A "Live demo idéal" → "idéale". (5) French agreement Plan B "Demo dégradé" → "dégradée".

### Algorithm redefinition session (decisions D1–D7)

User-journey-first revisit of the panoramic capture algorithm before sending an agent to implement `scan-algorithms.md`. Persona retained: **Léa la curieuse au bar** (single optimisation target — phone in one hand, bottle in the other, 30 s attention, bar context distraction). The 7 decisions below are recorded here and applied to `scan-algorithms.md` in a follow-up PR.

- `D1 — Point d'entrée` — **Barcode-first** + auto-switch silencieux on lookup miss. Status quo, aligned with `scan-consolidation.md` §2 canonical decree.
- `D2 — Pre-capture indicators` — **Soft-gate visuel only**. Distance + blur indicators stay visible to coach, but the **Commencer** CTA is always enabled. Léa taps when she wants. Frame-quality filtering (Laplacian variance + central-region hash) runs at burst-capture time and rejects unusable frames silently. Rationale: the target persona has no patience for a 1-second alignment gate.
- `D3 — Rotation metaphor` — **Permissive**. The coaching string says *"tourne doucement"* without specifying whether to turn the bottle or the phone. The gyro-derived progress gauge measures the angular delta either way.
- `D4 — Live OCR during capture` — **Drop**. `tesseract.js` removed from the burst flow. The gyro gauge filling 0° → 360° plus the adaptive coaching strings are sufficient feedback that capture is working. Removes a real risk of freezing the JS thread on Android mid-range. Preserved as a debug-mode flag for field testing only.
- `D5 — Pre-upload preview` — **None in the MVP**. Capture transitions directly from *"Capture terminée ✅"* to the analysis screen. Quality gate is server-side: if `cv2.Stitcher_create` returns an error, the response surfaces *"On n'a pas pu reconstituer l'étiquette"* with a retry CTA. To be revisited only if OCR success rate is poor post-launch.
- `D6 — "Continuer ailleurs" button` — **Mandatory MVP**, surfaces at T+10 s of analysis screen. Upgrade from "optional" in the original spec. Driven by the persona constraint (Léa abandons after ~15 s of perceived blocking wait). Couples with #939 in-app notifications — the suggestion arrives via the bell when ready.
- `D7 — Offline upload queue` — **Yes in the MVP** via `AsyncStorage`. New Phase 2.5 in the spec: if the network is unavailable when the burst completes, frames are persisted locally (3 captures FIFO, 7-day TTL) and retried on next app launch or network state change. Bar-context connectivity flakiness justifies the ~1-day effort. Implementation lands with #946 unless scope splits out.

All seven decisions follow the contextualised recommendation made by the planning agent. They are non-reopenable without revising this log entry.

### PR #979 merged (`f41ac26`) — docs(specs): scan feature consolidation snapshot

- Branch `docs/scan-consolidation`, 4 commits (`324cc12`, `87c90c3`, `4e406b7`, `5caea4c`). Companion to [scan-algorithms.md](docs/architecture/specs/scan-algorithms.md). Single visible artefact mapping the scan feature backlog: 4 active epics ([#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) panoramic, [#934](https://github.com/benoit-bremaud/brasse-bouillon/issues/934) enrichment, [#803](https://github.com/benoit-bremaud/brasse-bouillon/issues/803) community, [#878](https://github.com/benoit-bremaud/brasse-bouillon/issues/878) freemium), 17 sub-issues sequenced under #751 / #934, the canonical decree (auto-switch when barcode lookup misses), the structuring constraints (ADR-0005 backend split + Expo Managed pure + persistence imperative + craft-beer audience), target architecture, critical files, and the open decisions blocking dev-plan finalisation.
- Backlog triage performed in the same session and recorded under §4.5 of the new doc: closed #858 (superseded by #945–#947), closed #639 (ACs absorbed into #945), commented #803 (alignment with the spec), commented #945 (ACs from #639 added).
- **Decisions** captured during the session and recorded on the relevant issues:
  - `Stitching backend tech` — in-process Python (`cv2.Stitcher_PANORAMA`). `opencv-python` is already a transitive dep of YOLO + EasyOCR in beer-encyclopedia, no new infrastructure. Sub-process and Node FFI rejected. Recorded on #948.
  - `Streaming SSE Phase 4.5` — implement alongside #948, do not defer. Driven by the craft-beer audience constraint: panoramic is the primary recognition path, not a fallback. A 15-second blank spinner is unacceptable UX for the target user. Recorded on #948.
  - `Craft-beer audience as structuring constraint` — added to §3 of the consolidation document. Mainstream beers resolve via OFF barcode in ~200 ms; craft / micro-brewery beers are almost never indexed in OFF, so the auto-switch to panoramic capture fires *as the nominal flow*, not as a fallback. Drives priority for capture quality (#945–#947) and the enrichment pipeline (#934).
- Round-1 review fix in `5caea4c`: 2 Copilot Should-Have comments addressed. (1) §1 self-contradicting "agent-agnostic" claim by naming specific tools — replaced with `any contributor (human or automated)`, also enforces the project's no-AI-attribution policy. (2) §5 target architecture diagram showed two owners of `scan_catalog_items` — diagram now Python single-owner; new §5.1 covers the transitional state until #980 closes with a cutover-not-sync rule.

### Operational

- Filed [#980](https://github.com/benoit-bremaud/brasse-bouillon/issues/980) — `tech(scan): ADR-0005 reconciliation — migrate #934 data model + endpoints to Python beer-encyclopedia`. Tracking issue promised in `scan-algorithms.md` §8 line 286. Carries the migration matrix for #934 sub-issues #935 → #942 (which migrate to Python, which stay NestJS, which split). Comment posted on #934 referencing it.
- Project board linkage: 9 sub-issues #944 → #952 added to the Brasse-Bouillon GitHub project (`PVT_kwHOB8rwIc4AuVew`). The bulk-add that was harness-blocked on 2026-05-07 succeeded today.

---

## 2026-05-07

### PR #958 merged (`093b2f8`) — feat(api): track scan count per catalog item

- Closes [#929](https://github.com/benoit-bremaud/brasse-bouillon/issues/929). Two new columns on `scan_catalog_items`: `scan_count` (`integer NOT NULL DEFAULT 0`) and `last_scanned_at` (`datetime`, nullable). Migration [`1794000000000-AddScanCountToCatalogItems`](packages/api/src/database/migrations/1794000000000-AddScanCountToCatalogItems.ts). Counter is bumped atomically (`UPDATE … SET scan_count = scan_count + 1`) on every successful path of `ScanService.lookupByBarcode` (cache hit fresh + 3× cache hit stale + cache miss fetched), routed through a new `respondWithLookup` helper that centralises the increment.
- Round-1 review fix in `0e20698` + `7a95f0c`: Codex P1 + 1 Copilot comment flagged that the unconditional `await incrementScanCount` turned a metric-write failure into a 500 on the user-facing lookup. Wrapped the increment in a `try/catch` inside `respondWithLookup`, logged the failure through a new NestJS `Logger` (same pattern as `OpenFoodFactsClient`), and swallowed the error — counter is now best-effort. `incrementScanCount` itself stays raw so future audit/transactional callers can opt back into propagation. 1 Copilot Should-Have on the test helper resolved by defaulting `scan_count: 0` and `last_scanned_at: null` in `createCatalogItem`. New regression test asserts that a `SQLITE_BUSY` rejection on the `UPDATE` keeps a successful `cache_hit_fresh` lookup alive.
- **Decisions**:
  - `Counter is per-SKU, regrouping deferred` — Punk IPA in 33cl / 50cl / 75cl keeps separate counters today. Promoting to a `beer_identities` table (commercial-identity entity grouping multiple barcodes under the same recipe) is deferred until the day we build the stats screen — rationale documented inline in the entity column comments and the migration header. Trade-off chosen against (a) introducing the table now (more correct, more migration churn) and (b) using a `recipe_group_key` text column (worst of both worlds).
  - `Best-effort metric over hard dependency` — counter writes never fail a user-facing lookup; logging only. Caller-site decision so future audit code can pick a different policy by calling `incrementScanCount` outside the wrapper.
- **Out of scope (deferred)**: no `GET /scan/popular` endpoint, no mobile-side display of the counter, no index on `scan_count` (volumes too low; will be added alongside the future `ORDER BY scan_count DESC`).

### PR #943 merged (`40347f0`) — docs(specs): scan algorithms spec (barcode + panoramic label)

- New file: [`docs/architecture/specs/scan-algorithms.md`](docs/architecture/specs/scan-algorithms.md). Single source of truth for the scan feature in two flavours: barcode + panoramic label.
- 11 sections: vocabulary glossary (FR/EN, used verbatim everywhere), decision tree (auto-switch when no barcode data, prompt when partial below threshold, no panoramic when complete), 9-phase panoramic algorithm (pre-capture → burst → loop closure → live OCR → backend stitching → server OCR → Claude vision → web-search verification + suggestion creation → review), data model impact (`panoramic_capture` entity), canonical UX copy, tech-stack constraints (Expo Managed pure), risks + open implementation choices, implementation roadmap.
- Round-1 review fix in `f774d3d`: added BB + OFF acronyms to the glossary; **realigned the spec with [ADR-0005](docs/architecture/decisions/0005-backend-split-encyclopedia-vs-product.md)** (panoramic backend services + catalog/suggestion entities live in Python beer-encyclopedia, NestJS keeps notifications + auth + maintainer-action proxies); reworded `barcode` nullability to clarify it's a required schema property of the new Python table (legacy NestJS table stays NOT NULL during transition); justified `jsonb` now that the entity lives in Postgres. Disagreed with 4 markdown-formatting comments where Copilot hallucinated `||` separators that weren't there.
- 9 sub-issues filed under #751 the same day (#944–#952) covering tech-spike, mobile capture chain, Python backend services, and decision-tree wiring.
- A follow-up PR will amend the spec with: (a) conditional OCR-ensemble (5-channel software derivation when single-pass confidence is low), (b) streaming progression UX between backend phases.

### Decisions

- **Backend ownership per ADR-0005 made explicit in the spec banner**: any new catalog / ML / enrichment work goes into Python beer-encyclopedia. The NestJS `scan/` module is on a deprecation roadmap. Mobile is allowed to talk to both backends. Epic #934 was filed before this realignment landed; its NestJS-centric data model needs a follow-up to migrate to Python.
- **Capture stays full-color, derivations happen post-capture**: monochrome / per-channel OCR variants are derived software-side from a single full-color panorama, never captured separately. Avoids unnecessary photo bursts.
- **Conditional OCR ensemble over systematic ensemble**: single grayscale pass first, escalate to 5-channel ensemble only when confidence on critical fields is below 0.7. Cost stays at ~$0.006/scan in the common case.
- **Hybrid stitching (live preview on-device + final on backend)**: the on-device preview cannot run OpenCV, so it uses gyro-derived progress and perceptual-hash loop-closure detection. The authoritative panorama is stitched server-side with `cv2.Stitcher_create(cv2.Stitcher_PANORAMA)` in Python (`opencv-python` is already a transitive dep of YOLO + EasyOCR).

### PR #933 merged (`33ba517`) — chore(env): KISS+YAGNI cleanup of env files + Tailscale fix

- Cleanup pass on env files across the monorepo + a `main.ts` change to bind the API to `0.0.0.0` so Expo Go on a phone can reach it via Tailscale or LAN. Branch `fix/env-tailscale-coverage`.
- Round-1 review fix in `ead8c17`: removed the stale `Development - Staging` Swagger server (staging dropped from `APP_ENV`), renamed `Development - Local` → `Development`, added a small "Also reachable on" log section under the startup banner that lists every non-loopback IPv4 (LAN / Tailscale) so phones know which URL to hit. Also separated `buildTypeOrmOptions` into runtime vs CLI (`{ forCli?: boolean }`) so `npm run migration:generate` / `migration:revert` no longer auto-apply pending migrations before running the requested command.
- Follow-up PR for the project log entry of this work was bundled into the current entry rather than filed separately.

### Operational

- 9 sub-issues filed under epic [#751](https://github.com/benoit-bremaud/brasse-bouillon/issues/751) (panoramic capture): #944 → #952. Sub-issues sequenced per spec §9 with explicit dependencies. **Project board linkage was deferred** — `gh project item-add` and `gh api graphql addProjectV2ItemById` were blocked at the harness level during the bulk-add; the items can be added via the GitHub Projects UI (single multi-select operation).
- **API first production deploy** on Fly.io — app `brasse-bouillon-api` (account `bbd.concept@gmail.com`), region `cdg`, machine `shared-cpu-1x:512MB`, volume `bb_data` 1 GB attached at `/app/data` for SQLite persistence. `JWT_SECRET` rotated at deploy time. Live URL <https://brasse-bouillon-api.fly.dev/> returns `{"success":true,"data":"Hello World!"}`. Mobile app (Expo Go via Tailscale-bridged Metro) verified end-to-end against the production API: signup + login flow OK. Database starts fresh — no migration from the local Tailscale instance; demo data seeding deferred. See [packages/api/docs/fly-deploy.md](packages/api/docs/fly-deploy.md) for the proven-working setup procedure (the `fly deploy` invocation must run from the monorepo root with `--config packages/api/fly.toml --dockerfile packages/api/Dockerfile` because the Dockerfile's build context is the repo root). Branch `chore/deploy-api-fly-io` ships only the doc fixes and this log entry.
- **Massive cleanup pass**: 7 stale remote branches deleted, ~1.16 GB disk reclaimed (build artifacts + `node_modules` + archived backend `node_modules`), 65 GitHub issues closed in three triage rounds (legacy marketing pre-launch batch, Discord MCP setup that was paused, monorepo-migration chores, repo-transfer items, English-translation backlog, pre-monorepo architecture-rewrite tickets, the legacy E01–E10 epic structure superseded by the `epic:*` label family, plus the 19 first-cycle US-XXYY user stories tracked granularly before the consolidated `docs/product-backlog/product-backlog.md`). 5 stale issues kept on purpose (real planning items: #378 design hub, #379 testing strategy, #381 a11y audit, #400 separate-VM deploy, #530 conventions audit).
- **CODEOWNERS solo-dev policy** (PR #956): `.github/CODEOWNERS` reduced to a single `* @benoit-bremaud` rule. New PRs no longer auto-tag the legacy frontend / backend / infra teammates as required reviewers.
- **Scan backlog triage**: closed [#858](https://github.com/benoit-bremaud/brasse-bouillon/issues/858) as superseded by #945 / #946 / #947; closed [#639](https://github.com/benoit-bremaud/brasse-bouillon/issues/639) after absorbing its ACs into #945 (33 / 44 / 75 cl silhouette validation + optional darker out-of-frame mask); commented [#803](https://github.com/benoit-bremaud/brasse-bouillon/issues/803) to make the community-contribution flow's dependency on #948 / #951 / #947 explicit. New consolidation snapshot at [docs/architecture/specs/scan-consolidation.md](docs/architecture/specs/scan-consolidation.md) — single visible artefact mapping the 4 active scan epics, their sub-issues, the cross-cutting issues, the canonical decree, and the 5 open decisions blocking dev-plan finalisation.

---

## 2026-05-06

### PR #928 merged (`8591405`) — chore(api): add full Docker setup for server deployment

- Branch `chore/docker-api-full-v2` (replaces aborted `chore/docker-api-full` — closed without merge after a squash-merge divergence drove the diff over Copilot's 300-file review limit).
- **Server-deployable Docker stack**: `packages/api/docker-compose.yml` (named `api-data` SQLite volume, `restart: unless-stopped`, parameterized `${API_IMAGE_TAG:-latest}` for prod pinning), `packages/api/.env.docker.example` (production-oriented template).
- **Dockerfile rewrite for monorepo-root context**: resolves the canonical `package-lock.json` at the repo root (per-workspace lockfiles blocked by `.gitignore` since incident #674). `packages/api/Dockerfile.dockerignore` (BuildKit-resolved alongside the Dockerfile) replaces the old `packages/api/.dockerignore` and excludes the unrelated workspaces and docs from the build context.
- **CI workflow** `.github/workflows/docker-build.yml`: split into `build` (PR + push, `contents: read` only) + `publish` (push to `main` only, `packages: write`, depends on `build`). Tags `:latest` + `:sha-<short-sha>` pushed to `ghcr.io/benoit-bremaud/brasse-bouillon-api`.
- **Makefile**: `docker-build` (delegates to `docker compose build` so the local image tag matches `docker-up`), `docker-up`, `docker-down`, `docker-logs` + new `Docker — API` block in `make help`.
- 4 review fix commits: `f9ba106` (Codex P1: build context fix), `90db2d7` (Codex P2: decouple host/container port), `eacab87` (Makefile help sectioned + Docker targets in `.PHONY`), `d4da220` (Copilot Should Have ×4: docker-build via compose, split CI permissions, parameterized image tag, `API_IMAGE_TAG` documented in `.env.docker.example`).
- All 4 inline Copilot/Codex comments answered inline. CI green on the publish run. PR #927 (the divergent v1 attempt) closed without merge.

### Decisions

- **Docker build context = monorepo root**: forced by the canonical `package-lock.json` living at the repo root. Per-workspace lockfiles are intentionally blocked since incident #674. Trade-off: larger build context, mitigated by `Dockerfile.dockerignore` excluding `packages/{mobile-app,website,beer-encyclopedia}`, `docs/`, `_archive/`, `.git/`, `.claude/`.
- **Compose `build:` + `image:` kept together**: standard dual-mode Compose pattern (local rebuild via `docker compose build`, server pull via `docker compose pull`). Disagreed with Copilot's suggestion to split into base + override files — extra ceremony for marginal benefit on a single-service project. Server reproducibility is enforced at the deploy-command level (`pull` never touches `build:`).
- **Least-privilege CI**: two-job split with workflow-level `contents: read` only. `packages: write` is granted exclusively to the `publish` job, gated by `if: github.event_name == 'push'`. PR builds can no longer hold a write-capable token even if a step were compromised.
- **Image tag parameterized via `${API_IMAGE_TAG:-latest}`**: default stays `latest` for simplicity; production deployments pin `API_IMAGE_TAG=sha-<short-sha>` for immutable rollouts. Addresses Copilot's concern about the mutable `:latest` tag without removing the convenient default.

### Operational changes (no PR)

- **Discord notifications paused**: workflow `Discord Notifications` (`.github/workflows/discord-notifications.yml`) disabled via `gh workflow disable` (status: `disabled_manually`). Webhook secrets left in place; file untouched. Re-enable only on explicit user instruction.
- **PR reviewer rule clarified — AI-only**: from now on, every PR requests reviews from `copilot-pull-request-reviewer` and `chatgpt-codex-connector` exclusively. No human collaborators in the reviewers list. Supersedes the 2026-04-28 reversal that briefly allowed scope/area-based human reviewers. Humans still appear in the informational French FYI comment, never as reviewers.

### PR #926 merged (`f5faeb6`) — chore(makefile): add dev-all, dev-stop, db-*, migrate-* targets and rewrite help

- Branch `chore/makefile-dev-targets`. Solo Makefile change — no application code modified.
- **New targets**: `dev-beer-enc` (FastAPI uvicorn server, port 8000, with venv preflight guard), `dev-all` (full stack: `setup` → `db-up` → `migrate-api` + `migrate-beer-enc` → 3 servers in parallel via `trap 'kill 0' INT TERM`), `dev-stop` (kill processes on ports 3000/8000/8081 + stop beer-encyclopedia Docker containers).
- **New `@Database` block**: `db-up` (Docker Compose `--wait` with error-aware fallback and 60 s polling timeout), `db-down`, `db-logs`.
- **New `@Migrations` block**: `migrate-api` / `migrate-api-revert` (TypeORM npm script), `migrate-beer-enc` / `migrate-beer-enc-revert` (Alembic venv).
- **`setup` extended**: bootstraps `packages/beer-encyclopedia/.env` from `.env.example` with randomly generated Postgres + PgAdmin passwords (`openssl → python3 secrets → uuidgen → CHANGE_ME` chain). Idempotent.
- **`help` rewritten**: `printf`-based grouped output replacing the sorted `awk` parser — Quick start / Daily dev / Database / Migrations / Quality gates sections.
- 2 review fix commits: `2b16cc4` (db-up error-aware fallback, Codex P2) and `b4d7654` (5× Copilot Should Have: LAN IP in dev-beer-enc log, venv guard in dev-all, dev-stop description narrowed, migrate-beer-enc error message actionable, fallback credentials chain).
- CI green (Makefile-only → app jobs skipped). All 7 reviewer comments addressed inline before merge.

### Issues filed — idea captures (2026-05-05 session)

- [#924](https://github.com/benoit-bremaud/brasse-bouillon/issues/924) — Library tab: curated book references about brewing & beer (`type:feature + scope:frontend + area:mobile + priority:low`).
- [#923](https://github.com/benoit-bremaud/brasse-bouillon/issues/923) — Recipe brewing-difficulty badge for novice guidance (`type:feature + scope:frontend + area:mobile + priority:low`). Both linked to Brasse-Bouillon project (no milestone, deferred to grooming).

---

## 2026-05-05

### PR #917 merged (`7f59508`) — feat(recipes): refactor Mes Recettes into 2-section hub (Mes recettes + Découvrir)

- Closes part of Epic [#740](https://github.com/benoit-bremaud/brasse-bouillon/issues/740) Round 2 (Mes Recettes Hub). Branch `feat/recipes-hub`.
- Scope: legacy flat list replaced by a 2-section hub — **Mes recettes** (perso + scan-imported, with `[Scanner ta 1ère bière]` empty-state CTA wired to `/(app)/dashboard/scan`, Pattern A landing) + **Découvrir** (top 5 of `listPublicRecipes`, capped via `previewLimit`, "Voir tout" pill linking to the existing `CatalogScreen`). Stats / Brouillons / Favoris / Tutoriels deferred to v0.2 per the issue's tier table.
- New components: `sections/MyRecipesSection.tsx` (header + empty-state CTA) and `sections/DiscoverSection.tsx` (header + "Voir tout" pill + preview cards). Orchestrator hosts a single virtualized `FlatList` with section header + footer pattern (P2 review feedback: previous draft used `ScrollView + .map()` which regressed virtualization).
- French i18n pass: `RecipeCard` default visibility badges switched to French ("Publique" / "Privée" / "Non listée"); `CatalogScreen` override updated to `"Publique"`; "curées" mistranslation in DiscoverSection subtitle replaced with "sélectionnées".
- 2 review rounds — **14 inline review comments addressed** total. Round 1 (`4c6de06`): virtualization restoration + `isFirstLoading` narrowed to `&&` of both queries empty + `import type { Recipe }` + French badges + i18n + brittle `getByText` tests recabled on `getByLabelText("Ouvrir la recette …")`. Round 2 (`23d8f1e`): empty-state guarded behind `isLoading` (no flash during initial fetch), `pickQueryError` per-query suppression (no cross-mask), double `paddingHorizontal` removed from sections (parent FlatList owns the gutter), stale `RecipeCard` visibility-badge comment refreshed, incidental `RecipeCard.Props` marked `Readonly<>` (Sonar S6759).
- 750/750 tests green, ci:check green. Single approving review by `benoit-bremaud`, squash-merge to main.

### PR #916 merged (`0bd743f`) — feat(recipes): redesign detail screen with 4-tab layout + EBC hero + sticky CTA

- Closes part of Epic [#740](https://github.com/benoit-bremaud/brasse-bouillon/issues/740) Round 4 (Recipe Detail Screen Refonte v0.1). Branch `feat/recipe-detail-redesign-demo`.
- Scope: legacy 1.3 kLoC monolithic `RecipeDetailsScreen` split into a tabbed orchestrator. **Initial design**: 4 horizontal tabs (Vue d'ensemble / Brassage / Compatibilité / Notes & Reviews) + `RecipeDetailTabBar`. **v2 redesign mid-PR** (commit `1e9b889`, after design Q&A with PO): switched to a **5-tab vertical side rail** (Vue / Ingrédients / Eau / Brassage / Notes) via `RecipeDetailSideRail`, with `IngredientsTab` and `WaterTab` extracted from the previous Brassage tab. Sticky `[Lancer un brassin]` CTA pinned across every tab except Notes (where the action is semantically irrelevant). EBC-driven hero shared with the scan flow's `BeerHero` (rather than a duplicated `RecipeHero` — SonarCloud duplication gate cleared).
- Data fetching migrated from `useState + useEffect` to TanStack Query (`useQuery` + `useMutation`). Mutation `onSuccess` invalidates the `['batches']` cache so the navigated-to batches list refetches with the freshly created batch. `handleRetry` calls `startBatchMutation.reset()` before refetching the recipe query, so a failed batch-start no longer keeps the error banner up.
- 15 inline review comments addressed (2 P2 + 13 quality-of-life) — Must Have: explicit not-found state when `recipeId` is empty, mutation reset on retry, batches cache invalidation, water preset `rootRecipeId` fallback for imported recipes, `RecipeHero` deletion (BeerHero canonical). Should Have: `BeerHero` made flexible (optional brewery/style with hide-when-empty rendering), location preference no longer a tautology (falls back to `DEFAULT_BALANCED_WATER_PROFILE`), BrewingTab slimmed to ~190 lines, ScrollView `flex: 1`, hero/test improvements. Disagree (politely): dynamic styles are legitimate (EBC-driven hero color, safe-area `paddingBottom`).
- 744 → 750 tests green, ci:check green. Squash-merge to main.

### Post-merge cleanup — local hygiene

- `git pull origin main` (7 commits behind), local branches `feat/recipe-detail-redesign-demo` / `feat/recipes-hub` / `feat/seed-brewdog-diy-dog-official` deleted, remote refs pruned (`origin/feat/recipe-detail-redesign-demo`, `origin/feat/recipes-hub`, `origin/feat/seed-brewdog-diy-dog-official`).

### Decisions

- **Recipe Detail mid-PR redesign — 5-tab vertical side rail over 4-tab horizontal**: switched after a focused design Q&A with the PO. Vertical rail scales better when more tabs (Compatibility cross-checks, Tasting target date, future v0.2 features) need to land, ingredients warrant a dedicated tab to support the future Alchimiste flow ([#895](https://github.com/benoit-bremaud/brasse-bouillon/issues/895)), and water deserves its own tab since the cross-check is the most-discussed compatibility criterion. Force-pushed within the same PR rather than as a follow-up because the v1 4-tab work was barely 24h old and the v2 was strictly additive on the same architecture.
- **Hub Mes Recettes — single virtualized `FlatList` over `SectionList` or `ScrollView + .map()`**: chosen during PR #917 round 1 in response to a P2 review comment. `SectionList` would have worked but the hub has only 2 sections of which one is bounded (Découvrir capped at 5), so a `FlatList` with `ListHeaderComponent` (Mes recettes title + empty state) and `ListFooterComponent` (Découvrir) keeps native row recycling for the unbounded "Mes recettes" data without nested scrolling complexity.
- **`RecipeCard` default visibility badges French by default**, English override only for explicit deliberate-marker contexts: `CatalogScreen` keeps `badgeLabel="Publique"` as a defensive guarantee in case the API leaks a non-public row. Pattern aligns with the project-wide "UI stays French" convention.
- **`RecipeHero` deleted in favour of canonical `BeerHero`**: avoids the maintenance cost of keeping two near-identical hero primitives in sync (review feedback on PR #916). `BeerHero` was made flexible (optional `brewery` / `style` props, hide-when-empty rendering) to absorb the recipe use case without duplication. Resolved the SonarCloud New Code Duplication gate that was failing on the previous head.

---

## 2026-05-04

### PR #908 merged (`ef0494f`) — feat(catalog/distributor): add distributors + 5 M:N junctions per catalogue

- Closes Issue #901 (boutique foundation). Branch `feat/catalog-distributors-and-junctions`.
- Scope: `distributors` table (12 entries FR/BE/GB/US/DE) + 5 junction tables (`hop_distributors`, `fermentable_distributors`, `yeast_distributors`, `misc_template_distributors`, `equipment_template_distributors`) + 5 `GET /catalog/{hops|fermentables|yeasts|misc-templates|equipment-templates}/:id/distributors` endpoints + migration 1793 + seed + runner.
- Sets the codebase **M:N precedent**: composite PK `(catalogue_id, distributor_id)`, `ON DELETE CASCADE` both sides, reverse-lookup index on `distributor_id`, CHECK constraints (country GLOB `[A-Z][A-Z]`, currency GLOB `[A-Z][A-Z][A-Z]`, URLs `https://%`).
- Shared `CatalogDistributorLinkDto` + `mapJunctionRowToDto` helper to avoid 5× DTO duplication. UUID range `9...` reserved for distributors (next slot after producers `8`).
- 10 Copilot review comments addressed in `ca2c31b` — 4 missing `getDistributors()` service-spec happy/sad/edge (H/S/E) blocks, 5 missing `:id/distributors` controller-spec blocks, 1 unused `DistributorEntry` interface dropped. Each comment got an inline reply linking to the fix commit.
- 653/655 tests green (+22 new). Junction seed rows (Citra → Brewferm/Hopt/MaltMiller, etc.) deferred to a follow-up tiny PR or bundled with #780 (BrewDog DIY Dog seed).

### PR #906 merged (`1e195ab`) — refactor(mobile/ingredients): consume `GET /catalog/*` endpoints

- Closes Issue #887. First mobile-side consumer of the 9 catalogue endpoints shipped 2026-05-03 (PRs #888 → #902). Replaces the legacy recipe-crawl fallback (`ingredients.api.ts` — N+1 queries on `/recipes/*/{hops,fermentables,yeasts}` with hardcoded `betaAcid: 0` and synthetic `hop-citra` IDs) by per-category api modules calling `/catalog/{hops|fermentables|yeasts|misc-templates}` with real UUIDs.
- 5 api modules touched: `hops.api.ts` rewritten, `malts.api.ts` rewritten (mobile keeps "malt" terminology, API table is `fermentables`), `yeasts.api.ts` rewritten (post #905 cleanup — no more `laboratory`, `product_id` → `product_code`), new `misc.api.ts` (currently unwired pending picker UX in issue #624), `ingredients.api.ts` deleted.
- `application/ingredients.use-cases.ts` rewritten to delegate the polymorphic surface (`listIngredientsByCategory`, `getIngredientDetails`, `listIngredientCategoriesSummary`) to the per-category use-cases (`listMalts` / `listHops` / `listYeasts` + `getMaltDetails` / `getHopDetails` / `getYeastDetails`). Demo-mode dispatch (`dataSource.useDemoData` → `demoIngredients`/`demoMalts`) preserved untouched. 3 type-adapter functions (`maltToIngredient`/`hopToIngredient`/`yeastToIngredient`) convert per-category Product shapes (with `specGroups`) to the `Ingredient` union.
- Cold load: 3 requests (one per category) instead of `1 + 3N` recipe crawls. Real UUIDs propagate end-to-end.
- 6 commits on the branch over ~3 hours of iterative review cycles. **10 reviewer comments addressed inline** (1 Codex P1 caught twice — accent-on-label parsing breakage + recipe-crawl regression — and 8 Copilot — DTO drift, synthetic ID propagation, premature deprecation, dead-code mention, missing docblock, code smell). Sonar coverage gate cleared in 3 successive pushes (39.5% → 72.2% → ≥80%) by adding 4 api spec files + parametric adapter coverage tests (+53 tests total — 682 → 735).
- **Mobile post-Phase 3 follow-up sequence** continues: distributors #901 (boutique foundation), Recipe → catalogue FK refactor, mobile Académie BJCP #892, mobile picker UX #624 (which will wire `IngredientCategory.misc` and consume the `misc.api.ts` shipped here).

---

## 2026-05-03

### Catalogue refactor — Phases 1-3 + producers + cleanup shipped in one day (#708 / #869)

- 8 immutable reference catalogues merged to `main` between 02:00 and 18:16 UTC (PR #888 → #899), all on `packages/api`. Each PR follows the same 12-file pattern: entity + DTO + service + controller + module + migration + seed + 3 specs (service/controller/seed) + runner script + wiring updates to `catalog.module.ts` and `typeorm.config.ts`. The 9th PR #902 (producers + 5 catalogue FKs) lands at 19:55 UTC and closes the cross-catalogue producer dimension. The 10th PR #905 (yeast cleanup, 20:56 UTC) closes the dette deferred from #902's mode-prudent first cut. PR #906 ships at 01:41 UTC on 2026-05-04 — first mobile consumer of the new endpoints (see entry above).
- **Decisions** locked across the series:
  - `*CatalogModule` suffix (e.g. `WaterCatalogModule`, `EquipmentCatalogModule`, `ProducerCatalogModule`) to avoid class-name collisions with existing user-owned modules — convention adopted on PR #894 after Copilot caught the `EquipmentModule` collision risk, extended to `*CatalogService` / `*CatalogController` after Copilot caught the same drift on PR #902.
  - `assertCommonCatalogueSeederBehaviours` shared test helper at `src/database/seeds/seed-test-utils.ts` — covers the 4 standard scenarios (happy / sad / mixed / override-list) so each catalogue spec only carries its own invariants. Added on PR #891 to clear SonarCloud's new-code duplication gate.
  - Deterministic UUID range per catalogue: hops `0`, fermentables `1`, yeasts `2`, styles `3`, mash `4`, waters `5`, equipment `6`, misc `7`, producers `8`.
  - Notes columns kept French (UI-facing per `feedback_ui_french_only`); `use_for` / category metadata stays English (BeerXML provenance).
  - **Producer ≠ Distributor** (PR #902): producers carry the brand owner (1 product = 1 producer, FK 1:1 on catalogues). The boutique flow (1 product = N distributors) is reserved for issue #901 (M:N junctions) and will be refined when the boutique work starts.
- **Scope post Phase 3**: umbrella issues #708 / #869 closed automatically by PR #899. Open follow-ups now tracked separately — yeast cleanup tiny PR (drop `laboratory` + rename `product_id` → `product_code` after picker UX validation, deferred from PR #902's mode-prudent scope), distributors #901, Recipe-entity FK refactor, mobile ingredient picker refactor #887.

### PR #905 merged (`2aec87b`) — refactor(catalog/yeast): drop legacy `laboratory` + rename `product_id` to `product_code`

- Closes Issue #904. Tiny cleanup PR that closes the dette technique deliberately deferred from PR #902's mode-prudent first cut. Now that `producer_id` FK has shipped and the picker UX can rely on it, the legacy yeast columns can be retired.
- Migration 1792 (data + schema): backfills `producer_id` on existing yeast rows by SQL lookup against `producers.name` (verbatim match — names in PR #902 seed were chosen for this exact lookup). Then `DROP COLUMN laboratory` + `RENAME COLUMN product_id TO product_code`. SQLite 3.35+ DROP COLUMN, better-sqlite3 bundles 3.42+.
- Two defensive layers added after Codex P1 catch: (1) `INSERT OR IGNORE` the 5 essential laboratory producers (Wyeast Labs / White Labs / Fermentis / Lallemand / Imperial Yeast) at the top of the migration so the join never returns NULL on an upgraded DB where the producers seed hasn't been (re-)run; (2) `SELECT COUNT(*) AS "n" FROM "yeasts" WHERE "laboratory" IS NOT NULL AND "producer_id" IS NULL` orphan-detection assertion BEFORE the drop — fail-fast if any orphan remains. Same `INSERT OR IGNORE` pattern mirrored in the yeast seed loader (Copilot catch, separate concern from the migration).
- Yeast entity drops `@Index(['laboratory'])` + `laboratory` column + renames `product_id` → `product_code`. Yeast DTO drops `laboratory` field + renames `product_id` → `product_code`. 20 seeded yeasts get their `producer_id` populated via the migration backfill (Wyeast Labs UUID for the 1056 / 1084 / 1332 / 2565 / 3068 / 3711 / 3787 / 1318 entries, etc.).
- 3 commits: initial drop+rename + Codex P1 fix (self-seed migration) + Copilot fix (seed self-bootstraps via `repository.query()`, helper `buildRepoMock` extended with `query` jest.fn).
- 605/607 tests still green (no regression), lint + build clean.

### PR #902 merged (`977610c`) — feat(catalog/producer): producers reference table + producer_id FK on 5 catalogues

- First post-Phase 3 follow-up. Closes design debt documented in every Phase 1-3 catalogue entity ("deferred to normalize-producers PR after Phase 3"). Closes issue #900.
- Adds `producers` table (16 → 17 entries: 5 laboratories Wyeast Labs / White Labs / Fermentis / Lallemand / Imperial Yeast, 5 maltsters Briess / Weyermann / Best Malz / Castle / Crisp, 3 hop suppliers Yakima Chief / BarthHaas / Hopsteiner, 3 equipment manufacturers Grainfather / Klarstein / Anvil, + Brouwland as `other` added during review). Adds nullable `producer_id` FK on hops, fermentables, yeasts, misc_templates, equipment_templates (ON DELETE SET NULL). New endpoints `GET /catalog/producers` and `GET /catalog/producers/:id`.
- **Mode-prudent first cut chosen mid-planning**: `producer_id` added on yeast ALONGSIDE the existing `laboratory` varchar + `product_id` varchar (PR #890 columns), NOT in replacement. Yeast carries 3 producer-related fields temporarily — cleanup tiny PR ships separately once picker UX is validated against the new FK. Trade-off: minimal diff (5 catalogue files touched with 1 nullable column each), zero risk on existing seeded data, faster to ship.
- 19 files initial + 18 files in fix commit, 605/607 tests green (+21 producer, no regression). 3 commits: `f74220a` initial / `9df4541` Codex P1 fix (down() drop_column ordering for FK dangle) / `2d42349` Copilot 15-comment fix (DTO exposure ×5 + @Index ×5 + *Catalog* naming ×2 + Other type ×1 + spec assertion ×1 + docblock ×1).
- Spawned issue [#901](https://github.com/benoit-bremaud/brasse-bouillon/issues/901) (distributors + M:N junctions, boutique foundation) — placeholder spec to refine when boutique work starts. Naming distinction `producer` (brand owner) vs `distributor` (reseller) explicitly captured in the issue body to anchor the future implementation.

### PR #899 merged (`37f993f`) — feat(catalog/misc): miscellaneous ingredients reference catalogue (closes Phase 3)

- Phase 3 PR #8 — last catalogue of the original 8-PR series. Covers BeerXML 1.0 `<MISC>` records: spices, finings, water agents, herbs, flavor adjuncts.
- 10 entries: 5 BeerXML canonical (Apricot Extract, Calcium Chloride, Ginger Root, Irish Moss, Orange Peel Bitter) + 5 Brasse-Bouillon modern essentials (Coriandre, Lactose, Whirlfloc, Servomyces, Gypse). Coverage: all 6 BeerXML TYPE values + 3 primary USE phases (mash / boil / bottling).
- Same naming pattern as `equipment_templates` (`misc_templates` not `miscs`) to leave room for a future `recipe_misc` junction table without collision when Recipe entities are refactored.
- Schema: `type` (enum CHECK spice/fining/water_agent/herb/flavor/other), `use_at` (enum CHECK mash/boil/primary/secondary/bottling — renamed from BeerXML `USE` because `use` is a SQL reserved keyword), `amount` + `amount_is_weight` boolean (raw BeerXML AMOUNT verbatim, kg or L), `time_min`, `use_for` (English category), `notes` (French).
- 14 files, +1098 LoC, 584/586 tests green (+20 misc). 3 commits including PROJECT_LOG.md backfill for the prior 7 PRs of the series. 4 Copilot comments addressed in `0553a7c` (entity + migration enum constraints + 2 internal-name leaks in user-facing notes).

### PR #898 merged (`8934ade`) — feat(catalog/equipment): equipment templates reference catalogue

- Phase 3 PR #7 of the catalogue series. 9 entries spanning the full beginner-to-pro spectrum: 1 Brasse-Bouillon original kitchen starter (Casserole 5L extract — added late in the cycle after the user validated the "I just want to try once" persona), 2 BeerXML canonical, 6 modern popular setups (BIAB 20/30L, Grainfather G30, Klarstein Brauheld Pro, Anvil Foundry, 3-Vessel HERMS).
- 4 Copilot inline comments addressed in `2b42d02` (3 stale "8 entries" doc references bumped to "9" after the kitchen starter was added; 1 service docstring rewritten — old version claimed "multiple revisions may share a name", but the schema enforces UNIQUE(name)).
- 14 files, +1096 LoC.

### PR #894 merged (`5fe171b`) — feat(catalog/water): brewing water profiles reference catalogue

- Phase 3 PR #6. 10 reference water profiles (3 BeerXML canonical: Pilsen / Burton-on-Trent / Munich, plus 7 city profiles for famous brewing waters). 6 mineral columns (Ca, Mg, Na, SO4, Cl, HCO3) per BeerXML 1.0 `<WATER>` field mapping.
- Class renamed `WaterModule` → `WaterCatalogModule` after Copilot caught the collision with the existing user-owned water module — set the `*CatalogModule` precedent the rest of the series follows.

### PR #893 merged (`cf3b1c9`) — feat(catalog/mash): mash profiles + steps reference catalogue (1:N)

- Phase 2 PR #5 — closes Phase 2. Two-table catalogue with `mash_profiles` (parent) and `mash_steps` (child, FK with `ON DELETE CASCADE`). Steps ordered by `step_number`, types restricted to BeerXML enum (Infusion / Temperature / Decoction).
- Most complex catalogue of the series due to the 1:N cascade — pattern reusable for any future parent/child catalogue.

### PR #891 merged (`b9b034f`) — feat(catalog/style): BJCP styles reference catalogue (opens Phase 2)

- Phase 2 PR #4. Composite UNIQUE(name, style_guide) so the same style name can coexist across the BJCP 2015 and BJCP 2021 guide editions.
- **SonarCloud duplication failure** caught post-merge: fixed via `sonar.cpd.exclusions` in root `sonar-project.properties` covering catalogue boilerplate (services / controllers / modules / DTOs / entities / seeds / runners). The shared `assertCommonCatalogueSeederBehaviours` helper was extracted at the same time.
- Spawned Issue #892 (mobile Académie / Guide BJCP — separate epic).

### PR #890 merged (`e9e8d5c`) — feat(catalog/yeast): yeasts reference catalogue (closes Phase 1)

- Phase 1 PR #3. BeerXML `<YEAST>` mapping: form (liquid/dry/slant/culture), type (ale/lager/wheat/wine/champagne), attenuation, flocculation. 12 entries spanning the major Wyeast / White Labs / Fermentis lines.

### PR #889 merged (`f137030`) — feat(catalog/fermentable): fermentables reference catalogue

- Phase 1 PR #2. BeerXML `<FERMENTABLE>` mapping incl. `color_ebc` (project-normalised to EBC per `feedback_normalized_colors`), `yield_percent`, type (grain/sugar/extract/dry_extract/adjunct).

### PR #888 merged (`6c70eb3`) — feat(catalog/hop): hops reference catalogue (opens Phase 1)

- Phase 1 PR #1 — first of the 8-PR series, set the file-layout pattern every subsequent catalogue mirrors. BeerXML `<HOP>` mapping incl. alpha_acid_percent, beta_acid_percent, type (bittering/aroma/dual), form (pellet/plug/leaf), use phase, year of harvest.

### PR #871 merged (`fc3ee5a`) — feat(mobile-app): wire Python beer-encyclopedia as fallback for /scan/lookup 404 + ADR-0005 backend split

- ADR-0005 (encyclopedia ⇆ product split) + ADR-0002 marked partially superseded.
- Mobile fallback: NestJS 404 OR 503 → `POST /beers/import-by-ean` on `env.encyclopediaUrl`.
- `http-client` learns `baseUrl` override; `env.ts` exposes `encyclopediaUrlIsConfigured` (Codex P1 fail-fast guard).
- Pre-merge review fixes in `a0bf1bc` (8 inline comments: 1 Codex P1 + 7 Copilot — interface vs type, ADR Postgres → SQLite ×2, source heuristic, rawPayload conditional, fetchedAt null, missing tests).
- Sonar coverage gate cleared in two passes (`f904177` + `8c8241f`): `beers-import.api.ts` + `http-client.ts` now 100%.
- +35 net new tests (647 → 682 green).
- Validated end-to-end on a physical device against 10 EANs (3 Goudale, 2 BACHO, Pelforth, original Goudale Ambrée, La Rousse Mont-Blanc, La Cros Cagnes-sur-Mer, À La Fut IPA).
- Spawned issues: #874 (mobile UX — orphan CTA on not-found), #875 (api — `AllExceptionsFilter` strips structured fields, regresses #800), #876 + #877 (encyclopedia — non-beer acceptance + empty `product_name`), #878 (epic — scan rate-limit + freemium tiering).

---

## 2026-05-02

### PR #847 merged (`5ad8b92`) — feat(beer-encyclopedia): Open Food Facts importer + POST /beers/import-by-ean

- New `importers/` package (`base.ExternalBeerSnapshot` + `openfoodfacts.OpenFoodFactsClient` + `persistence.upsert_beer_from_snapshot`), `Beer.ean_code` column + migration 004, `scripts/seed_sources.py`, ADR-0003.
- Pre-merge review fixes in `f4834b2` (10 inline review comments addressed).
- +38 tests (95 → 135 green).

### PR #848 merged (`7b14aa6`) — fix(beer-encyclopedia): DB-first lookup in POST /beers/import-by-ean

- Skip OFF when `Beer.ean_code` is in DB (warm path 14 ms vs 176 ms cold).
- Updated 200/201/404/503 OpenAPI descriptions in `2024221` (1 review comment).
- +2 tests (137 → 139 green).

### PR #860 merged (`1e4594d`) — chore(beer-encyclopedia): add scan-photos local folder for manual /scan testing

- gitignored photo dump under `packages/beer-encyclopedia/scan-photos/` + `README.md` + `findings.md`.
- EN translation fix in `15a5cce` (1 review comment).
- Surfaced the OCR bug fixed by #861.

### PR #861 merged (`ce78e6f`) — fix(beer-encyclopedia): use paragraph=False in EasyOCR readtext to surface dispersed label text

- `paragraph=True` returned `[]` on 9/9 real beer photos; `paragraph=False` parsed 10–13 fragments each.
- New `packages/beer-encyclopedia/tests/test_ml/test_ocr.py` (4 regression tests, both invariants pinned) + docstring clarifications in `221c9be` (3 review comments).
- 143/143 green.

### Backlog capture — 11 issues opened during the live demo + post-merge brainstorms

- OFF resilience: #850 (`/health/external` ping), #851 (in-memory TTL cache), #852 (HTTP 429 backoff).
- Strategy epics: #849 (AI-research importer + double validation), #853 (DB autonomy strategy parent).
- DB autonomy sub-issues: #854 (bulk OFF dump ingest), #855 (native catalog + search), #856 (EntitySource refresh policy ADR-0004), #857 (book ingestion pipeline).
- Mobile + ML: #858 (label-photo capture quality), #859 (CLIP + pgvector visual recognition fallback).

### Decision — Credit-economy currency named **Couronnes** (#862, child of #739)

- Visual-identity layer for the existing credit economy: monetary unit locked as **Couronnes** (brewing-pro term *capsule couronne* / *crown cap*). Origin: weekend brainstorm post-*Fallout*; reskinned with FR brewing vocabulary for unique brand identity (intentionally distant from Fallout's *caps*).
- Issue [#862](https://github.com/benoit-bremaud/brasse-bouillon/issues/862) tracks scope tiered v0.2 (logo SVG, "Mes Couronnes" balance widget, ledger UI, system copy) / v0.3 (gain/spend animations, decapsulation sound, marketing copy) / soutenance v0.1 teasing (1 vision slide + 1 natural demo mention).
- Round 3.6 cross-reference comment posted in epic [#739](https://github.com/benoit-bremaud/brasse-bouillon/issues/739#issuecomment-4364523284); mechanics from Round 3.5 (4 earning activities, 4 redemption tiers, anti-abuse, schema) unchanged.

---

## 2026-05-01

### PR #841 merged (`b39a1dc`) — feat(beer-encyclopedia): add French legal denomination reference

- Branch `feat/legal-reference-fr`. PR1 of a 3-step encyclopedia data-enrichment plan (PR2 = Open Food Facts EAN connector, PR3 = community-scan contribution loop). 9 files, +1082 LoC, 32 new tests (96/96 green).
- New `legal_denominations` reference table seeded with the 10 canonical denominations from decree 92-307 modified by 2016-1531; seeded by `scripts/seed_legal_denominations.py` (idempotent upsert calqued on `seed_styles.py`).
- Four nullable regulatory columns added on `beers`: `legal_denomination` (CHECK against the 10 codes, no FK), `country_of_origin` (ISO 3166-1 alpha-2, ORM auto-uppercase), `allergens` (JSONB on PG, JSON elsewhere), `alcohol_group` (SMALLINT in {1,3,4,5} per Code de la santé publique Art. L-3321-1, group 2 historically merged into 3). Migration 003 uses `batch_alter_table` for SQLite/PG compat.
- Guided an 8-round interactive, file-by-file pre-merge review with the user: surfaced 9 substantive corrections before commit (rename `label_fr`→`label`, drop `requires_pure_malt`, reorder the 10 codes in decree structure, enrich class docstring, add `isalpha()` to country validator, sync 4 sad-path tests, tighten 1169/2011 wording, fix `biere_a_ingredient` regulatory text "moût initial" not "produit fini").
- **Decisions**:
  - `Reference table over enum / FK / generic regulations table` — dedicated `legal_denominations` rejected three alternatives. Pure SQL enum cannot carry the per-row metadata (description, legal_reference, min_aging_days, max_alcohol_pct). FK rejected to keep the reference re-seedable. Generic `regulations` table rejected as premature generalisation. See ADR-0002 §Rejected alternatives.
  - `French snake_case codes` (`biere_de_garde`, `panache`, …) — preserved verbatim from the decree because no English equivalent carries the same legal meaning. Trade-off documented (opaque to non-FR API consumers); UI mobile is FR-only so the impact is contained.
  - `Defer scrapers (LastDodo, etc.) and YOLO dataset` — out of PR1 scope; legal/scraping audit + manual annotation effort make them v0.3 work, not blocking the encyclopedia data layer.

### PR #842 merged (`7113e82`) — fix(beer-encyclopedia): reject non-ASCII letters in country_of_origin validator

- Branch `fix/beer-encyclopedia-country-of-origin-ascii-only`. Same-day follow-up of #841 addressing the Copilot review comment that was missed pre-merge.
- `str.isalpha()` returns True for Latin-extended letters (`Å`, `Ñ`, …) so `country_of_origin="ÅB"` would have passed both ORM check (length=2, isalpha=True) and DB CHECK (length-only) and persisted invalid data. Added an `isascii()` guard alongside `isalpha()` plus a regression test (`test_beer_rejects_non_ascii_letter_country_code` covering `ÅB` and `ÑO`). Updated docstring + error message to surface the ASCII requirement. 96→97 green, lint clean.
- Process gap captured: the post-push Copilot review fetch was skipped before merging #841 (workflow checklist step 1 of memory `feedback_pr_workflow_checklist`). Reinforces the rule that `gh api .../reviews` must be checked even when the user signals merge — the user's "PR mergée !" doesn't replace the technical gate.

---

## 2026-04-30

### PR #819 merged (`3231af9`) — feat(scan): burst quick wins polish — progressive feedback, retry color, consent FR, import confirmation

- Closes 4 issues at once: #638 (`f453902` progressive 0/5 → 5/5 dots), #641 (`4c2419b` retry button color aligned with brand primary), #640 (`1a46a8f` consent snapshot rendered as readable French), #766 (`a483b39` pre-flight confirmation modal before community recipe import).
- Grouped burst branch with 4 focused commits, 15 new tests across `BarcodeVerificationProgress`, `ScanScreen`, `PendingScansScreen`, `BeerInfoCardScreen`. CI green, 598 mobile tests passing.
- Mid-review fix: PR body and FYI comment originally drafted in French — translated to English and a new memory `feedback_github_artifacts_english_only.md` added so the convention (chat = FR, GitHub artifacts = EN) is no longer ambiguous.

### PR #817 merged (`c508b07`) — chore(website): remove GA4 tracking + cookie consent banner (Chantier E.1)

- Branch `chore/website-remove-ga4-rgpd-banner`. First sub-task of the website refresh plan (Chantier E — tooling & non-conformities). Aligns with the strategy decision to ship the marketing site without analytics until post-store launch traffic justifies revisiting it.
- 3 commits squashed: `e0b130d` removed GA4 + cookie banner from `index.html` / `index-en.html`; `d108517` removed cookie banner CSS rules from `site.css` (preserved `.consent` / `.consent-note` for Formspree opt-in checkboxes); `4d4fa32` refreshed privacy/cookies/terms pages (FR + EN) to state explicitly "no tracking cookies, no third-party audience measurement tool".
- Net diff: 9 files changed, 64 insertions, 290 deletions.
- CI all green, SonarCloud Quality Gate passed (0 new issues, 0 hotspots, 0 % duplication). No human review required (chore PR, draft → ready conversion validated by author after Cloudflare Pages preview check). Copilot review skipped (quota off until 2026-05-01).
- **Decisions**:
  - `Analytics provider` — none for now. Replaces previous GA4 setup. Will revisit after store launch with privacy-friendly options (Plausible likely candidate). Rationale: pre-store traffic too low to justify analytics overhead, and removing the consent banner is an immediate UX win.
  - `Policy pages` — kept `cookies.html` / `cookies-en.html` (rewritten to explain the no-tracking stance) rather than deleting them; preserves SEO inbound links and clarifies the brand position.

### PR #815 merged (`0a5af5d`) — feat(seed): pre-seed Punk IPA brassin demo + 7 brewing-day steps (#782)

- Closes #782. Migration adds 7 nullable columns to `batches`; idempotent seed loader inserts batch row + 7 BatchStep rows. Output of the 8-axis Brassins data model Q&A scoping session 2026-04-30; deferred richness captured in 7 backlog epics: #808 #809 #810 #811 #812 #813 #814.
- Codex P1 fix (commit `879a703`): widened batch window 14d → 21d so all step offsets fit inside [started_at, completed_at] + regression-guard test.
- SonarCloud duplication chase: 4 refactor commits (`e0e4302` `85cd539` `4e00a2f` `a291b86`) — extracted `seed-test-utils.ts` (RepoMock helpers), `seed-utils.ts` (`idempotentUpsertById<T>` generic), runSeed local helper, COLUMNS-array iteration in migration. 4.3% → 0.0% duplication on new code.

### PR #806 merged (`11931fc`) — chore(mocks): sync mobile demoScanCatalog with API seed (4→9 beers, #804)

- Closes #804. Ports the 5 missing entries (Karmeliet Tripel, Westmalle Tripel, Duvel, Heineken, Cervoise Lancelot) to `demoScanCatalog`. Field values mirror the API seed verbatim. Heineken correctly tagged `fermentationType: 'lager'`.
- Self-audit during merge prep flagged that **3 EAN-13 barcodes (Karmeliet, Westmalle, Duvel) fail the standard mod-10 checksum AND are not in OpenFoodFacts** — captured as #807 (demo-blocker, milestone alpha3) for physical bottle verification before the soutenance blanche on 2026-05-06.
- Test guard added on Karmeliet in `DemoOverrideMenu.test.tsx` as a regression guard against future drift.

---

## 2026-04-29

### PR #805 merged (`f9215f5`) — feat(scan): hidden long-press demo override menu — soutenance safety net (#642)

- Sprint B chunk for #642. New `DemoOverrideMenu` modal accessible via 1.5s long-press on the help button in the scan screen header. Lists seeded beers, tap forces the result on the chosen beer (navigates to BeerInfoCardScreen). Hidden gesture, no env-var gating.
- Codex P1 fix (commit `e5d5745`): React Native fires `onPress` on release after `onLongPress` triggers, opening the guide modal behind the override sheet. Fixed with a `useRef` flag that consumes the trailing onPress. Caught before merge — would have been catastrophic on stage.
- SonarCloud Quality Gate fix (same commit): 4 integration tests added on ScanScreen long-press behaviour to push coverage above the 80% threshold.
- Companion follow-up #804 captured: mobile `demoScanCatalog` (4 beers) drifted from API seed (9 beers) since PR #791. Override menu surfaces 4 entries until #804 lands.

### PR #802 merged (`86c36b9`) — docs(soutenance): demo script 90s + 4 jury variants + screencast spec + jury email (#702)

- Sprint B chunk #7 of Scan Tranche 2. New `docs/product/soutenance/demo-script-2026-05-27.md` covers the writable portion of #702: 90s script (5 phases, FR speaker lines), 4 jury-beer adaptive variants (A/B/C/D) aligned with shipped PRs #799/#800/#801, screencast backup spec, jury request email draft (FR, deadline 2026-05-17), rehearsal log scaffolding.
- Codex P2 fix (commit `cda1466`): J-X countdown labels were inconsistent with the project-wide "J-X from defense" semantics. Fixed + added explicit convention note in the header. Bonus: markdownlint inline-HTML warning on `<productName>` placeholder corrected in the same pass.
- Remaining on #702: the actual screencast MP4 recording (week of 2026-05-20, J-7 from defense, post-rc1 feature freeze).

### PR #801 merged (`f50e599`) — feat(scan): photo fallback CTA on invalid barcode — placeholder for v0.2 photo capture (#797)

- Sub-PR 3/3 of [Epic] #794 (closes the umbrella). Mobile-only: `PhotoFallbackCTA` rendered on `invalid` variant + `Alert.alert` referencing v0.2 / epic #751. Self-reviewed (no Codex review available before merge — see PR #801 thread).
- Sprint A scan jury edge cases B+D+C complete: scan flow now demo-ready on happy + sad + edge paths.

### PR #800 merged (`8cacaf0`) — feat(scan): not-a-beer detection — filter OFF by category + dedicated UI (#798)

- Sub-PR 2/3 of [Epic] #794. Backend `NotABeerException` (UnprocessableEntityException 422) + scan service split (`!found` 404 vs `!isBeer` 422) + mobile UI: "Tu as scanné « X » — ce n'est pas une bière" + back-CTA.
- Codex P1 fix (commit `8058902`): the global `HttpExceptionFilter` was stripping custom exception fields, so the mobile 422 → typed-error mapping never matched in production. Filter now spreads non-reserved fields from object exception responses; reserved keys (statusCode/error/timestamp/path) cannot be spoofed. New `http-exception.filter.spec.ts` (6 tests).

### PR #799 merged (`a984cf6`) — feat(scan): graceful UX for unknown beer — surface barcode + mailto CTAs (#796)

- Sub-PR 1/3 of [Epic] #794 (scan jury edge cases B/D/C). Order locked B → D → C in scoping session 2026-04-29.
- Companion issues created same session: epic #794 + #796 (B) + #797 (C) + #798 (D) + backlog idea #795 (multi-product range — wine/cider, v0.2+).

### PR #793 merged (`7266559`) — feat(scan): mobile matching view — official section + equivalents + low_confidence (#700)

- Closes #700.
- Fix commits on top of feature: `0cdcaab` (CI test timing flake on `BeerInfoCardScreen` matching section — `getByText` → `await findByText`), `d8f4bd8` (Codex P2: surface `low_confidence` warning outside the `equivalentRecipes.length > 0` conditional + edge-case test for official-only result), `6eeddf9` (Prettier).

### PR #792 merged (`ab99d1f`) — feat(scan): full matching algorithm — bitterness + color + brew_count + recency + low_confidence (#699)

- Extends PR #773 MVP to the full 7-component formula (similarity = style/ABV/bitterness/color, quality = avg_rating/brew_count/recency, weight renormalization on missing components).
- Codex P1 fix: `low_confidence` uses honest similarity score (without the `is_official` shortcut) so the warning surfaces even when an official recipe tops the list with low real similarity.

### PR #791 merged (`cf8f688`) — feat(scan): complete demo seed to 9 beers — Heineken + Cervoise Lancelot (Topic B)

- Codex P1 fix: Cervoise Lancelot EAN-13 check digit corrected (`3760215750048` → `3760215750042`, mod-10 algorithm).

### PR #790 merged (`c64805f`) — feat(auth): Sprint A polish — simplified signup (#764) + Google cosmetic button (#765) + bigger mascot

- Closes #764, closes #765.
- Codex P2 fix: username fallback truncation — switched to `randomBytes(4).toString('hex')` 8-hex suffix that never gets sliced.

### PR #788 merged (`08c4411`) — docs(product): consolidate v0.1 roadmap from J-29 sprint scoping + personas v3

- See the rich "PR #788 opened" entry under 2026-04-28 below for the full scoping narrative + decisions block.
- Companion sub-issues opened the same day: #774, #775, #776, #777, #778, #779, #780, #781, #782, #783, #784, #785, #786, #787.

---

## 2026-04-28

### PR #773 merged (`5c572de`) — feat(scan): score-based recipe matching MVP — style + ABV + avg_rating (#699)

- Minimal viable algorithm — style 50% + ABV 25% similarity, avg_rating 60% quality, `is_official` shortcut. Superseded the next day by PR #792 (full 7-component formula).

### PR #770 merged (`13c1553`) — chore(log): record PR #768 in PROJECT_LOG.md.

### PR #769 merged (`e83fb78`) — chore(main): release-please app libraries train.

### PR #788 opened — docs(product): consolidate v0.1 roadmap from J-29 sprint scoping session + personas v3

Branch `docs/sprint-scoping-2026-04-28`. Captures the outcome of a
multi-hour structured Q&A scoping session held on the J-29 marker
day before the soutenance finale. Nine topics were debated
sequentially with atomic Yes/No/Plus de détails/Débattons questions
and grounded recommendations referencing the 2026-04-24 brainstorms
(scan, onboarding, compte-parametres, recipe-schema-audit) and the
v2 personas document. ~50 atomic decisions arbitrated.

Scope of the PR:

- New canonical roadmap document
  `docs/product/roadmap-v0.1-consolidated.md` — single source of
  truth for v0.1 scope across 9 topic groups (Auth, Scan flow,
  Brassins, Drêches, Liste de courses, Export & Inventory, Recipe
  Catalog, Académie, Vocabulary, Channels & share, Polish & Nav)
  + sprint-by-sprint sequencing (Sprints A→F across J-29 → J-1)
  + deferred v0.2 features list + cross-cutting meta-decisions
  (vocabulary hybrid, normalized SRM/EBC colors, BrewDog DIY Dog
  inspiration) + identified risks (effort tension at 109h vs
  100-120h available, demo mode vs backend, soutenance blanche
  J-21 readiness).
- `docs/personas/user_personas.md` updated to v3 to align — most
  notably **Brassins promoted v0.2 → v0.1 demo** per Topic #1
  decision (Brassins included in 90s → 120s demo script, onglet
  visible). All 5 personas now have a concrete v0.1 incarnation
  via newly-scoped features.

Companion sub-issues created from the same session (referenced
from the roadmap):

- **#774** [Epic] Inventory management (v0.2 + tease in pitch)
- **#775** Beer mug loader animation (v0.2+ branding)
- **#776** Drêches valorization 6th section "Aller plus loin"
- **#777** Smart shopping list (checklist + share + drêches tease)
- **#778** Export BeerXML 1.0 (industry standard for persona Marc)
- **#779** Recipe Catalog mini (sub-screen Mon Carnet)
- **#780** Seed 25 BrewDog DIY Dog recipes curated
- **#781** Brewing assistance enrichie (9 phases + countdown timers
  + tips pédagogiques)
- **#782** Pre-seed Punk IPA brassin demo (BrewDog DIY Dog values)
- **#783** Académie glossary tooltip + auto-link inline
- **#784** Hybrid display (qualitative + numeric vocabulary)
- **#785** vocab-mapping.md canonical doc
- **#786** Native share recipe + brewing hashtags
- **#787** [Epic] Brewing calculators audit (v0.2)

Existing issues commented with refined scope: #595, #600, #605,
#606, #607 (deferred v0.2), #608, #613, #616, #629, #644, #646,
#766.

Decisions:

- `Sprint scoping methodology — atomic Q&A with grounded
  recommendations` — hardened on this session via memory updates
  (`feedback_question_format_french` v2 with explicit recommendation
  rule and granularity range, `feedback_recadrage_clarity`,
  `feedback_brewing_pro_vocab`, `feedback_normalized_colors`).
- `Brassins promoted to v0.1 demo` — overrides personas v2 doc
  which had it at v0.2. Rationale: B-08 audit (2026-04-23) flagged
  Brassins as CRITICAL one day before personas v2 was written;
  the personas doc inherited a stale triage. The 90s demo script is
  extended to 120s to include the Brassins beat with the pre-seeded
  Punk IPA brassin (#782) showcasing the BrewDog-style 9-phase
  brewing assistance (#781).
- `Inventory management deferred v0.2 + teased in pitch` — the
  feature is rich (~10-15h) and would push the v0.1 effort above
  the 120h ceiling. Capturing the epic now (#774) preserves the
  idea and provides material for the soutenance "Perspective" slide
  (20pts in the Jeune Pousse grading rubric).
- `Recipe Catalog mini as a sub-screen of Mon Carnet, not a top-level
  tab` — keeps the bottom nav lean (already under refonte via #613)
  and aligns with the narrative "Mon Carnet vide → je l'enrichis
  via le catalogue".
- `BrewDog DIY Dog as primary curated catalog source` — its
  open-source status, recognized brewing standards (BJCP-aligned
  styles, complete grain bills, hop schedules, fermentation
  profiles) and editorial richness (Brewer's Tip per recipe) make
  it the natural pillar of the v0.1 Recipe Catalog. AHA, BJCP
  guidelines, Brewer's Friend deferred v0.2 to keep the parsing
  effort bounded.
- `Hybrid vocabulary display everywhere` — "Amertume marquée · 40
  IBU" / "Couleur ambrée · EBC 18" / "ABV 5.6% (modéré)" — no
  toggle, no onboarding step. Cohabite Léa (mots familiers en
  premier) and Marc (chiffres immédiatement visibles) without user
  arbitrage. Doc canonique #785 lock the qualitative ↔ numerical
  ranges.

External communication:

- FYI notification on PR #788 mentioning @Smith06S, @Thais9723,
  @Fabien-Ori, @vitalikevin (in English per
  `feedback_pr_notification_comment` rule hardened earlier today).

Awaiting CI + Codex + user merge.

### PR #768 merged (`f2890cc`) — feat(scan): seed 10 curated public recipes + dual-id helper for community import (Issue #701)

Branch `feat/curated-public-recipes-issue-701`. Closes the
backend-mode community-import sad path: the mobile
`BeerInfoCardScreen` "Recettes équivalentes" rows now resolve
against real `PUBLIC` rows when `EXPO_PUBLIC_USE_DEMO_DATA=false`,
instead of returning 404 from `POST /recipes/import-from-community/:id`.

Scope (monorepo, both packages):

- **API** `packages/api/src/database/seeds/system-user.seed.ts` —
  new sentinel non-loginable account (`SYSTEM_USER_ID =
  00000000-0000-4000-8000-000000000000`, email `system@brasse-bouillon.local`,
  username `system`, `is_active=false`, role `admin`). Owns all
  curated public content — required because `recipes.owner_id`
  carries an FK to `users(id)`.
- **API** `packages/api/src/database/seeds/public-recipes.seed.ts` —
  10 curated PUBLIC recipes, deterministic UUIDs
  `00000000-0000-4000-8000-00000000000{1..a}`, three styles per demo
  bottle (IPA / Belgian / Strong Dark / Lager). Idempotent loader
  (insert-or-update on id). `is_official=true`,
  `imported_from_recipe_id=null`, `import_provenance=null`.
- **API** `packages/api/scripts/run-public-recipes-seed.ts` — CLI
  orchestrator: system user first, then public recipes.
- **Mobile** `scan.types.ts` — new optional `publicRecipeId?: string`
  on `ScanRecipeMatch`.
- **Mobile** `recipes.use-cases.ts` — new `getImportSourceId(match)`
  helper. In demo mode returns `match.recipeId` (resolves against
  `demoRecipes`); in backend mode returns
  `match.publicRecipeId ?? match.recipeId` (so the API receives the
  real PUBLIC UUID).
- **Mobile** `demo-data.ts` — 12 `demoEquivalentRecipes` entries get
  the new `publicRecipeId` field wired to the seeded UUIDs.
- **Mobile** `BeerInfoCardScreen.tsx` — uses `getImportSourceId(recipe)`
  instead of `recipe.recipeId`.
- **Tests** — 24 new (24 / 24 green): 9 system-user, 8 public-recipes,
  5 `getImportSourceId`, 2 screen-level. Full backend + mobile suites
  stay green.

Review cycle (3 rounds):

- Round 1 (`86f6dc0`) — Codex P2: payload duplication between insert
  and update branches in `public-recipes.seed.ts`. Addressed by
  extracting a shared `payload` const used by both branches.
- Round 2 (`47c4025`) — SonarCloud Quality Gate failure: Math.random
  usage flagged as security hotspot, 5.5% code duplication. Switched
  password generation to `crypto.randomBytes(32)` (cryptographic
  randomness) and confirmed the duplication fix held.
- Round 3 (`0bdf058`) — Codex P2: `seedSystemUser` only checked
  existence by `id`, but `users.email` and `users.username` are
  UNIQUE. A row squatting either reserved value would crash the
  orchestrator on a non-empty DB. Fix: extended `findOne` to OR on
  id + email + username; collision under a different id throws a
  clear error rather than silently rewriting the squatting row.

Decisions:

- `Sentinel system user, not a fake admin` — chose a dedicated
  `SYSTEM_USER_ID` with a random unguessable bcrypt hash and
  `is_active=false` over reusing the developer admin account, so the
  curated content owner can never be impersonated and stays distinct
  in audit queries.
- `Throw on credential squat, do not silently rewrite` — when a real
  user occupies the reserved system email/username, the seed refuses
  loudly. Rationale: silently aligning their row to system metadata
  would be data loss; refusing surfaces the conflict so a human can
  reconcile before the FK from public recipes blows up downstream.
- `Helper-in-use-case for the dual-id resolution` — `getImportSourceId`
  lives in `recipes.use-cases.ts`, not the screen. Keeps
  presentation agnostic of the demo/backend toggle and reuses the
  established `dataSource.useDemoData` branching pattern.

---

## 2026-04-27

### PR opened — Mobile UI: import community recipe (Issue #601)

Branch `feat/mobile-recipe-import-issue-601`. Mobile-side closing of
the demo-hero scan loop, paired with the just-merged backend PR #742.
The user can now scan a beer, see the curated equivalent recipes, and
import one into their own catalog with a single tap — landing on the
new recipe's detail page.

Scope (mobile only):

- **Data layer** `recipes.api.ts` — new
  `importFromCommunity(sourceId): Promise<Recipe>` calling
  `POST /recipes/import-from-community/:id`.
- **Use-case** `recipes.use-cases.ts` — new
  `importRecipeFromCommunity(sourceId)` with the standard
  `dataSource.useDemoData` branch:
  - demo: returns the source recipe id + name from `demoRecipes`
    (lets the UI navigate to a resolvable detail page when no real
    backend is wired);
  - backend: delegates to the API, returns the new recipe id + name
    from the response.
- **Screen** `BeerInfoCardScreen.tsx` — `EquivalentRecipesSection`
  rewritten:
  - per-row "+ Importer" CTA replaces the previous "tap to navigate
    to source" affordance;
  - `importingId` local state drives `disabled` + `accessibilityState
    busy/disabled` + a "Import…" label during the round-trip;
  - `Alert.alert` success modal with "Voir la recette" action →
    `router.push('/(app)/recipes/{newId}')`;
  - `Alert.alert` failure modal with retry-friendly French copy.
- **Tests** — 5 added across 2 suites:
  - 3 use-case unit tests in
    `__tests__/import-recipe.test.ts` (happy demo, sad demo, happy
    backend with API delegation assertion);
  - 2 screen tests in `BeerInfoCardScreen.test.tsx` `import community
    recipe` block (happy: import called + alert posted + nav on
    "Voir la recette"; sad: rejected import → error alert + no nav).
- Full mobile suite stays green: 531 / 58 (was 526 / 57).

Decisions:

- Tap on the row IS the import action (vs. a dedicated icon-button
  to the right) — keeps the layout dense, makes the demo flow a
  single tap, and matches the persona of a curious brewer who already
  trusts the curated list.
- Source id translation lives in the use-case (not the screen) —
  keeps the screen agnostic of demo / backend mode and follows the
  data-source toggle convention.
- Provenance display (the `import_provenance` text written by the
  backend) is intentionally NOT surfaced on the recipe detail screen
  yet — the recipe detail refonte (4 tabs) ships that surface
  later, this PR keeps the mobile layer minimal and demo-functional.

Follows up: backend-mode integration with real public recipe IDs
(curated public seed + #700 swap) before the soutenance demo. Until
then, real-backend mode requires the demo recipe IDs to exist in the
DB; demo mode works end-to-end on day 1.

### PR opened — Backend import-from-community endpoint (Issue #601)

Branch `feat/recipes-import-from-community-issue-601`. Closes the
demo-hero scan loop on the backend side: when a user picks a community
recipe from the BeerInfoCardScreen `Recettes équivalentes` section, the
mobile UI (separate PR) will call the new endpoint to copy that recipe
into the user's private catalog with full provenance.

Scope (backend only):

- **Migration** `1779000000000-AddRecipeImportProvenanceFields.ts` —
  adds two nullable columns to `recipes`:
  - `imported_from_recipe_id` (varchar(36), indexed) — FK pointer to
    the source recipe for audit
  - `import_provenance` (text) — French human-readable string
    surfaced in the UI ("Importée de Punk IPA Clone le 2026-04-27")
- **Entity** `recipe.orm.entity.ts` — 2 new columns + 1 index
  (`imported_from_recipe_id`)
- **DTO** `recipe.dto.ts` — exposes the 2 fields with explanatory
  ApiPropertyOptional descriptions
- **Service** `recipe.service.ts` — new `importFromCommunity(userId,
  sourceId)` method:
  - Refuses PRIVATE source (ForbiddenException) — only PUBLIC and
    UNLISTED are importable
  - Refuses unknown sourceId (NotFoundException)
  - Generates new UUID, owns recipe to current user, sets visibility
    PRIVATE, version 1, root_recipe_id = own id, parent_recipe_id =
    null, brew_count = 0, avg_rating = null, last_brewed_at = null
  - Deep-copies the 6 satellite tables (steps, hops, fermentables,
    yeasts, additives, water) with new FKs
  - Wraps the whole flow in a single transaction
- **Controller** `recipe.controller.ts` — new route
  `POST /recipes/import-from-community/:id` guarded by
  `@JwtAuthGuard`, with Swagger annotations covering 201/404/403.

Tests:

- 9 new service tests (`recipe-import.service.spec.ts`) covering
  happy / sad / edge:
  - PUBLIC source → success with right ownership / visibility / provenance
  - UNLISTED source → also accepted
  - Resets community-tracking fields on the new recipe
  - Copies recipe metrics (batch volume, OG, IBU…)
  - PRIVATE source → ForbiddenException
  - Unknown id → NotFoundException
  - Steps deep-copied with new recipe_id
  - Hops deep-copied with new ids and recipe_id
  - Source with no satellites → empty target
- 2 new controller tests covering route → service contract +
  NotFoundException propagation
- Full backend suite stays green: 312 / 41 suites (1 skipped).

Decisions:

- Visibility check at service layer (not DTO) — keeps the policy
  testable in isolation and centralised regardless of caller.
- New recipe is its own root (no lineage to source via
  `root_recipe_id`/`parent_recipe_id`) — those keep their natural
  meaning for user-driven forks. The import relationship lives
  exclusively in the new `imported_from_recipe_id` column.
- Provenance string format: `Importée de "<source.name>" le
  YYYY-MM-DD`. Simple, French, machine-readable date for log filters.

Mobile half ships in a separate PR (next step in the J-30 roadmap).

### PR opened — Polish batch on BeerInfoCardScreen (closes #734 #735 #736 #737)

Branch `fix/scan-info-card-polish-batch`. Cosmetic + demo-blocker fixes
captured during the same-day sanity-check session on PR #732 (just-merged
mobile UI info card). Four issues closed in one batch:

- **#734** (demo-blocker) — `<meta name="color-scheme" content="light">`
  added to `app/+html.tsx`, plus the `prefers-color-scheme: dark` body
  override removed. Browsers with auto-dark-mode (Chrome flag, OS dark
  theme) no longer desaturate the EBC-driven hero colors. Confirmed via
  F12 inspect during the sanity-check that the DOM receives the right
  hex codes; the issue was purely the rendering layer auto-inverting
  light backgrounds. `app.json` `userInterfaceStyle` left as
  `automatic` for now (separate concern for native iOS/Android dark
  mode handling).
- **#735** — at-a-glance Style cell now allows 3 lines + auto-shrinks
  font (`adjustsFontSizeToFit` + `minimumFontScale=0.85`). Long beer
  styles like "Belgian Strong Pale Ale" no longer truncate.
- **#736** — at-a-glance value text honors word boundaries. Cell value
  style adds `wordBreak: keep-all` + `overflowWrap: break-word` on web
  via `Platform.OS === 'web'` guard (RN core types don't expose these
  properties; cast through `as object`). "Légèrement amère" no longer
  breaks mid-word as "Légèreme | nt amère".
- **#737** — ScrollView `paddingBottom` raised from `spacing.xxl` (40px)
  to `spacing.xxl * 3` (~120px) so the last fold's content
  ("Histoire de la brasserie") clears the bottom tab bar.

Side observation captured during the sanity-check: the dark-mode
auto-invert that triggered finding A1 ("hero olive-green") was a false
positive on the code (F12 confirmed `rgb(213, 181, 33)` reaching the
DOM correctly for Punk IPA EBC 14). #734 is the architectural fix that
ensures all future browsers render the EBC palette faithfully.

Tests: full mobile suite still 527/527 — no new tests added (visual
fixes only, existing tests cover behavior).

Skipped from this batch: **#733** (SRM palette consolidation between
calculator and lookup-color). The palette refactor would shift the
visual rendering of beer hero colors; user explicitly opted to keep
the current visuals as-is for soutenance. #733 stays open in the
backlog for post-soutenance.

### PR #732 opened — Mobile UI: beer info card with hero + lazy folds (Issue #698)

Branch `feat/mobile-scan-info-card-issue-698`. Third link of the
demo-hero scan chain (after #696 backend / #697 data layer): the
"Beer recognised" screen the user lands on after a successful
barcode scan, and the first thing the jury will see during the
2026-05-27 soutenance demo.

Scope:

- **EBC-driven hero** — `BeerHero` renders a coloured hero whose
  background is computed from the beer's `colorEbc` value (palette
  mirrors the Couleur calculator's reference table). Punk IPA shows
  amber-orange, Rochefort 10 deep brown, La Chouffe pale amber —
  same data drives both the visual identity and the "Couleur" word
  in the at-a-glance row.
- **At-a-glance card in WORDS not numbers** — per persona Léa la
  Curieuse: ABV exact (`5.4 %`) + strength word
  ("De session" / "Standard" / "Forte"…) + style / colour
  ("Ambrée") / bitterness ("Modérément amère") in plain French.
  Numbers stay available in the "Détails techniques" fold.
- **Lazy folds (GoF Lazy Initialization)** — `Collapsible` accepts
  a `renderContent: () => ReactNode` factory called only on first
  open. Today the fold content is already in memory (technical
  details + curated brewery story); tomorrow when a brewery-story
  endpoint or richer data ships, the same component swaps to a
  network-lazy `useQuery` without changing the consumer.
- **Demo-flow completeness** — to make the soutenance scan demo
  testable end-to-end on day 1 (oral blanc J-9), three demo
  equivalent recipes + three brewery stories are hardcoded in
  `mocks/demo-data.ts` for the canonical demo beers (Punk IPA,
  La Chouffe, Rochefort 10). Same shape as the future #699 API
  output — when the matching backend ships, the data source swaps
  without UI changes.
- **Wiring** — `ScanScreen.handleAnalyzeBarcode` now navigates
  directly to `/(app)/dashboard/scan/lookup/{barcode}` when a
  barcode is confirmed (5/5), bypassing the legacy
  `processScanAttempt` / label-match flow for that path. Bottle
  mode (no barcode) keeps the legacy flow.
- **Tests** — 32 new unit / integration tests across 5 suites
  (formatters 41 cases, color utility 11, Collapsible 6, BeerHero
  3, BeerInfoCardScreen 12). Covers happy / sad / edge per
  convention plus lazy-render assertions, error states,
  accessibility states.

Decisions:

- `BreweryStory` / `EquivalentRecipes` / `TechnicalDetails`
  rendered as components within the screen file rather than
  separate files. Keeps the screen self-contained until clear
  reuse emerges (none in sight today).
- `Collapsible` lives in `features/scan/presentation/components/`
  rather than `core/ui/`. Moved to `core/` later when a second
  feature needs it. Premature promotion is a frequent
  over-engineering trap.
- `getDemoEquivalentRecipes` and `getDemoBreweryStory` helpers
  ship from `mocks/demo-data.ts` rather than each feature's
  application layer. Per the existing `dataSource.useDemoData`
  convention — demo helpers live in mocks/, application layer
  stays clean.
- Unused legacy import `processScanAttempt` left in
  `ScanScreen.tsx` (used by bottle mode handlers) — not removed
  to keep the wiring change minimal per the user's decision on
  Q4 (Option A — minimum nav change).

Follow-ups (out of scope for this PR):

- Real recipe matching (#699) — replaces `getDemoEquivalentRecipes`
- Real brewery story endpoint — replaces `getDemoBreweryStory`
- Network-lazy folds (`renderContent` swaps to `useQuery`)
- Real beer photo on the hero (when backend ships `photoUrl`)

### PR #731 merged (`e2e04d7`) — Mobile data layer for `/scan/lookup` (Issue #697)

Mobile counterpart of backend PR #729. Closes the data path from the
scan UI down to the new `GET /scan/lookup/:ean` endpoint while keeping
the demo flow working offline. Branch
`feat/mobile-scan-lookup-data-layer-issue-697`. Ships 7 files / 746
insertions across the 3 Clean Architecture layers + tests.

Scope:

- **Domain** — `ScanCatalogItem`, `ScanLookupResult`, `ScanLookupSource`,
  `ScanCatalogItemOrigin` added to `scan.types.ts` (camelCase domain
  shape).
- **Data** — `scan-lookup.api.ts` calls the endpoint via the shared
  `http-client`, maps snake_case DTO -> camelCase, URL-encodes the EAN
  against path-traversal.
- **Application** — `lookupBeerByBarcode` use-case: normalises barcode
  (trim + strip non-digits), validates length against the backend
  contract (`^\d{8,14}$`), branches on `dataSource.useDemoData` to
  serve the on-device `demoScanCatalog` (Punk IPA, La Chouffe,
  Rochefort 10), maps `HttpError 404 -> ScanLookupBeerNotFoundError`
  and `503 -> ScanLookupServiceUnavailableError`, otherwise re-throws.
- **Tests** — 22 new unit tests (5 data layer + 17 use-case layer),
  full mobile suite at 443 passed / 52 suites.

Review cycle:

- 2 inline comments on the initial commit (`5934f06`):
  - **Codex P2** — validate barcode length before lookup. Implemented
    via `BARCODE_MIN_LENGTH = 8` / `BARCODE_MAX_LENGTH = 14` constants
    mirroring `ScanDomainService.validateBarcode`. 4 new boundary
    tests added. Avoids a useless network round-trip on malformed
    input.
  - **Copilot Should Have** — `buildDemoScanCatalogItem` defaulted
    `is*Estimated` flags to `true` and `notesSource` to a generic
    string even when explicit values were provided, diverging from
    the backend seed convention. Defaults now derive from value
    presence (`overrides.is*Estimated ?? overrides.<value> == null`),
    `notesSource` defaults to `null`, and La Chouffe + Rochefort 10
    entries got per-item `notesSource` strings tied to real upstream
    documentation.
- Both fixes shipped in `5cb4353`. End-of-review summary posted in
  French. User merged manually from GitHub UI.

Side fix bundled in this PR — the unanchored `data/` rule in
`.gitignore` (intended for the API SQLite folder) was silently
ignoring the mobile Clean Architecture `data/` layer folder, so any
new file under `packages/mobile-app/src/features/<feature>/data/`
would never be picked up by `git add`. Anchored to
`/packages/api/data/` — backend behaviour unchanged.

Decisions:

- `scan-lookup.api.ts` ships with the single backend method name
  (`lookupBeerByBarcode`) instead of the spec's `getBeerByBarcode` +
  `getRecipesForBeer` split. Reason: the backend (#696/#729) ships a
  single `GET /scan/lookup/:ean` endpoint; the recipe-matching half
  is the separate vertical owned by #699. Function name mirrors the
  backend method 1:1.
- New domain types appended to `scan.types.ts` rather than split into
  a dedicated `beer-data.types.ts` per spec — keeps a single domain
  file per feature (existing convention) and no reviewer pushed back.
- Error classes co-located with the use-case they're thrown from
  rather than extracted to `domain/errors.ts`. Same rationale.

Infra hiccup — first CI run on the PR died at runner-pickup
(`billable.UBUNTU.total_ms = 0`, no steps executed) across all
workflow files. Diagnosis: GitHub Actions monthly quota (3,000 min on
GitHub Pro) exhausted on 2026-04-27 with reset 4 days away,
unacceptable on the J-30 demo path. User added a $5 monthly Actions
budget on the personal account (with `Stop usage when budget is
reached` enabled — hard cap, no risk of overrun). Empty commit
`670862c` re-triggered the workflows, all 5 checks (changes,
mobile-app, security-audit, SonarCloud Scan, SonarCloud Code
Analysis) passed first try after the unblock. Migration of the repo
to the StudioB22 organization (which has a separate untouched 3,000
min quota) was considered but deferred to post-soutenance — too risky
during the demo sprint (SonarCloud reconfig, secrets, project
re-link).

Next link in the demo-hero scan chain: **#698** — mobile UI info
card. Wires the use-case shipped here into the scan flow's "Beer
recognised" presentation step. Followed by #699 (recipe match), #700
(matching UI), #601 (import to Mes Recettes).

---

## 2026-04-24

### PR #715 merged (`600b6e2`) — Onboarding & auth brainstorm

Consolidation of a 90-minute Q&A session with the product owner on the
Onboarding journey (Tier 1 demo-essential). Branch
`docs/onboarding-brainstorm-2026-04-24`. Ships as a 354-line doc
`docs/product/brainstorms/onboarding-2026-04-24.md` following the same
structure as the 3 previous brainstorms (scan, compte, recipe-schema
audit).

Key decisions frozen (20 total):

- **Three values of an account** — persist user-owned data + sync
  multi-device + participate in community (all three in scope, not
  just one).
- **Hybrid gating** — app is usable in guest mode; login wall appears
  only at realised-value actions (import, rate, publish).
- **Data locality principle** — local-first for the brewing assistant
  critical path (Mes Brassins + dependencies), cloud-first with HTTP
  cache for everything else. Derived from a 4-level criticality
  framework applied to 15 user journeys and 11 brewing phases.
- **Signup philosophy** — progressive mix: minimal email+password (or
  Google OAuth) + skippable onboarding (display name, avatar,
  experience level, preferred styles, unit system).
- **OAuth + password rule** — simplified v0.1: one account per email,
  providers stored as an array, manual add-provider from Settings, no
  auto-merge until v0.2 (requires solid email verification first).
- **Session** — 30-day refresh token via `expo-secure-store` with
  silent refresh.
- **Scan auth pattern β Hybrid** — validated by 8/8 MUST HAVEs,
  derived mechanically from the constraint matrix (α Full gated scores
  2/8, γ Fully open scores 7/8).

Review cycle — 1 round: Codex (1 P2 comment) + Copilot (4 comments).
All 5 valid, all fixed in `235c6a0`:

- Phase numbering reconciled (3 phases locked → UX becomes Phase 4,
  Stack Phase 5, Implementation Phase 6).
- 2 agent-memory file references dropped and inlined (they live
  outside the repo, readers could not resolve them).
- `#694` mis-mapping corrected to `#611` (the actual navigation-unify
  epic; `#694` is the merged B-70 About footer PR).

Impacts 11 existing backlog items and opens 3 new follow-ups for a
future session (guest session storage + migration, dual route
conventions for auth-protected vs anonymous endpoints, formal ADR on
the data locality principle).

- **Decisions**:
  - `hybrid data locality principle` — the brewing assistant must
    function 100% offline for 5-6 continuous hours (phases 2-6 of the
    brew day), every other journey is cloud-first. This is the
    architectural rule that shapes every upcoming technical choice.
  - `scan stays guest-friendly` — chosen mechanically via 8/8 MUST
    HAVEs, not by preference; the pattern satisfies the demo wow
    effect without compromising identity-required journeys.

### PR #714 merged (`96f2f5c`) — Project log entry for PR #712 + Epic #713

Small follow-up PR that adds the `PROJECT_LOG.md` entries for today's
merge of PR #712 (recipe schema audit) and for the new Epic #713
(unit conversion). Branch `chore/project-log-2026-04-24-pr712`.

Review cycle — 1 round: Copilot flagged that the log wording said
"13 nullable columns" while the audit actually declares the `source`
column as `VARCHAR(20) NOT NULL DEFAULT 'user_authored'`. Fixed in
`f22d1e7` by splitting the claim into "13 columns (12 nullable +
required `source`)" so the log entry stays factually aligned with the
audit document.

### PR #712 merged (`499f91c`) — Recipe schema audit (Epic #708 Phase 1)

Phase 1 of Epic #708 ships as docs-only — a 383-line gap analysis
between the current Brasse-Bouillon schema (Python encyclopedia + NestJS
api) and the fields a DIY DOG recipe requires. Reference material:
BrewDog DIY DOG 2019 v8 (4 recipes sampled: Punk IPA V1/V2, Santa Paws,
AB:09).

Key takeaways frozen in the audit:

- NestJS recipe domain is ~90% ready (7 Recipe entities already cover
  header / fermentables / hops / yeasts / water / additives / steps).
- 13 columns to add on `recipes` for this epic (12 nullable + required
  `source VARCHAR(20) NOT NULL DEFAULT 'user_authored'` with CHECK),
  1 on `recipe_hops` (`attribute`), 1 on `recipe_steps` (`duration_min`,
  surfaced as a real gap by Copilot).
- 4 quality columns (`avg_rating`, `brew_count`, `last_brewed_at`,
  `is_official`) explicitly kept out of scope — routed to Epic #693
  part 2/n.

Review cycle — 2 rounds: Codex P2 (1 comment, fixed in `78db7b8`) and
Copilot (7 valid comments, all fixed in `2684142`). Fixes verified
against the actual ORM entities (`addition_stage`, `addition_step`,
`type` are the real column names, not `use_timing` / `usage_stage` /
`form`). 6 open questions parked for Phase 2 brainstorm. No schema
change in the PR — audit only.

- **Decisions**:
  - `storage in metric, display in user-preferred units` — multi-valued
    fields use JSON-serialized TEXT so SQLite and PostgreSQL share the
    same schema without divergence.
  - `13-column scope frozen for this epic` — the 4 quality columns from
    Epic #693 part 2/n are listed for context only, held out of the
    numbered list so Phase 3 migration scope is unambiguous.

### Epic #713 created — App-wide metric ⇄ imperial unit conversion

Surfaced during PR #712 review (Copilot flagged a wrong kg→lb
conversion in a reference example). User reaction on 2026-04-24:
*"je l'avais complètement oublié ! Il faut prendre en compte et gérer
les conversions d'unité entre métrique et impérial !"*. Converted into
a dedicated epic covering 8 dimensions (weight, volume, small-volume,
temperature, color EBC↔SRM, density SG↔Plato, pressure, unitless
percentages), with a storage-in-metric / display-layer-toggle contract.

Milestone: v0.1.0-beta1. Dependencies: #644 / #645 (merged Compte &
Paramètres screen hosts the toggle), #660 (calculators-scoped existing
issue folded under #713 as sub-task), #708 Q3 (recipe schema unit
duality decision informed by this epic). Effort: ~3-4 days, best
sequenced after the Compte & Paramètres screen ships.

### Personas review — 5 personas + drêches bonus planned

Morning session final brainstorm (fourth of four) — full personas
review triggered by the user's request to reconcile the existing
[docs/personas/user_personas.md](docs/personas/user_personas.md)
(3 personas: Nicolas / Claire / Marc) with the product decisions
taken earlier in the day (Scan brainstorm introduced a "curious
amateur" primary persona, Compte brainstorm used an unnamed
"Marie" brewer in examples, Google Forms survey surfaced a strong
ecology axis with zero feature ship).

Method: debrief by tensions, five tensions resolved one by one
with clickable Q&A:

- **Tension 1 (vocabulary)** — proper names (Léa, Nicolas, Claire,
  Zoé, Marc) stay in the personas file for storytelling; technical
  roles (Discovery / Novice / Amateur / Eco-responsible / Expert)
  are used in user stories, user scenarios, GitHub tickets, and
  code comments.
- **Tension 2 (Scan brainstorm's "curious amateur")** — promoted
  to a distinct 4th persona **Léa la Curieuse** (25-32, young urban
  active, discovered a beer socially, no brewing equipment). Becomes
  the primary persona for the 2026-05-27 defense (scan demo hero).
- **Tension 3 (gaps personas → features)** — aligned on the P0-P4
  priority already validated; each persona has at least one v0.1
  feature served (Léa: full scan; Nicolas: Académie Glossaire;
  Claire: labels + UI fluidity; Zoé: drêches bonus; Marc: CSV
  export bonus), everything else roadmapped v0.2+.
- **Tension 4 (admin persona)** — Admin dropped from the brewer
  personas (not a brewer). The two admin user scenarios (public
  recipe management, user management) were removed from
  [docs/user_scenarios/user_scenarios.md](docs/user_scenarios/user_scenarios.md)
  with a note redirecting to a future v0.2+ epic "Community
  moderation".
- **Tension 5 (ecology)** — created a 5th persona **Zoé la
  Brasseuse Éco-responsable** (28-40, ecology-adjacent profession,
  1-2 years of brewing) and committed to ship a minimal
  **drêches (spent grain) valorization** feature in v0.1 as a
  planned bonus (~0.5-1j: an end-of-batch card suggesting 3-5
  hand-written recipes to reuse the spent grain).
  [docs/requirements/user_needs.md](docs/requirements/user_needs.md)
  §4 rewritten as a table with explicit version status per item
  (drêches v0.1, carbon footprint v0.2+, local suppliers v0.2+).

Final personas: 5 (Léa primary + Nicolas + Claire + Zoé + Marc),
mapping table + reference rule added at the top of the personas
file. Version bumped to v2 with a versioning history block.

**Side effect**: the user adopted *"Build for today, design for
tomorrow"* (ADR-0001 title) as a structuring catchphrase for the
rest of the defense preparation — the phrase now ties the Scan
brainstorm, the Compte brainstorm, the three ADRs, and the personas
priority table into a single coherent narrative.

### Architecture session — three ADRs accepted ([PR #691](https://github.com/benoit-bremaud/brasse-bouillon/pull/691))

Morning session continuation (third of four brainstorms scheduled for
the day) — structured Q&A to formalize three architectural decisions
that already governed the code informally and needed a written
contract.

Branch `docs/adr-001-002-003`, merged as `148da08`. Review cycle:
two Codex **P1 (Must Have)** comments on ADR-0003 revealing real
logic bugs — (a) the read contract `scan.training OR ml.training`
preserved a stale opt-in over a newer global opt-out (GDPR
compliance failure), rewritten as "most recent decision across
both axes wins" with a single helper scanning the append-only log;
(b) v0.1 storage described as "AsyncStorage keyed by axis"
contradicted the append-only clause — rewritten as a single
`brasse.consent.log` key holding a JSON array of `ConsentDecision`
records. Seven Copilot comments on ADR-0002 (broken path reference,
garbled "anti-pattern exception" wording) and ADR-0003 (incomplete
canonical axis list missing `scan.training`, two `browseable`
typos) — three unique + four duplicates, all grouped with
cross-references. All nine addressed in commit `508bab2`.

All three land as accepted ADRs under a new folder
[`docs/architecture/decisions/`](docs/architecture/decisions/) with a
README explaining the template (Michael Nygard format) and the
mutability policy (append-only once accepted, supersession via a new
ADR).

- **ADR-0001 — Build for today, design for tomorrow.** Five-clause
  rule (minimal implementation, shapes anticipate evolution, `501 Not
  Implemented` stubs for deferred endpoints, components extensible by
  default, one ADR per structural choice), four forbidden anti-patterns
  (feature flags for non-existent features, phantom lifecycle hooks,
  premature abstraction without the rule of three, `TODO v2` without
  a trace), three tolerated exceptions (kill switches on demo-critical
  paths, abstractions imposed by Clean Architecture, dated transient
  TODO markers). Enforcement at PR-review time via the AI reviewers
  (Copilot, Codex) reading the ADR through `CLAUDE.md`.
- **ADR-0002 — Centralized NestJS backend.** Mobile talks only to
  our NestJS API; the backend proxies OpenFoodFacts today and
  Wikipedia / Untappd / RateBeer / brewery scrapers tomorrow.
  Response normalisation, server-side caching, and credentials
  management all live server-side. Aligned with ADR-0001 on the
  `source` discriminant and the `501` stubs.
- **ADR-0003 — Consent as a single source of truth.** One canonical
  append-only consent store on the mobile app, feature-namespaced
  axes (`scan.barcode`, `scan.photos`, `scan.metadata`, `ml.training`,
  `telemetry`, …), two writers in v0.1 (Scan onboarding, Settings
  privacy). Resolves the Scan / Settings consent overlap flagged in
  the two earlier brainstorms. GDPR-compliant by construction.

Root `CLAUDE.md` now carries a mandatory "Architecture Decision
Records" section linking the three ADRs, so every agent starting a
session reads them before reviewing code. Violations should be
flagged at PR-review time with an explicit ADR number + clause
citation.

### Log entry enrichment for PR #688 ([PR #689](https://github.com/benoit-bremaud/brasse-bouillon/pull/689))

Small follow-up PR to bring the `Compte` & settings entry (above) in
line with the per-merge logging convention: adds the PR #688 link,
the merge SHA `6a518b0`, the branch name, and the review-cycle
narrative (1 Codex P2 on a contradictory MVP estimate, 5 Copilot
comments on `docs/CONVENTIONS.md` compliance, all addressed in
commit `761f4d8`).

Branch `docs/project-log-pr-688`, merged as `56a861d`. Review
cycle: one Copilot comment flagging that even the meta-commentary
naming the flagged French terms (by quoting them verbatim) itself
violates `docs/CONVENTIONS.md` §1. Paraphrased as "a French quote
in a heading / a French data-privacy acronym / a French legal-notice
phrase" in commit `4e2d558`; the English referents (`GDPR`,
`packages/mobile-app/CHANGELOG.md`) stay as code spans.

Also introduces a new repeatable process rule on this project: an
**end-of-review summary comment** is now posted on every PR before
the user merges (CI state, reviews received, resolution commit SHAs,
explicit "ready to merge" line). Stored as a durable convention in
the agent's memory so all future PRs follow the pattern.

### `Compte` & settings brainstorm + MVP conservative cuts ([PR #688](https://github.com/benoit-bremaud/brasse-bouillon/pull/688))

Morning session continuation — 45-minute structured Q&A on the
merged `Compte` screen, which consolidates `Profil` and `Paramètres
globaux` into a single surface (backlog item **B-45**, decided on
2026-04-23). 7 axes scoped (A→G) and captured in a new reference
file [`docs/product/brainstorms/compte-parametres-2026-04-24.md`](docs/product/brainstorms/compte-parametres-2026-04-24.md).

Budget synthesis showed the full scope at 25-36 days against 24
working days available before the defense. Product owner chose the
**conservative cuts** strategy, saving ~7-8 days by deferring to
v0.2: app-wide Units toggle (kept as single-screen stub), browseable
consent log (collection only kept), full badge grid (Level N2 kept),
avatar upload (text-only initial kept), and real GDPR ZIP export
(stub message kept).

Key MVP scope for v0.1.0:

- **Axis A (identity)** — display name + bio editable, text-only
  initial avatar. Email / password change deferred.
- **Axis B (brewer)** — stats card + level (Apprenti / Brasseur /
  Maître Brasseur). Badges grid deferred.
- **Axis C (preferences)** — theme full (system / light / dark) +
  units stub on one representative screen + notifications and
  privacy stubs with switches persisted locally.
- **Axis D (GDPR)** — delete account real with 30-day grace period,
  export stub message, consent collection silently plumbed to the
  same consent store used by Scan.
- **Axis E (social)** — none in MVP.
- **Axis F (about)** — full panel: version + commit + build date +
  OTA channel info. Ships alongside B-70 (version display) planned
  for this afternoon.
- **Axis G (demo)** — reserved for defense rehearsal.

Decomposed into 7 codable chunks (~7-8 focused dev days) to execute
in parallel with Scan Tranche 2. Principle confirmed: *"Build for
today, design for tomorrow"* (pending ADR-001).

Branch `docs/compte-parametres-brainstorm-2026-04-24`, merged as
`6a518b0`. Review cycle: one Codex **P2** (contradictory MVP
estimate — Section 2 read `~18 days` while Section 10 chunks
totalled `~7-8 days`; reconciled to Section 10 as the authoritative
number) and five Copilot comments on `docs/CONVENTIONS.md`
compliance (a French quote in a heading, a French data-privacy
acronym used instead of `GDPR`, a French legal-notice phrase, the
PROJECT_LOG heading in French, and a root-level `CHANGELOG.md`
reference that should point at `packages/mobile-app/CHANGELOG.md`
per §3). All six comments addressed in `761f4d8`.

### Scan brainstorm + product decisions framing ([PR #686](https://github.com/benoit-bremaud/brasse-bouillon/pull/686))

Morning session structured as a 60-minute Q&A with the product owner
to lock in the product decisions for the Scan feature — the **demo
hero** of the 2026-05-27 defense. 18 decisions taken and validated,
documented in a new reference file
[`docs/product/brainstorms/scan-2026-04-24.md`](docs/product/brainstorms/scan-2026-04-24.md).

Key decisions:

- **Primary persona** — curious amateur who wants to learn to brew
  (not the experienced brewer persona); drives all UX choices.
- **Product metaphor** — pharmacy: official brewery recipe as the
  brand-name medicine, community recipes as generics. Structures
  vocabulary, visuals, and embedded pedagogy.
- **UX structure** — Hero photo + essentials + recipes visible
  without scroll + technical details and brewery story in
  lazy-loaded folds. Sections with fewer than 3 filled fields
  auto-hide.
- **Matching algorithm** — multi-criteria score:
  `Similarity × 70% + Quality × 30%` where Similarity combines
  Style/ABV/Bitterness/Color weighted 50/25/15/10 (with weight
  renormalization when a criterion is missing), and Quality combines
  AvgRating/BrewCount_confidence/Recency weighted 60/30/10. Official
  recipes have Similarity = 100% by definition.
- **Little-known beers strategy** — hybrid vision: read-only display
  + discreet `mailto:` for correction suggestions. No community
  backend in MVP, but the data model is prepared for V2 (source,
  contributedBy, contributedAt fields; stub endpoints returning
  `501 Not Implemented`).
- **Architecture API** — centralized NestJS backend, mobile talks to
  a single API, backend proxies OpenFoodFacts and future sources
  (Wikipedia, Untappd). API keys stay server-side.
- **Demo fallback strategy** — 6 demo beers hard-coded in the app
  (offline-ready), 1-hour memory cache for any other beer scanned
  live.
- **Demo script** — 90-second scripted flow (amateur → scan →
  discovery → match → import), enriched with a "jury beer" variant
  that covers 4 adaptive scenarios (known / unknown / unreadable
  barcode / not-a-beer).
- **Project principle validated** — *"Build for today, design for
  tomorrow"*. To be formalized as **ADR-001** in the upcoming
  Architecture session.

Copilot review on #686 caught two real issues: the document was
originally written in French (violates `docs/CONVENTIONS.md` §1
requiring English) and had a naming drift (`Brassins_log` vs
`Confiance_brassins` for the same metric). Both fixed in commit
`562aecc`. Two other Copilot comments (about literal `|-` list
prefixes and `||` table starts) were false positives — the markdown
uses standard GitHub-flavored table syntax (`|---|---|`).

### Repository cleanup

Post-session repo hygiene after last night's 8-PR release-please
activation:

- Reverted an accidental `app.json` drift introduced by
  `eas update --branch preview` (a top-level `expo.runtimeVersion`
  that we had fixed in #683 and that the OTA command re-wrote
  locally).
- Deleted 4 local branches whose work is already on `main`:
  `feat/beer-encyclopedia-crud-api`, `docs/sync-post-552`,
  `docs/audit-chantier-1`, `feat/api-fly-deploy`, plus the stale
  `release-please--branches--main--components--website`.
- Dropped 6 ephemeral stashes tied to merged or deleted branches.
  Kept 11 stashes relevant to the active `docs/soutenance-27-mai`
  craft PR #578 and to the unmerged
  `fix/mobile-app-monorepo-expo-workflow` branch (which remains to
  be audited in a future session).

Working tree clean, 4 local branches remain (main,
`docs/soutenance-27-mai`, 2 unmerged to audit, and the
release-please group branch managed by the bot).

### Follow-up items identified

- **DB schema epic** — the matching algorithm decided in the
  brainstorm requires significant database work (beer enrichment
  schema in `beer-encyclopedia`, recipe rating + brew log in
  `packages/api`, cross-package API contracts, seed data for the 6
  demo beers + equivalent recipes). To be tracked as a GitHub epic
  blocking the Scan Tranche 2 backend chunk.
- **ADR-001** — draft *"Build for today, design for tomorrow"* as a
  project-wide convention during the Architecture session.
- **Jury request** — formal mention to the pre-defense coach asking
  whether the jury can bring empty bottles to test the Scan live.

### Release-please pipeline activation + first releases ([PR #667](https://github.com/benoit-bremaud/brasse-bouillon/pull/667), [#668](https://github.com/benoit-bremaud/brasse-bouillon/pull/668), [#669](https://github.com/benoit-bremaud/brasse-bouillon/pull/669), [#670](https://github.com/benoit-bremaud/brasse-bouillon/pull/670), [#671](https://github.com/benoit-bremaud/brasse-bouillon/pull/671), [#672](https://github.com/benoit-bremaud/brasse-bouillon/pull/672), [#675](https://github.com/benoit-bremaud/brasse-bouillon/pull/675), [#676](https://github.com/benoit-bremaud/brasse-bouillon/pull/676))

End-to-end activation of the release-please automation, with 4 packages
going through their first automated release cycle. Sequence of PRs:

- #667 — set up `release-please-config.json`, manifest, workflow, and
  the `refs/tags/v*` tag-protection ruleset.
- #668 — fix #623 Ingredients home counter + fix CI coverage reporter
  (`--coverageReporters=lcov,text` split into two flags).
- #669 — first release-please-generated PR: `encyclopedia-v0.2.1` cut.
- #670 — `website-v0.1.1` cut (manifest merge conflict resolved
  manually because release-please did not auto-rebase).
- #672 — auto-apply metadata workflow on release PRs + Prettier
  ignore for CHANGELOG/app.json (unblocks mobile-app CI on release
  PRs).
- #671 — app libs release PR merged; **release-please aborted** with
  "There are untagged, merged release PRs outstanding" because the
  default group PR title template (`chore${scope}: release ${component}`)
  omits `${version}`, so release-please could not parse the merged PR
  title. Tags `mobile-app-v0.1.1-alpha1` and `api-v0.1.1-alpha1` had
  to be created manually via `gh release create` at commit `3240639`,
  and PR #671 label flipped `autorelease: pending` →
  `autorelease: tagged`.
- #675 — add `workflow_dispatch` to release-please.yml so operators
  can retry manually via `gh workflow run "Release Please"` if the
  state machine gets stuck.
- #676 — fix the group PR title template
  (`chore${scope}: release app libraries ${version}`) so future
  app-group releases produce parseable titles and do not need manual
  tagging.

Also opened 2 tracking follow-ups from Copilot review:
- #673 — align `packages/beer-encyclopedia/package.json` version with
  `pyproject.toml` (drift every release).
- #674 — delete vestigial per-package `packages/*/package-lock.json`
  files (npm workspaces uses only the root lockfile; these are
  pre-monorepo leftovers).

Tags produced today (all immutable via `refs/tags/v*` ruleset):
`encyclopedia-v0.2.1`, `website-v0.1.1`, `mobile-app-v0.1.1-alpha1`,
`api-v0.1.1-alpha1`.

## 2026-04-22

### Root README refactor for dev onboarding ([PR #572](https://github.com/benoit-bremaud/brasse-bouillon/pull/572))

Rewrote the root `README.md` so it works as a clear entry point for a
new contributor. Structure reorganised around the journey (What is it →
Monorepo at a glance → Prerequisites → Quick Start → Running each
package → Scripts → Testing → CI → Docs → Team), drift between the
repo state and the README closed:

- Corrected the "70% coverage gate" wording — the CI only emits
  `::warning::` today, so it is documented as a target with a CI
  warning, not a blocking gate.
- Corrected the `discord-notifications.yml` description — it routes
  issue/PR lifecycle events by `scope:*` label, it does not post build
  events.
- Removed the `docs/ydays/` footnote (that directory only lives on the
  soutenance branch, not on `main`).
- Documentation table extended with 8 entries that existed in `docs/`
  but were not linked (CONVENTIONS, roadmap, DoD, DoR, sprint,
  scrum-roles, migrations-sequelize, meeting-types).
- Node range clarified (`>=20 <21`), Make sonar targets fully
  qualified, Quick Start mock-data path now includes a launch command.

Line count 389 → 361; all 21 internal links verified against the
filesystem. Review comments from Copilot + chatgpt-codex-connector
were all addressed inline (5 Must/Should fixes in commit `8db8a65`,
1 follow-up clarification in `b1255be`).

### SonarCloud CI analysis wired on every PR ([PR #573](https://github.com/benoit-bremaud/brasse-bouillon/pull/573))

Enabled server-side Quality Gate enforcement on every PR and every
push to `main`. Previously the repo had Sonar config (properties file
+ `tools/ci/sonar-scan.sh` + Makefile targets) but **zero** Sonar jobs
in GitHub Actions — analysis was local-only via a Dockerized SonarQube
Community Edition, so it only ran when a developer chose to.

What this PR changed:

- New [`.github/workflows/sonarcloud.yml`](.github/workflows/sonarcloud.yml)
  — installs `packages/mobile-app` + `packages/api`, runs each Jest
  suite with coverage, then invokes
  `SonarSource/sonarqube-scan-action@v6.0.0` (SHA-pinned). Checkout
  uses `fetch-depth: 0` so Sonar can compute blame annotations. Job
  skips on fork PRs (secrets aren't shared with forks) and triggers
  only on PRs targeting `main`.
- [`sonar-project.properties`](sonar-project.properties) — migrated
  from the local project key `brasse-bouillon` to the SonarCloud
  format `benoit-bremaud_brasse-bouillon`, added
  `sonar.organization=benoit-bremaud`, removed the hardcoded
  `sonar.host.url=http://localhost:9000`. Local Docker analysis via
  `make sonar-scan` still works — `tools/ci/sonar-scan.sh` already
  defaults `SONAR_HOST_URL` to localhost when unset.
- README CI/CD section updated to describe the new workflow.

Pragmatic choice: SonarCloud (managed) instead of SonarQube
self-hosted on Klouders. The Klouders provisioning was still pending
and the soutenance deadline was approaching — managed service was
~30 min of setup vs. a day's work for a hardened self-host. The
migration path to Klouders later is trivial (same scanner, override
URL and token in the workflow). Noted in a PR comment for
`@clemoune-tech`, `@Moooniie`, `@astronas`.

First Quality Gate run on this PR passed: 0 new issues, 0 security
hotspots, 0.0% coverage on new code (expected — the PR only touches
YAML/properties). SHA-pinning the three Actions addressed a
`githubactions:S7637` hotspot flagged by Sonar on the first scan.

Tech debt opened as follow-up issues:
- Pin all actions in `ci.yml` + `discord-notifications.yml` by SHA
  (same hotspot will fire there once Sonar scans those files).
- Reuse `ci.yml`'s uploaded `lcov.info` artifacts in
  `sonarcloud.yml` to avoid running Jest twice per PR.

---

## 2026-04-20

### Mobile-app: first installable APK via EAS (preview profile)

First standalone Android APK shipped to the user's phone — ends the
two-day Expo Go saga on YNOV / mobile-hotspot Wi-Fi. Credentials set up
on `@beniot/brasse-bouillon-mobile-app` (project id
`a527c490-36e1-49f2-a91b-5866a2823b5f`), EAS keystore auto-generated,
three APK iterations on 2026-04-19 → 2026-04-20:

1. **v1** — first APK, screens empty because `EXPO_PUBLIC_USE_DEMO_DATA`
   is in a gitignored `.env` and therefore not shipped to EAS.
2. **v2** — EAS env variable `EXPO_PUBLIC_USE_DEMO_DATA=true` registered
   on the `preview` environment + `expo-updates` installed and configured
   (`eas update:configure`). Demo mode works; OTA channel `preview`
   wired. Archive down to 4.9 MB after discovering the `.easignore`
   `tools/` bug.
3. **v3** — launcher icon set to `brasse-bouillon-logo-primary-512.png`
   (brasseur character) on yellow `#F5D547` adaptive-icon background.
   Validated on device.

Build workflow formalised in
[packages/mobile-app/docs/EAS_BUILD.md](packages/mobile-app/docs/EAS_BUILD.md):
direct `npx eas-cli build --profile preview --platform android` from
`packages/mobile-app/` (Option A, preferred), with an isolated-workspace
fallback for debugging `.easignore` rules (Option B). Both paths use
`NODE_OPTIONS='--dns-result-order=ipv4first'` to avoid IPv6-only DNS
flaps on `storage.googleapis.com`.
The extracted-workspace workaround existed during investigation because
EAS tars from the monorepo root (277 MB `.git`, 5.6 GB
`packages/beer-encyclopedia/`, etc.) and our initial `.easignore` had a
bare `tools/` pattern that silently excluded `src/features/tools/` and
broke the first build. That specific bare-pattern bug is what
[issue #555](https://github.com/benoit-bremaud/brasse-bouillon/issues/555)
tracks, and this PR closes it by anchoring every repo-root pattern to
`/pattern/`. With the anchored `.easignore` in place, the upload is now
~5-15 MB from the real monorepo and the `/tmp` extraction is only a
documented fallback.

Also folded into this PR:

- `packages/mobile-app/package.json` — realign three drift-ing deps to
  the SDK 54 expected set (`expo-camera@~17.0.10` down from the stray
  `^55.0.9`, `@react-native-async-storage/async-storage@2.2.0` down from
  `^3.0.1`, `@react-native-community/slider@5.0.1` down from `^5.1.2`)
  plus add `expo-updates@~29.0.16`. `expo doctor` was rejecting the
  build until this was done.
- `packages/mobile-app/.easignore` — new canonical version with every
  repo-root directory anchored to `/pattern/`, inline comment explaining
  the gotcha, pointer to #555.
- `packages/mobile-app/eas.json` — development / preview / production
  profiles, `appVersionSource: "remote"`, `cli.version >= 18.7.0`.
- Package renamed `brasse-bouillon-frontend` → `@brasse-bouillon/mobile-app`
  to align with the monorepo `@brasse-bouillon/*` naming.

Next step (tracked separately): connect the app to the live NestJS
backend (`packages/api`) once an endpoint host is stable — local
cloudflared first, deployed Railway/Fly host for the 2026-05-27
defense.

## 2026-04-19

### Soutenance prep: integrate official Ynov format + pivot web-studio

Ynov coach email 2026-04-19 confirmed the defense format — **30 minutes
pitch + 10 minutes Q&A = 40 minutes total**, room 0.301, Pitch
Entrepreneurial category, Moodle submission required after the oral.
Three evaluation grids attached to the email, to be archived under
`docs/ydays/references/` (new folder introduced this session to hold
school-side documents, separate from team-produced `outputs/` and
internal-journal `debrief/`).

Session deliverables on branch `docs/soutenance-27-mai`:

- [docs/ydays/outputs/plan-presentation-27-mai.md](docs/ydays/outputs/plan-presentation-27-mai.md)
  rebalanced to fill 30 minutes (blocs 1-6 = 4/6/8/5/6/1 min), header
  aligned to 30+10 format, revision entry appended.
- [docs/ydays/README.md](docs/ydays/README.md) gained a "Format
  officiel" section (format, room, mock oral 2026-05-06) and the new
  `references/` entry in the tree.
- [docs/ydays/outputs/risk-analysis.md](docs/ydays/outputs/risk-analysis.md)
  risk C3 updated (30 min scope), new risk L6 (Ynov changes the format
  on the day), mock oral 2026-05-06 added to the rehearsal calendar.
- [docs/ydays/debrief/2026-04-16_session-decisions.md](docs/ydays/debrief/2026-04-16_session-decisions.md)
  factual-gap table marks gap #1 resolved and gap #5 pivoted, adds
  gaps #11 (archive the three Ynov grids) and #12 (reserve the
  mock-oral slot on 2026-05-06).
- [docs/ydays/references/README.md](docs/ydays/references/README.md)
  new index describing the expected content of the references folder
  and usage rules (no modification of received documents).
- [docs/ydays/debrief/2026-04-19_session-decisions.md](docs/ydays/debrief/2026-04-19_session-decisions.md)
  records decisions D19-1…D19-5 (Ynov format, web-studio pivot,
  references folder, propagation, mock-oral scheduling).

Pivot on gap #5 (Marketing recruitment): dropped in favour of a
personal vision to open a web-studio agency to support Brasse-Bouillon
and future projects. Brainstorming session to come — assistant will
prepare structured questions after exploring the existing `web-studio`
repo.

## 2026-04-16

### Soutenance prep: persist Phase 0 + T1 into `docs/ydays/`

Consigned the full preparation material for the Ydays defense of
2026-05-27 under `docs/ydays/` on branch `docs/soutenance-27-mai`.
Deliverables:

- [docs/ydays/README.md](docs/ydays/README.md) — operational index for
  the defense folder, frozen decisions summary, grading-grid mapping
  (#522-#528).
- [docs/ydays/outputs/audit-features-mvp.md](docs/ydays/outputs/audit-features-mvp.md)
  — factual audit of the 11 MVP features (8 stable, 2 partial,
  1 R&D) produced by an Explore agent; 5-minute recommended demo
  path (Auth → Recipes read-only → Barcode scanner → ABV calculator
  → Batch timeline); pre-production checklist J-7/J-3/J-1.
- [docs/ydays/outputs/smart-objectives-par-pole.md](docs/ydays/outputs/smart-objectives-par-pole.md)
  — 36 SMART objectives (6 retrospective + 6 prospective × 3 pôles
  Dev/Création/Marketing), each sourced to a traceable repo file;
  six unverifiable claims flagged `[trou factuel]` for user
  validation before J-7.
- [docs/ydays/outputs/plan-presentation-27-mai.md](docs/ydays/outputs/plan-presentation-27-mai.md)
  — 30-minute presentation plan structured around decision A0
  (hybrid user-journey + 1-2 min expert interventions per bloc) and
  decision A1 (barcode scanner as live demo USP, beer-label-ai kept
  as R&D slide only); six blocs with timings, narrative voice, cited
  SMART and targeted grading-grid criterion.
- [docs/ydays/debrief/2026-04-15_session-decisions.md](docs/ydays/debrief/2026-04-15_session-decisions.md)
  — partially reconstituted debrief (original session content was
  not persisted; D1-D4 and R1-R6 reconstituted from what is frozen
  today).
- [docs/ydays/debrief/2026-04-16_session-decisions.md](docs/ydays/debrief/2026-04-16_session-decisions.md)
  — records A0/A1 decisions, the repo-sourced SMART derivation
  method, the operational persistence rule, ten tabulated factual
  gaps with impact/priority, and the ordered remaining tasks
  (T2 BMC → T3 hook → T4 personas check → T6 demo script
  → T12 rehearsals → T14 Moodle submission).

Operational rule established in the session: **persist every piece
of rich session material to disk at the time it's produced** — drafts,
decisions, analyses, SMART, canvases, scripts. No more long-term
storage in conversation memory alone. Target folder: `docs/ydays/`.
Commit cadence: one commit per deliverable on the dedicated branch.

## 2026-04-13

### API refactor: router-based architecture with FastAPI lifespan (#545)

Step 4 of the beer-encyclopedia epic (#541). Restructured the FastAPI app
from inline endpoints into a router-based architecture without changing
any externally-visible behavior.

Layout (`packages/beer-encyclopedia/api/`):

- `main.py` — app factory + minimal lifespan that disposes the engine on
  shutdown (engine itself is lazy-init via `get_db()` for fast cold starts
  and easy test injection)
- `dependencies.py` — re-exports `get_db` so route handlers stay decoupled
  from `db.engine` directly
- `routers/scan.py` — hosts `/health` and `/scan` (moved verbatim from
  the original `api/main.py`)
- `schemas/scan.py` — re-exports `ScanResponse` & friends from
  `ml/schemas.py`; the indirection is in place so a future API/ML schema
  divergence touches only this module

Backward compatibility preserved: `/health` and `/scan` keep the same
paths, parameters, status codes, and response model. `uvicorn api.main:app`
remains the entrypoint.

5 new tests in `tests/test_api/test_scan.py` covering the HTTP contract
(health 200, missing file 422, non-image 400, missing content-type 400,
routes mounted at root). Total: 39/39 passing, ruff clean.

## 2026-04-12

### Data models: 10-table encyclopedia schema + pg_trgm search + style seed (#544)

Step 3 of the beer-encyclopedia epic (#541). Designed and implemented the full
encyclopedia data model on top of the PostgreSQL infrastructure added in #543.

**10 ORM models** (`db/models/`): `Style`, `Brewery`, `Beer`, `Ingredient` +
`BeerIngredient` junction, `TastingProfile` (1-to-1 with Beer), `Media`
(polymorphic on beer_id/brewery_id), `Source` + `EntitySource` for
provenance tracking with JSONB raw_data (JSON fallback on SQLite),
`CommunityCorrection` for moderation queue.

**Hand-written initial migration** (`migrations/versions/001_initial_schema.py`):
all 10 tables with FK cascades (`ON DELETE CASCADE` for dependent rows,
`ON DELETE SET NULL` for `beers.brewery_id`/`style_id` so historical records
survive), CHECK constraints (ABV ranges on styles, 1–5 scales on tasting
profiles, media parent required), B-tree indexes on common filter paths
(city/country/brewery_type/FKs/abv/moderation-queue), and PostgreSQL-only
steps guarded by `_is_postgres()`: `CREATE EXTENSION pg_trgm` + GIN
trigram indexes on `breweries.name` and `beers.name` for fuzzy search.

**Style seeder** (`scripts/seed_styles.py`): idempotent upsert of 15 styles
(the 8 slugs recognized by `ml/extract.py` + 7 mainstream additions:
porter, pilsner, hefeweizen, dubbel, quadrupel, barleywine, blonde ale).

**14 new tests** covering relationships, cascades, unique constraints,
check constraints, and seeder idempotence. Total: 30/30 passing on SQLite
in-memory. Ruff clean. Migration upgrade + downgrade validated on SQLite.

### Infrastructure: PostgreSQL + async SQLAlchemy + Alembic + Docker Compose (#543)

Step 2 of the beer-encyclopedia epic (#541). Added the persistence infrastructure the upcoming data models will rely on: async SQLAlchemy 2.0 engine + session factory (`db/engine.py`), ORM `Base` with `UUIDMixin` and `TimestampMixin` (`db/models/base.py`), async-aware Alembic scaffolding (`alembic.ini`, `migrations/env.py`, `migrations/script.py.mako`), and local Docker Compose stack with PostgreSQL 16 + pgAdmin (`docker-compose.yml`, `.env.example`).

Switched dependency management to `pyproject.toml` as the single source of truth with `[ml]` and `[dev]` optional groups; deleted the legacy `ml/requirements.txt` and updated the CI step to `pip install -e ".[ml,dev]"`. Added 6 behavior tests for the engine/session/get_db dependency (total: 16 tests passing, ruff clean).

### Epic: transform beer-label-ai into beer-encyclopedia

Kicked off a major initiative to evolve `packages/beer-label-ai` into `packages/beer-encyclopedia` — a comprehensive beer encyclopedia aiming to catalog all beers in the world. The existing ML scan pipeline becomes a sub-module feeding the encyclopedia; new capabilities include PostgreSQL persistence, multi-source data ingestion (Open Brewery DB first), community corrections, CRUD + fuzzy search API, and multi-channel consumption (mobile app + future web UI).

Created epic #541 and 6 sub-issues tracking the 6-step incremental plan: #542 rename, #543 DB infrastructure (PostgreSQL + SQLAlchemy + Alembic + Docker), #544 data models (10 tables with pg_trgm search + provenance tracking), #545 API router refactor, #546 CRUD + search endpoints, #547 Open Brewery DB importer. All issues added to the Brasse-Bouillon GitHub project. New `scope:beer-encyclopedia` label created.

### Refactor: rename beer-label-ai → beer-encyclopedia

Opened PR #548 (closes #542) — purely mechanical rename via `git mv` preserving git history. Updated 11 cross-repo references: root `package.json` workspace entry, `CLAUDE.md` (structure + per-package links), `.github/workflows/ci.yml` (job name + path filter + artifact name), `.github/copilot-instructions.md`, `sonar-project.properties`, plus package-level `package.json` (bumped to v0.2.0, name `@brasse-bouillon/beer-encyclopedia`), `CLAUDE.md`, and `ruff.toml`. `package-lock.json` regenerated. Existing tests (10/10) pass.

---

## 2026-04-01

### Backlog: create soutenance sub-issues mapped to evaluation grid

Created 7 sub-issues under #393 (soutenance deliverables), each mapped to a criterion of the Pitch Entrepreneurial evaluation grid: #522 (elevator pitch, 15pts), #523 (SMART objectives, 15pts), #524 (business model + innovation, 30pts), #525 (live demo, 30pts), #526 (perspective: legal/HR/go-to-market/budget, 20pts), #527 (slide deck, 15pts), #528 (rehearsal, 15pts). All assigned to Sprint 6.

### Backlog: restructure design issues and plan Sprint 4-6

Closed 17 obsolete CG design issues (#231-#262). Created 7 new design issues with clear scope, dependencies, and assignees: #515 (audit charter — Liam+Fabio), #516 (audit UI components — Liam+Fabio), #517 (audit assets — Liam+Fabio), #518 (audit wireframes + create missing screens — Sara+Thaïs), #519 (UI Kit Figma — Sprint 5), #520 (high-fidelity mockups 11 screens — Sprint 5), #521 (security audit — Fabien). Dependency chain established: #515 → #516/#517/#518 → #519 → #520 → dev mobile.

### Backlog: plan Sprint 5 and Sprint 6

Sprint 5 (Apr 15 – May 5): labelled 13 issues — 8 MUST-HAVE recipe CRUD user stories (#410-#417, #420), batch creation (#433), DevOps (#337, #338, #396), design delivery (#519, #520). Sprint 6 (May 6-27): batch measurements (#434), soutenance deliverables (#393 + 7 sub-issues), oral intermédiaire update (#392).

### Decision: SonarQube deployment on Klouders VM

Decided to deploy SonarQube on Klouders VM instead of local or SonarCloud. Invited Thibaut GIANOLA (@astronas, Klouders admin) as collaborator. Updated #396 with decision rationale and implementation plan.

### Infrastructure: restructure Discord server

Created #annonces channel (read-only). Merged 5 SCRUM channels into #daily-standup + #ceremonies. Archived #merch, #intervention, #autre-appli-de-brassage. #github channel archived — fallback notifications temporarily routed to #général. Configured BB Bot webhook on #ceremonies.

### Backlog: close resolved issues and audit milestones

Closed 10 issues already resolved but left open: #318 (Node 20 compat), #319 (issue triage), #320 (root package.json), #321 (.gitignore), #327 (frontend subtree import), #328 (backend subtree import), #330 (Scrum framework), #333 (meeting notes template), #359 (archive repos), #497 (team mapping). Closed #383 (performance baseline — too late, migration done). Established team member mapping with GitHub + Discord username cross-reference.

### Docs: create PROJECT_LOG.md and Copilot review instructions (PR #514)

Created `PROJECT_LOG.md` operational logbook with backfilled history from PRs #395–#503. Added `.github/copilot-instructions.md` with project-specific review rules (no `any`, named exports, Python type hints, security checks). Referenced project log in root CLAUDE.md. Closes #513.

### Infrastructure: enable Copilot automated code review

Activated Copilot code review ruleset on the default branch with automated reviews on push. Closed #339 as resolved.

### Backlog: consolidate CI issues and assign team members

Consolidated SonarQube issues (#357, #358 into #396). Updated issue bodies for #337, #338, #396 to reflect package renames. Reassigned all CI issues to appropriate team members based on scope labels. Closed #339 (resolved), #357, #358 (duplicates). Updated #338 scope from GitHub Pages deployment to removal (migrated to Klouders VM).

### Backlog: create i18n translation issues for all French documentation

Created 9 issues (#504–#512) to systematically translate all remaining French content to English across the repository: sequence diagrams, vision, personas, requirements, user scenarios, design docs, project management, meeting notes, and mobile app UI strings. All assigned to milestone "Documentation Refactoring" except #512 (DX & Cleanup).

## 2026-03-31

### CI/CD: add coverage gates, ruff lint, and security audit (PR #503)

Added 70% coverage warning gate to mobile-app and api CI jobs. Added full beer-label-ai CI job with ruff linting, compile sanity check, pytest with lcov coverage report, and coverage artifact upload. Added npm audit security check job. Applied ruff auto-fixes (pyupgrade) to all beer-label-ai Python files. Closes #496.

## 2026-03-30

### Refactor: rename packages to match Discord channels (PR #502)

Renamed `packages/frontend` → `packages/mobile-app` and `packages/backend` → `packages/api`. Updated all references across CI, SonarQube config, root scripts, CLAUDE.md, CONTRIBUTING.md, and package.json workspaces. Closes #501.

### Fix: reduce Discord notification spam (PR #500)

Reduced Discord notification triggers from ~10 per action to max 3 per PR lifecycle. Removed `review_requested`, `labeled`, and comment events. Kept only `issues:opened`, `pull_request:opened`, and `pull_request:closed` (merged only). Closes #498.

### Infrastructure: import beer-label-ai into monorepo (PR #495)

Imported beer-label-ai standalone repo via `git subtree add` into `packages/beer-label-ai`. Added to npm workspaces. Created CLAUDE.md for the package. Cleaned up `_archive/` (removed 20MB act binary). All 4 standalone repos now archived on GitHub with deprecation notices.

### Fix: sync website package with standalone repo (PR #494)

Fixed `packages/website/` to match standalone repo HEAD. Fixed SyntaxError in `weekly_digest.py` (line 610: `]` → `)`). Closes #491.

### Docs: add sprint templates and design audit (PR #493)

Added sprint definition, velocity tracking templates, and design audit documentation for Scrum workflow.

## 2026-03-27

### Docs: rewrite CONVENTIONS.md for monorepo (PR #492)

Rewrote project conventions to reflect the monorepo structure. Covers naming, branching, commit messages, PR workflow, and code quality standards.

## 2026-03-26

### Infrastructure: add Discord notifications and issue templates (PR #490)

Created GitHub-to-Discord notification workflow. Added issue templates adapted for monorepo package structure.

### Infrastructure: update GitHub issue templates (PR #477)

Updated issue templates (bug report, feature request, task) to work with the monorepo multi-package structure.

## 2026-03-25

### Docs: create unified Product Backlog (PR #476)

Created single Product Backlog document with 63 User Stories organized by epic, with personas and priority classification.

### Docs: create root CLAUDE.md and rewrite README/CONTRIBUTING (PRs #401, #402)

Established cross-cutting development conventions for the monorepo in CLAUDE.md. Rewrote README.md and CONTRIBUTING.md for the new monorepo structure.

### CI/CD: create unified CI workflow (PR #398)

Created path-filtered GitHub Actions CI pipeline. Each package only runs its checks when its files change. Mobile-app: lint + typecheck + format + tests. API: lint + build + tests. Website: Python quality gate. Beer-label-ai: compile + tests.

### Infrastructure: add SonarQube configuration (PR #397)

Added `sonar-project.properties` and Makefile target for local SonarQube analysis. Configured sources, tests, coverage paths, and exclusions for TypeScript packages.

### Fix: validate packages and fix lint errors (PR #399)

Fixed ESLint and TypeScript errors across packages to ensure CI passes on the newly consolidated monorepo.

## 2026-03-24

### Infrastructure: bootstrap monorepo (PR #395)

Consolidated 4 standalone repos into one monorepo using `git subtree`. Set up npm workspaces. Imported: brasse-bouillon-frontend, brasse-bouillon-backend, brasse-bouillon-website. Established root `package.json` with workspace scripts.

### Decision: monorepo consolidation strategy

Decided to consolidate all 5 standalone repos (frontend, backend, website, beer-label-ai, main) into a single monorepo using `git subtree` (preserving history). Motivation: reduce dual maintenance risk, simplify CI, unify conventions.

## 2026-02-11

### Feature: add JWT tests for backend (PR #316)

Added automated tests for JWT authentication on protected API routes.

## 2025-07-18

### Feature: add wireframe PNGs for MVP screens (PR #315)

Added low-fidelity wireframe images for all MVP screens to support UI development.

## 2025-07-02 – 2025-07-11

### Docs: complete design charter (PRs #301–#313)

Series of PRs completing the visual design system: logo assets, typography (Inter), color system with accessibility audit, UI component styles (tooltips, buttons, inputs, alerts), grid/spacing/radii system, form input documentation, moodboard, and screen identification for wireframes.
