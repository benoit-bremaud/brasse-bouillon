# Documentation des Notes de Réunion

Ce dossier contient tous les fichiers et modèles nécessaires pour organiser, documenter et archiver les réunions du projet **BeerToBeer**. Il décrit la structure du dossier, les modèles disponibles, et les workflows automatisés pour faciliter la gestion des réunions.

---

## **Objectifs**

1. **Standardisation des Réunions** :
   - Utilisation de modèles uniformes pour les ordres du jour et les comptes-rendus.
   - Processus clairement définis pour la création, le suivi, et l'archivage des réunions.

2. **Structuration de la Documentation** :
   - Organisation des fichiers en dossiers dédiés.
   - Respect des conventions de nommage pour garantir une navigation facile.

3. **Automatisation des Tâches Répétitives** :
   - Génération automatique des fichiers d’agenda et des comptes-rendus via GitHub Actions.
   - Archivage automatique des notes de réunion lors de la fermeture d’une issue.

---

## **Structure du Dossier**

### **Organisation**

Le dossier est structuré comme suit :

```

docs/meeting_notes/
├── templates/
│   ├── agenda_template.md
│   ├── summary_template.md
├── kickoff_meeting_YYYY_MM_DD.md
├── followup_meeting_YYYY_MM_DD.md
├── validation_meeting_YYYY_MM_DD.md

```

### **Description des Sous-Dossiers**

- **`templates/`** : Contient des modèles réutilisables pour les ordres du jour et les comptes-rendus.
- **Fichiers de Comptes-Rendus** :
  - Archivés par type (`kick-off`, `follow-up`, `validation`) et date.
  - Respectent le format :

    ```
    [type]_[YYYY_MM_DD].md
    ```

  - **Exemples** :
    - `kickoff_meeting_2024_12_21.md`
    - `followup_meeting_2024_12_28.md`
    - `validation_meeting_2025_01_05.md`

---

## **Modèles Disponibles**

### **1. Modèle pour l’Ordre du Jour**

- **Fichier** : [`agenda_template.md`](agenda_template.md)
- **Description** :
  Utilisé pour préparer l’agenda des réunions avant leur tenue.
- **Sections Clés** :
  - Participants
  - Objectifs
  - Documents Associés

### **2. Modèle pour le Compte-Rendu**

- **Fichier** : [`summary_template.md`](summary_template.md)
- **Description** :
  Utilisé pour documenter les décisions et actions après la réunion.
- **Sections Clés** :
  - Participants
  - Décisions
  - Actions à Suivre
  - Questions en Suspens

---

## **Processus des Réunions**

### **Étapes**

1. **Création d’une Issue de Réunion** :
   - Utilisez les modèles GitHub pour initier la réunion.
   - Exemple : [Modèle Kick-off](../../../.github/ISSUE_TEMPLATE/kickoff_meeting.yml).

2. **Documentation de la Réunion** :
   - Remplissez l’agenda à l’aide de [`agenda_template.md`](agenda_template.md).
   - Documentez les résultats avec [`summary_template.md`](summary_template.md).

3. **Archivage Automatisé** :
   - Lorsqu’une issue est fermée, le workflow GitHub génère un fichier Markdown et l’archive dans `docs/meeting_notes/`.

---

## **Automatisations**

### **Workflows Disponibles**

1. **Archivage des Comptes-Rendus** :
   - Workflow : [archive_meeting.yml](../../../.github/workflows/archive_meeting.yml)
   - Déclencheur : Fermeture d’une issue avec le label `meeting`.
   - Résultat : Un fichier Markdown est généré automatiquement et sauvegardé.

### **Guidelines**

- Respectez le format de nommage des fichiers :

  ```

  [type]_[YYYY_MM_DD].md

  ```

- Revoyez régulièrement la structure des dossiers pour garantir sa clarté.

---

## **FAQ**

### **Comment créer une note de réunion ?**

1. Créez une issue à l’aide du modèle approprié (ex. : Kick-off).
2. Remplissez les informations de l’agenda.
3. Documentez les résultats après la réunion avec le modèle de compte-rendu.

### **Que faire si une section reste vide ?**

- Si une section n’est pas applicable, indiquez-le avec `(Non applicable)`.

---

## **Liens Utiles**

- [Agenda Template](agenda_template.md)
- [Summary Template](templates/summary_template.md)
- [Workflow d’Archivage](../../../.github/workflows/archive_meeting.yml)

---
