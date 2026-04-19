# T5 — Squelette slide deck 30 min (15 slides)

**Date** : 2026-04-19
**Outil cible** : Canva (brand kit design system Brasse-Bouillon).
**Cible** : 15 slides totales pour 30 min = ~2 min par slide en moyenne,
avec des variations fortes (saynète = 6 slides pour 3 min, démo live =
1 slide pour 6 min).
**Design system** : jaune Brasse-Bouillon, typo Inter / Manrope, tokens
spacing du mobile (ref [design-system.md](../../../packages/mobile-app/docs/design-system.md)).

## Règle transverse

- **1 idée = 1 slide**. Pas de slide à 10 bullets.
- **Chiffre > phrase > paragraphe**. Les jurys lisent rapidement.
- **Grande typo** (48 pt titre, 24 pt corps minimum).
- **Images / mockups > mots** quand possible.
- **Pas de bullet point classique** → préférer des **blocs** visuels
  avec icônes ou colonnes.
- Cohérence couleur : accents jaunes, fond blanc ou gris foncé, pas
  de gradient tape-à-l'œil.

## Deck — 15 slides

### S0 — Titre (durée affichage : 20-30 s avant début, muet)

- **Logo Brasse-Bouillon** grand format centré.
- Sous-titre : "Soutenance Ydays — Pitch Entrepreneurial — 2026-05-27".
- Nom Benoît Bremaud + rôle (Lead developer + fondateur).
- Fond jaune BB en overlay léger.
- **Objectif** : ancre visuelle avant l'entrée en scène.

### S1 — Intro saynète (bloc 1 — 0:00-0:20)

- Bandeau texte grand : "Imaginez une soirée, deux amis, une bière."
- Fond ambiance "bar / apéro" (photo chaleureuse).
- **Objectif** : plonger le jury dans l'univers avant le dialogue.

### S2 — La bouteille qui coûte cher (bloc 1 — 0:20-0:55)

- Close-up bouteille artisanale à droite de l'écran.
- À gauche : prix "7 €" biffé en rouge.
- Tagline en bas : "Boire bien, ça coûte."
- **Objectif** : planter le problème économique.

### S3 — Les 3 objections barrées (bloc 1 — 0:55-1:10)

- 3 bulles alignées horizontalement, barrées en rouge :
  - "Trop cher"
  - "Trop compliqué"
  - "Je ne sais pas faire"
- En dessous, apparition logo Brasse-Bouillon avec tagline :
  "Et si on changeait ça ?"
- **Objectif** : poser les objections universelles du brasseur
  débutant, que le reste de la saynète va lever.

### S4 — Démo mirror téléphone (bloc 1 — 1:10-2:30)

- **Contenu dynamique** : mirror de l'écran du téléphone en live,
  pas un slide statique.
- Technique : OBS Studio bascule entre slide et source USB du
  téléphone.
- Séquence visible par le jury :
  - Scanner code-barre
  - Fiche bière (style, ABV, IBU, provenance)
  - Recette équivalente proposée
  - Ajustement volume 20 → 8 L
  - Liste ingrédients + matériel
  - **Ratio prix : 2,10 €/L chez toi vs 6 €/L supermarché**
- **Objectif** : démontrer live l'app en condition dialogue.

### S5 — Transition présentateur (bloc 1 — 2:40-3:00)

- Chiffre **10 millions** géant en jaune sur fond sombre.
- Sous-titre : "De Français boivent de la bière artisanale."
- Tagline en bas : "Aucune app française ne les accompagne. Jusqu'ici."
- **Objectif** : pivot de l'anecdote personnelle à la vision macro.

### S6 — Cible + gap marché (bloc 1 — 3:00-4:00)

- Carte de France stylisée, zone Alpes-Maritimes mise en avant.
- Tableau à 3 colonnes : **Brewfather** (anglophone), **Little Bock**
  (vieillit), **Brasse-Bouillon** (nous).
- 3 différenciateurs centraux : langue FR native, simplicité évolutive,
  scanner code-barre.
