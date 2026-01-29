# Brasse-Bouillon backend guidelines (NestJS + Clean Architecture)

- Follow Clean Architecture: domain must not depend on NestJS, ORM, or frameworks.
- Keep changes small and testable. Prefer small PRs.
- Write code comments and docstrings in English.
- Use TypeScript strict typing; avoid `any`.
- Validate with unit tests for domain/application; integration tests for infra.
- Keep controllers thin; business rules live in domain/application.
