# 🎯 User Personas – Brasse-Bouillon

Ce document présente les profils types d'utilisateurs cibles de l'application Brasse-Bouillon. Chaque persona est conçu pour refléter des attentes, comportements, frustrations et besoins spécifiques, et ainsi guider les choix de conception et d'interface.

**Version** : 2 (2026-04-24) — refonte après debrief personas de la session brainstorms soutenance.

---

## 🗺️ Cartographie des personas

### Rôles utilisateur de l'application

| Role ID (EN, canonical) | Libellé FR (display) | Persona (narrative FR) | Statut v0.1 |
|---|---|---|---|
| `Discovery` | Découverte / Curieuse | **Léa la Curieuse** | ⭐ **Persona primaire de la soutenance** (demo hero) |
| `Novice` | Débutant | **Nicolas le Débutant** | Cible secondaire — servi par Scan + onboarding |
| `Amateur` | Amateur créatif | **Claire l'Amatrice Créative** | Cible secondaire — journal brassage partiel (B-08 v0.2) |
| `EcoResponsible` | Éco-responsable | **Zoé la Brasseuse Éco-responsable** | Cible secondaire — servie par la valorisation des drêches |
| `Expert` | Expert | **Marc le Brasseur Expert** | Vision v0.2 — export CSV possible en bonus |

### Règle de référence — bilingue assumée

Cette fiche personas est volontairement bilingue. Elle porte à la fois le **storytelling** (destiné au jury francophone, au deck ydays, aux supports de communication) et les **identifiants techniques** utilisés dans le code et les tickets.

- **Role IDs (en anglais)** — `Discovery`, `Novice`, `Amateur`, `EcoResponsible`, `Expert` — à utiliser dans les user stories, les user scenarios, les tickets GitHub, les commentaires de code, les constantes TypeScript (`enum UserPersonaRole`). Canoniques et stables.
- **Noms propres (en français)** — Léa, Nicolas, Claire, Zoé, Marc — à utiliser dans la fiche personas ci-dessous, le storytelling soutenance, le deck ydays, les supports de communication. Humanisent les utilisateurs cibles.
- **Libellés FR display** — Découverte, Débutant, Amateur créatif, Éco-responsable, Expert — à utiliser dans l'UI francophone quand un libellé de rôle doit être affiché à l'utilisateur.

Exemples :
- Dans le pitch soutenance (narrative FR) : *"Léa vient de scanner une Punk IPA..."*
- Dans un ticket GitHub (technical EN) : *"As a `Discovery` user, I want to scan a bottle..."*
- Dans le code TypeScript : `UserPersonaRole.Discovery`

---

## ⭐ Persona 1 – Léa la Curieuse 🔍

> **Persona primaire de la soutenance du 2026-05-27.**

### Description

Jeune active urbaine, curieuse, sensible à l'artisanat et à l'expérimentation. Elle vient de goûter une bière originale dans un bar ou chez un ami et se demande *"et si j'essayais d'en brasser une moi-même ?"*. Elle n'a jamais brassé.

### Profil général

- **Âge :** 25–32 ans
- **Situation professionnelle :** Jeune active (communication, design, tech, enseignement, métiers créatifs)
- **Lieu :** Urbain, souvent en colocation ou jeune couple
- **Équipement brassage :** aucun — cuisine équipée standard (grande casserole, thermomètre de cuisine)

### Déclencheur

Une expérience sociale ponctuelle : une bière découverte dans un bar, chez un ami, à un festival, offerte. Elle ne cherchait pas à brasser ; c'est la bière qui l'a interpellée.

### Objectifs

- Comprendre ce qu'est cette bière (style, goût, origine)
- Se demander si elle peut *"en faire quelque chose de similaire"* chez elle
- Faire un premier brassin simple, sans investir dans du matériel coûteux
- Partager l'expérience avec son entourage (le brassin, pas forcément la bière)

### Frustrations

- Les applications existantes exigent qu'on sache déjà ce qu'on cherche (IBU, style, gravité)
- Les termes techniques rebutent au premier contact
- Les forums et communautés brassicoles supposent un niveau minimum
- Difficile de passer de *"j'aime cette bière"* à *"voici comment en brasser une équivalente"*

### Motivations

- Curiosité et envie de découvrir un savoir-faire
- Plaisir de raconter *"j'ai brassé une bière inspirée de celle qu'on a bue ensemble"*
- Culture artisanale / DIY moderne
- Potentiellement : démarche vers une consommation plus consciente

### Canaux utilisés

- Instagram, TikTok (contenus courts découverte)
- Recommandations d'amis
- Bars à bières, festivals brassicoles

### Fonctionnalités clés attendues

