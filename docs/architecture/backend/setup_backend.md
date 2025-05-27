# ⚙️ Configuration de l’Environnement Backend - Brasse-Bouillon

## **1️⃣ Objectif**

Ce document décrit les étapes pour **installer, configurer et lancer l’environnement backend** du projet **Brasse-Bouillon** en local ou via Docker.

📌 **Stack choisi :**

- **Langage** : JavaScript (Node.js)
- **Framework** : Express.js
- **ORM** : Sequelize
- **Base de données** : MySQL (via `database_init.sql`)
- **Gestion des environnements** : dotenv
- **Conteneurisation** : Docker + Docker Compose
- **Contrôle qualité** : ESLint + Prettier

---

## **2️⃣ Prérequis Techniques**

Avant de commencer, assure-toi d’avoir les outils suivants installés sur ta machine :

| Outil             | Version conseillée | Rôle                                                                 |
|-------------------|---------------------|----------------------------------------------------------------------|
| Node.js           | >= 18.x             | Exécution du backend JavaScript                                     |
| npm               | >= 9.x              | Gestionnaire de paquets Node.js                                     |
| MySQL Server      | >= 8.x              | Base de données relationnelle utilisée par Sequelize                |
| Git               | >= 2.x              | Clonage et gestion du code source                                   |
| Docker            | >= 20.x             | Conteneurisation de l’app et de la base de données                  |
| Docker Compose    | >= 2.x (plugin)     | Orchestration des conteneurs Docker (via `docker compose`)         |

⚠️ **À noter** :

- Le dossier `backend/` n’inclut pas encore de fichier `package.json` après le clonage. Tu dois donc l’initialiser manuellement :

```bash
cd backend
npm init -y
```

- Ensuite, installe les dépendances nécessaires :

```bash
npm install express sequelize mysql2 dotenv jsonwebtoken bcryptjs
npm install --save-dev nodemon eslint prettier
```

- Pense à ajouter les scripts suivants dans ton `package.json` :

```json
"scripts": {
  "dev": "nodemon src/app.js",
  "start": "node src/app.js",
  "lint": "eslint . --ext .js",
  "docker:start": "docker compose up --build",
  "docker:stop": "docker compose down"
}
```

---

## **3️⃣ Installation du Projet**

```bash
# Cloner le projet
git clone https://github.com/benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon/backend

# Initialiser npm (si non fait)
npm init -y

# Installer les dépendances (si non fait)
npm install

# Copier les variables d’environnement
cp .env.example .env
```

📌 **Extrait d’un fichier `.env` typique :**

```text
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=brasse_bouillon
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=supersecretkey
```

---

## **4️⃣ Démarrage de l’Application**

### 🔹 Mode développement

```bash
npm run dev
```

> Utilise `nodemon` pour le rechargement automatique.

### 🔹 Mode production

```bash
npm start
```

> Lance le serveur Node.js en mode normal.

---

## **5️⃣ Structure du Dossier Backend**

To be updated

---

## **6️⃣ Lancer la Base de Données**

### 🔹 En local (MySQL installé sur l’hôte)

```bash
sudo systemctl start mysql   # Linux
brew services start mysql    # macOS
```

Puis importe la structure :

```bash
mysql -u root -p < ../docs/database/database_init.sql
```

### 🔹 Environnement Docker (recommandé)

```bash
docker compose up --build
```

> Cela lance à la fois **le backend Express** et la **base MySQL** dans des conteneurs isolés.

💡 **Astuce : port déjà utilisé ?**
Si tu as une instance MySQL déjà active sur ton système (hors Docker), elle peut bloquer l'utilisation du port `3306`.

#### Deux solutions

**1. Arrêter MySQL localement avant de lancer Docker :**

```bash
sudo systemctl stop mysql
```

**2. Modifier le port exposé dans `docker-compose.yml` :**

```yaml
  db:
    ports:
      - "3307:3306"
```

Et dans `.env` :

```env
DB_PORT=3307
```

## 🔐 Utiliser un fichier `.env` avec Docker Compose

