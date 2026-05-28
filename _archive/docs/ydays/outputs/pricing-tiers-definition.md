# Définition des paliers tarifaires — soutenance 27 mai 2026

**Finalité** : matière pour le bloc 5 (BM + Perspectives). Concrétise les
hypothèses freemium du
[Business Model Canvas](business-model-canvas.md) en paliers tarifaires
définis. Slide-ready.

**Sources** : analyse personas
([personas-monetization.md](personas-monetization.md)), audit concurrentiel
([competitive-deep-dive.md](competitive-deep-dive.md)), funnel projection
([funnel-projection.md](funnel-projection.md)).

## Principe directeur

> « Pas de paywall agressif sur les fonctions essentielles (scan, recettes
> basiques) »

Le free tier doit être **généreux et complet** pour Léa la Curieuse →
conversion via accumulation et lock-in données positif, pas via frustration.

## Tableau comparatif des 3 paliers

| Feature | Free | Premium 2,99 €/mo | Pro 5,99 €/mo |
|---|---|---|---|
| Scan code-barres | ∞ | ∞ | ∞ |
| Encyclopédie (lecture) | ∞ | ∞ | ∞ |
| Recettes (création) | 5 max | ∞ | ∞ |
| Sessions de brassage | 3 max | ∞ | ∞ |
| Calculs IBU/ABV/SRM de base | ∞ | ∞ | ∞ |
| Tutoriels intra-app | ∞ | ∞ | ∞ |
| Communauté | Lecture | Lecture + écriture | Lecture + écriture |
| Photos | 1 par recette | ∞ | ∞ |
| Journal de fermentation | basique | détaillé | détaillé |
| AI assistant FR | 5-10 requêtes/mois | 50/mois | 500/mois |
| Notifications fermentation intelligentes | ❌ | ✅ | ✅ |
| Calcul empreinte carbone | ❌ | basique | détaillé |
| Recipe versioning | ❌ | basique | avancé |
| Substitution ingrédients | ❌ | ✅ | ✅ |
| Export BeerXML / CSV / JSON | ❌ | ❌ | ✅ |
| Import BeerXML | ❌ | ❌ | ✅ |
| API publique | ❌ | ❌ | ✅ |
| Intégrations IoT (Tilt, iSpindel, Floaty, Plaato) | ❌ | ❌ | ✅ |
| Water chemistry FR avancée | ❌ | ❌ | ✅ |
| Priority support | ❌ | standard | ✅ |
| Beta features early-access | ❌ | ❌ | ✅ |

## Free Tier — « Pour découvrir et débuter »

