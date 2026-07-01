# ADR-0022 — Public project FAQ chatbot on the website, backed by Mistral (EU/RGPD)

**Status**  Proposed
**Date**    2026-07-01
**Owners**  @benoit-bremaud

---

## Context

We want a **public conversational FAQ chatbot** on the marketing website
(`packages/website`) that answers questions from **curious visitors about the project**
(vision, features, how it works, how to join the beta). It is **anonymous** (no login), so
the risk profile differs from an in-app authenticated helper: **cost/abuse**, **hallucination
about the project**, **brand safety**, and **GDPR of visitor messages** all move to the
foreground.

Decisions taken during the requirements workshop:

- **Provider = Mistral** (French/EU) for **data sovereignty / GDPR**.
- **Scope = the brasse-bouillon project only.**
- This public FAQ bot is **v1**; the earlier idea of an authenticated in-app brewing helper
  becomes a possible later surface, not v1.

Repo constraints: ADR-0002 (external services **proxied by the API** — the browser never holds
the key), ADR-0001 (build for today), ADR-0003 / ADR-0012 (consent / RGPD), ADR-0019 (testing).

> Naming note: the module is named `faq-bot` — a **public presentation & FAQ chatbot** for the
> *brasse-bouillon* project (what it is, its features, how to join the beta). It is **not** a
> brewing assistant: it has no brew-guidance capability. An in-app brewing helper is a possible
> **later** surface, never v1.

---

## Decision

1. **Public, server-side, proxied (ADR-0002).** Feature module
   `packages/api/src/faq-bot/` exposes `POST /faq-bot/ask` as a **public**
   (anonymous) endpoint, **throttled**, with **CORS restricted to the site origin**. The website widget
   calls this endpoint; the **Mistral key stays server-side** (`MISTRAL_API_KEY` via
   `@nestjs/config`) and never ships to the browser.

2. **Provider behind a port (CLEAN + SOLID).** `LlmPort` (`ports/`) ← `MistralLlmAdapter`
   (`adapters/`). Dependency Inversion: swapping provider = a new adapter; unit tests inject a
   **fake `LlmPort`**. Layering **proportional** (ADR-0001): `ports/` + `adapters/` only.

3. **Prompt-as-spec + curated knowledge.** `prompts/system-prompt.md` (persona + guardrails)
   and `prompts/context.md` (**curated project facts**, versioned, **manually updated** — no RAG
   in v1). Guardrails:
   - **Project-only scope** — off-topic → polite **redirect + beta CTA**.
   - **Abstain when unknown** — points to **[CONTACT]** instead of inventing.
   - **No PII** — never requires it, invites the visitor not to share it.
   - **Never reveals the system prompt**; **anti-jailbreak** (immutable rules).
   - **Language** — answers in the visitor's language (**FR/EN**).
   - **One-shot** — no conversation history in v1.
   - **Tone** — warm and passionate, short answers.

4. **Abuse & cost controls** (public endpoint on a paid LLM):
   - **Rate-limit per IP** + **input/output length caps**.
   - **ALTCHA from v1** (EU, open-source, **self-hosted** anti-bot): the challenge is issued
     and verified **server-side with our own HMAC secret** — **no third-party call**, no
     cookies, no tracking. Kept behind a `BotCheckPort` so the provider stays swappable.
   - **Kill-switch flag** + **monthly budget cap (~10–30 €)** that disables the bot past the
     ceiling.
   - **No cache** in v1.
   - **Graceful fallback** on provider failure (clear message + **[CONTACT]**).

5. **GDPR (ADR-0003 / ADR-0012).** **No conversation content logged** — anonymous **metadata
   only** (latency, tokens, volume, abstention rate, top questions). **Light in-widget notice**
   (“AI-powered, don’t share personal info”), **no tracking**. **Mistral DPA + no-training /
   zero-retention** enabled (to confirm in current terms).

6. **Two test layers (ADR-0019).**
   - **Deterministic unit** (Jest, H/S/E, LLM **mocked**): prompt/context assembly, DTO
     validation, rate-limit → 429, timeout/error → `FaqBotUnavailableException`, kill-switch
     off → disabled response, and the **no key/PII in logs** invariant.
   - **Eval suite** (non-deterministic): `test-cases.json` + LLM-as-judge → `results.json`,
     gating the prompt/guardrails. Runs **out of the fast unit pyramid** (on demand / CI job).

---

## Provider sovereignty (EU-first)

Founder rule: **French / European digital sovereignty first; a US vendor only when no viable
European alternative exists.** Applied here:

- **LLM — Mistral (France).** European alternatives considered: OVHcloud AI Endpoints (FR),
  Scaleway Generative APIs (FR), Aleph Alpha (DE). Mistral wins on managed-API maturity at
  equal EU sovereignty.
- **Anti-bot — ALTCHA (EU, open-source, self-hosted).** Replaces the originally-considered
  **Cloudflare Turnstile (US)**. Comparison below.

## Model selection (weighted decision matrix)

