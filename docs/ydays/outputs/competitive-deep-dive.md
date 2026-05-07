# Analyse concurrentielle approfondie — soutenance 27 mai 2026

**Finalité** : matière pour le bloc 5 (BM + Perspectives) du plan
soutenance et pour la défense des axes différenciants Brasse-Bouillon.
Version slide-ready.

**Sources** : recherche web 2026-04-30 sur 7 concurrents directs et
indirects. URLs en fin de chaque section. Toutes les valeurs financières
sont publiques au moment de l'analyse.

## Périmètre

7 concurrents analysés en deux tiers :

- **Tier 1 — Concurrents directs** : Brewfather, BeerSmith 4, Grainfather, BrewTarget
- **Tier 2 — Concurrents indirects** : Brewer's Friend, Little Bock (FR), Joliebulle (FR)

## Synthèse stratégique

### 5 trouvailles critiques (extractibles slide soutenance)

1. **Quadrant FR-first × mobile-native = totalement vide** parmi les 7 concurrents
   analysés. Brewfather (mobile mais EN-first), Little Bock (FR mais web only),
   Grainfather (multilingue mais hardware-biaisé). Brasse-Bouillon est le seul
   positionné sur l'intersection. **Positionnement structurel, pas tactique.**
2. **Le segment « nouveaux brasseurs » est en chute libre** : -24 pts en 7 ans
   (Brülosophy 2018→2025, de 40 % à 16 % de la communauté). Tous les
   concurrents tech (Brewfather, BeerSmith) se battent pour les experts.
   Brasse-Bouillon est seul positionné sur le segment qui se vide → **fenêtre
   stratégique sur le recrutement de débutants FR**.
3. **Aucun concurrent VC-backed**. Brewfather (1-10 employés bootstrap, AS Norvège),
   BeerSmith (Brad Smith solo USA depuis 2003), Little Bock (Michaël Mucret
   solo FR). Marché trop niche pour le venture capital → **bootstrappable
   confirmé, pas de menace de levée concurrente massive**.
4. **Asymétrie démographique FR vs UK** : 7 % de brasseuses femmes en France
   contre 22 % au UK. **Triple opportunité d'attirer le public féminin** sur le
   segment FR — cohérent avec la mission « tout le monde peut brasser ».
5. **Marché home brewing equipment Europe en forte croissance** : 1,5 → 3,0 Md
   USD à horizon 2033 (CAGR 13,5 %). Conjugué à la légalisation FR 2021 et à
   la chute du recrutement débutant, **fenêtre courte de 3-5 ans pour
   s'installer comme la référence FR-first débutant**.

### 3 axes différenciants Brasse-Bouillon (slide finale soutenance)

- **Axe 1 — Localisation structurelle** : FR × Mobile-native = quadrant vide
- **Axe 2 — Onboarding progressif** : « simple par défaut, expert sur demande »
  vs Equipment Profile imposé partout ailleurs
- **Axe 3 — Souveraineté data EU + RGPD natif** : argument B2B2C face à
  Brewfather (Norvège, hors UE) et BeerSmith (USA)

## A. UX/UI commentée — parcours utilisateur réel

### A.1 — Brewfather (référence internationale, 44 % d'adoption Brülosophy 2024)

**Onboarding** : compte e-mail → tutoriel court → choix unités (Metric / Imperial)
→ atterrissage sur Recipes page → Equipment Profile recommandé (8-12 paramètres
demandés à un débutant qui n'en connaît souvent qu'un ou deux).

**Friction observée** :

- Dashboard vide à l'arrivée, pas de recette de démonstration
- Equipment Profile techniquement obligatoire pour calculs corrects
- Calculs en temps réel inutiles tant que l'Equipment Profile n'est pas fait

**Création de recette** : 10-15 micro-actions minimum pour une recette simple
(Equipment Profile, style BJCP 2021, type, malts, houblons, levure, mash, fermentation).

**État mobile** : iOS + Android natifs + PWA web avec parité fonctionnelle. Sync
cloud temps réel. Mode offline. Verbatim Reddit : *"The UI is stellar and the
flow of the brew day is awesome"*.

### A.2 — BeerSmith 4 (sortie 19 mars 2026)

**Onboarding** : achat / téléchargement Windows ou Mac (binaire desktop, pas
web). Première ouverture : choix critique cloud vs local storage non expliqué
pour un débutant. Pas de tutoriel guidé intégré.

**Friction observée** :

