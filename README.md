# Brasse-Bouillon 🍺

Plateforme pour brasseurs amateurs – création, gestion et partage de recettes.

![CI/CD Status](https://github.com/benoit-bremaud/brasse-bouillon/actions/workflows/main.yml/badge.svg)

---

## 🚀 Pipeline CI/CD

Ce dépôt utilise GitHub Actions pour :

- Vérifier la qualité du code (`lint`)
- Exécuter des tests unitaires (`backend` + `frontend`)
- Effectuer un build automatique du backend
- Préparer un déploiement conditionnel (non activé pour le MVP)

---

## 📁 Structure du projet

```
brasse-bouillon/
├── backend/    # API Node.js / Express
├── frontend/   # Application mobile Expo (React Native)
├── .github/workflows/main.yml
├── README.md
```

---

## 🛆 Stack technique

- Node.js (Express)
- React Native (Expo)
- GitHub Actions
- ESLint + Jest
