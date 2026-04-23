# Changelog du site

Historique des évolutions de ce site VitePress de préparation de la
soutenance Ydays du 27 mai 2026. Les entrées sont en ordre
anti-chronologique (la plus récente en haut).

**Format retenu** : `YYYY.MM.DD-N` où `N` est le numéro de déploiement
du jour (ex. `2026.04.23-1` = premier déploiement du 23 avril 2026).

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
