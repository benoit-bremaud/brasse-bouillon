#!/usr/bin/env bash
# PostToolUse hook for Write|Edit|MultiEdit.
# When the just-modified file is a Python source file, auto-fix and format it
# with Ruff using the `[tool.ruff]` config pinned in
# packages/beer-encyclopedia/pyproject.toml.
#
# Resolution order for the `ruff` binary:
#   1. packages/beer-encyclopedia/.venv/bin/ruff (project venv)
#   2. `ruff` from $PATH
# If neither exists, the hook is a no-op (silent) — IDE diagnostics still warn.

set -euo pipefail

# Silent no-op if jq is unavailable — the hook cannot parse the payload.
# Without this guard, `set -euo pipefail` would abort the script with a
# command-not-found error instead of letting the original Write/Edit proceed.
command -v jq >/dev/null 2>&1 || exit 0

file=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')

if [ -z "$file" ]; then
    exit 0
fi

if ! [[ "$file" =~ \.py$ ]]; then
    exit 0
fi

# Find ruff.
RUFF=""
if [ -x "./packages/beer-encyclopedia/.venv/bin/ruff" ]; then
    RUFF="./packages/beer-encyclopedia/.venv/bin/ruff"
elif command -v ruff >/dev/null 2>&1; then
    RUFF="ruff"
else
    exit 0
fi

# Best-effort auto-fix and format. Output is silenced AND the exit code is
# ignored via `|| true` — the hook is fire-and-forget on purpose so it never
# blocks the user's Edit/Write tool call. Real lint/format problems are
# surfaced by the IDE's Ruff extension (and by `ruff check` in CI), not by
# this hook. To investigate a specific file by hand, run the same two
# commands without the silencer:  ruff check --fix <file> && ruff format <file>
"$RUFF" check --fix "$file" >/dev/null 2>&1 || true
"$RUFF" format "$file" >/dev/null 2>&1 || true
