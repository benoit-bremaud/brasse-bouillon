#!/usr/bin/env bash
# PreToolUse hook for Write|Edit|MultiEdit.
# Blocks writes to paths that must never be modified by Claude:
#   - any `.env` / `.env.*` file (secrets)
#   - anything under a `node_modules/` directory (generated)
#   - anything under `_archive/` (read-only reference snapshot)
#
# Receives the standard Claude Code hook payload on stdin and prints a JSON
# response that asks Claude Code to deny the tool call when the path matches.
# Silent (empty output) when the path is allowed.

set -euo pipefail

file=$(jq -r '.tool_input.file_path // empty')

if [ -z "$file" ]; then
    exit 0
fi

if [[ "$file" =~ (^|/)\.env(\.[^/]+)?$ ]] \
    || [[ "$file" =~ /node_modules/ ]] \
    || [[ "$file" =~ (^|/)_archive/ ]]; then
    printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Path forbidden by .claude/hooks/block-forbidden-paths.sh — .env files (secrets) must never be written by Claude, node_modules/ is generated, _archive/ is read-only."}}'
fi
