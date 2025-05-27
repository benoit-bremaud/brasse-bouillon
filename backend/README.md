# Backend – Brasse-Bouillon

This directory contains the Node.js backend of the **Brasse-Bouillon** application. It is designed to help homebrewers manage brewing recipes and sessions efficiently through a robust RESTful API.

---

## 🚀 Technology Stack

* **Node.js** / **Express.js** – Application framework
* **Sequelize** – Object-Relational Mapping (ORM)
* **MySQL** – Relational database (via Docker)
* **Docker & Docker Compose** – Containerization
* **ESLint / Prettier** – Code quality and formatting
* **dotenv** – Environment variable management

---

## 🧰 Prerequisites

Ensure the following tools are installed on your system:

* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* [Docker](https://www.docker.com/products/docker-desktop/)
* [Docker Compose](https://docs.docker.com/compose/install/)

---

## ▶️ Getting Started

### Local Development

```bash
npm install
cp .env.example .env
npm run dev
```

Access the test route:
[http://localhost:3000/ping](http://localhost:3000/ping)

### Using Docker

Start the containers:

```bash
npm run docker:start
```

Stop the containers:

```bash
npm run docker:stop
```

---

## ⚙️ Available Scripts

### Development

```bash
npm run dev           # Start in development mode with nodemon
npm start             # Start in production mode
npm run lint          # Run ESLint
npm test              # Run Jest test suite
```

### Docker

```bash
npm run docker:start       # Launch Docker containers
npm run docker:stop        # Stop Docker containers
npm run docker:test:db     # Test DB connection inside Docker
```

---

## 📚 Documentation

* [`setup_backend.md`](../docs/architecture/backend/setup_backend.md): Full backend setup instructions.
* [`migrations-sequelize.md`](../docs/project-management/migrations-sequelize.md): Guide for managing Sequelize migrations in a Dockerized environment.

---

## 👤 Maintainer

This backend service is developed and maintained by **Benoît Brémaud** as part of the *Bachelor Web Developer* program at **La Plateforme**.
