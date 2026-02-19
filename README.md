# Brasse-Bouillon Backend

API NestJS pour l'application **Brasse-Bouillon** (assistant de brassage), avec authentification JWT, gestion des utilisateurs, profils d'équipement, recettes, lots de brassage, rappels de fermentation et agrégation de la qualité de l'eau via Hub'Eau.

## Fonctionnalités principales

- Authentification (`/auth`): login, register, profil courant
- Utilisateurs (`/users`): profil, changement de mot de passe, rôles
- Équipements (`/equipment-profiles`): CRUD par utilisateur
- Recettes (`/recipes`): CRUD + étapes de workflow
- Batches (`/batches`): démarrage de brassin, progression d'étapes, fermentation, rappels
- Eau (`/eau`): profil d'eau agrégé par commune/année via Hub'Eau
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
| `WATER_PROVIDER_DEFAULT` | Non | `hubeau` | Provider eau par défaut (`hubeau`) |
| `HUBEAU_BASE_URL` | Non | API Hub'Eau publique | URL de base du provider Hub'Eau |
| `HUBEAU_TIMEOUT_MS` | Non | `8000` | Timeout des appels HTTP Hub'Eau (ms) |
| `HUBEAU_CACHE_TTL_SECONDS` | Non | `3600` | TTL du cache mémoire des réponses eau |
| `HUBEAU_MAX_SAMPLES` | Non | `50` | Nombre max d'échantillons utilisés pour l'agrégation |
| `HUBEAU_COMMUNES_UDI_SIZE` | Non | `10` | Taille de page Hub'Eau pour la recherche de réseau (communes_udi) |
| `HUBEAU_RESULTATS_DIS_SIZE` | Non | `100` | Taille de page Hub'Eau pour les prélèvements (resultats_dis) |
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
  eau/          # Agrégation qualité de l'eau (Hub'Eau)
  database/     # Config TypeORM + migrations
  common/       # Filtres, interceptors, DTO communs
```

## Endpoint Eau (Hub'Eau)

Endpoint unique pour le frontend :

- **GET** `/eau`
- **Sécurité** : `Authorization: Bearer <jwt>` (guard JWT)
- **But** : récupérer un profil d'eau agrégé (réseau dominant, minéraux, dureté) pour une commune et une année.

Paramètres de query :

| Paramètre | Type | Obligatoire | Exemple | Description |
|---|---|---|---|---|
| `codeInsee` | `string` | ✅ | `44109` | Code INSEE commune (5 chiffres) |
| `annee` | `number` | ✅ | `2024` | Année des prélèvements (min 2000) |
| `provider` | `string` | Non | `hubeau` | Provider externe (par défaut: config serveur) |

Réponse 200 (extrait) :

```json
{
  "provider": "hubeau",
  "codeInsee": "44109",
  "annee": 2024,
  "nomReseau": "NANTES NORD",
  "nbPrelevements": 24,
  "conformite": "C",
  "minerauxMgL": {
    "ca": 80.3,
    "mg": 11.2,
    "cl": 22.1,
    "so4": 31.4,
    "hco3": 210.6
  },
  "dureteFrancais": 24.7
}
```

`conformite` peut valoir `C`, `N`, `D`, `S` ou `INCONNU`.

Codes d'erreur documentés : `400`, `401`, `404`, `502`.

## Roadmap

Voir [`ROADMAP.md`](./ROADMAP.md) pour la vision produit et les prochaines étapes.
