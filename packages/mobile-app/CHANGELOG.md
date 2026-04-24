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
