# Brasse-Bouillon Website

Site vitrine officiel du projet **Brasse-Bouillon**.

Ce repository contient une landing page statique bilingue (FR/EN) et sa chaîne CI/CD (quality gates + déploiement GitHub Pages).

---

## 🎯 Objectif

Le site présente :
- la proposition de valeur du projet,
- la roadmap publique,
- les entrées de contact (questionnaire + email).

Il est maintenu avec une logique **build in public** et un backlog simplifié par epics.

---

## 🌐 Production

- Domaine : [https://brasse-bouillon.com](https://brasse-bouillon.com)
- Déploiement : GitHub Pages (branche `main`)

---

## 📁 Structure actuelle

- `index.html` : page FR
- `index-en.html` : page EN
- `favicon.ico`, `logo.png`, `logo-removebg-preview.png`, `CNAME` : assets statiques
- `docs/ROADMAP.md` : feuille de route produit
- `docs/GOVERNANCE.md` : conventions backlog, runbook et gouvernance repo
- `.github/workflows/website-ci-cd.yml` : pipeline CI/CD
- `scripts/quality_gate.py` : quality gate local/CI sans dépendance
- `CONTRIBUTING.md` : conventions de contribution

---

## ⚙️ CI/CD (Epic C)

Workflow : `.github/workflows/website-ci-cd.yml`

### Quality gates

Exécutés sur `push` (`develop`, `main`) et `pull_request` (`develop`, `main`) :
- présence des fichiers critiques,
- structure HTML minimale FR/EN,
- absence de marqueurs de conflit Git.

### Déploiement

Le job de déploiement GitHub Pages s’exécute uniquement sur :
- `push` vers `main`.

---

## 🧪 Vérifications locales

```bash
python3 scripts/quality_gate.py
python3 -m py_compile scripts/quality_gate.py
```

---

## 🔀 Workflow Git

- `main` : production
- `develop` : intégration
- `feature/*`, `docs/*`, `bugfix/*` : branches de travail

Toutes les contributions passent par PR vers `develop` (sauf exception explicitement décidée).

---

## 🗺️ Références

- Roadmap : [docs/ROADMAP.md](./docs/ROADMAP.md)
- Contribution : [CONTRIBUTING.md](./CONTRIBUTING.md)
- Gouvernance : [docs/GOVERNANCE.md](./docs/GOVERNANCE.md)
