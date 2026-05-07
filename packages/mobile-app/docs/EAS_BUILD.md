# EAS Build — preview APK + OTA updates

This document covers how to build and install a Brasse Bouillon APK via
Expo Application Services (EAS), and how to ship JavaScript changes
without rebuilding a new APK.

## Why EAS (vs. Expo Go)

Expo Go on YNOV / mobile-hotspot Wi-Fi is unreliable: client isolation,
IPv6-only DNS on `tunnel.us.ngrok.com`, and the 11 MB dev bundle all work
against fast iteration. EAS Build produces a standalone `.apk` that
launches in ~1 s on the phone with no Metro running anywhere. For every
JS-only change afterwards, `eas update` pushes a diff to the phone over
the air.

## Prerequisites

- Expo account — we use `@beniot`.
- `EAS_CLI` via `npx --yes eas-cli ...` (no global install needed).
- Node **20**. The package pins it via `packages/mobile-app/.tool-versions`
  (asdf). `@expo/ngrok` and the older `got@11` crash on Node 22.
- `cloudflared` is **not** needed for EAS builds, only for Expo Go tunnelling
  (see `README.md`).

## First-time project link

One-off, already done on 2026-04-20 for `@beniot/brasse-bouillon-mobile-app`
(project id `a527c490-…`, baked in `app.json`). If you ever re-init:

```bash
cd packages/mobile-app
npx --yes eas-cli init --non-interactive --force
```

## Build an APK (preview profile)

### Option A — Direct build from the monorepo (preferred)

With the anchored `.easignore` landed in this PR, EAS tars only
~5-15 MB. You can build directly from the package:

```bash
cd packages/mobile-app
NODE_OPTIONS='--dns-result-order=ipv4first' \
  PATH=~/.asdf/installs/nodejs/20.13.1/bin:$PATH \
  npx --yes eas-cli build --profile preview --platform android --non-interactive
```

If your upload ever balloons back to 100+ MB, that's a sign a new
bare-directory pattern got added to `.easignore` — re-read the inline
comment at the top of `.easignore` before fixing.

**Important — two `.easignore` files, both needed.** EAS in a monorepo
uploads the **workspace root** (this repo's monorepo root, not
`packages/mobile-app/`) so that `npm ci` can find the canonical
`package-lock.json`. As a result:

- `.easignore` at `packages/mobile-app/.easignore` is interpreted with
  `packages/mobile-app/` as its anchor — it can only exclude paths
  inside the mobile-app package itself.
- `.easignore` at the **monorepo root** (`/.easignore`) is interpreted
  with the repo root as its anchor — that is where `/.git/`,
  `/_archive/`, `/docs/`, `/packages/api/`, and the other heavy
  monorepo-root paths must be excluded.

