# Roadmap v0.1 consolidée — Sprint scoping 2026-04-28

**Statut** : roadmap issue de la session de scoping J-29 (28 avril 2026), 9 topics débattus, ~50 décisions atomiques arbitrées via Q&A + brainstorming croisé avec les 5 personas et les brainstorms de référence (scan-2026-04-24, onboarding-2026-04-24, compte-parametres-2026-04-24, recipe-schema-audit-2026-04-24).

**Source de vérité** : ce document. En cas de conflit avec d'autres docs (`personas/user_personas.md` v2 notamment), ce document prime. La persona doc sera mise à jour en v3 pour aligner.

---

## Calendrier des deadlines

| Date | Événement | Statut |
|---|---|---|
| 2026-04-28 (J-29) | Session de scoping consolidée | ✅ Done |
| 2026-05-05 (J-22) | Documents narratifs prêts (équipe) | Délégué équipe |
| 2026-05-06 (J-21) | **Soutenance blanche** (Yday 9, 35 min) | Préparation en cours |
| 2026-05-17 (J-10) | Cible v0.1.0-beta1 (feature complete) | Implementation |
| 2026-05-24 (J-3) | Cible v0.1.0-rc1 (QA passed) | Implementation |
| 2026-05-26 (J-1) | **Cap final APK + EAS build** | Hard cap |
| 2026-05-27 (J-0) | **Soutenance finale** | Délivrable |

---

## Capacité dev disponible

- Estimation : ~100-120h dev sur ~3-4 semaines (déduction faite de la prép soutenance, répét, debrief).
- Cumul effort v0.1 brut décidé : **~94-115h** (limites supérieures à respecter).
- Marge tampon estimée : 0-15% — exécution doit être disciplinée.

---

## Scope v0.1 — par topic

### Topic A — Onboarding & Auth (~2h)

| Issue | Scope | Statut |
|---|---|---|
| #764 | Simplifier signup form (email + password only, masquer bouton démo conditionnellement) | ✅ v0.1 |
| #765 | Bouton Google OAuth cosmétique (pas de flow réel) | ✅ v0.1 |

### Topic B — Scan flow demo hero (~24h)

| Issue | Scope | Statut |
|---|---|---|
| #598 | Beer recognition via OpenFoodFacts barcode lookup + result screen | ✅ v0.1 |
| #599 | Recipe match — official + equivalent recipes ranked | ✅ v0.1 (parent) |
| #700 | Mobile UI matching view (officiel + top 3) | ✅ v0.1 |
| **(extension)** | Matching algo full (bitterness + color + brew_count_log + recency + renormalisation + low_confidence) | ✅ v0.1 |
| **(extension)** | Scan result screen full (section 🏆 Brewery recipe, folds lazy-loaded, mailto suggest correction, warning <40%) | ✅ v0.1 |
| **(extension)** | Jury beer 4-scénarios (A known, B unknown read-only, C barcode unreadable photo fallback, D not-a-beer detection) | ✅ v0.1 |
| **(extension)** | Compléter seed à 6 bières (Karmeliet Tripel + Heineken + bière artisanale locale) | ✅ v0.1 |

### Topic #1 — Brassins (~17-21h)

| Issue | Scope | Statut |
|---|---|---|
| #595 | Parent epic Mes Brassins rewrite | ✅ v0.1 |
| #605 | Data model étendu (Batch metadata + Measurement + Observation + Alert) | ✅ v0.1 |
| #606 | Layout 5 sections (Identity / Plan / Live / Measurements / Notes), inspiré BrewDog DIY Dog | ✅ v0.1 |
| #608 | State machine step (Start/Complete/Pause/Skip + confirmation) | ✅ v0.1 |
| #607 | Inline measurement + observation entry | ❌ v0.2 (risque ridicule en live demo) |
| #781 | Brewing assistance enrichie (9 phases BrewDog + countdown timers + tips pédagogiques) | ✅ v0.1 |
| #782 | Pre-seed Punk IPA brassin demo (BrewDog DIY Dog values, status COMPLETED) | ✅ v0.1 |
| #776 | Drêches valorisation 6e section "Aller plus loin" (persona Zoé) | ✅ v0.1 |
| **Mode "Brew Day"** plein écran | | ❌ v0.2 |

**Note importante** : conflit personas v2 résolu — Brassins est **v0.1 demo** (pas v0.2 comme dans la persona doc). Mise à jour personas v3 à faire.

### Topic #3 — Liste de courses (~4h)

| Issue | Scope | Statut |
|---|---|---|
| #777 | Smart shopping list (checklist in-app cochable + native share + tease drêches + ingrédients & équipement basique + hashtags brewing) | ✅ v0.1 |
| **Liste cumulée multi-brassins** | | ❌ v0.2 |
| **QR code recette** | | ❌ v0.2 |

### Topic #4 — Export & Inventory (~5h v0.1)

| Issue | Scope | Statut |
|---|---|---|
| #778 | Export BeerXML 1.0 (recipes only) | ✅ v0.1 |
| #774 | [Epic] Inventory management (gestion des stocks surplus) | ❌ v0.2 + tease pitch |
| **Import BeerXML bidirectionnel** | | ❌ v0.2 |
| **Export brassins (CSV/JSON)** | | ❌ v0.2 |

