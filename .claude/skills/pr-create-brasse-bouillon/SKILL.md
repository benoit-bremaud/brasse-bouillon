---
name: pr-create-brasse-bouillon
description: Brasse-Bouillon-specific procedure for opening a pull request — wraps the generic `pr-create` skill with this repo's project ID, label triptych (type/scope/priority), team-mapping FYI rules, and the mandatory French-language FYI comment. Use whenever about to run `gh pr create` against `benoit-bremaud/brasse-bouillon`.
---

# Brasse-Bouillon — PR creation procedure

This skill is the brasse-bouillon-specific overlay on the generic `pr-create` skill loaded from `~/.claude/skills/pr-create/SKILL.md` (user-scoped, outside this repo — invoke it by name, no in-repo link possible). The generic skill defines the 6-step gh API procedure; this one fills in the constants and conventions specific to this monorepo.

## Step 1 — PR body

Follow the body template from [`CONTRIBUTING.md`](../../../CONTRIBUTING.md): `## Summary`, `## Context` (optional), `## Checklist`, `Closes #<issue>` at the end when the PR fixes a tracked issue.

Body is **English only** — per the global "GitHub artifacts in English" rule. The FYI comment in step 6 is the only French-language artefact.

## Step 2 — Assignee + labels

Always assign `benoit-bremaud`:

```bash
gh api repos/benoit-bremaud/brasse-bouillon/issues/$PR/assignees \
  -X POST --input - <<'EOF'
{"assignees": ["benoit-bremaud"]}
EOF
```

The label triptych is **mandatory** on every PR:

| Slot | Allowed values (read live with `gh label list --repo benoit-bremaud/brasse-bouillon`) |
|------|--------------------------------------------------------------------------------------|
| `type:*` | `type:feature`, `type:bug`, `type:refactor`, `type:docs`, `type:task`, `type:test`, `type:build`, `type:devops`, `type:proof`, `type:transversal` |
| `scope:*` | `scope:backend`, `scope:frontend`, `scope:website`, `scope:devops`, `scope:infrastructure`, `scope:charte` |
| `priority:*` | `priority:high`, `priority:medium`, `priority:low` |

Apply via:

```bash
gh api repos/benoit-bremaud/brasse-bouillon/issues/$PR/labels \
  -X POST --input - <<'EOF'
{"labels": ["type:...", "scope:...", "priority:..."]}
EOF
```

Note: this repo has **no `area:*`** labels (unlike feedback-widget). It uses `scope:*` only, plus optional `bloc:1..5` for sprint planning. Do not invent area labels.

## Step 3 — Project (mandatory)

Brasse-Bouillon GitHub Project node ID:

```text
PVT_kwHOB8rwIc4AuVew
```

```bash
PR_ID=$(gh api repos/benoit-bremaud/brasse-bouillon/pulls/$PR --jq '.node_id')
gh api graphql -f query='mutation($p:ID!,$c:ID!){addProjectV2ItemById(input:{projectId:$p,contentId:$c}){item{id}}}' \
  -f p="PVT_kwHOB8rwIc4AuVew" -f c="$PR_ID"
```

## Step 4 — Reviewers

CodeRabbit and Codex review **every PR automatically** on push — do **not**
call `requested_reviewers` for them (the API returns 422 for GitHub-App bots).

Copilot is **manual** (it bills premium requests; ×13 per review since
2026-06-01). Do **not** request it by default. Only when a deliberate Copilot
review is wanted, add the `needs-copilot` label:

```bash
gh pr edit "$PR" --add-label "needs-copilot"
```

The `Copilot Review` workflow then posts `@copilot please review`. See
CONTRIBUTING.md § AI reviewers.

## Step 5 — Milestone

Only set a milestone when the linked issue already has one. Ask the user before adding otherwise. Read live milestone list with:

```bash
gh api repos/benoit-bremaud/brasse-bouillon/milestones?state=open
```

## Step 6 — FYI notification comment (mandatory, **French**)

Post a plain-language **French** comment on every PR, with `@-mentions` derived from the PR's `scope:*` label:

| `scope` label | @-mentions | Notes |
|--------------|------------|-------|
| `scope:backend` | `@vitalikevin` | Backend lead. |
| `scope:frontend` | `@Smith06S @Thais9723` | Frontend pair. |
| `scope:website` | `@Smith06S @Thais9723 @Lin0ooo @Liamggn` | Frontend + design (depending on the task — ask if unsure). |
| `scope:devops` | `@clemoune-tech @Moooniie` | DevOps duo. |
| `scope:infrastructure` | `@astronas @clemoune-tech` | Infra + DevOps. |
| `scope:charte` | `@Lin0ooo @Liamggn` | Design pair. |
| Security-touching | add `@Fabien-Ori` | Cyber lead. |

The comment **must** be in plain non-technical French so every team member (incl. designers) understands. Explain:

- *what* was done (without jargon),
- *why* it matters for the project,
- *what changes for them* (often "rien à faire de spécial").

Template:

```text
@user1 @user2 — Pour info : <1 phrase d'accroche claire et accessible>.

<2-4 phrases vulgarisées : ce qui a été fait, ce que ça apporte au projet, et pourquoi maintenant. Pas de jargon ; les termes techniques sont expliqués entre parenthèses>.

<1 phrase de clôture : impact pour l'équipe / la suite>.
```

Send via:

```bash
gh api repos/benoit-bremaud/brasse-bouillon/issues/$PR/comments \
  -X POST -f body="<French FYI text>"
```

## Validation order (non-negotiable)

1. Confirm the user wants the PR opened (per global "Ask before creating a PR" rule).
2. Open the PR (step 1).
3. Apply labels + assignee + project + milestone (steps 2–5) — these can run in parallel.
4. Post the French FYI comment (step 6).
5. Wait for the automatic reviews (CodeRabbit + Codex) to be **posted** per the global `pr-review-procedure` skill (loaded from `~/.claude/skills/pr-review-procedure/SKILL.md`, user-scoped — invoke by name, no in-repo link possible) before any merge. Add the `needs-copilot` label only if a deliberate Copilot review is also wanted (step 4).

Never auto-merge. Never use `--auto` or `--admin`. Per the global merge gate, present a readiness summary in English and wait for explicit textual approval.
