# v0 — Mobile app screenshot audit (2026-04-23)

**Frozen snapshot** of every reachable screen in the Brasse-Bouillon
mobile app as of 2026-04-23. Serves two purposes:

1. Visual material for the Canva deck (soutenance 2026-05-27) —
   notably slide S8 "UX Avant brassage".
2. Visual inventory for the refactor audit — see
   [`/home/vev/.claude/plans/si-tu-te-souviens-sorted-lark.md`](../../../../../../.claude/plans/si-tu-te-souviens-sorted-lark.md)
   for the full backlog (69 items B-01 → B-69) and 9 dedicated
   brainstorms.

**Do not modify this folder.** When the app evolves, capture `v1/`
alongside.

## Capture metadata

| Field | Value |
|-------|-------|
| Capture date | 2026-04-23 (18:53 → 21:47 local time) |
| Git commit (repo) | `5be3501` (branch `docs/soutenance-27-mai`) |
| Mobile app package | `packages/mobile-app/` |
| Mobile app version | undeclared (see backlog item B-66) |
| Device | Android phone (resolution 1200×2670) |
| OS | Android — status bar icons visible in captures |
| Data mode | **Démo** (Marie / `marie.brasseur@example.com` / `user`) |
| Auth status | Backend not wired — `Connexion démo` is the only path (B-13 bis) |
| Total files | 204 (after skipping 35 duplicates / re-captures) |

## Folder structure

Numeric prefixes follow the app's primary navigation order
(Accueil → Brassins → Recettes → Boutique → Outils → Académie),
followed by secondary features reachable via the "Voir plus" sheet
(Équipements → Ingrédients → Étiquettes → Scanner → Compte), and
finally the Explore hub we plan to remove.

```
v0/
├── 01-auth/                 Login, signup, forgot password (7 files)
├── 02-dashboard/            Accueil + "Voir plus" sheet (4 files)
├── 03-batches/              Mes Brassins list + detail (8 files)
│   └── detail/              6 per-batch captures (b-demo-1/2/3)
├── 04-recipes/              My Recipes list + recipe detail deep dive (24 files)
│   └── detail/              Session IPA Citra full tour (16 files)
│       └── alt-witbier/     Witbier Orange comparison (6 files)
├── 05-shop/                 Ma Boutique home + 6 categories (7 files)
│   └── categories/          Malts / Houblons / Levures / Kits / L'Office / L'Épicerie (6 files)
├── 06-tools/                Calculateurs list + 8 detail calcs (44 files)
│   └── detail/              One sub-folder per calculator
│       ├── alcool-densite/  4 files (Rapide / Inversé / Expert)
│       ├── houblons/        6 files (Rapide / Inversé / BU:GU)
│       ├── couleur/         6 files (Rapide / Inversé / Palette)
│       ├── levures/         3 files (Pitch / Atténuation / Sachets)
│       ├── carbonatation/   5 files (Priming / Pression / Styles)
│       ├── le-puits/        9 files (Profil / Style / Sels — eau)
│       ├── rendement/       5 files (Rendement / Volumes / Plan d'eau)
│       └── calculs-avances/ 4 files (Enzymes / Moût / Altitude)
├── 07-academy/              Académie brassicole (40 files)
│   └── articles/            11 articles (1 stub + 10 full)
│       ├── 01-histoire-biere/         1 file (stub)
│       ├── 02-introduction-brassage/  3 files (full)
│       ├── 03-alcool-densite/         4 files (full + CTA)
│       ├── 04-couleur/                3 files (full + CTA)
│       ├── 05-houblons/               3 files (full + CTA)
│       ├── 06-le-puits/               4 files (full + ACTIVE CTA)
│       ├── 07-rendement/              4 files (full + CTA)
│       ├── 08-levures/                4 files (full + CTA)
│       ├── 09-carbonatation/          4 files (full + CTA)
│       ├── 10-calculs-avances/        4 files (full + CTA)
│       └── 11-glossaire/              3 files (full, NO CTA)
├── 08-equipment/            L'Office (1 file — read-only)
├── 09-ingredients/          Catalogue ingrédients (18 files)
│   ├── malterie/            Malts list + Pale Ale Malt detail (5 files)
│   ├── houblonniere/        Hops list + Citra/Saaz/Magnum details (7 files)
│   └── fermentoir/          Yeasts list + SafAle US-05/WLP001 details (5 files)
├── 10-labels/               Atelier d'étiquettes (24 files)
│   ├── home/                With draft + empty (2 files)
│   ├── selection/           Batch + format + template picker (8 files)
│   ├── editor/              Live editor with palette / icon / format / template toggles (13 files)
│   └── detail/              Draft detail view (1 file)
├── 11-scan/                 Scanner (21 files) ⭐ DEMO PRIORITY
│   ├── barcode/             Barcode mode 0/5 → 5/5 + not-recognized fallback (7 files)
│   ├── bottle/              Front + back capture flow (8 files)
│   ├── pending/             Local pending captures + purge (4 files)
│   └── consent/             RGPD consent modal + error (2 files)
├── 12-account/              Profil (5 files — read-only + logout)
└── 13-explore-hub/          Explore hub — candidate for removal (1 file, B-65)
```

