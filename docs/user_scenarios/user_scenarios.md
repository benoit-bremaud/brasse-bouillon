# User Scenarios - Brasse-Bouillon

## Introduction

Ce document décrit les scénarios critiques identifiés pour chaque interaction clé de l'application Brasse-Bouillon. Ces scénarios permettent de mieux comprendre les étapes nécessaires pour répondre aux besoins des utilisateurs et garantir une expérience utilisateur optimale.

---

## Scénarios Critiques

### **1. Consulter un tutoriel interactif**

#### Acteur : Brasseur Non-Initié (Débutant)

#### Étapes

1. L’utilisateur se connecte à son compte ou s’inscrit sur l’application.
2. Depuis le tableau de bord, il accède à la section "Tutoriels".
3. L’utilisateur sélectionne un tutoriel interactif adapté à son niveau.
4. Le tutoriel démarre et affiche une série d’étapes guidées :
   - Présentation des objectifs du tutoriel.
   - Explications pas à pas avec des images ou vidéos.
   - Validation de chaque étape avant de passer à la suivante.
5. Une fois terminé, un récapitulatif est présenté, avec des points clés et des conseils.
6. L’utilisateur peut marquer le tutoriel comme "Terminé" ou revenir à une étape précédente.

---

### **2. Créer une recette personnalisée**

#### Acteur : Brasseur Initié (Amateur)

#### Étapes

1. L’utilisateur accède à l’interface "Créer une recette" depuis le menu principal.
2. Il saisit les informations générales de la recette :
   - Nom de la recette.
   - Type de bière (Blonde, IPA, etc.).
   - Volume total (en litres).
3. L’utilisateur ajoute des ingrédients :
   - Sélectionne un ingrédient dans la base de données (malt, houblon, levure).
   - Indique les quantités nécessaires.
4. Il définit les étapes de brassage :
   - Temps et températures pour chaque phase.
   - Durée de la fermentation et maturation.
5. La recette est sauvegardée dans son espace personnel.
6. Une option permet de partager la recette avec la communauté.

---

### **3. Rechercher une recette simplifiée**

#### Acteur : Brasseur Non-Initié (Débutant)

#### Étapes

1. L’utilisateur accède à la barre de recherche ou au menu "Recettes".
2. Il saisit des mots-clés ou utilise les filtres disponibles (type de bière, niveau de difficulté, temps de brassage).
3. Les résultats s’affichent sous forme de liste avec des informations clés (titre, style, durée).
4. L’utilisateur sélectionne une recette pour afficher les détails complets :
   - Liste des ingrédients.
   - Étapes de préparation.
   - Notes ou évaluations des autres utilisateurs.

---

### **4. Partager une recette avec la communauté**

#### Acteur : Brasseur Initié (Amateur)

#### Étapes

1. Depuis l’espace personnel, l’utilisateur sélectionne une recette existante ou en crée une nouvelle.
2. Il clique sur l’option "Partager avec la communauté".
3. L’utilisateur ajoute des détails supplémentaires :
   - Description ou histoire de la recette.
   - Astuces personnelles ou commentaires.
4. La recette est publiée dans la section communautaire, avec la possibilité de recevoir des retours :
   - Notes ou commentaires d’autres utilisateurs.
   - Notifications en cas de mise à jour.

---

### **5. Gérer les stocks d’ingrédients**

#### Acteur : Brasseur Expérimenté (Avancé)

#### Étapes

1. L’utilisateur accède à l’interface "Gestion des stocks" depuis le tableau de bord.
2. Il visualise la liste des ingrédients actuels avec leurs niveaux de stock :
   - Quantité disponible.
   - Alertes pour seuils bas.
3. L’utilisateur ajoute un nouvel ingrédient ou met à jour un ingrédient existant :
   - Sélectionne l’ingrédient.
   - Modifie la quantité disponible.
   - Définit un seuil minimum pour recevoir des alertes.
4. En cas de seuil atteint, une notification est envoyée pour rappeler de réapprovisionner.
5. Un rapport des stocks est généré pour un suivi global.

---

### **6. Analyser un brassin**

#### Acteur : Brasseur Expérimenté (Avancé)

#### Étapes

1. L’utilisateur sélectionne un brassin terminé depuis l’historique.
2. Il accède aux données collectées pour ce brassin :
   - Rendement obtenu.
   - Mesures de densité avant et après fermentation.
   - Temps de brassage et fermentation.
3. Le système génère un rapport comparant les résultats obtenus avec les objectifs prévus.
4. L’utilisateur peut ajouter des notes ou ajustements pour ses brassins futurs.
5. Le rapport est sauvegardé dans son espace personnel pour une consultation ultérieure.

---

### **7. Ajouter ou modifier une recette publique**

#### Acteur : Administrateur

#### Étapes

1. L’administrateur accède à l’interface "Gestion des recettes publiques".
2. Il sélectionne une recette existante ou clique sur "Ajouter une recette".
3. Pour une nouvelle recette, il saisit les informations suivantes :
   - Titre de la recette.
   - Liste des ingrédients avec quantités.
   - Étapes détaillées de brassage.
4. Pour une recette existante, il modifie les informations nécessaires ou supprime la recette.
5. Une fois terminé, il valide les changements, qui sont publiés pour tous les utilisateurs.
6. Un journal des modifications est mis à jour pour garder une trace des actions.

---

### **8. Gérer les utilisateurs**

#### Acteur : Administrateur

#### Étapes

1. L’administrateur accède à l’interface "Gestion des utilisateurs".
2. Il recherche un utilisateur via son nom ou adresse email.
3. L’administrateur peut :
   - Ajouter un nouvel utilisateur avec les informations nécessaires.
   - Modifier les droits ou informations d’un utilisateur existant.
   - Supprimer un utilisateur en cas de besoin.
4. Chaque action est sauvegardée dans un journal d’administration pour assurer la traçabilité.
