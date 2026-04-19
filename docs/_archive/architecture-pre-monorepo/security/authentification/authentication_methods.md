# Méthodes d'Authentification - Brasse-Bouillon

## 1. Introduction

Ce document décrit les **méthodes d'authentification utilisées** dans le projet **Brasse-Bouillon**, ainsi que les standards appliqués pour assurer une **sécurisation optimale des accès utilisateurs**.

📌 **Documents de référence :**

- **`security_architecture.md`** : Vue d’ensemble des mesures de sécurité.
- **`session_management.md`** : Gestion des sessions et des tokens.
- **`access_control.md`** : RBAC et gestion des permissions.
- **`api_interactions.md`** : Endpoints API pour l’authentification.
- **`security_standards.md`** : Conformité aux standards de cybersécurité.

---

## 2. Méthodes d’Authentification Utilisées

📌 **Comparaison des différentes méthodes d’authentification mises en place dans Brasse-Bouillon :**

| Méthode | Description | Sécurité |
|---------|------------|----------|
| **JWT (JSON Web Token)** | Authentification stateless via tokens signés | Protégé par signature HMAC ou RSA |
| **OAuth 2.0** | Authentification tierce sécurisée (Google, GitHub) | Gestion sécurisée des permissions |
| **2FA (Authentification à Deux Facteurs)** | Vérification supplémentaire via OTP | Renforce la sécurité des connexions |
| **RBAC (Role-Based Access Control)** | Gestion des accès en fonction des rôles | Minimise les permissions inutiles |
| **Session-Based Authentication** | Stockage des sessions côté serveur | Sécurisé avec cookies HttpOnly |

---

## 3. Implémentation Technique des Méthodes d'Authentification

### 🔹 **Authentification JWT** (Principale méthode utilisée)

- **Génération d'un token JWT après authentification réussie.**
- **Expiration courte (15-30 min) et Refresh Token stocké côté serveur.**
- **Utilisation de `jsonwebtoken` pour signer et vérifier les tokens.**

```javascript
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: "15m",
    });
};
```

📌 **Protection contre les attaques :**

- Stockage du token en **HttpOnly Cookie** pour éviter les attaques XSS.
- Implémentation de **Rate Limiting** pour prévenir les attaques de force brute.
- Vérification des tokens et rafraîchissement sécurisé.

---

### 🔹 **Authentification OAuth 2.0 (Google, GitHub)**

- Permet aux utilisateurs de se connecter avec un **compte externe**.
- Utilisation de **OAuth 2.0 avec Passport.js** pour l’intégration facile.
- Permet d’obtenir un **token sécurisé sans stocker de mot de passe côté serveur**.

```javascript
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/callback",
        },
        (accessToken, refreshToken, profile, done) => {
            return done(null, profile);
        }
    )
);
```

📌 **Avantages :**

- Évite la gestion des mots de passe.
- Protection contre les attaques de credential stuffing.
- Compatible avec **Google, GitHub, Facebook**.

---

### 🔹 **Authentification à Deux Facteurs (2FA)**

- Envoi d’un **code OTP** par e-mail ou SMS pour renforcer la sécurité.
- Vérification du code avant d’autoriser la connexion.
- Implémentation avec **Speakeasy** (OTP basé sur le temps).

```javascript
const speakeasy = require("speakeasy");

const generateOTP = () => {
    return speakeasy.totp({
        secret: process.env.OTP_SECRET,
        encoding: "base32",
    });
};
```

📌 **Protection contre les accès non autorisés :**

- Exige un deuxième facteur pour valider l’identité.
- Protège même si les identifiants sont compromis.
- Utilisé pour les actions critiques (modification du mot de passe, suppression de compte).

---

## 4. Sécurisation des API et Gestion des Accès

📌 **Implémentation d’une protection renforcée pour l’API** :

| Mesure | Description |
|--------|------------|
| **HttpOnly Cookies** | Stockage sécurisé des tokens pour éviter le vol via XSS |
| **CSRF Protection** | Utilisation de tokens CSRF pour sécuriser les requêtes |
| **Rate Limiting** | Limitation des tentatives de connexion pour prévenir le bruteforce |
| **RBAC (Role-Based Access Control)** | Gestion des accès selon les permissions utilisateur |

---

## 5. Alignement avec les Standards de Sécurité

📌 **Conformité aux bonnes pratiques de cybersécurité :**

| Standard | Application |
|----------|------------|
| **OWASP Top 10** | Protection contre XSS, CSRF, vol de session |
| **GDPR (RGPD)** | Sécurisation des données personnelles |
| **ISO 27001** | Gestion sécurisée des accès et identités |

---

## 6. Prochaines Étapes

📌 **Améliorations et mises à jour futures :**

- **Ajouter la connexion biométrique pour renforcer la sécurité mobile.**
- **Mettre en place un audit de sécurité sur l’authentification.**
- **Vérifier l’efficacité des protections contre les attaques par vol de session.**

---

## **Conclusion**

L’authentification est un élément clé de la **sécurité des utilisateurs** sur Brasse-Bouillon. L’utilisation de **JWT, OAuth et 2FA** permet de garantir un **équilibre entre sécurité et simplicité d’utilisation**.