- **Objectif** : poser le gap concurrentiel en 30 s.

### S7 — 3 personas (bloc 2 — 4:00-6:00)

- 3 portraits côte à côte : **Nicolas** (débutant, 30-35), **Claire**
  (amatrice créative, 35-45), **Marc** (expert, 45+).
- Pour chacun : icône + 1 objectif clé + 1 frustration clé.
- Source : [user_personas.md](../../personas/user_personas.md).
- **Objectif** : montrer que BB couvre 3 niveaux d'expérience.

### S8 — UX "Avant brassage" + design system (bloc 2 — 6:00-10:00)

- Gauche : wireframes / screenshots des écrans "Avant brassage"
  (découverte recettes, Academy, planification).
- Droite : palette design system BB (jaune, tokens spacing, typo).
- Tagline : "Du débutant à l'expert — une interface qui s'adapte."
- **Objectif** : prouver que le design est abouti et cohérent.

### S9 — Architecture tech (bloc 3 — 10:00-11:00)

- Schéma monorepo 4 packages (`mobile-app`, `api`, `beer-encyclopedia`,
  `website`).
- Stack sous chaque package : React Native Expo, NestJS + TypeORM,
  FastAPI + PostgreSQL, HTML statique.
- En bas, 3 chiffres : **97 tests** / **CI GitHub Actions
  path-filtered** / **0 any TypeScript**.
- **Objectif** : prouver la solidité technique sans surcharger.

### S10 — Démo live transition (bloc 3 — 11:00-17:00)

- **Slide sobre** "Démonstration live" en grand, sur fond jaune.
- Petite carte du parcours en bas : 5 étapes (Auth → Recettes →
  Scanner → Calculateur → Batch).
- Pendant la démo, on reste **sur le mirror téléphone** (slide
  masquée).
- **Objectif** : ouvrir la démo proprement, permettre au jury
  d'anticiper le parcours.

### S11 — Après brassage : Academy + Labels + Communauté (bloc 4 — 17:00-22:00)

- 3 zones horizontales :
  - **Academy** — icône livre, tagline "Apprendre à son rythme."
  - **Labels** — icône étiquette, tagline "Personnaliser sa
    création."
  - **Communauté** — icône partage, tagline "Partager. Échanger.
    Progresser." (différenciateur vs Brewfather).
- Screenshots derrière en transparence.
- **Objectif** : démontrer que BB porte le brasseur au-delà du
  brassin lui-même.

### S12 — Business Model Canvas synthétisé (bloc 5 — 22:00-25:00)

- **Grille 9 cases BMC** avec 1-2 lignes par case.
- Accent visuel sur 3 cases clés : **Segments** (TPE artisanat food
  FR), **Proposition de valeur** (3 angles), **Revenus** (freemium +
  partenariats).
- Source : [business-model-canvas.md](business-model-canvas.md).
- **Objectif** : montrer la maturité business en 1 slide.

### S13 — Perspectives + pivot studio web (bloc 5 — 25:00-28:00)

- 4 quadrants : **Légal** (RGPD, OWASP), **RH**, **GTM** (3 canaux,
  partenariats LHBS), **Budget** (infra, financement).
- **Quadrant RH mis en avant** :
  > "Je crée mon studio web en micro-entreprise, méthode IA-driven,
  > cible TPE food/boissons 06. Le studio finance le développement
  > sérieux de BB : vraie étude marché, vrai marketing."
- SMART #31 rebuilt : "3 sites clients avant 2026-11-30, CA ≥ 6 k€,
  site studio publié."
- **Objectif** : montrer la vision post-MVP, honnête et structurée.

### S14 — Conclusion + vision + CTA (bloc 6 — 28:00-30:00)

