# Audit décisions soutenance — 2026-05-05

**Finalité** : compiler **toutes les décisions prises** pour la soutenance Y Days Event du 2026-05-27, regroupées par domaine, pour mener une session Q&A "garde / update / réétudie" item par item avant l'oral blanc 2026-05-06.

**Méthode** : 17 domaines × ~5 items en moyenne = ~85 items. Chaque item a un statut, une décision littérale (sourcée), une question d'arbitrage. La colonne "Décision Phase B" est laissée vide — elle sera remplie au fur et à mesure de la session interactive.

**Convention statut** :
- ✅ **Figé** — décidé, sourcé, exécutable
- 🟡 **À valider** — décidé mais à confirmer ou affiner
- 🔴 **Ouvert** — non tranché, blocking ou non

**Légende décision Phase B** :
- 🟢 **Garde** — on conserve tel quel
- 🟠 **Update** — on garde l'idée mais on ajuste (préciser comment)
- 🔵 **Réétudie** — on rouvre, à reprendre dans une session dédiée
- ⚪ **N/A** — sans objet

---

## Domaine 1 — Cadrage produit (problème, USP, différenciation, tagline)

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 1.1 | Problème adressé | ✅ | Brasseur amateur FR aspirant à reproduire chez lui une bière qu'il a aimée — pas d'app FR moderne pour l'accompagner du scan à la recette | [pitch-hook-saynete-v1-cut.md](pitch-hook-saynete-v1-cut.md) + [target_audience.md](../../design/01_target-audience/target_audience.md) | |
| 1.2 | USP démontrée live | ✅ | **Scanner code-barre → recette équivalente** (figé 2026-04-16) | [plan-presentation-27-mai.md](plan-presentation-27-mai.md) §A1 | |
| 1.3 | Différenciation principale vs Brewfather / Little Bock | ✅ | (1) Langue FR native, (2) Simplicité évolutive 3 niveaux, (3) Scanner code-barre couplé encyclopedia, (4) Communauté FR | [pitch-anticipated-qa.md](pitch-anticipated-qa.md) Q3 | |
| 1.4 | Tagline canonique | ✅ | « **Brasser. Partager. Recommencer.** » (figé 2026-04-21) | [plan-presentation-27-mai.md](plan-presentation-27-mai.md) bloc 6 | |

---

## Domaine 2 — Cible / marché (chiffres, profil, géographie)

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 2.1 | « 10 millions de Français » buveurs bière artisanale | 🔴 → 🔵 | **Trou factuel #1** — non sourcé. Sourçage WebSearch 2026-05-05 : aucune statistique publique directe trouvée, MAIS chiffres alternatifs sourcés disponibles : 2 555 brasseries actives FR (Brasseurs de France), marché craft FR ~2 Md USD (Probity), CAGR FR +12,2 %, marché Europe 48,7 Md USD (Mordor). | [pitch-script-bloc1-cadrage.md](pitch-script-bloc1-cadrage.md) §"Options de repli" | **🔵 Réétudie** — session compile rigoureuse Perplexity+GPT+Claude planifiée. Garder l'état actuel jusqu'à sourçage. |
| 2.2 | Profil cible primaire | ✅ | 30-50 ans, 2-10 ans pratique, technophiles, urbains, francophones | [target_audience.md](../../design/01_target-audience/target_audience.md) §Cible primaire | |
| 2.3 | Marché européen 1,5 Md€ + CAGR 8,5 % | ✅ | Sourcé `target_audience.md` §Analyse marché européen | [target_audience.md](../../design/01_target-audience/target_audience.md) | |
| 2.4 | Géographie de lancement | ✅ | France + francophonie Europe (BB) ; Alpes-Maritimes (studio) | [business-model-canvas.md](business-model-canvas.md) bloc 1, [web-studio-brainstorming.md](web-studio-brainstorming.md) Q4 | |
| 2.5 | Concurrents nommés en pitch | ✅ | **Brewfather** (anglophone, 44 % adoption) + **Little Bock** (FR vieillissant) ; Untappd cité en Q&A | [pitch-script-bloc1-cadrage.md](pitch-script-bloc1-cadrage.md) §B + [pitch-anticipated-qa.md](pitch-anticipated-qa.md) Q3 | |

---

