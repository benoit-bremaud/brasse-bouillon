# Brand Kit Canva — Brasse-Bouillon

> Source-of-truth visual reconciliation between the V0 mobile app screenshots,
> the design charter and the Canva slide deck for the 2026-05-27 soutenance.
> Audit performed 2026-04-23.

This document specifies the Canva Brand Kit + per-slide application guide
for the 15-slide deck of the soutenance Ydays. It is the **single reference**
for the visual production of the deck. Read it once before opening Canva.

## 1. Setup — create the Canva Brand Kit (one-time, ~10 min)

In Canva, open **Brand Hub → Brand Kits → Create new** and name it
`Brasse-Bouillon — Soutenance Ydays`. Then add the items below.

### 1.1 Colors

Add these 8 colors as named brand colors. Hex values are **canonical** —
they match the V0 mobile app and the design charter §8.

| Role | Hex | Name in Canva |
|---|---|---|
| Hero Yellow (signature background) | `#F4BD3F` | `BB / Hero Yellow` |
| Watermark Amber (pattern lines) | `#E8AE2C` | `BB / Watermark Amber` |
| Primary Brown (CTAs, brand title) | `#A06A3A` | `BB / Primary` |
| Secondary Brown (hover, close icons) | `#8D5832` | `BB / Secondary` |
| Background Beige (chips, KPI tiles) | `#E0D3AA` | `BB / Beige` |
| Olive (success, active accents) | `#7D8C3A` | `BB / Olive` |
| Text Dark (body, headings) | `#1E1E1E` | `BB / Text` |
| Text Muted (captions, placeholders) | `#6B6B6B` | `BB / Text Muted` |

Plus white `#FFFFFF` as the standard card / surface color (no need to add
to the kit, Canva has it by default).

### 1.2 Fonts

Use Canva-native fonts to avoid licensing issues for the deck export.
Recommended pairing aligned with the mobile app feel:

| Role | Font (Canva) | Weight | Fallback |
|---|---|---|---|
| Display / titles | `Manrope` | ExtraBold (800) | Inter, Arial Black |
| Body / paragraphs | `Inter` | Regular (400) | Helvetica, Arial |
| Captions / metadata | `Inter` | Medium (500) | Arial |

Both Manrope and Inter are free and shipped by Canva.

### 1.3 Logos / Mascot

Upload these 3 assets to the Brand Kit logo bay:

* `docs/design/assets/logo/logo-primary-512x512.png` — full mascot + name (cover slides)
* `docs/design/assets/logo/logo-icon-64.png` — mascot only, small (top-left of every title slide)
* `docs/design/assets/logo/logo-primary.svg` — vector for resize-without-loss

The mascot is **not redesigned** for this deck. Use it as-is.

### 1.4 Background pattern (optional but recommended)

Upload `packages/mobile-app/assets/images/Yellow_Background.png` to your
Canva uploads folder (1.9 MB; you can compress it to ~300 KB in any image
optimizer first if you prefer). Use it on the title slides only (S0, S1, S14).

## 2. Application guide — per slide (S0 → S14)

The 15 slides follow the deck outline at
[../ydays/outputs/slide-deck-outline.md](../ydays/outputs/slide-deck-outline.md).
Apply the brand kit slide by slide as below.

### S0 — Cover

| Element | Value |
|---|---|
| Background | `BB / Hero Yellow` full bleed + `Yellow_Background.png` watermark at 100 % opacity |
| Mascot | `logo-primary-512x512.png` centered, ~40 % slide width |
| Title `Brasse Bouillon` | Manrope ExtraBold 96 pt, color `BB / Primary` |
| Subtitle | Inter Medium 32 pt, color `BB / Text` |
| Date footer | Inter Regular 18 pt, color `BB / Text Muted` |

### S1 — Saynète intro

| Element | Value |
|---|---|
| Background | `BB / Hero Yellow` + watermark |
| Mascot | `logo-icon-64.png` top-left, ~120×120 px |
| Bandeau text "Imaginez une soirée…" | Manrope ExtraBold 64 pt, color `BB / Text` |
| Photo bar/apéro | full-width bleed below the bandeau, no overlay |

### S2 — La bouteille qui coûte cher

| Element | Value |
|---|---|
| Background | white card on `BB / Hero Yellow` (no watermark on content slides) |
| Big number `7 €` (left col) | Manrope ExtraBold 180 pt, color `BB / Primary` (same as the V0 mobile app), with a thick red diagonal strike |
| Subtitle `Une bouteille de 33 cl.` | Inter Medium 24 pt, color `BB / Text Muted` |
| Photo bouteille (right col) | close-up, neutral background |
| Bottom tagline `Boire bien, ça coûte.` | Manrope ExtraBold 48 pt, color `BB / Text`, centered |