- **Tagline finale** en grand : (à finaliser — ex. "Brassez ce que
  vous aimez, chez vous.").
- Contact : email + LinkedIn + QR code repo GitHub.
- "Merci — des questions ?"
- **Objectif** : sortir fort, laisser une image mémorisable.

## Mapping slides ↔ blocs ↔ critères d'évaluation

| Slide | Bloc | Temps | Critère grille |
|-------|------|-------|----------------|
| S0 | Avant-pitch | 0-0 | — |
| S1-S5 | Bloc 1 (saynète) | 0-3 | #522 (elevator, 15) + #525 (démo live dans la saynète, 30) |
| S6 | Bloc 1 (cadrage) | 3-4 | #524 (BM innovation, 30) |
| S7-S8 | Bloc 2 | 4-10 | #524 + #527 (slide deck, 15) |
| S9 | Bloc 3 (setup) | 10-11 | #524 + #525 |
| S10 | Bloc 3 (démo) | 11-17 | #525 (démo live, 30) |
| S11 | Bloc 4 | 17-22 | #524 + #526 (perspectives, 20) |
| S12 | Bloc 5 (BM) | 22-25 | #524 |
| S13 | Bloc 5 (perspectives) | 25-28 | #526 (20) |
| S14 | Bloc 6 | 28-30 | #522 + #527 |
| — | Q&A | 30-40 | toutes |

## Ressources à produire / récupérer

### Assets visuels

- Logo Brasse-Bouillon format vectoriel (SVG ou haute def).
- Screenshots 1080p des écrans mobile : Auth, Recettes, Scanner,
  Calculateur, Batch, Academy, Labels, Boutique (quand livrée).
- 3 portraits personas (photos stock libres ou illustrations
  vectorielles cohérentes).
- Icônes (Lucide, Feather ou Phosphor — ligne simple, cohérente).
- Carte France stylisée (SVG simple, Alpes-Maritimes accentué).

### Données chiffrées à vérifier avant figement

- **10 millions de Français** buveurs de bière artisanale
  *[trou factuel à sourcer — `target_audience.md` ? sondage
  externe ?]*.
- Chiffres marché (1,5 Md€ 2024, 3 Md€ 2033) — sourcés depuis
  `target_audience.md` ✅.
- 97 tests automatisés — sourcé depuis
  [audit-features-mvp.md](audit-features-mvp.md) ✅.
- Ratio prix 3× moins cher — à **calculer** une fois la boutique
  livrée avec prix réels.
- CA studio cible < 10 k€ an 1 — sourcé depuis
  [web-studio-brainstorming.md](web-studio-brainstorming.md) ✅.

### Brand kit Canva

- Créer un brand kit avec :
  - Couleurs : `#FFD600` (jaune BB), `#1A1A1A` (dark neutre),
    `#FFFFFF`, `#4A4A4A`.
  - Polices : Inter (titres), Manrope (corps) — fallback Arial.
  - Logo SVG.
- **Charge** : 1 h de setup.

## Workflow de production

1. **D+1 (2026-04-20)** : créer le brand kit Canva + S0 + S14
   (squelette extrêmes).
2. **D+2-3** : produire S1 à S6 (saynète) — haute priorité car
   testables dès répétition 1.
3. **D+4-5** : produire S7 à S11 (blocs 2-4).
4. **D+6** : produire S12-S13 (BM + Perspectives).
5. **D+7 (2026-04-26)** : relecture complète deck, cohérence visuelle,
   chronométrage visuel par slide.
6. **D+8-14** : itérations fines + ajustements après oral blanc 06/05.
7. **D+14 (2026-05-03)** : version "feature complete" avant oral blanc.
8. **D+21 (2026-05-10)** : corrections post-oral blanc.
9. **D+24 (2026-05-13)** : export PDF offline + clé USB.
10. **J-1 (2026-05-26)** : version finale gelée.

**Charge estimée totale slide deck** : ~20 h sur 3 semaines.

## Hors scope de ce document

- Le script de démo live seconde-par-seconde (T6, livrable dédié).
- Le script textuel de chaque intervention par bloc (à produire à
  l'oral blanc 06/05 pour fluidité).
- Le tournage de la vidéo backup démo (décision J-7).
