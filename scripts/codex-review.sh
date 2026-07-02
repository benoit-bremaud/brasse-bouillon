#!/usr/bin/env bash
#
# codex-review.sh — local, read-only Codex (GPT) review of the current branch.
#
# Part of the brasse-bouillon defence-in-depth review pipeline. This is the
# "Codex side" of the pre-push ritual driven by the `pre-push-review` skill
# (.claude/skills/pre-push-review/SKILL.md): Claude reviews via the
# `pr-pre-reviewer` agent + /code-review, Codex reviews here, and the two
# reports are reconciled before any push.
#
# It wraps `codex exec review`, which reviews the diff against a base branch
# without mutating the working tree. It replays the same checklist as the
# `pr-pre-reviewer` agent so both reviewers judge against the same rules.
#
# Cost note: each run consumes the OpenAI/ChatGPT quota tied to your Codex
# CLI auth — a quota SEPARATE from GitHub Copilot premium requests.
#
# Usage:
#   scripts/codex-review.sh                 # review HEAD vs main, print report
#   scripts/codex-review.sh --base develop  # review against another base
#   scripts/codex-review.sh --out report.md # also save the report to a file
#
# Requirements: codex CLI on PATH (`codex --version`), run from inside the repo.

set -euo pipefail

BASE="main"
OUT=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --base)
      BASE="${2:?--base requires a branch name}"
      shift 2
      ;;
    --out)
      OUT="${2:?--out requires a file path}"
      shift 2
      ;;
    -h|--help)
      sed -n '2,30p' "$0"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      exit 2
      ;;
  esac
done

if ! command -v codex >/dev/null 2>&1; then
  echo "error: codex CLI not found on PATH. Install it or check your asdf/node setup." >&2
  exit 127
fi

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "error: not inside a git repository." >&2
  exit 1
fi

CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [[ "$CURRENT_BRANCH" == "$BASE" ]]; then
  echo "error: current branch is '$BASE'; nothing to review against itself." >&2
  exit 1
fi

# Keep the comparison honest against the latest remote base (read-only fetch).
git fetch origin "$BASE" --quiet 2>/dev/null || true

# The review instructions mirror the pr-pre-reviewer checklist so Claude and
# Codex grade against the same bar. Keep this in sync with
# .claude/agents/pr-pre-reviewer.md.
read -r -d '' INSTRUCTIONS <<'PROMPT' || true
You are a strict, read-only reviewer for the brasse-bouillon monorepo.
Review ONLY the diff against the base branch. Output English. AI attribution
(Co-Authored-By, "Generated with") is allowed, not mandatory — never flag it.

Group findings as Must Have / Should Have / Nice to Have / Disagree, each with
a `path/to/file.ts:line` anchor and a one-line suggested fix.

Must Have (blocking) — flag any of:
- `any` TypeScript type introduced anywhere.
- Default export for a screen, use-case, controller, service, module, or DTO.
- Direct `fetch()` outside packages/mobile-app/src/core/http/http-client.ts.
- Raw SQL string outside repository / query-builder methods in packages/api.
- Hardcoded secret, token, or credential.
- Hardcoded color/spacing/font in packages/mobile-app (must use theme tokens).
- Inline `style={{...}}` in React Native (must use StyleSheet.create()).
- Inline `style="..."` in packages/website/ HTML.
- Bypass of the NestJS response envelope in packages/api.
- Skipped or `xit`/`xdescribe` tests introduced.
- Missing TypeORM migration when an entity adds/removes/renames a column.
- Direct commit to `__BASE__` detectable in the commit history.
- ADR violations (read docs/architecture/decisions/0001..0005 and 0013): e.g.
  mobile calling a third-party HTTP service directly instead of via the API
  (ADR-0002), or consent-store writes outside the canonical append-only
  feature-namespaced API (ADR-0003).

Should Have — tests not following Happy/Sad/Edge, a new mobile feature not
persisting via the API from day one, missing Swagger decorator on a new
endpoint, naming/import-order deviations, Conventional Commits not respected,
a packages/website/ public page edited on one language side only (missing
French/English mirror), no PROJECT_LOG.md entry drafted for a significant
change.

Nice to Have — readability, extraction, WHY-not-WHAT comments.

Disagree — anything that looks off but is justified by a tolerated ADR-0001
exception or an established pattern; give a one-line rationale.

End with a Summary: ADRs honoured (y/n), forbidden patterns present (y/n),
H/S/E covered for new units (y/n), branch from __BASE__ + Conventional Commits
(y/n), Ready for push (y/n).
PROMPT

# The heredoc is quoted so its backticks stay literal; inject the runtime base.
INSTRUCTIONS="${INSTRUCTIONS//__BASE__/$BASE}"

echo "Running Codex review of '$CURRENT_BRANCH' against '$BASE'..." >&2

if [[ -n "$OUT" ]]; then
  codex exec review --base "$BASE" --output-last-message "$OUT" "$INSTRUCTIONS"
  echo "Report written to: $OUT" >&2
  cat "$OUT"
else
  codex exec review --base "$BASE" "$INSTRUCTIONS"
fi
