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

Update `.env` if the API is not on localhost.

### Test on physical mobile (Expo Go)

1. Find your computer LAN IP (example: `192.168.1.42`).
2. Set API URL in `.env`:

```bash
EXPO_PUBLIC_API_URL=http://192.168.1.42:3000
```

1. Ensure phone + computer are on the same Wi-Fi.
2. Run Expo in LAN mode:

```bash
npm run start:lan
```

1. Scan the QR code from Expo Go.

## Run

```bash
npm run start
```

Then open in:

- iOS Simulator / Android Emulator
- or scan the QR code with Expo Go (LAN IP required for API access)

## Clean Architecture (minimal MVP)

```text
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

## Demo data toggle

You can switch between demo data and the live API using:

```bash
EXPO_PUBLIC_USE_DEMO_DATA=true
```

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