Pour éviter d’écrire les variables d’environnement directement dans le fichier `docker-compose.yml`, il est recommandé d’utiliser la directive `env_file:`.

Cela permet de :

- Centraliser les variables sensibles ou modifiables dans un fichier `.env`
- Réutiliser ce fichier aussi bien pour `docker compose` que pour l’environnement Node.js local
- Alléger le `docker-compose.yml`

### ✅ Étapes

1. Crée un fichier `.env` dans le dossier `backend/` avec le contenu suivant :

```env
PORT=3000
DB_HOST=db
DB_PORT=3306
DB_NAME=brasse_bouillon
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=supersecretkey
```

2. Dans `docker-compose.yml`, remplace le bloc `environment:` par :

```yaml
services:
  backend:
    build: .
    container_name: brasse-backend
    ports:
      - "${PORT:-3000}:3000"
    env_file:
      - .env
    volumes:
      - .:/app
    depends_on:
      - db
```

> 📌 Note : `DB_HOST=db` permet au backend de communiquer avec le conteneur `db` (MySQL).

3. **Lancer le projet avec Docker :**

```bash
npm run docker:start
```

### ⚠️ Important

- Le fichier `.env` doit se trouver dans le même dossier que le `docker-compose.yml` (ici `backend/`)
- Le conteneur MySQL ne lit pas le même fichier `.env` que le backend (ses variables sont définies dans `environment:`)

### 💡 Astuce professionnelle (optionnel)

Plus tard, tu pourras créer des fichiers `.env.dev`, `.env.prod`, `.env.test` pour gérer différents environnements. Mais pour ton MVP, un seul `.env` suffit largement.

---

## 🛠️ Bonnes pratiques Docker (build)

Dans un `Dockerfile`, il est courant de voir cette séquence :

```dockerfile
COPY package*.json ./
RUN npm install
COPY . .
```

Cela permet de bénéficier du **cache Docker** pour `npm install`, en ne le relançant que si les dépendances ont changé.

Mais si tu veux garder une version **plus simple** pendant la phase MVP, tu peux utiliser :

```dockerfile
COPY . .
RUN npm install
```

C’est plus lisible, mais chaque modification de code relancera l’installation des dépendances.

Tu pourras toujours revenir à la version optimisée plus tard.

---

## **7️⃣ Premier Endpoint de Test**

Un premier endpoint de test est accessible à l'adresse suivante :

```bash
GET http://localhost:3000/ping
```

### Réponse attendue

```json
{
  "message": "pong"
}
```

📌 Ce endpoint est défini directement dans `src/app.js` pour tester rapidement que le backend fonctionne correctement.

Exemple minimal :

```js
const express = require('express');
const app = express();

app.get('/ping', (req, res) => {
  res.status(200).json({ message: 'pong' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
```

---

## **8️⃣ Tests et Linting**

### 🔹 Linting (ESLint + Prettier)

```bash
npm run lint
```

### 🔹 Tests unitaires (à venir)

```bash
npm run test
```

---

## **9️⃣ Bonnes pratiques**

- Respecter l’architecture en couches : routes → controller → services → models
- Garder les fichiers `.env` hors du dépôt Git
- Documenter les endpoints dans Swagger ou `api_endpoints.md`
- Utiliser des scripts `npm` pour lancer les conteneurs et vérifier l’état

---

## 🔁 Commandes Docker pratiques

Ajoute ces scripts dans ton `package.json` pour plus de confort :

```json
"scripts": {
  "docker:start": "docker compose up --build",
  "docker:stop": "docker compose down"
}
```

### 🔹 Lancer l’ensemble du backend + DB

```bash
npm run docker:start
```

### 🔹 Stopper tous les services

```bash
npm run docker:stop
```

---

## **📌 Conclusion**

Cette configuration te permet de démarrer rapidement un backend Node.js/Express robuste, connecté à une base de données MySQL, avec ou sans Docker. Elle intègre une structure modulaire, des outils de qualité logicielle et un endpoint de test pour vérification initiale.

🚀 Prochaine étape : Implémenter les vrais endpoints (`auth`, `recipes`, `users`).