Both files exist and serve different scopes. If you only edit the
package-level one, the repo-root paths leak straight through and the
upload climbs to 300+ MB (this happened on the 2026-05-07 first
APK build of the Fly.io-pointed bundle, fixed in PR
#960).

### Option B — Isolated-workspace fallback

Useful when debugging `.easignore` rules or when the repo has
uncommitted experimental state you do not want to ship:

```bash
# 1. Copy packages/mobile-app into /tmp (standalone workspace).
rm -rf /tmp/bb-mobile-build
mkdir -p /tmp/bb-mobile-build
cp -R packages/mobile-app /tmp/bb-mobile-build/

# 2. Reproducible install (uses the committed package-lock.json).
cd /tmp/bb-mobile-build/mobile-app
PATH=~/.asdf/installs/nodejs/20.13.1/bin:$PATH npm ci

# 3. Init a fresh minimal git history (EAS requires a git repo).
git init -q
git add -A
git -c user.email=build@local -c user.name=build commit -q -m 'initial'

# 4. Launch the build.
NODE_OPTIONS='--dns-result-order=ipv4first' \
  PATH=~/.asdf/installs/nodejs/20.13.1/bin:$PATH \
  npx --yes eas-cli build --profile preview --platform android --non-interactive
```

Expected timings on the free tier:

- Upload tarball: ~1 min (5-15 MB after all the excludes).
- EAS queue: 0-15 min depending on load.
- Android compile + bundle + sign: ~6 min.

At the end EAS prints a link like `https://expo.dev/accounts/beniot/projects/brasse-bouillon-mobile-app/builds/<id>`.
Open it on the phone (or scan the QR) to download the APK. Accept
"install from unknown source" once, then tap install.

## Ship a JS change — OTA update (no rebuild)

Once the preview APK is on a phone, new JavaScript (screens, use-cases,
styles, mocks) ship as an OTA update in ~20 s:

```bash
cd packages/mobile-app
PATH=~/.asdf/installs/nodejs/20.13.1/bin:$PATH \
  npx --yes eas-cli update --branch preview --message "short description"
```

The phone checks the `preview` channel at app launch and picks up the
new bundle automatically. Users see a short download indicator the next
time they open the app.

**A new APK is only needed when:**

- Adding / upgrading a native module (e.g. `expo-camera` major bump).
- Changing `app.json` native config (permissions, plugins, package id,
  `runtimeVersion`).
- Adding a new font or native asset.

## Demo-mode toggle

The APK bakes `EXPO_PUBLIC_USE_DEMO_DATA=true` from an EAS environment
variable (not from a local `.env`, since EAS does not upload gitignored
files). To flip it for a future deployed-backend build:

```bash
npx --yes eas-cli env:update \
  --environment preview \
  --name EXPO_PUBLIC_USE_DEMO_DATA \
  --value false
npx --yes eas-cli env:create \
  --environment preview \
  --name EXPO_PUBLIC_API_URL \
  --value https://<deployed-backend> \
  --visibility plaintext
```

Then rebuild the APK (env vars are baked at build time, not patchable via
OTA update).

## Key files in the repo

| File                                                                     | Role                                                        |
| ------------------------------------------------------------------------ | ----------------------------------------------------------- |
| `packages/mobile-app/app.json`                                           | App metadata, project id, updates URL, icon paths           |
| `packages/mobile-app/eas.json`                                           | Build profiles (development / preview / production)         |
| `packages/mobile-app/.easignore`                                         | Tarball exclusions (anchored patterns — see inline comment) |
| `packages/mobile-app/.tool-versions`                                     | Pins Node 20 via asdf                                       |
| `packages/mobile-app/assets/images/brasse-bouillon-logo-primary-512.png` | Launcher icon (brasseur character)                          |

## Troubleshooting

| Symptom                                                                           | Cause                                                                                                         | Fix                                                                                  |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `Your project archive is 202 MB`                                                  | `.easignore` is missing, stale, or uses bare directory names that don't match the repo root.                  | Review the anchored patterns in `.easignore`; fall back to Option B above if unsure. |
| `Unable to resolve module "@/features/tools/presentation/…"` during bundle phase  | `.easignore` has `tools/` without leading slash, which strips `src/features/tools/` recursively (issue #555). | Anchor to `/tools/` — already done in this file; preserve this rule on every edit.   |
| `TypeError: Cannot read properties of undefined (reading 'body')` on `--tunnel`   | `got@11` in `@expo/ngrok` crashes on Node 22.                                                                 | `asdf shell nodejs 20.13.1` before running any Expo CLI.                             |
| `expo doctor ... exited with non-zero code: 1` at the "Run expo doctor" EAS phase | Native-module versions drifted from the SDK 54 expected set.                                                  | `npx expo install --fix` locally, commit, rebuild.                                   |
| `EAI_AGAIN storage.googleapis.com` during upload                                  | DNS flap, usually IPv6-only resolution on the current network.                                                | Retry with `NODE_OPTIONS='--dns-result-order=ipv4first'`.                            |
