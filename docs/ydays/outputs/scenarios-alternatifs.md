# Scénarios alternatifs — Atelier D Phase 5 modèle économique

**Finalité** : matière exhaustive pour le bloc 5 (BM + Perspectives) du
plan soutenance. Modélise 3 scénarios financiers sur 5 ans (conservateur,
médian, agressif), 4 stress tests (chocs externes), une matrice de risques
et des plans B/C explicites pour démontrer la robustesse du modèle face à
la volatilité des hypothèses.

**Sources** : [funnel-projection.md](funnel-projection.md) (modèle de base),
[financial-projections.md](financial-projections.md) (OPEX/revenus),
[kpi-details.md](kpi-details.md) (triggers KPIs),
[competitive-deep-dive.md](competitive-deep-dive.md) (menaces concurrentielles).

## Méthodologie scénarios

### Pourquoi modéliser 3 scénarios

Aucun jury n'accepte un business model qui prédit avec certitude
« 1 000 payants Année 3 ». La réalité est volatile. Les 3 scénarios
démontrent :

1. **Le modèle tient même en scénario conservateur** (pas de faillite)
2. **Tu sais quels leviers actionner** si la réalité dérape
3. **Le scénario agressif n'est pas absurde** (pas de sous-estimation pour faire bonne figure)

### Variables clés modélisées

| Variable | Conservateur (-20 %) | Médian (hypothèse) | Agressif (+20 %) |
|---|---|---|---|
| Téléchargements 3 ans | 40 000 | 50 000 | 60 000 |
| Conversion Free → Paid | 8 % | 10 % | 12 % |
| Mix Pro % | 20 % | 25 % | 30 % |
| ARPU mensuel | 4 € | 4,75 € | 5,50 € |
| Effet evangelist Marc | ×4-6 | ×7,5 | ×10-12 |
| Retention 12 mois Premium | 65 % | 75 % | 85 % |

### Lecture de la matrice

| Couleur | Sens |
|---|---|
| 🟢 Vert | Cible atteinte, marge confortable, scale-up envisageable |
| 🟡 Jaune | Cible non atteinte mais survie OK, ajustements nécessaires |
| 🔴 Rouge | Sous le seuil de viabilité, plan B obligatoire |

## Scénario Conservateur (-20 % sur tous leviers)

### Hypothèses détaillées

| Hypothèse | Valeur conservatrice | Justification |
|---|---|---|
| Téléchargements 3 ans cumulés | 40 000 | Audience YouTubers limitée, organic plus lent qu'attendu |
| Activation rate (1ᵉʳ brassin) | 25 % | Friction onboarding plus forte qu'attendu |
| Conversion Free → Paid | 8 % | Concurrent Little Bock défend mieux son territoire FR |
| Mix Pro / Premium | 20 % / 80 % | Marc-Switcher conversion plus difficile (Brewfather UI v4 améliore) |
| ARPU blendé | 4 € | Pricing pression à la baisse, Premium dominant |
| Retention 12 mois | 65 % (Premium) / 85 % (Pro) | Churn plus élevé que prévu |
| Effet evangelist | ×4-6 | Communauté plus lente à se constituer |

### Funnel modélisé conservateur

| Étape | Volume |
|---|---|
| Téléchargements totaux | 40 000 |
| Actifs mensuels (30 %) | 12 000 |
| Free réguliers (50 %) | 6 000 |
| Premium payants (8 %) | 480 |
| Pro upgraders (20 %) | 96 |
| **Total payants Y3** | **~640** |

### Revenue projection conservateur

| Année | Payants | ARPU | MRR brut | Revenu brut/an | OPEX | **Net mensuel** |
|---|---|---|---|---|---|---|
| Y1 | ~150 | 4 € | 600 € | ~7 K€ + 9,9 K€ lifetime | 3,5 K€ | ~1 050 €/mois 🟡 |
| Y2 | ~400 | 4 € | 1 600 € | ~19 K€ | 8 K€ | ~900 €/mois 🟡 |
| Y3 | ~640 | 4 € | 2 560 € | ~31 K€ | 16 K€ | ~1 250 €/mois 🟡 |
| Y4 | ~900 | 4 € | 3 600 € | ~43 K€ | 25 K€ | ~1 500 €/mois 🟡 |
| Y5 | ~1 200 | 4,50 € | 5 400 € | ~65 K€ | 36 K€ | ~2 400 €/mois 🟡 |

