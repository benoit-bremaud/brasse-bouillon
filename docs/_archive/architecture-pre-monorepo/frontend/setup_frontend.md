# 🎨 Configuration de l’Environnement Frontend - Brasse-Bouillon

## **1️⃣ Objectif**

Ce document explique comment **installer, configurer et exécuter l’application frontend mobile** de **Brasse-Bouillon** développée avec **React Native** via **Expo**.

📌 **Stack choisi :**

- **Langage** : JavaScript (ES6+)
- **Framework** : React Native
- **Environnement** : Expo (CLI)
- **Gestion d’état** : Redux Toolkit (prévu)
- **Navigation** : React Navigation

---

## **2️⃣ Prérequis Techniques**

| Outil             | Version conseillée       |
|------------------|---------------------------|
| Node.js          | >= 18.x                   |
| npm              | >= 9.x                    |
| Expo CLI         | >= 6.x (`npm install -g expo-cli`) |
| Android/iOS SDK  | Optionnel pour tests locaux |
| Expo Go (mobile) | Dernière version (App Store / Google Play) |

---

## **3️⃣ Installation du Projet**

```bash
# Cloner le dépôt
git clone https://github.com/benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon/frontend

# Installer les dépendances
npm install

# Lancer le projet Expo
npm start
```

Cela ouvre le **dashboard Expo** dans le navigateur :

- Scanner le QR code avec **Expo Go** pour voir l’app sur mobile
- Ou lancer dans un **émulateur Android/iOS**

---

## **4️⃣ Structure du Dossier Frontend**

```bash
frontend/
├── assets/               # Images, polices, icônes
├── components/           # Composants réutilisables
├── navigation/           # Stack de navigation React Navigation
├── screens/              # Pages (Login, Home, RecipeList...)
├── services/             # Appels API, gestion JWT
├── store/                # (à venir) Gestion d’état Redux Toolkit
├── App.js                # Point d’entrée principal
├── app.json              # Config Expo
├── .env.example          # Variables d’environnement frontend
└── package.json          # Dépendances React Native / Expo
```

---

## **5️⃣ Variables d’Environnement**

Les variables d’environnement permettent de centraliser la configuration (API, tokens, URLs, etc.) et de séparer les environnements (développement, staging, production).

### 📁 `.env.example`

Ce fichier sert de modèle. Copie-le pour créer un `.env` local.

### 🔧 Exemple de fichier `.env`

```bash
API_URL=http://localhost:3000
ENV=development
```

- `API_URL` : URL de base du backend pour les appels API (mettre l’URL du backend local ou déployé).
- `ENV` : Permet de distinguer les environnements (utile pour le logging, debug, etc.).

### 📦 Utilisation dans le code

Pour lire les variables :

```js
import Constants from 'expo-constants';
const API = Constants.expoConfig.extra.API_URL;
```

### 🛠️ Intégration avec Expo

Dans `app.config.js` ou `app.json` :

```js
import 'dotenv/config';

export default {
  expo: {
    name: "BrasseBouillon",
    slug: "brasse-bouillon",
    version: "1.0.0",
    extra: {
      API_URL: process.env.API_URL,
      ENV: process.env.ENV
    }
  }
}
```

> 📌 Expo injecte automatiquement `extra` dans `Constants.expoConfig.extra`

---

## **6️⃣ Linting et Formatage**

### 📌 Objectif

Le linting permet de garantir la **cohérence du code**, de prévenir les erreurs et d’améliorer la lisibilité. Le formatage automatique évite les conflits de style entre développeurs.

### 🛠️ Outils utilisés

- **ESLint** : vérifie la qualité du code selon des règles définies.
- **Prettier** : formate automatiquement le code source.
- **expo/prettier-config** : configuration recommandée par Expo.

### 📂 Fichiers de configuration recommandés

- `.eslintrc.js`

```js
module.exports = {
  root: true,
  extends: ["expo", "plugin:prettier/recommended"],
};
```

- `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all"
}
```

### ✅ Commandes utiles

#### 🔹 Vérifier les erreurs ESLint

```bash
npm run lint
```

> Vérifie tout le projet et signale les erreurs de style ou de code.

#### 🔹 Corriger automatiquement les erreurs

```bash
npm run lint -- --fix
```

#### 🔹 Exemple d'ajout dans `package.json`

```json
"scripts": {
  "lint": "eslint .",
  "lint:fix": "eslint . --fix"
}
```

### 📌 Astuce VS Code

Installe les extensions :

- **ESLint** (Dirige les erreurs dans l’éditeur)
- **Prettier** (Format automatique à l’enregistrement)

Active dans `settings.json` :

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode"
}
```

---

## **8️⃣ Bonnes pratiques**

- Isoler la logique d’appel API dans `services/`
- Stocker les tokens dans `SecureStore` ou `AsyncStorage`
- Documenter les composants et les props
- Garder les styles modulaires dans `styles/` ou `styled-components`

---

## **📌 Conclusion**

L’environnement frontend est basé sur **Expo + React Native** pour un développement rapide multiplateforme. La structure est modulaire, prête à accueillir la logique d’authentification, la navigation, et l’interaction avec l’API backend.

🚀 Prochaine étape : Prototyper les premières interfaces (login, dashboard, liste des recettes).
