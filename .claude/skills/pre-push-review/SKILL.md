---
name: pre-push-review
description: Brasse-Bouillon pre-push review ritual — run a local defence-in-depth review BEFORE pushing a branch. Drives the Claude reviewer (`pr-pre-reviewer` agent + `/code-review`) and the Codex reviewer (`scripts/codex-review.sh`), reconciles both into one Must Have / Should Have / Nice to Have / Disagree action list, implements the blocking fixes, and gates the push on all Must Have resolved. Use whenever about to push a feature/fix/chore/docs branch on this repo, or before opening a PR.
---

# Brasse-Bouillon — pre-push review ritual

The default review path on this repo is **local and free, before the push**.
GitHub-side reviewers are the second layer: CodeRabbit auto-reviews every PR,
Codex auto-reviews every PR, and Copilot is **manual** (`needs-copilot` label —
it bills premium requests). See [CONTRIBUTING.md](../../../CONTRIBUTING.md)
§ AI reviewers.

This skill runs **two independent reviewers locally**, makes them **confront**
their findings, and only authorises the push once the blocking items are fixed.
It never pushes by itself — the human gives the final go.

## When to run

Before pushing any branch, or before `gh pr create`. Skip only for empty diffs
(no commits between `origin/main` and `HEAD`).

## Inputs

- Current branch ≠ `main`, with commits ahead of `origin/main`.
- Base branch: `main` (default).

## Procedure

### Step 1 — Claude review (Report C)

Run the local Claude reviewer on the diff `origin/main...HEAD`:

1. Launch the **`pr-pre-reviewer`** agent (`.claude/agents/pr-pre-reviewer.md`) —
   it loads the ADRs + per-package `CLAUDE.md` and returns a Must Have /
   Should Have / Nice to Have / Disagree report with `file:line` anchors.
2. Optionally also run **`/code-review`** for a second Claude pass focused on
   correctness/simplification.

Keep the combined output as **Report C**.

### Step 2 — Codex review (Report X)

Run the Codex reviewer via the helper (read-only, mirrors the same checklist):

```bash
scripts/codex-review.sh --base main --out /tmp/codex-review.md
```

Keep the result as **Report X**. If the helper fails (Codex CLI missing or
quota exhausted), note it explicitly and continue with Report C alone — do not
silently skip it.

### Step 3 — Confrontation & reconciliation

Merge Report C and Report X into **one** action list. For each finding:

- **Both agree** → keep it, consolidated, with the agreed fix.
- **Only one raised it** → keep it, attributed; judge it on its merits.
- **They conflict** (one flags, the other explicitly disagrees, or they propose
  incompatible fixes) → resolve it: state both positions in one line each, then
  **one rebuttal round** to converge on a reliable, durable compromise. If still
  unresolved after one round, escalate to the human with the trade-off, do not
  guess.

Output a single table, each row tagged **Must Have / Should Have / Nice to Have
/ Disagree**, with the agreed resolution and a `file:line` anchor. This is the
**reconciled action list**.

Reconciliation depth is deliberately bounded: **1 confrontation pass + at most 1
rebuttal per conflict**. Do not loop indefinitely.

### Step 4 — Implement & respond

- Implement **every Must Have** (and every Should Have the reconciliation kept).
- Record a one-line **response per finding** (done / deferred-with-reason /
  disagreed-with-rationale). Nothing in the list is left unanswered.
- Re-run lint/tests for the touched packages (`npm run ci:check` / `lint:check`
  + `test:cov` as per the package `CLAUDE.md`).

### Step 5 — Push gate

Authorise the push **only if both hold**:

- Every finding in the reconciled list has a response, **and**
- Every Must Have is implemented and verified.

Otherwise, loop back to Step 4. The human triggers the actual `git push`.

## After the push (for reference, not part of this skill)

- The PR triggers **CodeRabbit** (auto) + **Codex** (auto) on GitHub.
- Add the **`needs-copilot`** label only if a deliberate Copilot review is also
  wanted (premium-request cost; ×13 per review since 2026-06-01).
- Handle posted comments per the global `pr-review-procedure` skill.

## Rules

- **Read-only reviewers.** Steps 1–2 never mutate the working tree. Fixes happen
  in Step 4, attributed to the reconciled list.
- **No silent skips.** If a reviewer could not run, say so in the output.
- **English** in all review artefacts and commit messages; **no AI attribution**.
- **Never push automatically.** Step 5 authorises; the human pushes.
