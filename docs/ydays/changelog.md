# Changelog du site

Historique des évolutions de ce site VitePress de préparation de la
soutenance Ydays du 27 mai 2026. Les entrées sont en ordre
anti-chronologique (la plus récente en haut).

**Format retenu** : `YYYY.MM.DD-N` où `N` est le numéro de déploiement
du jour (ex. `2026.04.23-1` = premier déploiement du 23 avril 2026).

## 2026.04.23-4

**Audit Bloc 3 — Slides et narration**

- canva-working-deck : alignement de toutes les dates de vote sur la
  nouvelle deadline lundi 2026-05-04 (matérialisation mardi 2026-05-05),
  cohérent avec la home et read-first.
- slide-deck-outline : retrait du bullet "Ratio prix 2,10€/L vs 6€/L"
  dans S4 (résidu pré-Path B), remplacé par la punchline P2 « Tu
  commences quand ? » qui correspond à la saynète V1-cut réelle.
- slide-deck-outline : mapping table refondu sur les 4 catégories
  réelles de la grille Pitch Entrepreneurial (Pitch / Production /
  Perspective / Qualité orale + coup de cœur), au lieu des références
  fictives #522-#527.
- slide-deck-outline : workflow de production daté du 2026-04-19 marqué
  "partiellement dépassé" avec un encart pointant vers la checklist de
  statut comme source de vérité courante. D+15 réaligné sur la deadline
  vote 2026-05-04, D+17 ajouté pour l'oral blanc 2026-05-06.
- pitch-transitions : T2 "Pendant huit minutes" corrigé en "Pendant
  cinq minutes" (le bloc 3 a été comprimé à 5 min).

Note : les 6 scripts blocs (pitch-script-bloc1 à bloc6) **n'ont pas été
audités en profondeur** dans cette passe — passe ciblée à programmer
plus tard sur cohérence chiffres + durées.

## 2026.04.23-3

**Audit Bloc 2 — Soutenance cœur stratégique**

- Plan : retrait de la référence aux "7 critères (issues #522-#528)"
  obsolètes (mapping fictif), remplacée par les 4 catégories réelles
  de la grille Pitch Entrepreneurial (Pitch / Production / Perspective
  / Qualité orale + coup de cœur).
- Plan : script bloc 3 marqué comme "à mettre à jour pour 5 min" est
  maintenant simplement cité comme "seconde-par-seconde 5 min" (le
  script a déjà été réécrit).
- Plan : tracking oral blanc T10 pointe désormais sur issue #577
  (action concrète) avec l'épic #536 en référence.
- Risk-analysis : D8 corrigé "90 s" → "5 min" (le budget bloc 3 a
  changé depuis la rédaction initiale du risque).
- Risk-analysis : L6 corrigé "06/05" → "2026-05-06" pour cohérence.

**Deadline vote deck Canva**

- Reportée au **lundi 2026-05-04 23h59** (au lieu de dimanche 05-03)
  pour laisser un jour ouvré avant l'oral blanc du 6 mai.

## 2026.04.23-2

**Audit Bloc 1 — Entrée et prise en main**

- Home : vote deck Canva deadline reportée au **dimanche 2026-05-03
  23h59** (avant oral blanc du 6 mai) au lieu du 24 avril désormais
  obsolète.
- Read-first : parcours de lecture mis à jour pour intégrer les 3
  nouveaux sas (`/pitch-overview`, `/qa-overview`, `/risks-overview`),
  `/outputs/hosting-strategy` et `/changelog`. Retrait du lien
  `/README` redondant avec la home.
- Read-first : vote deck aligné sur la même deadline 2026-05-03.

## 2026.04.23-1

**Feature — site version + changelog**

- Affichage du numéro de version dans le footer de chaque page,
  avec lien vers cette page changelog.
- Création de cette page (`/changelog`) pour tracer les évolutions
  importantes du site.
- Ajout d'une étape "bump version + entrée changelog" dans le runbook
  de déploiement Cloudflare Pages.

**Contenu — 3 pages overview**

- Nouvelles pages `/pitch-overview`, `/qa-overview`, `/risks-overview`
  qui servent de sas d'entrée vers les documents longs correspondants.
- Backlog YD-VP-05 fermé.

**Contenu — stratégie d'hébergement backend**

- Nouveau doc `/outputs/hosting-strategy` formalisant le plan A
  (Klouders) et plan B (Fly.io) pour la démo live du 27 mai.
- Ajout d'un item P0 au chemin critique de la checklist soutenance.
- Cloudflare explicitement écarté pour l'API NestJS + SQLite.

## 2026-04-22 (pré-versioning)

- Premier déploiement sur Cloudflare Pages (`brasse-bouillon-ydays.pages.dev`)
- Mode de diffusion retenu : public non indexé, partage par lien direct
- En-têtes `X-Robots-Tag: noindex` embarqués dans le build
- Ajout page home, sidebar, read-first, feedback-guide, scripts/slides/references/history overviews
- Logo PNG, vote équipe sur le deck Canva, index nav tranché

## 2026-04-19 et avant (pré-versioning)

- Bootstrap VitePress dans `docs/ydays/`
- Rédaction des 6 scripts blocs + transitions + saynète (V0, V1, V1 cut, storyboard)
- Q&A anticipées (20 questions / 6 thèmes)
- Risk analysis (28 risques / 4 familles S D C L)
- Business Model Canvas, SMART objectives par pôle
- Pitch hook variants, saynète V1 chrono-fit sous 2:30
- Deck Canva S0-S14 détaillé + squelette 15 slides

## Comment mettre à jour ce changelog

À chaque redéploiement significatif du site :

1. Bumper le champ `version` dans [package.json](./package.json) au format `YYYY.MM.DD-N`
2. Ajouter une entrée en haut de ce fichier décrivant brièvement ce qui change
3. Rebuilder et redéployer via le runbook [cloudflare-pages-deployment](/outputs/cloudflare-pages-deployment)

Une "mise à jour significative" = ajout de page, changement de navigation, changement de script de pitch, nouveau doc pivot. Les typo et micro-corrections ne justifient pas forcément un bump.
