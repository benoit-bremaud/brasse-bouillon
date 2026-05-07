# Projections financières — soutenance 27 mai 2026

**Finalité** : matière chiffrée pour le bloc 5 (BM + Perspectives). Modélise
la viabilité économique du projet sur 1-5 ans avec OPEX, CAPEX, KPIs et
scénarios alternatifs. Slide-ready pour défense devant jury.

**Sources** : [funnel-projection.md](funnel-projection.md) (revenus modélisés),
[pricing-tiers-definition.md](pricing-tiers-definition.md) (tarifs retenus),
[ai-strategy.md](ai-strategy.md) (coûts API), [hosting-strategy.md](hosting-strategy.md)
(infrastructure).

## Concepts clés (vocabulaire jury)

### OPEX (Operating Expenses)

**Frais récurrents** (mensuels/annuels) pour faire tourner le projet :
hosting, AI APIs, comptable, outils, marketing organic.

### CAPEX (Capital Expenditures)

**Investissements ponctuels durables** pour aider le projet sur plusieurs
années : matériel démo, dépôt marque INPI, mise en place comptable.

### KPIs (Key Performance Indicators)

**Indicateurs chiffrés du succès**, regroupés en 4 catégories :
acquisition, engagement, monétisation, rétention.

### Scénarios alternatifs

**Modélisation à 3 niveaux** (conservateur / médian / agressif) pour
démontrer la robustesse du modèle face à la volatilité des hypothèses.

## OPEX consolidés Année 1-5

| Poste | Année 1 | Année 2 | Année 3 | Année 5 |
|---|---|---|---|---|
| Hosting API + DB | 150 € | 360 € | 600 € | 1 800 € |
| Apple Developer + Google Play | 124 € | 124 € | 124 € | 124 € |
| Domaines + SSL + email | 60 € | 60 € | 60 € | 60 € |
| **AI APIs (Mistral / Claude)** | 200 € | 1 800 € | 6 000 € | 18 000 € |
| Outils dev/design (Midjourney + autres) | 360 € | 360 € | 360 € | 360 € |
| Outils marketing (Plausible, MailerLite à terme) | 0 € | 240 € | 360 € | 480 € |
| Comptable / juridique | 200 € | 600 € | 1 500 € | 3 000 € |
| Tiers vidaste / designer | 1 500 € | 2 000 € | 2 500 € | 3 000 € |
| Marketing organic (gifts YouTubers, kit presse, événements) | 500 € | 1 500 € | 3 000 € | 5 000 € |
| **TOTAL OPEX/an** | **~3 500 €** | **~7 900 €** | **~16 300 €** | **~36 000 €** |

### Hosting détaillé (Scaleway en référence)

| Année | Charge | Stack référence | Coût mensuel | Coût annuel |
|---|---|---|---|---|
| 1 | ~250 payants + 7 500 actifs Free | Scaleway Stardust XS + RDB Postgres dev | ~12 € | ~150 € |
| 2 | ~600 payants + 15 000 actifs | Scaleway Pro2 + RDB Postgres prod | ~30 € | ~360 € |
| 3 | ~1 000 payants + 22 000 actifs | Scaleway Pro2 + RDB scaled | ~50 € | ~600 € |
| 5 | ~1 800 payants + 40 000 actifs | Cluster + read replicas | ~150 € | ~1 800 € |

**Provider** : Scaleway en référence (FR souverain), décision finale à
l'implémentation. Alternatives crédibles : OVH (FR) ou Render/Railway (USA).

## CAPEX initial (Année 1)

