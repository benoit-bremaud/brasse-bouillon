# Leviers de rétention et fidélisation — soutenance 27 mai 2026

**Finalité** : matière pour le bloc 5 (BM + Perspectives) et défense de la
viabilité long terme du modèle. Identifie les leviers qui transforment 1 000
téléchargements en 1 000 utilisateurs payants conservés sur la durée.

**Sources** : audit concurrentiel
([competitive-deep-dive.md](competitive-deep-dive.md)), benchmarks B2C
subscription 2026, monétisation par persona
([personas-monetization.md](personas-monetization.md)).

## Constats des concurrents

| Concurrent | Mécanisme de rétention principal |
|---|---|
| **Brewfather** | Data lock-in (export rare), intégrations IoT setup, AI assistant Plus |
| **BeerSmith** | 22 ans d'investissement utilisateur, podcast/livre auteur, lock-in données |
| **Little Bock** | Communauté visible mais peu d'engagement, pas de gamification |
| **BrewTarget** | Open source, base technique fidèle Linux/Reddit |

**Lecture** : la rétention dans cette niche se construit sur la **durée
d'usage** et le **lock-in données**, pas sur la gamification ou les
notifications agressives. Le brassage = passion durable.

## Les 10 leviers de rétention identifiés

| # | Levier | Mécanisme | Effort dev | Impact rétention |
|---|---|---|---|---|
| 1 | **Onboarding ultra-soigné** | Première semaine = +30 % rétention selon benchmarks B2C 2026 | Moyen | ⭐⭐⭐ |
| 2 | **Lock-in données positif** | Recettes accumulées + journal = ne veut pas perdre l'historique | Faible (vient naturellement) | ⭐⭐⭐ |
| 3 | **Communauté FR vivante** | Voir d'autres brasseurs = se sentir membre, motivation sociale | Élevé (modération + features social) | ⭐⭐⭐ |
| 4 | **Brassage = process retentif naturellement** | 3-6 semaines/brassin = check-ins réguliers obligés (timer fermentation, embouteillage) | Faible | ⭐⭐⭐ |
| 5 | **Encyclopédie qui s'enrichit en continu** | Nouvelles bières scannées chaque mois = raison de revenir | Moyen | ⭐⭐ |
| 6 | **Notifications intelligentes** | « Ta fermentation est-elle stable ? », « C'est l'heure d'embouteiller » | Moyen | ⭐⭐ |
| 7 | **Newsletter mensuelle de qualité** | Tendances brassage FR, nouveautés app, ingrédient du mois | Moyen (rédaction) | ⭐⭐ |
| 8 | **Streaks / achievements légers** | « 3 brassins consécutifs réussis », « 10 recettes différentes » | Faible | ⭐ |
| 9 | **Personnalisation IA** | App apprend tes goûts, suggère des recettes ciblées | Élevé | ⭐⭐⭐ |
| 10 | **Calendrier brassage personnel** | Vue annuelle de tes brassins prévus + saisonnalité ingrédients | Moyen | ⭐⭐ |

## Top 5 retenus pour Brasse-Bouillon

### Phase 1-3 produit (à mettre en place tôt)

#### Levier 1 — Onboarding ultra-soigné

**Mécanisme** : la première semaine d'usage détermine ~30 % de la rétention
12 mois selon benchmarks B2C 2026.

**Implémentation Brasse-Bouillon** :

- Première recette guidée pas à pas (Léa la Curieuse)
- Vulgarisation des termes brassicoles (IBU, ABV, SRM expliqués au survol)
- Zéro Equipment Profile imposé (vs Brewfather)
- Tutoriels vidéo intra-app FR
- Email de bienvenue + relance J+3 si inactif

**Coût dev** : moyen (~3-5 jours dev)

#### Levier 2 — Lock-in données positif

**Mécanisme** : plus l'utilisateur accumule de recettes, sessions, photos
dans l'app, plus il est attaché et reluctant à quitter (peur de perdre
l'historique).

**Implémentation Brasse-Bouillon** :