### S3 — Les 3 objections barrées

| Element | Value |
|---|---|
| Background | white card on `BB / Hero Yellow` |
| Title `Les 3 objections du brasseur amateur` | Manrope ExtraBold 36 pt, color `BB / Text Muted` |
| 3 ellipses (`Trop cher` / `Trop compliqué` / `Je ne sais pas faire`) | Inter Medium 32 pt, color `BB / Text`, white fill, `BB / Text` border 2 px, red strike-through animation |
| Logo + tagline `Et si on changeait ça ?` | mascot + Manrope Bold 36 pt color `BB / Primary` |

### S4 — Mirror téléphone (démo intégrée saynète)

| Element | Value |
|---|---|
| Background | `BB / Text` (`#1E1E1E`) full bleed — slide reste sombre pour faire ressortir l'écran téléphone |
| Title overlay | `Démo en direct` Manrope ExtraBold 32 pt color `BB / Hero Yellow` (fallback uniquement si miroir USB échoue) |
| Mirror | OBS source téléphone full-frame, 16:9 fit |

### S5 — Transition 10 millions

| Element | Value |
|---|---|
| Background | `BB / Text` (`#1E1E1E`) full bleed |
| Big number `10 millions` | Manrope ExtraBold 180 pt, color `BB / Hero Yellow` |
| Subtitle `de Français boivent de la bière artisanale.` | Inter Medium 48 pt, color white |
| Bottom tagline `Aucune app française ne les accompagne. Jusqu'ici.` | Inter Regular 28 pt, color `#CCCCCC` |

> ⚠️ Le chiffre `10 millions` est **flagged P1** dans le checklist de soutenance — à sourcer ou remplacer avant l'oral blanc 2026-05-06. Voir [outputs/soutenance-27-mai-status-checklist.md](../ydays/outputs/soutenance-27-mai-status-checklist.md).

### S6 — Cible + gap marché

| Element | Value |
|---|---|
| Background | white card on `BB / Hero Yellow` |
| Title | Manrope ExtraBold 48 pt color `BB / Text` |
| Carte FR | SVG simple, Alpes-Maritimes accentué `BB / Primary` |
| Tableau 3 colonnes (Brewfather / Little Bock / Brasse-Bouillon) | en-tête fond `BB / Beige`, BB column en `BB / Hero Yellow` highlight |

### S7 — 3 personas

| Element | Value |
|---|---|
| Background | white card |
| 3 portraits côte à côte | photos rondes 240 px chaque, séparées par filet `BB / Beige` |
| Noms (Nicolas / Claire / Marc) | Manrope ExtraBold 36 pt color `BB / Primary` |
| Objectif/frustration | Inter Regular 22 pt color `BB / Text` |

### S8 — UX Avant brassage + design system

| Element | Value |
|---|---|
| Background | white card |
| Wireframes/screenshots gauche | mockups V0 — préférer ceux de [public/screenshots/v0/04-recipes/](../ydays/public/screenshots/v0/04-recipes/) |
| Palette (droite) | swatches `BB / Hero Yellow`, `BB / Primary`, `BB / Beige`, `BB / Olive` carrés 120×120 px chacun + label hex |
| Tagline | Inter Medium 26 pt color `BB / Text` |

### S9 — Architecture tech

| Element | Value |
|---|---|
| Background | white card |
| Schéma monorepo 4 packages | boîtes arrondies 12 px radius, fond `BB / Beige`, bordure `BB / Primary` |
| Stack (sous chaque boîte) | Inter Medium 18 pt color `BB / Text Muted` |
| 3 chiffres bas (97 tests / CI / 0 any) | Manrope ExtraBold 64 pt color `BB / Olive` |

### S10 — Démo live transition

| Element | Value |
|---|---|
| Background | `BB / Hero Yellow` full bleed + watermark |
| Title `Démonstration live` | Manrope ExtraBold 96 pt color `BB / Text`, centered |
| Petite carte du parcours | 5 cercles connectés (Auth → Recettes → Scanner → Calculateur → Batch), cercles fond white, bordure `BB / Primary` |

### S11 — Après brassage : Academy + Labels + Communauté

| Element | Value |
|---|---|
| Background | white card on `BB / Hero Yellow` |
| 3 zones horizontales | chacune avec icône `BB / Primary`, titre Manrope ExtraBold 32 pt color `BB / Text`, tagline Inter Medium 22 pt |
| Screenshots derrière en transparence | opacité 12 % |

### S12 — Business Model Canvas synthétisé

