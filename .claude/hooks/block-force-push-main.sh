#!/usr/bin/env bash
# PreToolUse hook for Bash.
# Blocks any `git push --force` (or `--force-with-lease`) targeted at the
# `main` or `master` branch — destructive on shared history.
#
# Silent (empty output) for any other Bash command.

set -euo pipefail

cmd=$(jq -r '.tool_input.command // empty')

if [ -z "$cmd" ]; then
    exit 0
fi

# Three independent checks, order-independent on the command line:
#   1. command contains `git push`
#   2. command contains `--force` (also matches `--force-with-lease`)
#   3. command targets `main` or `master` (as a standalone word)
if echo "$cmd" | grep -qE 'git[[:space:]]+push' \
    && echo "$cmd" | grep -qE -- '--force' \
    && echo "$cmd" | grep -qE '(^|[[:space:]])(main|master)([[:space:]]|$)'; then
    printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Force-pushing to main/master is forbidden by .claude/hooks/block-force-push-main.sh. If you really need to do this, run the command yourself in the terminal."}}'
fi
