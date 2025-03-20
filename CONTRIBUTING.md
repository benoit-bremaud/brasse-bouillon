# Guide de Contribution - Brasse-Bouillon

## 1. Introduction

Bienvenue dans **Brasse-Bouillon** ! 🎉 Ce document explique **comment configurer l’environnement de développement** et **contribuer efficacement** au projet. Nous suivons une méthodologie collaborative avec des bonnes pratiques pour garantir un code de qualité et une expérience fluide pour tous les contributeurs.

---

## 2. Configuration de l’Environnement

### 🔹 **Prérequis**

Avant de commencer, assure-toi d’avoir installé :

- **Git** (`>= 2.30`)
- **Node.js** (`>= 18.x`) et **npm** (`>= 9.x`)
- **Docker** (optionnel, pour l’environnement de test)
- **MySQL** (`>= 8.x`) pour la base de données

### 🔹 **Installation du projet**

1️⃣ **Cloner le dépôt :**

```sh
git clone https://github.com/benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon
```

2️⃣ **Installer les dépendances :**

```sh
npm install
```

3️⃣ **Configurer l’environnement :**

- Copier le fichier d’exemple `.env.example` en `.env` :

```sh
cp .env.example .env
```

- Modifier les variables selon ta configuration locale.

4️⃣ **Lancer l’application en mode développement :**

```sh
npm run dev
```

---

## 3. Workflow de Contribution

### 🔹 **Convention de Nommage des Branches**

Les branches doivent être nommées de manière claire selon le type de travail effectué :

```
feature/nom-fonctionnalité  → Pour une nouvelle fonctionnalité
fix/nom-correction         → Pour une correction de bug
refactor/nom-refactoring   → Pour une amélioration du code sans modification fonctionnelle
hotfix/nom-correction      → Pour une correction urgente en production
```

Exemple :

```sh
git checkout -b feature/ajout-authentification
```

### 🔹 **Structure des Branches**

Le projet suit un modèle de branches inspiré de **Git Flow** :

```
main       → Branche stable et prête pour la production

develop    → Branche principale pour le développement

feature/*  → Branches pour le développement de nouvelles fonctionnalités
fix/*      → Branches pour les corrections de bugs
release/*  → Branches de préparation avant un déploiement
hotfix/*   → Branches pour les corrections urgentes sur `main`
```

### 🔹 **Convention de Nommage des Commits**

Respecte la structure suivante pour chaque commit :

```
[Type] (Scope) : Message court et explicite

Description plus détaillée (si nécessaire)
```

📌 **Types de commits acceptés :**

- **feat** : Ajout d'une nouvelle fonctionnalité
- **fix** : Correction d'un bug
- **docs** : Modification de la documentation
- **style** : Modification du format ou du style (indentation, espaces…)
- **refactor** : Refactoring du code sans modification fonctionnelle
- **test** : Ajout/modification de tests
- **chore** : Mise à jour des dépendances, configuration

Exemple de commit valide :

```sh
git commit -m "feat(auth): Implémentation de l'authentification JWT"
```

### 🔹 **Créer une Pull Request (PR)**

1️⃣ **Vérifier son code avant de pousser :**

```sh
git push origin feature/ajout-authentification
```

2️⃣ **Créer une PR sur GitHub en respectant ces consignes :**

- La PR doit être assignée à un reviewer.
- Ajouter une description claire des changements apportés.
- Lier la PR à une issue si applicable.

Exemple de titre de PR :

```
[Feature] Ajout de l'authentification JWT
```

---

## 4. Règles de Code et Style

📌 **Standards suivis :**

- **ESLint + Prettier** pour le formatage automatique.
- Respect des **principes SOLID** et d’une **architecture modulaire**.
- Documentation des fonctions et API avec **JSDoc**.

---

## 5. Tests et CI/CD

📌 **Avant de soumettre une PR, vérifie que :**

- Les **tests unitaires passent** (`npm test`).
- Le code respecte les **règles de linting** (`npm run lint`).
- La **pipeline CI/CD** s’exécute sans erreur sur GitHub Actions.

---

## 6. Bonnes Pratiques de Développement

📌 **À respecter pour maintenir un projet propre et scalable :**

- Écrire du code **lisible et documenté**.
- **Éviter les commits volumineux**, privilégier des modifications **petites et cohérentes**.
- Ne pas pousser directement sur `main` ou `develop`, toujours passer par une **PR**.
- Tester **localement** avant d’ouvrir une PR.

---

## 7. Communication et Support

📢 **Besoin d’aide ?**

- **Ouvre une issue GitHub** en cas de bug ou de question.
- **Rejoins notre canal Slack/Discord** pour discuter avec l’équipe.

📌 **Merci pour ta contribution ! 🚀**
