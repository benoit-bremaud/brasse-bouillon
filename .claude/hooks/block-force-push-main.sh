#!/usr/bin/env bash
# PreToolUse hook for Bash.
# Blocks any `git push --force` (or `--force-with-lease`) targeted at the
# `main` or `master` branch — destructive on shared history.
#
# Silent (empty output) for any other Bash command.

set -euo pipefail

# Silent no-op if jq is unavailable — the hook cannot parse the payload.
# Without this guard, `set -euo pipefail` would abort the script with a
# command-not-found error instead of leaving the user's command unaffected.
command -v jq >/dev/null 2>&1 || exit 0

cmd=$(jq -r '.tool_input.command // empty')

if [ -z "$cmd" ]; then
    exit 0
fi

# Three independent checks, order-independent on the command line:
#   1. command contains `git push`
#   2. command contains `--force`, `--force-with-lease`, OR `-f` shorthand
#      (with word boundaries to avoid matching `-fast`, `--force-foo`, etc.)
#   3. command targets `main` or `master` — either standalone OR as the
#      remote ref in a colon refspec (`HEAD:main`, `:main`, `branch:main`)
#      or fully-qualified (`refs/heads/main`). The leading-class includes
#      `:` and `/`, the trailing-class still anchors on space-or-EOL so
#      `feature/main-thing` does NOT trigger.
if echo "$cmd" | grep -qE 'git[[:space:]]+push' \
    && echo "$cmd" | grep -qE -- '(^|[[:space:]])(-f|--force|--force-with-lease)([[:space:]]|=|$)' \
    && echo "$cmd" | grep -qE '(^|[[:space:]/:])(main|master)([[:space:]]|$)'; then
    printf '%s\n' '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":"Force-pushing to main/master is forbidden by .claude/hooks/block-force-push-main.sh. If you really need to do this, run the command yourself in the terminal."}}'
fi
