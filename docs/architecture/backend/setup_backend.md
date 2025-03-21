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

Avant de commencer, assure-toi d’avoir installé :

| Outil         | Version conseillée |
|---------------|---------------------|
| Node.js       | >= 18.x             |
| npm           | >= 9.x              |
| MySQL Server  | >= 8.x              |
| Git           | >= 2.x              |
| Docker        | >= 20.x             |
| Docker Compose| >= 1.29             |

---

## **3️⃣ Installation du Projet**

```bash
# Cloner le projet
git clone https://github.com/benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon/backend

# Initialiser npm
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

```bash
backend/
├── src/
│   ├── config/           # Fichiers de config (DB, JWT...)
│   ├── controllers/      # Logique métier (recettes, users...)
│   ├── models/           # Définition des modèles Sequelize
│   ├── routes/           # Déclarations des endpoints API
│   ├── services/         # Logique métier entre contrôleurs et modèles
│   ├── middleware/       # Auth, erreurs, logger...
│   └── app.js            # Point d’entrée de l’app Express
├── docker-compose.yml    # Conteneurisation backend + DB
├── Dockerfile            # Image Node.js personnalisée
├── .env.example          # Variables d’environnement
├── package.json          # Dépendances npm
└── README.md             # Documentation locale
```

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
docker-compose up --build
```

> Cela lance à la fois **le backend Express** et la **base MySQL** dans des conteneurs isolés.

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

📌 Vérifie dans `src/routes/ping.routes.js` ou similaire.

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

## **📌 Conclusion**

Cette configuration te permet de démarrer rapidement un backend Node.js/Express robuste, connecté à une base de données MySQL, avec ou sans Docker. Elle intègre une structure modulaire, des outils de qualité logicielle et un endpoint de test pour vérification initiale.

🚀 Prochaine étape : Implémenter les vrais endpoints (`auth`, `recipes`, `users`).
