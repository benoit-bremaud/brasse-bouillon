# Soutenance Ydays — 2026-05-27

Dossier opérationnel pour la préparation de la soutenance finale Ydays du projet
Brasse-Bouillon. Tous les livrables, décisions et drafts liés à la présentation
orale du 27 mai 2026 vivent ici.

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
└── debrief/                               ← décisions et historique sessions
    ├── 2026-04-15_session-decisions.md    D1-D10, R1-R6 (Q&A initial)
    └── 2026-04-16_session-decisions.md    A0 (hybride), A1 (KISS scanner), trous factuels
```

## Décisions figées

- **A0 — Découpage 30 min** : hybride parcours+experts. Macro = parcours
  utilisateur Avant/Pendant/Après brassage + BM + Perspectives + Démo. Des
  interventions expertes 1-2 min par pôle (Dev / Création / Marketing)
  s'ancrent dans chaque temps.
- **A1 — USP démo** : KISS + YAGNI. Le scanner code-barre est la démo live
  (déjà intégré mobile, audit feature ✅). `beer-label-ai` reste en R&D,
  mentionné une phrase en Perspectives — pas de démo live.

## Références grille Pitch Entrepreneurial

Sous-issues #522–#528 mappées aux critères d'évaluation (`sprint:6`) :

| Issue | Critère | Points |
|-------|---------|--------|
| #522 | Elevator pitch | 15 |
| #523 | Objectifs SMART | 15 |
| #524 | Business model + innovation | 30 |
| #525 | Démo live | 30 |
| #526 | Perspectives (légal / RH / GTM / budget) | 20 |
| #527 | Slide deck | 15 |
| #528 | Répétitions | 15 |

## Règle de session

Tout contenu riche produit en session (drafts, décisions, analyses, SMART,
canvas) doit être persisté ici au fil de l'eau. Rien en mémoire de conversation
uniquement — commit sur la branche dédiée `docs/soutenance-27-mai` pour
traçabilité.

## Historique

- 2026-04-15 — Q&A initiale, D1–D10 décisions, R1–R6 points en revue
- 2026-04-16 — Audit features re-produit, décisions A0 + A1 figées,
  méthode de dérivation SMART repo-sourced
