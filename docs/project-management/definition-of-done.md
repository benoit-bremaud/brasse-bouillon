# Definition of Done (DoD) — Brasse-Bouillon

## What is the DoD?

The Definition of Done is a shared agreement that guarantees transparency and quality.
Every team member knows exactly what "Done" means. A User Story is only considered
complete when ALL criteria below are met.

## DoD Checklist

### For every User Story

- [ ] Code compiles without errors
  - Frontend: `tsc --noEmit` passes
  - Backend: `npm run build` passes
- [ ] All existing tests still pass (`npm test`)
- [ ] New tests written for new logic (unit tests for use-cases, integration tests for screens)
- [ ] CI passes (`npm run ci:check` — lint + typecheck + format)
- [ ] Code reviewed via Pull Request (at least 1 reviewer)
- [ ] No `any` TypeScript type introduced
- [ ] No hardcoded values (colors, spacing, fonts — use design tokens)
- [ ] No inline styles (use `StyleSheet.create()`)
- [ ] Branch merged to `main`
- [ ] Related GitHub issue closed with `Closes #xx` in PR

### For a Sprint Increment

- [ ] All committed User Stories meet the DoD above
- [ ] App runs without crashes on the happy path
- [ ] Sprint Review demo successful
- [ ] Sprint Retrospective completed with action items documented

## Why the DoD Matters

Without a DoD:
- Team members have different definitions of "finished"
- Bugs accumulate as technical debt
- Sprint velocity is unreliable (partially done items inflate estimates)

With a DoD:
- Quality is consistent and predictable
- The increment is potentially shippable after every sprint
- Stakeholders can trust the progress reports
