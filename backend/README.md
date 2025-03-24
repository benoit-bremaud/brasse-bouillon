# 🍺 Backend - Brasse-Bouillon

Ce dossier contient le backend Node.js de l'application **Brasse-Bouillon**, conçue pour aider les brasseurs amateurs à gérer leurs recettes et sessions de brassage.

---

## 🚀 Stack Technique

- **Node.js** / **Express.js**
- **Sequelize** (ORM)
- **MySQL** (via Docker)
- **Docker & Docker Compose**
- **ESLint / Prettier**
- **dotenv**

---

## 📁 Structure du projet

```
backend/
├── src/
│   ├── app.js              # Point d’entrée de l'application
│   ├── config/             # Config DB, JWT, etc.
│   ├── controllers/        # Logique métier
│   ├── routes/             # Endpoints API
│   ├── models/             # Modèles Sequelize
│   ├── services/           # Méthodes métier (ex : calcul ABV, IBU)
│   └── middleware/         # Auth, erreurs...
├── Dockerfile
├── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

---

## ▶️ Démarrage rapide

### 🔧 En local

```bash
npm install
cp .env.example .env
npm run dev
```

Accès au test : [http://localhost:3000/ping](http://localhost:3000/ping)

### 🐳 Avec Docker

```bash
npm run docker:start
```

Arrêt :

```bash
npm run docker:stop
```

---

## ⚙️ Scripts disponibles

```bash
npm run dev           # Lancer en mode dev avec nodemon
npm start             # Lancer en mode production
npm run lint          # Lancer ESLint
npm run docker:start  # Lancer les conteneurs Docker
npm run docker:stop   # Arrêter les conteneurs Docker
```

---

## 📄 Documentation complète

Voir le fichier [`setup_backend.md`](./setup_backend.md)

---

## 📌 Auteur

Projet développé par **Benoît Brémaud** dans le cadre du Bachelor Développeur Web - La Plateforme

