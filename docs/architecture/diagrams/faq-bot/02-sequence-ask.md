# Sequence diagram — faq-bot — "Ask about the project"

> **Feature**: public FAQ bot — nominal flow for UC1/UC2 (a visitor asks a question).
> **Related ADRs**: [ADR-0022](../../decisions/0022-public-faq-chatbot-llm.md),
> [ADR-0002](../../decisions/0002-centralized-nestjs-backend.md).

## Context

Temporal flow of one question, **website widget → API (public, proxied) → Mistral → API →
widget**. It shows where each control sits: the ALTCHA bot-check, throttler/rate-limit, DTO
validation, kill-switch/budget, the `LlmPort` seam, post-checks, the response envelope, and
graceful fallback. Structure in [03-component.md](03-component.md); goals in
[01-use-case.md](01-use-case.md).

## Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Visitor
    participant W as Chat widget (website)
    participant Ctrl as FaqBotController
    participant Svc as FaqBotService
    participant Port as LlmPort
    participant Adp as MistralLlmAdapter
    participant LLM as Mistral API (EU)

    Visitor->>W: types a question about the project
    Note over W: widget already fetched GET /challenge<br/>and solved the ALTCHA proof-of-work locally
    W->>Ctrl: POST /faq-bot/ask (ALTCHA payload, {question})
    Note over Ctrl: public + Throttler (rate-limit/IP)<br/>+ BotCheckGuard (ALTCHA, self-hosted) + class-validator DTO (length cap)

    alt kill-switch on & budget OK & ALTCHA valid
        Ctrl->>Svc: ask(question)
        Svc->>Svc: assemble prompt (system-prompt.md + context.md + question)
        alt provider OK
            Svc->>Port: complete(prompt)
            Port->>Adp: complete(prompt)
            Adp->>LLM: POST /v1/chat/completions (mistral-small-latest)
            LLM-->>Adp: completion
            Adp-->>Svc: answer text
            Svc->>Svc: post-checks (length cap, abstain marker → metric)
            Svc-->>Ctrl: AnswerDto
            Ctrl-->>W: 200 envelope { success, data }
            W-->>Visitor: shows the answer (+ beta CTA)
        else timeout / provider error
            Adp-->>Svc: throws
            Svc-->>Ctrl: FaqBotUnavailableException
            Ctrl-->>W: envelope { success:false } (graceful)
            W-->>Visitor: "unavailable — contact [CONTACT]"
        end
    else disabled (kill-switch/budget) or ALTCHA/rate-limit failed
        Ctrl-->>W: 403/429 or "temporarily unavailable"
        W-->>Visitor: friendly message (+ [CONTACT])
    end
```

## Notes

- The **Mistral key** is used only inside `MistralLlmAdapter` (server-side) — ADR-0002.
- **No history** (one-shot) and **no content logged** — anonymous metadata only (latency, tokens).
- The **ALTCHA** proof-of-work payload is verified server-side in `BotCheckGuard` via `altcha-lib`
  with our own HMAC secret — **no third-party call** (self-hosted, EU-sovereign). Solved proofs
  are **single-use**: a replayed proof is rejected (in-memory, TTL = the challenge lifetime).
  When no secret is configured the guard bypasses **only in dev/test** and **fails closed**
  (503) anywhere else, so a misconfigured deploy never exposes the paid endpoint.
