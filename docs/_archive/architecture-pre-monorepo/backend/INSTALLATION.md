# 🛠️ **Guide d’Installation du Backend - Brasse-Bouillon**  

Ce document explique **comment installer, configurer et exécuter** le backend **Brasse-Bouillon** en local et en production, avec et sans Docker.  

📌 **Modes d’installation disponibles :**  
✅ **Installation Manuelle** (Node.js + PostgreSQL + Redis).  
✅ **Installation avec Docker** (Back-end, PostgreSQL, Redis, MQTT conteneurisés).  

---

## **📌 1️⃣ Prérequis**

📌 **Avant d’installer le backend, assurez-vous d’avoir les éléments suivants :**  

✅ **Node.js & NPM** (si installation manuelle)  
✅ **Docker et Docker Compose** (si installation avec conteneurs)  
✅ **PostgreSQL / MySQL**  
✅ **Redis (optionnel mais recommandé)**  

📌 **Vérifier l’installation de Docker :**  

```bash
docker -v
docker-compose -v
```

---

## **📌 2️⃣ Clonage du Projet**

📌 **Cloner le dépôt GitHub du backend :**  

```bash
git clone https://github.com/votre-repo/brasse-bouillon-backend.git
cd brasse-bouillon-backend
```

---

## **📌 3️⃣ Installation avec Docker (Recommandé)**

📌 **Créer un fichier `docker-compose.yml`** à la racine du projet :  

```yaml
version: '3.8'

services:
  backend:
    build: .
    container_name: brasse-bouillon-backend
    ports:
      - "3000:3000"
    env_file:
      - .env
    depends_on:
      - database
      - redis
      - mqtt_broker

  database:
    image: postgres:latest
    container_name: brasse-bouillon-db
    environment:
      POSTGRES_USER: brasseur
      POSTGRES_PASSWORD: motdepasse
      POSTGRES_DB: brasse_bouillon
    ports:
      - "5432:5432"
    volumes:
      - db_data:/var/lib/postgresql/data

  redis:
    image: redis:latest
    container_name: brasse-bouillon-cache
    ports:
      - "6379:6379"

  mqtt_broker:
    image: eclipse-mosquitto:latest
    container_name: brasse-bouillon-mqtt
    ports:
      - "1883:1883"
      - "9001:9001"
    volumes:
      - ./mosquitto.conf:/mosquitto/config/mosquitto.conf

volumes:
  db_data:
```

📌 **Créer un `Dockerfile` pour le backend** :  

```dockerfile
# Utilisation de l'image Node.js officielle
FROM node:16

# Définition du répertoire de travail
WORKDIR /app

# Copie des fichiers
COPY package.json package-lock.json ./
RUN npm install

COPY . .

# Exposition du port de l'API
EXPOSE 3000

# Démarrage de l'application
CMD ["npm", "start"]
```

📌 **Lancer le backend avec Docker Compose :**  

```bash
docker-compose up --build -d
```

✅ **Les services suivants sont maintenant actifs :**  

- **Backend API** (`http://localhost:3000`)  
- **PostgreSQL** (`localhost:5432`)  
- **Redis** (`localhost:6379`)  
- **MQTT Broker** (`localhost:1883`)  

📌 **Vérifier l’état des conteneurs :**  

```bash
docker ps
```

📌 **Afficher les logs :**  

```bash
docker logs brasse-bouillon-backend
```

📌 **Arrêter et supprimer les conteneurs :**  

```bash
docker-compose down
```

---

## **📌 4️⃣ Installation Manuelle (Sans Docker)**

📌 **Installer les dépendances :**  

```bash
npm install
```

📌 **Créer la base de données :**  

```bash
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all  # Optionnel
```

📌 **Lancer le serveur backend :**  

```bash
npm run dev
```

✅ **Le backend est maintenant accessible à** `http://localhost:3000`  

---

## **📌 5️⃣ Vérification et Tests**

📌 **Tester un endpoint :**  

```bash
curl -X GET http://localhost:3000/recipes
```

📌 **Tester la connexion Redis :**  

```bash
redis-cli
ping
```

📌 **Tester les capteurs IoT avec MQTT :**  

```bash
mosquitto_pub -h localhost -t "brasse-bouillon/sensors" -m '{"temperature":22.5}'
```

✅ **L’API est maintenant opérationnelle avec Docker ou en installation classique !** 🎉  