- Courbe d'apprentissage très élevée (assumée par Brad Smith dans la doc)
- Décision cloud/local storage présentée à l'écran de démarrage sans contexte
- App mobile **séparée** du desktop : sync via cloud Gold tier obligatoire
- Pas de PWA, pas de version web native

**État mobile** : iOS 3.0/5 (Apple Store), Android 3.66/5 sur ~1 500 ratings
(Google Play). Verbatim utilisateur : *"clunky slow interface, local search not
working when using nested folders, no export or backup/restore unless using
the cloud"*.

### A.3 — Little Bock (seul concurrent FR-first crédible)

**Onboarding** : compte e-mail web → atterrissage sur dashboard avec recettes
communautaires en vedette (12 783 recettes publiques). Pas de tutoriel guidé.
Possibilité de « forker » une recette de la communauté.

**Friction observée** :

- Site web responsive uniquement — pas de vraie app native, expérience mobile
  = navigateur
- Limitation 3 recettes maximum sur compte gratuit (forte incitation paywall)
- API uniquement pour comptes Premium

**Création de recette** : très linéaire, formulaires français bien traduits.
Suivi de brassin avec calendrier intégré. Connectivité Tilt / Plaato /
iSpindel / Floaty (densimètre WiFi conçu pour Little Bock).

**État mobile** : pas d'app native iOS / Android. Web responsive seulement.
Pas de mode hors-ligne robuste.

## B. Reviews utilisateurs structurées

### B.1 — Brewfather

**Notes** : App Store iOS 4.9/5 (697 reviews) · Google Play ~4.8/5.

| Type | Top 3 |
|---|---|
| **Plaintes** | (1) Support client AI-first décevant ; (2) Précision water profile / pH contestée ; (3) Bibliothèque recettes biaisée hors USA |
| **Louanges** | (1) Sync multi-appareils transparente ; (2) Intégrations IoT larges ; (3) UI moderne + flow brew day fluide |

### B.2 — BeerSmith

**Notes** : iOS Mobile 3.0/5 · Android Mobile 3.66/5 sur ~1 500 ratings.

