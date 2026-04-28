# Changelog — @brasse-bouillon/mobile-app

Every user-visible change lands here. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
with strict semver prereleases (`-alphaN` / `-betaN` / `-rcN`).

Tags for this package follow the monorepo component pattern
**`mobile-app-vX.Y.Z`** (not plain `vX.Y.Z`) — see the release
workflow in the root [CONTRIBUTING.md](../../CONTRIBUTING.md#release-workflow)
for the full convention.

Tag lifecycle:

- Tags are created **automatically by release-please** when the release
  PR is merged into `main`. Do not create tags manually.
- Once created, tags are immutable (update / deletion blocked by
  repository ruleset — see
  [.github/tag-protection.md](../../.github/tag-protection.md)).
- Failed publishes keep their tag as an audit marker — never delete,
  always bump to the next version.
- No tag reuse, ever.

## [0.1.10-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/mobile-app-v0.1.9-alpha1...mobile-app-v0.1.10-alpha1) (2026-04-28)


### Bug Fixes

* **android:** allow cleartext HTTP traffic for LAN backend testing ([789f203](https://github.com/benoit-bremaud/brasse-bouillon/commit/789f20357bc1a5a3f960185c36b9f01e667df335))
* **android:** allow cleartext HTTP traffic for LAN backend testing ([#759](https://github.com/benoit-bremaud/brasse-bouillon/issues/759)) ([7b4cd67](https://github.com/benoit-bremaud/brasse-bouillon/commit/7b4cd6729ef9a0a1a13d2318d0ee27677b90fae6))

## [0.1.9-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/mobile-app-v0.1.8-alpha1...mobile-app-v0.1.9-alpha1) (2026-04-28)


### Bug Fixes

* **ci:** sync stale version files (app.json, encyclopedia) + wire release-please ([#756](https://github.com/benoit-bremaud/brasse-bouillon/issues/756)) ([7ae60c0](https://github.com/benoit-bremaud/brasse-bouillon/commit/7ae60c0da47daa4fc4a8cc8f71d917da3745ac0a))
* **ci:** sync stale version files + wire release-please for app.json + encyclopedia/package.json ([0aef8bb](https://github.com/benoit-bremaud/brasse-bouillon/commit/0aef8bbc7e7c0880c142b54312553fe7c1d7b3a7))

## [0.1.8-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/mobile-app-v0.1.7-alpha1...mobile-app-v0.1.8-alpha1) (2026-04-28)


### Features

* **scan:** add La Goudale as a 4th demo bottle (real local bottle) ([8449ac1](https://github.com/benoit-bremaud/brasse-bouillon/commit/8449ac1314749abb6ec91822eeb80ef49d88e4f3))
* **scan:** add La Goudale as a 4th demo bottle for live testing ([#754](https://github.com/benoit-bremaud/brasse-bouillon/issues/754)) ([ae00270](https://github.com/benoit-bremaud/brasse-bouillon/commit/ae0027093d22ee913df3413c691fa85a0ede8015))


### Bug Fixes

* **scan:** update seed test assertions + prettier format for La Goudale (7 beers) ([a8fda37](https://github.com/benoit-bremaud/brasse-bouillon/commit/a8fda370caa5ee188d892b60a947ac4b53bbb6a0))

## [0.1.7-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/mobile-app-v0.1.6-alpha1...mobile-app-v0.1.7-alpha1) (2026-04-28)


### Bug Fixes

* **scan:** correct invalid EAN-13 check digits in demo catalog (printed labels not recognized) ([#750](https://github.com/benoit-bremaud/brasse-bouillon/issues/750)) ([9c6e4fb](https://github.com/benoit-bremaud/brasse-bouillon/commit/9c6e4fb255be0890a16410be477782eac3cde70a))
* **scan:** correct invalid EAN-13 check digits in demo catalog + scan_catalog seed ([148a2b9](https://github.com/benoit-bremaud/brasse-bouillon/commit/148a2b99eb45b61f74018c7465b5c0af34415d09))
* **scan:** correct Rochefort 10 EAN check digit (115 not 112) ([1e85fb4](https://github.com/benoit-bremaud/brasse-bouillon/commit/1e85fb47b9e255b56bd88ebd6e7cd82a75bc6263))

## [0.1.6-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/mobile-app-v0.1.5-alpha1...mobile-app-v0.1.6-alpha1) (2026-04-27)


### Features

* **recipes:** import community recipe from beer info card (Issue [#601](https://github.com/benoit-bremaud/brasse-bouillon/issues/601)) ([f0efaf9](https://github.com/benoit-bremaud/brasse-bouillon/commit/f0efaf9b7923413bec1ff718777f46156dbea88a))
* **recipes:** import community recipe from beer info card (Issue [#601](https://github.com/benoit-bremaud/brasse-bouillon/issues/601)) ([#743](https://github.com/benoit-bremaud/brasse-bouillon/issues/743)) ([c36d378](https://github.com/benoit-bremaud/brasse-bouillon/commit/c36d3787a1a9d8db58c7e94b06dd67a6cbba5e07))
* **scan:** mobile data layer for /scan/lookup endpoint ([#697](https://github.com/benoit-bremaud/brasse-bouillon/issues/697)) ([5934f06](https://github.com/benoit-bremaud/brasse-bouillon/commit/5934f064ad38d0d293ceb08bd7299b4fe343d201)), closes [#594](https://github.com/benoit-bremaud/brasse-bouillon/issues/594)
* **scan:** mobile data layer for /scan/lookup endpoint ([#697](https://github.com/benoit-bremaud/brasse-bouillon/issues/697)) ([#731](https://github.com/benoit-bremaud/brasse-bouillon/issues/731)) ([e2e04d7](https://github.com/benoit-bremaud/brasse-bouillon/commit/e2e04d715c896be9b0c3b52e37c1e7389c841780)), closes [#594](https://github.com/benoit-bremaud/brasse-bouillon/issues/594)
* **scan:** mobile UI info card with hero + lazy folds (Issue [#698](https://github.com/benoit-bremaud/brasse-bouillon/issues/698)) ([1674681](https://github.com/benoit-bremaud/brasse-bouillon/commit/16746815f4dfaa2d71813a93a6a30476b5ff54ce)), closes [#594](https://github.com/benoit-bremaud/brasse-bouillon/issues/594)
* **scan:** mobile UI info card with hero + lazy folds (Issue [#698](https://github.com/benoit-bremaud/brasse-bouillon/issues/698)) ([#732](https://github.com/benoit-bremaud/brasse-bouillon/issues/732)) ([881253b](https://github.com/benoit-bremaud/brasse-bouillon/commit/881253b3c999003be571e032098911763271bdc4)), closes [#594](https://github.com/benoit-bremaud/brasse-bouillon/issues/594)


### Bug Fixes

* **scan:** address Codex P2 + Copilot review on PR [#731](https://github.com/benoit-bremaud/brasse-bouillon/issues/731) ([5cb4353](https://github.com/benoit-bremaud/brasse-bouillon/commit/5cb435329bccc6a4f42a4cd4e14ddf02f67beda6))
* **scan:** address Copilot review on PR [#732](https://github.com/benoit-bremaud/brasse-bouillon/issues/732) ([663e71b](https://github.com/benoit-bremaud/brasse-bouillon/commit/663e71b321f7c582b37abec6cf40e696e0534dcc)), closes [#698](https://github.com/benoit-bremaud/brasse-bouillon/issues/698)
* **scan:** drop wordBreak style cast to lift SonarCloud Maintainability rating ([16f9d1d](https://github.com/benoit-bremaud/brasse-bouillon/commit/16f9d1de77335fb05e21d36b82c4c6c42c068a2a))
* **scan:** map demo equivalent recipes to real demoRecipes IDs (Codex P1) ([269299b](https://github.com/benoit-bremaud/brasse-bouillon/commit/269299b225bb89911fde8c71800d613876c1ec89)), closes [#698](https://github.com/benoit-bremaud/brasse-bouillon/issues/698)
* **scan:** minimize +html.tsx diff to lift remaining SonarCloud rating ([238c42d](https://github.com/benoit-bremaud/brasse-bouillon/commit/238c42d8522977d7e6d8ad2a8a4b27967c329d98))
* **scan:** polish batch on BeerInfoCardScreen (closes [#734](https://github.com/benoit-bremaud/brasse-bouillon/issues/734) [#735](https://github.com/benoit-bremaud/brasse-bouillon/issues/735) [#736](https://github.com/benoit-bremaud/brasse-bouillon/issues/736) [#737](https://github.com/benoit-bremaud/brasse-bouillon/issues/737)) ([a166aba](https://github.com/benoit-bremaud/brasse-bouillon/commit/a166aba05ed560a5fe8454986880019f16435d77))
* **scan:** polish batch on BeerInfoCardScreen (closes [#734](https://github.com/benoit-bremaud/brasse-bouillon/issues/734) [#735](https://github.com/benoit-bremaud/brasse-bouillon/issues/735) [#736](https://github.com/benoit-bremaud/brasse-bouillon/issues/736) [#737](https://github.com/benoit-bremaud/brasse-bouillon/issues/737)) ([#741](https://github.com/benoit-bremaud/brasse-bouillon/issues/741)) ([a6f448a](https://github.com/benoit-bremaud/brasse-bouillon/commit/a6f448a56f137ad2f809615ecd07653bf24d772f))
* **scan:** remove duplicate navigation trigger from import success alert (Codex P1) ([1fb2670](https://github.com/benoit-bremaud/brasse-bouillon/commit/1fb2670edbf11b61bb5c56a51f458fbc81d1e21a))
* **scan:** strip explanatory comments from glanceCellValue + scrollContent ([3cd2444](https://github.com/benoit-bremaud/brasse-bouillon/commit/3cd24443c931f219189f62b2f0463e61b7869ba5))
* **scan:** unconditional wordBreak style to lift SonarCloud coverage on PR [#741](https://github.com/benoit-bremaud/brasse-bouillon/issues/741) ([61a64d6](https://github.com/benoit-bremaud/brasse-bouillon/commit/61a64d6ae851b1b242609cb328588684adad809a))

## [0.1.5-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/mobile-app-v0.1.4-alpha1...mobile-app-v0.1.5-alpha1) (2026-04-24)


### Chores

* **mobile-app:** Synchronize app versions

## [0.1.4-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/mobile-app-v0.1.3-alpha1...mobile-app-v0.1.4-alpha1) (2026-04-24)


### Features

* **mobile-app:** add About footer exposing version, commit, build date ([dbeb2df](https://github.com/benoit-bremaud/brasse-bouillon/commit/dbeb2dfb0a6e1de815c3e45d3c11dffa04f62766))
* **mobile-app:** B-70 add About footer (version, commit, build date) ([#694](https://github.com/benoit-bremaud/brasse-bouillon/issues/694)) ([7d98b09](https://github.com/benoit-bremaud/brasse-bouillon/commit/7d98b09f29ccd589be8456edce1fabbc22a8bb5e))

## [0.1.3-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/mobile-app-v0.1.2-alpha1...mobile-app-v0.1.3-alpha1) (2026-04-24)


### Features

* **labels:** render Loi Évin disclaimer on every label preview ([4215722](https://github.com/benoit-bremaud/brasse-bouillon/commit/42157225017f0249ce1f5f8b0a373783f1b16a25)), closes [#634](https://github.com/benoit-bremaud/brasse-bouillon/issues/634)
* **labels:** render Loi Évin disclaimer on every label preview ([#684](https://github.com/benoit-bremaud/brasse-bouillon/issues/684)) ([a19de8f](https://github.com/benoit-bremaud/brasse-bouillon/commit/a19de8f93d3353dc4f3609ec0433e52a22d69b07)), closes [#634](https://github.com/benoit-bremaud/brasse-bouillon/issues/634)


### Bug Fixes

* **dashboard:** restore Ingrédients access + rename header action styles ([e975444](https://github.com/benoit-bremaud/brasse-bouillon/commit/e9754442b30a4e5638fb5ce89abc159f7b326e89))
* **labels:** address Copilot R1 — a11y, constants module, compliance tests ([81ead12](https://github.com/benoit-bremaud/brasse-bouillon/commit/81ead126d0588058c78b9f9d74d80044d3208227))
* **mobile-app:** drop accidental top-level expo.runtimeVersion in app.json ([10c0afa](https://github.com/benoit-bremaud/brasse-bouillon/commit/10c0afad566bae0759db76e8dacfc018d8829c09))
* **shop:** category-aware price unit instead of hardcoded €/kg ([#683](https://github.com/benoit-bremaud/brasse-bouillon/issues/683)) ([93686de](https://github.com/benoit-bremaud/brasse-bouillon/commit/93686de7f8ff2a7bca99759bbb3211e6114e7ba8)), closes [#649](https://github.com/benoit-bremaud/brasse-bouillon/issues/649)
* **shop:** use category-aware price unit instead of hardcoded €/kg ([c9fe484](https://github.com/benoit-bremaud/brasse-bouillon/commit/c9fe4841239eeda34d663a6c7c6d625b7c0a6fcb)), closes [#649](https://github.com/benoit-bremaud/brasse-bouillon/issues/649)
* **shop:** use interface for Product + iterate map keys in test ([6837295](https://github.com/benoit-bremaud/brasse-bouillon/commit/6837295a0e23a26dd28d6d2d49febd8280dff820))


### Refactors

* **dashboard:** extract HeaderActionButton to drop SonarQube duplication ([5d9af9c](https://github.com/benoit-bremaud/brasse-bouillon/commit/5d9af9ca3b646cd328c0ffb56881502fc90521b0))
* **dashboard:** factorize MORE_SECTIONS via factory helpers (DRY) ([03945ab](https://github.com/benoit-bremaud/brasse-bouillon/commit/03945abc3079393746fffda40158f0c8e790bfd4))
* **dashboard:** remove Navigation rapide cards from home ([f0f8597](https://github.com/benoit-bremaud/brasse-bouillon/commit/f0f8597d1c33179712ac53876636eb892533ad31))
* **dashboard:** remove Navigation rapide cards from home ([#682](https://github.com/benoit-bremaud/brasse-bouillon/issues/682)) ([ad9bd2b](https://github.com/benoit-bremaud/brasse-bouillon/commit/ad9bd2bd9cf2f0f6b31263089dcd8f38027e3c15)), closes [#614](https://github.com/benoit-bremaud/brasse-bouillon/issues/614)
* **labels:** extract LabelLegalDisclaimerText to drop SonarQube duplication ([3772295](https://github.com/benoit-bremaud/brasse-bouillon/commit/377229558edd0a07fa7901a678dd0e25322fea85))

## [0.1.2-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/mobile-app-v0.1.1-alpha1...mobile-app-v0.1.2-alpha1) (2026-04-24)


### Bug Fixes

* **labels:** clear bottom tab bar on Sélection CTA and Éditeur preview ([c988b4e](https://github.com/benoit-bremaud/brasse-bouillon/commit/c988b4e9415c8dbe123444ff5f3a499458d9ee8f)), closes [#596](https://github.com/benoit-bremaud/brasse-bouillon/issues/596) [#597](https://github.com/benoit-bremaud/brasse-bouillon/issues/597)
* **labels:** clear bottom tab bar on Sélection CTA and Éditeur preview ([#677](https://github.com/benoit-bremaud/brasse-bouillon/issues/677)) ([81d43db](https://github.com/benoit-bremaud/brasse-bouillon/commit/81d43db1b2ecd8a59ce7537e42e411bb44c0f2b1)), closes [#596](https://github.com/benoit-bremaud/brasse-bouillon/issues/596) [#597](https://github.com/benoit-bremaud/brasse-bouillon/issues/597)
* **labels:** keyboardShouldPersistTaps + drop double card spacing ([42f44cc](https://github.com/benoit-bremaud/brasse-bouillon/commit/42f44cc4a2b847ede53b51ad3144208831e60733))

## [0.1.1-alpha1](https://github.com/benoit-bremaud/brasse-bouillon/compare/mobile-app-v0.1.0-alpha1...mobile-app-v0.1.1-alpha1) (2026-04-24)


### Features

* **mobile-app:** enable EAS preview APK builds with OTA updates ([779dc87](https://github.com/benoit-bremaud/brasse-bouillon/commit/779dc873036165aeef4098bf72aaee5fabefb914))
* **mobile-app:** enable EAS preview APK builds with OTA updates ([#556](https://github.com/benoit-bremaud/brasse-bouillon/issues/556)) ([75dfd85](https://github.com/benoit-bremaud/brasse-bouillon/commit/75dfd859d60d73e1aea79f3d9aa52a59bf17d051))
* **mobile-app:** harmonize screens and navigation + yellow background ([9542536](https://github.com/benoit-bremaud/brasse-bouillon/commit/9542536a83d0bc1599ab56c2f15bdaae053f7a1c))
* **mobile-app:** port Fabien's screen harmonization + yellow background ([#553](https://github.com/benoit-bremaud/brasse-bouillon/issues/553)) ([218c782](https://github.com/benoit-bremaud/brasse-bouillon/commit/218c7821f825aa0003048189bb803b6c1de476ab))


### Bug Fixes

* **ingredients:** align hop/yeast counts with their list screen source ([eb1dc15](https://github.com/benoit-bremaud/brasse-bouillon/commit/eb1dc152de11e64bb890e6d08f799a4b29a7fe20))
* **ingredients:** count categories from per-category demo arrays (not demoIngredients) ([4afa8b5](https://github.com/benoit-bremaud/brasse-bouillon/commit/4afa8b5b92bccb9b3f542e03d5621f50fdf4d06a))
* **ingredients:** counter matches per-category demo arrays (closes [#623](https://github.com/benoit-bremaud/brasse-bouillon/issues/623)) ([#668](https://github.com/benoit-bremaud/brasse-bouillon/issues/668)) ([d6d916e](https://github.com/benoit-bremaud/brasse-bouillon/commit/d6d916e040ebe113978d637fe15911791e448de0))
* **mobile-app:** address PR [#553](https://github.com/benoit-bremaud/brasse-bouillon/issues/553) review — P1 footer clearance and P2 unmatched route ([e784fc0](https://github.com/benoit-bremaud/brasse-bouillon/commit/e784fc0c9abeb0e35b0b07611c0ffe5d2ea9f09c))
* **mobile-app:** address PR [#556](https://github.com/benoit-bremaud/brasse-bouillon/issues/556) reviewer feedback ([e8b1827](https://github.com/benoit-bremaud/brasse-bouillon/commit/e8b1827bb36c8f4b5d9ea1626b79770e772a6c5d))
* **mobile-app:** remove nested ImageBackground causing horizontal overflow on scroll ([c5ca373](https://github.com/benoit-bremaud/brasse-bouillon/commit/c5ca373936cfb74ac67fa2fb48d4c1b92feee1b7))
* **mobile-app:** wire footer offset on remaining screens and fix lint/test regressions ([f1cb8ab](https://github.com/benoit-bremaud/brasse-bouillon/commit/f1cb8ab8d3d24d437e02dfb2d288dc978414787a))
* **review:** address PR [#554](https://github.com/benoit-bremaud/brasse-bouillon/issues/554) review — replace non-existent dev:mobile-tunnel script ([34550e5](https://github.com/benoit-bremaud/brasse-bouillon/commit/34550e5b20d8751740a6c8fd17c90e015ab650a7))
* **review:** address PR [#554](https://github.com/benoit-bremaud/brasse-bouillon/issues/554) review — version alignment, make setup idempotency, tool-version pinning ([d3f6e31](https://github.com/benoit-bremaud/brasse-bouillon/commit/d3f6e318d08822b18ec52258b3f559c2e7099f38))


### Refactors

* **monorepo:** rename packages — frontend to mobile-app, backend to api ([#502](https://github.com/benoit-bremaud/brasse-bouillon/issues/502)) ([4c4fb75](https://github.com/benoit-bremaud/brasse-bouillon/commit/4c4fb759669e104ee0a5aa3092eed4874fbe41cc)), closes [#501](https://github.com/benoit-bremaud/brasse-bouillon/issues/501)
* **monorepo:** rename packages/frontend to mobile-app and packages/backend to api ([88379e0](https://github.com/benoit-bremaud/brasse-bouillon/commit/88379e0cbd998c2e0c395e3037317530a91b1c62)), closes [#501](https://github.com/benoit-bremaud/brasse-bouillon/issues/501)


### Documentation

* **monorepo:** sync documentation after beer-encyclopedia CRUD and mobile harmonization ([7eff4c0](https://github.com/benoit-bremaud/brasse-bouillon/commit/7eff4c027733680c5bafa8f912c76e02862e9a4f))
* **monorepo:** sync documentation after beer-encyclopedia CRUD and mobile harmonization ([#554](https://github.com/benoit-bremaud/brasse-bouillon/issues/554)) ([3b3737b](https://github.com/benoit-bremaud/brasse-bouillon/commit/3b3737bdcc871ce2d02e77d5cd81a6b59e3b5fb2))

## [Unreleased]

### Planned for `v0.1.0`

Tracked as GitHub issues on the [Brasse-Bouillon project board](https://github.com/users/benoit-bremaud/projects/38)
with the `audit:v0` label (74 issues from the v0 mobile-app screenshot
audit, organised in 8 user-journey tiers). Top items blocking the
soutenance 2026-05-27 demo:

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

- No `mobile-app-v0.1.0-alpha1` git tag has been created yet. Tags
  are created **automatically by release-please** once a release PR
  merges into `main`. Since `0.1.0-alpha1` was the manifest baseline
  (not a release), it has no tag; the first auto-tag will be
  `mobile-app-v0.1.0-alpha2` after the first fix/feat commit lands
  on main.
- Android `versionName` / `versionCode` + iOS `CFBundle*` are managed
  by Expo at build time; no manual override needed at this stage. Note
  that the `-alphaN` prerelease suffix in `expo.version` is tolerated
  for Android but not a valid `CFBundleShortVersionString` for iOS —
  not an issue for the 2026-05-27 soutenance (Android demo only), but
  a future iOS build will need Expo's
  [runtime-version policy](https://docs.expo.dev/eas-update/runtime-versions/)
  to translate the prerelease into a valid bundle short version.
- The "About" version line inside the app (Compte & Paramètres screen)
  is scoped with the merged screen (B-45 / B-46) and will ship with
  `v0.1.0-alpha2` or later.