| Element | Value |
|---|---|
| Background | white card |
| Grille 9 cases BMC | bordures `BB / Text Muted` 1 px, en-tête de case fond `BB / Beige` |
| 3 cases clés (Segments / PV / Revenus) | fond `BB / Hero Yellow` highlight |
| Sources | Inter Regular 14 pt color `BB / Text Muted` en pied |

### S13 — Perspectives + pivot studio web

| Element | Value |
|---|---|
| Background | white card |
| 4 quadrants (Légal / RH / GTM / Budget) | bordures `BB / Primary` 2 px |
| Quadrant RH mis en avant | fond `BB / Beige`, citation pull-quote Manrope ExtraBold 24 pt italic color `BB / Text` |
| SMART #31 reformulé | Inter Medium 20 pt color `BB / Text` |

### S14 — Conclusion + vision + CTA

| Element | Value |
|---|---|
| Background | `BB / Hero Yellow` full bleed + watermark + mascot grand format centered |
| Tagline finale `Brasser. Partager. Recommencer.` | Manrope ExtraBold 96 pt color `BB / Primary`, centered |
| Contact (email + LinkedIn + QR code) | Inter Medium 24 pt color `BB / Text` |
| `Merci — des questions ?` | Manrope ExtraBold 48 pt color `BB / Text`, en bas centered |

## 3. General application rules

* **Spacing** — laisser au minimum 80 px de marge intérieure sur toute slide pleine page. Évite les murs de texte collés au bord.
* **Hiérarchie** — 1 titre principal par slide, max 3 niveaux d'information visible. Si une slide en demande plus, splitter en 2 slides.
* **Densité texte** — 50 mots max par slide (sauf S6/S12/S13 qui peuvent monter à 80 mots à cause des tableaux/grilles).
* **Contraste** — toute combinaison texte/fond doit passer WCAG AA (4.5:1 normal, 3:1 large). Le couple `BB / Text` sur `BB / Hero Yellow` passe AA pour les titres uniquement (pas pour le body — utiliser une carte blanche).
* **Watermark** — réserver aux slides titres/section (S0, S1, S5, S10, S14). Sur les slides denses en information (S2, S3, S6-S9, S11-S13), utiliser une carte blanche sans watermark pour préserver la lisibilité.
* **Mascot** — petite (~120×120 px) en haut-gauche des slides titres ; grande (~40 % largeur) sur S0 et S14.

## 4. Workflow d'application

1. **Crée le Brand Kit** dans Canva selon §1 (10 min).
2. **Ouvre le deck Canva de travail** (URL dans [outputs/canva-working-deck.md](../ydays/outputs/canva-working-deck.md), une fois le vote design fermé le lundi 2026-05-04).
3. **Applique les couleurs en lot** : sélectionne tous les éléments d'une slide → menu **Color** → choisis depuis le Brand Kit. Plus rapide que slide par slide.
4. **Suis l'ordre de production recommandé** : S0/S14 d'abord (cadre extrêmes), puis S1-S6 (saynète + cadrage), puis S7-S13 (corps), enfin S10 (démo transition). Voir [outputs/canva-working-deck.md §Ordre de production](../ydays/outputs/canva-working-deck.md).
5. **Pinge sur Discord** quand une slide est prête pour relecture.

## 5. Vérification finale (J-7 / J-3 / J-1)

Avant l'oral blanc puis avant la soutenance, dérouler la checklist :

* [ ] Toutes les slides utilisent **uniquement** les couleurs du Brand Kit (pas de teintes hors palette)
* [ ] Toutes les slides utilisent **uniquement** Manrope (titres) + Inter (corps)
* [ ] La mascotte est présente en haut-gauche de chaque slide titre + grande sur S0/S14
* [ ] Le watermark est utilisé sur S0/S1/S5/S10/S14, pas ailleurs
* [ ] Le contraste texte/fond passe AA partout (utiliser un outil comme Stark plugin Canva)
* [ ] Export PDF ne dépasse pas 25 MB (Moodle-compatible)

## 6. Automation via MCP Canva (futur)

Quand le MCP Canva sera reconnecté côté Claude Code, ce document servira
de spécification d'automation. L'agent pourra :

* Créer le Brand Kit programmatiquement (`mcp__canva__list-brand-kits` puis create)
* Itérer sur les 15 slides et appliquer les couleurs/polices de la spec
* Vérifier le respect des règles de §3

D'ici là, l'application est manuelle. Le doc reste la référence canonique.

## 7. Out of scope (cette itération)

* **Site vitrine** `packages/website/` — alignement charte à faire dans une PR séparée
* **App mobile** `packages/mobile-app/src/core/theme/` — déjà aligné avec la palette V0 (c'est la source !), juste à valider les tokens
* **Refonte logo / mascotte** — non, on garde l'existant
* **Création d'un nouveau pattern watermark** — non, on réutilise `Yellow_Background.png`
