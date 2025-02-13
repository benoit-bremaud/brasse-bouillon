# **Matrice de Validation - Titre Professionnel CDA**

---

## **Bloc 1 : Développer des interfaces utilisateur**

### **1. Développer des interfaces ergonomiques**

#### Critères

- [ ] Interface conforme au dossier de conception (Essentiel).  
- [ ] Navigation fluide et intuitive (Essentiel).  
- [ ] Adaptation à toutes les tailles et types de supports (Essentiel).  
  - Métrique : L’application s’affiche correctement sur desktop, tablette et mobile.  
- [ ] Respect de la charte graphique du projet (Recommandé).  
- [ ] Tests d’ergonomie validés auprès d’utilisateurs cibles (Recommandé).  

**Avancement global :** 3/5 critères validés (60%).

---

### **2. Tester et documenter**

#### Critères

- [ ] Jeux d’essai complets et reproductibles disponibles (Essentiel).  
- [ ] Tests unitaires couvrant au moins 90% des composants UI (Essentiel).  
- [ ] Documentation claire des interfaces, en anglais si nécessaire (Recommandé).  
- [ ] Rapport de tests avec logs disponibles (Essentiel).  
- [ ] Système de veille technologique mis en place (Optionnel).  

**Avancement global :** 4/5 critères validés (80%).

---

### **3. Respecter la sécurité et la confidentialité**

#### Critères

- [ ] Validation de toutes les entrées utilisateur (Essentiel).  
- [ ] Gestion des erreurs et exceptions implémentée (Essentiel).  
- [ ] Protection contre les failles XSS et CSRF (Essentiel).  
- [ ] Conformité avec le RGPD (mentions légales intégrées) (Essentiel).  

**Avancement global :** 4/4 critères validés (100%).

---

### **4. Respecter les normes d'accessibilité**

#### Critères

- [ ] Interfaces conformes aux normes RGAA et WCAG (Essentiel).  
- [ ] Tests réussis avec des outils comme axe DevTools ou VoiceOver (Recommandé).  
- [ ] Fonctionnement fluide avec un clavier et un lecteur d’écran (Essentiel).  
- [ ] Retours d’utilisateurs en situation de handicap pris en compte (Recommandé).  

**Avancement global :** 3/4 critères validés (75%).

---

### Conseils pratiques

- Testez l’accessibilité avec axe DevTools ou VoiceOver.
- Vérifiez la navigation clavier et les interactions sans souris.
- Documentez vos tests avec Jest ou React Testing Library.

---

## **Bloc 2 : Concevoir et développer la partie backend**

### **1. Concevoir une architecture backend**

#### Critères

- [ ] Architecture en couches bien définie et documentée (Essentiel).  
- [ ] Frameworks et ORM adaptés (TypeORM, Sequelize, etc.) (Essentiel).  
- [ ] Respect des principes REST ou GraphQL (Essentiel).  
- [ ] Diagrammes de l’architecture validés par le responsable technique (Recommandé).  

**Avancement global :** 3/4 critères validés (75%).

---

### **2. Développer des APIs sécurisées**

#### Critères

- [ ] Endpoints CRUD fonctionnels et sécurisés (Essentiel).  
  - Métrique : Temps de réponse des endpoints < 200ms.  
- [ ] Gestion des erreurs et exceptions mise en place (Essentiel).  
- [ ] Protection contre XSS, CSRF, et injections SQL (Essentiel).  
- [ ] Logs d’erreurs et d’accès disponibles (Recommandé).  

**Avancement global :** 3/4 critères validés (75%).

---

### **3. Mettre en place une base de données relationnelle**

#### Critères

- [ ] Schéma entité-association respecté et validé (Essentiel).  
- [ ] Scripts de création et de migration fonctionnels (Essentiel).  
- [ ] Jeux d’essai réalistes disponibles dans un environnement de test (Recommandé).  
- [ ] Sécurisation des données assurée (chiffrement, politique d’accès) (Essentiel).  

**Avancement global :** 4/4 critères validés (100%).

---

### **4. Tester et optimiser le backend**

#### Critères

- [ ] Tests fonctionnels automatisés réalisés avec succès (Essentiel).  
- [ ] Couverture de tests ≥ 90% (Essentiel).  
- [ ] Optimisation des performances via caches ou index (Redis, etc.) (Recommandé).  
- [ ] Rapports de tests clairs et disponibles (Essentiel).  

**Avancement global :** 3/4 critères validés (75%).

---

### Conseils pratiques

- Utilisez Swagger ou Postman pour documenter les endpoints.
- Implémentez les tests de sécurité avec OWASP Checklist.

---

## **Bloc 3 : Préparer le déploiement d’une application sécurisée**

### **1. Préparer un plan de tests complet**

#### Critères

- [ ] Plan de tests couvrant toutes les fonctionnalités (Essentiel).  
- [ ] Environnement de test configuré avec des données réalistes (Recommandé).  
- [ ] Jeux d’essai reproductibles disponibles (Essentiel).  
- [ ] Résultats attendus clairement documentés (Recommandé).  
- [ ] Logs de tests accessibles et lisibles (Essentiel).  

**Avancement global :** 4/5 critères validés (80%).

---

### **2. Automatiser les processus DevOps**

#### Critères

- [ ] Scripts CI/CD fonctionnels et bien documentés (YAML, Docker Compose, etc.) (Essentiel).  
- [ ] Automatisation des tests réussie (unitaires, qualité de code, sécurité) (Essentiel).  
- [ ] Livrables générés automatiquement sans erreur (Essentiel).  
- [ ] Analyse des rapports automatisés réalisée (Recommandé).  

**Avancement global :** 3/4 critères validés (75%).

---

### **3. Documenter le processus de déploiement**

#### Critères

- [ ] Procédure de déploiement détaillée et claire (Essentiel).  
- [ ] Documentation des scripts (installation, migration, configuration) (Essentiel).  
- [ ] Instructions pour les environnements (test, pré-production, production) (Essentiel).  

**Avancement global :** 3/3 critères validés (100%).

---

## **Bloc 4 : Travailler en mode projet**

### **1. Planifier et organiser un projet**

#### Critères

- [ ] Backlog structuré et priorisé (Essentiel).  
- [ ] Roadmap détaillée et accessible (Essentiel).  
- [ ] Objectifs clairs et mesurables (Essentiel).  

**Avancement global :** 3/3 critères validés (100%).

---

### **2. Collaborer efficacement**

#### Critères

- [ ] Participation active aux cérémonies agiles (scrum, rétrospectives) (Essentiel).  
- [ ] Utilisation d’outils de gestion et de communication collaboratifs (Essentiel).  
- [ ] Historique des décisions et modifications à jour (Recommandé).  

**Avancement global :** 3/3 critères validés (100%).

---

## **Bloc 5 : Soutenance et présentation des livrables**

### **1. Présenter le projet**

#### Critères

- [ ] Diaporama synthétique et structuré (Essentiel).  
- [ ] Présentation orale fluide et pertinente (Essentiel).  

### **2. Répondre aux questions du jury**

#### Critères

- [ ] Justification des choix techniques et méthodologiques (Essentiel).  
- [ ] Réponses structurées aux questions (Recommandé).  
