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
