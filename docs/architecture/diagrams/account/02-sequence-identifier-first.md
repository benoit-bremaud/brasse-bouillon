# Sequence diagram — account — identifier-first sign-in

> **Feature**: identifier-first sign-in #1081.
> **Source**: `LoginScreen.tsx`, `auth.api.ts`, `core/auth/session.ts`.

## Context

The #1081 "email d'abord" flow: the user enters an email, taps Continuer, and the
app routes to password (account exists) or create-password (new) — **without
leaking whether the email is registered** (enumeration-safe). Replaces the
tabs/Google/demo clutter. The demo-credentials shortcut is shown as the branch
that bypasses real auth.

## Diagram

```mermaid
sequenceDiagram
  actor U as User
  participant S as "Mobile — LoginScreen"
  participant Ctx as "core/auth/auth-context (useAuth)"
  participant HTTP as "core/http/http-client"
  participant API as "API — auth controller"

  U->>S: Enter email, tap "Continuer"
  S->>Ctx: checkIdentifier(email)
  Ctx->>HTTP: POST /auth/identifier
  HTTP->>API: forward
  Note over API: enumeration-safe — same shape + timing whether or not the email exists
  API-->>S: 200 { nextStep: "password" | "create" }
  alt nextStep = password
    U->>S: Enter password, tap "Se connecter"
    S->>Ctx: signIn(email, password)
    Note over Ctx: isDemoTriggerCredentials(email, password) checked HERE (needs both) → demo mode
    alt demo trigger credentials
      Ctx-->>S: enter demo mode (no API call)
    else real account
      Ctx->>HTTP: POST /auth/login
      HTTP->>API: forward
      API-->>S: 200 { user, accessToken }
      S->>S: persist token (session.ts), redirect to app
    end
  else nextStep = create
    U->>S: Set a password, tap "Créer mon compte"
    S->>Ctx: register(email, password)
    Ctx->>HTTP: POST /auth/register
    HTTP->>API: forward
    API-->>S: 201 { user, accessToken }
    S->>S: persist token, redirect to app
  end
```

## Notes / suggestions

- **Enumeration safety is the load-bearing requirement** (#1081): `/auth/identifier`
  must return an identical response shape **and** comparable timing for existing
  vs non-existing emails, otherwise it becomes an account-enumeration oracle. The
  routing decision (password vs create) is the only signal, and it is unavoidable
  for the UX — mitigate with rate-limiting + CAPTCHA-on-abuse rather than hiding
  it. **Suggested addition**: model the rate-limit/abuse path explicitly (a new
  use case "throttle repeated identifier checks") — currently absent.
- **Token storage**: `session.ts` persists the access token; **suggestion** —
  the diagram does not yet cover **refresh tokens / expiry**; if the API issues
  short-lived tokens, add a refresh sequence (see `05-state` note).
- **Demo branch** never calls the API — keep it strictly client-side.
- **OAuth (Google)**: currently cosmetic (#765). If it becomes real, it is a
  distinct sequence (provider redirect) — out of scope of #1081's first cut.
