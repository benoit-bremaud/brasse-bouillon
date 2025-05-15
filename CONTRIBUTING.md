# 🧭 Contributing to Brasse-Bouillon Website

Welcome, and thank you for your interest in improving Brasse-Bouillon!  
This document outlines the process and conventions for contributing to the **website** that supports the Brasse-Bouillon mobile application.

---

## 🧩 Git Workflow

We use a structured and minimal Git flow:

| Branch        | Purpose                              |
|---------------|--------------------------------------|
| `main`        | Production-ready code (deployed live)|
| `develop`     | Active integration and QA branch     |
| `feature/*`   | Short-lived branches for development |
| `docs/*`      | Documentation-only branches          |
| `bugfix/*`    | Targeted fixes for existing code     |

➡️ **Never commit directly to `main`**.  
➡️ All changes go through a Pull Request (PR) to `develop`.

---

## 🔠 Naming Conventions

| Type        | Pattern example                  |
|-------------|----------------------------------|
| Feature     | `feature/landing-hero-animation` |
| Documentation | `docs/contributing-guidelines` |
| Fix         | `bugfix/footer-overlap`          |

Use lowercase `kebab-case` (no accents, no spaces).

---

## ✍️ Commit Message Format

Follow the `conventional commits` style:

```bash
feat: add roadmap section to homepage
fix: correct padding on hero section
docs: add README and CONTRIBUTING files
