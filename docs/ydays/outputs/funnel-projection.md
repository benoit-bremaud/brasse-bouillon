# Funnel et projection d'acquisition — soutenance 27 mai 2026

**Finalité** : matière chiffrée pour le bloc 5 (BM + Perspectives). Modélise
le funnel d'acquisition Brasse-Bouillon de manière chiffrée pour atteindre la
cible « 1 000 utilisateurs payants à 3-5 ans » et un revenu net mensuel de
~3 500 €.

**Sources** : benchmarks B2C subscription 2026, audit concurrentiel
([competitive-deep-dive.md](competitive-deep-dive.md)), monétisation par persona
([personas-monetization.md](personas-monetization.md)).

## Cible retenue

| Métrique | Valeur cible |
|---|---|
| Horizon | 3-5 ans |
| Utilisateurs payants | 1 000 |
| ARPU mensuel blendé | ~4,75 € |
| MRR cible (Année 3) | ~4 800 € |
| Revenu net mensuel cible | ~3 500 € (objectif « vivre de l'app ») |

## Benchmarks B2C 2026 (référentiel)

| Étape funnel | Taux standard B2C | Brewfather (référence niche) |
|---|---|---|
| Téléchargements → Actifs mensuels | 30-40 % | ~40 % (engagement brassage élevé) |
| Actifs → Free réguliers | 50 % | ~50 % |
| Free → Premium payants | 1-5 % | ~10-20 % (niche engagée) |
| Premium → Pro upgrade | 5-15 % | ~35 % (Brewfather Plus AI 2026) |

Le brassage est une niche **plus engagée** que la moyenne B2C (kit acheté,
équipement, passion). Conversion meilleure qu'attendu.

## Funnel modélisé Brasse-Bouillon

| Étape | Taux retenu | Volume cumulé (cible 3-5 ans) |
|---|---|---|
| Téléchargements totaux | base 100 % | **50 000** |
| Actifs mensuels | 30 % | 15 000 |
| Free réguliers (≥1 brassin/3 mois) | 50 % | 7 500 |
| **Premium payants** | 10 % des Free réguliers (= 1,5 % des téléchargements) | **750** |
| **Pro upgraders** | 35 % des Premium payants | **263** |
| **Total payants** | | **~1 000** |

## Mix par persona

| Persona | % funnel actifs | % payants direct | Volume payants | Tier |
|---|---|---|---|---|
| Léa la Curieuse | 50 % (7 500) | 0 % | **0 (Free)** | Free |
| Nicolas le Débutant | 30 % (4 500) | 60 % du total payants | **600** | Premium |
| Claire l'Amatrice | 12 % (1 800) | 25 % du total payants | **250** (175 Premium + 75 Pro) | Premium → Pro |
| Zoé Éco-responsable | 5 % (750) | 5 % du total payants | **50** (45 Premium + 5 Pro) | Premium |
| Marc le Brasseur Expert | 3 % (450) | 10 % du total payants | **100** (25 Premium + 75 Pro) | Pro |

→ Total : **1 000 payants**, dont ~250 Pro (25 %) et ~750 Premium (75 %).

## Vérification ARPU et revenu

| Persona | Volume × Prix | Revenu mensuel |
|---|---|---|
| Nicolas (600 Premium × 3 €) | | 1 800 € |
| Claire (175 Premium × 3 € + 75 Pro × 8 €) | | 1 125 € |
| Zoé (45 Premium × 3,5 € + 5 Pro × 8 €) | | 198 € |
| Marc (25 Premium × 3 € + 75 Pro × 8 €) | | 675 € |
| **Total brut/mois** | | **~3 800 €** |
| **Total net/mois** (90 % marge) | | **~3 420 €** |
| **Total brut/an** | | **~46 K€** |

→ Cohérent avec la cible « 3 500 €/mois net sur 3-5 ans ». Marge stretch si
Marc-Switcher conversion supérieure à hypothèse.

## Cohort buildup sur 3 ans

Hypothèse : acquisition non-linéaire — démarrage lent, croissance accélérant
grâce à effet evangelist Marc + YouTubers + bouche-à-oreille.

| Période | Nouveaux payants/mois | Total payants | Revenu mensuel brut |
|---|---|---|---|
| Mois 1-6 (lancement) | ~10/mois | ~50 → 100 | ~250-450 € |
| Mois 7-12 (montée) | ~30/mois | ~250 | ~1 100 € |
| Mois 13-24 (effet YouTubers) | ~50/mois | ~500-700 | ~2 500-3 200 € |
| Mois 25-36 (cible) | ~25/mois (croissance pondérée par churn) | ~1 000 | **~4 500 €/mois** |
| Mois 37-60 (long terme) | ~30/mois | ~1 500-2 000 | ~7 000-9 000 €/mois |

→ Année 1 cumul : ~15 K€, Année 2 : ~30 K€, Année 3 : ~50 K€ brut.

## Effet evangelist Marc — multiplicateur organique

100 Marc × 7,5 acquisitions indirectes (moyenne) = **750 acquisitions
indirectes** sur 3 ans, soit ~75 % des acquisitions.

→ Marketing organic prioritaire, CAC payant minimal nécessaire. Cohérent avec
la posture solo dev sans budget marketing massif.

## Sensibilité du modèle

| Levier | Impact si défavorable -20 % | Impact si favorable +20 % |
|---|---|---|
| Téléchargements | -20 % payants | +20 % payants |
| Conversion Free → Premium | -20 % | +20 % |
| Retention Premium | -25 % LTV | +25 % LTV |
| Mix Pro % | -15 % ARPU | +15 % ARPU |

**Combinaison 2 facteurs défavorables** : ~2 500 €/mois net (sous cible mais
survie OK, complétée par revenu agence web freelance).

**Combinaison 2 facteurs favorables** : ~4 500 €/mois net (au-dessus cible,
marge confortable).

## Retention et LTV par persona

| Persona | Retention 12 mois | Durée moyenne abonnement | LTV (ARPU × durée) |
|---|---|---|---|
| Léa | N/A (free) | N/A | Conversion vers Nicolas (LTV indirecte) |
| **Nicolas** | 70-80 % | ~18 mois | 18 × 3 € = **54 €** |
| **Claire Premium** | 85-90 % | ~36 mois | 36 × 3 € = **108 €** |
| **Claire Pro** | 90-95 % | ~36 mois | 36 × 8 € = **288 €** |
| **Zoé** | 75-85 % | ~24 mois | 24 × 3,5 € = **84 €** |
| **Marc Pro** | 90-95 % | ~48-60 mois | 48 × 8 € = **384 €** |

→ Marc et Claire Pro = LTV 4-5× supérieure à Nicolas. **Cibler ces personas a
un effet de levier financier majeur.**

## KPIs par étape du funnel

### KPIs d'acquisition

| KPI | Définition | Cible Année 3 |
|---|---|---|
| Téléchargements mensuels | Combien de personnes installent l'app par mois | ~2 000/mois |
| CAC | Coût d'acquisition d'un utilisateur payant | <10 € |
| Activation rate | % de téléchargeurs qui font leur 1ᵉʳ brassin | >40 % |

### KPIs d'engagement

| KPI | Définition | Cible Année 3 |
|---|---|---|
| DAU/MAU | Daily Active Users / Monthly Active Users (ratio) | >25 % |
| Sessions par mois | Combien de fois l'utilisateur ouvre l'app | >8 |
| Recettes créées par utilisateur | Volume de contenu créé | >2 |

### KPIs de monétisation

| KPI | Définition | Cible Année 3 |
|---|---|---|
| MRR (Monthly Recurring Revenue) | Revenu mensuel récurrent | ~4 800 € |
| ARPU | Revenu moyen par utilisateur payant | ~4,75 €/mois |
| Conversion Free → Paid | % de gratuits qui deviennent payants | >10 % |
| LTV | Revenu cumulé moyen par client | >120 € |

### KPIs de rétention

| KPI | Définition | Cible Année 3 |
|---|---|---|
| Churn mensuel | % d'utilisateurs payants qui partent par mois | <2 % |
| Retention 12 mois | % d'utilisateurs encore là 1 an après inscription | >75 % |
| NPS | Net Promoter Score (recommandation) | >40 |

## 3 scénarios alternatifs (matrice slide soutenance)

| Variable | Conservateur (-20 %) | Médian (hypothèse) | Agressif (+20 %) |
|---|---|---|---|
| Téléchargements 3 ans | 40 000 | 50 000 | 60 000 |
| Conversion Free → Paid | 8 % | 10 % | 12 % |
| Mix Pro | 20 % | 25 % | 30 % |
| ARPU | 4 € | 4,75 € | 5,50 € |
| **Payants Année 3** | **640** | **1 000** | **1 440** |
| **MRR Année 3** | **2 600 €** | **4 800 €** | **7 900 €** |
| **Net mensuel** | **~2 100 €** | **~3 400 €** | **~6 200 €** |
| Verdict | Survie + freelance d'appoint | Cible atteinte ✓ | Au-delà cible |

## Implications stratégiques

1. **Le modèle est robuste** : même -20 % sur deux leviers, on reste viable
   (~2 500 €/mois net) en complément du revenu freelance d'agence web.
2. **Le scénario médian atteint la cible** sans hypothèses agressives.
3. **L'effet evangelist Marc est le plus gros levier non-marketing** : il
   absorbe 75 % des acquisitions sans dépense pub.
4. **Le mix 75/25 Premium/Pro** est conservé même en scénario défavorable —
   c'est une caractéristique structurelle du marché brassage amateur, pas un
   choix arbitraire.