## Domaine 3 — Personas

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 3.1 | Personas v3 (5 personas + role IDs anglais) | ✅ | Léa Curieuse (Discovery primaire) / Nicolas Débutant (Novice) / Claire Amatrice (Amateur) / Zoé Éco (EcoResponsible) / Marc Expert (Expert). Toutes les 5 ont matérialisation v0.1 | [docs/personas/user_personas.md](../../personas/user_personas.md) v3 | |
| 3.2 | Persona primaire de la soutenance (demo hero) | ✅ | **Léa la Curieuse** — figée roadmap v0.1 | [docs/personas/user_personas.md](../../personas/user_personas.md) §Léa + [docs/product/roadmap-v0.1-consolidated.md](../../product/roadmap-v0.1-consolidated.md) | |
| 3.3 | **Cohérence S7 deck** | 🔴 → 🔵 | Squelette deck S7 affiche **Nicolas/Claire/Marc** (BMC) MAIS persona primaire = Léa. Conflit non tranché | [slide-deck-outline.md](slide-deck-outline.md) S7 vs [user_personas.md](../../personas/user_personas.md) | **🔵 Réétudie — refactor holistique** : merger les personas du 1er deck Ydays (à fournir lien) + personas v3 actuel + matérialisations v0.1, puis propager dans **tous** les docs BB (slide-deck-outline, pitch-script-bloc2, canva-slides-detail, BMC, user_personas.md). Item parking jusqu'à fourniture du lien ancien deck. |
| 3.4 | Personas dans BMC | 🟡 | BMC bloc 1 cite **3 personas** (Nicolas/Claire/Marc) — pas Léa, pas Zoé. Décalage avec personas v3 | [business-model-canvas.md](business-model-canvas.md) bloc 1 | |

---

