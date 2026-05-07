# Diagramme UML des Classes - Brasse-Bouillon

## 1. Introduction

Ce document présente le **diagramme UML des classes** du projet **Brasse-Bouillon**. Il illustre les principales classes, leurs attributs, méthodes et relations, suivant une approche orientée objet.

---

## 2. Analyse des Classes à Modéliser

L’analyse des classes s’appuie sur les entités définies dans **`data_model.md`** et les contraintes techniques décrites dans **`database_schema.md`**.

### 📌 **Liste des classes et attributs**

| Classe | Attributs | Méthodes |
|--------|----------|----------|
| **User** | `id: int`, `name: str`, `email: str`, `password_hash: str`, `role: str`, `created_at: datetime` | `register()`, `login()`, `updateProfile()`, `deleteAccount()` |
| **Recipe** | `id: int`, `user_id: int`, `name: str`, `description: str`, `created_at: datetime` | `createRecipe()`, `updateRecipe()`, `deleteRecipe()`, `calculateIBU()`, `calculateABV()` |
| **Ingredient** | `id: int`, `name: str`, `category: str` | `updateIngredient()`, `deleteIngredient()` |
| **RecipeIngredient** | `recipe_id: int`, `ingredient_id: int`, `quantity: float`, `unit: str` | - |
| **BrewSession** | `id: int`, `user_id: int`, `recipe_id: int`, `start_time: datetime`, `status: str` | `startSession()`, `updateSession()`, `endSession()` |
| **BrewingEquipment** | `id: int`, `user_id: int`, `name: str`, `description: str`, `created_at: datetime` | `addEquipment()`, `updateEquipment()`, `removeEquipment()` |
| **Comment** | `id: int`, `user_id: int`, `recipe_id: int`, `content: str`, `created_at: datetime` | `addComment()`, `editComment()`, `deleteComment()` |
| **Rating** | `id: int`, `user_id: int`, `recipe_id: int`, `score: int`, `created_at: datetime` | `rateRecipe()`, `updateRating()`, `deleteRating()` |
| **Notification** | `id: int`, `user_id: int`, `message: str`, `created_at: datetime` | `sendNotification()`, `deleteNotification()` |

### **Explications et Références**

- **Les classes `User`, `Recipe`, `Ingredient` et `BrewSession`** sont dérivées directement des entités de `data_model.md`.
- **Les classes `RecipeIngredient`, `Comment`, `Rating` et `Notification`** sont des objets liés permettant d’enrichir la logique métier de l’application.
- **Les méthodes sont définies en fonction des interactions utilisateurs et des processus identifiés dans `database_schema.md` et `api_interactions.md`**.

---

## 3. Diagramme UML des Classes

```mermaid
classDiagram
    class User {
        +int id
        +string name
        +string email
        +string password_hash
        +string role
        +datetime created_at
        +register()
        +login()
        +updateProfile()
        +deleteAccount()
    }

    class Recipe {
        +int id
        +int user_id
        +string name
        +string description
        +datetime created_at
        +createRecipe()
        +updateRecipe()
        +deleteRecipe()
        +calculateIBU()
        +calculateABV()
    }

    class Ingredient {
        +int id
        +string name
        +string category
        +updateIngredient()
        +deleteIngredient()
    }

    class RecipeIngredient {
        +int recipe_id
        +int ingredient_id
        +float quantity
        +string unit
    }

    class BrewSession {
        +int id
        +int user_id
        +int recipe_id
        +datetime start_time
        +string status
        +startSession()
        +updateSession()
        +endSession()
    }

    class BrewingEquipment {
        +int id
        +int user_id
        +string name
        +string description
        +datetime created_at
        +addEquipment()
        +updateEquipment()
        +removeEquipment()
    }

    class Comment {
        +int id
        +int user_id
        +int recipe_id
        +string content
        +datetime created_at
        +addComment()
        +editComment()
        +deleteComment()
    }

    class Rating {
        +int id
        +int user_id
        +int recipe_id
        +int score
        +datetime created_at
        +rateRecipe()
        +updateRating()
        +deleteRating()
    }

    class Notification {
        +int id
        +int user_id
        +string message
        +datetime created_at
        +sendNotification()
        +deleteNotification()
    }

    User "1" --> "N" Recipe : owns
    User "1" --> "N" BrewSession : starts
    User "1" --> "N" BrewingEquipment : owns
    User "1" --> "N" Comment : writes
    User "1" --> "N" Rating : rates
    User "1" --> "N" Notification : receives

    Recipe "1" --> "N" RecipeIngredient : contains
    Ingredient "1" --> "N" RecipeIngredient : used_in

    Recipe "1" --> "N" Comment : commented_by
    Recipe "1" --> "N" Rating : rated_by

    Recipe "1" --> "N" BrewSession : used_for
```

---

## 4. Alignement avec la Base de Données

- **Ce diagramme est cohérent avec `data_model.md` et `database_schema.md`**.
- **Il représente la structure orientée objet, tandis que `database_schema.md` montre l’implémentation en base MySQL**.

---
