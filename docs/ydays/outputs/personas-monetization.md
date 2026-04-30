# Monétisation par persona — analyse approfondie

**Finalité** : matière pour le bloc 5 (BM + Perspectives) et complément du
[Business Model Canvas](business-model-canvas.md). Concrétise les hypothèses
freemium initiales en willingness-to-pay (WTP), lifetime value (LTV) et
retention par persona.

**Sources** : 5 personas canoniques de
[user_personas.md](../../personas/user_personas.md), benchmarks B2C subscription
2026, audit concurrentiel ([competitive-deep-dive.md](competitive-deep-dive.md)).

## Cadre méthodologique

Pour chaque persona, on documente 6 dimensions :

| Dimension | Question |
|---|---|
| **Profil & contexte** | Qui, situation de vie, motivations brassage |
| **Canal d'acquisition** | Où il/elle découvre l'app |
| **Engagement attendu** | Fréquence d'usage, profondeur, comportements |
| **Willingness-to-pay** | Combien (€/mo ou one-shot), pour quoi |
| **Risque de churn** | Quand et pourquoi il/elle pourrait partir |
| **KPIs à suivre** | Métriques mesurables |

## Synthèse multi-personas

| Persona | Tier produit | WTP/mois | LTV estimée | Acquisition principale |
|---|---|---|---|---|
| **Léa la Curieuse** | Free | 0 € | Indirecte (conversion vers Nicolas) | Scan / kit cadeau / YouTubers |
| **Nicolas le Débutant N1** | Premium | ~3 € | 54 € (18 mois × 3 €) | Conversion Léa / kit / YouTubers |
| **Claire l'Amatrice** | Premium → Pro | 3-5 € | 108-288 € (36 mois) | Bouche-à-oreille / migration Brewfather |
| **Zoé Éco-responsable** | Premium | 3-4 € | 84 € (24 mois × 3,5 €) | Asso ESS / partenariats éthiques |
| **Marc Expert (Marc-Switcher)** | Pro | 6-10 € | 384 € (48 mois × 8 €) + evangelist ×5-10 acquisitions indirectes | Forums experts / Reddit |

## Persona 1 — Léa la Curieuse

### Profil

Découvreuse, jamais brassé, urbaine 25-35 ans, prof libérale, urbaine. Persona
soutenance hero (primary v0.1 demo).

### Acquisition

4 scénarios d'entrée probables :

| Scénario | Probabilité | Engagement initial |
|---|---|---|
| Kit reçu en cadeau (Noël, anniversaire) | Très haute | Forte motivation immédiate |
| Scan curiosité bière du commerce | Moyenne | Faible (juste curieuse) |
| Vidéo YouTube tendance | Variable | Très court terme |
| Influence sociale (ami brasseur) | Moyenne | Moyen terme si l'ami soutient |

### Willingness-to-pay

**0 € direct.** Léa correspond à un archétype B2C bien étudié — explorateur à
faible engagement. Caractéristiques :

- Seuil d'engagement très bas, abandonne facilement à la moindre friction
- Convertible seulement si valeur immédiate (bénéfice dans les 5 premières minutes)
- Taux de churn très élevé même sur free tier

### Insight stratégique

**Léa n'est pas la persona à monétiser. C'est la persona à recruter.**

Son rôle dans le funnel :

- Volume d'entrée maximal (les 4 scénarios la rendent abondante)
- Conversion progressive vers Nicolas (devient brasseur régulier)
- Bouche-à-oreille auprès de son entourage (amplification)
- Revenu indirect via LTV de sa conversion en Nicolas/Claire

### KPIs

- Taux d'activation (premier brassin lancé)
- Taux de conversion vers Nicolas (3e recette ou 1ère session)
- Volume mensuel d'entrées Léa par canal
- Temps moyen avant conversion ou abandon

## Persona 2 — Nicolas le Débutant

### Profil

Niveau **N1 — Premier kit, 1-2 brassins** (cible produit principale). Tech-savvy,
veut crédibilité DIY (être perçu comme brasseur). 25-40 ans, métiers tech ou
créatifs, urbain/périurbain.

### Comportements typiques