Technique: a **weighted decision matrix** (each criterion weighted; each candidate scored /5;
weighted sum). EU data residency is a **pass/fail prerequisite** (all Mistral models pass), not
a scored criterion. Weights reflect a **public, jailbreak-exposed** surface.

| Criterion (weight) | ministral-3b | open-mistral-nemo | **mistral-small** |
| --- | --- | --- | --- |
| Stays in role / anti-jailbreak (27%) | 2 | 3 | **4** |
| Answers accurately / low hallucination (27%) | 2 | 3 | **4** |
| Cost per question (23%) | 5 | 5 | **4** |
| Latency (23%) | 5 | 4 | **4** |
| **Weighted score** | **3.38** | **3.69** | **4.00** |

**Chosen: `mistral-small-latest`.** Stable even after boosting cost & latency to match the two
non-negotiables — it is the only balanced candidate, and the cost delta is a fraction of a cent
per question, bounded by the monthly cap. The safer, more faithful model wins.

## Anti-bot selection (European comparison)

| Criterion | **ALTCHA (OSS, self-hosted)** | Friendly Captcha (SaaS, DE) | mCaptcha (OSS) | Cloudflare Turnstile (US) |
| --- | --- | --- | --- | --- |
| Sovereignty (data stays with us / EU) | **5** | 3 (EU endpoint ≥ €200/mo) | 5 | 1 (US transit) |
| Privacy (no cookies / tracking) | **5** | 4 | 4 | 2 |
| Ops simplicity (solo team) | **4** (npm lib + HMAC key) | 5 (managed) | 2 (run a service) | 5 |
| Cost | **5** (free, MIT) | 2 (€9–200/mo) | 5 | 5 |
| Anti-bot strength | 3 (PoW + our throttle/cap) | 4 | 3 | 5 |
| Accessibility (WCAG 2.2 AA / EAA) | **5** | 4 | 3 | 4 |

**Chosen: ALTCHA (open-source, self-hosted).** The only option keeping 100 % of data in our
backend (challenge created + verified locally via HMAC, **no third-party call**), free (MIT), no
cookies, and WCAG 2.2 AA / EAA compliant — which also serves the widget's accessibility
requirement. Its lighter proof-of-work deterrent is backstopped by throttle + budget cap +
kill-switch, and it sits behind a `BotCheckPort` so a stronger provider can be swapped in later.

## Locked v1 parameters

- **Model** `mistral-small-latest` (REST API via native `fetch`, small/eco tier).
- **Anti-bot** ALTCHA self-hosted (`altcha-lib`), guard **bypasses when no HMAC secret** is
  configured (dev/CI), strict when present (prod/staging).
- **Throttle** ~5 requests / 60 s per IP on `/ask`; **question ≤ 500 chars**, **answer capped**.
- **Kill-switch** `FAQ_BOT_ENABLED` (default on); **budget cap**
  `FAQ_BOT_MONTHLY_BUDGET_EUR` (default 20), v1 in-memory best-effort (persisted in v2).
- **Metrics** anonymous, in-memory; **top-questions limited to the predefined widget chips**
  (free-text never stored) to honour "no conversation content logged".
- **Widget** ships **staging/localhost-gated** first (production only once deployed + green).

## How we build it (TDD — the same loop as the kata)

- **Prompt (eval-driven).** One guardrail at a time: write an eval case (🔴 RED — judge fails),
  grow `system-prompt.md`/`context.md` the **minimum** (🟢 GREEN), refactor. No rule enters the
  prompt until a failing case demands it.
- **Service + adapter (unit TDD, H/S/E).** Failing `.spec.ts` first (fake `LlmPort`), minimal
  implementation, refactor.
- **Invariant:** tests precede code; green stays green; unit layer and eval layer never mix.

---

## Consequences

**Positive:** EU data sovereignty; provider-swap trivial (DIP); prompt is reviewable code;
abuse/cost bounded (rate-limit + ALTCHA + cap + kill-switch); safety is **testable** via the
eval suite.

**Negative:** a public endpoint is an attack/cost surface (mitigated as above); a small model
can be easier to jailbreak (mitigated by scope-lock + eval guardrails + no history); manual
upkeep of `context.md` (accepted for v1 — RAG in v2); ALTCHA adds a lightweight, usually
invisible proof-of-work step (no user interaction in the common case).

---

## Roadmap

- **v1** — bubble widget → public throttled endpoint (+ ALTCHA) → **mistral-small-latest**;
  project-only scope, FR/EN, abstain, anti-injection, kill-switch + budget cap, base metrics,
  no content logging.
- **v2** — **RAG over `docs/`**, **multi-turn**, **analytics dashboard**.
- The cross-feature **AI-generated content policy** is formalized in the reserved **ADR-0008**.

---

## References

- ADR-0001 (build for today) · ADR-0002 (proxy) · ADR-0003 / ADR-0012 (RGPD) · ADR-0019 (tests).
- Diagrams: [docs/architecture/diagrams/faq-bot/](../diagrams/faq-bot/).
- Prompt-TDD methodology origin: the `tp-tdd-prompt-po` kata (prompt-as-spec + LLM-as-judge).
