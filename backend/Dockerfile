# Utilise une image Node officielle comme base
FROM node:20

# Dossier de travail dans le conteneur
WORKDIR /app

# Copie les fichiers nécessaires
COPY . .
RUN npm install

# Expose le port de l’application
EXPOSE 3000

# Démarre l’application
CMD ["npm", "run", "dev"]