Offrir une **porte d'entrée pédagogique** vers le brassage :

- **Scan de bouteille** (code-barres ou photo) — la fonctionnalité hero de la soutenance
- Fiche bière claire, vocabulaire naturel ("amertume marquée" plutôt que "IBU 40")
- Proposition de recettes équivalentes accessibles
- Import direct dans *"Mes Recettes"* avec un parcours simple
- Contenu pédagogique léger (académie) accessible en un geste

---

## 👤 Persona 2 – Nicolas le Débutant 🔎

### Description

Débutant curieux, technophile et motivé, souvent influencé par des amis ou par l'envie de créer quelque chose de tangible à partager. Il a déjà envie de brasser (démarche active), par opposition à Léa qui est attirée par une bière précise.

### Profil général

- **Âge :** 30–35 ans
- **Situation professionnelle :** Jeune actif dans le numérique
- **Lieu :** Zone urbaine, proche de communautés brassicoles ou magasins spécialisés

### Déclencheur

Envie DIY plus générale : *"je veux me lancer dans le brassage maison"*. Moment de vie (confinement, nouveau hobby, cadeau reçu).

### Objectifs

- Réussir son premier brassin sans erreur
- Comprendre les bases du brassage artisanal
- Partager sa création avec ses proches

### Frustrations

- Difficulté à comprendre les termes techniques
- Manque de clarté dans les étapes
- Informations dispersées ou trop complexes

### Motivations

- Expérience DIY enrichissante
- Découverte d'un nouvel univers artisanal
- Fierté de faire soi-même

### Canaux utilisés

- Instagram, blogs vulgarisés, recommandations d'amis

### Fonctionnalités clés attendues

Offrir une expérience accessible et rassurante :

- Tutoriels interactifs et progressifs (v0.2)
- Recettes guidées pas-à-pas
- Liste de courses automatique (panier local depuis la fiche recette)
- Lexique intégré pour vulgariser les termes techniques (Académie Glossaire existant — à promouvoir)

---

## 👩 Persona 3 – Claire l'Amatrice Créative 🍺

### Description

Brasseuse passionnée, créative et méthodique. Elle brasse pour le plaisir, expérimente souvent avec des recettes originales et valorise une interface soignée et intuitive.

### Profil général

- **Âge :** 35–45 ans
- **Situation professionnelle :** Active dans un métier créatif (graphisme, artisanat…)
- **Lieu :** Urbain ou périurbain
- **Équipement brassage :** Kit débutant à intermédiaire (pot 20-30L, fermenteur, densimètre)

### Objectifs

- Tester de nouveaux styles de bière
- Gérer son historique et ses variantes de recettes
- Partager ses créations avec son entourage ou en ligne

### Frustrations

- Applications existantes trop techniques ou austères
- Difficile de retrouver ses versions précédentes
- Peu de recommandations pertinentes

### Motivations

- Développer son style personnel
- Être fière de ses productions
- Créer un lien social autour du brassage

### Canaux utilisés

- Groupes Facebook, ateliers locaux, chaînes YouTube spécialisées

### Fonctionnalités clés attendues

Proposer une interface inspirante et personnalisable :

- Journal de brassage riche et visuel (v0.2 — B-08 Mes Brassins rewrite)
- Suggestions personnalisées (v0.2+ — dépend de la feature Community)
- Interface claire et fluide (présente en v0.1)
- Possibilités de partage communautaire (v0.2+)
- Création d'étiquettes de bouteilles personnalisées (présente en v0.1, à finaliser — B-28 / B-29)

---

## 🌱 Persona 4 – Zoé la Brasseuse Éco-responsable

### Description

Brasseuse amateure engagée dans une démarche de durabilité. Elle a déjà brassé plusieurs fois et veut maintenant réduire l'empreinte de ses pratiques : valoriser ses déchets, choisir des ingrédients locaux, mesurer son impact.

### Profil général

- **Âge :** 28–40 ans
- **Situation professionnelle :** Active dans un métier lié à l'écologie ou la durabilité (consultante développement durable, ingénieure environnement, journaliste éco, métier des filières courtes)
- **Lieu :** Urbain ou rural, souvent avec un potager ou une pratique zéro déchet
- **Équipement brassage :** Kit intermédiaire, souvent récupéré ou acheté d'occasion

### Déclencheur

Prise de conscience progressive : elle brasse depuis 1-2 ans, elle s'interroge sur les 5-7 kg de drêches qu'elle jette à chaque brassin, sur l'origine des malts et houblons, sur l'énergie du brassage.

### Objectifs

- Valoriser les drêches (recettes zéro déchet, compost, alimentation animale)
- Choisir des ingrédients locaux et de saison quand c'est possible
- Mesurer l'impact de ses brassins (empreinte carbone approximative)
- Inspirer son entourage à une pratique plus sobre