### Verdict scénario conservateur

🟡 **Survie OK avec freelance d'appoint** mais sous la cible « vivre de l'app »
sur 5 ans.

- BB seul : ~2 400 €/mois Y5 (sous cible 3 500 €)
- Cumul avec agence web (~1 000-1 500 €/mois) = ~3 400-3 900 €/mois
- **Cible « vivre de l'app » atteinte uniquement avec le revenu agence cumulé**

### Plan d'action si scénario conservateur

| Action | Quand | Effet attendu |
|---|---|---|
| Maintenir agence web freelance plus longtemps (jusqu'à Y5) | En continu | Couvre le gap revenu |
| Accélérer outreach YouTubers + influenceurs FR | Dès Y2 | Booster les téléchargements |
| Repenser onboarding pour augmenter activation | Y1 → Y2 | Activation rate de 25 % à 35 % |
| Étendre features Pro pour augmenter ARPU | Y2 → Y3 | ARPU de 4 € à 4,50 € |
| **Garder le statut JEI activement** | Y3+ | Économies ~6-8 K€/an irrévocables |

## Scénario Médian (hypothèse de base)

### Synthèse rapide

Voir [financial-projections.md](financial-projections.md) pour le détail
complet. Récap :

| Année | Payants | MRR | Revenu/an | Net/mois |
|---|---|---|---|---|
| Y1 | 250 | 1 100 € | 14 K€ + 9,9 K€ lifetime | 1 700 € 🟡 |
| Y2 | 600 | 2 700 € | 32 K€ | 2 000 € 🟡 |
| **Y3 (cible)** | **1 000** | **4 800 €** | **57 K€** | **3 400 € 🟢** |
| Y5 | 1 800 | 9 000 € | 108 K€ | 6 000 € 🟢 |

### Comment savoir qu'on est dans le scénario médian

| Indicateur | Valeur typique scénario médian |
|---|---|
| Téléchargements/mois Y2 | ~1 200/mois |
| Conversion Free → Paid Y2 | ~7-8 % |
| Mix Pro Y2 | ~22-25 % |
| Churn mensuel Y2 | ~3-4 % |
| NPS Y2 | ~30-35 |

Si tous ces indicateurs sont dans la fourchette, **scénario médian
confirmé**, on continue la trajectoire.

## Scénario Agressif (+20 % sur tous leviers)

### Hypothèses détaillées

| Hypothèse | Valeur agressive | Justification |
|---|---|---|
| Téléchargements 3 ans cumulés | 60 000 | Effet YouTubers maximal, viralité TikTok/Reels, presse FR |
| Activation rate | 45 % | Onboarding ultra-soigné + AI assistant FR différenciant |
| Conversion Free → Paid | 12 % | Free tier bien calibré, Premium attractif |
| Mix Pro / Premium | 30 % / 70 % | Marc-Switcher conversion forte (-50 % migration discount très efficace) |
| ARPU blendé | 5,50 € | Mix Pro fort + features premium denses |
| Retention 12 mois | 85 % (Premium) / 95 % (Pro) | Lock-in données et communauté FR très efficaces |
| Effet evangelist | ×10-12 | Audience FR engagée, créateurs YouTubers actifs |

### Funnel modélisé agressif

| Étape | Volume |
|---|---|
| Téléchargements totaux | 60 000 |
| Actifs mensuels (40 %) | 24 000 |
| Free réguliers (50 %) | 12 000 |
| Premium payants (12 %) | 1 440 |
| Pro upgraders (30 %) | 432 |
| **Total payants Y3** | **~1 440** |

### Revenue projection agressif

| Année | Payants | ARPU | MRR brut | Revenu brut/an | OPEX | **Net mensuel** |
|---|---|---|---|---|---|---|
| Y1 | ~400 | 5 € | 2 000 € | ~24 K€ + 9,9 K€ lifetime | 4 K€ | ~2 500 €/mois 🟢 |
| Y2 | ~900 | 5 € | 4 500 € | ~54 K€ | 10 K€ | ~3 700 €/mois 🟢 |
| Y3 | ~1 440 | 5,50 € | 7 920 € | ~95 K€ | 20 K€ | ~6 250 €/mois 🟢 |
| Y4 | ~2 000 | 5,50 € | 11 000 € | ~132 K€ | 30 K€ | ~8 500 €/mois 🟢 |
| Y5 | ~2 800 | 6 € | 16 800 € | ~202 K€ | 50 K€ | ~12 700 €/mois 🟢 |

### Verdict scénario agressif

🟢 **Cible atteinte dès Y2** (3 700 €/mois net) puis explosion. Possibilité
de :

- Embaucher un freelance dev/designer dès Y3 (~30-40 K€/an)
- Sortir progressivement de l'agence web freelance
- Investir massivement en marketing organique (YouTubers, presse, événements)
- Préparer une levée de fonds Year 4 (Série A) si l'ambition est de scaler en Europe

### Plan d'action si scénario agressif

| Action | Quand | Effet attendu |
|---|---|---|
| Recruter un freelance dev mobile/back | Y3 | Accélérer roadmap features |
| Recruter un freelance designer | Y3 | Polish UI/UX, marketing visuel |
| Sortir de l'agence web | Y3-Y4 | Focus 100 % sur BB |
| Préparer levée Série A (1-2 M€) | Y4 | Scale-up Europe / hardware integrations |
| Localisation EN sérieuse | Y4 | Expansion marché anglophone |

## Stress tests (chocs externes)

Au-delà des 3 scénarios linéaires (-20 / médian / +20), il faut anticiper
les chocs disruptifs.

### Stress test 1 — Brewfather lance une version FR-first sérieuse

**Probabilité** : 🟡 Moyenne (15-25 % sur 5 ans)
**Impact** : 🔴 Élevé

#### Mécanisme

Brewfather (leader mondial avec 44 % d'adoption) constate l'opportunité FR
sous-servie et lance :

- Localisation FR complète (interface, encyclopédie, water profiles France)
- Marketing ciblé FR (YouTubers, partenariats LHBS)
- Tarification adaptée FR

#### Conséquences pour Brasse-Bouillon

- Perte du quadrant unique « FR-first × mobile-native »
- Concurrence directe sur notre cible Marc-Switcher (qui aurait moins de raisons de migrer)
- Pression sur ARPU (Brewfather peut casser les prix)
- Acquisition organic plus difficile

#### Mitigation

| Action | Effet |
|---|---|
| **Doubler la mise sur souveraineté EU + RGPD** | Argument que Brewfather (NO hors UE) ne peut pas répliquer |
| **Renforcer l'angle pédagogie débutants** | Brewfather n'est pas conçu pour ça, segment qui se vide |
| **Communauté FR vivante** | Différenciateur structurel difficile à copier |
| **AI assistant FR souverain (Mistral)** | Brewfather ne peut pas concurrencer un modèle FR sur un domaine FR |
| **Verrou de marque** : être perçu comme « l'app FR par les Français pour les Français » | Critique avant que Brewfather ne s'installe |

→ **Plan B activable** : si Brewfather lance avant Y3, accélérer la Phase 1
de notre site web et l'outreach YouTubers de 6-12 mois pour s'installer
avant.

### Stress test 2 — Pandémie / crise économique majeure

**Probabilité** : 🟡 Moyenne (20-30 % sur 5 ans)
**Impact** : 🟡 Modéré (paradoxalement bénéfique au brassage maison)

#### Mécanisme

Crise économique → moins de pouvoir d'achat → plus de DIY → boom du
brassage maison (cf. effet COVID 2020-2022).

#### Conséquences pour Brasse-Bouillon

- ↗️ Augmentation des téléchargements (effet « cocooning + DIY »)
- ↘️ Pression à la baisse sur ARPU (utilisateurs moins enclins à payer)
- ↘️ Churn plus élevé (utilisateurs précarisés annulent les abonnements non-essentiels)

#### Mitigation

| Action | Effet |
|---|---|
| **Free tier généreux** | Capture la masse, conversion plus tard |
| **Pricing flexible** : pause d'abonnement temporaire | Réduit le churn structurel |
| **Communiquer sur l'aspect économique** : « brasse moins cher que d'acheter » | Argument anti-crise |
| **Maintenir agence web freelance** | Couvre la pression revenu |

### Stress test 3 — Échec produit majeur (bug critique, fuite de données)

**Probabilité** : 🟢 Faible (5-10 % sur 5 ans, si bonne discipline tech)
**Impact** : 🔴 Élevé

#### Mécanisme

- Fuite de données utilisateurs (RGPD : amende possible jusqu'à 20 M€ ou 4 % du CA mondial)
- Bug critique cassant des recettes / sessions actives
- Perte de réputation en cas d'incident public

#### Conséquences pour Brasse-Bouillon

- Churn massif (peut atteindre 30-50 % en 1 mois)
- Perte de confiance durable
- Coûts juridiques / amendes
- Difficulté à acquérir de nouveaux utilisateurs (réputation entamée)

#### Mitigation

| Action | Effet |
|---|---|
| **Stack hosting EU souveraine** (Scaleway / OVH) | Conformité RGPD by design |
| **Audit sécurité régulier** | Détection précoce des failles |
| **Backups quotidiens** | Récupération en cas d'incident |
| **CI/CD avec tests** (déjà en place) | Réduction des bugs critiques |
| **Communication transparente en cas d'incident** | Limite la perte de confiance |
| **Assurance cyber-risque** (~500-1 500 €/an) | Protection juridique et financière |

### Stress test 4 — Régulation hostile

**Probabilité** : 🟢 Faible (5-10 % sur 5 ans)
**Impact** : 🟡 Modéré

#### Mécanisme

Hypothèses :

- Régulation EU plus stricte sur les apps mobile (RGPD étendue, fees stores augmentés)
- Législation anti-alcool plus sévère (taxation, restrictions promotion)
- Régulation IA stricte (AI Act EU) impactant l'AI assistant

#### Conséquences pour Brasse-Bouillon

- Coûts de mise en conformité (~5-15 K€)
- Délais de mise sur le marché (audits supplémentaires)
- Restrictions sur certaines features (recommandations, partenariats)

#### Mitigation

| Action | Effet |
|---|---|
| **Veille réglementaire active** (newsletters CNIL, AI Act) | Anticipation 6-12 mois |
| **Légalité by design** : RGPD, AI Act dès la conception | Coût de conformité minimal |
| **Pas de promotion abusive de la consommation alcool** | Conforme aux régulations actuelles et futures |
| **Stack souveraine EU** | Réduit l'exposition aux régulations US |

## Risk matrix (Probabilité × Impact)

### 12 risques identifiés

| # | Risque | Probabilité | Impact | Quadrant |
|---|---|---|---|---|
| R1 | Brewfather localise FR sérieusement | 🟡 Moyenne | 🔴 Élevé | **Critique** |
| R2 | Échec produit majeur (bug, fuite data) | 🟢 Faible | 🔴 Élevé | À surveiller |
| R3 | Pandémie / crise économique | 🟡 Moyenne | 🟡 Modéré | À surveiller |
| R4 | Régulation hostile EU | 🟢 Faible | 🟡 Modéré | Acceptable |
| R5 | Téléchargements en dessous des cibles | 🟡 Moyenne | 🟡 Modéré | À surveiller |
| R6 | Churn supérieur aux benchmarks | 🟡 Moyenne | 🟡 Modéré | À surveiller |
| R7 | Marc-Switcher conversion plus faible qu'attendu | 🟡 Moyenne | 🟡 Modéré | À surveiller |
| R8 | Coûts AI APIs explosent (volumétrie) | 🟢 Faible | 🟡 Modéré | Acceptable |
| R9 | Burnout solo dev | 🟡 Moyenne | 🔴 Élevé | **Critique** |
| R10 | Échec Bourse French Tech BPI | 🟡 Moyenne | 🟢 Faible | Acceptable |
| R11 | Plafond microentreprise atteint avant SASU prête | 🟢 Faible | 🟡 Modéré | À surveiller |
| R12 | Apple/Google rejette l'app aux stores | 🟢 Faible | 🔴 Élevé | À surveiller |

### Quadrants de la matrice

```
                      IMPACT ÉLEVÉ
                            │
  R9 Burnout solo ──────────┤────────── R1 Brewfather FR
  R12 Reject stores         │           (à mitiger en priorité)
                            │
  R2 Échec produit ─────────┤
  (faible proba mais grave) │
                            │
PROBA. ÉLEVÉE ──────────────┼──────────────── PROBA. FAIBLE
                            │
  R5 Downloads bas          │           R8 Coûts AI
  R6 Churn élevé            │           R10 Échec Bourse FT
  R7 Marc-Switcher faible ──┤           R11 Plafond micro
  R3 Pandémie               │           R4 Régulation hostile
                            │
                      IMPACT FAIBLE
```

### Mitigations prioritaires (quadrant Critique)

#### Pour R1 — Brewfather localise FR

- Doubler souveraineté EU + RGPD (différenciateur que Brewfather ne peut copier)
- Accélérer outreach YouTubers FR avant que Brewfather n'arrive
- Renforcer la communauté FR vivante (pas reproductible facilement)
- AI assistant FR via Mistral (Brewfather utilise des providers US)

#### Pour R9 — Burnout solo dev

- **Maintenir agence web freelance** comme rythme de respiration
- **Déléguer à des tiers** (vidaste, designer, comptable) dès que possible
- **Cadence soutenable** : éviter les sprints excessifs, privilégier la régularité
- **Hygiène mentale** : pas de travail le week-end systématique, vacances obligatoires
- **Communauté de pairs** : discord, meetups entrepreneurs solo

→ Le R9 est probablement le risque numéro 1 pour Brasse-Bouillon. La majorité
des projets solo échouent par épuisement, pas par marché.

## Triggers de bascule entre scénarios

### Indicateurs précoces (dashboard mensuel)

Pour savoir dans quel scénario on se trouve, suivre ces 5 indicateurs
clés :

| Indicateur | Médian Y1 | Conservateur Y1 | Agressif Y1 |
|---|---|---|---|
| Téléchargements/mois fin Y1 | ~500 | <300 | >800 |
| Conversion Free → Paid | 5-7 % | <4 % | >9 % |
| Mix Pro % | 18-22 % | <15 % | >25 % |
| Activation rate | 25-30 % | <20 % | >35 % |
| Effet evangelist | ×3-5 | <×2 | >×7 |

### Règle de bascule

| Si | Alors | Action |
|---|---|---|
| 3+ indicateurs sur 5 sont en zone conservatrice pendant 2 mois | Bascule scénario conservateur | Plan B activé |
| 3+ indicateurs sur 5 sont en zone agressive pendant 2 mois | Bascule scénario agressif | Plan C (scale-up) activé |
| Mix tous scénarios | Reste en médian, ajustements ciblés | Continuer trajectoire |

## Plans B et C explicites

### Plan B — Si scénario conservateur confirmé en Y2

#### Décisions immédiates (mois 1-3)

1. **Maintenir agence web freelance** comme principal pourvoyeur de revenu jusqu'à Y4-Y5 minimum
2. **Audit complet du funnel** : où on perd vs cibles ?
3. **Investir dans les leviers déficients** : si activation faible → onboarding, si conversion faible → paywall, si churn élevé → rétention

#### Décisions structurelles (mois 4-12)

| Action | Coût | Effet |
|---|---|---|
| Onboarding refondu | ~10-15 K€ (designer + dev) | Activation 25 % → 35 % |
| Programme parrainage Marc → 5+ acquisitions | Coûts récompense ~50 €/Marc | Effet evangelist ×4 → ×7 |
| Pricing intermédiaire (4,99 €/mo) | 0 € | Capture utilisateurs entre Premium et Pro |
| Pause sur features non-essentielles | 0 € (priorisation) | Recentrage produit |

#### Si Plan B insuffisant après 12 mois

- Reporter la bascule SASU à Y4 ou Y5 (rester en microentreprise)
- Transformer BB en projet passion + agence web comme activité principale
- Vendre les actifs BB ou s'associer avec un partenaire (option exit)

### Plan C — Si scénario agressif confirmé en Y2

#### Décisions immédiates (mois 1-3)

1. **Préparer la bascule SASU plus tôt** (Y2 fin au lieu de Y3)
2. **Recruter un freelance dev** pour accélérer la roadmap (~30-40 K€/an)
3. **Augmenter le budget marketing organic** (gifts YouTubers, événements salons)

#### Décisions structurelles (mois 4-12)

| Action | Coût | Effet |
|---|---|---|
| Recrutement freelance dev mobile | 30-40 K€/an | Roadmap ×1.5 |
| Recrutement freelance designer | 15-25 K€/an | Polish + marketing visuel |
| Préparation levée Série A (~1 M€) | Effort dossier ~3 mois | Capital pour Europe + features Pro+ |
| Localisation EN | 5-10 K€ | Marché anglophone |
| Hardware integration (Tilt, iSpindel partenariats) | 5-15 K€ | Pro tier renforcé |

#### Si Plan C confirmé long terme

- Embauche CDI Y4 (CTO ou Lead Dev pour épauler Benoît)
- Levée Série A Y4 pour scaler EU
- Sortie agence web freelance complètement

## Synthèse pour défense soutenance

5 messages clés extractibles slide :

1. **3 scénarios chiffrés sur 5 ans** (conservateur / médian / agressif)
   avec OPEX, MRR, net mensuel par année. Le modèle médian atteint la
   cible « vivre de l'app » en Y3, le conservateur survit avec
   l'agence web, l'agressif explose dès Y2.

2. **4 stress tests anticipés** : Brewfather localisant FR, pandémie,
   échec produit, régulation hostile. Chaque test a sa mitigation
   prédéfinie.

3. **Risk matrix de 12 risques** structurée (probabilité × impact). Les
   2 risques critiques (Brewfather FR + burnout solo dev) ont des
   plans de mitigation prioritaires.

4. **Triggers de bascule entre scénarios** : 5 indicateurs mensuels
   permettent de savoir dans quel scénario on est. Bascule active dès
   2 mois consécutifs en zone conservatrice ou agressive.

5. **Plans B et C explicites** avec actions concrètes et coûts. Pas de
   « on verra le moment venu » : si conservateur, agence web préservée
   + audit funnel ; si agressif, recrutement freelances + préparation
   levée Série A.

## Articulation avec autres documents Phase 5

| Document | Rôle dans la défense |
|---|---|
| [funnel-projection.md](funnel-projection.md) | Vue d'ensemble 3 scénarios |
| [financial-projections.md](financial-projections.md) | OPEX, CAPEX, KPIs résumé |
| [capex-financement.md](capex-financement.md) | Forme juridique, aides publiques, plan financement |
| [kpi-details.md](kpi-details.md) | 20 KPIs avec triggers d'action (alimente les indicateurs précoces) |
| **[scenarios-alternatifs.md](scenarios-alternatifs.md)** (ce fichier) | Robustesse du modèle, plans B/C, mitigations |

**La Phase 5 est désormais complète.** Les 5 ateliers (A, B, C, D + vue
d'ensemble) couvrent l'intégralité du chapitre financier exhaustif requis
pour la soutenance.