| Type | Top 3 |
|---|---|
| **Plaintes** | (1) Interface vieillissante (« clunky slow ») ; (2) Verrouillage des données (pas d'export, pas de backup) ; (3) Bugs et crashes mobile récurrents |
| **Louanges** | (1) Profondeur fonctionnelle inégalée ; (2) Communauté installée 22 ans + podcast 346 épisodes ; (3) Calculations professionnelles |

### B.3 — Little Bock

**Notes** : pas de note App Store (pas d'app native). Réputation forums FR
positive mais audience limitée.

| Type | Top 3 |
|---|---|
| **Plaintes** | (1) Limite 3 recettes en gratuit (paywall agressif) ; (2) Pas d'app native ; (3) Communauté réduite vs concurrents internationaux |
| **Louanges** | (1) UI claire et entièrement en français ; (2) Suivi de brassin et calendrier intégrés ; (3) Tarif accessible 1,99 €/mois |

## C. SWOT par concurrent

### C.1 — Brewfather

| Strengths | Weaknesses |
|---|---|
| Leader mondial 44 % adoption (+9 pts en 2 ans) | Support client perçu dégradé (AI-first) |
| UI moderne, multi-plateforme, sync temps réel | Localisation française incomplète |
| Écosystème IoT très large (10+ intégrations) | Bibliothèque recettes biaisée hors USA |
| Affiliate program structuré (180 j fenêtre, 5 ans récurrence) | Précision water/pH contestée par utilisateurs avancés |
| AI Brewing Assistant (Premium Plus) en avance | Tarif Premium 29,99 $/an — barrière débutants |

| Opportunities | Threats |
|---|---|
| Marché européen / francophone non saturé | BeerSmith 4 sortie mars 2026 (refonte SQL + cloud) |
| Demande croissante AI assistants en brassage | Open-source (BrewTarget, Joliebulle) capte la frange technique |
| Intégrations marketplace ingrédients (vacant) | RGPD EU appliqué à un éditeur norvégien hors UE |

### C.2 — BeerSmith

| Strengths | Weaknesses |
|---|---|
| 22 ans d'existence, base installée massive | Interface jugée « clunky » et datée |
| Profondeur fonctionnelle référence | App mobile mal notée (3.0 iOS / 3.66 Android) |
| Notoriété Brad Smith (livre + podcast 346 ép.) | Vendor lock-in (pas d'export, pas de backup) |
| Tier d'entrée bas 19,95 $/an Gold | Pas de PWA / web app — desktop-centric |
| Refonte SQL + cloud en v4 (mars 2026) | Risque de fuite vers Brewfather (mouvement documenté) |

| Opportunities | Threats |
|---|---|
| Capitaliser podcast / YouTube pour rétention | Brewfather grignote 9 pts d'adoption en 2 ans |
| Pro tier B2B brasseries indépendantes | Brewfather AI Assistant en avance |
| Modernisation UI v4 : seconde chance | Open-source (BrewTarget, Joliebulle) sur frange technique |

### C.3 — Little Bock

| Strengths | Weaknesses |
|---|---|
| **Seul outil FR-first crédible** (~36k brasseurs) | Pas d'app native — web responsive seulement |
| Tarif le plus bas du marché (1,99 €/mois) | Limite 3 recettes gratuit — friction conversion |
| Suivi brassin + calendrier + inventaire bien intégrés | Communauté réduite vs concurrents internationaux |
| Capteur IoT propriétaire intégré (Floaty) | Pas d'API en gratuit — bloque l'écosystème tiers |
| Communauté FR engagée (12 783 recettes publiques) | Marketing limité, faible présence YouTube / SEO |

| Opportunities | Threats |
|---|---|
| Marché FR sous-équipé en outils mobile-first | Brewfather pourrait localiser FR sérieusement |
| Légalisation 2021 → afflux nouveaux brasseurs FR | **Brasse-Bouillon — concurrent direct frontal** |
| Partenariats brasseries / fournisseurs FR vacants | Stagnation : pas de croissance audience visible 2023→2025 |

## D. Matrices de positionnement

### D.1 — Matrice Prix × Expertise utilisateur

```
                         EXPERT
                            │
        BeerSmith 4 Pro ────┤────  Brewfather Premium+
        ($49.95/an)         │      ($29.99/an, AI assist)
                            │
                            │      BrewTarget (gratuit)
                            │      Joliebulle (gratuit)
                            │
PRIX ÉLEVÉ ─────────────────┼────────────────── PRIX FAIBLE
                            │
        BeerSmith Basic ────┤────  Little Bock (1.99€/mo)
        ($44.95 one-shot)   │      Brewer's Friend ($25/an)
                            │
                            │      Grainfather (gratuit, hardware-funded)
                            │
                            │   ★ ZONE VIDE Brasse-Bouillon
                            │      FR-first, mobile-native, débutant friendly
                            │
                         DÉBUTANT
```

**Lecture** : la zone « débutant + prix bas + FR-first + mobile-native » est
aujourd'hui un trou de marché. Little Bock occupe le quadrant FR mais en web
responsive, pas mobile-native. Brasse-Bouillon a une fenêtre directe.

### D.2 — Matrice Simplicité × Profondeur fonctionnelle

```
                       PROFONDEUR ÉLEVÉE
                              │
        BeerSmith 4 ──────────┤────────── Brewfather
        (yeast/water/mash     │           (IoT + AI + cloud)
        modèles complets)     │
                              │
                              │           Brewer's Friend
                              │
COMPLEXE ─────────────────────┼───────────────────── SIMPLE
                              │
        BrewTarget ───────────┤────────── Little Bock
        (open-source, dense)  │           (FR, focus brassin)
                              │
                              │           Joliebulle (FR, simple)
                              │
                              │   ★ ZONE VIDE Brasse-Bouillon
                              │      Onboarding progressif
                              │      Simple par défaut, profondeur à la demande
                              │
                       PROFONDEUR FAIBLE
```

**Lecture** : aucun acteur ne combine simplicité d'usage + profondeur révélée
progressivement. Brewfather est puissant mais demande Equipment Profile dès
l'onboarding. Brasse-Bouillon peut introduire le concept « simple par défaut,
expert sur demande ».

### D.3 — Matrice FR-first × Mobile-native

```
                       MOBILE-NATIVE
                              │
                              │   ★ Brasse-Bouillon (cible)
        Brewfather ───────────┤────────── (React Native + Expo)
        (iOS+Android natif)   │
                              │
INTERNATIONAL ────────────────┼──────────────────────── FR-FIRST
                              │
        BeerSmith Mobile ─────┤────────── Little Bock
        (compagnon desktop)   │           (web responsive seulement)
                              │
                              │           Joliebulle
        Brewer's Friend ──────┤────────── (desktop FR)
                              │
                              │           BrewTarget (desktop, FR partiel)
                              │
                       DESKTOP-FIRST
```

**Lecture** : quadrant FR-first × mobile-native = totalement vide.
Brasse-Bouillon est le seul positionné sur ce vecteur. **Différenciation
structurelle.**

## E. Stratégies marketing concurrents

| Concurrent | Canaux principaux | Spécificité |
|---|---|---|
| **Brewfather** | Affiliate program (5 ans récurrence), proxy creators YouTube (David Heath), SEO long-tail, Reddit r/Homebrewing | Multiplicateur via créateurs partenaires |
| **BeerSmith** | Podcast Brad Smith (346 ép. audio + 262 vidéo), livre Amazon, BeerSmithRecipes.com SEO long-tail | Audience legacy + content authority |
| **Little Bock** | Forum BrassageAmateur, partenariats revendeurs FR, blog modeste | SEO et YouTube faibles |
| **Grainfather** | Hardware-funded — software gratuit pour pousser ventes équipement | Modèle hardware-as-distribution |
| **Brewer's Friend** | SEO calculatrices très fort (priming sugar, IBU, ABV) | Top of funnel via outils gratuits |
| **BrewTarget** | Open source, bouche-à-oreille technique Linux/Reddit | Pas de marketing actif |
| **Joliebulle** | Open source 95 % GPL, communauté forum BrassageAmateur | Pas de marketing actif |

## F. Données financières publiques

| Concurrent | Forme juridique | Pays | Année | Employés | Levées | Modèle |
|---|---|---|---|---|---|---|
| **Brewfather** (Warpkode AS) | AS (équivalent SAS) | Norvège (Florø) | 2018 | 1-10 (solo founder) | Aucune | SaaS Premium 29,99 $/an + AI Premium Plus + affiliés |
| **BeerSmith LLC** | LLC | USA (Clifton, VA) | 2003 | 2-10 | Aucune | Subscription 19,95-49,95 $/an + one-shot 44,95 $ + livre + podcast |
| **Little Bock** | Marque déposée Michaël Mucret | France (Montpellier) | ~2014 | 1-5 | Aucune | Freemium 1,99 €/mois |
| **Grainfather** (Bevie Handcraft NZ) | Ltd | Nouvelle-Zélande | 2013 | 50+ groupe | Acquisition Bevie | Hardware-funded |
| **Brewer's Friend** | LLC | USA | 2009 | 1-10 | Aucune | Freemium 25 $/an + ads |
| **BrewTarget** | Open-source GPL | International | 2009 | Bénévoles | N/A | Donations |
| **Joliebulle** | Solo dev open-source 95 % GPL | France | ~2012 | 1 | N/A | Donations |

**Lectures clés** :

- Aucun concurrent VC-backed → marché trop niche pour venture capital
- Confirme un **secteur d'opportunité bootstrappable**
- Brewfather AS hors UE → potentiel argument RGPD pour Brasse-Bouillon SAS française

## G. Tendances marché brassage maison FR (2024-2030)

### G.1 — Taille et croissance

| Indicateur | Valeur 2024 | Projection | Source |
|---|---|---|---|
| Marché européen Beer & Malt Production | 81,4 Md€ | (incl. industriel + craft) | IBISWorld 2026 |
| Marché craft beer France | 4,56 Md USD | 11,13 Md USD en 2033 (CAGR 9,33 %) | IMARC Group |
| Marché home brewing equipment Europe | 1,5 Md USD | 3,0 Md USD 2033 (CAGR 13,5 %) | rapports sectoriels |
| Marché home brewing France | (segment du précédent) | CAGR 8,5 % (2026-2033) | rapports sectoriels |
| Brasseries en France | 2 589 (2024) | 108 fermetures vs 33 ouvertures en 2024 → maturité | Brasseurs de France / Xerfi |

**Croissance secteur bière France** : Xerfi annonce +1 %/an en 2025-2026 vs
+6 %/an moyen 2014-2024 → maturation forte du segment professionnel, mais
le segment amateur reste en croissance car découplé du marché commercial.

### G.2 — Légalisation 2021 et effet COVID

- **Légalisation effective au 1ᵉʳ janvier 2021** via amendement Anne-Laure
  Cattelot (Article 520 bis CGI) : exonération droits d'accise sur bière maison
  non vendue
- Conséquence : passage du brassage amateur de zone grise à activité légale,
  ouverture aux associations, concours, salons (CRAB Rennes, ABAHF, FNABRA
  fédérant ~16 associations)
- Effet COVID : pic d'inscriptions 2020-2022, stabilisation 2023-2024

### G.3 — Démographie brasseurs amateurs

| Critère | États-Unis (AHA) | France (estimé) | UK (YouGov) |
|---|---|---|---|
| Âge moyen | 40-42 ans | 30-50 ans | 55+ (63 %) |
| Tranche principale | 30-49 ans (52-60 %) | 25-44 ans | ≥55 ans |
| Hommes | 98 % | **79 %** | 78 % |
| Femmes | 2 % | **7 %** | 22 % |

**Évolution 2018→2025 (Brülosophy, échantillon ~2 200 répondants en 2024)** :

- Nouveaux brasseurs (≤3 ans) : 40 % → **16 %** (-24 pts)
- Brasseurs intermédiaires (4-9 ans) : stable à 44 %
- Brasseurs expérimentés (≥10 ans) : 16 % → **40 %** (+24 pts)

**Implication directe pour Brasse-Bouillon** : le segment « nouveau brasseur »
est en chute libre sur le marché global. La concurrence se bat pour les
experts. **Brasse-Bouillon a une fenêtre stratégique sur le recrutement de
débutants FR** (onboarding progressif, simplicité par défaut, langue native).

### G.4 — Tendances structurantes 2024-2030

1. RIB (Real Independent Brewers) — segment artisanal indépendant qui résiste
   mieux que les craft consolidées
2. Sustainability & DIY — eau osmosée +14 pts vs 2022 (32 %), fermentation
   sous pression en hausse
3. Mobile-first et IoT démocratisé (Floaty 93 €, Tilt, iSpindel abordables)
4. Vidéo > livre chez les nouveaux brasseurs (YouTube, TikTok, Reels)
5. Décélération clubs locaux, transition vers le digital
6. AI Brewing Assistants émergents (Brewfather Premium Plus 2025)

### G.5 — Perspectives 2026-2030

- Stagnation recrutement débutant si l'écosystème ne propose pas d'outils
  accessibles → **opportunité Brasse-Bouillon**
- Marketplace ingrédients non couvert par les acteurs actuels →
  opportunité B2B2C
- Géolocalisation brasseurs / clubs / fournisseurs FR non couverte
- Conformité RGPD + souveraineté data EU comme argument différenciant face à
  Brewfather (NO) et BeerSmith (US)

## Sources

- [Brewfather Quick Start](https://docs.brewfather.app/getting-started/quick-start)
- [Brewfather App Store](https://apps.apple.com/us/app/brewfather/id1488585822)
- [BeerSmith 4 Release Notes](https://beersmith.com/beersmith-4-release-notes/)
- [BeerSmith 3 Mobile Play Store](https://play.google.com/store/apps/details?id=com.beersmith.beersmith2full)
- [Little Bock Fonctionnalités & Tarifs](https://www.littlebock.fr/fonctionnalites-et-tarifs)
- [Little Bock — fil BrassageAmateur](https://www.brassageamateur.com/forum/viewtopic.php?t=32403)
- [JustUseApp Brewfather reviews](https://justuseapp.com/en/app/1488585822/brewfather/reviews)
- [HomebrewTalk Brewfather thread](https://homebrewtalk.com/threads/brewing-software.701184/)
- [Warpkode AS LinkedIn](https://www.linkedin.com/company/warpkode)
- [BeerSmith Crunchbase](https://www.crunchbase.com/organization/beersmith-457f)
- [Bradley Smith LinkedIn](https://www.linkedin.com/in/beersmith/)
- [Bevie](https://bevie.co/)
- [Little Bock à propos](https://www.littlebock.fr/a-propos)
- [IMARC France Craft Beer](https://www.imarcgroup.com/france-craft-beer-market)
- [IBISWorld France Breweries](https://www.ibisworld.com/france/industry/breweries/680/)
- [Xerfi via Process Alimentaire](https://www.processalimentaire.com/vie-des-iaa/le-syndicat-les-brasseurs-de-france-dresse-un-bilan-2024-juge-preoccupant-pour-le)
- [Brülosophy 2024 Survey](https://brulosophy.com/2024/05/27/2024-general-homebrewer-survey-results/)
- [Brülosophy 2025 Survey](https://brulosophy.com/2025/06/09/2025-general-homebrewer-survey-results/)
- [Légalisation FR 2021 — BièreMasterclass](https://www.bieremasterclass.fr/bientot-la-legalisation-du-brassage-amateur/)
- [FNABRA](http://www.fnabra.org/)
- [Numerama Untappd France](https://www.numerama.com/politique/1645942-untappd-cest-super-si-tu-es-bien-note-lapp-qui-dicte-le-marche-de-la-biere-artisanale-en-france.html)
