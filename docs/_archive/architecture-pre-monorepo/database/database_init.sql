-- 🔄 Création de la base de données
CREATE DATABASE IF NOT EXISTS brasse_bouillon;
USE brasse_bouillon;

-- 📁 Table des rôles (base des permissions)
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name ENUM('user', 'admin') NOT NULL UNIQUE
);

-- 🔐 Table des permissions liées aux rôles
CREATE TABLE permissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_id INT NOT NULL,
    permission VARCHAR(255) NOT NULL,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- ✅ Insertion des rôles par défaut
INSERT INTO roles (name) VALUES ('user'), ('admin');

-- ✅ Permissions associées aux rôles
INSERT INTO permissions (role_id, permission) VALUES
((SELECT id FROM roles WHERE name = 'user'), 'view_recipes'),
((SELECT id FROM roles WHERE name = 'user'), 'comment_recipes'),
((SELECT id FROM roles WHERE name = 'admin'), 'manage_users'),
((SELECT id FROM roles WHERE name = 'admin'), 'delete_comments'),
((SELECT id FROM roles WHERE name = 'admin'), 'edit_recipes');

-- 👤 Table des utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 🍺 Table des recettes
CREATE TABLE recipes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 🧪 Table des ingrédients
CREATE TABLE ingredients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category ENUM('hop', 'malt', 'yeast', 'water', 'additive') NOT NULL
);

-- 📦 Table de liaison recette ↔ ingrédients
CREATE TABLE recipe_ingredients (
    recipe_id INT NOT NULL,
    ingredient_id INT NOT NULL,
    quantity FLOAT NOT NULL,
    unit VARCHAR(50) DEFAULT 'g',
    PRIMARY KEY (recipe_id, ingredient_id),
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE
);