**Cible** : Léa la Curieuse (50 % du funnel d'actifs).

**Objectif** : permettre une expérience complète qui transforme Léa en
Nicolas (devient brasseur régulier), sans la frustrer ni la forcer à payer.

| Feature | Limite | Justification |
|---|---|---|
| Scan code-barres | ∞ | Différenciateur principal, doit être accessible à tous |
| Encyclopédie bières (lecture) | ∞ | Discovery feature, augmente engagement |
| Recettes (création) | 5 max | Sweet spot vs concurrents (Brewer's Friend 5, Brewfather 25, Little Bock 3) |
| Sessions de brassage | 3 max | Léa fait son 1ᵉʳ brassin, voit le journal, conversion naturelle |
| Calculs IBU / ABV / SRM de base | ∞ | Calculs basiques accessibles (vs concurrents = paywall) |
| Tutoriels intra-app | ∞ | Onboarding ultra-soigné (levier rétention #1) |
| Communauté (read-only) | ∞ | Voir les autres brasseurs = preuve sociale, motivation |
| AI assistant FR | 5-10 requêtes/mois | Vulgarisation Léa, anti-abuse |
| Photos | 1 par recette | Partage limité mais possible |

## Premium Tier — « Pour brasser sérieusement »

**Cible** : Nicolas le Débutant + Zoé Éco + Claire Premium (60 % des payants).

**Prix** : **2,99 €/mois** ou **24,99 €/an** (-30 % discount annuel,
soit ~2,08 €/mois équivalent).

**Features ajoutées vs Free** :

| Feature | Justification |
|---|---|
| Recettes illimitées | Lever la limite Free, lock-in données positif |
| Sessions de brassage illimitées | Cycle naturel du brassage retient (levier #4) |
| Journal de fermentation détaillé | Engagement Nicolas/Claire, données accumulées |
| Communauté (write) | Poster recettes, commenter, ratings — cohésion FR |
| Photos illimitées | Partage Insta, posté communauté |
| AI assistant FR — 50 requêtes/mois | Nicolas/Claire/Zoé use cases |
| Notifications fermentation intelligentes | Rétention via cycle long brassage |
| Calcul empreinte carbone basique | Hook Zoé (durabilité) |
| Recipe versioning basique | « V1, V2, V3 » d'une recette, comparer |
| Substitution ingrédients | Nicolas bloqué sur ingrédient indisponible |

## Pro Tier — « Pour les brasseurs experts »

**Cible** : Marc + Claire Pro (40 % des payants, ARPU élevée, evangelist).

**Prix** : **5,99 €/mois** ou **49,99 €/an** (-30 % discount annuel,
soit ~4,16 €/mois équivalent).

**Features ajoutées vs Premium** :

| Feature | Justification |
|---|---|
| Export BeerXML / CSV / JSON | Marc evangelist, Marc-Switcher migration |
| Import BeerXML | Casser le coût de switch depuis Brewfather (Phase 1 obligatoire) |
| API publique | Marc data-driven, intégrations perso |
| Intégrations IoT (Tilt, iSpindel, Floaty, Plaato) | Marc équipé hardware |
| Water chemistry FR avancée | Profils eau France par région, différenciateur unique |
| AI assistant FR — 500 requêtes/mois | Use cases experts complexes (Sonnet 4.6 / Mistral Large) |
| Recipe versioning avancé | Forks, branches, compare side-by-side |
| Priority support | Réactivité 24-48h promise à Marc evangelist |
| Beta features early-access | Marc aime être en avance sur la communauté |
| Calcul empreinte carbone détaillé | Zoé Pro (rare mais possible) |

## Anti-frustration — features jamais paywall

Pour respecter la valeur « pas de paywall agressif sur les essentiels » :

- ❌ Scan code-barres (toujours gratuit, illimité)
- ❌ Lecture encyclopédie (toujours gratuit, illimité)
- ❌ Calculs basiques IBU/ABV/SRM (toujours gratuit)
- ❌ Tutoriels d'onboarding (toujours gratuit)

Ce sont les leviers de conversion Léa → Nicolas. Les rendre payants tuerait
le funnel.

## 4 leviers stratégiques (validés)

### Levier 1 — Période d'essai

**30 jours Pro gratuit, sans CB.** Standard du marché (aligné Brewfather).
Casse la friction. Suffisant pour faire un brassin complet (3-6 semaines)
et apprécier Pro.

### Levier 2 — Lifetime Deal au lancement

**Lifetime Pro à 99 € pour 100 places** au lancement public sur les stores.

| Effet | Quantification |
|---|---|
| Cash injecté dès J0 | ~9 900 € |
| Evangelists créés | 100 utilisateurs Pro à vie |
| Bouche-à-oreille | Multiplicateur organique fort |
| Risque dilution prix | Limite 100 places mitige |

**Cohérent avec l'effet evangelist Marc identifié dans
[personas-monetization.md](personas-monetization.md).**

### Levier 3 — Migration discount Marc-Switcher

**-50 % Pro 1ère année** pour migration depuis Brewfather/BeerSmith (avec
proof = capture d'écran abonnement actif).

| Détail | Valeur |
|---|---|
| Pro 1ère année avec migration | 24,99 € au lieu de 49,99 € |
| Pro 2ᵉ année et suivantes | 49,99 € (plein tarif) |
| Casse la friction | Coût de switch psychologique levé |

Sans tuer la marge à long terme.

### Levier 4 — Niveau de discount annuel

**30 % discount sur les deux paliers payants.**

| Discount annuel | Prix Premium effectif | Prix Pro effectif | Conversion vers annuel attendue |
|---|---|---|---|
| 17 % (mainstream) | 30 €/an = 2,50 €/mo | 60 €/an = 5 €/mo | ~50 % |
| **30 % (retenu)** | **25 €/an = 2,08 €/mo** | **50 €/an = 4,17 €/mo** | **~70 %** |
| 50 % (agressif) | 18 €/an = 1,50 €/mo | 36 €/an = 3 €/mo | ~85 % |

**Sweet spot** : conversion sans tuer la marge mensuelle. Cohérent avec
Brewfather (~30 %).

## Cohérence avec le mix funnel

| Persona | Tier choisi | % payants | ARPU |
|---|---|---|---|
| Nicolas | Premium 2,99 € | 60 % | 3 € |
| Claire | Premium → Pro | 25 % | 3-5 € |
| Zoé | Premium 2,99-3,99 € | 5 % | 3,50 € |
| Marc | Pro 5,99 € | 10 % | 8 € |

**ARPU blendé** : ~4,75 €/mois → **MRR cible Année 3 = 1 000 × 4,75 € =
~4 800 €/mois** = ~57 K€/an brut.

## Synthèse pour défense soutenance

3 messages clés extractibles slide :

1. **3 paliers clairs** : Free généreux pour Léa, Premium 2,99 €/mois pour
   Nicolas/Zoé/Claire débutant, Pro 5,99 €/mois pour Marc/Claire confirmée.
2. **4 leviers stratégiques amplificateurs** : trial 30 jours Pro (casse
   friction), lifetime 99 € × 100 (seed financier + 100 evangelists),
   migration -50 % (capture Marc-Switcher), discount annuel 30 % (push annuel).
3. **Anti-frustration documentée** : scan, encyclopédie lecture, calculs
   basiques, tutoriels = jamais paywall. Cohérent avec mission « tout le monde
   peut brasser ».
