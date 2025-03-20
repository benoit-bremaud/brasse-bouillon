# 📡 **Documentation des Endpoints API - Brasse-Bouillon**

## **1️⃣ Introduction**

Ce document regroupe et structure les **endpoints principaux** de l’API REST de **Brasse-Bouillon**. Il fournit des informations sur l’**authentification**, la **gestion des recettes**, les **sessions de brassage**, et d’autres fonctionnalités essentielles du projet.

📌 **Documents de référence :**

- `api_interactions.md` → Vue globale des interactions API.
- `authentication_methods.md` → Authentification et gestion des accès.
- `database_schema.md` → Modèle relationnel des données.
- `swagger.json` → Spécification OpenAPI des endpoints.

---

## **2️⃣ Vue d’Ensemble des Endpoints API**

| **Fonctionnalité** | **Description** | **Endpoints** |
|---------------|------------|-----------|
| **Authentification** | Gestion des utilisateurs et de l'accès sécurisé | `POST /auth/login`, `POST /auth/register`, `POST /auth/logout`, `GET /auth/me` |
| **Gestion des Recettes** | CRUD des recettes | `GET /recipes`, `POST /recipes`, `PUT /recipes/{id}`, `DELETE /recipes/{id}` |
| **Gestion des Sessions de Brassage** | Suivi des sessions et journalisation | `GET /sessions`, `POST /sessions`, `PUT /sessions/{id}`, `DELETE /sessions/{id}` |
| **Gestion des Ingrédients** | Ajout et suivi des ingrédients | `GET /ingredients`, `POST /ingredients`, `PUT /ingredients/{id}`, `DELETE /ingredients/{id}` |
| **Commentaires et Notations** | Feedback des utilisateurs sur les recettes | `GET /comments/{recipe_id}`, `POST /comments`, `DELETE /comments/{id}` |
| **Notifications** | Envoi de rappels et d'alertes aux utilisateurs | `GET /notifications`, `POST /notifications`, `DELETE /notifications/{id}` |

---
## **3️⃣ Détails des Endpoints**

### **🔹 3.1 Authentification**

📌 **Objectif** : Gérer l’accès des utilisateurs à l’application.

| **Méthode** | **Endpoint** | **Description** | **Auth Requise** |
|------------|-------------|----------------|----------------|
| `POST` | `/auth/login` | Authentification et obtention d’un token JWT | ❌ Non |
| `POST` | `/auth/register` | Création d’un nouvel utilisateur | ❌ Non |
| `POST` | `/auth/logout` | Déconnexion et invalidation du token JWT | ✅ Oui |
| `GET` | `/auth/me` | Vérification du token et récupération des infos utilisateur | ✅ Oui |

### **🔹 3.2 Gestion des Recettes**

📌 **Objectif** : Permettre aux utilisateurs de gérer leurs recettes.

| **Méthode** | **Endpoint** | **Description** | **Auth Requise** |
|------------|-------------|----------------|----------------|
| `GET` | `/recipes` | Récupération de toutes les recettes | ❌ Non |
| `POST` | `/recipes` | Création d’une nouvelle recette | ✅ Oui |
| `PUT` | `/recipes/{id}` | Mise à jour d’une recette existante | ✅ Oui |
| `DELETE` | `/recipes/{id}` | Suppression d’une recette | ✅ Oui |

### **🔹 3.3 Gestion des Sessions de Brassage**

📌 **Objectif** : Suivi des sessions de brassage.

| **Méthode** | **Endpoint** | **Description** | **Auth Requise** |
|------------|-------------|----------------|----------------|
| `GET` | `/sessions` | Récupération de toutes les sessions | ✅ Oui |
| `POST` | `/sessions` | Création d’une nouvelle session | ✅ Oui |
| `PUT` | `/sessions/{id}` | Mise à jour d’une session existante | ✅ Oui |
| `DELETE` | `/sessions/{id}` | Suppression d’une session | ✅ Oui |

### **🔹 3.4 Gestion des Ingrédients**

📌 **Objectif** : Gérer les ingrédients des recettes.

| **Méthode** | **Endpoint** | **Description** | **Auth Requise** |
|------------|-------------|----------------|----------------|
| `GET` | `/ingredients` | Récupération de tous les ingrédients | ❌ Non |
| `POST` | `/ingredients` | Ajout d’un ingrédient | ✅ Oui |
| `PUT` | `/ingredients/{id}` | Mise à jour d’un ingrédient | ✅ Oui |
| `DELETE` | `/ingredients/{id}` | Suppression d’un ingrédient | ✅ Oui |

### **🔹 3.5 Gestion des Commentaires et Notations**

📌 **Objectif** : Permettre l’interaction entre utilisateurs.

| **Méthode** | **Endpoint** | **Description** | **Auth Requise** |
|------------|-------------|----------------|----------------|
| `GET` | `/comments/{recipe_id}` | Récupérer les commentaires d’une recette | ❌ Non |
| `POST` | `/comments` | Ajouter un commentaire | ✅ Oui |
| `DELETE` | `/comments/{id}` | Supprimer un commentaire | ✅ Oui |

### **🔹 3.6 Gestion des Notifications**

📌 **Objectif** : Envoyer des rappels et alertes aux utilisateurs.

| **Méthode** | **Endpoint** | **Description** | **Auth Requise** |
|------------|-------------|----------------|----------------|
| `GET` | `/notifications` | Récupérer les notifications | ✅ Oui |
| `POST` | `/notifications` | Créer une notification | ✅ Oui |
| `DELETE` | `/notifications/{id}` | Supprimer une notification | ✅ Oui |


---

## **4️⃣ Exemples de Requêtes et Réponses JSON**

### **🔹 Exemples d’authentification**

#### **📌 Requête (POST /auth/login)**

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### **📌 Réponse (200 - Succès)**

```json
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "user@example.com",
    "role": "brasseur"
  }
}
```

📌 **D’autres exemples sont disponibles dans `swagger.json`.**

---

## **5️⃣ Conclusion**

📌 Ce document fournit une vue structurée des **endpoints de l’API Brasse-Bouillon**. Pour une version interactive, utilisez **Swagger UI** avec `swagger.json`.

📢 **Merci de vous référer aux documents associés pour plus de détails !** 🚀
