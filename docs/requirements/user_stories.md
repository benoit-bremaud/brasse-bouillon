# User Stories – Projet Brasse-Bouillon

> **SUPERSEDED** — This document has been replaced by the unified Product Backlog at
> [`docs/product-backlog/product-backlog.md`](../product-backlog/product-backlog.md).
> All User Stories are now tracked as GitHub Issues (#403-#465) on the project board.

Ce document regroupe les récits utilisateurs (user stories) exprimant les besoins fonctionnels des brasseurs amateurs, tels qu'identifiés dans la phase de recueil des besoins. Les histoires sont classées par grandes thématiques fonctionnelles.

---

## 🧪 Gestion des Recettes

### US01 – Création d’une recette

**En tant que** brasseur amateur,  
**je veux** pouvoir créer une nouvelle recette  
**afin de** garder une trace de mes créations personnelles.

**Critères d'acceptation :**

- [ ] Je peux saisir un nom, un style et une description.
- [ ] Je peux ajouter des ingrédients avec leurs quantités.
- [ ] Je peux sauvegarder la recette dans mon espace personnel.

### US02 – Modification d’une recette

**En tant que** utilisateur,  
**je veux** pouvoir modifier une recette existante  
**afin de** l’adapter ou corriger des informations.

**Critères d'acceptation :**

- [ ] Je peux modifier chaque champ d’une recette enregistrée.
- [ ] Je peux sauvegarder les modifications ou annuler.

### US03 – Duplication d’une recette

**En tant que** brasseur,  
**je veux** dupliquer une recette  
**afin de** la tester avec de légères variantes.

**Critères d'acceptation :**

- [ ] Je peux copier une recette existante.
- [ ] Je peux modifier librement les champs de la copie.

---

## 📊 Calculs Techniques

### US04 – Calcul automatique IBU / ABV

**En tant que** utilisateur,  
**je veux** que l’application calcule automatiquement l’IBU et l’ABV  
**afin de** connaître les caractéristiques techniques de ma bière.

**Critères d'acceptation :**

- [ ] Les valeurs sont générées dynamiquement selon les ingrédients et volumes.
- [ ] Un message d’alerte s’affiche si une donnée manque pour le calcul.

### US05 – Calculateur de carbonatation

**En tant que** brasseur,  
**je veux** un outil de calcul pour la carbonatation  
**afin de** réussir ma mise en bouteille selon le style de bière.

**Critères d'acceptation :**

- [ ] Je peux sélectionner un style de bière.
- [ ] Je peux visualiser la quantité de sucre recommandée.

---

## 👥 Communauté et Partage

### US06 – Partage de recettes

**En tant que** utilisateur,  
**je veux** pouvoir partager mes recettes avec la communauté  
**afin de** recevoir des retours et inspirer d’autres brasseurs.

**Critères d'acceptation :**

- [ ] Je peux rendre publique une recette que j’ai créée.
- [ ] Les autres utilisateurs peuvent visualiser et commenter la recette.

### US07 – Notation et commentaires

**En tant que** membre de la communauté,  
**je veux** commenter ou noter des recettes  
**afin de** favoriser les échanges et recommandations entre brasseurs.

**Critères d'acceptation :**

- [ ] Je peux laisser un commentaire sur une recette publique.
- [ ] Je peux attribuer une note sur 5 étoiles.

---

## 🌍 Dimension Durable et Locale

### US08 – Valorisation des drêches

**En tant que** brasseur amateur soucieux de l’environnement,  
**je veux** obtenir des idées pour réutiliser mes drêches  
**afin de** réduire mes déchets et leur donner une seconde vie.

**Critères d'acceptation :**

- [ ] L’application me propose des recettes ou tutoriels à base de drêches.
- [ ] Je peux sauvegarder mes idées préférées.

### US09 – Localisation de fournisseurs responsables

**En tant que** utilisateur,  
**je veux** localiser des fournisseurs proches et engagés  
**afin de** m’approvisionner de manière éthique et locale.

**Critères d'acceptation :**

- [ ] Je peux consulter une carte ou une liste filtrable par zone géographique.
- [ ] Les fournisseurs sont accompagnés de labels ou indicateurs de durabilité.

---

## 🧭 Navigation et Ergonomie

### US10 – Accès hors-ligne aux recettes

**En tant que** utilisateur mobile,  
**je veux** consulter et modifier mes recettes sans connexion Internet  
**afin de** brasser sereinement même en zone sans réseau.

**Critères d'acceptation :**

- [ ] Mes recettes sauvegardées sont accessibles hors connexion.
- [ ] Je peux créer ou modifier une recette hors-ligne, avec synchronisation automatique à la reconnexion.