## Domaine 4 — Proposition de valeur + accroche

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 4.1 | Pas d'accroche en anglais (Sarah) | ✅ | Décision D1 du 2026-05-05 — saynète FR uniquement | Cette session | |
| 4.2 | Saynète V1-cut Path B | ✅ | 240 mots, 1:50, parcours `scan → fiche → recette équivalente → ajustement volume 20→8 L → "Tu commences quand ?"`. Boutique + ratio prix coupés (Path B) | [pitch-hook-saynete-v1-cut.md](pitch-hook-saynete-v1-cut.md) | |
| 4.3 | Vocabulaire hybrid display partout | ✅ | « Amertume marquée · 40 IBU » / « Couleur ambrée · EBC 18 / SRM 9 » — pas de toggle utilisateur (#784) | [docs/product/roadmap-v0.1-consolidated.md](../../product/roadmap-v0.1-consolidated.md) §Méta-décisions | |
| 4.4 | 3 piliers présentation (annonce bloc 1) | ✅ | (1) Livré 8/11 + 97 tests, (2) Différenciant scan→recette FR, (3) BM + statut + trajectoire | [pitch-script-bloc1-cadrage.md](pitch-script-bloc1-cadrage.md) §D | |
| 4.5 | Variants V1-V5 abandonnés | ✅ | La saynète V1-cut **est** l'accroche. Variants ≤15 mots conservés en repli extrême uniquement | [plan-presentation-27-mai.md](plan-presentation-27-mai.md) §Révisions 2026-04-21 | |

---

## Domaine 5 — Saynète d'ouverture

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 5.1 | Format Live 2 voix | ✅ | Option 3 retenue — P1 + P2 jouée par 2 membres équipe Ydays | [pitch-hook-saynete-v1-cut.md](pitch-hook-saynete-v1-cut.md) §Format retenu | |
| 5.2 | Casting P1 (brasseur novice sceptique) | 🔴 → 🔵 | Casting reporté à la séance équipe Ydays du **mercredi 2026-05-06** (dernière avant soutenance). Profil-type clarifié dans saynète : tonus expressif, crédibilité « jamais brassé », persona-cible Léa Curieuse (féminin) ou Nicolas Débutant (masculin) | [pitch-hook-saynete-v1-cut.md](pitch-hook-saynete-v1-cut.md) §Distribution | **🔵 Réétudie 2026-05-06** — décision en séance équipe Ydays demain |
| 5.3 | Casting P2 (l'ami qui connaît l'app) | ✅ | **Benoît joue P2** (figé 2026-05-05) — reste sur scène, enchaîne T0 fluide | [pitch-hook-saynete-v1-cut.md](pitch-hook-saynete-v1-cut.md) §Distribution | **🟢 Garde — figé** |
| 5.4 | Accessoires | ✅ | Bouteille bière artisanale réelle (P1) + téléphone (P2). **Pas de mirror live** pendant la saynète — démo écran = vidéo courte intégrée slide S4 | [pitch-hook-saynete-v1-cut.md](pitch-hook-saynete-v1-cut.md) §Accessoires | |
| 5.5 | Fallback si absence acteur | ✅ | (a) Benoît joue P1 et P2 en alternance solo (b) Vidéo pré-enregistrée tournée semaine précédente | [pitch-hook-saynete-v1-cut.md](pitch-hook-saynete-v1-cut.md) §Fallback | |

---

## Domaine 6 — Démo live 5 min

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 6.1 | USP démo = scanner code-barre | ✅ | Figé 2026-04-16 (A1) | [plan-presentation-27-mai.md](plan-presentation-27-mai.md) §A1 | |
| 6.2 | beer-label-ai = R&D 1 phrase | ✅ | Slide S13 uniquement — *« Pipeline ML YOLOv8 + OCR opérationnel en labo, déploiement courant 2027 »* | [plan-presentation-27-mai.md](plan-presentation-27-mai.md) bloc 5 | |
| 6.3 | Démo 5 min strict (pas 8) | ✅ | Compressé 2026-04-21 selon consigne coach 25/03 | [pitch-script-bloc3-demo-live.md](pitch-script-bloc3-demo-live.md) | |
| 6.4 | Parcours démo (5 étapes) | ✅ | (1) Auth 30s + (2) Scan 2 bières 1:30 + (3) Calculateur ABV 45s + (4) Timeline batch + overlay tech 1:00 + (5) Transition T3 15s | [pitch-script-bloc3-demo-live.md](pitch-script-bloc3-demo-live.md) | |
| 6.5 | **Choix bières test A/B/C/D** | 🔴 → 🟠 | Stratégie figée 2026-05-05 : (a) Plusieurs bouteilles vides de marques/styles différents disposées en libre-service sur scène (le jury peut télécharger l'app et tester avec les bouteilles autour) + (b) Email coach J-10 demandant au jury d'apporter ses propres bouteilles + (c) Pour scan inconnu : message UX « Référence inconnue dans notre base — voulez-vous l'enrichir en scannant l'étiquette complète ? » (CTA vers fonctionnalité scan capture image en cours de mise en place) | [docs/product/soutenance/demo-script-2026-05-27.md](../../product/soutenance/demo-script-2026-05-27.md) §1-2 | **🟠 Update** : multi-bouteilles libre-service + demande coach + message UX scan inconnu enrichi (fonctionnalité capture image en parking) |
| 6.6 | 4 scénarios A/B/C/D figés | ✅ | A connu / B inconnu / C illisible / D non-bière. Pivots speaker rédigés | [docs/product/soutenance/demo-script-2026-05-27.md](../../product/soutenance/demo-script-2026-05-27.md) §2 | |
| 6.7 | 4 niveaux safety net | ✅ | (1) Live backend / (2) Mode avion + 9 bières seedées / (3) Demo trigger credentials PR #823 / (4) Vidéo backup pré-enregistrée | [docs/product/soutenance/demo-script-2026-05-27.md](../../product/soutenance/demo-script-2026-05-27.md) §3 | |
| 6.8 | **Vidéo backup démo** | 🔴 | À tourner avant **2026-05-20** (J-7). 1080p / 30 fps / ≤50 Mo / voiceover sync. Issue #533 | [docs/product/soutenance/demo-script-2026-05-27.md](../../product/soutenance/demo-script-2026-05-27.md) §3 | |

---

## Domaine 7 — Architecture / tech

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 7.1 | Monorepo 4 packages | ✅ | `mobile-app` (RN-Expo) / `api` (NestJS) / `beer-encyclopedia` (FastAPI) / `website` (statique) | [CLAUDE.md](../../../CLAUDE.md) §Monorepo | |
| 7.2 | 97 tests automatisés | ✅ | 51 mobile + 38 API + 8 Python (compté 2026-04-16). À l'audit 2026-05-05 = 36+78 ≈ 114 tests, vérifier le compte exact pour le pitch | [audit-features-mvp.md](audit-features-mvp.md) §3 | |
| 7.3 | 0 `any` TypeScript | ✅ | Règle stricte CLAUDE.md, vérifiée par CI | [CLAUDE.md](../../../CLAUDE.md) §Forbidden | |
| 7.4 | CI GitHub Actions path-filtered | ✅ | `.github/workflows/ci.yml` — packages testés isolément selon changements | [smart-objectives-par-pole.md](smart-objectives-par-pole.md) SMART #4 | |

---

## Domaine 8 — Business Model Canvas

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 8.1 | BMC synthèse 1 phrase | ✅ | « App mobile FR qui accompagne brasseurs amateurs (débutants à experts) sur tout leur parcours, freemium + partenariats LHBS francophones » | [business-model-canvas.md](business-model-canvas.md) §Synthèse | |
| 8.2 | Freemium tiers | ✅ | Modèle freemium documenté, paliers exacts dans `pricing-tiers-definition.md` (193 lignes) | [pricing-tiers-definition.md](pricing-tiers-definition.md) | |
| 8.3 | Partenariats LHBS (Local Home Brew Shops) | 🟡 | 3 magasins ciblés mentionnés. **Hypothèse à valider** — partenariats à formaliser (SMART #33) | [business-model-canvas.md](business-model-canvas.md) bloc 8 | |
| 8.4 | Lifetime Deal lancement | ✅ | 100 places × 99 € = +9,9 k€ one-shot année 1 | [financial-projections.md](financial-projections.md) §Bonus an 1 | |

---

## Domaine 9 — Prévisionnel financier

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 9.1 | OPEX an 1 → an 5 | ✅ | 3,5 k€ / 7,9 k€ / 16,3 k€ / 36 k€. Scaleway hosting + AI APIs Mistral/Claude + comptable | [financial-projections.md](financial-projections.md) §OPEX | |
| 9.2 | CAPEX an 1 | ✅ | 1-2,5 k€ — caméra démo + INPI marque + comptable setup micro→SAS | [financial-projections.md](financial-projections.md) §CAPEX | |
| 9.3 | Revenus an 1 → an 5 | ✅ | 14 k€ (dont +9,9 k€ LTD) / 32 k€ / 57 k€ / 108 k€. ARPU 4,50 € → 5 € | [financial-projections.md](financial-projections.md) §Revenus | |
| 9.4 | 3 scénarios alternatifs | ✅ | Conservateur 2 100 €/mo / **Médian 3 400 €/mo** / Agressif 6 200 €/mo (an 3 net mensuel) | [financial-projections.md](financial-projections.md) §Scénarios + [scenarios-alternatifs.md](scenarios-alternatifs.md) | |
| 9.5 | Break-even mois 5-6 | ✅ | OPEX mensuel ~290 € an 1 → ~80 utilisateurs payants à 4 € ARPU | [financial-projections.md](financial-projections.md) §Break-even | |

---

## Domaine 10 — Forme juridique

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 10.1 | Statut an 1 | ✅ | **Micro-entreprise** — CA < 10 k€ < plafond 77 700 €, charges fixes 0 €, formalités 30 min | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q14 §Recommandation | |
| 10.2 | Bascule SAS / EURL | ✅ | Quand traction dépasse 30-40 k€ an 2 → bascule sans perte (réversibilité micro) | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q14 §Recommandation | |
| 10.3 | Matrice comparative micro/EURL/SASU | ✅ | 12 critères comparés (formalités, comptabilité, plafond, cotisations, IS/IR, séparation patrimoine, chômage, TVA, crédibilité B2B, charges an 1, coût sortie) | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q14 §Matrice | |
| 10.4 | Filet SIRET équipe | ✅ | Un membre équipe a déjà un SIRET — solution rapide pour recevoir gains nationaux Y Days | [docs/ydays/references/2026-03-25_coach-session-summary.md](../references/2026-03-25_coach-session-summary.md) | |
| 10.5 | Dépôt marque INPI « Brasse-Bouillon » | 🟡 | Inclus CAPEX an 1 (~200 €). Date dépôt non figée | [financial-projections.md](financial-projections.md) §CAPEX | |

---

## Domaine 11 — Studio web (Eryon / pivot RH)

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 11.1 | Studio porte BB (pas l'inverse) | ✅ | Studio génère revenu → finance outils IA → temps gagné va au dev sérieux de BB | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q12 | |
| 11.2 | Solo durable « artisan tech » | ✅ | Pas d'embauche prévue à 3 ans. IA + industrialisation compensent l'absence d'équipe | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q3 | |
| 11.3 | Cible TPE food/boissons 06 | ✅ | Boulangers, brasseurs, cavistes, traiteurs, restaurateurs indépendants Alpes-Maritimes | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q4 | |
| 11.4 | Triplette différenciante | ✅ | (a) Méthode IA-driven / (b) Livraison 2-3 sem vs 2 mois concurrents / (c) Prix plancher transparent | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q5 | |
| 11.5 | Pricing studio | ✅ | Vitrine 1,5-3 k€ / Blog 2-4 k€ / E-commerce 4-8 k€ | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q7 | |
| 11.6 | Acquisition gratuite an 1 | ✅ | Bouche-à-oreille + content/SEO (blog studio + LinkedIn perso). Budget marketing si traction | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q10 | |
| 11.7 | **Studio web SUPPRIMÉ DU PITCH** | ❌ → ⚪ | **Décision majeure 2026-05-05** : on supprime entièrement l'idée du studio web/agence du pitch. Le but est de montrer que **BB se finance lui-même**. Plus question d'agence web. Toute la matière `web-studio-brainstorming.md` (309 lignes) est conservée en archive historique mais marquée "ABANDONNÉ pour la soutenance 2026-05-27". Cascade : bloc 5 réécrit, bloc 1 §C amputé du studio, S13 quadrant RH refait, SMART #31 retiré, Q&A studio web (3 questions) reformulées | Cette session | **⚪ N/A — supprimé du pitch** |
| 11.8 | SMART #31 (3 sites + 6 k€ + site studio live) | 🟡 | **Variante B retenue par défaut** — 3 sites clients (dont 2 vitrines food/boissons) avant 2026-11-30, CA cumulé ≥ 6 k€, site studio en ligne | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q15 §Variante B | |

---

## Domaine 12 — GTM / acquisition (BB)

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 12.1 | 4 canaux priorisés BB | ✅ | (1) Magasins LHBS / (2) YouTubers FR / (3) Reddit/FB FR / (4) Salons CRAB Rennes + Saint-Malo Beer Expo | [business-model-canvas.md](business-model-canvas.md) bloc 3 | |
| 12.2 | 1 000 pré-inscriptions cible | ✅ | SMART #34 — site `brasse-bouillon.com` live (questionnaire + newsletter actifs) | [smart-objectives-par-pole.md](smart-objectives-par-pole.md) SMART #34 | |
| 12.3 | Funnel projection acquisition | ✅ | Détaillé `funnel-projection.md` (181 lignes) — téléchargements, CAC, activation, conversion | [funnel-projection.md](funnel-projection.md) | |
| 12.4 | 3 partenariats LHBS (SMART #33) | 🟡 | Hypothèse — à formaliser. 3 magasins ciblés non nommés publiquement | [business-model-canvas.md](business-model-canvas.md) bloc 8 | |

---

## Domaine 13 — SMART objectives

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 13.1 | 36 SMART par pôle | ✅ | 12 par pôle (Dev / Création / Marketing) = 36 total. Core 6 rétrospectifs + Extended 6 prospectifs par pôle | [smart-objectives-par-pole.md](smart-objectives-par-pole.md) | |
| 13.2 | Core 6 SMART pour slide pitch | ✅ | #2 (8/11 features) / #8 (interfaces multi-niveaux) / #15 (3 personas docs) / #20 (design system) / #25 (étude marché 5 sources) / #34 (1 000 pré-inscriptions) | [plan-presentation-27-mai.md](plan-presentation-27-mai.md) §Figé | |
| 13.3 | SMART #31 reformulé (web studio) | 🟡 | Variante B — voir item 11.8 | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q15 | |

---

## Domaine 14 — Slide deck (S0-S14 + Canva)

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 14.1 | Squelette S0-S14 (15 slides) | ✅ | Slide-by-slide spec figée — voir mapping plages/phases | [slide-deck-outline.md](slide-deck-outline.md) | |
| 14.2 | **Vote 4 candidats Canva** | 🔴 → 🟠 | Décision 2026-05-05 : on finit l'audit ce soir, puis Benoît évalue les 4 candidats. Si aucun ne convient → repli sur **ancien deck Ydays** (couleurs/identité déjà calées, mascotte à disposer, importance de mettre **vraies captures d'écran de l'app** dans les slides) | Cette session + [canva-working-deck.md](canva-working-deck.md) | **🟠 Update** : décision après audit ce soir, plan B = ancien deck + vraies screenshots |
| 14.3 | Plan B Canva | ✅ | **Réutiliser ancien deck Ydays** comme base si aucun candidat ne convient (décision D2bis 2026-05-05) | Cette session | |
| 14.4 | Brand kit BB Canva | ✅ | Jaune doré `#F4BD3F` + brun cuivre `#A06A3A` + beige `#E0D3AA` + olive `#7D8C3A` + Manrope/Inter + mascotte chef-bière + watermark | [canva-working-deck.md](canva-working-deck.md) §v2 | |
| 14.5 | Densité ≤ 50 mots/slide | ✅ | Règle transverse — 1 idée = 1 slide, 48 pt titre / 24 pt corps min | [slide-deck-outline.md](slide-deck-outline.md) §Règle transverse | |

---

## Domaine 15 — Q&A anticipées

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 15.1 | 20 questions consolidées 6 thèmes | ✅ | (1) Produit/MVP × 5 / (2) BM/monétisation × 4 / (3) Tech/archi × 3 / (4) Marché/concurrence × 3 / (5) Équipe/Ydays × 2 / (6) Studio web × 3 | [pitch-anticipated-qa.md](pitch-anticipated-qa.md) §Thèmes | |
| 15.2 | Règle opérationnelle Q&A | ✅ | Écouter en entier / Reformuler en 1 phrase / 30-45 s max / Dire « je ne sais pas » si JNS / Renvoyer repo public | [pitch-anticipated-qa.md](pitch-anticipated-qa.md) §Règle opérationnelle | |
| 15.3 | Top 5 réponses 30-45s blindées | 🟡 | (1) CA an 1 / (2) Différenciant vs Brewfather/Little Bock / (3) Pourquoi micro vs SASU / (4) Pas de marketplace MVP / (5) Niveau utilisateurs 6 mois | [plan-de-soutenance-finalise.md](plan-de-soutenance-finalise.md) §4 | |

---

## Domaine 16 — Risques + safety nets

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 16.1 | Risk analysis matrix | ✅ | Documentée — D1 démo / D2 scanner / D7 seed / C3 dépassement / etc. | [risk-analysis.md](risk-analysis.md) | |
| 16.2 | Safety net démo 4 niveaux | ✅ | Voir item 6.7 | [docs/product/soutenance/demo-script-2026-05-27.md](../../product/soutenance/demo-script-2026-05-27.md) §3 | |
| 16.3 | Hosting Plan A/B | ✅ | **Klouders** (school server) primaire / **Fly.io** backup activable en 1 commande si Klouders fail J-5 | [hosting-strategy.md](hosting-strategy.md) | |

---

## Domaine 17 — Logistique soutenance

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 17.1 | Date + salle + format | ✅ | 2026-05-27 / Salle 0.301 R+3 Ynov Sophia / 30 min pitch + 10 min Q&A (40 min total) | [plan-presentation-27-mai.md](plan-presentation-27-mai.md) §Format | |
| 17.2 | Catégorie | ✅ | **Pitch Entrepreneurial** (vs Jeune Pousse) | [plan-presentation-27-mai.md](plan-presentation-27-mai.md) §Format | |
| 17.3 | **Oral blanc 2026-05-06** | 🔴 | À réserver auprès du coach (issue #536). P0 du status checklist | [soutenance-27-mai-status-checklist.md](soutenance-27-mai-status-checklist.md) §2 | |
| 17.4 | Dépôt Moodle | ✅ | Support déposé **après le passage** à l'oral | [plan-presentation-27-mai.md](plan-presentation-27-mai.md) §Format | |
| 17.5 | **Cartes de visite** | 🔴 | À commander avant **2026-05-13** | [soutenance-27-mai-status-checklist.md](soutenance-27-mai-status-checklist.md) §3 | |
| 17.6 | Tabliers floqués | 🟡 | Optionnel — Fablab Grasse + budget. À confirmer | [tabliers-floques-specs.md](tabliers-floques-specs.md) + issue #559 | |
| 17.7 | **Repo public/privé J-0** | 🔴 | Non tranché — visibilité repo `benoit-bremaud/brasse-bouillon` au 27/05 | [soutenance-27-mai-status-checklist.md](soutenance-27-mai-status-checklist.md) §3 | |
| 17.8 | **Cible QR final S14** | 🔴 | `brasse-bouillon.com/jury` (à construire) OU redirect README repo | [soutenance-27-mai-status-checklist.md](soutenance-27-mai-status-checklist.md) §3 | |

---

---

## Domaine 18 — Clôture interactive (goodies + quiz)

**Idée ajoutée 2026-05-05** : clôturer la soutenance par un moment interactif mémorable pour gagner le **+1 coup de cœur** de la grille. Engagement jury fort + univers de marque renforcé.

| ID | Item | Statut | Décision actuelle | Source | Décision Phase B |
|---|---|---|---|---|---|
| 18.1 | Quiz interactif via QR code | 🔴 | 5 questions smartphone jury, classement live, tirage si ex aequo. Outil non choisi (Wooclap / Mentimeter / Custom BB) | Cette session | |
| 18.2 | 1ᵉʳ prix — Kit brassage BB #001 | 🔴 | Kit brassage Brasse-Bouillon édition collector numérotée 1/1 (« celui par qui tout commence »). Composition kit à définir | Cette session | |
| 18.3 | Prix consolation — Chope mascotte | 🔴 | Chope gravée/imprimée mascotte BB pour 2ᵉ et 3ᵉ. Quantité à définir (2 ? 3 ? autant que jurés ?) | Cette session | |
| 18.4 | Goodies libre-service pendant pitch | 🔴 | Dessous de verre BB sur table + mini décapsuleurs porte-clés mascotte BB en libre-service. Quantité à définir | Cette session | |
| 18.5 | Timing — où on insère le quiz dans les 30 min ? | 🔴 | Quiz 3-5 min — insertion non tranchée. Options : (a) intégré au bloc 6 (conclusion 1 min → 4-6 min) en compressant marge flottante / (b) après les 30 min en début de Q&A 10 min / (c) demande extension format au coach | Cette session | |
| 18.6 | Logistique production goodies J-22 → J-0 | 🔴 | Délais commande/livraison à valider : kit collector + chopes gravées + dessous verre + décapsuleurs. Fablab Grasse possible pour gravure. Budget total à chiffrer | Cette session | |
| 18.7 | Script d'annonce quiz | 🟡 | Script proposé : *« Pour terminer en beauté, un petit défi Brasse-Bouillon ! Le gagnant repart avec le KIT #001 - édition collector numérotée 1/1. Les autres jurés recevront une chope édition limitée mascotte. Scannez le QR code et c'est parti pour 5 questions ! »* | Cette session | |
| 18.8 | Cohérence avec la grille « Pitch Entrepreneurial » | ✅ | Renforce **Pitch (clôture)** + **Production (innovation interactive)** + **Coup de cœur (+1)** | Grille pitch entrepreneurial | |

---

## ⚠️ Décisions structurelles 2026-05-05 — propagation requise

Ces décisions ont un impact en cascade sur plusieurs documents. À propager en Phase C.

### A. Suppression du studio web du pitch (item 11.7)

**Décision** : on supprime entièrement l'idée du studio web/agence du pitch. Le but est de montrer que **BB se finance lui-même**.

**Cascade documentaire** :

- `pitch-script-bloc1-cadrage.md` §C founder-fit — supprimer la phrase « porté ensuite par un studio que je lance dans les Alpes-Maritimes »
- `pitch-script-bloc5-bm-perspectives.md` — réécriture importante (~30 % du contenu). Nouvelle structure : **modèle d'auto-financement** (LTD lancement → freemium → partenariats LHBS → scale)
- `slide-deck-outline.md` S13 quadrant RH — réécrire au lieu de « j'ouvre mon studio », mettre « auto-financement freemium + LTD + LHBS »
- `canva-slides-detail.md` S13 — idem
- `web-studio-brainstorming.md` — **GARDER en archive historique** (309 lignes de matière utile pour un futur projet, ne pas supprimer du repo) MAIS marquer en tête : « ⚠️ ABANDONNÉ pour la soutenance 2026-05-27 — voir audit-decisions-2026-05-05.md item 11.7 »
- `smart-objectives-par-pole.md` — SMART #31 (3 sites studio + 6 k€) retiré du pitch
- `pitch-anticipated-qa.md` thème 6 — 3 questions studio web reformulées ou supprimées
- `business-model-canvas.md` — vérifier cohérence (BMC parle de freemium + LHBS, pas de studio, déjà cohérent)
- `plan-de-soutenance-finalise.md` §3 Phase 5 + §4 Q&A top 5 — réécrire

**Nouveau cadrage bloc 5** :

- **Phase amorçage (an 1)** : Lifetime Deal lancement (100 places × 99 € = 9,9 k€) couvre CAPEX
- **Phase activation (an 1-2)** : freemium tiers + Premium (~4,50 €/mo) → break-even mois 5-6
- **Phase consolidation (an 2-3)** : partenariats LHBS (3 magasins ciblés, commissions)
- **Phase scale (an 3+)** : équipe 2-3 personnes, infra prod, expansion francophonie
- **Forme juridique** : micro-entreprise an 1 pour BB lui-même (activité d'appoint pendant sécurisation), bascule SAS quand traction permanente

### B. Sourçage rigoureux des chiffres marché (item 2.1)

**Décision** : session compile rigoureuse Perplexity + GPT + Claude planifiée plus tard. Garder l'état actuel jusqu'à sourçage. Items à sourcer :

- « 10 millions de Français » buveurs bière artisanale (priorité 1)
- « 1,5 Md€ marché européen 2024 » (priorité 1 — le chiffre actuel ne match pas Mordor 48,7 Md USD)
- « +8,5 % CAGR jusqu'en 2033 » (priorité 2 — actuel ≠ Mordor 10,52 % ou Probity 12,2 %)
- « Brewfather 44 % adoption » (priorité 3 — réserve Q&A uniquement)

**Chiffres alternatifs déjà sourcés (WebSearch 2026-05-05)** disponibles en repli :

- 2 555 brasseries actives FR (Brasseurs de France / projet Amertume)
- France = 1ʳᵉ Europe + 5ᵉ producteur (24 M hl/an)
- Marché craft FR ~2 Md USD 2024 → 5,9 Md USD 2033, +12,2 % CAGR (Probity)
- Marché craft Europe 48,7 Md USD 2025 → 88,7 Md USD 2031, +10,52 % CAGR (Mordor)

### C. Refactor holistique personas (item 3.3)

**Décision** : merger personas du 1ᵉʳ deck Ydays (à fournir lien) + personas v3 actuel + matérialisations v0.1, puis propager dans tous les docs BB. Item parking jusqu'à fourniture du lien.

### D. Clôture interactive goodies + quiz (Domaine 18 nouveau)

**Décision** : intégrer un moment quiz + remise prix en clôture pour décrocher le +1 coup de cœur. Implémentation à arbitrer (timing, budget, logistique, outil quiz).

---

## Synthèse — items 🔴 ouverts (priorité Q&A)

12 items à trancher (par domaine) :

1. **2.1** — Source « 10 millions Français » ou bascule
2. **3.3** — Cohérence S7 deck (Léa vs Nicolas/Claire/Marc)
3. **5.2** — Casting P1 saynète
4. **5.3** — Casting P2 saynète (Benoît ou autre)
5. **6.5** — Choix bières test A/B/C/D
6. **6.8** — Tournage vidéo backup (deadline J-7)
7. **11.7** — Nom studio (Eryon ou anonyme)
8. **14.2** — Choix candidat Canva (ou plan B ancien deck)
9. **17.3** — Réserver oral blanc 2026-05-06
10. **17.5** — Commander cartes de visite (J-13)
11. **17.7** — Repo public/privé J-0
12. **17.8** — Cible QR final S14

## Synthèse — items 🟡 à valider (deuxième vague Q&A)

8 items à confirmer/affiner :

1. **3.4** — Personas BMC (Nicolas/Claire/Marc) vs personas v3 (Léa+4 autres)
2. **8.3** — Partenariats LHBS (3 ciblés — formalisation)
3. **10.5** — Date dépôt INPI marque
4. **11.8** — SMART #31 variante B (3 sites + 6 k€ + site studio live)
5. **12.4** — 3 partenariats LHBS SMART #33
6. **13.3** — SMART #31 reformulé (cf. 11.8)
7. **15.3** — Top 5 réponses Q&A blindées (à répéter chrono)
8. **17.6** — Tabliers floqués (Fablab + budget)

## Synthèse — items ✅ figés (validation rapide ou skip)

~65 items déjà figés et sourcés — la session Q&A peut les passer rapidement (validation par lot via "Garde tout" multi-select) sauf si tu veux rouvrir.

---

## Procédure Phase B

Pour chaque domaine 1 à 17, on enchaîne :

1. Tu m'indiques le domaine à attaquer (ou « tous dans l'ordre »).
2. Je pose une **AskUserQuestion** par item ouvert ou à valider, avec 4 choix : **🟢 Garde / 🟠 Update / 🔵 Réétudie / Need more explanation**.
3. Pour les items ✅ figés, je propose un **batch validation** (multi-select : « Garde tout » ou désélectionne ceux à réouvrir).
4. Ta décision se pose dans la colonne « Décision Phase B » de ce document **et** se propage dans le doc source si « Update ».
5. Tu peux interrompre/reprendre à tout moment.

**Estimation Phase B** : ~30-45 min pour les 12 items 🔴 + ~15 min pour les 8 items 🟡 + ~10 min de batch validation pour les ~65 items ✅ = **~1h totale** si pas trop de réétudes.

---

**Dernière mise à jour** : 2026-05-05 — création initiale post-audit complet du sitepress.
