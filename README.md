# Brasse-Bouillon

[![CI](https://img.shields.io/github/actions/workflow/status/benoit-bremaud/brasse-bouillon/ci.yml?branch=main&label=CI)](https://github.com/benoit-bremaud/brasse-bouillon/actions)
[![License](https://img.shields.io/github/license/benoit-bremaud/brasse-bouillon)](LICENSE)
[![Issues](https://img.shields.io/github/issues/benoit-bremaud/brasse-bouillon)](https://github.com/benoit-bremaud/brasse-bouillon/issues)
[![Node](https://img.shields.io/badge/node-%3E%3D20%20%3C21-green?logo=node.js)](https://nodejs.org/)

**Brasse-Bouillon** is an open-source mobile and web application for amateur brewers. It provides recipe management, batch tracking, brewing calculators, and an educational academy — all in one app.

---

## Table of Contents

- [Monorepo Structure](#monorepo-structure)
- [Prerequisites](#prerequisites)
- [Quick Start (5 minutes)](#quick-start-5-minutes)
- [Running the Mobile App](#running-the-mobile-app)
- [Running the Website](#running-the-website)
- [Running the API](#running-the-api)
- [Running the Beer Encyclopedia](#running-the-beer-encyclopedia)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Troubleshooting](#troubleshooting)
- [Architecture](#architecture)
- [CI/CD](#cicd)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Team](#team)

---

## Monorepo Structure

This repository is an [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) monorepo containing **four** packages:

```text
brasse-bouillon/
  packages/
    mobile-app/         React Native + Expo SDK 54 + Expo Router v6 + TypeScript
    api/                NestJS 11 + TypeORM + SQLite + TypeScript
    website/            Static HTML/CSS/JS marketing site + Python quality gate
    beer-encyclopedia/  Python 3.12 + FastAPI + YOLOv8 + EasyOCR (label scanner + CRUD API)
  docs/                 Project documentation (architecture, design, API)
  _archive/             Pre-monorepo code, kept for reference (read-only)
  .github/              CI workflows (path-filtered per package)
```

You do **not** need every package to get started. Pick the path that matches your goal:

| Goal | Packages required |
|------|-------------------|
| Try the mobile app on Expo Go (mock data) | `mobile-app` only |
| Mobile app + live backend | `mobile-app` + `api` |
| Browse / edit the marketing site | `website` only |
| Work on the beer-encyclopedia API | `beer-encyclopedia` |

---

## Prerequisites

### Common (all platforms)

- **Node.js 20.x** — install via [nvm](https://github.com/nvm-sh/nvm) and run `nvm use` at the repo root (it reads `.nvmrc`).
- **npm 10+** (ships with Node 20).
- **Git 2.30+**.
- **GNU Make** (pre-installed on macOS/Linux; used for the `make setup / dev / test-all` targets).

### macOS

- **Homebrew** — <https://brew.sh>
- **Xcode + Command Line Tools** — install Xcode from the App Store, then `xcode-select --install`. Required for the iOS Simulator and for native React Native dependencies.
- **Watchman** — `brew install watchman` (recommended by Expo on macOS, prevents `EMFILE` errors).
- **Android Studio** (only if you want the Android emulator) — `brew install --cask android-studio`, then open it once to install the SDK and create an AVD.
- **Firewall** — on first launch macOS asks whether `node`/`Expo` may accept incoming connections; allow it, otherwise Expo Go on a phone cannot reach your laptop.

### Linux

- **Android Studio** (only if you want the Android emulator) — install the SDK and create an AVD via `sdkmanager`/`avdmanager`.
- **udev rules** for physical Android devices: see <https://developer.android.com/studio/run/device#setting-up>.

### Per-package extras (only if you run them)

- **API** — none beyond Node. SQLite is embedded.
- **Beer Encyclopedia** — **Python 3.12** (`brew install python@3.12` or `pyenv install 3.12`) and **Docker Desktop** (PostgreSQL via `docker compose`).
- **Physical-device mobile testing** — install **Expo Go** on your phone (App Store / Play Store), and make sure phone and laptop are on the **same Wi-Fi**.

---

## Quick Start (5 minutes)

The happy path: mobile app + API, on a simulator/emulator or on Expo Go.

```bash
# 1. Clone and enter the repo
git clone git@github.com:benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon

# 2. Use the right Node version
nvm use                    # reads .nvmrc → Node 20

# 3. Install all workspaces from the root
npm install

# 4. Bootstrap local dev — idempotent: creates missing .env files with a
#    fresh JWT_SECRET and the auto-detected LAN IP. Existing .env files
#    are left untouched. Run again safely to re-print the detected IP.
make setup

# 5. Start the API (terminal 1)
make dev-api               # http://<LAN-IP>:3000  — Swagger at /api

# 6. Start the mobile app in LAN mode (terminal 2)
make dev-mobile            # scan the QR code with Expo Go
```

Prefer a single command? `make dev` runs both API and Expo in parallel under one `Ctrl+C`.

Skip steps 4–5 if you only want the mobile app with mock data — set `EXPO_PUBLIC_USE_DEMO_DATA=true` in `packages/mobile-app/.env`.

Run `make help` at any time to list all available targets.

---

## Running the Mobile App

`packages/mobile-app` is a React Native + Expo SDK 54 app. Three ways to run it:

### A. iOS Simulator (macOS only)

```bash
npm run dev:mobile-app
# then press `i` in the Expo CLI to open the iOS Simulator
```

If the simulator does not open: `xcrun simctl list devices` to confirm Xcode is installed correctly, then re-try (`xcode-select --install` if needed).

### B. Android Emulator (macOS or Linux)

1. Open Android Studio once and create an AVD (Pixel 7, API 34 is fine).
2. Start the emulator (Android Studio → Device Manager → ▶).
3. Start Expo, then press `a` in the Expo CLI:

```bash
npm run dev:mobile-app
```

### C. Expo Go on a physical device (LAN) — recommended for quick demos

1. Install **Expo Go** on your phone.
2. Make sure the phone and your laptop are on the **same Wi-Fi**.
3. Run `make setup` once — it writes `EXPO_PUBLIC_API_URL=http://<LAN-IP>:3000` into `packages/mobile-app/.env` using the IP it auto-detects (macOS `ipconfig getifaddr en0/en1`, Linux `hostname -I`, fallback `localhost`).
4. Start Expo in LAN mode:

```bash
make dev-mobile
# (equivalent to: npm -w packages/mobile-app run start:lan)
```

5. Scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).

If LAN does not work (corporate Wi-Fi, AP isolation, VPN), see the [mobile-app README](packages/mobile-app/README.md) for tunnel / USB fallback paths (cloudflared, adb reverse).

> **macOS firewall:** the first time you start Expo, macOS prompts you to allow `node` to accept incoming connections. Click **Allow**, otherwise the phone cannot reach the dev server.

For the full mobile contributor guide, see [packages/mobile-app/README.md](packages/mobile-app/README.md).

---

## Running the Website

`packages/website` is a **static** HTML/CSS/JS site (no build step, no Node runtime). Two options:

```bash
# Option 1 — open directly in a browser
open packages/website/index.html        # macOS
xdg-open packages/website/index.html    # Linux

# Option 2 — serve over HTTP (recommended; required for relative paths,
#           service workers, and realistic local testing)
python3 -m http.server 8080 --directory packages/website
# then open http://localhost:8080
```

Run the quality gate locally (same check CI runs):

```bash
python3 packages/website/scripts/quality_gate.py
```

See [packages/website/README.md](packages/website/README.md) for CI details.

---

## Running the API

NestJS 11 + TypeORM + SQLite. Standalone, no external services required.

```bash
make setup                 # one-shot: creates .env with a fresh JWT_SECRET
make dev-api               # starts NestJS in watch mode
```

- Server: `http://<LAN-IP>:3000` (the command prints the exact URL)
- Swagger UI: <http://localhost:3000/api>
- DB file: `packages/api/data/brasse-bouillon.db` (auto-created)

Full guide (Docker, migrations, env strategy): [packages/api/README.md](packages/api/README.md).

---

## Running the Beer Encyclopedia

Python 3.12 FastAPI service (package version **0.2.0**) — label scanning + encyclopedia CRUD. Requires **Docker** for the PostgreSQL container.

```bash
cd packages/beer-encyclopedia

# 1. Python virtual environment
python3.12 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -e ".[ml,dev]"

# 2. Environment file
cp .env.example .env

# 3. Start PostgreSQL (and pgAdmin)
docker compose up -d

# 4. Run migrations
alembic upgrade head

# 5. Start the FastAPI server
uvicorn api.main:app --reload
# → http://localhost:8000  (Swagger at /docs)
```

Full setup, dataset preparation, and model training: [packages/beer-encyclopedia/docs/SETUP.md](packages/beer-encyclopedia/docs/SETUP.md). HTTP API reference: [packages/beer-encyclopedia/README.md](packages/beer-encyclopedia/README.md).

---

## Environment Variables

Every package ships an `.env.example`. `make setup` creates the `.env` files for `api` and `mobile-app` automatically. For `beer-encyclopedia`, copy it by hand.

| Package | Variable | Description |
|---------|----------|-------------|
| mobile-app | `EXPO_PUBLIC_API_URL` | API base URL. `make setup` fills in `http://<LAN-IP>:3000`. Edit manually if you are on an emulator and prefer `localhost:3000`. |
| mobile-app | `EXPO_PUBLIC_USE_DEMO_DATA` | `true` to skip the API and use mock data. |
| api | `JWT_SECRET` | JWT signing secret (required). `make setup` generates a fresh 256-bit hex secret. |
| api | `JWT_EXPIRATION` | Access-token TTL (default `86400s`). |
| api | `PORT` | API port (default `3000`). |
| api | `DATABASE_PATH` | SQLite file path (default `./data/brasse-bouillon.db`). |
| beer-encyclopedia | `DATABASE_URL` | PostgreSQL connection string (matches `docker-compose.yml`). |

Never commit `.env` files. They are gitignored.

---

## Available Scripts

### Make targets (recommended entry points)

| Target | What it does |
|--------|--------------|
| `make help` | List every target with its description |
| `make setup` | Create `.env` files with a fresh `JWT_SECRET` and the detected LAN IP |
| `make dev-api` | Start the NestJS API in watch mode |
| `make dev-mobile` | Start Expo in LAN mode (Expo Go friendly) |
| `make dev` | Run API + Expo in parallel under one `Ctrl+C` |
| `make test-all` | Run mobile-app + api + beer-encyclopedia test suites |
| `make lint-all` | Run mobile-app + api linters |
| `make sonar-start / sonar-stop / sonar-status / sonar-scan` | Local SonarQube lifecycle |

### npm scripts (root)

| Script | What it does | Packages covered |
|--------|--------------|------------------|
| `npm run dev:mobile-app` | Start Expo dev server | mobile-app |
| `npm run dev:api` | Start NestJS in watch mode | api |
| `npm run ci:all` | Lint + typecheck + format check + build | mobile-app + api |
| `npm run test:all` | Run JS tests | mobile-app + api |
| `npm run lint:all` | Run linters | mobile-app + api |
| `npm run typecheck:all` | Type-check everything | mobile-app + api |

> The npm `*:all` scripts cover **mobile-app + api** only. `make test-all` additionally runs the beer-encyclopedia pytest suite when a venv is present.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Expo Go: "Network response timed out" or QR code unreachable | Phone and laptop on the same Wi-Fi? `EXPO_PUBLIC_API_URL` set to your **LAN IP** (not `localhost`)? macOS firewall allowing `node`? See `packages/mobile-app/README.md` §6 for tunnel / USB alternatives. |
| macOS: `xcrun: error: invalid active developer path` | `xcode-select --install` |
| macOS: `Error: EMFILE: too many open files, watch` | `brew install watchman` |
| Android emulator not detected by Expo | `adb devices` — if empty, cold-boot the AVD from Android Studio's Device Manager. |
| `EADDRINUSE` / port 3000 already in use | macOS/Linux: `lsof -i :3000` then `kill <PID>`, or change `PORT` in `packages/api/.env`. |
| `npm install` fails on native modules | Confirm `nvm use` printed Node 20.x. Delete `node_modules` and retry. |
| Beer-encyclopedia `pip install` fails on `easyocr`/`torch` (Apple Silicon) | Make sure you are on **Python 3.12** (`python3.12 --version`) — some ML wheels do not yet ship for Python 3.13+. |
| `make setup` detected `LAN_IP=localhost` | Your Wi-Fi interface is not `en0`/`en1` on macOS; run `ifconfig` to find the active one and set `EXPO_PUBLIC_API_URL` manually. |

---

## Architecture

The mobile app follows **Clean Architecture** with strict layering:

```text
domain  ←  application  ←  data
                ↓
          presentation
```

- `domain/` — Types and interfaces only
- `data/` — API calls via the HTTP client
- `application/` — Use-cases (business logic)
- `presentation/` — Screens and components

See [packages/mobile-app/CLAUDE.md](packages/mobile-app/CLAUDE.md) for full conventions.

---

## CI/CD

GitHub Actions runs automatically on every PR to `main`:

- **Path-filtered**: only changed packages are tested
- **Mobile App**: lint + typecheck + format check + tests
- **API**: lint + build + tests
- **Website**: Python quality gate
- **Beer Encyclopedia**: Python lint + pytest

Coverage reports are uploaded as artifacts for SonarQube integration.

---

## Documentation

| Topic | Location |
|-------|----------|
| Project log (operational journal) | [PROJECT_LOG.md](PROJECT_LOG.md) |
| Release changelog | [docs/changelog.md](docs/changelog.md) |
| Contributing guide | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Mobile App conventions | [packages/mobile-app/CLAUDE.md](packages/mobile-app/CLAUDE.md) |
| Mobile App contributor README | [packages/mobile-app/README.md](packages/mobile-app/README.md) |
| API README | [packages/api/README.md](packages/api/README.md) |
| Website README | [packages/website/README.md](packages/website/README.md) |
| Beer Encyclopedia README | [packages/beer-encyclopedia/README.md](packages/beer-encyclopedia/README.md) |
| Beer Encyclopedia setup | [packages/beer-encyclopedia/docs/SETUP.md](packages/beer-encyclopedia/docs/SETUP.md) |
| Design system | [packages/mobile-app/docs/design-system.md](packages/mobile-app/docs/design-system.md) |
| Architecture | [docs/architecture/](docs/architecture/) |
| API documentation | [docs/api/](docs/api/) |
| Project management | [docs/project-management/](docs/project-management/) |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide. Quick summary:

- Branch from `main` for every task (never commit directly)
- Use Conventional Commits: `type(scope): description`
- Run `make lint-all && make test-all` before pushing
- Create a PR with a clear description and checklist
- Wait for CI to pass and at least one review before merging

---

## Team

| Member | Role | Scope |
|--------|------|-------|
| Benoit | Project lead, Fullstack, Design | Frontend, Backend, Monorepo, DevOps |
| Fabien | Cybersecurity, Frontend/Design | Frontend, Design, Security |
| Kevin | Fullstack (backend focus) | Backend, Frontend |
| Sara | Fullstack (frontend focus) | Frontend, Backend |
| Clement | Infrastructure, DevOps | DevOps, Infrastructure |
| Catarina | Infrastructure, Security, Cloud | DevOps, Infrastructure, Security |
| Fabio | UI/UX, Art Direction | Design, Frontend |
| Liam | Design, UI/UX | Design |
| Thais | UI/UX, Frontend | Design, Frontend |

---

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