### Frustrations

- Les drêches finissent à la poubelle par manque d'idées ou de temps
- Pas de données fiables sur l'impact environnemental du brassage amateur
- Difficile d'identifier les fournisseurs locaux ou responsables
- Les apps brassicoles ignorent complètement cet axe

### Motivations

- Cohérence entre ses valeurs et ses pratiques
- Éducation communautaire (partager ses trouvailles)
- Satisfaction de "fermer la boucle" (du malt à la drêche valorisée)

### Canaux utilisés

- Podcasts et newsletters écologie
- Instagram *green* / zéro déchet
- Communautés locales (AMAP, ressourceries, ateliers de réparation)

### Fonctionnalités clés attendues

Servir la boucle complète du brassage :

- **Valorisation des drêches** — à la fin d'un brassin, un encadré "Tu as X kg de drêches → voici 3 recettes pour les valoriser" (v0.1 — à développer, ~0,5-1j)
- Calcul d'empreinte carbone par brassin (v0.2+)
- Fournisseurs locaux et responsables géolocalisés (v0.2+ — dépend de la feature Boutique)
- Tag "ingrédient local" ou "ingrédient bio" dans le catalogue ingrédients (v0.2+)

---

## 👨‍🔬 Persona 5 – Marc le Brasseur Expert

### Description

Brasseur expérimenté, rigoureux et orienté performance. Il cherche à optimiser ses processus et valorise les outils techniques et les données structurées.

### Profil général

- **Âge :** 45+
- **Situation professionnelle :** Consultant technique ou cadre dans un domaine scientifique
- **Lieu :** Résidence avec espace de brassage dédié

### Objectifs

- Atteindre une régularité parfaite
- Suivre ses métriques de fermentation
- Connecter son matériel (capteurs, thermomètres, balances…)

### Frustrations

- Interfaces trop limitées ou peu techniques
- Absence d'intégrations API / CSV
- Manque de précision ou de personnalisation des outils

### Motivations

- Contrôle total sur chaque variable
- Optimisation du rendement
- Partage avancé de ses brassins auprès de pairs exigeants

### Canaux utilisés

- Reddit, Discord spécialisés, blogs techniques brassicoles

### Fonctionnalités clés attendues

Répondre aux exigences d'un brassage poussé :

- Export CSV des brassins et recettes (v0.1 bonus possible si marge ~0,5j)
- Calculateurs avancés (présents en v0.1 — Outils)
- Intégration avec fichiers CSV et API tierces (v0.2+)
- Courbes de fermentation et historiques de données (v0.2+ — dépend de B-08 Mes Brassins rewrite)
- Export structuré et sauvegarde automatique (v0.2+)
- Intégration IoT / capteurs (v0.3+)

---

## 🎯 Impact sur la conception — priorisation soutenance

La soutenance du **2026-05-27** vise en priorité **Léa la Curieuse** (la fonctionnalité de scan est le *demo hero*). Les autres personas sont servies partiellement ou reportées en version 2 :

| Persona | Fonctionnalités v0.1 (soutenance) | Reste en v0.2+ |
|---|---|---|
| **Léa** (primaire) | Scan + reconnaissance + recettes équivalentes + import "Mes Recettes" | Suggestions communautaires avancées |
| **Nicolas** | Connexion démo + dashboard simplifié + Académie Glossaire existant | Tutoriels interactifs, liste de courses complète |
| **Claire** | Étiquettes + interface fluide + Académie | Journal brassage riche (B-08), suggestions perso, partage communautaire |
| **Zoé** | Valorisation des drêches (bonus à développer ~0,5-1j) | Empreinte carbone, fournisseurs locaux, tags bio |
| **Marc** | Calculateurs avancés existants + Export CSV (bonus si marge) | Courbes fermentation, API / CSV import, IoT |

Cette stratégie respecte le principe **ADR-0001 "Build for today, design for tomorrow"** : chaque gap non comblé est documenté, chaque persona a un chemin clair vers v0.2.

---

## 📝 Historique des versions

- **v2 (2026-04-24)** — Refonte suite au debrief personas. Ajout de Léa la Curieuse (persona primaire soutenance, issue du brainstorm Scan du matin) et de Zoé la Brasseuse Éco-responsable (angle durabilité issu de la dimension écologique du questionnaire Google Forms). Cartographie rôle / persona ajoutée en tête. Admin retiré des personas brasseurs (voir doc séparée pour les rôles opérateurs / back-office).
- **v1 (date antérieure)** — Version initiale à 3 personas (Nicolas, Claire, Marc).
