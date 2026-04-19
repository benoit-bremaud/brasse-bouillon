# Debrief session 2026-04-16 — Figer A0/A1 + consigner la matière

## Contexte

Session de consolidation suite au debrief 2026-04-15 (partiellement
perdu). Objectif : **reproduire factuellement ce qui devait être
consigné** (audit features, 36 SMART, plan 30 min) et **figer les
décisions restées ouvertes** sur la structure du pitch et la démo live.

La session a aussi posé une **règle opérationnelle** : persister quasi
systématiquement le matériel produit en session.

## Décisions prises

### A0 — Découpage 30 minutes : hybride parcours + experts

- Macro = parcours utilisateur **Avant / Pendant / Après brassage** +
  Business Model + Perspectives + Démo live.
- **Interventions expertes 1-2 min** ancrées dans chaque bloc
  thématique (Dev / Création / Marketing), pas concentrées en bloc
  séparé.
- Réconcilie la D4 du debrief 15/04 avec les issues #527/#528.
- Table de maillage parcours → voix → expert détaillée dans
  [../outputs/plan-presentation-27-mai.md](../outputs/plan-presentation-27-mai.md)
  § Principes directeurs.

### A1 — USP démontrable : scanner code-barre (KISS + YAGNI)

- Scanner code-barre déjà intégré mobile, audit feature ✅ stable
  ([audit-features-mvp.md](../outputs/audit-features-mvp.md) #10).
- Fallback photo disponible si le scan échoue.
- `beer-label-ai` reste en R&D, mentionné **une phrase** en
  Perspectives. Pas de démo live, pas de vidéo backup à tourner.
- Économie Sprint 5 estimée 5-15h de dev.

### Méthode de dérivation des 36 SMART : repo-sourced

- Chaque SMART cite **un fichier / section du repo** comme source
  factuelle.
- Toute affirmation chiffrée non vérifiable dans le repo est marquée
  `[trou factuel]` et listée en fin de chaque output + dans ce debrief.
- Livrable :
  [../outputs/smart-objectives-par-pole.md](../outputs/smart-objectives-par-pole.md)
  (36 SMART, 6 rétrospectifs + 6 prospectifs × 3 pôles).

### Règle opérationnelle persistance

- **Tout contenu riche (drafts, décisions, analyses, SMART, canvas,
  scripts) doit être écrit sur disque au fil de l'eau**, même en WIP.
- Pas de stockage long-terme en mémoire de conversation.
- Cible : `docs/ydays/` ; commit immédiat sur branche dédiée
  `docs/soutenance-27-mai` pour traçabilité.

## Travaux faits dans la session

### T7 — Audit features MVP

- Méthode : agent Explore factuel sur le code, comptage tests,
  traçage fichiers clés.
- Résultat : 8/11 stables, 2/11 partielles (Recettes/Batches en
  read-only ; Boutique exclue ; Matériel sans E2E mobile), 1/11 R&D
  (`beer-label-ai`).
- Livrable :
  [../outputs/audit-features-mvp.md](../outputs/audit-features-mvp.md).

### T11 — Vérification issues #522-#528

- Les 7 sous-issues sous #393 (soutenance) sont **ouvertes**, toutes
  assignées à Sprint 6 (6-27 mai), source
  [PROJECT_LOG.md](../../../PROJECT_LOG.md) entrée 2026-04-01.
- Mapping aux critères de la grille Pitch Entrepreneurial confirmé.
- Incohérences R2 (parcours démo) et R6 (BM partiel) résolues par
  A0 / A1 ci-dessus.

### Consignation des livrables

- [docs/ydays/README.md](../README.md) — index
- [docs/ydays/outputs/audit-features-mvp.md](../outputs/audit-features-mvp.md)
- [docs/ydays/outputs/smart-objectives-par-pole.md](../outputs/smart-objectives-par-pole.md)
- [docs/ydays/outputs/plan-presentation-27-mai.md](../outputs/plan-presentation-27-mai.md)
- [docs/ydays/debrief/2026-04-15_session-decisions.md](2026-04-15_session-decisions.md) (placeholder)
- Ce debrief

## Trous factuels à combler par le user

Avant la soutenance (fenêtre utile : avant J-7 = 2026-05-20). Ces trous
bloquent la clôture de SMART ou de blocs du plan.

| # | Question | Impact | Priorité |
|---|----------|--------|----------|
| 1 | Durée officielle présentation vs Q&A (20+10 ? 15+15 ?) | Plan 30 min | Haute |
| 2 | Sondage interne "63,3 % / 54 répondants / 2 personas validés" — traçable dans le repo ? | SMART #29, slide Marketing | Haute |
| 3 | Landing page live — existence, URL, KPI trackés ? | SMART #34, plan Bloc 6 | Haute |
| 4 | Tagline canonique Brasse-Bouillon — emplacement de référence ? | SMART #30, identité visuelle | Moyenne |
| 5 | Statut recrutement pôle Marketing (confirmé / en cours / non démarré) ? | SMART #31, Perspectives RH | Haute |
| 6 | Niveau d'accessibilité actuel (WCAG 2.1) ? | SMART #21 | Basse |
| 7 | Décompte exact des wireframes livrés (11 attendus) | SMART #13 | Moyenne |
| 8 | Modèle de monétisation précis (freemium, prix, CA année 1) | BMC, Perspectives budget | Haute |
| 9 | Analyse concurrentielle formalisée (hors `target_audience.md`) ? | Pitch, Q&A | Moyenne |
| 10 | Réaliste d'atteindre 1 000 pré-inscriptions avant V1.0 ? | SMART #34 | Moyenne |

## Tâches restantes ordonnées

Par ordre d'exécution recommandé après cette session :

1. **T2** — `outputs/business-model-canvas.md` (9 blocs BMC). Bloque le
   bloc 5 du plan et le critère #524.
2. **T3** — Accroche pitch ≤ 15 mots. À intégrer dans plan Bloc 1.
3. **T4** — Valider / actualiser les 3 personas (le 3e "Marc" existe
   déjà). Tâche courte.
4. **T6** — Script démo live seconde par seconde (annexe du plan).
5. **T12** — Répétitions chronométrées J-7 / J-3 / J-1.
6. **T14** — Dépôt Moodle (slides + PDF + vidéo backup démo si
   requise par l'école).

## Références

- Plan soutenance détaillé :
  [../outputs/plan-presentation-27-mai.md](../outputs/plan-presentation-27-mai.md)
- Audit features :
  [../outputs/audit-features-mvp.md](../outputs/audit-features-mvp.md)
- 36 SMART :
  [../outputs/smart-objectives-par-pole.md](../outputs/smart-objectives-par-pole.md)
- Debrief 15/04 (placeholder) :
  [2026-04-15_session-decisions.md](2026-04-15_session-decisions.md)
- Projet log :
  [../../../PROJECT_LOG.md](../../../PROJECT_LOG.md)
