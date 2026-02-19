# Brasse-Bouillon Backend — Audit Technique

> **Date** : 2026-02-18  
> **Commit audité** : `ca90768` (PR #30 merged)  
> **Auditeur** : Cline AI (assistant)  
> **Périmètre** : Repo `benoit-bremaud/brasse-bouillon-backend`

---

## 1. Vue d'ensemble de l'architecture

### Stack technique
| Élément | Version / Choix |
|---|---|
| Runtime | Node.js 20 (`>=20 <21`) |
| Framework | NestJS 11 |
| Langage | TypeScript 5.7 (strict) |
| ORM | TypeORM 0.3 |
| DB (dev/test) | SQLite via `better-sqlite3` |
| DB (prod cible) | PostgreSQL (pas encore migrée) |
| Auth | JWT + Passport (`passport-jwt`) |
| Validation | `class-validator` + `class-transformer` |
| Documentation | Swagger/OpenAPI (`@nestjs/swagger`) |
| Conteneurisation | Docker multi-stage (node:20-bookworm-slim) |
| CI | GitHub Actions |
| CD | GHCR (GitHub Container Registry) |
| Qualité code | Lint + tests + security audit en CI (SonarCloud planifié) |

### Architecture par module
Le projet suit une **Clean Architecture** par module feature :

```
src/
  auth/          ← Auth JWT, guards, strategies, decorators
  user/          ← Utilisateurs, profil, rôles, seed dev
  equipment/     ← Profils d'équipement (CRUD owner-scoped)
  recipe/        ← Recettes + étapes (ingrédients à implémenter)
  batch/         ← Brassins, étapes, fermentation, rappels
  database/      ← Config TypeORM + migrations
  common/        ← Filtres, interceptors, DTOs communs, enums
  config/        ← auth.config.ts, database.config.ts
```

Chaque module respecte (en grande partie) la structure :
```
<module>/
  controllers/   ← HTTP thin controllers
  services/      ← Application services (use-case layer)
  dtos/          ← DTOs HTTP validés (class-validator)
  entities/      ← ORM entities (TypeORM, infrastructure)
  domain/
    entities/    ← Domain entities (pure TS, zéro dépendance)
    enums/       ← Domain enums
    services/    ← Domain services (logique métier pure)
```

---

## 2. État des modules

### 2.1 Auth (`/auth`)
| Endpoint | Statut |
|---|---|
| `POST /auth/register` | ✅ Opérationnel |
| `POST /auth/login` | ✅ Opérationnel |
| `GET /auth/me` | ✅ Opérationnel (JWT protégé) |

**Observations :**
- Validation email/password via `class-validator` ✅
- Pas de refresh token (out of scope MVP) ✅
- Pas de rate limiting sur login (risque brute-force — **TODO V1**) ⚠️
- Le champ `role` n'est pas inclus dans le JWT payload (seulement `sub: userId`). Le rôle est rechargé depuis la DB à chaque requête via `JwtStrategy.validate()` → OK mais N+1 potentiel.

### 2.2 Users (`/users`)
| Endpoint | Statut |
|---|---|
| `POST /users` (register) | ✅ Opérationnel |
| `GET /users/me` | ✅ Opérationnel |
| `PATCH /users/me` | ✅ Opérationnel |
| `POST /users/me/change-password` | ✅ Opérationnel |
| `GET /users/admin/list` | ✅ Admin only |
| `GET /users/:id` | ✅ Ownership enforced |
| `PUT /users/:id` | ✅ Ownership enforced |
| `DELETE /users/:id` | ✅ Ownership enforced |
| `POST /users/dev/seed-admin` | ✅ Gated (`SEED_ENDPOINTS_ENABLED`) |
| `POST /users/dev/seed-moderator` | ✅ Gated (`SEED_ENDPOINTS_ENABLED`) |

**Observations :**
- `console.log` présents dans le controller (logging non structuré) — acceptable en dev, mais à remplacer par `Logger` NestJS en prod ⚠️
- Le endpoint `GET /users/:id` autorise n'importe quel utilisateur authentifié à accéder au profil d'un autre user — le guard d'ownership est là mais le commentaire Swagger documente "Forbidden" alors que le code log juste un warning et autorise quand même (bug de doc mineur) ⚠️
  - **Correction** : si `currentUser.id !== id && currentUser.role !== ADMIN` → throw ForbiddenException est bien dans le code. Comportement correct, doc Swagger OK.
- `PUT /users/:id` vs `PATCH /users/me` : duplication fonctionnelle — les deux font la même chose. Peut être simplifié.

### 2.3 Equipment Profiles (`/equipment-profiles`)
| Endpoint | Statut |
|---|---|
| `POST /equipment-profiles` | ✅ Opérationnel |
| `GET /equipment-profiles` | ✅ Owner-scoped |
| `GET /equipment-profiles/:id` | ✅ Ownership enforced |
| `PATCH /equipment-profiles/:id` | ✅ Ownership enforced |
| `DELETE /equipment-profiles/:id` | ✅ Ownership enforced |

**Observations :**
- Validation domaine via `EquipmentProfileDomainService.createProfile()` à chaque create/update ✅
- Aucun test de controller (seulement `equipment-profile.domain.spec.ts`) ⚠️

### 2.4 Recipes (`/recipes`)
| Endpoint | Statut |
|---|---|
| `POST /recipes` | ✅ Opérationnel |
| `GET /recipes` | ✅ Owner-scoped |
| `GET /recipes/:id` | ✅ Ownership enforced |
| `PATCH /recipes/:id` | ✅ Ownership enforced |
| `DELETE /recipes/:id` | ✅ FK guard (bloque si batch actif) |
| `GET /recipes/:id/steps` | ✅ Lazy backfill des 5 étapes |
| `PATCH /recipes/:id/steps/:order` | ✅ Ownership enforced |

**Observations :**
- Les ingrédients (fermentables, hops, yeasts, water, additives) ne sont **pas encore implémentés** : pas de migration dédiée, pas d'ORM entities, pas d'API HTTP ❌
- `RecipeOrmEntity` n'a pas de `@OneToMany` vers des entités ingrédients ❌
- La suppression de recette est correctement protégée par un FK guard (erreur si batch référence la recette) ✅
- Aucun test de controller ⚠️

### 2.5 Batches (`/batches`)
| Endpoint | Statut |
|---|---|
| `POST /batches` | ✅ Start batch depuis une recette |
| `GET /batches` | ✅ Owner-scoped |
| `GET /batches/:id` | ✅ Ownership enforced |
| `POST /batches/:id/steps/current/complete` | ✅ State machine domaine |
| `POST /batches/:id/fermentation/start` | ✅ Opérationnel |
| `POST /batches/:id/fermentation/complete` | ✅ Opérationnel |
| `GET /batches/:id/reminders` | ✅ Ownership enforced |
| `POST /batches/:id/reminders` | ✅ Opérationnel |
| `PATCH /batches/:id/reminders/:reminderId` | ✅ Opérationnel |
| `DELETE /batches/:id` | ❌ **Absent** — pas d'endpoint de suppression |

**Observations :**
- La machine d'état du batch (domaine) est bien isolée et testée ✅
- `completeMineCurrentStep` utilise `stepRepo.save(stepPayloads)` sur **tous** les steps dans la transaction — les steps existants sont recréés (conflit de PK potentiel selon le driver). À surveiller. ⚠️
- Pas de DELETE batch ❌

---

## 3. Base de données et migrations

### Migrations en place
| Migration | Contenu |
|---|---|
| `1739439600000-InitialSchema` | Tables users, equipment_profiles, recipes, recipe_steps, batches, batch_steps, batch_reminders |

**Observations :**
- Les migrations utilisent `PRAGMA foreign_keys = OFF/ON` — correct pour SQLite ✅
- Les index sont bien nommés (`IDX_<table>_<colonne>`) dans `InitialSchema` ✅
- Les FK sont bien nommées (`FK_<table>_<colonne>`) dans `InitialSchema` ✅
- Aucune migration ingrédients/métriques n'est présente à ce stade ❌
- Les colonnes `updated_at` ne sont pas auto-mises à jour par trigger DB (uniquement via TypeORM `@UpdateDateColumn`) — acceptable ✅
- **Pas de migration PostgreSQL** — toujours sur SQLite ❌ (décision produit connue, à faire)

---

## 4. Tests

### Résultats actuels (2026-02-18)
```
Test Suites: 1 skipped, 10 passed, 10 of 11 total
Tests:       2 skipped, 54 passed, 56 total
```

### Couverture globale
| Métrique | Valeur |
|---|---|
| Statements | ~33% |
| Branches | ~31% |
| Functions | ~40% |
| Lines | ~32% |

### Fichiers de tests existants
| Fichier | Type | Couvre |
|---|---|---|
| `src/app.controller.spec.ts` | Unit | AppController (hello world) |
| `src/batch/batch.service.spec.ts` | Integration | BatchService complet (SQLite :memory:) |
| `src/batch/domain/batch.domain.spec.ts` | Unit | BatchDomainService |
| `src/equipment/domain/equipment-profile.domain.spec.ts` | Unit | EquipmentProfileDomainService |
| `src/recipe/recipe-steps.service.spec.ts` | Integration | RecipeService.ensureDefaultSteps |
| `src/recipe/domain/recipe-workflow.domain.spec.ts` | Unit | RecipeWorkflowService |
| `src/recipe/domain/recipe.domain.spec.ts` | Unit | RecipeDomainService |
| `src/user/controllers/user.controller.spec.ts` | Unit (mock) | UserController |
| `src/user/services/user.service.spec.ts` | Unit | UserService |
| `src/user/user.e2e-simple.spec.ts` | E2E | User endpoints |
| `src/user/user.e2e.spec.ts` | E2E | User endpoints (skipped) |
| `test/app.e2e-spec.ts` | E2E | App root |
| `test/auth.protected.e2e-spec.ts` | E2E | JWT auth guard |

### Lacunes de tests
- ❌ Aucun test pour `RecipeController`
- ❌ Aucun test pour `EquipmentProfileController` + `EquipmentProfileService`
- ❌ Aucun test pour `AuthController` / `AuthService` (hors JWT guard)
- ❌ Aucun test pour `BatchController`
- ❌ Aucun test pour le module `common/` (filtres, interceptors)

---

## 5. CI/CD

### Pipeline CI (`.github/workflows/ci.yml`)
| Job | Statut |
|---|---|
| Build + Lint + Test | ✅ Opérationnel |
| Security Audit (prod, critical only) | ✅ Opérationnel |

**Observation CI :**
- Aucune étape SonarCloud/SonarQube n'est actuellement configurée dans `ci.yml` ⚠️

### Pipeline CD (`.github/workflows/cd-docker.yml`)
| Job | Statut |
|---|---|
| Build + Push Docker → GHCR | ✅ Opérationnel (déclenché après CI sur main) |

### Copilot Review (`.github/workflows/copilot-review.yml`)
- Auto-review Copilot sur chaque PR ✅

---

## 6. Sécurité

### Authentification
- JWT HS256 avec secret obligatoire au démarrage (app plante si absent) ✅
- Expiration configurable via `JWT_EXPIRATION` (défaut `86400s`) ✅
- Pas de refresh token (out of scope MVP) — acceptable ✅
- bcrypt pour le hachage des mots de passe ✅

### Autorisations
- Ownership enforced via `owner_id = user.id` sur toutes les ressources ✅
- RolesGuard pour les routes admin ✅
- Seed endpoints gated par `SEED_ENDPOINTS_ENABLED` + `SEED_ENDPOINTS_TOKEN` optionnel ✅

### Dépendances
- `npm audit` critique : ✅ propre (tar override pour sqlite3 chain)
- Audit niveau `high` : peut contenir des vulnérabilités non critiques (politique documentée : CI gate sur `critical` uniquement)

### Expositions
- Swagger désactivé en prod sauf `SWAGGER_ENABLED=true` ✅
- Stack traces masquées en prod (`AllExceptionsFilter`) ✅
- Pas de rate limiting sur les endpoints auth ⚠️ (**risque brute-force — TODO**)
- `console.log` avec données utilisateur dans `UserController` ⚠️ (risque logs sensibles)

---

## 7. Docker

### Image
- Multi-stage build (build → runtime) ✅
- Base : `node:20-bookworm-slim` ✅
- User non-root (`USER node`) ✅
- HEALTHCHECK natif (fetch HTTP) ✅
- Volume `/app/data` pour SQLite ✅
- `NODE_ENV=production` par défaut ✅

### Observations
- Les migrations doivent être lancées manuellement via `TYPEORM_MIGRATIONS_RUN=true` au démarrage — OK ✅
- La migration vers PostgreSQL invalidera le volume SQLite — nécessite une stratégie de migration de données ⚠️

---

## 8. Priorités recommandées

### 🔴 Critique (bloquer MVP)
1. **Ingredients foundation + CRUD API** — Créer la migration DB, les ORM entities et l'API HTTP (controllers/services/DTOs) pour fermentables, hops, yeasts, water, additives sous `/recipes/:id/fermentables`, `/recipes/:id/hops`, etc.
2. **TypeORM relations** — Ajouter `@OneToMany` dans `RecipeOrmEntity` vers les entités ingrédients une fois ces entités créées.

### 🟠 Important (qualité et robustesse)
3. **Couverture tests** — Atteindre ≥60% (ajouter tests controllers recipe, equipment, batch + AuthService)
4. **SonarCloud** — Ajouter l'intégration CI (coverage upload + analyse) puis configurer le projet/secret `SONAR_TOKEN`
5. **Batch DELETE** — Ajouter `DELETE /batches/:id` (soft ou hard delete, scoped owner)
6. **Rate limiting** — Ajouter `@nestjs/throttler` sur les endpoints `/auth/login` et `/auth/register`

### 🟡 À planifier
7. **PostgreSQL migration** — Définir stratégie de migration SQLite → PostgreSQL
8. **Calculateurs ABV/IBU** — Module `calculator/` avec service Tinseth
9. **Swagger bearer alignment** — Remplacer `@ApiBearerAuth()` par `@ApiBearerAuth('JWT-auth')` dans batch et recipe controllers
10. **Logger structuré** — Remplacer `console.log` dans `UserController` par `Logger` NestJS

### 🟢 Post-MVP
11. Refresh tokens
12. Social login
13. Offline sync API
14. Rôles étendus (Mentor/Editor/Pro)

---

## 9. Métriques snapshot

| Métrique | Valeur | Objectif |
|---|---|---|
| Tests passants | 54/56 | 100% |
| Couverture statements | ~33% | ≥60% |
| Couverture branches | ~31% | ≥60% |
| Vulnérabilités critiques npm | 0 | 0 |
| Modules feature | 5 (auth, user, equipment, recipe, batch) | - |
| Endpoints HTTP | ~30 | - |
| Migrations | 1 | - |
| PR mergées | 30 | - |

---

*Prochain audit recommandé après implémentation de la fondation ingrédients (migration + ORM + API) et ajout de l'étape SonarCloud en CI.*