- A déjà investi : kit ~50-100 € (signal d'engagement)
- Cherche des guides FR structurés (frustré par concurrents EN-first)
- Tient un suivi minimal (carnet papier, notes téléphone, photos)
- Regarde YouTube brassage (1-3 chaînes francophones)
- Pose des questions sur Discord / Reddit / forums BrassageAmateur
- Veut afficher ses brassins (Instagram, conversations)
- Envisage l'all-grain comme prochaine étape

### Frustrations actuelles avec les outils existants

- Brewfather/BeerSmith trop complexes pour son niveau
- Equipment Profile imposé en onboarding
- Pas assez de guides FR
- Difficulté à savoir si sa recette est cohérente

### Willingness-to-pay

**~3 €/mois (24-30 €/an annuel).** Sweet spot aligné sur Brewfather (~30 €/an)
et Little Bock (~24 €/an). Tech-savvy donc OK avec subscription. Engagement
réel (kit investi) justifie un petit prix.

### Parcours de vie Nicolas (modélisation funnel)

```
   ENTRÉE              LIFE AS NICOLAS                  SORTIE
                                                         │
   Léa la Curieuse                                       ├── ➜ Claire/Marc (~30%)
       ↓                                                 │    devient confirmé
   Nicolas le Débutant ──── 6-18 mois ─────────────────── ┤
       ↑                                                 ├── ➜ Abandon (~50%)
   Direct (kit cadeau)                                   │    perd l'intérêt
   Direct (motivation perso)                             │
                                                         └── ➜ Reste Nicolas (~20%)
                                                              passion stable longue durée
```

### KPIs

- Recettes créées par utilisateur (cible >2)
- Taux conversion Free → Premium (cible 15 % des Nicolas Free)
- Retention 12 mois (cible 70-80 %)
- LTV (cible 54 €)

## Persona 3 — Claire l'Amatrice Créative

### Profil démographique enrichi

| Dimension | Hypothèse |
|---|---|
| Âge | 30-45 ans |
| Genre | Plus 50/50 que les autres personas (segment qui s'ouvre aux femmes) |
| Profession | Cadre, professions créatives, indépendants |
| Géographie | Métropole, périurbaine bobo, milieux artisanaux |
| Revenu mensuel | 2 500-4 500 € net |
| Budget brassage | ~30-100 €/mois (équipement progressif + ingrédients) |
| Plateforme préférée | iPhone (60 %) / Android (40 %) |

### Comportement de brassage

- Fréquence : 1-2 brassins/mois
- Variété : aime tester différents styles BJCP
- Durée d'un brassin : 3-6 semaines
- Carnet : tient un journal détaillé
- Partage : poste sur Instagram/Discord
- Apprentissage : lit blogs FR, suit YouTubers, achète livres

### Frustrations actuelles

- Brewfather : trop technique, EN-first, manque de chaleur visuelle
- Little Bock : web only, fonctions design pauvres
- BeerSmith : interface datée, photos pas valorisées
- Aucun ne valorise vraiment l'aspect créatif/artistique du brassage

### Willingness-to-pay

**3 €/mois Premium → upgrade Pro 5 €/mois selon usage.** Engagement long et
revenus confortables. Peut accepter un palier supérieur si water chemistry,
exports avancés, AI assistant utilisés.

### KPIs

- Recettes créées + photos partagées
- Sessions complètes documentées
- NPS (cible >40)
- Retention 12 mois (cible 85-90 % Premium, 90-95 % Pro)

## Persona 4 — Zoé la Brasseuse Éco-responsable

### Profil démographique enrichi

| Dimension | Hypothèse |
|---|---|
| Âge | 25-40 ans (souvent millennial / gen Z) |
| Genre | Sur-représentation femmes / non-binaires |
| Profession | ESS, indépendant, créatif, cadre engagé |
| Géographie | Métropole/villes moyennes, milieu engagé |
| Revenu mensuel | 2 000-3 500 € net |
| Communautés | Asso brassage locales, ESS, slow food, zero waste |

### Comportement de brassage

- Fréquence : 1 brassin/mois ou plus espacé (qualité > fréquence)
- Choix ingrédients : bio, locaux, circuits courts
- Valorisation drêches : pain, biscuits, compost, alimentation animale
- Partage : moins focus produit fini, plus focus process et impact

### Frustrations actuelles

- Aucun outil ne valorise la dimension durable du brassage
- Pas de calculateur d'empreinte (CO2, eau, déchets)
- Pas de marketplace ingrédients bio/locaux
- Pas de section drêches (recettes, valorisation)

### Willingness-to-pay

**~3-4 €/mois Premium si valeurs alignées.** Engagement éthique fort mais
revenus modestes. Sensible au modèle (refusera l'app si revente données ou
pub agressive). Bonus possible si l'app supporte une asso/cause (ex. « 1 €
par mois reversé à... »).

### KPIs

- Engagement section drêches (consultations, partages)
- Sensibilité à la pub (NPS spécifique sur cette dimension)
- Retention 12 mois (cible 75-85 %)
- LTV (cible 84 €)

## Persona 5 — Marc le Brasseur Expert

### Profil démographique enrichi

| Dimension | Hypothèse |
|---|---|
| Âge | 35-55 ans |
| Genre | Très majoritairement masculin (cohérent démographie FR : 79 % hommes) |
| Profession | Ingénieur, technicien, dev, scientifique, métiers techniques |
| Revenu mensuel | 3 500-6 000 € net |
| Budget brassage | Important (1 000-5 000 € équipement + 50-150 €/mois ingrédients) |
| Plateformes | Reddit r/Homebrewing, forums spécialisés, GitHub, blogs techniques |

### Comportement de brassage

- Fréquence : 2-4 brassins/mois (passion intensive)
- Style : all-grain exclusivement, recettes adaptées
- Matériel : système type Grainfather / RIPlas / fait-maison sophistiqué
- Mesure : tout (densité, pH, température, taux atténuation)
- IoT : possède Tilt, iSpindel, capteurs température
- Compétitions : participe à des concours BJCP

### Sous-types Marc identifiés

| Sous-type | Profil | WTP | Priorité acquisition |
|---|---|---|---|
| **Marc-Switcher** (vient de Brewfather) | Insatisfait actuellement, cherche alternative FR | 8-10 €/mo | **Haute** : conversion evangéliste |
| Marc-Bootstrap (pas d'app actuelle) | Tient son journal Excel manuel | 5-8 €/mo | Moyenne |
| Marc-Hardcore (hardware sophistiqué) | Système Grainfather + IoT déjà setup | 10-15 €/mo | Moyenne (volumes faibles) |

→ Cible prioritaire = **Marc-Switcher** (insatisfait Brewfather, cherche FR-first).

### Coût de switching depuis Brewfather

Marc utilise probablement déjà Brewfather Premium (~30 €/an payés). S'il
switche, il perd recettes accumulées (30-100), intégrations IoT configurées,
historique de sessions, habitudes UX.

**Implications pricing Brasse-Bouillon** :

- Import BeerXML obligatoire dès Phase 1 Pro
- Période d'essai longue (~30 jours Pro) pour qu'il teste sans contraste
- Migration assistée (script ou doc d'import recettes Brewfather)
- Pricing -50 % la 1ère année pour casser le coût de switch

### Effet evangelist

Marc n'est pas seulement un client payant — c'est un **multiplicateur d'audience** :

- Il poste des reviews longues sur Reddit r/Homebrewing
- Il fait des comparaisons techniques sur les forums
- Il est régulièrement consulté par des Nicolas/Claire de son entourage
- Il influence les décisions d'achat de 5-10 brasseurs autour de lui

→ **1 Marc converti = 5-10 utilisateurs potentiels acquis indirectement.** Son
ROI marketing dépasse son revenu direct.

### Willingness-to-pay

**~6-10 €/mois (60-100 €/an Pro tier).** Limite haute : 12-15 €/mo si AI très
puissante + IoT avancé + API illimitée. Achetera annuel systématiquement si
discount > 25 %.

### KPIs

- Conversion Marc-Switcher (% de Marc qui migrent depuis Brewfather avec proof)
- Volume export BeerXML (preuve d'usage Pro tier)
- Retention 12 mois (cible 90-95 %)
- LTV (cible 384 €)
- Acquisitions indirectes attribuables (effet evangelist)

## Top 5 leviers de rétention identifiés

Sur la base de l'audit concurrence et des benchmarks B2C 2026, 5 leviers
priorisés pour Brasse-Bouillon :

| # | Levier | Mécanisme | Effort dev | Impact rétention |
|---|---|---|---|---|
| 1 | **Onboarding ultra-soigné** | Première semaine = +30 % rétention selon benchmarks B2C 2026 | Moyen | ⭐⭐⭐ |
| 2 | **Lock-in données positif** | Recettes accumulées + journal = ne veut pas perdre l'historique | Faible (vient naturellement) | ⭐⭐⭐ |
| 3 | **Cycle naturel brassage** | 3-6 semaines/brassin = check-ins réguliers obligés | Faible | ⭐⭐⭐ |
| 4 | **Communauté FR vivante** | Voir d'autres brasseurs = motivation sociale | Élevé | ⭐⭐⭐ |
| 5 | **Personnalisation IA** | App apprend tes goûts, suggère des recettes ciblées | Élevé | ⭐⭐⭐ |

À éviter Phase 1-3 produit : gamification (risque de casser le ton « mentor
brassicole sérieux »), notifications mal calibrées.

## Synthèse pour défense soutenance

3 messages clés extractibles slide :

1. **Mix funnel projeté 75 % Premium / 25 % Pro** → ARPU blendé ~4,75 €/mo,
   cohérent avec cible 1 000 payants × 4,75 € × 12 = ~57 K€/an.
2. **Marc-Switcher = persona à plus haut ROI** : LTV directe 384 € + effet
   evangelist ×5-10 acquisitions indirectes. Justifie l'effort import BeerXML
   et migration discount.
3. **Léa = persona volume zéro revenu direct** : sa valeur est dans la
   conversion vers Nicolas/Claire/Marc (LTV indirecte). Le free tier doit
   couvrir son expérience complète sans frustration.
