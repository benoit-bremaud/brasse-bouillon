# Brasse-Bouillon backend guidelines (NestJS + Clean Architecture)

- Follow Clean Architecture: domain must not depend on NestJS, ORM, or frameworks.
- Keep changes small and testable. Prefer small PRs.
- Write code comments and docstrings in English.
- Use TypeScript strict typing; avoid `any`.
- Validate with unit tests for domain/application; integration tests for infra.
- Keep controllers thin; business rules live in domain/application.

## PR review governance (mandatory)

- After each PR update, verify required checks are green before proposing merge.
- Read and handle all Copilot comments/threads.
- Classify each suggestion explicitly:
  - `MUST_HAVE`: security, functional bug, data integrity, API/contract regression, architecture-rule violation, failing tests/build/lint.
  - `SHOULD_HAVE`: important but non-blocking improvement.
  - `NICE_TO_HAVE`: non-urgent maintainability/convenience improvement.
  - `REJECT`: not relevant in current context.
- Implement only relevant `MUST_HAVE` suggestions directly in the PR.
- For each `SHOULD_HAVE`/`NICE_TO_HAVE`, ask the user one-by-one whether to create a backlog issue.
- If accepted, create issue title with Angular/Conventional format: `type(scope): description`.
- Always post a response with decision + short rationale on each Copilot comment, then close the related conversation immediately.
