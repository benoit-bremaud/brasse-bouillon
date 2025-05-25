# 📚 Project Conventions – Brasse-Bouillon

This document defines the naming conventions and project standards applied throughout the Brasse-Bouillon ecosystem. It is designed to ensure consistency, maintainability, and ease of collaboration across all sub-projects.

> Brasse-Bouillon is an open-source project that helps amateur brewers manage recipes and share brewing knowledge. It includes multiple sub-projects: mobile app, backend API, design system, and CI/CD pipelines.

---

## 📁 1. File and Folder Naming

* Use lowercase letters and dashes (`-`) as separators.
* Folder names should be meaningful and scoped (e.g. `api/`, `docs/design/`, `src/components/`).
* Files should use the kebab-case convention (e.g. `user-profile.js`, `create-recipe-form.tsx`).
* Keep documentation files in `docs/`, categorized by topic.
* Use English language for all files and avoid unclear abbreviations.

---

## 🔧 2. Branch Naming (Git)

Use the following pattern:

```bash
<type>/<scope>-<short-description>
```

**Examples**:

* `feat/frontend-add-login-screen`
* `fix/backend-auth-token-refresh`
* `chore/devops-update-dockerfile`

**Types**: `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`

**Scope examples**: `frontend`, `backend`, `charte`, `devops`, `infra`

---

## ✍️ 3. Commit Messages (Angular Style)

Follow the [Angular Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) style:

```bash
type(scope): short description
```

**Examples**:

* `feat(auth): implement JWT middleware`
* `fix(db): correct foreign key constraints`

> Use imperative mood (e.g. "add", not "added") and keep under 72 characters.

---

## 🚧 4. GitHub Project Naming

All GitHub Projects are named with the format:

```
brasse-bouillon · <Project Scope>
```

**Examples**:

* `brasse-bouillon · Charte Graphique`
* `brasse-bouillon · Backend`
* `brasse-bouillon · Frontend`
* `brasse-bouillon · Roadmap Dynamique`

> The dot separator (`·`) is stylistic for clarity. Scope should reflect the main domain (use PascalCase or descriptive nouns).

---

## 🧩 5. Milestone Naming

Each milestone is prefixed by its project scope for clarity:

| Prefix | Project Scope           | Example                          |
| ------ | ----------------------- | -------------------------------- |
| `P`    | Main project            | `P3 – Développement`             |
| `CG`   | Design charter          | `CG1 – Moodboard & logo`         |
| `BE`   | Backend                 | `BE2 – API Security & Auth`      |
| `FE`   | Frontend                | `FE1 – UI Layout & Navigation`   |
| `DO`   | DevOps / Infrastructure | `DO1 – Docker config & CI setup` |
| `COM`  | Communication           | `COM1 – Launch visuals & assets` |

> Each milestone must include a concise summary and due date (when applicable). Distinguish between short-term and long-term milestones.

---

## 🏷️ 6. GitHub Labels

Use clear labels with a consistent style:

* Priority: `priority:high`, `priority:medium`, `priority:low`
* Status: `status:planned`, `status:in-progress`, `status:done`
* Type: `type:bug`, `type:feature`, `type:refactor`, `type:task`, `type:docs`
* Scope: `scope:backend`, `scope:frontend`, `scope:charte`, `scope:devops`, `scope:infra`, `scope:website`
* UX/UI: `ux`, `design`, `a11y`

---

## 📣 7. Naming Rules for Issues

Issues should be titled using the Angular-style convention:

```
type(scope): short but meaningful description
```

**Examples**:

* `feat(frontend): add recipe editor component`
* `docs(charte): update color palette in design guide`

> Use English and include sub-tags if necessary for clarity.

---

## 📦 8. Pull Request Conventions

Each pull request must follow this checklist:

**Title format**:

```
type(scope): concise and meaningful title
```

**PR Description must include**:

* A short summary of the change
* A checklist of completed items (if needed)
* Reference to related issues (e.g. `Closes #42`)
* Screenshots or video (for UI-related changes)
* Indication of breaking changes (if any)

**Examples**:

```
feat(api): add endpoint to update recipes
Closes #52
```

**Checklist Template**:

* [x] Code is linted and tested
* [x] Documentation is updated
* [x] No breaking changes introduced

> We recommend using a GitHub PR template. If unavailable, include this checklist manually.

---

## 📃 9. File Naming for Documentation

* Design documentation: `docs/design/<file>.md`
* Planning & roadmap: `docs/roadmap.md`
* General conventions: `docs/CONVENTIONS.md`
* Backend specs: `docs/backend/<file>.md`
* Frontend UI rules: `docs/frontend/<file>.md`

> Avoid abbreviations. Write filenames in English with clear purpose.

---

## ✅ 10. References

* Angular Commit Style: [https://www.conventionalcommits.org/en/v1.0.0/](https://www.conventionalcommits.org/en/v1.0.0/)
* GitHub Docs: [https://docs.github.com/en/issues/planning-and-tracking-with-projects](https://docs.github.com/en/issues/planning-and-tracking-with-projects)
* Markdown Naming & Folder Best Practices

---

> This file must be updated in sync with project evolution. Any deviation should be justified and documented.
