# Sequence diagram — feedback — submission with offline fallback

> **Feature**: epic [#1026](https://github.com/benoit-bremaud/brasse-bouillon/issues/1026) — beta distribution + in-product feedback loop.
> **Children**: [#1027](https://github.com/benoit-bremaud/brasse-bouillon/issues/1027) (API endpoint), [#1028](https://github.com/benoit-bremaud/brasse-bouillon/issues/1028) (website widget), [#1029](https://github.com/benoit-bremaud/brasse-bouillon/issues/1029) (in-app feedback).
> **Reused tool**: `feedback-widget` `core` use-cases `buildFeedbackPayload`, `submitFeedback`, `drainOutbox` (private repo).
> **Related ADRs**: [ADR-0002](../../decisions/0002-centralized-nestjs-backend.md), [ADR-0003](../../decisions/0003-consent-single-source-of-truth.md).

## Context

What happens **in time** when a tester submits one piece of feedback, on either surface. The same `core` use-cases run behind both adapters; only the ports (View, Transport, Outbox, ContextCollector) are surface-specific. This diagram makes the **pre-flight checks** and the **offline outbox** explicit — the parts the [use-case diagram](01-use-case-feedback.md) intentionally hides.

It does **not** show structural boundaries (see [03 component](03-component.md)) nor the field-level PII (see [06 data flow](06-data-flow.md)).

## Diagram

```mermaid
sequenceDiagram
    actor U as Beta tester
    participant V as View adapter<br/>(Web Component / RN view)
    participant Core as feedback-widget core<br/>(use-cases)
    participant Ctx as ContextCollector<br/>(browser / RN)
    participant T as Transport<br/>(HTTP port)
    participant API as NestJS API<br/>(POST /feedback)
    participant DB as Feedback store
    participant Box as Outbox<br/>(localStorage / RN storage)

    Note over U,V: v0.1 — consent is handled client-side<br/>(mobile store, ADR-0003) / website: widget<br/>consent checkbox (open question). NO backend gate yet.
    U->>V: Open widget, pick category + subCategory, type message
    V->>Core: buildFeedbackPayload(input)
    Core->>Ctx: collect()
    Ctx-->>Core: BrowserContext (url, locale, viewport, sessionId, …)
    Core-->>V: FeedbackPayload

    U->>V: Submit
    V->>Core: submitFeedback(deps, input)
    Note over Core: pre-flight — honeypot,<br/>min form-open time, rate limit
    alt pre-flight fails
        Core-->>V: { ok: false, reason }
        V-->>U: Inline error (no network call)
    else pre-flight passes
        Core->>T: send(payload)
        T->>API: POST /feedback
        alt API reachable
            API->>DB: persist feedback (v0.1 — no backend consent gate)
            DB-->>API: stored
            API-->>T: 201 Created
            T-->>Core: { ok: true }
            Core-->>V: { ok: true }
            V-->>U: Confirmation
        else network / server error
            API-->>T: 4xx/5xx (or no response)
            T-->>Core: { ok: false, reason }
            Core->>Box: enqueue(payload)
            Core-->>V: { ok: false, reason }
            V-->>U: "Saved, will retry"
        end
    end

    Note over Core,Box: Later — on next widget load / reconnect
    Core->>Box: drainOutbox(deps)
    Box->>T: replay queued payloads
    T->>API: POST /feedback (retry)
    API-->>T: 201
    Box->>Box: purgeExpired(maxAgeMs)
```

## Notes

### Key calls reviewers should look at

- **`buildFeedbackPayload` is pure** — it validates the category/sub-category pairing and assembles `FeedbackPayload`. It throws only on invalid pairings (a programming error), never on user input. The user-facing validation (message 10–2000 chars) lives in the View adapter.
- **`submitFeedback` runs pre-flight checks before any network call** — honeypot, minimum form-open time, and rate limit. A failed pre-flight returns `{ ok: false, reason }` without hitting the API. The NestJS endpoint (#1027) should re-enforce rate limiting server-side; client checks are advisory only.
- **Consent is client-side at v0.1** ([ADR-0003](../../decisions/0003-consent-single-source-of-truth.md)). The consent store lives on the mobile client; there is **no backend consent module yet** (it ships in the ADR-0003 v0.2 roadmap, when auth-backed sync lands). The v0.1 endpoint therefore persists without a server-side consent gate. On the website surface, anonymous-visitor consent is an open question (widget checkbox vs documented legitimate-interest basis) — see [06 data flow](06-data-flow.md).

### Anti-patterns this diagram makes visible

- **Silent drop on failure.** A failed submission must `enqueue` to the outbox and tell the user it will retry — never swallow it. The `else` branch makes the fallback mandatory, not optional.
- **Client-only rate limiting.** The client rate limit is bypassable; the diagram shows the API as a separate lane so reviewers remember to enforce it server-side in #1027.

### Open questions

- Outbox `maxAgeMs` (retry expiry window) is a tuning constant — pick a value in #1028/#1029 and document it.
- On the mobile surface, should `drainOutbox` run on app foreground, on connectivity regain, or both? Resolve in #1029.
