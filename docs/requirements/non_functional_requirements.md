# 📌 **Exigences Non Fonctionnelles - Brasse-Bouillon**  

## **📌 Introduction**  

Les **exigences non fonctionnelles** définissent les **critères de qualité** du projet **Brasse-Bouillon**, garantissant une application **performante, sécurisée et évolutive**.  

📌 **Catégories couvertes dans ce document :**  
1️⃣ **Performance et Scalabilité**  
2️⃣ **Sécurité et Protection des Données**  
3️⃣ **Disponibilité et Fiabilité**  
4️⃣ **Compatibilité et Accessibilité**  
5️⃣ **Maintenabilité et Évolutivité**  

---

## **⚡ 1️⃣ Performance et Scalabilité**

📌 **Objectif :** Garantir une application fluide et scalable.  

✅ **Le backend doit supporter un grand nombre de requêtes simultanées** (scalabilité horizontale).  
✅ **Mise en place de caching avec Redis** pour réduire la charge des requêtes SQL répétées.  
✅ **Utilisation de WebSockets/MQTT** pour la communication en temps réel avec les capteurs IoT.  
✅ **Pagination et lazy loading** pour éviter le chargement de grandes quantités de données en une seule requête.  

📌 **Exemple d’optimisation :**  

```sql
CREATE INDEX idx_users_email ON users(email);
```

---

## **🔒 2️⃣ Sécurité et Protection des Données**

📌 **Objectif :** Protéger les données des utilisateurs et sécuriser les échanges API.  

✅ **Authentification via JWT** avec expiration des tokens.  
✅ **Chiffrement des mots de passe avec `bcrypt.js`** avant stockage.  
✅ **Limitation des requêtes (`express-rate-limit`)** pour éviter les attaques par force brute.  
✅ **Mise en place du `HTTPS` pour toutes les communications.**  
✅ **Protection des API avec OAuth 2.0** pour les intégrations tierces.  

📌 **Exemple de middleware JWT :**  

```javascript
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Accès refusé" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(403).json({ message: "Token invalide" });
    }
};
```

---

## **🟢 3️⃣ Disponibilité et Fiabilité**

📌 **Objectif :** Garantir une **disponibilité élevée** du service avec une **gestion des pannes efficace**.  

✅ **Déploiement multi-instance avec `PM2` et `NGINX`** pour gérer la charge.  
✅ **Monitoring des logs avec `Winston` et `PM2 logs`**.  
✅ **Base de données répliquée (HA PostgreSQL)** pour éviter les pertes de données.  
✅ **Backup automatique des données tous les jours**.  

📌 **Exemple de configuration `PM2` pour gérer plusieurs instances :**  

```bash
pm2 start server.js -i max  # Démarrer plusieurs instances
pm2 monit  # Afficher les logs en temps réel
```

---

## **🖥️ 4️⃣ Compatibilité et Accessibilité**

📌 **Objectif :** Assurer la **compatibilité multiplateforme** et rendre l’application accessible à tous.  

✅ **Le backend doit être compatible avec React Native et tout autre client Web.**  
✅ **Support des formats de données standards (`JSON`, `CSV`) pour export.**  
✅ **Respect des normes d’accessibilité (`ARIA`, `WCAG`) côté frontend.**  
✅ **Tests multi-navigateurs et multi-plateformes.**  

📌 **Gestion du CORS pour autoriser l’accès aux API depuis plusieurs plateformes :**  

```javascript
const cors = require("cors");
app.use(cors({ origin: "https://brasse-bouillon.com" }));
```

---

## **🔧 5️⃣ Maintenabilité et Évolutivité**

📌 **Objectif :** Faciliter la maintenance et l’évolution du projet à long terme.  

✅ **Documentation complète du code et des API (`Swagger`, `README.md`).**  
✅ **Utilisation de `Docker` pour un déploiement facile.**  
✅ **Mise en place de tests unitaires et d’intégration (`Jest`, `Supertest`).**  
✅ **Séparation des responsabilités (`MVC`, `services`, `routes`).**  

📌 **Exemple de test API avec `Supertest` :**  

```javascript
const request = require("supertest");
const app = require("../server");

test("GET /recipes - Récupération des recettes", async () => {
    const res = await request(app).get("/recipes");
    expect(res.statusCode).toBe(200);
});
```
