# 🚀 CI/CD - Intégration et Déploiement Continu - Brasse-Bouillon

## **1️⃣ Objectif du pipeline CI/CD**

L’objectif du pipeline CI/CD est de **garantir une qualité constante du code** et de **déployer automatiquement les modifications validées** dans des environnements sécurisés.

📌 Ce pipeline est basé sur **GitHub Actions** et s’exécute à chaque `push` ou `pull request` sur les branches `main` et `develop`.

---

## **2️⃣ Fonctionnement Général du Pipeline**

Chaque cycle de CI/CD suit ces étapes :

1. **Checkout du code**
2. **Installation des dépendances** (`npm install`)
3. **Linting du code** (`npm run lint`)
4. **Tests unitaires** (`npm run test`)
5. **Build si besoin** (frontend ou backend)
6. **Déploiement en staging ou production** (en option)

---

## **3️⃣ Exemple de workflow GitHub Actions**

📄 **Fichier :** `.github/workflows/main.yml`

```yaml
name: Brasse-Bouillon CI/CD

on:
  push:
    branches:
      - main
      - develop
  pull_request:
    branches:
      - main
      - develop

jobs:
  install-and-test:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout du code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Installer les dépendances
        run: npm install

      - name: Linter le code
        run: npm run lint

      - name: Exécuter les tests
        run: npm run test

  # Déploiement optionnel (à adapter selon l’infra)
  # deploy:
  #   needs: install-and-test
  #   runs-on: ubuntu-latest
  #   steps:
  #     - name: Déploiement automatique (staging)
  #       run: echo "🚀 Déploiement sur staging à implémenter"
```

---

## **4️⃣ Variables et Secrets GitHub**

### 🔐 Pour les actions sensibles :
- `DB_PASSWORD`
- `JWT_SECRET`
- `API_TOKEN_DEPLOY`

📌 Ces secrets sont ajoutés via **GitHub > Settings > Secrets and variables > Actions**.

---

## **5️⃣ Bonnes pratiques CI/CD**

✅ **Isoler chaque étape** (install, lint, test, build) pour faciliter le debug.  
✅ Utiliser des **fichiers `.nvmrc` ou `engines` dans `package.json`** pour fixer les versions.  
✅ **Cacher le cache npm** pour accélérer les jobs :
```yaml
- uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```
✅ Toujours tester le pipeline en local avec `act` (facultatif).

---

## **6️⃣ Environnements & Déploiement**

| Environnement | Description | Déploiement |
|---------------|-------------|-------------|
| **Local**     | Dev local avec Expo ou Node | `npm start` ou `nodemon` |
| **Staging**   | Plateforme de préprod (Docker ou Railway) | CI/CD en Pull Request |
| **Production**| Version stable déployée (à venir) | GitHub Action + webhook |

---

## **📌 Conclusion**

Le pipeline CI/CD de Brasse-Bouillon automatise l’intégration continue et prépare les bases pour un déploiement sans friction. Il garantit que chaque modification est **testée, formatée et prête pour production**.

🚀 Prochaine étape : configurer un déploiement automatique vers un hébergement (Railway, Render, EC2, etc.)

