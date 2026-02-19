# Brasse-Bouillon Backend

API NestJS pour l'application **Brasse-Bouillon** (assistant de brassage), avec authentification JWT, gestion des utilisateurs, profils d'équipement, recettes, lots de brassage et rappels de fermentation.

## Fonctionnalités principales

- Authentification (`/auth`): login, register, profil courant
- Utilisateurs (`/users`): profil, changement de mot de passe, rôles
- Équipements (`/equipment-profiles`): CRUD par utilisateur
- Recettes (`/recipes`): CRUD + étapes de workflow
- Batches (`/batches`): démarrage de brassin, progression d'étapes, fermentation, rappels
- Documentation Swagger (activée hors prod, ou via variable dédiée)

## Stack technique

- **Node.js 20** + **NestJS 11**
- **TypeScript**
- **TypeORM**
- **SQLite (better-sqlite3)** par défaut
- **JWT / Passport** pour la sécurité
- **Docker** (image multi-stage)

## Prérequis

- Node.js `>=20 <21`
- npm
- Docker (si exécution conteneurisée)

## Variables d'environnement

Variables importantes utilisées par l'API :

| Variable | Obligatoire | Défaut | Description |
|---|---|---|---|
| `JWT_SECRET` | ✅ Oui | - | Secret de signature JWT (obligatoire au démarrage) |
| `JWT_EXPIRATION` | Non | `86400s` | Durée de validité des tokens |
| `PORT` | Non | `3000` | Port HTTP de l'API |
| `NODE_ENV` | Non | `development` (local) / `production` (Docker) | Environnement d'exécution |
| `DATABASE_PATH` | Non | `./data/brasse-bouillon.db` (selon cwd) | Chemin de la base SQLite |
| `TYPEORM_MIGRATIONS_RUN` | Non | `false` | Exécuter les migrations au démarrage |
| `TYPEORM_SYNCHRONIZE` | Non | `false` | Synchronisation auto du schéma (à éviter en prod) |
| `TYPEORM_LOGGING` | Non | auto selon env | Niveau de logs TypeORM |
| `SWAGGER_ENABLED` | Non | auto selon env | Force l'activation Swagger (`true`/`false`) |
| `SEED_ENDPOINTS_ENABLED` | Non | `false` | Active les endpoints de seed dev |
| `SEED_ENDPOINTS_TOKEN` | Non | vide | Token optionnel pour protéger les endpoints de seed |

## Lancer le projet en local (sans Docker)

1. Installer les dépendances :

```bash
npm ci
```

2. Créer un fichier `.env.local` (exemple minimal) :

```env
JWT_SECRET=change-me-in-local
JWT_EXPIRATION=86400s
PORT=3000
DATABASE_PATH=./data/brasse-bouillon.db
TYPEORM_MIGRATIONS_RUN=true
TYPEORM_SYNCHRONIZE=false
SWAGGER_ENABLED=true
```

3. Démarrer en mode dev :

```bash
npm run start:dev
```

4. Vérifier :

- API: `http://localhost:3000/`
- Swagger UI: `http://localhost:3000/api`

## Lancer le serveur avec Docker

### 1) Build de l'image

```bash
docker build -t brasse-bouillon-backend:local .
```

### 2) Run du conteneur

```bash
docker run --rm \
  --name brasse-bouillon-api \
  -p 3000:3000 \
  -e JWT_SECRET=change-me-in-prod \
  -e JWT_EXPIRATION=86400s \
  -e TYPEORM_MIGRATIONS_RUN=true \
  -e SWAGGER_ENABLED=true \
  -v brasse-bouillon-data:/app/data \
  brasse-bouillon-backend:local
```

### Notes Docker importantes

- `JWT_SECRET` est **obligatoire**, sinon l'app ne démarre pas.
- Le volume `brasse-bouillon-data` persiste la base SQLite (`/app/data`).
- En image Docker, `NODE_ENV=production` par défaut (défini dans le `Dockerfile`).
- Swagger est désactivé en production sauf si `SWAGGER_ENABLED=true`.

## Commandes utiles

```bash
# Build TypeScript
npm run build

# Lint
npm run lint:check

# Tests unitaires
npm run test

# Tests e2e
npm run test:e2e

# Migrations
npm run migration:run
npm run migration:revert
```

## Structure du projet (vue rapide)

```text
src/
  auth/         # Auth JWT, guards, stratégies
  user/         # Utilisateurs, profil, rôles
  equipment/    # Profils d'équipement
  recipe/       # Recettes et étapes
  batch/        # Batches, fermentation, reminders
  database/     # Config TypeORM + migrations
  common/       # Filtres, interceptors, DTO communs
```

## Roadmap

Voir [`ROADMAP.md`](./ROADMAP.md) pour la vision produit et les prochaines étapes.