- Recettes illimitées dès Premium
- Journal de fermentation détaillé conservé indéfiniment
- Photos par recette
- Export BeerXML dispo en Pro pour rassurer (anti-vendor-lock-in
  philosophy = paradoxalement augmente la confiance et la rétention)

**Coût dev** : faible (vient naturellement avec le produit)

#### Levier 3 — Cycle naturel brassage

**Mécanisme** : un brassin dure 3-6 semaines (mash → embouteillage →
consommation). Le suivi du cycle force naturellement des check-ins
réguliers (mesures densité, observations fermentation, planning
embouteillage).

**Implémentation Brasse-Bouillon** :

- Notifications fermentation intelligentes (Premium)
- Calendrier de brassin avec alertes
- Journal de fermentation visuel
- Timer brew day intégré

**Coût dev** : faible (déjà cœur produit)

### Phase 4-5 produit (amplificateurs long terme)

#### Levier 4 — Communauté FR vivante

**Mécanisme** : voir d'autres brasseurs FR poster recettes, commenter,
partager photos crée un sentiment d'appartenance qui pousse à rester actif.

**Implémentation Brasse-Bouillon** :

- Recettes publiques partageables (Premium write)
- Ratings et commentaires
- Profils brasseur publics
- Modération communautaire FR
- Concours mensuels (style du mois, recette du mois)

**Coût dev** : élevé (community features + modération)

#### Levier 5 — Personnalisation IA

**Mécanisme** : l'app apprend les goûts, le matériel, l'expérience de
l'utilisateur et propose des recettes / améliorations sur mesure.

**Implémentation Brasse-Bouillon** :

- AI assistant FR (Mistral / Claude) — Pro tier
- Suggestions de recettes basées sur historique
- Diagnostic fermentation contextualisé
- Water chemistry adaptée aux profils eau France

**Coût dev** : élevé (intégration AI + entrainement prompts)

→ Voir [ai-strategy.md](ai-strategy.md) pour le détail.

## Anti-patterns à éviter

### À éviter en Phase 1-3

| Anti-pattern | Pourquoi éviter |
|---|---|
| **Gamification poussée** | Risque de casser le ton « mentor brassicole sérieux ». Brassage est un loisir d'adultes, pas une cible Duolingo |
| **Notifications mal calibrées** | Risque de pénibilité (cf. plaintes Brewfather sur AI support intrusif) |
| **Email marketing fréquent** | Le brasseur consciencieux veut de la qualité, pas du spam |
| **Pubs in-app** | Ligne rouge utilisateur, à étudier seulement si rentabilité critique |
| **Paywall agressif sur essentiels** | Tue le funnel Léa → Nicolas |

### À éviter en Phase 4-5

| Anti-pattern | Pourquoi éviter |
|---|---|
| **Personnalisation invasive** | RGPD-strict + valeurs utilisateur (pas de revente data) |
| **Intégrations partenariales biaisées** | Indépendance éditoriale = ligne rouge |
| **Premium « inflation » de features** | Risque de complexifier le tier sans réelle valeur |

## Cohérence avec le funnel

Les 5 leviers retenus servent les 4 personas payants différemment :

| Persona | Levier dominant | Effet attendu |
|---|---|---|
| Nicolas | Onboarding + Cycle naturel | Conversion Free → Premium + retention 18 mois |
| Claire | Lock-in données + Communauté | Upgrade Premium → Pro + retention 36 mois |
| Zoé | Communauté + Newsletter | Engagement valeurs alignées + retention 24 mois |
| Marc | Personnalisation IA + Lock-in | Retention 48-60 mois + effet evangelist |

## Synthèse pour défense soutenance

3 messages clés extractibles slide :

1. **5 leviers priorisés** (onboarding, lock-in, cycle brassage, communauté
   FR, IA personnalisation), 3 en Phase 1-3 + 2 en Phase 4-5.
2. **Le brassage est intrinsèquement retentif** (cycle 3-6 semaines = engagement
   forcé). C'est un avantage structurel rare en B2C.
3. **Anti-patterns documentés** (gamification, notifications agressives,
   personnalisation invasive) = on évite les pièges des concurrents
   anglo-saxons et on tient nos valeurs utilisateur.
