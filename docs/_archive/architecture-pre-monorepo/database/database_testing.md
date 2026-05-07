# 📌 Test de la Base de Données - Brasse-Bouillon

## **1️⃣ Introduction**

Ce document explique comment tester la base de données **Brasse-Bouillon** avant l'intégration avec le backend. L'objectif est de valider la **création des tables**, la **cohérence des relations**, et l'application correcte des **contraintes d'intégrité**.

---

## **2️⃣ Prérequis**

Avant de commencer, assurez-vous d’avoir :
✅ **MySQL installé et en cours d'exécution.**  
✅ **Le script `database_init.sql` généré.**  
✅ **Un accès administrateur (`root`) ou un utilisateur MySQL avec les droits nécessaires.**  

📌 **Installation rapide de MySQL :**

- **Linux (Debian/Ubuntu)** : `sudo apt install mysql-server`
- **Mac (Homebrew)** : `brew install mysql`
- **Windows** : Télécharger [MySQL Community Server](https://dev.mysql.com/downloads/mysql/)

Après installation, démarrez MySQL avec :

```bash
sudo systemctl start mysql  # Linux
brew services start mysql   # Mac
```

---

## **3️⃣ Exécution du Script SQL**

Nous allons exécuter `database_init.sql` pour créer la base de données et toutes ses tables.

### 📌 **Connexion à MySQL**

Ouvrez un terminal et connectez-vous à MySQL :

```bash
mysql -u root -p
```

Saisissez votre mot de passe MySQL lorsque demandé.

### 📌 **Exécution du script SQL**

Depuis MySQL, exécutez :

```sql
SOURCE /chemin/vers/database_init.sql;
```

Ou directement en ligne de commande :

```bash
mysql -u root -p < database_init.sql
```

Si tout se passe bien, les tables seront créées.

---

## **4️⃣ Vérifications Post-Création**

### 📌 **Lister les tables**

```sql
SHOW TABLES;
```

Vous devriez voir toutes les tables créées (`users`, `recipes`, `ingredients`, etc.).

### 📌 **Vérifier la structure des tables**

```sql
DESCRIBE users;
DESCRIBE recipes;
```

Cela permet de s'assurer que les colonnes et types de données sont corrects.

---

## **5️⃣ Tests des Contraintes et Relations**

### 📌 **Insertion de données de test**

#### 🔹 **Ajouter un utilisateur**

```sql
INSERT INTO users (name, email, password_hash, role_id)
VALUES ('John Doe', 'john@example.com', 'hashedpassword123', 1);
```

#### 🔹 **Ajouter une recette liée à cet utilisateur**

```sql
INSERT INTO recipes (user_id, name, description)
VALUES (1, 'Pale Ale', 'Une bière légère et houblonnée');
```

#### 🔹 **Ajouter un ingrédient**

```sql
INSERT INTO ingredients (name, category)
VALUES ('Houblon Cascade', 'hop');
```

#### 🔹 **Associer un ingrédient à une recette**

```sql
INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
VALUES (1, 1, 50, 'g');
```

---

### 📌 **Tester les Suppressions en Cascade**

📢 **Vérification du `CASCADE DELETE` :**
Si un utilisateur est supprimé, ses recettes doivent être supprimées automatiquement.

#### 🔹 **Supprimer un utilisateur**

```sql
DELETE FROM users WHERE id = 1;
```

#### 🔹 **Vérifier que les recettes associées ont aussi été supprimées**

```sql
SELECT * FROM recipes WHERE user_id = 1;
```

Si le `CASCADE DELETE` fonctionne bien, cette requête ne doit renvoyer **aucune ligne**.

---

## **6️⃣ Détection et Correction des Erreurs**

### 📌 **Erreurs fréquentes et solutions**

| **Erreur** | **Cause possible** | **Solution** |
|-----------|------------------|------------|
| `ERROR 1452 (23000): Cannot add or update a child row: a foreign key constraint fails` | Tentative d’insertion d’une valeur `user_id` inexistante | Vérifier que l’utilisateur existe dans `users`. |
| `ERROR 1062 (23000): Duplicate entry` | Tentative d’insertion d’un `email` déjà utilisé | Vérifier les valeurs avant insertion. |
| `ERROR 1215 (HY000): Cannot add foreign key constraint` | Clé étrangère mal définie | Vérifier l’ordre de création des tables. |

---

## **7️⃣ Nettoyage et Réinitialisation de la Base**

Si vous voulez **réinitialiser entièrement la base de données**, utilisez :

```sql
DROP DATABASE brasse_bouillon;
CREATE DATABASE brasse_bouillon;
USE brasse_bouillon;
SOURCE /chemin/vers/database_init.sql;
```

Cela supprimera toutes les données et recréera une base propre.

---

## **8️⃣ Conclusion**

🎯 **Ce guide permet de tester et valider la structure de la base de données avant intégration avec le backend.**  
✅ Vérification de la création des tables.  
✅ Tests des insertions et suppressions en cascade.  
✅ Détection et correction des erreurs SQL.  

📌 **Prochaine étape : Intégration avec le backend et création des endpoints API !** 🚀
