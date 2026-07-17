# State diagram — account — session and destructive-flow lifecycle

> **Feature**: `core/auth/session.ts`, AuthProvider, Profile account actions.

## Session state

```mermaid
stateDiagram-v2
  [*] --> Anonymous
  Anonymous --> Restoring: app bootstrap
  Restoring --> Anonymous: no token
  Restoring --> Authenticated: token + current user valid
  Restoring --> DemoMode: demo token restored
  Restoring --> Anonymous: token rejected with 401
  Restoring --> RestoreError: transient restore failure
  RestoreError --> Anonymous: user retries or continues offline

  Anonymous --> Authenticating: submit credentials
  Authenticating --> Authenticated: login/register succeeds
  Authenticating --> Anonymous: credentials rejected
  Anonymous --> DemoMode: reserved demo credentials

  Authenticated --> RefreshingProfile: profile refresh/update
  RefreshingProfile --> Authenticated: operation succeeds
  RefreshingProfile --> Anonymous: 401 / session invalidated
  RefreshingProfile --> Authenticated: recoverable operation failure

  Authenticated --> SignOutPending: sign out confirmed
  SignOutPending --> Anonymous: token cleared
  SignOutPending --> Authenticated: clear failure

  Authenticated --> DeletePending: deletion confirmed
  DeletePending --> Anonymous: server deletion + local purge succeed
  DeletePending --> Authenticated: deletion failure
  DemoMode --> Anonymous: demo sign out
```

## State rules

- `AuthProvider` exposes `session: null` until bootstrap completes, preventing
  the app router from rendering an authenticated surface prematurely.
- A live-session 401 clears the local token and session. Demo mode never calls
  live authenticated endpoints and is not purged by the live 401 handler.
- Profile mutation states are local to the relevant screen for button-level
  duplicate-submit protection; `AuthProvider.isLoading` remains the shared
  auth-operation state.
- Delete confirmation is a separate UI state from `DeletePending`. The
  destructive request cannot start without typed username confirmation.
- A future refresh-token state is intentionally not modelled: the current API
  contract exposes access-token persistence plus 401 invalidation only. It must
  be added as a separate authentication design before implementation.