### Topic #5 — Recipe Catalog (~17-22h)

| Issue | Scope | Statut |
|---|---|---|
| #779 | Recipe Catalog mini (sub-screen Mon Carnet "Enrichir mon carnet") | ✅ v0.1 |
| #780 | Seed 25 BrewDog DIY Dog recipes curated | ✅ v0.1 |
| **Filtre BJCP famille** (IPA/Stout/Belgian/Lager/etc) | inclus dans #779 | ✅ v0.1 |
| **Lineage simple** (root_recipe_id + parent_recipe_id + import_provenance text) | inclus dans #779 | ✅ v0.1 |
| **Featured recette du mois** statique | inclus dans #779 | ✅ v0.1 |
| **Difficulty enum** (Beginner/Intermediate/Advanced) | inclus dans #779 | ✅ v0.1 |
| **Tags search** (tropical/fruité/amer/sec/etc) | inclus dans #779 | ✅ v0.1 |
| **Surprise me** random pick | inclus dans #779 | ✅ v0.1 |
| **Style template wizard** | | ❌ v0.2 |
| **Autres catalogues** (AHA, BJCP guidelines, Brewer's Friend) | | ❌ v0.2 |
| **Seasonal suggestions** | | ❌ v0.2 |

### Topic #6 — Académie Glossaire (~5-7h)

| Issue | Scope | Statut |
|---|---|---|
| #783 | Tooltip popup long-press sur termes brewing + auto-link markdown dans descriptions | ✅ v0.1 |
| **Mini-quiz post-brassin** | | ❌ v0.2 |
| **Glossaire visuel** (photos malts/houblons/levures) | | ❌ v0.2 (sub-issue de #772) |

### Topic #7 — Vocabulaire (~3h)

| Issue | Scope | Statut |
|---|---|---|
| #784 | Hybrid display "Amertume marquée · 40 IBU" partout (pas de toggle) | ✅ v0.1 |
| #785 | Doc canonique `docs/product/vocab-mapping.md` | ✅ v0.1 |
| **Onboarding niveau** | | ❌ v0.2 |

### Topic #8 — Channels & share (~2.5h)

| Issue | Scope | Statut |
|---|---|---|
| #786 | Native share recipe + brewing hashtags pré-remplis | ✅ v0.1 |
| **Story-friendly 9:16 mode** | | ❌ v0.2 |
| **Referral system** | | ❌ v0.2+ |

### Topic #9 — Polish & Navigation (~12-17h)

| Issue | Scope | Statut |
|---|---|---|
| #600 | Community badges hardcodés (auteur + avg_rating + brew_count) sur 35 recettes seed | ✅ v0.1 |
| #766 | Modal confirmation "Ajouter à Mon Carnet de Recettes" | ✅ v0.1 |
| #613 | Redesign nav minimal (promote Scan, retirer Outils/Boutique) | ✅ v0.1 |
| #644 | Merger Paramètres globaux dans Profil | ✅ v0.1 |
| #646 | Retirer Période d'analyse du home + page Statistiques minimale | ✅ v0.1 |
| #616 | Wire 9 article CTAs Académie vers calculateurs existants | ✅ v0.1 |
| #629 | Share natif étiquettes (image PNG, pas PDF complet) | ✅ v0.1 |

### Polish technique transverse

| Issue | Scope | Statut |
|---|---|---|
| #748 | Fix wrong version dans About footer (EAS metadata injection) | ✅ v0.1 (priority:high non-demo-blocker) |

---

## Scope v0.2 (post-soutenance)

### Epics capturés
- **#771** [Epic] DB audit (schema + integrity + indexes + GDPR + perfs + migration discipline)
- **#772** [Epic] Datasheets brainstorm (fiches bière / recette / malts / houblons / levures / eaux)
- **#774** [Epic] Inventory management (gestion des stocks surplus + suggestions intelligentes)
- **#787** [Epic] Brewing calculators audit (formules accuracy, single source of truth)

### Features défférées identifiées
- #607 inline measurement entry (mode Brew Day)
- Mode "Brew Day" plein écran simplifié
- Liste de courses cumulée multi-brassins
- QR code recette (deeplink + web fallback)
- Import BeerXML bidirectionnel
- Export brassins CSV/JSON
- Recipe Catalog : style template wizard, autres catalogues (AHA, Brewer's Friend), seasonal suggestions
- Académie : mini-quiz post-brassin, glossaire visuel
- Vocabulaire : onboarding niveau (debutant/expert)
- Channels : story-friendly 9:16, referral system
- #775 Beer mug loader animation (branding)
- Community : ratings réels, partage social
- Empreinte carbone (Zoé v0.2+)
- Suggestions communautaires personnalisées
- Tutoriels interactifs (Nicolas v0.2+)
- Intégration IoT / capteurs (Marc v0.3+)

---

## Plan d'exécution séquentiel

L'ordre suivant est recommandé pour minimiser les blocages et maximiser les early wins en démo. Chaque ligne = 1 PR (parfois plusieurs petits commits dans la même branche).

| Sprint | Dates | Focus | Issues principales | Effort cumulé |
|---|---|---|---|---|
| **Sprint A** | J-29 → J-23 | Auth + scan flow finition | #764, #765, #598, #599, #700, matching algo full, scan UI full, jury 4 scénarios, seed 6 bières | ~26h |
| **Sprint B** | J-22 → J-21 | Préparation soutenance blanche | #642 demo assets, #702 demo script v1, #533 backup video | ~3h dev + prep |
| **— Soutenance blanche J-21 (2026-05-06) —** | | | | |
| **Sprint C** | J-21 → J-15 | Brassins + brewing assistance + drêches + Punk IPA seed | #595/605/606/608, #781, #782, #776 | ~21h |
| **Sprint D** | J-14 → J-10 | Recipe Catalog + DIY Dog seed + Académie tooltip | #779, #780, #783 | ~28h |
| **Sprint E** | J-10 → J-6 | Polish & Nav + Vocab + Share + Export BeerXML | #600, #766, #613, #644, #646, #616, #629, #784, #785, #786, #778 | ~21h |
| **— Cible v0.1.0-rc1 J-3 —** | | | | |
| **Sprint F** | J-5 → J-1 | Tests + bug fixes + APK final + #642/#702 final | smoke tests, fixes, APK build | ~10h |
| **— Hard cap J-1 (2026-05-26) —** | | | | |
| **Soutenance finale J-0 (2026-05-27)** | | | | |

**Total effort planifié** : ~109h dev (cohérent avec les 100-120h disponibles).

---

## Méta-décisions transverses

### Vocabulaire et terminologie

- ✅ **Hybrid display partout** : "Amertume marquée · 40 IBU", "Couleur ambrée · EBC 18 / SRM 9", "ABV 5.6% (modéré)" — pas de toggle utilisateur (#784).
- ✅ **vocab-mapping doc canonique** (#785) — source unique référencée par tous les composants display.
- ✅ **Couleurs SRM/EBC normalisées** systématiquement (mémoire `feedback_normalized_colors`).
- ✅ **Vocabulaire pro brewing** appliqué partout (BeerXML, BJCP, mash, sparge, hop schedule, OG/FG, attenuation, etc.) — mémoire `feedback_brewing_pro_vocab`.

### Inspiration BrewDog DIY Dog

- ✅ **Catalogue importé** (25 recettes curées #780) comme pierre angulaire du Recipe Catalog (#779).
- ✅ **Structure narrative** (Brewer's Tip + Mash Temps + Hop Schedule) reprise dans le layout brassin (#606).
- ✅ **Pre-seed Punk IPA brassin** (#782) avec valeurs DIY Dog officielles.
- ✅ **9 phases standardisées** (Mash → Sparge → Boil → Cool → Pitch → Ferment → Dry hop → Condition → Package) dans la brewing assistance (#781).

### Personas servies en v0.1

| Persona | Incarnation v0.1 |
|---|---|
| **Léa la Curieuse** (primaire) | Scan demo hero + Recipe Catalog discovery + tooltips pédagogiques + brewing assistance tips |
| **Nicolas le Débutant** | Smart shopping list + Académie Glossaire promu + difficulty enum sur recettes + tips pédago |
| **Claire l'Amatrice Créative** | Brassins riche + share étiquettes + share recettes natif |
| **Zoé l'Éco-responsable** | Drêches valorisation 6e section + tease drêches dans liste de courses |
| **Marc le Brasseur Expert** | Export BeerXML + difficulty Advanced filter + tease Inventory v0.2 dans pitch + page Statistiques |

Toutes les 5 personas ont au moins une matérialisation concrète. Marc et Zoé étaient initialement absents du scope v0.1 — ce sprint les a réintroduits via des features ciblées low-cost.

---

## Risques identifiés

1. **Effort tendu** (109h planifié vs 100-120h disponibles) — toute slip de 10h+ menace J-1. Mitigation : couper agressivement Topic #9 polish ou le brewing assistance enrichie si nécessaire.
2. **Mode démo vs backend** — la soutenance peut tourner en mode démo (mocks, fiable) OU backend (Tailscale, riche). Décision finale à prendre après soutenance blanche selon stabilité observée.
3. **Soutenance blanche J-21** — exige la quasi-totalité du scope auth + scan flow + (au minimum) le pré-seed du Brassin Punk IPA. Si Sprint A déborde, soutenance blanche partielle = feedback dégradé.
4. **Nouvelles features ajoutées en cours** — l'idée chope-loader (#775), le BrewDog catalogue, le mode Brew Day, etc. Toute idée future doit être triée immédiatement v0.1/v0.2/v0.3+ pour ne pas drift le scope.

---

## Suite immédiate

1. ✅ Issues GitHub à jour (créées + comments scope refiné).
2. **Updater `docs/personas/user_personas.md`** en v3 — corriger Brassins de v0.2 à v0.1, ajouter Zoé/Marc incarnations v0.1, intégrer la cohérence avec ce roadmap.
3. **Démarrer Sprint A** — implementation Zone A (#764 + #765) en première branche feature.
