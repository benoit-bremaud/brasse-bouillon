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
