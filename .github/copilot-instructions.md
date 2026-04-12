# Copilot Code Review Instructions — Brasse-Bouillon

## Project context

npm workspaces monorepo with 4 packages:

- `packages/mobile-app` — React Native + Expo SDK 54 + TypeScript (strict)
- `packages/api` — NestJS 11 + TypeORM + SQLite + TypeScript
- `packages/website` — Static HTML/CSS/JS + Python scripts
- `packages/beer-encyclopedia` — Python 3.12 + FastAPI + YOLOv8 + EasyOCR + PostgreSQL

## TypeScript rules (mobile-app + api)

- **Never allow `any`** — flag every occurrence, no exceptions
- **Named exports only** — no default exports for screens, use-cases, or API modules
- `interface` for object shapes; `type` for unions, mapped types, utility types
- No inline style objects in mobile-app — must use `StyleSheet.create()`
- No hardcoded colors, spacing, or font values in mobile-app — must use theme tokens
- No direct `fetch()` calls outside `packages/mobile-app/src/core/http/http-client.ts`

## Python rules (beer-encyclopedia)

- Type hints required on all function signatures and return types
- Pydantic models for all request/response boundaries (no raw dicts)
- No `typing.Any` without justification
- No hardcoded file paths — use relative paths or env vars
- Must pass `ruff check` (config in `packages/beer-encyclopedia/ruff.toml`)

## Security — always flag

- Command injection, XSS, SQL injection
- Hardcoded secrets, API keys, or tokens
- `.env` files or credentials in committed code
- Unsafe deserialization or unvalidated user input

## Testing

- Every new feature must have tests
- Coverage target: 70% minimum per package
- Flag untested public functions or API endpoints

## Code quality

- Flag dead code, unused imports, unreachable branches
- Flag overly complex functions (cyclomatic complexity)
- Flag missing error handling at system boundaries (user input, external APIs)
- Do NOT flag missing error handling for internal code paths

## What NOT to flag

- Brewing domain terminology in English (IBU, ABV, wort, mash, etc.)
- `from __future__ import annotations` in Python files (required for type union syntax)
- `File(...)` as default argument in FastAPI endpoints (intentional pattern, B008 ignored)
- Files in `_archive/` directory — read-only historical reference, do not review