## Key findings at a glance

| Finding | Severity | Backlog |
|---------|----------|---------|
| Scan recognition/match/community/import pipeline missing ⭐ | DEMO BLOCKER | B-39 |
| Auth backend not wired to frontend | BLOCKING | B-13 bis |
| Mes Brassins detail has no metadata / measurements / notes | CRITICAL | B-08 |
| Labels "Valider" CTA hidden behind tab bar | UI BUG | B-28 |
| Labels live preview clipped by tab bar | UI BUG | B-29 |
| Mobile app has no semver / git tag / CHANGELOG | PROCESS | B-66 |
| "Période d'analyse" doesn't belong on the home | UX | B-69 |
| 3-layer navigation overlap (tab bar / Voir plus / Navigation rapide) | UX | B-17 |
| Shop ↔ Ingredients / Equipment catalogues disconnected (DRY) | ARCHITECTURE | B-47 |
| Calculators isolated from recipes / batches (integration) | HIGH | B-54 |
| Explore hub redundant with Voir plus — to remove | DRY | B-65 |
| Paramètres globaux + Profil = same thing — merge | KISS/YAGNI/DRY | B-45 |

For the full list of 69 backlog items and 9 dedicated brainstorms
(Mes Brassins · Equipment · Ingredients · Labels · Scan ⭐ · Compte
& Paramètres · Shop · Calculs · Dashboard) see the plan file linked
above.

## Known gaps in v0 (accepted, not blocking — see B-67)

- Recipe CREATE flow (no `+ Nouvelle recette` tap captured)
- Batch START in live mode (blocked by auth wiring — B-13 bis)
- Splash / launch screen
- Product detail inside Shop categories

These gaps cover CRUD creation flows, not structure — v0's goal is
an architectural snapshot, not exhaustive button coverage.

## Source batches (Downloads)

| Batch | Source folder | Files captured | Kept in v0 |
|-------|---------------|----------------|------------|
| 1 | `Photos-3-001(2)/` | 14 | 14 |
| 2 | `Photos-3-001(1)/` | 26 | 23 |
| 3 | `Photos-3-001(3)/` | 40 | 37 |
| 4 | `Photos-3-001(4)/` | 7 | 6 |
| 5 | `Photos-3-001(5)/` | 6 | 6 |
| 6 | `Photos-3-001(6)/` | 4 | 2 |
| 7 | `Photos-3-001(7)/` | 22 | 18 |
| 8 | `Photos-3-001(8)/` | 26 | 24 |
| 9 | `Photos-3-001(9)/` | 23 | 21 |
| 10 | `Photos-3-001(10)/` | 6 | 4 |
| 11 | `Photos-3-001(11)/` | 5 | 1 |
| 12 | `Photos-3-001(12)/` | 9 | 7 |
| 13 | `Photos-3-001(13)/` | 44 | 41 |
| 14 | `Photos-3-001(14)/` | 7 | 1 |
| **Total** | | **239** | **204** |

Skipped files were duplicates (Dashboard / "Voir plus" sheet
re-captures across batches, feature list re-captures that were
already covered by batch 1) or identical states (e.g. water profile
preset duplicate in batch 2).

## Versioning & freeze rules

- **Never edit this folder.** `v0/` is a frozen audit snapshot.
- Future capture sessions go under `v1/`, `v2/`, etc.
- Each `vN/` MUST ship its own `README.md` with the same metadata
  template.
- The audit backlog (B-01 → B-69) lives in the plan file, not here.
- Optional: git tag `screenshots-v0` after merge for a human-readable
  anchor (see B-68).
