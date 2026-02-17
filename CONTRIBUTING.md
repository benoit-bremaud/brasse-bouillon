# 🧭 Contributing to the Brasse-Bouillon Website

Thank you for your contribution.

This document describes the Git workflow, branch/commit conventions, and quality rules for the public website.

---

## 🌱 Branches and workflow

| Branch | Role |
|---|---|
| `main` | Production (GitHub Pages deployment) |
| `develop` | Continuous integration |
| `feature/*` | Feature work |
| `docs/*` | Documentation and governance |
| `bugfix/*` | Targeted fixes |

Rules:
1. Do not push directly to `main`.
2. Open a PR to `develop`.
3. Link the PR to its issue (example: `Refs #52`).
4. Wait for green CI checks before merge.

---

## 🔠 Branch naming

Use `kebab-case`:

- `feature/epic-c-website-ci-cd`
- `docs/epic-d-governance`
- `bugfix/fix-french-cta-spacing`

---

## ✍️ Commit convention (Conventional Commits)

Format:

```text
type(scope): imperative summary
```

Examples:

- `feat(ci): add website pipeline with quality gates`
- `docs(governance): align readme and contribution guide`
- `fix(a11y): restore aria-current on language switch`

Recommended types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

---

## ✅ Quality gates

CI checks include:
- critical files presence,
- minimal FR/EN HTML structure,
- no conflict markers.

Local commands:

```bash
python3 scripts/quality_gate.py
python3 -m py_compile scripts/quality_gate.py
```

---

## 🧾 PR best practices

Each PR should include:
- context,
- delivered changes,
- validations performed,
- impact,
- linked issue.

Keep Markdown clear, readable, and review-oriented.
