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

# Run check --fix then format. Suppress output so the hook stays invisible on
# success; failures show up in /hooks if anyone investigates.
"$RUFF" check --fix "$file" >/dev/null 2>&1 || true
"$RUFF" format "$file" >/dev/null 2>&1 || true
