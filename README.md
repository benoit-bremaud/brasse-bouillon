# Brasse-Bouillon

[![CI](https://img.shields.io/github/actions/workflow/status/benoit-bremaud/brasse-bouillon/ci.yml?branch=main&label=CI)](https://github.com/benoit-bremaud/brasse-bouillon/actions)
[![License](https://img.shields.io/github/license/benoit-bremaud/brasse-bouillon)](LICENSE)
[![Issues](https://img.shields.io/github/issues/benoit-bremaud/brasse-bouillon)](https://github.com/benoit-bremaud/brasse-bouillon/issues)
[![Node](https://img.shields.io/badge/node-%3E%3D20%20%3C21-green?logo=node.js)](https://nodejs.org/)

**Brasse-Bouillon** is an open-source mobile and web application for amateur brewers. It provides recipe management, batch tracking, brewing calculators, and an educational academy — all in one app.

---

## Monorepo Structure

This repository is an [npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces) monorepo containing three packages:

```
brasse-bouillon/
  packages/
    mobile-app/   React Native + Expo SDK 54 + Expo Router v6 + TypeScript
    api/          NestJS 11 + TypeORM + SQLite + TypeScript
    website/      Static HTML/CSS/JS marketing site + Python quality gate
  docs/           Project documentation (architecture, design, API, requirements)
  _archive/       Old code preserved for reference (pre-monorepo)
  .github/        CI workflows (path-filtered per package)
```

---

## Prerequisites

- **Node.js** 20.x (`nvm use` will read `.nvmrc`)
- **npm** 10+
- **Docker** (optional, for SonarQube local analysis)

---

## Getting Started

```bash
# Clone
git clone git@github.com:benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon

# Install all dependencies (from root)
npm install

# Start the frontend (Expo dev server)
npm run dev:mobile-app

# Start the backend (NestJS dev server)
npm run dev:api
```

### Environment Variables

Each package has its own `.env.example`. Copy and configure before running:

```bash
cp packages/mobile-app/.env.example packages/mobile-app/.env
cp packages/api/.env.example packages/api/.env
```

Key variables:

| Package | Variable | Description |
|---------|----------|-------------|
| Mobile App | `EXPO_PUBLIC_API_URL` | API URL (default: `http://localhost:3000`) |
| Mobile App | `EXPO_PUBLIC_USE_DEMO_DATA` | `true` to use mock data without API |
| API | `JWT_SECRET` | JWT signing secret (required) |
| API | `PORT` | API port (default: 3000) |
| API | `DATABASE_PATH` | SQLite database file path |

---

## Available Scripts

### Root (monorepo)

| Script | Description |
|--------|-------------|
| `npm run dev:mobile-app` | Start Expo dev server |
| `npm run dev:api` | Start NestJS in watch mode |
| `npm run ci:all` | Run lint + typecheck + format check for all packages |
| `npm run test:all` | Run all tests across packages |
| `npm run lint:all` | Run linters across packages |
| `npm run typecheck:all` | Run type checking across packages |

### SonarQube (local analysis)

| Command | Description |
|---------|-------------|
| `make sonar-start` | Start local SonarQube (Docker) |
| `make sonar-stop` | Stop SonarQube |
| `make sonar-status` | Check SonarQube status |
| `make sonar-scan SONAR_TOKEN=sqp_xxx` | Run analysis |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile / Web | React Native, Expo SDK 54, Expo Router v6 |
| State / Data | TanStack Query (migrating from useState+useEffect) |
| Backend | NestJS 11, TypeORM, SQLite |
| Auth | JWT (access token + refresh) |
| CI | GitHub Actions (path-filtered per package) |
| Code Quality | SonarQube (local), ESLint, Prettier |
| Testing | Jest, @testing-library/react-native |

---

## Architecture

The frontend follows **Clean Architecture** with strict layering:

```
domain  <-  application  <-  data
                |
          presentation
```

- `domain/` — Types and interfaces only
- `data/` — API calls via HTTP client
- `application/` — Use-cases (business logic)
- `presentation/` — React Native screens and components

See [packages/mobile-app/CLAUDE.md](packages/mobile-app/CLAUDE.md) for full frontend conventions.

---

## CI/CD

GitHub Actions runs automatically on every PR to `main`:

- **Path-filtered**: only changed packages are tested
- **Mobile App**: lint + typecheck + format check + 407 tests
- **API**: lint + build + 238 tests
- **Website**: Python quality gate

Coverage reports are uploaded as artifacts for SonarQube integration.

---

## Documentation

| Topic | Location |
|-------|----------|
| Frontend conventions | [packages/mobile-app/CLAUDE.md](packages/mobile-app/CLAUDE.md) |
| Design system | [packages/mobile-app/docs/design-system.md](packages/mobile-app/docs/design-system.md) |
| API documentation | [docs/api/](docs/api/) |
| Architecture | [docs/architecture/](docs/architecture/) |
| Requirements | [docs/requirements/](docs/requirements/) |
| Scrum / Project management | [docs/project-management/](docs/project-management/) |

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide. Quick summary:

- Branch from `main` for every task (never commit directly)
- Use Conventional Commits: `type(scope): description`
- Run `npm run ci:all && npm run test:all` before pushing
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
