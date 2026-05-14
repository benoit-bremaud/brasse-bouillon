---
name: project-log-entry
description: Append a new entry to `PROJECT_LOG.md` for a freshly merged PR, a substantive decision, a tag, or an admin bypass — using the brasse-bouillon-specific format (most-recent-first, terse references + SHA + closes-refs, no narrative paragraphs). Use immediately after every PR merge on `main`, after creating a release tag, or when capturing a standalone architectural decision.
---

# Brasse-Bouillon — PROJECT_LOG.md entry

This skill is the brasse-bouillon overlay on the global [`project-log-discipline`](../../../skills/project-log-discipline/SKILL.md) skill. The global skill defines the discipline (what to log, audit cadence, anti-patterns); this one defines this repo's **exact format** so entries stay consistent.

## When to use

- **Every merged PR** on `main` → one entry, immediately after merge + cleanup.
- **Every release tag** → one entry referencing the tag and the merged release PR.
- **Every admin-bypass commit pushed directly to `main`** → one entry with the reason.
- **A substantive standalone decision** that doesn't fit inside a single PR entry → a dedicated session block (see example for the `2026-05-08` D1–D7 session).

Do NOT log: feature-branch commits, closed-but-unmerged issues, routine review back-and-forth without substance, sprint plannings without a backlog change.

## Step 1 — Locate the insertion point

Open [`PROJECT_LOG.md`](../../../../PROJECT_LOG.md). The file is **reverse-chronological** (most recent first). Entries are grouped under `## YYYY-MM-DD` date headings.

- If today's date heading already exists → add the new entry **at the top of that day's section**, before any other entry from today.
- If today's date heading does not exist → insert a new `## YYYY-MM-DD` heading at the very top of the file (after the title + intro), and put the entry under it.

Always convert relative dates to absolute ISO (`2026-05-14`), not "today" or "yesterday".

## Step 2 — Entry format (terse references, never narrative)

The project memory rule is explicit: **entries are references, not narrative**. GitHub is the source of truth; the log just points at it.

### PR-merged entry template

```markdown
### PR #N merged (`<sha7>`) — <conventional-commit-style subject>

- Branch `<branch-name>`, <count> commits (`<sha7-1>`, `<sha7-2>`, ...).
- Closes #<issue-1>, #<issue-2>, ... (only those explicitly closed by the PR).
- <One line per sub-issue or substantive decision, when applicable>.
```

- `<sha7>` is always the **7-character merge SHA** on `main`, obtained via `git log --oneline -1`.
- Subject mirrors the PR title (without the `(#N)` suffix the squash-merge adds).
- Keep the description compact: file lists, line counts, and prose belong in the PR description, not here.

### Decisions sub-block (when relevant)

When the PR (or session) introduced architectural decisions:

```markdown
- **Decisions**:
  - `<decision label>` — <one-sentence rationale, alternative rejected if non-obvious>. Recorded on #<issue>.
```

The backtick-wrapped label is the canonical handle that other entries can cross-reference.

### Standalone decision-session block

Used when the substance is a planning/decision session not tied to a single PR — e.g. the `2026-05-08` *"Algorithm redefinition session (decisions D1–D7)"* in the current log. Heading style: `### <Session topic> (decisions D1–DN)` followed by one bullet per decision in the same `\`label\` — explanation` shape.

### Tag entry template

```markdown
### Tag `vX.Y.Z` shipped (`<sha7>`)

- Release PR #N merged into the tag.
- CHANGELOG entry: <link>.
- Notes: <only when something non-obvious — e.g. signing key change, failed-publish bump>.
```

### Admin-bypass entry template

```markdown
### Admin bypass commit `<sha7>` on `main`

- Reason: <why the PR process was skipped>.
- Risk + mitigation: <what could break, what to watch>.
```

This entry exists to keep the bypass transparent — a routine for emergency hotfixes only, never to avoid review.

## Step 3 — Forbidden in this log

Pulled from the global anti-pattern list and from the brasse-bouillon memory rule:

- **No AI / Claude / Codex / Copilot attribution** anywhere in the body.
- **No emojis** decorating headings or bullets.
- **No prose paragraphs** narrating the change — the PR description is the canonical narrative; the log just points at it.
- **No references to artefacts not findable in the repo** (no personal notes, scratch docs, agent memories).
- **No timestamped state assertions** that decay (*"open milestones as of YYYY-MM-DD"*) — that belongs in the PR or issue, not the log.
- **No retroactive deletion of past entries.** If an entry is wrong, add a follow-up entry that corrects it; the original stays as audit trail.

## Step 4 — Cadence

- Append the entry **before** running the post-merge cleanup (`git checkout main && git pull && git branch -d ...`) so the log update isn't postponed.
- If the PR itself didn't touch `PROJECT_LOG.md`, the entry goes into a small dedicated follow-up PR merged the same day. Per the global rule, these `PROJECT_LOG.md` conflicts are accepted as the cost of continuous-log discipline.
- Never batch a week of merges into one entry — every PR gets its own entry.

## Step 5 — Verify

After writing the entry, run a quick sanity scan:

```bash
# All merge SHAs in the log resolve to commits on main
grep -oE '\([0-9a-f]{7}\)' PROJECT_LOG.md | tr -d '()' | sort -u | while read -r sha; do
    git cat-file -e "$sha^{commit}" 2>/dev/null || echo "STALE: $sha"
done | head -20
```

A clean run prints nothing; any `STALE:` line points at an entry that references a SHA that no longer exists on `main` (likely a force-push or branch rewrite — investigate).

For broader retroactive audits (gaps, drift, orphans), see the audit procedure in the global skill [`project-log-discipline`](../../../skills/project-log-discipline/SKILL.md).
