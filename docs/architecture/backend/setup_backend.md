# ⚙️ Backend Environment Setup – Brasse-Bouillon

## 1. Purpose

This document explains how to install, configure, and run the **Brasse-Bouillon** backend environment, either locally or using Docker.

### 🔧 Tech Stack

- **Language**: JavaScript (Node.js)
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: MySQL
- **Environment Management**: dotenv
- **Containerization**: Docker + Docker Compose
- **Quality Tools**: ESLint, Prettier, Jest

---

## 2. Prerequisites

Make sure you have the following tools installed:

| Tool            | Recommended Version | Purpose                                          |
|----------------|----------------------|--------------------------------------------------|
| Node.js         | >= 18.x              | Run the backend application                     |
| npm             | >= 9.x               | Package manager                                 |
| Git             | >= 2.x               | Source control                                  |
| Docker          | >= 20.x              | Container platform                               |
| Docker Compose  | >= 2.x (plugin)      | Multi-container orchestration                    |

---

## 3. Project Installation

```bash
# Clone the project
git clone https://github.com/benoit-bremaud/brasse-bouillon.git
cd brasse-bouillon/backend

# Install dependencies
npm install

# Copy environment variables template
cp .env.example .env
```

### Example `.env` file:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=brasse_bouillon
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=supersecretkey
```

---

## 4. Running the Application

### Development mode

```bash
npm run dev
```

Runs with `nodemon` for auto-reload.

### Production mode

```bash
npm start
```

Runs with Node.js.

---

## 5. Backend Folder Structure

⚠️ This section has been removed to simplify documentation maintenance during development.  
The structure may evolve rapidly.

👉 Please refer directly to the repository tree on GitHub:  
<https://github.com/benoit-bremaud/brasse-bouillon/tree/main/backend>

---

## 6. Database Setup

### Local MySQL instance

```bash
sudo systemctl start mysql   # Linux
brew services start mysql    # macOS
```

Then import schema:

```bash
mysql -u root -p < ../docs/database/database_init.sql
```

### Dockerized MySQL (recommended)

```bash
npm run docker:start
```

This runs both backend and MySQL in containers.

💡 If port `3306` is already in use:

- Stop local MySQL service
- Or update port mapping in `docker-compose.yml`:

```yaml
  db:
    ports:
      - "3307:3306"
```

And in `.env`:

```env
DB_PORT=3307
```

---

## 7. Docker Environment Variables

Use `.env` to avoid hardcoding secrets:

```env
PORT=3000
DB_HOST=db
DB_PORT=3306
DB_NAME=brasse_bouillon
DB_USER=root
DB_PASSWORD=your_password
JWT_SECRET=supersecretkey
```

Update `docker-compose.yml`:

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

Run with Docker:

```bash
npm run docker:start
```

---

## 8. Available Scripts

```json
"scripts": {
  "dev": "nodemon src/app.js",
  "start": "node src/app.js",
  "lint": "eslint . --ext .js",
  "test": "jest",
  "docker:start": "docker compose up --build",
  "docker:stop": "docker compose down",
  "docker:test:db": "docker exec brasse-backend node scripts/test_db_connection.js"
}
```

---

## 9. Testing & Linting

### Linting

```bash
npm run lint
```

### Unit Tests

```bash
npm run test
```

### Test DB connection inside Docker

```bash
npm run docker:test:db
```

---

## 10. Health Check Endpoint

Test if backend is running:

```bash
GET http://localhost:3000/ping
```

Expected response:

```json
{ "message": "pong" }
```

---

## 11. Best Practices

- Never commit `.env` files
- Follow the route → controller → service → model architecture
- Use consistent code formatting with ESLint and Prettier
- Use Swagger or Markdown for documenting APIs
- Prefer Docker for consistency across environments

---
