# Brasse Bouillon — Frontend (Expo)

React Native (Expo Router) frontend for the Brasse Bouillon backend. MVP scope: login, list recipes, start a batch, and follow batch steps.

## Requirements

- Node.js + npm
- Expo CLI (via `npx expo`)
- Backend running locally (`brasse-bouillon-backend`)

## Setup

```bash
npm install
cp .env.example .env
```

Update `.env` if the API is not on localhost (for physical devices, use your LAN IP).

## Run

```bash
npm run start
```

Then open in:
- iOS Simulator / Android Emulator
- or scan the QR code with Expo Go (LAN IP required for API access)

## Clean Architecture (minimal MVP)

```
src/
  core/
    auth/            # auth session + provider
    config/          # environment (API base)
    http/            # HTTP client + errors
    ui/              # shared UI primitives
  features/
    auth/            # login flow
    recipes/         # list + detail + steps
    batches/         # list + detail + complete step
```

Routes live in `app/` and delegate to `features/*/presentation` screens.

## API Notes

All backend responses are wrapped (success/statusCode/message/data). The client unwraps `data` automatically.

Auth:
- `POST /auth/login`

Recipes:
- `GET /recipes`
- `GET /recipes/:id`
- `GET /recipes/:id/steps`

Batches:
- `POST /batches`
- `GET /batches`
- `GET /batches/:id`
- `POST /batches/:id/steps/current/complete`

## PWA — Quick tradeoff

**Pros**
- Fast iteration on web, zero store friction
- Easy demo/sharing
- One codebase (Expo web)

**Cons**
- Limited access to native sensors/notifications/background tasks
- Offline/FS access still constrained
- UX/perf may be below native for heavy screens

Recommendation for now: keep the Expo app as the source of truth, and enable web as a secondary target for quick testing.
