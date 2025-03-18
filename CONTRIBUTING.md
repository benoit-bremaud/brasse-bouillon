# Guide de Contribution au Projet Brasse-Bouillon (B2B)

Bienvenue sur le projet **Brasse-Bouillon** ! Ce document définit les bonnes pratiques pour collaborer efficacement.

## Structure des Branches

### Branches principales

- **`main`** : Branche de production. Contient le code stable prêt à être déployé.
- **`develop`** : Branche de développement principal. Les nouvelles fonctionnalités y sont fusionnées avant `main`.

### Branches secondaires

Créez une branche pour chaque tâche ou fonctionnalité, en suivant cette convention de nommage :

```
<type>/<nom-descriptif>
```

#### **Types possibles :**

- **`feat`** : Ajout d'une nouvelle fonctionnalité.
- **`fix`** : Correction d'un bug.
- **`docs`** : Modifications dans la documentation.
- **`style`** : Changements de style (indentation, formatage, etc.).
- **`refactor`** : Refactorisation du code sans ajout de fonctionnalité.
- **`test`** : Ajout ou correction de tests.
- **`chore`** : Mise à jour des outils ou configurations (CI/CD, dépendances...).

#### **Exemples :**

- `feat/ajout-authentification-utilisateur`
- `fix/correction-bug-auth`
- `docs/mise-a-jour-readme`

---

## Convention de Nommage des Commits

Nous utilisons la convention **Angular Commit Message Guidelines**. Voici le format standard :

```
<type>(<scope>): <message>
```

### **Types de commit :**

- **`feat`** : Pour une nouvelle fonctionnalité.
- **`fix`** : Pour une correction de bug.
- **`docs`** : Pour des modifications dans la documentation.
- **`style`** : Pour des modifications de style (pas de changement de code).
- **`refactor`** : Pour une refactorisation du code.
- **`test`** : Pour des ajouts ou mises à jour de tests.
- **`chore`** : Pour des tâches sans impact fonctionnel.

### **Structure détaillée :**

1. **`<type>`** : Obligatoire, indique la nature de la modification.
2. **`(<scope>)`** : Optionnel, décrit la partie impactée (ex. `frontend`, `backend`).
3. **`<message>`** : Une phrase concise expliquant la modification.

### **Exemples :**

- `feat(frontend): ajouter le formulaire de connexion`
- `fix(backend): corriger la validation des tokens`
- `docs(readme): mise à jour des prérequis`
- `chore(ci): ajouter les tests automatiques dans GitHub Actions`

---

## Workflow de Collaboration

1. **Créer une branche** :
   - Basez votre branche sur `develop` :

     ```bash
     git checkout develop
     git checkout -b feat/nom-de-la-feature
     ```

2. **Faire des commits** :
   - Suivez la convention de nommage pour chaque commit.

3. **Ouvrir une Pull Request (PR)** :
   - Une fois la tâche terminée, ouvrez une PR vers `develop`.
   - Ajoutez une description claire et des captures d’écran si nécessaire.
   - Exemple de titre : `[feat] ajout de la gestion des recettes`

4. **Revue de code** :
   - Chaque PR doit être revue par au moins un autre membre de l’équipe.
   - Utilisez les commentaires pour poser des questions ou suggérer des améliorations.

5. **Fusionner dans `develop`** :
   - Une fois la PR approuvée, elle peut être fusionnée.

---

## Tests et Validation

1. **Écrire des tests** :
   - Ajoutez des tests unitaires pour chaque fonctionnalité.
   - Exécutez les tests localement avant de soumettre une PR :

     ```bash
     npm test
     ```

2. **Automatisation CI/CD** :
   - Les workflows GitHub Actions exécutent automatiquement les tests sur chaque PR.
   - Les PRs échouant aux tests ne seront pas fusionnées.

---

## Bonnes Pratiques

1. **Documentez vos fonctionnalités** :
   - Si vous ajoutez une fonctionnalité importante, mettez à jour la documentation correspondante dans `/docs`.

2. **Divisez vos commits** :
   - Faites des commits atomiques et bien séparés pour faciliter la revue.

3. **Communiquez** :
   - Utilisez les commentaires sur GitHub pour clarifier votre code ou signaler des blocages.

---

## Ressources

- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Conventions Git](https://www.conventionalcommits.org/)
- [Guide GitHub Workflow](https://docs.github.com/en/get-started/quickstart/hello-world)

---

Merci de respecter ces conventions pour une collaboration fluide et efficace. 🚀

```
