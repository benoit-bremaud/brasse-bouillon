# 🧭 Contribuer au website Brasse-Bouillon

Merci pour votre contribution.

Ce document décrit le workflow Git, les conventions de branches/commits et les règles de qualité applicables au site vitrine.

---

## 🌱 Branches et flux de travail

| Branche | Rôle |
|---|---|
| `main` | Production (déploiement GitHub Pages) |
| `develop` | Intégration continue |
| `feature/*` | Évolutions fonctionnelles |
| `docs/*` | Documentation et gouvernance |
| `bugfix/*` | Correctifs ciblés |

Règles :
1. Ne pas pousser directement sur `main`.
2. Ouvrir une PR vers `develop`.
3. Lier la PR à son issue (ex: `Refs #52`).
4. Attendre les checks CI verts avant merge.

---

## 🔠 Nommage des branches

Utiliser `kebab-case` sans accents :

- `feature/epic-c-website-ci-cd`
- `docs/epic-d-governance`
- `bugfix/fix-french-cta-spacing`

---

## ✍️ Convention de commits (Conventional Commits)

Format :

```text
type(scope): résumé impératif
```

Exemples :

- `feat(ci): add website pipeline with quality gates`
- `docs(governance): align readme and contribution guide`
- `fix(a11y): restore aria-current on language switch`

Types recommandés : `feat`, `fix`, `docs`, `chore`, `refactor`, `test`.

---

## ✅ Quality gates

La CI vérifie notamment :
- présence des fichiers critiques,
- structure HTML minimale FR/EN,
- absence de marqueurs de conflit.

Localement :

```bash
python3 scripts/quality_gate.py
python3 -m py_compile scripts/quality_gate.py
```

---

## 🧾 Bonnes pratiques PR

Chaque PR doit inclure :
- contexte,
- changements livrés,
- validations effectuées,
- impact,
- lien vers l’issue.

Garder un Markdown clair, lisible, orienté revue.
