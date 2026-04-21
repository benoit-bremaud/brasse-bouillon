# Soutenance Ydays — 2026-05-27

Dossier opérationnel pour la préparation de la soutenance finale Ydays du projet
Brasse-Bouillon.

## Format officiel (email Ynov 2026-04-19)

- **Durée : 30 minutes de pitch + 10 minutes de Q&A = 40 minutes total**
- **Salle : 0.301 (R+3, campus Ynov)**
- **Catégorie : Pitch Entrepreneurial**
- **Support à déposer sur Moodle après le passage à l'oral**
- **Séance Ydays du 2026-05-06** : dernière opportunité d'oral blanc
  auprès du coach (à réserver en amont)

## Structure

```
docs/ydays/
├── README.md                              ← ce fichier (index)
├── outputs/                               ← livrables finaux
│   ├── plan-presentation-27-mai.md        plan détaillé des 30 minutes
│   ├── audit-features-mvp.md              audit 11 features + parcours démo
│   ├── smart-objectives-par-pole.md       36 SMART (core 6 + extended 6 × 3 pôles)
│   ├── business-model-canvas.md           BMC 9 blocs (T2)
│   └── risk-analysis.md                   matrice risques + mitigations + checklist J-1
├── debrief/                               ← décisions et historique sessions
│   ├── 2026-04-15_session-decisions.md    D1-D10, R1-R6 (Q&A initial)
│   ├── 2026-04-16_session-decisions.md    A0 (hybride), A1 (KISS scanner), trous factuels
│   └── 2026-04-19_session-decisions.md    format Ynov officiel, pivot web-studio
└── references/                            ← documents officiels Ynov
    ├── README.md                          index du dossier références
    ├── grille-pitch-entrepreneurial.md    transcription grille officielle (80 pts / 4 cat.)
    ├── grille-pitch-entrepreneurial.pdf   PDF original de la grille (coach 2026-04-19)
    └── 2026-03-25_coach-session-summary.md  consignes orales + format détaillé
```

## Décisions figées

- **A0 — Découpage 30 min** : hybride parcours+experts. Macro = parcours
  utilisateur Avant/Pendant/Après brassage + BM + Perspectives + Démo. Des
  interventions expertes 1-2 min par pôle (Dev / Création / Marketing)
  s'ancrent dans chaque temps.
- **A1 — USP démo** : KISS + YAGNI. Le scanner code-barre est la démo live
  (déjà intégré mobile, audit feature ✅). `beer-label-ai` reste en R&D,
  mentionné une phrase en Perspectives — pas de démo live.

## Grille d'évaluation officielle (80 points + 1 coup de cœur)

Grille reçue du coach Ynov (PDF + transcription archivés sous
[references/grille-pitch-entrepreneurial.md](references/grille-pitch-entrepreneurial.md)) :

| Catégorie | Barème | Contenu évalué |
|-----------|--------|----------------|
| **Pitch** | **15** | Accroche percutante, ton, raison d'être, PV, SMART |
| **Production** | **30** | Business model, projet innovant, démo, réalisations, argumentation |
| **Perspective** | **20** | Statut juridique, RH, commercialisation, développement, investissement |
| **Qualité orale** | **15** | Niveau de langue, éloquence, aisance, préparation, gestion du temps, support esthétique |
| **Coup de cœur** | +1 | Bonus jury (Oui / Non) |
| **Total** | **80** (+1) | |

Pondération : **Production = 37,5 %** (la plus lourde) → blocs 2, 3, 4 concentrent 16 min
sur 30. **Perspective = 25 %** → bloc 5. **Pitch = 18,75 %** → bloc 1. **Qualité orale = 18,75 %**
transversal (dépend des répétitions et du support Canva).

### Suivi interne issues GitHub (sprint:6)

Les sous-issues #522–#528 tracent les **livrables internes**, pas des critères de la grille.
Utilisées pour découper le travail en tâches, elles ne correspondent pas à la pondération
officielle.

## Consignes orales (séance coach 2026-03-25)

Voir [references/2026-03-25_coach-session-summary.md](references/2026-03-25_coach-session-summary.md).
Points saillants qui complètent la grille :

- **5 min réservées à la démo finale** dans les 30 min de pitch → impact bloc 3
- **Vidéo backup démo obligatoire** — les excuses techniques ne sont pas acceptables
- **Jury pluridisciplinaire** (tech / créa / market-com / audio-visuel) → vulgarisation + preuves
- **Ne pas lire ses notes** → mémorisation + supports mots-clés
- **Soutenance blanche 35 min** à réserver auprès du coach pour le 2026-05-06

## Règle de session

Tout contenu riche produit en session (drafts, décisions, analyses, SMART,
canvas) doit être persisté ici au fil de l'eau. Rien en mémoire de conversation
uniquement — commit sur la branche dédiée `docs/soutenance-27-mai` pour
traçabilité.

## Historique

- 2026-04-15 — Q&A initiale, D1–D10 décisions, R1–R6 points en revue
- 2026-04-16 — Audit features re-produit, décisions A0 + A1 figées,
  méthode de dérivation SMART repo-sourced
- 2026-04-19 — Format Ynov officiel reçu (30+10 min, salle 0.301),
  pivot Perspectives RH #5 : recrutement marketing → vision agence
  web-studio (brainstorming à programmer)
