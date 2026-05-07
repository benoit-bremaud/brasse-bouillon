# 🏗️ Documentation de l'Architecture - Brasse-Bouillon

Ce dossier **[`docs/architecture`](./)** contient l’ensemble des **diagrammes UML** permettant de comprendre et documenter l’architecture technique de l’application **Brasse-Bouillon**.

L’architecture est **modularisée** afin de garantir une **meilleure lisibilité** et d’assurer une **évolution progressive** du projet.

---

## 📂 **Organisation du Dossier**

L’architecture est décomposée en **plusieurs modules**, chacun ayant son propre dossier contenant les diagrammes UML associés.

### 📌 **Vue Générale**

| 📂 Dossier | 📄 Fichier UML | 📌 Description |
|-----------|---------------|---------------|
| [`architecture/`](./) | [`application_architecture.uml`](./application_architecture.uml) | 🏗️ Vue **globale** de l'architecture (Niveau 2) |

### 📌 **Modules Spécifiques**

| 📂 Dossier | 📄 Fichiers UML | 📌 Description |
|-----------|---------------|---------------|
| [`frontend/`](./frontend) | [`frontend_architecture.uml`](./frontend/frontend_architecture.uml), [`navigation_structure.uml`](./frontend/navigation_structure.uml), [`ui_components.uml`](./frontend/ui_components.uml) | 📱 Gestion de **l’application mobile (React Native)** et UI |
| [`backend/`](./backend) | [`backend_architecture.uml`](./backend/backend_architecture.uml), [`api_interactions.uml`](./backend/api_interactions.uml), [`authentication_system.uml`](./backend/authentication_system.uml) | 🖥️ Organisation du **serveur Node.js** et des API |
| [`database/`](./database) | [`database_schema.uml`](./database/database_schema.uml), [`recipes_sessions_structure.uml`](./database/recipes_sessions_structure.uml) | 🗄️ Schéma de **la base de données relationnelle (PostgreSQL/MySQL)** |
| [`iot/`](./iot) | [`iot_architecture.uml`](./iot/iot_architecture.uml), [`iot_data_processing.uml`](./iot/iot_data_processing.uml) | 🌡️ Gestion des **capteurs IoT et stockage des mesures** |
| [`notifications/`](./notifications) | [`notifications_system.uml`](./notifications/notifications_system.uml), [`push_notifications.uml`](./notifications/push_notifications.uml) | 📢 **Rappels et notifications mobiles** pour l’utilisateur |
| `beer-encyclopedia` (code dans [`packages/beer-encyclopedia/`](../../packages/beer-encyclopedia/)) | Pas encore de fichier UML dédié | 🍺 **Encyclopédie de bières** et scanner d'étiquettes IA (Python 3.12 + FastAPI + YOLOv8 + EasyOCR + PostgreSQL + async SQLAlchemy 2.0). CRUD + recherche floue `pg_trgm` sur breweries/beers/styles, pipeline de scan YOLO→OCR→extraction→recommandation. Voir [`packages/beer-encyclopedia/README.md`](../../packages/beer-encyclopedia/README.md) et [`packages/beer-encyclopedia/docs/SETUP.md`](../../packages/beer-encyclopedia/docs/SETUP.md). |

---

## 📊 **Détails des Modules**

### 🏗️ [`application_architecture.uml`](./application_architecture.uml)

- Vue **macro** de l’architecture, présentant les principaux composants :
  - **Frontend (React Native)**
  - **Backend API (Node.js, Express)**
  - **Base de Données (PostgreSQL/MySQL)**
  - **Capteurs IoT** et **systèmes de notifications**

### 📱 [`frontend/`](./frontend)

- **[`frontend_architecture.uml`](./frontend/frontend_architecture.uml)** : Vue globale de l’application mobile.
- **[`navigation_structure.uml`](./frontend/navigation_structure.uml)** : Gestion des écrans et transitions.
- **[`ui_components.uml`](./frontend/ui_components.uml)** : Organisation des composants visuels (UI/UX).

### 🖥️ [`backend/`](./backend)

- **[`backend_architecture.uml`](./backend/backend_architecture.uml)** : Vue détaillée des services backend.
- **[`api_interactions.uml`](./backend/api_interactions.uml)** : Routes API et interactions frontend-backend.
- **[`authentication_system.uml`](./backend/authentication_system.uml)** : Gestion de l’authentification et sécurité (JWT, OAuth).

### 🗄️ [`database/`](./database)

- **[`database_schema.uml`](./database/database_schema.uml)** : Structure relationnelle de la base de données.
- **[`recipes_sessions_structure.uml`](./database/recipes_sessions_structure.uml)** : Modélisation des entités **Recettes** et **Sessions de Brassage**.

### 🌡️ [`iot/`](./iot)

- **[`iot_architecture.uml`](./iot/iot_architecture.uml)** : Vue globale des interactions IoT.
- **[`iot_data_processing.uml`](./iot/iot_data_processing.uml)** : Processus de collecte et stockage des données IoT.

### 📢 [`notifications/`](./notifications)

- **[`notifications_system.uml`](./notifications/notifications_system.uml)** : Gestion des notifications dans l’application.
- **[`push_notifications.uml`](./notifications/push_notifications.uml)** : Fonctionnalités liées aux rappels et alertes mobiles.

---

## 🚀 **Comment Utiliser cette Documentation ?**

📌 **Naviguez dans les dossiers** pour voir l’architecture détaillée de chaque module.
📌 **Utilisez un éditeur compatible UML** (*Mermaid.js, PlantUML, Draw.io*) pour visualiser les fichiers `.uml`.
📌 **Modifiez et complétez les diagrammes** en fonction des évolutions du projet.

📂 **Lieu du fichier :** [`docs/architecture/README.md`](./README.md)

---

### ✅ **Évolution & Mise à Jour**

Cette documentation est **évolutive** et doit être mise à jour régulièrement en fonction des **évolutions du projet** et des **nouvelles fonctionnalités** ajoutées.

💡 **Dernière mise à jour :** *(ajouter la date ici)*
