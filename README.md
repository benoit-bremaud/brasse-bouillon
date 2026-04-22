# Brasse-Bouillon

[![CI](https://img.shields.io/github/actions/workflow/status/benoit-bremaud/brasse-bouillon/ci.yml?branch=main&label=CI)](https://github.com/benoit-bremaud/brasse-bouillon/actions)
[![License](https://img.shields.io/github/license/benoit-bremaud/brasse-bouillon)](LICENSE)
[![Issues](https://img.shields.io/github/issues/benoit-bremaud/brasse-bouillon)](https://github.com/benoit-bremaud/brasse-bouillon/issues)
[![Node](https://img.shields.io/badge/node-%3E%3D20%20%3C21-green?logo=node.js)](https://nodejs.org/)

Open-source brewing companion for amateur brewers: recipe management, batch tracking, calculators, and an educational academy — all in one app.

---

## Table of Contents

- [What is Brasse-Bouillon?](#what-is-brasse-bouillon)
- [Monorepo at a Glance](#monorepo-at-a-glance)
- [Prerequisites](#prerequisites)
- [Quick Start (5 minutes)](#quick-start-5-minutes)
- [Running Each Package](#running-each-package)
- [Environment Variables](#environment-variables)
- [Scripts Reference](#scripts-reference)
- [Testing & Quality](#testing--quality)
- [CI/CD](#cicd)
- [Architecture](#architecture)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [Team](#team)
- [License](#license)

---

## What is Brasse-Bouillon?

Brasse-Bouillon is a four-package monorepo delivering a mobile app for home brewers, a REST API backing it, a marketing website, and a computer-vision beer encyclopedia. Each package ships independently and can be developed in isolation. The mobile app is the product; the other packages support it.

---

## Monorepo at a Glance

This repository uses [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces).

| Package | Version | Stack | Purpose |
|---------|---------|-------|---------|
| [`packages/mobile-app`](packages/mobile-app) | 1.0.0 | React Native · Expo SDK 54 · Expo Router v6 · TypeScript (strict) | End-user mobile application |
| [`packages/api`](packages/api) | 0.0.1 | NestJS 11 · TypeORM · SQLite · TypeScript | Backend REST API |
| [`packages/website`](packages/website) | 0.1.0 | Static HTML/CSS/JS · Python quality gate | Marketing site |
| [`packages/beer-encyclopedia`](packages/beer-encyclopedia) | 0.2.0 | Python 3.12 · FastAPI · YOLOv8 · EasyOCR · PostgreSQL | Label scanner + beer CRUD API |

Other top-level directories:

```text
docs/       Project documentation (architecture, design, API, project management)
_archive/   Pre-monorepo code. Read-only — do not modify, historical reference only.
.github/    CI workflows (path-filtered per package)
tools/ci/   SonarQube scan script
```

You do **not** need every package to get started. Pick the path that matches your goal:

| Goal | Packages required |
|------|-------------------|
| Try the mobile app with mock data | `mobile-app` only |
| Mobile app + live backend | `mobile-app` + `api` |
| Browse / edit the marketing site | `website` only |
| Work on label scanning / beer DB | `beer-encyclopedia` |

---

## Prerequisites

### Common (all platforms)

- **Node.js `>=20 <21`** — install via [nvm](https://github.com/nvm-sh/nvm) and run `nvm use` at the repo root (reads `.nvmrc`).
- **npm 10+** (ships with Node 20).
- **Git 2.30+**.
- **GNU Make** (pre-installed on macOS/Linux; used by `make setup / dev / test-all`).

### macOS

- [Homebrew](https://brew.sh).
- **Xcode + Command Line Tools** — install Xcode from the App Store, then `xcode-select --install`. Required for the iOS Simulator.
- **Watchman** — `brew install watchman` (prevents Expo `EMFILE` errors).
- **Android Studio** (only if you want the Android emulator) — `brew install --cask android-studio`, then open it once to install the SDK and create an AVD.
- **Firewall** — on first launch macOS asks whether `node` may accept incoming connections; allow it, otherwise Expo Go on a phone cannot reach your laptop.

### Linux

- **Android Studio** (only for the Android emulator) — install the SDK and create an AVD via `sdkmanager`/`avdmanager`.
- **udev rules** for physical Android devices: see [Android docs](https://developer.android.com/studio/run/device#setting-up).

### Per-package extras (only if you run them)

- **API** — none beyond Node. SQLite is embedded.
- **Beer Encyclopedia** — **Python 3.12** (`brew install python@3.12` or `pyenv install 3.12`) and **Docker Desktop** (PostgreSQL via `docker compose`).
- **Physical-device mobile testing** — install **Expo Go** on your phone (App Store / Play Store); phone and laptop must share the same Wi-Fi.

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
#    fresh JWT_SECRET and the auto-detected LAN IP.
make setup

# 5. Start API + mobile app together
make dev                   # Ctrl+C stops both
```

Prefer separate terminals?

```bash
make dev-api               # terminal 1 — NestJS at http://<LAN-IP>:3000
make dev-mobile            # terminal 2 — Expo in LAN mode (scan QR)
```

Just want the mobile app with mock data? Skip the API: set `EXPO_PUBLIC_USE_DEMO_DATA=true` in `packages/mobile-app/.env`, then launch Expo with `make dev-mobile` (or `npm run dev:mobile-app`).

Run `make help` at any time to list every available target.

---

## Running Each Package

Each package owns its own README with full details, troubleshooting, and advanced workflows. The sections below cover the default happy path only.

### Mobile App

Three ways to run `packages/mobile-app`:

- **iOS Simulator (macOS)** — `npm run dev:mobile-app`, then press `i` in the Expo CLI.
- **Android Emulator (macOS/Linux)** — start an AVD from Android Studio, then press `a` in the Expo CLI.
- **Expo Go on a physical device (LAN)** — after `make setup` has filled in the LAN IP, run `make dev-mobile` and scan the QR code with **Expo Go** (Android) or the **Camera app** (iOS).

If LAN does not work (corporate Wi-Fi, AP isolation, VPN), see [packages/mobile-app/README.md](packages/mobile-app/README.md) for tunnel / USB fallback paths (cloudflared, adb reverse).

### API

NestJS 11 + TypeORM + SQLite. Standalone, no external services required.

```bash
make setup                 # one-shot: creates .env with a fresh JWT_SECRET
make dev-api               # starts NestJS in watch mode
```

- Server: `http://<LAN-IP>:3000` (the command prints the exact URL)
- Swagger UI: <http://localhost:3000/api>
- DB file: `packages/api/data/brasse-bouillon.db` (auto-created)

Full guide (Docker, migrations, env strategy): [packages/api/README.md](packages/api/README.md).

### Website

Static HTML/CSS/JS — no build step.

```bash
# Serve over HTTP (recommended for relative paths and service workers)
python3 -m http.server 8080 --directory packages/website
# → http://localhost:8080

# Run the quality gate locally (same check CI runs)
python3 packages/website/scripts/quality_gate.py
```

Details: [packages/website/README.md](packages/website/README.md).

### Beer Encyclopedia

Python 3.12 FastAPI service (label scanning + encyclopedia CRUD). Requires Docker for PostgreSQL.

```bash
cd packages/beer-encyclopedia

python3.12 -m venv .venv && source .venv/bin/activate
pip install --upgrade pip && pip install -e ".[ml,dev]"

cp .env.example .env
docker compose up -d            # PostgreSQL + pgAdmin
alembic upgrade head

uvicorn api.main:app --reload   # → http://localhost:8000  (Swagger at /docs)
```

Setup, dataset preparation, and model training: [packages/beer-encyclopedia/docs/SETUP.md](packages/beer-encyclopedia/docs/SETUP.md). HTTP API reference: [packages/beer-encyclopedia/README.md](packages/beer-encyclopedia/README.md).

---

## Environment Variables

Every package ships an `.env.example`. `make setup` creates the `.env` files for `api` and `mobile-app` automatically. For `beer-encyclopedia`, copy it by hand.

| Package | Variable | Description |
|---------|----------|-------------|
| mobile-app | `EXPO_PUBLIC_API_URL` | API base URL. `make setup` fills in `http://<LAN-IP>:3000`. Edit manually if you use an emulator and prefer `localhost:3000`. |
| mobile-app | `EXPO_PUBLIC_USE_DEMO_DATA` | `true` to skip the API and use mock data. |
| api | `JWT_SECRET` | JWT signing secret (required). `make setup` generates a fresh 256-bit hex secret. |
| api | `JWT_EXPIRATION` | Access-token TTL (default `86400s`). |
| api | `PORT` | API port (default `3000`). |
| api | `DATABASE_PATH` | SQLite file path (default `./data/brasse-bouillon.db`). |
| beer-encyclopedia | `DATABASE_URL` | PostgreSQL connection string (matches `docker-compose.yml`). |

`.env` files are gitignored. Never commit them.

---

## Scripts Reference

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
| `make sonar-start` / `make sonar-stop` / `make sonar-status` / `make sonar-scan` | Local SonarQube lifecycle |

### npm scripts (root)

| Script | What it does | Packages covered |
|--------|--------------|------------------|
| `npm run dev:mobile-app` | Start the Expo dev server | mobile-app |
| `npm run dev:api` | Start NestJS in watch mode | api |
| `npm run ci:all` | Mobile `ci:check` (lint + typecheck + format) + API `lint:check` + API `build` | mobile-app + api |
| `npm run test:all` | Run Jest suites | mobile-app + api |
| `npm run lint:all` | Run linters | mobile-app + api |
| `npm run typecheck:all` | Type-check everything (API uses `build`) | mobile-app + api |

> The npm `*:all` scripts cover **mobile-app + api** only. `make test-all` additionally runs the beer-encyclopedia pytest suite when a venv is present.

---

## Testing & Quality

| Package | Suite | Count | Coverage target |
|---------|-------|-------|-----------------|
| mobile-app | Jest + @testing-library/react-native | **407 tests** | 70% (CI warning) |
| api | Jest | **238 tests** | 70% (CI warning) |
| beer-encyclopedia | pytest | — | 70% (CI warning) |
| website | Python quality gate (no unit tests) | — | — |

> The 70% threshold is currently enforced as a CI **warning** (`::warning::` in `ci.yml`), not a hard gate — jobs pass even if coverage drops below. Promoting this to a blocking gate is tracked separately.

Tests are mandatory for every new feature. Run everything with `make test-all`.

SonarQube local analysis is available:

```bash
make sonar-start                          # start Sonar in Docker
make sonar-scan SONAR_TOKEN=sqp_xxx       # scan the monorepo
```

---

## CI/CD

GitHub Actions runs automatically on every PR to `main` and every push to `main`:

- [`.github/workflows/ci.yml`](.github/workflows/ci.yml) — **path-filtered** pipeline. Only changed packages run:
  - **mobile-app** — lint + typecheck + format check + tests (70% coverage target — CI warning, not a hard gate)
  - **api** — lint + build + tests (70% coverage target — CI warning)
  - **website** — Python quality gate
  - **beer-encyclopedia** — ruff lint + compile check + pytest (70% coverage target — CI warning)
- [`.github/workflows/discord-notifications.yml`](.github/workflows/discord-notifications.yml) — routes issue and pull-request lifecycle events (`issues:opened`, `pull_request:opened|closed`) to Discord channels based on `scope:*` labels.

Each job uploads its `lcov.info` as a GitHub Actions artifact. There is **no SonarQube job in CI** today — Sonar analysis is local-only, driven by `make sonar-scan` against a local SonarQube Community Edition running in Docker (see `sonar-project.properties`).

---

## Architecture

The mobile app follows **Clean Architecture** with strict layering:

```text
domain  ←  application  ←  data
                ↓
          presentation
```

- `domain/` — types and interfaces only
- `data/` — API calls via the HTTP client
- `application/` — use-cases (business logic)
- `presentation/` — screens and components

Full conventions: [packages/mobile-app/CLAUDE.md](packages/mobile-app/CLAUDE.md).

---

## Documentation

| Topic | Location |
|-------|----------|
| Project log (operational journal) | [PROJECT_LOG.md](PROJECT_LOG.md) |
| Release changelog | [docs/changelog.md](docs/changelog.md) |
| Contributing guide | [CONTRIBUTING.md](CONTRIBUTING.md) |
| Engineering conventions | [docs/CONVENTIONS.md](docs/CONVENTIONS.md) |
| Roadmap | [docs/roadmap.md](docs/roadmap.md) |
| Definition of Done | [docs/project-management/definition-of-done.md](docs/project-management/definition-of-done.md) |
| Definition of Ready | [docs/project-management/definition-of-ready.md](docs/project-management/definition-of-ready.md) |
| Sprint structure | [docs/project-management/sprint-definition.md](docs/project-management/sprint-definition.md) |
| Scrum roles | [docs/project-management/scrum-roles.md](docs/project-management/scrum-roles.md) |
| Sequelize migrations reference | [docs/project-management/migrations-sequelize.md](docs/project-management/migrations-sequelize.md) |
| Meeting types | [docs/meetings/meeting_types.md](docs/meetings/meeting_types.md) |
| Mobile App conventions | [packages/mobile-app/CLAUDE.md](packages/mobile-app/CLAUDE.md) |
| Mobile App contributor README | [packages/mobile-app/README.md](packages/mobile-app/README.md) |
| Mobile App design system | [packages/mobile-app/docs/design-system.md](packages/mobile-app/docs/design-system.md) |
| API README | [packages/api/README.md](packages/api/README.md) |
| Website README | [packages/website/README.md](packages/website/README.md) |
| Beer Encyclopedia README | [packages/beer-encyclopedia/README.md](packages/beer-encyclopedia/README.md) |
| Beer Encyclopedia setup | [packages/beer-encyclopedia/docs/SETUP.md](packages/beer-encyclopedia/docs/SETUP.md) |
| Architecture docs | [docs/architecture/](docs/architecture/) |
| API docs | [docs/api/](docs/api/) |
| Project management | [docs/project-management/](docs/project-management/) |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide. Quick summary:

- Branch from `main` for every task (never commit directly).
- Use Conventional Commits: `type(scope): description`.
- Run `make lint-all && make test-all` before pushing.
- Open a PR with a clear description and checklist.
- Wait for CI green and at least one review before merging.

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
