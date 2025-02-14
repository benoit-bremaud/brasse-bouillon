# 📜 **Cahier des Charges - Brasse-Bouillon**  

## **📌 1️⃣ Présentation du Projet et Objectifs**  

### **1.1 Introduction**  

Brasse-Bouillon est une **application mobile** destinée aux **brasseurs amateurs**, leur permettant de **gérer leurs recettes, suivre leurs sessions de brassage et interagir avec la communauté brassicole**.  

📌 **Objectifs principaux :**  
✅ **Faciliter la gestion des ingrédients et des recettes de brassage.**  
✅ **Offrir un suivi précis des sessions de brassage.**  
✅ **Intégrer des capteurs IoT pour collecter automatiquement les données de brassage.**  
✅ **Encourager le partage et l’apprentissage via une plateforme communautaire.**  

📂 **Source :** [`vision.md`](../vision/vision.md)  

---

## **📌 2️⃣ Public Cible et Personas**  

📌 **L’application s’adresse à trois profils d’utilisateurs principaux :**  

| 👥 **Type d’utilisateur** | 📝 **Besoins et attentes** |
|----------------|----------------|
| **Brasseur amateur débutant** | Accompagnement pas à pas, recettes prédéfinies, gestion simplifiée des ingrédients. |
| **Brasseur expérimenté** | Contrôle avancé des paramètres de brassage, optimisation des recettes, personnalisation des ingrédients. |
| **Microbrasseur / Professionnel** | Personnalisation avancée des paramètres, suivi précis des données, gestion avancée des ingrédients. |

📂 **Source :** [`user_personas.md`](../personas/user_personas.md)  

---

## **📌 3️⃣ Liste des Fonctionnalités**  

📌 **Fonctionnalités principales de Brasse-Bouillon :**  

✅ **Gestion des ingrédients (CRUD)** : Ajouter, modifier, supprimer et rechercher des ingrédients (malt, houblon, levure, eau).  
✅ **Gestion des recettes (CRUD)** : Créer, modifier, supprimer et partager des recettes utilisant les ingrédients disponibles.  
✅ **Calcul automatique des paramètres techniques (IBU, ABV, etc.).**  
✅ **Planification et suivi des sessions de brassage.**  
✅ **Partage communautaire des recettes et notation par les utilisateurs.**  
✅ **Notifications intelligentes : rappels des étapes clés du brassage.**  
✅ **Intégration avec des capteurs IoT pour la collecte automatique des données (température, densité).**  

📂 **Source :** [`functional_requirements.md`](./functional_requirements.md)  

---

## **📌 4️⃣ Cas d’Utilisation et Interactions Utilisateur**  

📌 **Parcours utilisateur clés :**  

1️⃣ **Un utilisateur ajoute un nouvel ingrédient** (ex. : houblon, malt, levure, eau).  
2️⃣ **Un utilisateur consulte les ingrédients disponibles** pour composer une recette.  
3️⃣ **L’utilisateur sélectionne les ingrédients et enregistre une nouvelle recette.**  
4️⃣ **Lors du brassage, l’application affiche les quantités et étapes d’ajout des ingrédients.**  
5️⃣ **Les capteurs IoT envoient les relevés de température et de densité** à l’application mobile.  
6️⃣ **L’utilisateur reçoit une alerte** si les conditions de fermentation ne sont pas optimales.  
7️⃣ **L’utilisateur partage la recette finalisée** avec la communauté.  

📂 **Source :** [`detailed_use_cases.md`](../use_cases/detailed_use_cases.md)  

---

## **📌 5️⃣ Contraintes Techniques et Exigences de Sécurité**  

📌 **Exigences techniques principales :**  

✅ **Backend en Node.js (Express) + PostgreSQL** pour une architecture scalable.  
✅ **Application mobile développée avec React Native** (compatibilité iOS et Android).  
✅ **Utilisation de MQTT/WebSockets** pour la communication en temps réel avec les capteurs IoT.  
✅ **Authentification sécurisée avec JWT/OAuth.**  
✅ **Chiffrement des mots de passe (`bcrypt`), toutes les communications API en HTTPS.**  

📂 **Source :** [`non_functional_requirements.md`](./non_functional_requirements.md)  

---

## **📌 6️⃣ Architecture et Modèle de Données**  

📌 **L’architecture du système est modulaire et comprend plusieurs couches :**  

✅ **Frontend (React Native)** → Interface utilisateur mobile  
✅ **Backend (Node.js + Express)** → Gestion des requêtes API et logique métier  
✅ **Base de Données (PostgreSQL/MySQL)** → Stockage des recettes, sessions, ingrédients, utilisateurs  
✅ **Capteurs IoT** → Suivi automatique des températures et densités  

📂 **Source :** [`system_overview.md`](../architecture/system_overview.md)  

---

## **📌 7️⃣ Planning et Organisation du Projet**  

📌 **Phases de développement :**  

1️⃣ **Phase 1 :** Définition des exigences et prototypage.  
2️⃣ **Phase 2 :** Développement du backend et mise en place de la base de données.  
3️⃣ **Phase 3 :** Développement de l’application mobile (frontend).  
4️⃣ **Phase 4 :** Intégration des capteurs IoT et gestion des données en temps réel.  
5️⃣ **Phase 5 :** Tests et correction des bugs.  
6️⃣ **Phase 6 :** Déploiement et maintenance du projet.  

📂 **Source :** [`roadmap.md`](../roadmap.md)  

---

## **📌 8️⃣ Conception de l’API**  

📌 **Ajout d’un nouvel endpoint `/ingredients`**  

| 🌐 **Endpoint** | 🔍 **Description** | 🔐 **Authentification** |
|---------------|------------------|------------------|
| **GET `/ingredients`** | Liste des ingrédients disponibles | ❌ |
| **POST `/ingredients`** | Ajouter un nouvel ingrédient | ✅ |
| **PUT `/ingredients/:id`** | Modifier un ingrédient | ✅ |
| **DELETE `/ingredients/:id`** | Supprimer un ingrédient | ✅ |
| **GET `/recipes`** | Liste des recettes créées | ❌ |
| **POST `/recipes`** | Créer une recette avec des ingrédients sélectionnés | ✅ |

📂 **Source :** [`api_design.md`](../architecture/api_design.md)  

---

## **📌 9️⃣ Plan de Maintenance et Évolutivité**  

📌 **Stratégies pour assurer la maintenabilité et l’évolutivité du projet :**  

✅ **Documentation complète du code et des API (`Swagger`, `README.md`).**  
✅ **Mise en place de tests unitaires et d’intégration (`Jest`, `Supertest`).**  
✅ **Utilisation de Docker pour simplifier les déploiements.**  
✅ **Architecture évolutive avec microservices pour gérer la montée en charge.**  
✅ **Mise à jour régulière des dépendances pour éviter les failles de sécurité.**  

📂 **Source :** [`maintenance_plan.md`](./maintenance_plan.md)  
