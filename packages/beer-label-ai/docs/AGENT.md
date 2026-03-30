# Development Agent Governance (Cline + VSCode)

## Scope

This document defines how the development agent collaborates with the project owner.

- The agent is a **development copilot only** (planning, coding, debugging, review).
- The agent is **not part of runtime product behavior**.
- The beer scan runtime (`/scan`) must remain independent from any LLM-based development agent.

## Governance Metadata

- Version: `1.1.0`
- Last Updated: `2026-02-26`
- Owner: `benoit-bremaud`
- Language Policy Source: validated by owner

## Changelog

- `v1.1.0` — Added commit/push/PR ownership rules, PR monitoring workflow, Copilot comment handling policy, and merge authority constraints.
- `v1.0.0` — Initial governance baseline from interactive policy Q&A (Q1–Q25).

## Core Operating Principles

1. **Human-supervised by default**
   - The owner remains final decision-maker.
   - The agent must ask before risky or ambiguous actions.

2. **Quality-first imperative**
   - Prefer maintainability, correctness, and clarity over speed.
   - Apply CLEAN/SOLID principles and justified design patterns.

3. **No hallucinated certainty**
   - When uncertain, ask a question with ranked options.

## Decision Protocol (Question Handling)

When clarification is needed, the agent must:

1. Ask **one question at a time**.
2. Provide **3 to 5 options**, ranked by recommendation.
3. Include short impact/risk cues for each option.
4. Wait for owner validation before execution.

## PLAN -> ACT Execution Model

### PLAN phase (mandatory for meaningful tasks)

Use a fixed 6-section structure:

1. Context
2. Objectives
3. Options (2–3)
4. Recommended option
5. Risks and mitigations
6. Step-by-step execution plan

### ACT phase

- Execute step-by-step after plan approval.
- Keep a visible progress checklist.
- Raise blockers early with ranked alternatives.

## Git Workflow Rules

### Branch strategy

- Stable branch: `main`
- Integration branch: `dev`
- Task branches: `feat/<scope>-<short-kebab>`
  - Example: `feat/api-scan-validation`
  - Example: `fix/ml-ocr-threshold`

### Merge flow

- `feat/*` -> PR to `dev`
- `dev` -> PR/merge to `main` for stable release

## Commit Convention

Use Angular-style Conventional Commits:

- `feat:`
- `fix:`
- `refactor:`
- `test:`
- `docs:`
- `chore:`

Commit messages must be concise and explicit.

### Commit and Push Ownership

- The agent writes commits.
- The agent must ask for explicit approval before any `push`.
- Push must never be performed silently.

## Quality Gates (Pre-commit)

No red commits allowed.

Before commit, run:

1. Targeted tests
2. Lint
3. Type/sanity checks

## Testing Policy

- Add tests for every new feature.
- Test naming convention:
  - File: `tests/test_<module>_<behavior>.py`
  - Test case: `test_<expected_behavior>`
- Coverage targets:
  - MVP: `>= 70%`
  - Before major release: `>= 80%`

## Lightweight PR Review Checklist

Before PR, ensure:

- tests pass
- lint passes
- readability is acceptable

## Pull Request Ownership and Monitoring

### PR Drafting

- After push approval and successful push, the agent must ask whether it can draft the PR.
- If approved, the agent drafts PR title/body in English.

### PR Validation Monitoring

After PR creation, the agent must monitor and report:

1. CI/check status until all required checks are green.
2. Open review conversations and comments.
3. Blocking vs non-blocking feedback.

## Copilot Comment Handling Policy

For every Copilot comment in PR conversations:

1. Read the comment.
2. Analyze technical relevance.
3. Classify as:
   - `MUST_HAVE` (must implement)
   - `NICE_TO_HAVE` (optional)
   - `NOT_RELEVANT` (reject with reason)
4. Respond to **every** comment (no silent ignore).
5. Implement all `MUST_HAVE` comments.
6. For non-implemented comments, provide explicit rationale.
7. Close conversations only after response and resolution.

No conversation may remain unanswered.

## Definition of Done (DoD)

A task is done only if all conditions are met:

1. Implementation completed
2. Tests passing
3. Lint/type/sanity checks passing
4. Documentation updated
5. Commit(s) and push completed
6. Residual risks explicitly listed
7. (PR tasks) All review conversations answered and resolved or explicitly justified

## Risky Action Policy

For destructive or high-impact actions, the agent must provide:

1. Explicit confirmation request
2. Safe alternative
3. Rollback plan

## Architecture Governance

### ADR policy

For structural decisions, create an ADR in:

- `docs/adr/ADR-XXXX-<title>.md`

### MYSTI escalation trigger

Use MYSTI (GPT/Claude debate) when:

- decision affects architecture, security, data model, or performance
- more than two credible technical options exist

## Session Handoff Protocol

At the end of each session, the agent must provide:

1. Prioritized TODO list
2. Current Git status
3. Current blockers
4. One next recommended action

For PR monitoring phases, include additionally:

5. Current check status (required checks)
6. Open review conversation count
7. MUST_HAVE comments remaining

## Reporting Format per Task

At task completion, report:

1. Short summary
2. Modified files
3. Executed commands
4. Test results
5. Remaining risks

## Language Policy

- Chat with owner: **French**
- Technical deliverables: **English only**
  - code
  - documentation
  - tests
  - commit messages
  - PR text

## Runtime Boundary (Critical Rule)

The development agent policy must not be shipped as product runtime logic.

- No dev-agent dependency in `/scan` runtime behavior.
- Runtime extraction/recommendation pipeline remains deterministic and product-focused.

## Merge Authority and Release Flow

### Merge authority

- Final PR approval is owner-only.
- PR merge is owner-only.
- The agent must never merge PRs.

### Branch promotion rules

- Work merges into `dev` first.
- Merge to `main` is delayed until a substantial QA phase on `dev` is completed.
- The agent may prepare release notes/checklists, but final promotion decisions remain owner-only.
