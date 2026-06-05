# Changelog — @brasse-bouillon/mobile-app

Every user-visible change lands here. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) +
strict semver prefixed `v` (`vMAJOR.MINOR.PATCH`, prereleases `-alphaN` /
`-betaN` / `-rcN` per the repo-wide tag convention in the root
[CONTRIBUTING.md](../../CONTRIBUTING.md) and global CLAUDE rules).

Tag lifecycle:

- Lightweight or annotated tags created from `main` only, after the
  release PR merges the version bump + this CHANGELOG.
- Failed publishes keep their tag as an audit marker — never delete,
  always bump to the next version.
- No tag reuse, ever.

## [0.1.13-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/mobile-app-v0.1.12-alpha1...mobile-app-v0.1.13-alpha1) (2026-06-05)


### Features

* **auth:** cosmetic 'Continuer avec Google' button on auth screen (Issue [#765](https://github.com/benoit-bremaud/brasse-bouillon/issues/765)) ([4eb8eb8](https://github.com/benoit-bremaud/brasse-bouillon/commit/4eb8eb81bea276b0fd33b99e44b2bca82ddff0f1))
* **auth:** purge session on mid-session 401 (token expiry) ([#1145](https://github.com/benoit-bremaud/brasse-bouillon/issues/1145)) ([2169793](https://github.com/benoit-bremaud/brasse-bouillon/commit/2169793eb4a2331f9626afb3ceccd6e4e522cd17))
* **auth:** simplify signup form to email + password + bigger mascot + KISS auth screen (Issue [#764](https://github.com/benoit-bremaud/brasse-bouillon/issues/764)) ([096f7fa](https://github.com/benoit-bremaud/brasse-bouillon/commit/096f7fa9d7dbc5341cc1128ee057385554f8d8fc))
* **auth:** Sprint A polish — simplified signup ([#764](https://github.com/benoit-bremaud/brasse-bouillon/issues/764)) + Google cosmetic button ([#765](https://github.com/benoit-bremaud/brasse-bouillon/issues/765)) + bigger mascot ([#790](https://github.com/benoit-bremaud/brasse-bouillon/issues/790)) ([c64805f](https://github.com/benoit-bremaud/brasse-bouillon/commit/c64805f71db8a1e262949b09a299ab1c1273fcde))
* **auth:** toggle demo mode via secret sign-in credentials (Issue [#822](https://github.com/benoit-bremaud/brasse-bouillon/issues/822)) ([6188272](https://github.com/benoit-bremaud/brasse-bouillon/commit/61882729acd9dd5f0e20de84ba174b9d62e591e6))
* **auth:** toggle demo mode via secret sign-in credentials (Issue [#822](https://github.com/benoit-bremaud/brasse-bouillon/issues/822)) ([#823](https://github.com/benoit-bremaud/brasse-bouillon/issues/823)) ([a760c7c](https://github.com/benoit-bremaud/brasse-bouillon/commit/a760c7c6f86c9d170bbe6d26c7df2a2f0dc45de5))
* **batches:** add BatchFinishedScreen demo-mode celebration mockup ([bc071b8](https://github.com/benoit-bremaud/brasse-bouillon/commit/bc071b87501e905e641ce032f3ae1d6386711bd2))
* **batches:** demo-mode fermentation tracker on BatchDetails ([#1016](https://github.com/benoit-bremaud/brasse-bouillon/issues/1016)) ([7f903e5](https://github.com/benoit-bremaud/brasse-bouillon/commit/7f903e5f5c91c89e0ccbf8954e907cd7622b2ec3))
* **batches:** demo-mode fermentation tracker on BatchDetailsScreen ([9674af2](https://github.com/benoit-bremaud/brasse-bouillon/commit/9674af277a546a2a6945adec598048bea49c332e))
* **brassins:** brewing assistant — step countdown timer + pedagogical tips ([#1107](https://github.com/benoit-bremaud/brasse-bouillon/issues/1107)) ([4e2e9d6](https://github.com/benoit-bremaud/brasse-bouillon/commit/4e2e9d6453b52e14bc7549c0ef0f9fc07ef35315))
* **catalog:** Recipe Catalog mini — KISS scope (Issue [#779](https://github.com/benoit-bremaud/brasse-bouillon/issues/779)) ([9e3ed02](https://github.com/benoit-bremaud/brasse-bouillon/commit/9e3ed024ce0196168905d9e415ac3788fdd1d417))
* **catalog:** Recipe Catalog mini — KISS scope (Issue [#779](https://github.com/benoit-bremaud/brasse-bouillon/issues/779)) ([#845](https://github.com/benoit-bremaud/brasse-bouillon/issues/845)) ([3d8dbff](https://github.com/benoit-bremaud/brasse-bouillon/commit/3d8dbff26280e2a4946d931317265a4efae73e75))
* **dashboard:** chunk 2 — welcome greeting, ribbon, "À explorer" section ([db4316d](https://github.com/benoit-bremaud/brasse-bouillon/commit/db4316df5f6c70ffd0767feb6d438beb1f0bdfbb))
* **dashboard:** pin a hero "Brassin en cours" card on the demo Dashboard ([a2cb79a](https://github.com/benoit-bremaud/brasse-bouillon/commit/a2cb79a0cee88f71c36b61d65ff2bd82d3c22f6f))
* **demo:** seed fil-rouge brewing data for "La Première du dimanche" ([af9b7d0](https://github.com/benoit-bremaud/brasse-bouillon/commit/af9b7d02c0067619ae5aeb7c4a9f2eb0481945c7))
* **demo:** wire the two showcase mockups into the demo-mode navigation ([eb33fff](https://github.com/benoit-bremaud/brasse-bouillon/commit/eb33fffe1379817e83e08dc5fbdcfc7796bc3044))
* **eas:** standalone APK profile pointing on Fly.io + fix monorepo upload bloat ([#960](https://github.com/benoit-bremaud/brasse-bouillon/issues/960)) ([f762cb2](https://github.com/benoit-bremaud/brasse-bouillon/commit/f762cb20f79f2b288b6146189b0331afcc271c28))
* **eas:** wire preview profile to Fly.io URL + fix monorepo upload bloat ([14fbdc9](https://github.com/benoit-bremaud/brasse-bouillon/commit/14fbdc9a3b59e2606ba0db9bfd8663d2101e3c83))
* **labels:** add Partager button on draft details — KISS Share text scope (Issue [#629](https://github.com/benoit-bremaud/brasse-bouillon/issues/629)) ([5e141cb](https://github.com/benoit-bremaud/brasse-bouillon/commit/5e141cbd2f421c0ceed09d246d52f216dc093ace))
* **labels:** add Partager button on draft details — KISS Share text scope (Issue [#629](https://github.com/benoit-bremaud/brasse-bouillon/issues/629)) ([#837](https://github.com/benoit-bremaud/brasse-bouillon/issues/837)) ([3aa1837](https://github.com/benoit-bremaud/brasse-bouillon/commit/3aa183759f69dd9ee678d9f0c884f6ec17e11ba7))
* **mobile-app:** wire Python beer-encyclopedia as fallback for /scan/lookup 404 (ADR-0005) ([c32dfb0](https://github.com/benoit-bremaud/brasse-bouillon/commit/c32dfb0c67b62e020465452feefffc3dcd43d386))
* **mobile-app:** wire Python beer-encyclopedia as fallback for /scan/lookup 404 + ADR-0005 backend split ([#871](https://github.com/benoit-bremaud/brasse-bouillon/issues/871)) ([fc3ee5a](https://github.com/benoit-bremaud/brasse-bouillon/commit/fc3ee5a05c9b8af62840b954f02e0c8a14dfc19f))
* **mobile:** add BeerMugLoader Lottie component to replace ActivityIndicator ([21afb98](https://github.com/benoit-bremaud/brasse-bouillon/commit/21afb98f4d960a3444348e659f3667614c492383))
* **mobile:** demo-mode dashboard refonte — hero, ribbon, exploration ([#1014](https://github.com/benoit-bremaud/brasse-bouillon/issues/1014)) ([c556559](https://github.com/benoit-bremaud/brasse-bouillon/commit/c556559d0b7e19c33fa170edb80ec815f6b10e78))
* **mobile:** replace ActivityIndicator with BeerMugLoader Lottie animation ([#961](https://github.com/benoit-bremaud/brasse-bouillon/issues/961)) ([bab5649](https://github.com/benoit-bremaud/brasse-bouillon/commit/bab56492835f12abbc7222c3b66738485ea447a7))
* **mobile:** showcase screens + demo polish for the marketing site ([#1012](https://github.com/benoit-bremaud/brasse-bouillon/issues/1012)) ([9bb4c9f](https://github.com/benoit-bremaud/brasse-bouillon/commit/9bb4c9fdfbc80e2b6664a1364ff4f5e255cdb800))
* **recipes:** match recipes by characteristics, not a scan-catalog id ([#1190](https://github.com/benoit-bremaud/brasse-bouillon/issues/1190)) ([e1d1764](https://github.com/benoit-bremaud/brasse-bouillon/commit/e1d1764580573e1a1df4de001db823db6a3fa7d4))
* **recipes:** redesign detail screen with 4-tab layout + EBC hero + sticky CTA ([#916](https://github.com/benoit-bremaud/brasse-bouillon/issues/916)) ([0bd743f](https://github.com/benoit-bremaud/brasse-bouillon/commit/0bd743f79c64dd0b26ce9e5b4bfc10d8ad987054)), closes [#740](https://github.com/benoit-bremaud/brasse-bouillon/issues/740)
* **recipes:** redesign detail screen with 5-tab side rail (Vue / Ingrédients / Eau / Brassage / Notes) ([1e9b889](https://github.com/benoit-bremaud/brasse-bouillon/commit/1e9b889bf5a372ca382ad0b1eef63cb676d6a516))
* **recipes:** refactor Mes Recettes into 2-section hub (Mes recettes + Découvrir) ([ec4bfcc](https://github.com/benoit-bremaud/brasse-bouillon/commit/ec4bfcc41a043c673d5921917b24893b2670946c))
* **recipes:** refactor Mes Recettes into 2-section hub (Mes recettes + Découvrir) ([#917](https://github.com/benoit-bremaud/brasse-bouillon/issues/917)) ([7f59508](https://github.com/benoit-bremaud/brasse-bouillon/commit/7f5950822d7848593ae32e783276968605ccf844)), closes [#740](https://github.com/benoit-bremaud/brasse-bouillon/issues/740)
* **recipes:** show recipe ingredients in live mode ([#1165](https://github.com/benoit-bremaud/brasse-bouillon/issues/1165)) ([84cd493](https://github.com/benoit-bremaud/brasse-bouillon/commit/84cd4932a094343b6f06d73f912ee719a8309e4d))
* **scan:** burst quick wins polish — progressive feedback, retry color, consent FR, import confirmation (4 issues) ([#819](https://github.com/benoit-bremaud/brasse-bouillon/issues/819)) ([3231af9](https://github.com/benoit-bremaud/brasse-bouillon/commit/3231af9d66e676d90d9aeab2b6afe37a25c6c0d5))
* **scan:** graceful UX for unknown beer — surface barcode + mailto CTAs (Issue [#796](https://github.com/benoit-bremaud/brasse-bouillon/issues/796)) ([8e8c395](https://github.com/benoit-bremaud/brasse-bouillon/commit/8e8c395f02774ff845dcc132516651f84281b60d))
* **scan:** graceful UX for unknown beer — surface barcode + mailto CTAs (Issue [#796](https://github.com/benoit-bremaud/brasse-bouillon/issues/796)) ([#799](https://github.com/benoit-bremaud/brasse-bouillon/issues/799)) ([a984cf6](https://github.com/benoit-bremaud/brasse-bouillon/commit/a984cf6466899f33988093cbe2523470d50c271d))
* **scan:** hidden long-press demo override menu — soutenance safety net (Issue [#642](https://github.com/benoit-bremaud/brasse-bouillon/issues/642)) ([8e819c9](https://github.com/benoit-bremaud/brasse-bouillon/commit/8e819c9d02afc3292799422e31fdf843d22b8bf8))
* **scan:** hidden long-press demo override menu — soutenance safety net (Issue [#642](https://github.com/benoit-bremaud/brasse-bouillon/issues/642)) ([#805](https://github.com/benoit-bremaud/brasse-bouillon/issues/805)) ([f9215f5](https://github.com/benoit-bremaud/brasse-bouillon/commit/f9215f5399d5bd65d48a16b97b04d17e56cd10c8))
* **scan:** mobile matching view — official + equivalents sections (Issue [#700](https://github.com/benoit-bremaud/brasse-bouillon/issues/700)) ([3ee1796](https://github.com/benoit-bremaud/brasse-bouillon/commit/3ee1796a9f2d42d18da97cf2aec7b6786c799447))
* **scan:** mobile matching view — official section + equivalents + low_confidence (Issue [#700](https://github.com/benoit-bremaud/brasse-bouillon/issues/700)) ([#793](https://github.com/benoit-bremaud/brasse-bouillon/issues/793)) ([7266559](https://github.com/benoit-bremaud/brasse-bouillon/commit/72665596a793c0cd7fbd5fa9541d87ff8a58888a))
* **scan:** not-a-beer detection — filter OFF by category + dedicated UI (Issue [#798](https://github.com/benoit-bremaud/brasse-bouillon/issues/798)) ([c8cb456](https://github.com/benoit-bremaud/brasse-bouillon/commit/c8cb456cb306b269d7be7708e14bb3e7786f2c29))
* **scan:** not-a-beer detection — filter OFF by category + dedicated UI (Issue [#798](https://github.com/benoit-bremaud/brasse-bouillon/issues/798)) ([#800](https://github.com/benoit-bremaud/brasse-bouillon/issues/800)) ([8cacaf0](https://github.com/benoit-bremaud/brasse-bouillon/commit/8cacaf0841c4a570168db78b421af40d01716801))
* **scan:** photo fallback CTA on invalid barcode — placeholder for v0.2 photo capture (Issue [#797](https://github.com/benoit-bremaud/brasse-bouillon/issues/797)) ([c1b41f2](https://github.com/benoit-bremaud/brasse-bouillon/commit/c1b41f29589796faf3b5a921c798f637be6a47f8))
* **scan:** photo fallback CTA on invalid barcode — placeholder for v0.2 photo capture (Issue [#797](https://github.com/benoit-bremaud/brasse-bouillon/issues/797)) ([#801](https://github.com/benoit-bremaud/brasse-bouillon/issues/801)) ([f50e599](https://github.com/benoit-bremaud/brasse-bouillon/commit/f50e59912a86612dbefbb3bff63a077d09ef8da8))
* **scan:** pre-flight confirmation modal before community recipe import (Issue [#766](https://github.com/benoit-bremaud/brasse-bouillon/issues/766)) ([a483b39](https://github.com/benoit-bremaud/brasse-bouillon/commit/a483b39f2fe68c051f8a6b0ab16d5a7ac864819b))
* **scan:** progressive 0/5 to 5/5 verification feedback dots (Issue [#638](https://github.com/benoit-bremaud/brasse-bouillon/issues/638)) ([f453902](https://github.com/benoit-bremaud/brasse-bouillon/commit/f45390260e58b88680ba0cb3b7e15a15dcbffaeb))
* **scan:** recognize six physical demo bottles in the offline catalogue ([#1124](https://github.com/benoit-bremaud/brasse-bouillon/issues/1124)) ([80b0588](https://github.com/benoit-bremaud/brasse-bouillon/commit/80b05884da9b78ce2dbaced1bc8d7520ce0fce73))
* **scan:** resolve barcodes against the encyclopedia first (cutover step 1) ([#1189](https://github.com/benoit-bremaud/brasse-bouillon/issues/1189)) ([767e8e1](https://github.com/benoit-bremaud/brasse-bouillon/commit/767e8e167a20a3b964a7750982a4f3637aa083d8))
* **scan:** seed 10 curated public recipes + dual-id helper for community import (Issue [#701](https://github.com/benoit-bremaud/brasse-bouillon/issues/701)) ([86f6dc0](https://github.com/benoit-bremaud/brasse-bouillon/commit/86f6dc0460c209854f816e3f3f0f40dda4615285))
* **scan:** seed 10 curated public recipes + dual-id helper for community import (Issue [#701](https://github.com/benoit-bremaud/brasse-bouillon/issues/701)) ([#768](https://github.com/benoit-bremaud/brasse-bouillon/issues/768)) ([f2890cc](https://github.com/benoit-bremaud/brasse-bouillon/commit/f2890cc1aa8eca0451411f07eb0f1bc45854a0ba))
* **scan:** surface brewery + style names on the scanned beer fiche ([#1185](https://github.com/benoit-bremaud/brasse-bouillon/issues/1185)) ([1a312eb](https://github.com/benoit-bremaud/brasse-bouillon/commit/1a312eb212004bef6f967000553d3c6375b753ea))
* **seed:** add BrewDog DIY Dog as official recipe for Punk IPA ([#911](https://github.com/benoit-bremaud/brasse-bouillon/issues/911)) ([#912](https://github.com/benoit-bremaud/brasse-bouillon/issues/912)) ([5313a9f](https://github.com/benoit-bremaud/brasse-bouillon/commit/5313a9f68a1bafe2371191cbb5775e559c528de5))
* **seed:** add BrewDog DIY Dog as official recipe for Punk IPA (Issue [#911](https://github.com/benoit-bremaud/brasse-bouillon/issues/911)) ([2c647b4](https://github.com/benoit-bremaud/brasse-bouillon/commit/2c647b4c53b60b19a3ab6646bfb9b8a1bfbf74e4))
* **social:** add SocialFeedScreen demo-mode community mockup ([966f45d](https://github.com/benoit-bremaud/brasse-bouillon/commit/966f45dc533536eb4fd818cb62bfd3e2620581dc))
* **ui:** compact brand header + beer-gradient background + refreshed app captures ([#1093](https://github.com/benoit-bremaud/brasse-bouillon/issues/1093)) ([c75bdee](https://github.com/benoit-bremaud/brasse-bouillon/commit/c75bdee7550102340ff8dd070c66e1d1db861575))
* **ui:** promote the corner-status-badge pattern into the Badge primitive ([a228370](https://github.com/benoit-bremaud/brasse-bouillon/commit/a228370bfe6573395f48e66f12ba44f6b14bfdc0))


### Bug Fixes

* **academy:** wire 9 article CTAs to existing calculators (Issue [#616](https://github.com/benoit-bremaud/brasse-bouillon/issues/616)) ([#826](https://github.com/benoit-bremaud/brasse-bouillon/issues/826)) ([2d405eb](https://github.com/benoit-bremaud/brasse-bouillon/commit/2d405ebae725157919e21f04f52d88075363c0cf))
* **academy:** wire all 8 calculator CTAs to existing calculators (Issue [#616](https://github.com/benoit-bremaud/brasse-bouillon/issues/616)) ([5fe9f02](https://github.com/benoit-bremaud/brasse-bouillon/commit/5fe9f0228636f2d3126abc76022e11280c0ad335))
* **android:** wire usesCleartextTraffic via expo-build-properties plugin ([0d933f0](https://github.com/benoit-bremaud/brasse-bouillon/commit/0d933f0ecc2e207f31070d74dc88881a031394c1))
* **android:** wire usesCleartextTraffic via expo-build-properties plugin ([#762](https://github.com/benoit-bremaud/brasse-bouillon/issues/762)) ([e81efc6](https://github.com/benoit-bremaud/brasse-bouillon/commit/e81efc62655aaad16635a6244e1ebe71229cbbc3))
* **auth:** restore a stored demo session on bootstrap without hitting the backend ([fab1490](https://github.com/benoit-bremaud/brasse-bouillon/commit/fab1490c3479bb8b132c1ce511370640263f2519))
* **batches:** float the status badge to the top-right corner of the card ([536f466](https://github.com/benoit-bremaud/brasse-bouillon/commit/536f4661a1cb4f4ef000c693b86bf68b78c06a7d))
* **batches:** prevent the recipe title from overlapping the status badge ([7b13b4d](https://github.com/benoit-bremaud/brasse-bouillon/commit/7b13b4d908d2c9b1a0f6be49213b566d0ad53f95))
* **batches:** show recipe name on the batches list instead of the truncated id ([eb0e7de](https://github.com/benoit-bremaud/brasse-bouillon/commit/eb0e7de11869460b76cb0612599b797cb3c2f9c0))
* **catalog:** address Codex P1 + Sonar QG (coverage + duplication) on PR [#845](https://github.com/benoit-bremaud/brasse-bouillon/issues/845) (Issue [#779](https://github.com/benoit-bremaud/brasse-bouillon/issues/779)) ([b594567](https://github.com/benoit-bremaud/brasse-bouillon/commit/b5945671abe98ef463206b79fe5183782a58b738))
* **catalog:** address Copilot review on PR [#845](https://github.com/benoit-bremaud/brasse-bouillon/issues/845) — stats mapping bug + privacy guard + route-ordering e2e + entry-point tests (Issue [#779](https://github.com/benoit-bremaud/brasse-bouillon/issues/779)) ([6b4d7e7](https://github.com/benoit-bremaud/brasse-bouillon/commit/6b4d7e72e6804e1b90251a50244e7b72461075ee))
* **catalog:** address Copilot round-3 + lint + Sonar QG on PR [#845](https://github.com/benoit-bremaud/brasse-bouillon/issues/845) (Issue [#779](https://github.com/benoit-bremaud/brasse-bouillon/issues/779)) ([4342d35](https://github.com/benoit-bremaud/brasse-bouillon/commit/4342d35c4393d67e9e73b071a3152acd8358839d))
* **dashboard:** restructure header into two rows so it stops cramping ([bb4ad99](https://github.com/benoit-bremaud/brasse-bouillon/commit/bb4ad99e073f027133609732f6b3b6eb5021a581))
* **dashboard:** truncate header identity text instead of overlapping the action buttons ([170ce0b](https://github.com/benoit-bremaud/brasse-bouillon/commit/170ce0beb003f554339ef52a06fa45eb80f444ee))
* **dashboard:** truncate header identity text instead of overlapping the action buttons ([#840](https://github.com/benoit-bremaud/brasse-bouillon/issues/840)) ([b56d006](https://github.com/benoit-bremaud/brasse-bouillon/commit/b56d00612d971b9efd19080e43c0a4001349b0b6))
* **eas:** preserve workspace package.json + drop wrong encyclopedia URL ([64d13c5](https://github.com/benoit-bremaud/brasse-bouillon/commit/64d13c5a56f7fef5e2ca247c906f579f7dede792))
* **labels:** make Atelier d'étiquettes scrollable in empty + populated state ([cf9f7ee](https://github.com/benoit-bremaud/brasse-bouillon/commit/cf9f7ee42a89a305dabd2a38004aed0ba47e0e79))
* **labels:** make Atelier d'étiquettes scrollable in empty + populated state ([#839](https://github.com/benoit-bremaud/brasse-bouillon/issues/839)) ([599775d](https://github.com/benoit-bremaud/brasse-bouillon/commit/599775d4154275d7b21cd4b9e3ddcf4e30aa31b3))
* make API and beer-encyclopedia reachable from Expo Go via Tailscale/LAN ([e07479b](https://github.com/benoit-bremaud/brasse-bouillon/commit/e07479bcc7308676fdff77332b19f9a1bb1bdab9))
* **mobile-app:** pre-merge review fixes on encyclopedia fallback (PR [#871](https://github.com/benoit-bremaud/brasse-bouillon/issues/871)) ([a0bf1bc](https://github.com/benoit-bremaud/brasse-bouillon/commit/a0bf1bc21e9c02b9faeb4bd4b77f1dbb0302eba3))
* **mobile/auth:** keep login fields visible above the keyboard ([#1080](https://github.com/benoit-bremaud/brasse-bouillon/issues/1080)) ([e118918](https://github.com/benoit-bremaud/brasse-bouillon/commit/e118918617ea5da5103af316f29ab8797bb21528))
* **mobile/batches:** localize batch detail screen to French ([#1084](https://github.com/benoit-bremaud/brasse-bouillon/issues/1084)) ([66fc5bb](https://github.com/benoit-bremaud/brasse-bouillon/commit/66fc5bb3488b1a7d49c23fc4f6696890ef6b6f65))
* **mobile/batches:** pin demo fermentation tracker to J+5 / J+14 ([#1067](https://github.com/benoit-bremaud/brasse-bouillon/issues/1067)) ([b54874d](https://github.com/benoit-bremaud/brasse-bouillon/commit/b54874d0bc624e149730a0dc46582d3749867fc2))
* **mobile/ingredients:** EN-only labels for use-case parsing (Codex P1 + i18n) ([7381ea8](https://github.com/benoit-bremaud/brasse-bouillon/commit/7381ea85727336f260dfb64b28a2e3e5ab671709))
* **mobile:** address Copilot + Codex review on BeerMugLoader ([ee88015](https://github.com/benoit-bremaud/brasse-bouillon/commit/ee8801584d57158aa1ae5230347a69c2e3130438))
* **mobile:** address Copilot round-2 a11y feedback on BeerMugLoader ([fd0692c](https://github.com/benoit-bremaud/brasse-bouillon/commit/fd0692c0b9f53d6c5a973e81e8a14dd2b086c4d1))
* **mobile:** remove accidental top-level runtimeVersion (Codex P1) ([3a9e1a2](https://github.com/benoit-bremaud/brasse-bouillon/commit/3a9e1a28fc76711596dfd45e0e984083285bf84f))
* **recipes:** address PR [#917](https://github.com/benoit-bremaud/brasse-bouillon/issues/917) review comments — virtualization + i18n + brittle tests ([4c6de06](https://github.com/benoit-bremaud/brasse-bouillon/commit/4c6de068da29f53d06fb82b812a8ef99ef7de742))
* **recipes:** address PR [#917](https://github.com/benoit-bremaud/brasse-bouillon/issues/917) round 2 review comments — loading guards + per-query error + double padding ([23d8f1e](https://github.com/benoit-bremaud/brasse-bouillon/commit/23d8f1e10bc5e2a8709b541286c1f52ebad1a512))
* **recipes:** rename hub to "Recettes" to drop the duplicated section title ([c96ac47](https://github.com/benoit-bremaud/brasse-bouillon/commit/c96ac47737eab98b04bf19fa6890f6954861055a))
* **recipes:** translate the Brewing tab to French ([#1172](https://github.com/benoit-bremaud/brasse-bouillon/issues/1172)) ([#1174](https://github.com/benoit-bremaud/brasse-bouillon/issues/1174)) ([795cdf7](https://github.com/benoit-bremaud/brasse-bouillon/commit/795cdf73615be9a8cdac683a78f42afb726d3b60))
* **review:** address PR [#1012](https://github.com/benoit-bremaud/brasse-bouillon/issues/1012) Copilot + Codex feedback ([46345ec](https://github.com/benoit-bremaud/brasse-bouillon/commit/46345ecdbd3d150cfe3d4ea9a8094d951a2d6873))
* **review:** address PR [#1014](https://github.com/benoit-bremaud/brasse-bouillon/issues/1014) Copilot + Codex feedback on demo dashboard ([e0317d2](https://github.com/benoit-bremaud/brasse-bouillon/commit/e0317d2fa04a5ea034a8dcb46aaf1ca2ba259590))
* **review:** address PR [#1016](https://github.com/benoit-bremaud/brasse-bouillon/issues/1016) Copilot feedback on fermentation tracker ([9e32c7d](https://github.com/benoit-bremaud/brasse-bouillon/commit/9e32c7d9f2ba702e059030c65718a39729fc3324))
* **scan:** align retry button color with brand primary (Issue [#641](https://github.com/benoit-bremaud/brasse-bouillon/issues/641)) ([4c2419b](https://github.com/benoit-bremaud/brasse-bouillon/commit/4c2419babc5e07a73a2bcc8eaf155efb70211414))
* **scan:** await findByText for matching section to fix CI timing flake ([#700](https://github.com/benoit-bremaud/brasse-bouillon/issues/700)) ([0cdcaab](https://github.com/benoit-bremaud/brasse-bouillon/commit/0cdcaab1f3adbb9daeebb2b96b754ff3df2df62f))
* **scan:** correct invalid EAN-13 checksums for Karmeliet, Westmalle, Duvel ([4690ceb](https://github.com/benoit-bremaud/brasse-bouillon/commit/4690cebc15be5538740de957f057c26674c9544b)), closes [#807](https://github.com/benoit-bremaud/brasse-bouillon/issues/807)
* **scan:** correct invalid EAN-13 checksums for Karmeliet, Westmalle, Duvel ([#920](https://github.com/benoit-bremaud/brasse-bouillon/issues/920)) ([f746bdd](https://github.com/benoit-bremaud/brasse-bouillon/commit/f746bdde632562b7a5c460fe7bba9be1f6172ac3)), closes [#807](https://github.com/benoit-bremaud/brasse-bouillon/issues/807)
* **scan:** suppress trailing onPress after long-press + cover demo override gesture (Codex P1 + SonarCloud [#805](https://github.com/benoit-bremaud/brasse-bouillon/issues/805)) ([e5d5745](https://github.com/benoit-bremaud/brasse-bouillon/commit/e5d57453086fabf6fa97b491cdd38f4fa60e8c81))
* **scan:** surface low_confidence warning regardless of equivalents (Codex P2 [#700](https://github.com/benoit-bremaud/brasse-bouillon/issues/700)) ([d8f4bd8](https://github.com/benoit-bremaud/brasse-bouillon/commit/d8f4bd88c74bd43745999c2c26ccdfb449816367))
* **scan:** translate consent snapshot to human-readable French (Issue [#640](https://github.com/benoit-bremaud/brasse-bouillon/issues/640)) ([1a46a8f](https://github.com/benoit-bremaud/brasse-bouillon/commit/1a46a8f1725b74020e5f14610a906cd23575fdbb))
* **seed:** scope DIY Dog official flag to mobile demo + add DE 0,33L EAN alias ([2e540ea](https://github.com/benoit-bremaud/brasse-bouillon/commit/2e540ea1690fa37e91496917c8c7ded46a07cfd7))


### Refactors

* **account:** align dashboard header button + accessibility label with 'Mon compte' (Issue [#644](https://github.com/benoit-bremaud/brasse-bouillon/issues/644)) ([09cf694](https://github.com/benoit-bremaud/brasse-bouillon/commit/09cf694bde2c552ceb45bc5e2cd0b4a2a56f6f75))
* **account:** merge 'Paramètres globaux' into 'Mon compte' (Issue [#644](https://github.com/benoit-bremaud/brasse-bouillon/issues/644)) ([#831](https://github.com/benoit-bremaud/brasse-bouillon/issues/831)) ([06c4be8](https://github.com/benoit-bremaud/brasse-bouillon/commit/06c4be854e982aaffaa7e1ac9b257dc1aca98ddc))
* **account:** merge "Paramètres globaux" into "Mon compte" (Issue [#644](https://github.com/benoit-bremaud/brasse-bouillon/issues/644)) ([987ca33](https://github.com/benoit-bremaud/brasse-bouillon/commit/987ca33671bd10791774b566f1f013715866fb67))
* **dashboard:** remove 'Période d'analyse' widget from home (Issue [#646](https://github.com/benoit-bremaud/brasse-bouillon/issues/646)) ([#827](https://github.com/benoit-bremaud/brasse-bouillon/issues/827)) ([3876347](https://github.com/benoit-bremaud/brasse-bouillon/commit/3876347542cea5f97763901dd205a8db6336d8b1))
* **dashboard:** remove "Période d'analyse" widget from home (Issue [#646](https://github.com/benoit-bremaud/brasse-bouillon/issues/646)) ([5f5cb88](https://github.com/benoit-bremaud/brasse-bouillon/commit/5f5cb88e8c7e5aafe24708d63b5b2b76a0a0eae1))
* **demo:** KISS — trim batch dataset to the fil-rouge story ([d28e55e](https://github.com/benoit-bremaud/brasse-bouillon/commit/d28e55e260fc2edcb7b55a7d6f67f8a9d8d92173))
* **labels:** address Copilot comments on PR [#837](https://github.com/benoit-bremaud/brasse-bouillon/issues/837) — drop dead filter + suite-level mock restore (Issue [#629](https://github.com/benoit-bremaud/brasse-bouillon/issues/629)) ([c6c8079](https://github.com/benoit-bremaud/brasse-bouillon/commit/c6c80798839579aa72c1f9867b162b30faad4e1b))
* **labels:** drop unused styles.list left over from FlatList → .map() conversion (PR [#839](https://github.com/benoit-bremaud/brasse-bouillon/issues/839)) ([781a493](https://github.com/benoit-bremaud/brasse-bouillon/commit/781a49324b58e36e14f1121c1761f23213a3e8b4))
* **mobile/ingredients:** consume GET /catalog/* endpoints (URL swap part) ([b4e5cb9](https://github.com/benoit-bremaud/brasse-bouillon/commit/b4e5cb9cd420041ddc2b79f77c6cff6d9e9d83dc))
* **mobile/ingredients:** consume GET /catalog/* endpoints (URL swap part) ([#906](https://github.com/benoit-bremaud/brasse-bouillon/issues/906)) ([1e195ab](https://github.com/benoit-bremaud/brasse-bouillon/commit/1e195ab5e83154dd36c54abdb56959e14c75c5c8))
* **mobile/ingredients:** finish [#887](https://github.com/benoit-bremaud/brasse-bouillon/issues/887) — drop ingredients.api recipe-crawl ([117aba8](https://github.com/benoit-bremaud/brasse-bouillon/commit/117aba8943745185f5af130a716129ab5fb38f4c))
* **navigation:** redesign bottom tab bar — promote Scan + Profil, demote Boutique + Outils (Issue [#613](https://github.com/benoit-bremaud/brasse-bouillon/issues/613)) ([dd96e42](https://github.com/benoit-bremaud/brasse-bouillon/commit/dd96e42889879e0a537d6dbf47b4ce8e906d4cfc))
* **navigation:** redesign bottom tab bar — promote Scan + Profil, demote Boutique + Outils (Issue [#613](https://github.com/benoit-bremaud/brasse-bouillon/issues/613)) ([#844](https://github.com/benoit-bremaud/brasse-bouillon/issues/844)) ([ed02d47](https://github.com/benoit-bremaud/brasse-bouillon/commit/ed02d4796fdd6dccce9226b9c39cd915366056a8))
* **scan:** move BeerInfoCardScreen data-fetching to TanStack Query ([#1160](https://github.com/benoit-bremaud/brasse-bouillon/issues/1160)) ([f440d27](https://github.com/benoit-bremaud/brasse-bouillon/commit/f440d270feb98d89f2f17059710e12b359c4c554))


### Documentation

* **env:** document the .env workflow in every package README ([b159f29](https://github.com/benoit-bremaud/brasse-bouillon/commit/b159f2921698e85f8a20be59583337baaeb460e4))
* **mobile/misc:** fix misleading docblock (Copilot catch on PR [#906](https://github.com/benoit-bremaud/brasse-bouillon/issues/906)) ([4b04e56](https://github.com/benoit-bremaud/brasse-bouillon/commit/4b04e569d45f1182d19cecadee85240e7a737aec))
* **ydays:** prepare 27 mai soutenance — VitePress site + content (replaces [#578](https://github.com/benoit-bremaud/brasse-bouillon/issues/578)) ([#957](https://github.com/benoit-bremaud/brasse-bouillon/issues/957)) ([577861d](https://github.com/benoit-bremaud/brasse-bouillon/commit/577861dfc47a04d2f0af3a198ecb948ddcdacc9a))
* **ydays:** prepare 27 mai soutenance — VitePress site + content + supporting updates ([7015904](https://github.com/benoit-bremaud/brasse-bouillon/commit/7015904c6482b9979570d1dd9b6a7f71d9715a1d))

## [Unreleased]

### Planned for `v0.1.0`

See the full backlog in the plan file
`~/.claude/plans/si-tu-te-souviens-sorted-lark.md` (69 items B-01 → B-69)
and the 9 dedicated brainstorms. Top items blocking the soutenance
2026-05-27 demo:

- **B-39** Scan recognition + recipe match + community + import pipeline
  (⭐ demo hero — currently capture-only)
- **B-13 bis** Wire the Auth backend so real login / signup / forgot
  password succeed (today all three return `Network request failed`)
- **B-08** Rewrite Mes Brassins detail with real metadata, timestamps,
  measurements, notes, recipe FK, photos
- **B-28 / B-29** Fix Labels UI bugs (validation CTA hidden behind tab
  bar, live preview clipped)
- **B-45** Merge Paramètres globaux into the Profil screen (KISS/YAGNI/DRY)
- **B-65** Remove the redundant Explore hub
- **B-69** Move "Période d'analyse" out of the home into a dedicated
  Statistiques section

## [0.1.0-alpha1] — 2026-04-23 — Pre-soutenance audit baseline

First explicit version of the app. Resets the accidental scaffold-default
`1.0.0` in `package.json` + `app.json` down to an honest alpha: the
backend is not wired (B-13 bis), core flows are incomplete (scan
recognition, batch detail, shop e-commerce), and many UX issues remain.
Calling this `1.0.0` would have been misleading.

This version freezes the **v0 screenshot audit** — 204 captures of every
reachable screen — under
[docs/ydays/public/screenshots/v0/](../../docs/ydays/public/screenshots/v0/).
The audit drives the entire refactor backlog.

### Added

- `packages/mobile-app/CHANGELOG.md` (this file).
- Version strings in `package.json` and `app.json` set to
  `0.1.0-alpha1`.

### Known limitations (carried forward)

- Auth backend unwired — use `Connexion démo` only.
- Scan flow captures but does not recognise / match / import.
- Mes Brassins detail shows only a 3-step hardcoded timeline.
- Labels validation CTA hidden behind the bottom tab bar.
- Shop is catalogue-preview only (`À VENIR` everywhere).

### Notes

- No `v0.1.0-alpha1` git tag has been created yet. Per the global tag
  convention, the tag cuts from `main` only, after the release PR
  merges. The owner creates the tag via CLI (`git tag v0.1.0-alpha1 &&
  git push origin v0.1.0-alpha1`).
- Android `versionName` / `versionCode` + iOS `CFBundle*` are managed
  by Expo at build time; no manual override needed at this stage.
- The "About" version line inside the app (Compte & Paramètres screen)
  is scoped with the merged screen (B-45 / B-46) and will ship with
  `v0.1.0-alpha2` or later.
