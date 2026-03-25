# Definition of Ready (DoR) — Brasse-Bouillon

## What is the DoR?

The Definition of Ready defines when a User Story is ready to enter a Sprint Backlog.
A story that is not "Ready" cannot be selected during Sprint Planning.

## DoR Checklist

A User Story is "Ready" when:

- [ ] Written in standard format: "As a [persona], I want [action], so that [benefit]"
- [ ] Acceptance criteria clearly defined (testable, unambiguous)
- [ ] Estimated by the team (story points using Fibonacci: 1, 2, 3, 5, 8, 13)
- [ ] Small enough to complete within one sprint (max 8 story points)
- [ ] No unresolved dependencies or blockers
- [ ] Technical approach discussed and understood by the assigned developer
- [ ] Mockup or wireframe available (if UI-related)
- [ ] API contract defined (if involving frontend-backend integration)

## Estimation Scale (Fibonacci)

| Points | Complexity | Example |
|--------|-----------|---------|
| 1 | Trivial | Fix a typo, update a label |
| 2 | Simple | Add a new field to an existing form |
| 3 | Moderate | Create a new screen with existing patterns |
| 5 | Complex | Implement a calculator with business logic |
| 8 | Very complex | Full feature with API, domain, and UI layers |
| 13 | Epic-level | Should be split into smaller stories |

## Planning Poker Process

1. PO reads the User Story and acceptance criteria
2. Each developer privately selects a card (Fibonacci number)
3. All cards revealed simultaneously
4. If estimates differ by more than 2 levels, highest and lowest explain their reasoning
5. Re-vote until consensus (within 1 level of difference)
6. Final estimate recorded on GitHub issue as Story Points field
