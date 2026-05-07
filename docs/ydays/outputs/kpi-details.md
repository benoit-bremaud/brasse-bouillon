# KPIs détaillés — Atelier C Phase 5 modèle économique

**Finalité** : matière exhaustive pour le bloc 5 (BM + Perspectives) du
plan soutenance. Définit 20 KPIs structurés en 4 catégories, avec cibles
numériques par année, seuils d'alerte et déclencheurs d'action.

**Sources** : [funnel-projection.md](funnel-projection.md) (cibles funnel),
[personas-monetization.md](personas-monetization.md) (LTV par persona),
[financial-projections.md](financial-projections.md) (vue d'ensemble KPIs),
benchmarks B2C SaaS 2026.

## Méthodologie KPIs

### Pourquoi des KPIs structurés

Le jury soutenance va creuser : « comment tu sauras que ton projet
réussit ? » Sans KPIs explicites, le business model n'est pas crédible.
Cet atelier transforme les hypothèses en **mesures actionnables**.

### Principes directeurs

| Principe | Application |
|---|---|
| **Mesurable** | Chaque KPI a une formule de calcul claire et une source data identifiée |
| **Actionnable** | Chaque KPI a un seuil d'alerte qui déclenche une action concrète |
| **Comparable** | Benchmarks industrie B2C SaaS 2026 fournis pour situer la performance |
| **Évolutif** | Cibles Y1 / Y2 / Y3 / Y5 différenciées (croissance attendue) |
| **Phased** | KPIs activables progressivement (certains nécessitent une masse critique) |

### 4 catégories de KPIs

```
ACQUISITION (6)         ENGAGEMENT (5)        MONÉTISATION (5)      RÉTENTION (4)
combien de nouveaux     comment ils utilisent  combien tu gagnes     ils restent
─────────────────       ─────────────────      ─────────────────     ─────────────
Téléchargements         DAU/MAU                MRR                   Churn mensuel
CAC                     Sessions/mois          ARPU                  Retention 12m
Activation rate         Recettes créées        Conversion Free→Paid  NPS
Marc-Switcher rate      Scans/utilisateur      LTV pondéré           Satisfaction AI
Effet evangelist        Diversité recettes     NRR (Net Rev Ret)
Opt-in newsletter
```

### Outils de mesure recommandés

| Catégorie KPIs | Source data | Outil recommandé | Coût |
|---|---|---|---|
| Acquisition | Stores (App Store Connect, Google Play Console) + analytics web | Stores natifs + Plausible (post-store) | 0 € + 10 €/mo (Plausible) |
| Engagement | Backend API logs + app telemetry | PostHog ou Mixpanel (free tier) ou solution maison | 0-50 €/mo |
| Monétisation | RevenueCat / Stripe + backend | RevenueCat (mobile subscription) | 0 € jusqu'à $10K MRR |
| Rétention | Backend cohort analytics + sondages | RevenueCat + Typeform / Tally pour NPS | 0-30 €/mo |

**Budget total outils analytics Année 1-3** : ~50-100 €/mo (cohérent avec OPEX
budgété).

## Section 1 — KPIs d'acquisition

### KPI 1 — Téléchargements mensuels

| Élément | Détail |
|---|---|
| Définition | Nombre d'installations sur iOS + Android par mois (uniques) |
| Formule | `iOS first-time downloads + Android first-time downloads` |
| Source data | App Store Connect + Google Play Console |
| Fréquence | Hebdomadaire (suivi) + mensuel (rapport) |
| Cible Y1 | ~500/mois |
| Cible Y2 | ~1 200/mois |
| Cible Y3 | ~2 000/mois |
| Cible Y5 | ~3 500/mois |
| Seuil d'alerte | <50 % de la cible mensuelle pendant 2 mois consécutifs |
| Action si dérive | Audit canaux acquisition, accélération outreach YouTubers, ajustement copy stores |

### KPI 2 — CAC moyen (Customer Acquisition Cost)

| Élément | Détail |
|---|---|
| Définition | Coût d'acquisition d'UN utilisateur payant |
| Formule | `(coûts marketing + outreach créateurs) / nouveaux utilisateurs payants sur la période` |
| Source data | Comptabilité OPEX marketing + RevenueCat conversions |
| Fréquence | Mensuelle |
| Cible Y1 | <5 € (organic-heavy) |
| Cible Y2 | <8 € |
| Cible Y3 | <10 € |
| Cible Y5 | <12 € |
| Seuil d'alerte | CAC > LTV / 3 (LTV/CAC ratio < 3:1) |
| Action si dérive | Réduction marketing payant, focus organic, optimisation funnel conversion |

**Benchmark B2C SaaS 2026** : CAC sain = 5-15 € pour app niche engagée.

### KPI 3 — Activation rate (1er brassin)

| Élément | Détail |
|---|---|
| Définition | % de téléchargeurs qui complètent leur 1er brassin dans les 90 jours |
| Formule | `(utilisateurs ayant terminé leur 1ère session brassage / téléchargements 90 jours) × 100` |
| Source data | Backend session events (Brassin marqué « terminé ») |
| Fréquence | Mensuelle (cohort 90j) |
| Cible Y1 | >25 % |
| Cible Y2 | >35 % |
| Cible Y3 | >40 % |
| Cible Y5 | >45 % |
| Seuil d'alerte | <50 % de la cible pendant 2 mois |
| Action si dérive | Audit onboarding (levier rétention #1), tutoriels améliorés, support utilisateur |

### KPI 4 — Taux Marc-Switcher

| Élément | Détail |
|---|---|
| Définition | % de nouveaux utilisateurs Pro venant de Brewfather/BeerSmith (avec proof migration) |
| Formule | `(nouveaux Pro avec migration claim / nouveaux Pro total) × 100` |
| Source data | Champ formulaire candidature beta + champ « ancien outil » dans onboarding |
| Fréquence | Trimestrielle |
| Cible Y1 | N/A (pas encore de Pro tier actif) |
| Cible Y2 | >15 % |
| Cible Y3 | >25 % |
| Cible Y5 | >30 % |
| Seuil d'alerte | <10 % en Y2-Y3 |
| Action si dérive | Améliorer import BeerXML, augmenter discount migration, outreach forums Brewfather |

**Important** : ce KPI est unique à BB (ne se trouve pas dans benchmarks
standards). C'est un indicateur stratégique d'effet evangelist.

### KPI 5 — Effet evangelist (acquisitions indirectes attribuables)

| Élément | Détail |
|---|---|
| Définition | Nombre d'acquisitions attribuables à 1 Marc converti (multiplicateur organique) |
| Formule | `(nouveaux utilisateurs avec attribution « ami brasseur » ou « YouTuber X » / nombre Marc actifs)` |
| Source data | Champ « comment as-tu connu BB ? » dans onboarding |
| Fréquence | Trimestrielle |
| Cible Y1 | >2× (2 acquisitions par Marc actif) |
| Cible Y2 | >5× |
| Cible Y3 | >7× |
| Cible Y5 | >8× |
| Seuil d'alerte | <50 % de la cible |
| Action si dérive | Programme de parrainage (referral program), récompenses pour Marc parrains |

### KPI 6 — Taux opt-in newsletter / waitlist

| Élément | Détail |
|---|---|
| Définition | % de visiteurs site web qui s'inscrivent à la waitlist email |
| Formule | `(nouveaux opt-ins email / visiteurs uniques mensuels site web) × 100` |
| Source data | Formspree (waitlist) + analytics web (Plausible) |
| Fréquence | Mensuelle |
| Cible Y1 | >5 % (pré-store, audience curieuse forte) |
| Cible Y2 | >3 % (post-store, conversion directe vers téléchargement prime) |
| Cible Y3 | >2 % |
| Cible Y5 | >2 % |
| Seuil d'alerte | <50 % de la cible |
| Action si dérive | Refresh CTA héros, A/B test formulaire, qualification trafic |

## Section 2 — KPIs d'engagement

### KPI 7 — DAU/MAU ratio

| Élément | Détail |
|---|---|
| Définition | Daily Active Users / Monthly Active Users — mesure la « stickiness » |
| Formule | `(moyenne DAU sur le mois) / MAU` |
| Source data | Backend session events (any user action this day) |
| Fréquence | Quotidienne (suivi) + mensuelle (rapport) |
| Cible Y1 | >15 % |
| Cible Y2 | >20 % |
| Cible Y3 | >25 % |
| Cible Y5 | >30 % |
| Seuil d'alerte | <50 % de la cible pendant 1 mois |
| Action si dérive | Audit de la rétention, notifications smart, contenu communauté |

**Benchmark B2C 2026** : DAU/MAU = 10-15 % pour app niche, 25-40 % pour app
quotidienne. Brassage = niche moins intensive (cycle long), donc 25 % en Y3
est ambitieux mais atteignable avec sessions de fermentation.

### KPI 8 — Sessions par mois (utilisateur actif)

| Élément | Détail |
|---|---|
| Définition | Nombre moyen de sessions app par utilisateur actif mensuel |
| Formule | `total sessions du mois / MAU` |
| Source data | Backend session events |
| Fréquence | Mensuelle |
| Cible Y1 | >5 |
| Cible Y2 | >7 |
| Cible Y3 | >8 |
| Cible Y5 | >10 |
| Seuil d'alerte | <70 % de la cible |
| Action si dérive | Notifications fermentation calibrées, content updates encyclopédie |

### KPI 9 — Recettes créées par utilisateur

| Élément | Détail |
|---|---|
| Définition | Nombre moyen de recettes créées par utilisateur (cumul depuis inscription) |
| Formule | `recettes totales créées / utilisateurs ayant créé ≥1 recette` |
| Source data | Backend recette table |
| Fréquence | Trimestrielle (cohort) |
| Cible Y1 | >1 |
| Cible Y2 | >1,5 |
| Cible Y3 | >2 |
| Cible Y5 | >3 |
| Seuil d'alerte | <50 % de la cible |
| Action si dérive | Templates de recettes, suggestions IA, communauté plus active |

### KPI 10 — Scans par utilisateur

| Élément | Détail |
|---|---|
| Définition | Nombre moyen de scans code-barres par utilisateur actif mensuel |
| Formule | `scans réussis du mois / MAU` |
| Source data | Backend scan events |
| Fréquence | Mensuelle |
| Cible Y1 | >3 |
| Cible Y2 | >5 |
| Cible Y3 | >7 |
| Cible Y5 | >10 |
| Seuil d'alerte | <50 % de la cible |
| Action si dérive | Promo scan flow (différenciateur principal), enrichissement encyclopédie |

**Important** : KPI unique BB, mesure l'utilisation du différenciateur clé.

### KPI 11 — Diversité des recettes (variété styles BJCP/utilisateur)

| Élément | Détail |
|---|---|
| Définition | Nombre moyen de styles BJCP différents brassés par utilisateur |
| Formule | `styles distincts par utilisateur / utilisateurs ayant ≥3 recettes` |
| Source data | Backend recettes + classification BJCP |
| Fréquence | Trimestrielle |
| Cible Y1 | >1,5 styles |
| Cible Y2 | >2 styles |
| Cible Y3 | >2,5 styles |
| Cible Y5 | >3,5 styles |
| Seuil d'alerte | <50 % de la cible |
| Action si dérive | Recommandations de nouveaux styles, défis communautaires (style du mois) |

## Section 3 — KPIs de monétisation

### KPI 12 — MRR (Monthly Recurring Revenue)

| Élément | Détail |
|---|---|
| Définition | Revenu mensuel récurrent provenant des abonnements actifs |
| Formule | `Σ (utilisateurs payants × prix abonnement mensuel équivalent)` |
| Source data | RevenueCat / Stripe |
| Fréquence | Quotidienne (dashboard) + mensuelle (rapport) |
| Cible Y1 | ~1 100 €/mois (fin Y1) |
| Cible Y2 | ~2 700 €/mois (fin Y2) |
| Cible Y3 | ~4 800 €/mois (fin Y3) |
| Cible Y5 | ~9 000 €/mois (fin Y5) |
| Seuil d'alerte | <80 % de la cible mensuelle |
| Action si dérive | Audit pricing tiers, campagne winback churners, push upgrade Pro |

### KPI 13 — ARPU mensuel (Average Revenue Per User payant)

| Élément | Détail |
|---|---|
| Définition | Revenu moyen par utilisateur payant par mois |
| Formule | `MRR / utilisateurs payants actifs` |
| Source data | RevenueCat |
| Fréquence | Mensuelle |
| Cible Y1 | 4,50 € |
| Cible Y2 | 4,50 € |
| Cible Y3 | 4,75 € |
| Cible Y5 | 5,00 € |
| Seuil d'alerte | <90 % de la cible |
| Action si dérive | Push upgrade Premium → Pro, augmentation features Pro, ajustement pricing |

### KPI 14 — Conversion Free → Paid

| Élément | Détail |
|---|---|
| Définition | % d'utilisateurs Free qui deviennent payants (Premium ou Pro) |
| Formule | `(nouveaux payants du mois / utilisateurs Free actifs) × 100` |
| Source data | RevenueCat conversions + backend Free users |
| Fréquence | Mensuelle |
| Cible Y1 | >5 % |
| Cible Y2 | >7 % |
| Cible Y3 | >10 % |
| Cible Y5 | >12 % |
| Seuil d'alerte | <70 % de la cible |
| Action si dérive | A/B test paywall placement, message conversion, trial Pro plus généreux |

**Benchmark B2C SaaS 2026** : 1-5 % standard, 5-15 % pour niche engagée.

### KPI 15 — LTV pondéré (Lifetime Value)

| Élément | Détail |
|---|---|
| Définition | Revenu cumulé moyen sur la durée de vie d'un client (pondéré par mix Premium/Pro) |
| Formule | `(Premium count × ARPU Premium × durée moyenne) + (Pro count × ARPU Pro × durée moyenne) / total payants` |
| Source data | RevenueCat cohort analytics |
| Fréquence | Trimestrielle (cohort) |
| Cible Y1 | >100 € |
| Cible Y2 | >110 € |
| Cible Y3 | >120 € |
| Cible Y5 | >150 € |
| Seuil d'alerte | <80 % de la cible |
| Action si dérive | Réduire churn, upgrade Pro, pricing annuel plus attractif |

**Critique** : LTV/CAC > 3:1 est le ratio sain (3:1 acceptable, 5:1 excellent).

### KPI 16 — NRR (Net Revenue Retention)

| Élément | Détail |
|---|---|
| Définition | % du MRR conservé d'un cohort 12 mois plus tard, incluant upgrades/downgrades |
| Formule | `(MRR cohort à 12 mois / MRR cohort à 0 mois) × 100` |
| Source data | RevenueCat cohort analytics |
| Fréquence | Annuelle (mais suivi mensuel cohorts) |
| Cible Y1 | >70 % |
| Cible Y2 | >85 % |
| Cible Y3 | >95 % |
| Cible Y5 | >105 % (expansion via upgrades) |
| Seuil d'alerte | <80 % de la cible |
| Action si dérive | Programme de fidélité, upsell features Pro, customer success outreach |

**Benchmark B2C SaaS 2026** : NRR sain = 90-110 %. >100 % = expansion (les
upgrades compensent le churn).

## Section 4 — KPIs de rétention

### KPI 17 — Churn mensuel

| Élément | Détail |
|---|---|
| Définition | % d'utilisateurs payants qui se désabonnent par mois |
| Formule | `(désabonnements du mois / utilisateurs payants début de mois) × 100` |
| Source data | RevenueCat |
| Fréquence | Mensuelle |
| Cible Y1 | <5 % |
| Cible Y2 | <3 % |
| Cible Y3 | <2 % |
| Cible Y5 | <1,5 % |
| Seuil d'alerte | >150 % de la cible |
| Action si dérive | Sondage exit, programme winback (-50 % 1 mois), audit features manquantes |

**Benchmark B2C SaaS 2026** : 5-7 %/mois standard, 1-2 %/mois excellent
pour niche engagée.

### KPI 18 — Retention 12 mois (cohort)

| Élément | Détail |
|---|---|
| Définition | % d'utilisateurs encore payants 12 mois après inscription |
| Formule | `(utilisateurs encore actifs payants à M+12 / utilisateurs payants à M0) × 100` |
| Source data | RevenueCat cohort analytics |
| Fréquence | Annuelle (mais cohorts continus) |
| Cible Y1 | >60 % |
| Cible Y2 | >70 % |
| Cible Y3 | >75 % |
| Cible Y5 | >80 % |
| Seuil d'alerte | <80 % de la cible |
| Action si dérive | Renforcer levier rétention #1 (onboarding), améliorer cycle brassage |

### KPI 19 — NPS (Net Promoter Score)

| Élément | Détail |
|---|---|
| Définition | Score de recommandation : « Recommanderiez-vous Brasse-Bouillon à un ami ? » (0-10) |
| Formule | `% promoteurs (9-10) - % détracteurs (0-6)` |
| Source data | Sondage Typeform / Tally trimestriel auprès utilisateurs actifs |
| Fréquence | Trimestrielle |
| Cible Y1 | >25 |
| Cible Y2 | >35 |
| Cible Y3 | >40 |
| Cible Y5 | >50 |
| Seuil d'alerte | <50 % de la cible |
| Action si dérive | Analyse verbatims détracteurs, fix top 3 frictions identifiées |

**Benchmark B2C 2026** : NPS >30 = bon, >50 = excellent, >70 = world-class.

### KPI 20 — Satisfaction AI assistant (CSAT)

| Élément | Détail |
|---|---|
| Définition | Score de satisfaction des réponses AI (1-5 étoiles après chaque interaction) |
| Formule | `moyenne des notes données aux réponses AI / nombre total de notes` |
| Source data | Backend feedback widget intra-app après chaque réponse AI |
| Fréquence | Mensuelle |
| Cible Y1 | N/A (AI non lancé) |
| Cible Y2 | N/A (AI non lancé Phase 4) |
| Cible Y3 | >4,0 / 5 |
| Cible Y5 | >4,3 / 5 |
| Seuil d'alerte | <3,5 / 5 |
| Action si dérive | Audit prompts, basculement Mistral → Claude pour certains cas, fine-tuning |

## Section 5 — Dashboard prévisionnel consolidé

### Vue par catégorie et année

#### Acquisition

| KPI | Y1 | Y2 | Y3 | Y5 |
|---|---|---|---|---|
| Téléchargements/mois | 500 | 1 200 | 2 000 | 3 500 |
| CAC moyen | <5 € | <8 € | <10 € | <12 € |
| Activation rate | >25 % | >35 % | >40 % | >45 % |
| Taux Marc-Switcher | N/A | >15 % | >25 % | >30 % |
| Effet evangelist | >2× | >5× | >7× | >8× |
| Opt-in newsletter | >5 % | >3 % | >2 % | >2 % |

#### Engagement

| KPI | Y1 | Y2 | Y3 | Y5 |
|---|---|---|---|---|
| DAU/MAU | >15 % | >20 % | >25 % | >30 % |
| Sessions/mois | >5 | >7 | >8 | >10 |
| Recettes/utilisateur | >1 | >1,5 | >2 | >3 |
| Scans/utilisateur | >3 | >5 | >7 | >10 |
| Diversité styles BJCP | >1,5 | >2 | >2,5 | >3,5 |

#### Monétisation

| KPI | Y1 | Y2 | Y3 | Y5 |
|---|---|---|---|---|
| MRR (€/mois) | 1 100 | 2 700 | 4 800 | 9 000 |
| ARPU (€/mois) | 4,50 | 4,50 | 4,75 | 5,00 |
| Conversion Free→Paid | >5 % | >7 % | >10 % | >12 % |
| LTV pondéré | >100 € | >110 € | >120 € | >150 € |
| NRR | >70 % | >85 % | >95 % | >105 % |

#### Rétention

| KPI | Y1 | Y2 | Y3 | Y5 |
|---|---|---|---|---|
| Churn mensuel | <5 % | <3 % | <2 % | <1,5 % |
| Retention 12 mois | >60 % | >70 % | >75 % | >80 % |
| NPS | >25 | >35 | >40 | >50 |
| Satisfaction AI | N/A | N/A | >4,0/5 | >4,3/5 |

## Section 6 — Déclencheurs d'action (triggers)

### Système de feux tricolores

| Couleur | Critère | Action |
|---|---|---|
| 🟢 Vert | KPI ≥ cible | Continuer la stratégie en cours |
| 🟡 Jaune | KPI entre seuil d'alerte et cible | Investigation, identifier cause racine |
| 🔴 Rouge | KPI < seuil d'alerte pendant 2 mois consécutifs | Action corrective immédiate |

### Top 5 triggers prioritaires

#### Trigger 1 — Téléchargements en dessous de 50 % de la cible (rouge)

**Cause probable** : audience trop étroite, canaux d'acquisition inefficaces.
**Action** :

1. Audit des canaux (YouTubers, organic, ASO)
2. Accélération outreach créateurs
3. Refresh ASO (App Store Optimization) : screenshots, description, mots-clés
4. Test ads ciblées sur Reddit r/Homebrewing FR (budget 500-1000 €)

#### Trigger 2 — Conversion Free → Paid en dessous de 5 % en Y3 (rouge)

**Cause probable** : paywall mal calibré ou Free tier trop généreux.
**Action** :

1. A/B test placement paywall (timing, contenu)
2. Audit features Free vs Premium (déséquilibre ?)
3. Push messaging upgrade contextuel
4. Trial Pro plus généreux temporairement

#### Trigger 3 — Churn mensuel > 4 % en Y2-Y3 (rouge)

**Cause probable** : insatisfaction, manque de valeur perçue.
**Action** :

1. Sondage exit systématique (« pourquoi tu pars ? »)
2. Programme winback : -50 % 1 mois pour les churners
3. Audit features manquantes vs concurrents
4. Renforcement levier rétention #2 (lock-in données positif)

#### Trigger 4 — NPS < 25 en Y3 (rouge)

**Cause probable** : frictions UX importantes ou attentes mal comblées.
**Action** :

1. Analyse verbatims détracteurs (segmentation par persona)
2. Fix top 3 frictions identifiées dans les 3 mois
3. Communication transparente roadmap correctifs

#### Trigger 5 — LTV/CAC < 3:1 (jaune-rouge selon ampleur)

**Cause probable** : CAC trop élevé OU LTV trop faible.
**Action si CAC élevé** : réduction marketing payant, focus organic.
**Action si LTV faible** : renforcer rétention, upgrade Pro, pricing
annuel attractif.

## Section 7 — Outils de mesure et stack analytics

### Stack recommandée Année 1

| Domaine | Outil | Coût | Justification |
|---|---|---|---|
| **Mobile analytics** | PostHog Cloud (free tier) ou solution maison via backend | 0-50 €/mo | Events tracking + cohort analysis |
| **Subscription analytics** | RevenueCat | 0 € jusqu'à $10K MRR | Standard mobile subscription, A/B testing built-in |
| **Web analytics** | Aucun en Y1 (pas d'audience pré-store) | 0 € | Voir Atelier A décision |
| **NPS / CSAT** | Tally (free) ou Typeform | 0-25 €/mo | Sondages trimestriels |
| **Dashboard consolidé** | Spreadsheet Google Sheets | 0 € | Suffisant Y1 |

**Total Année 1** : ~25-75 €/mo (~300-900 €/an, cohérent avec OPEX).

### Évolution Année 2-3

| Année | Évolution stack |
|---|---|
| Y2 | Ajout Plausible (10 €/mo) si site web devient un canal d'acquisition mesurable |
| Y3 | Migration Google Sheets → Mixpanel ou PostHog payant (~50-100 €/mo) si volume justifie |
| Y5 | Solution analytics dédiée (Looker Studio ou Metabase) si équipe data |

## Section 8 — Cadence de revue des KPIs

### Routines recommandées

| Cadence | Contenu | Durée |
|---|---|---|
| **Quotidien** | Coup d'œil dashboard MRR, Téléchargements (~5 min) | 5 min |
| **Hebdomadaire** | Revue acquisition + engagement (~15 min) | 15 min |
| **Mensuel** | Revue complète des 4 catégories, comparaison cibles, identification triggers (~1h) | 1h |
| **Trimestriel** | Cohort analytics, NPS, CSAT, ajustement stratégie (~2-3h) | 2-3h |
| **Annuel** | Bilan complet Y/Y, ajustement cibles N+1, projections N+1 (~1 jour) | 1 jour |

### Discipline de mesure

| Principe | Application |
|---|---|
| Pas de KPI sans cible | Si tu ne sais pas où tu vas, tu ne sauras pas si tu y arrives |
| Pas de cible sans seuil d'alerte | Si tu n'as pas de seuil, tu ne sauras pas quand agir |
| Pas de seuil sans action | Si tu sais qu'il y a un problème mais que tu ne fais rien, ça ne sert à rien |
| Pas d'action sans suivi | Une action lancée doit avoir son propre suivi (KPI de l'action) |

## Synthèse pour défense soutenance

5 messages clés extractibles slide :

1. **20 KPIs structurés en 4 catégories** (acquisition, engagement,
   monétisation, rétention) avec formules, sources, et cibles annuelles.

2. **Système de feux tricolores** : chaque KPI a un seuil d'alerte qui
   déclenche une action concrète. Pas de mesure passive.

3. **5 triggers prioritaires documentés** : si le téléchargement, la
   conversion, le churn, le NPS ou le LTV/CAC dérivent, action corrective
   immédiate prédéfinie.

4. **Stack analytics low-cost mais professionnelle** : ~50-75 €/mo
   Année 1 (PostHog free + RevenueCat free + Tally free + Google Sheets),
   évolution progressive avec le volume.

5. **Cadence de revue disciplinée** : quotidien (5 min) → hebdo (15 min)
   → mensuel (1h) → trimestriel (2-3h) → annuel (1 jour). Pas un
   tableau de bord muséal, un outil opérationnel actionnable.