| Poste | Coût | Note |
|---|---|---|
| Matériel démo (caméra + micro pour vidéos kit créateurs) | ~300-500 € | Réutilisable longtemps |
| Kit brassage perso (si pas déjà à l'inventaire) | ~150 € | Pour brassins documentés |
| Dépôt marque INPI « Brasse-Bouillon » | ~200 € | Protection juridique |
| Comptable mise en place microentreprise puis SAS | ~500-1 500 € | One-shot setup |
| **Total CAPEX Année 1** | **~1 000-2 500 €** | |

→ **CAPEX faible** typique d'un SaaS solo dev. Le « vrai CAPEX » serait le
temps de développement, valorisable en levée de fonds mais non comptabilisé
ici (bootstrapping).

## Plan de financement

| Source | Montant | Période |
|---|---|---|
| Épargne personnelle | ~2 000 € | Année 1 (CAPEX initial) |
| Revenu agence web freelance | ~500-1 500 €/mois | Années 1-3 (couvre l'OPEX et le coût de vie pendant la croissance lente) |
| Lifetime Deal au lancement (100 places × 99 €) | ~9 900 € | Année 1 (boost cash) |
| Revenus subscription | progressif | Année 1+ (cf. funnel) |

## Revenus prévisionnels (cohort buildup)

| Période | Payants total | ARPU mensuel | Revenu brut/an |
|---|---|---|---|
| **Année 1 (lancement)** | ~250 fin année | 4,50 € | ~14 K€ |
| **Année 2** | ~600 fin année | 4,50 € | ~32 K€ |
| **Année 3 (cible)** | ~1 000 fin année | 4,75 € | ~57 K€ |
| **Année 5 (long terme)** | ~1 800 fin année | 5 € | ~108 K€ |

### Bonus Année 1 — Lifetime deal

100 utilisateurs × 99 € = **+9 900 € one-shot** au lancement public store.

## Marges nettes (revenu - OPEX)

| Période | Revenu brut | OPEX | **Net annuel** | **Net mensuel** |
|---|---|---|---|---|
| Année 1 | 14 K€ + 9,9 K€ lifetime = ~24 K€ | 3,5 K€ | **~20 K€** | ~1 700 €/mo |
| Année 2 | ~32 K€ | 8 K€ | **~24 K€** | ~2 000 €/mo |
| **Année 3 (cible)** | **~57 K€** | **16 K€** | **~41 K€** | **~3 400 €/mo** |
| Année 5 | ~108 K€ | 36 K€ | **~72 K€** | ~6 000 €/mo |

## Break-even analysis

- **Break-even mensuel** : OPEX mensuel ~290 € Année 1 → ~80 utilisateurs payants à 4 € ARPU
- **Atteint mois ~5-6** dans le scénario de base

## Cible « vivre de l'app » (3 500 €/mois net)

- Atteinte **Année 3** (~3 400 €/mo net) ✓
- Marge confortable **Années 4-5** (~5 000-6 000 €/mo)
- Si scénario favorable (+20 % global) : atteinte dès **Année 2 fin** (~2 800 €/mo)
- Si scénario défavorable (-20 % global) : Année 4 (~2 800 €/mo) — toujours dans la fenêtre 3-5 ans validée

## 3 scénarios alternatifs (matrice slide soutenance)

| Variable | Conservateur (-20 %) | Médian (hypothèse de base) | Agressif (+20 %) |
|---|---|---|---|
| Téléchargements 3 ans | 40 000 | 50 000 | 60 000 |
| Conversion Free → Paid | 8 % | 10 % | 12 % |
| Mix Pro | 20 % | 25 % | 30 % |
| ARPU | 4 € | 4,75 € | 5,50 € |
| **Payants Année 3** | **640** | **1 000** | **1 440** |
| **MRR Année 3** | **2 600 €** | **4 800 €** | **7 900 €** |
| **Net mensuel Année 3** | **~2 100 €** | **~3 400 €** | **~6 200 €** |
| **Verdict** | Survie + freelance d'appoint | Cible atteinte ✓ | Au-delà cible |

## Sensibilité par levier

| Levier | Impact -20 % | Impact +20 % |
|---|---|---|
| Téléchargements totaux | -20 % payants | +20 % payants |
| Conversion Free → Premium | -20 % | +20 % |
| Retention Premium | -25 % LTV | +25 % LTV |
| Mix Pro % | -15 % ARPU | +15 % ARPU |

**Combinaison 2 facteurs défavorables** : ~2 500 €/mois net (sous cible mais
survie OK avec freelance d'appoint).

**Combinaison 2 facteurs favorables** : ~4 500 €/mois net (au-dessus cible,
marge confortable).

## KPIs cibles par catégorie (dashboard prévisionnel)

### Acquisition

| KPI | Année 1 | Année 2 | Année 3 | Année 5 |
|---|---|---|---|---|
| Téléchargements mensuels | ~500 | ~1 200 | ~2 000 | ~3 500 |
| CAC moyen | <5 € | <8 € | <10 € | <12 € |
| Activation rate (1ᵉʳ brassin) | >25 % | >35 % | >40 % | >45 % |

### Engagement

| KPI | Année 1 | Année 2 | Année 3 | Année 5 |
|---|---|---|---|---|
| DAU/MAU ratio | >15 % | >20 % | >25 % | >30 % |
| Sessions/mois moyen | >5 | >7 | >8 | >10 |
| Recettes créées/utilisateur | >1 | >1,5 | >2 | >3 |

### Monétisation

| KPI | Année 1 | Année 2 | Année 3 | Année 5 |
|---|---|---|---|---|
| MRR (Monthly Recurring Revenue) | ~1 100 € | ~2 700 € | ~4 800 € | ~9 000 € |
| ARPU mensuel | 4,50 € | 4,50 € | 4,75 € | 5 € |
| Conversion Free → Paid | >5 % | >7 % | >10 % | >12 % |
| LTV pondéré | >100 € | >110 € | >120 € | >150 € |

### Rétention

| KPI | Année 1 | Année 2 | Année 3 | Année 5 |
|---|---|---|---|---|
| Churn mensuel | <5 % | <3 % | <2 % | <1,5 % |
| Retention 12 mois | >60 % | >70 % | >75 % | >80 % |
| NPS | >25 | >35 | >40 | >50 |

## Synthèse pour défense soutenance

5 messages clés extractibles slide :

1. **OPEX maîtrisés** : 3,5 K€ Année 1 → 36 K€ Année 5. Coûts grandissent
   moins vite que les revenus → marge augmente structurellement.
2. **CAPEX faible** (~1-2,5 K€) : projet bootstrappable sans levée de fonds.
3. **Cible atteinte Année 3** dans le scénario médian : 3 400 €/mois net,
   cohérent avec l'objectif « vivre de l'app » sur 3-5 ans.
4. **Modèle robuste** : même -20 % sur 2 leviers, on reste à 2 100 €/mois net
   (survie OK avec freelance agence web d'appoint).
5. **KPIs structurés en 4 catégories** avec cibles numériques par année :
   permet un suivi mesurable et une prise de décision éclairée si la réalité
   diverge des hypothèses.
