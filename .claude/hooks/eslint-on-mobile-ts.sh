#!/usr/bin/env bash
# PostToolUse hook for Write|Edit|MultiEdit.
# When the just-modified file is a TypeScript source under
# packages/mobile-app/, run `eslint --fix --max-warnings 0` from the package
# root so the package-local config and plugin resolution apply.
#
# Uses `npx --no-install` so it only runs if `node_modules/.bin/eslint`
# already exists (no implicit network install).

set -euo pipefail

file=$(jq -r '.tool_response.filePath // .tool_input.file_path // empty')

if [ -z "$file" ]; then
    exit 0
fi

if ! [[ "$file" =~ packages/mobile-app/.*\.(ts|tsx)$ ]]; then
    exit 0
fi

if [ ! -d "packages/mobile-app/node_modules" ]; then
    exit 0
fi

(cd packages/mobile-app && npx --no-install eslint --fix --max-warnings 0 "$file" >/dev/null 2>&1) || true
