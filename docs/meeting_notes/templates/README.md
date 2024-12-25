# Documentation des Notes de Réunion

Ce dossier contient les modèles et les fichiers nécessaires pour organiser et archiver les réunions du projet **BeerToBeer**. La structure mise en place permet une navigation claire et un accès rapide aux informations.

---

## **Structure du Dossier**

### **1. Modèles**

- **Emplacement** : `docs/meeting_notes/templates/`
- **Description** : Contient les modèles standardisés pour :
  - **Ordre du Jour** : [agenda_template.md](templates/agenda_template.md)
  - **Compte-Rendu** : [summary_template.md](templates/summary_template.md)

### **2. Comptes-Rendus**

- **Emplacement** : Racine du dossier `docs/meeting_notes/`
- **Description** : Chaque fichier représente un compte-rendu de réunion, archivé par type et date.
- **Format de Nommage** :
  - `[type]_[YYYY_MM_DD].md`

### **Description des Composants**

- **`[type]`** : Indique le type de réunion.
  - Exemples :
    - `kickoff_meeting`
    - `weekly_meeting`
    - `validation_meeting`
- **`[YYYY_MM_DD]`** : Représente la date de la réunion au format ISO.
  - `YYYY` : Année (ex. : 2024)
  - `MM` : Mois (ex. : 12)
  - `DD` : Jour (ex. : 21)

### **Exemples de Fichiers**

- Réunion Kick-off : `kickoff_meeting_2024_12_21.md`
- Réunion Hebdomadaire : `weekly_meeting_2024_12_28.md`
- Réunion de Validation : `phase1_validation_meeting_2025_01_05.md`

---

## **Liste des Modèles Disponibles**

### **1. Modèle pour l’Ordre du Jour**

- **Fichier** : [agenda_template.md](templates/agenda_template.md)
- **Description** :
  Utilisez ce modèle pour planifier les réunions et définir leur ordre du jour.
- **Contient les Sections** :
  - **Participants** : Liste des participants à la réunion avec leurs rôles.
  - **Objectifs** : Liste des objectifs spécifiques de la réunion.
  - **Agenda** : Liste des sujets à discuter, avec durées et descriptions.
  - **Documents Associés** : Liens vers les documents nécessaires à la réunion.

---

### **2. Modèle pour le Compte-Rendu**

- **Fichier** : [summary_template.md](templates/summary_template.md)
- **Description** :
  Utilisez ce modèle pour documenter les résultats des réunions.
- **Contient les Sections** :
  - **Participants** : Liste des participants et de leurs rôles.
  - **Décisions** : Résumé des décisions prises pendant la réunion.
  - **Actions à Suivre** : Tableau des tâches avec responsables et échéances.
  - **Questions en Suspens** : Liste des points ouverts nécessitant une action ultérieure.
  - **Documents Associés** : Liens vers les documents discutés ou validés.

---

## **Utilisation des Modèles**

### **1. Réunion Kick-off**

- **Avant la Réunion** :
  - Remplissez l’ordre du jour avec [agenda_template.md](templates/agenda_template.md).
- **Après la Réunion** :
  - Documentez les décisions avec [summary_template.md](templates/summary_template.md).

### **2. Réunion de Suivi**

- **Avant la Réunion** :
  - Préparez les sujets à discuter avec [agenda_template.md](templates/agenda_template.md).
- **Après la Réunion** :
  - Résumez les progrès réalisés avec [summary_template.md](templates/summary_template.md).

### **3. Réunion de Validation**

- **Avant la Réunion** :
  - Listez les points de validation avec [agenda_template.md](templates/agenda_template.md).
- **Après la Réunion** :
  - Capturez les livrables validés avec [summary_template.md](templates/summary_template.md).

---

## **Liens Utiles**

- [Documentation Générale des Réunions](../README.md)
- [Types de Réunions](../../meetings/meeting_types.md)
- [Diagrammes des Réunions](../../meetings/)

---

## **Prochaines Étapes**

1. Utilisez ces modèles pour toutes les réunions Kick-off, Suivi, et Validation.
2. Mettez à jour les modèles si des besoins spécifiques émergent au fil du projet.
3. Respectez le format de nommage standard pour archiver les comptes-rendus :
   - `[type]_[YYYY_MM_DD].md`
   - Exemples :
     - `kickoff_meeting_2024_12_21.md`
     - `weekly_meeting_2024_12_28.md`
     - `phase1_validation_meeting_2025_01_05.md`
