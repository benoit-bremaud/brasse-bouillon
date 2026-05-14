---
name: adr-new
description: Scaffold a new Architecture Decision Record under docs/architecture/decisions/ with the next available NNNN number and the MADR-aligned template the project already uses. Use when the user asks to "open an ADR", "draft a new ADR", "document this decision as an ADR", or after a substantive architectural choice that needs to be captured before merging.
---

# New ADR — scaffolding skill

## When to use

Trigger this skill when a substantive architectural decision is being made or has just been made, and the user wants it captured as a permanent record under `docs/architecture/decisions/`.

Typical triggers:

- User says: *"open an ADR for this"*, *"on documente cette décision en ADR"*, *"adr-new <slug>"*.
- A PR review or planning session converged on a decision (e.g. *"we'll keep stitching in-process Python, not a subprocess"*) and the user is about to merge — capture before that PR closes.
- The brasse-bouillon CLAUDE.md flags an ADR-touching change without a matching ADR.

Do NOT use for: micro-decisions that fit in a `Decisions:` block of `PROJECT_LOG.md`, code-style preferences (belong in `CLAUDE.md`), or one-off bug fixes.

## Step 1 — Compute the next ADR number

```bash
NEXT=$(ls docs/architecture/decisions/ \
    | grep -E '^[0-9]{4}-' \
    | sed -E 's/^([0-9]{4})-.*/\1/' \
    | sort -n \
    | tail -1 \
    | awk '{printf "%04d", ($1+1)}')
echo "Next ADR: $NEXT"
```

Read live — never hardcode the number. If the parsing returns empty, start at `0001`.

## Step 2 — Confirm slug + status with the user

Ask the user (via `AskUserQuestion`) for:

1. The **slug** (kebab-case, max ~6 words) — drives the filename `NNNN-<slug>.md`.
2. The **status** at creation time: `Proposed`, `Accepted`, or `Superseded by ADR-NNNN` (if rewriting an old one).

Default status: `Proposed`. Mark as `Accepted` only when the user confirms it has team buy-in. Never invent the status.

## Step 3 — Write the ADR with the project's template

File: `docs/architecture/decisions/NNNN-<slug>.md`

Template (mirrors the structure used in [ADR-0001](../../../../docs/architecture/decisions/0001-build-for-today-design-for-tomorrow.md) through ADR-0005):

```markdown
# ADR-NNNN — <Title in Title Case>

- **Status**: Proposed | Accepted | Superseded by ADR-NNNN
- **Date**: YYYY-MM-DD (today's date)
- **Deciders**: benoit-bremaud (+ any teammates involved)
- **Related**: PR #N, issue #M, ADR-XXXX (link any direct antecedents)

## Context

What problem are we solving? What are the constraints? What did we observe in
the codebase, in the team, or in production that made this decision necessary?
Be specific — vague context produces vague decisions.

## Decision

The concrete rule we adopt. Phrased as a directive, not a discussion.
- If the decision has several clauses, number them so reviewers can cite
  "ADR-NNNN clause 3" in PR comments.
- If it forbids patterns, list each forbidden pattern explicitly.

## Consequences

### Positive

- What gets better as a result.

### Negative

- What gets harder, costs more, or is constrained by this choice.

### Mitigations

- How we plan to live with the negative consequences.

## Alternatives considered

For each rejected alternative, one paragraph: what it was, why it didn't fit.
This prevents future re-litigation of the same choice.

## Verification

How we know the decision is being respected:
- PR-review checklist item to add to `pr-pre-reviewer` subagent?
- CI rule? Hook? Test?
- A pattern to grep for periodically?
```

## Step 4 — Surface the new ADR

After writing the file:

1. **Stage it** but do NOT auto-commit — the user typically commits the ADR together with the PR that introduces the related change.
2. **Update the project root `CLAUDE.md`** if the new ADR joins the "Active accepted ADRs" list (only when status is `Accepted`). Ask the user before touching `CLAUDE.md`.
3. **Tell the user** the filename and number; remind them that every reviewer must read the ADR before merging (per `CLAUDE.md` § Architecture Decision Records).

## Rules

- Numbers are immutable. A failed/withdrawn ADR keeps its number — mark it `Status: Superseded` or `Withdrawn` and write a new ADR with the next number. **Never reuse** a number.
- English only — like every committed artefact in this repo.
- No AI attribution in the ADR body (`Deciders:` lists humans, not agents).
- Cross-reference related ADRs by their number (`ADR-0002`), not by raw filename, so renames are safe.
