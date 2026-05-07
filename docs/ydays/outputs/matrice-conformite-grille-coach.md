# Matrice de conformité — grille Pitch Entrepreneurial + résumé coach 25 mars

**Finalité** : valider que **chaque point de la grille Pitch Entrepreneurial** et **chaque consigne du résumé coach 2026-03-25** est couvert par notre pitch actuel. Sert de check-list pre-soutenance pour identifier les zones à renforcer.

**Source** :

- [grille-pitch-entrepreneurial.md](../references/grille-pitch-entrepreneurial.md) — grille officielle Ynov 80 pts + 1 coup de cœur
- [2026-03-25_coach-session-summary.md](../references/2026-03-25_coach-session-summary.md) — résumé séance coach 25 mars

**Convention couverture** :

- ✅ **Couvert** — point traité explicitement dans le pitch + slide associé
- 🟡 **Partiel** — point traité mais à renforcer
- 🔴 **Absent** — point non traité, action requise
- ⚪ **N/A** — point non applicable

---

## Partie 1 — Grille Pitch Entrepreneurial (80 pts + 1)

### Pitch — 15 pts

| Critère | Couverture | Localisation pitch | Notes |
|---|---|---|---|
| **Accroche percutante et claire** | ✅ | Phase 0 — Saynète V2 (S0-S4, 4:30) | Dialogue P1+P2 incarne Léa la Curieuse. Boutique panier + prix au litre + Mode Batch démontrés en saynète. Punchline finale « la prochaine fois c'est ta bière qu'on déguste ». |
| **Ton et raison d'être** | ✅ | Phase 1 — Cadrage (S5-S6, 2:30) §C founder-fit | Benoît : « Je n'ai pas découvert ce gap dans un rapport, je l'ai vécu. Dev depuis 10 ans, brasseur amateur, aucun outil francophone ne me convenait. » |
| **Proposition de valeur** | ✅ | Phase 1 (annonce 3 piliers) + Phase 5 (BMC §UVP) | 3 angles UVP : (1) Simplicité évolutive 4 niveaux personas, (2) Ancrage francophone natif, (3) Parcours complet du scan à la dégustation |
| **Objectifs SMART** | ✅ | Phase 1 — Annonce SMART implicite + Phase 5 — Slide BMC | Core 6 SMART cités : #2 (8/11 features stables), #3 (600+ tests automatisés ⚠️ update 97→647), #15 (4 personas docs), #20 (design system), #25 (étude marché 5 sources), #34 (1 000 pré-inscriptions) |

**Score estimé Pitch — état J-21 (2026-05-06) : 8-11 / 15.**

**Faiblesses objectives** :

- Saynète V2 (Path C) **pas encore répétée live** — risque chrono >4:30, transitions P1↔P2 inconnues, casting P1 non fait
- Vidéo S4 (3 min 35 s) **pas encore tournée** — pré-requis sprint Boutique panier visuel pas livré
- Chiffres marché « 10 M Français / 1,5 Md€ / +8,5 % CAGR » **non sourcés rigoureusement** — vulnérables à toute relance jury
- 4ᵉ persona (Léa primaire) ajouté tardivement (2026-05-06) — pas testé en répétition

**Score potentiel après exécution actions P0 (vidéo, sourcing, 4 répétitions) : 12-14 / 15.**

### Production — 30 pts

| Critère | Couverture | Localisation pitch | Notes |
|---|---|---|---|
| **Business model** | ✅ | Phase 5 — S12 BMC 9 cases synthétisé | BMC complet 9 blocs sourcé, 3 accents visuels (Segments / UVP / Revenus). Freemium 3 tiers (Free / Premium 2,99 € / Pro 5,99 €) + Lifetime Deal lancement 9,9 k€. Partenariats LHBS. |
| **Projet innovant** | ✅ | Phase 0 (saynète) + Phase 3 (démo) + Phase 5 (perspectives produit) | Innovation produit : scanner code-barre → recette équivalente FR (aucun concurrent). Innovation tech : 600+ tests auto, monorepo path-filtered CI, 0 `any`. Innovation sociale : roadmap Couronnes #739 + dégustation #896. |
| **Démonstration** | ✅ | Phase 3 — Démo live 5 min (S9-S10) | Démo live mirror téléphone + extensions B/D + scan capture image preview v0.2. **4 niveaux safety net** + vidéo backup pré-enregistrée. |
| **Réalisations** | ✅ | Phase 2 — UX/Design system (S7-S8) + Phase 3 (S9 architecture) | 8 features stables sur 11, 4 personas documentés (Léa+Nicolas+Claire+Marc), design system mobile-app docs, 600+ tests, 50 épiques tracés au backlog. |
| **Argumentation** | ✅ | Q&A 7 min anticipées (20 questions) + matrice juridique + sources marché | Pitch-anticipated-qa.md : 20 Q&A anticipées 30-45s. Matrice juridique micro/EURL/SASU (12 critères). Sources marché Mordor + Probity + Brasseurs de France + audit-features-mvp. |

**Score estimé Production — état J-21 (2026-05-06) : 17-22 / 30.**

**Faiblesses objectives** :

- **Démo live pas répétée** — 5 min strict pas chronométré, pas de pivot speaker testé sur les 4 scénarios A/B/C/D, scan capture image (preview v0.2) pas implémenté
- **Vidéo backup pas tournée** — deadline J-7 (2026-05-20). Si pas faite, pas de filet niveau 4
- **Boutique panier visuel pas développée** — Sprint Benoît (5-10h) à faire. Sans ça, vidéo S4 saynète V2 incomplète
- **BMC pas figé** — pricing tiers en parking (épique #897, à confirmer), Lifetime Deal en parking, partenariats LHBS en hypothèse non formalisée
- **« 600+ tests »** valide mais argumentation rapide — beaucoup de tests visuels sans preuves de couverture (SonarQube non documenté), si jury creuse risque embarras
- **Recherche concurrentielle exhaustive pas faite** — anecdote dernier oral encore non corrigée

**Score potentiel après exécution actions P0 (vidéo, sprint Boutique, recherche concurrentielle, 4 répétitions) : 24-28 / 30.**

### Perspective — 20 pts

| Critère | Couverture | Localisation pitch | Notes |
|---|---|---|---|
| **Statut juridique** | ✅ | Phase 5 — S13 quadrant Légal | Micro-entreprise BNC an 1 (BB lui-même, pas studio) → bascule SAS quand traction (>30-40 k€ an 2). Matrice comparée micro/EURL/SASU 12 critères en réserve Q&A. Filet SIRET membre équipe. ⚠️ Décision parking — à reconfirmer post-pricing marathon. |
| **RH** | ✅ | Phase 5 — S13 quadrant RH (cœur grille) | **Auto-financement BB en 4 phases** (Amorçage / Activation / Consolidation / Scale). Pas de levée de fonds qui dilue le contrôle. Premier recrutement (design + marketing) en Phase 4 si traction robuste an 3+. Studio web SUPPRIMÉ (cascade D3 2026-05-05). |
| **Commercialisation / market-com** | ✅ | Phase 5 — S13 quadrant GTM | 5 canaux priorisés : LHBS (3 magasins ciblés région PACA → national en cascade), 5 chaînes YouTube FR (Les Cités d'Orge, Bricole Brassicole, Une bière et Jivay, MASHY, Comment brasser sa bière), Reddit + Facebook + brassageamateur.com, salons CRAB Rennes + Saint-Malo Beer Expo, Influenceurs FR. Acquisition gratuite an 1 (bouche-à-oreille + content/SEO). |
| **Développement** | ✅ | Phase 5 — S13 quadrant Budget + Roadmap perspectives | Roadmap 50 épiques GitHub backlog regroupés en 4 axes : (1) Moat communautaire (Couronnes #739, dégustation #896, contribution scan #803, Alchimiste #895) / (2) Stratégie données (catalog #915, DB autonomy #853, multi-source #730, encyclopédie #541) / (3) Brewing assistant (#868, #751) / (4) Monétisation progressive (#878, #834, #897). |
| **Investissement** | ✅ | Phase 5 — S13 quadrant Budget | CAPEX 1-2,5 k€ initial, OPEX an 1 3,5 k€, **bootstrappable sans levée de fonds**. 3 dossiers financement public à déposer fin 2026 : **JEI** (45-50 k€ sur 7 ans), **Bourse French Tech BPI** (30 k€), **Incubateur régional**. Plus ACRE auto-déclarée (~1 500 €/an). Total effet financier 5 ans : ~125 k€ sans dilution. |

**Score estimé Perspective — état J-21 (2026-05-06) : 11-15 / 20.**

**Faiblesses objectives** :

- **Statut juridique en parking** (Domaine 10 audit) — 4 items 🔵 réétudie. Décision micro→SAS provisoire mais à reconfirmer post-pricing marathon. Si jury demande détails plafond CA / franchise TVA / cotisations, risque hésitation
- **Recrutement** : on dit « pas de recrutement an 1 » mais Phase 4 « premier recrutement design + marketing » non chiffrée (combien, quel profil, quel salaire)
- **Partenariats LHBS** : 3 magasins « identifiés » mais pas nommés publiquement, pas formalisés. Si jury demande qui, on n'a pas de réponse précise
- **Aides publiques** : JEI/BPI/French Tech bien documentés (financement-options-fr.md), mais **dossiers pas commencés**. Si jury demande timing dépôt, réponse vague (« fin 2026 »)
- **Stratégie influenceurs** : 5 chaînes identifiées (Cités d'Orge, Bricole Brassicole, etc.) mais **0 contact établi**, 0 partenariat même approché
- **Slide S13 perspectives produit** mentionne Couronnes (#739) + dégustation (#896) — mais ce sont des épiques **pas implémentés**, vulnérables à « montrez-moi »

**Score potentiel après exécution actions P0 + parking déléguées (pricing marathon, juridique révisé, recherche concurrentielle, partenariats LHBS formalisés) : 16-19 / 20.**

### Qualité orale — 15 pts

| Critère | Couverture | Localisation pitch | Notes |
|---|---|---|---|
| **Niveau de langue + vocabulaire adaptés** | 🟡 | Transversal | Pitch FR cohérent. Vocabulaire pro brewing (BJCP, BeerXML, mash, sparge, hop schedule, OG/FG, attenuation) appliqué. Hybrid display "Amertume marquée · 40 IBU" pour vulgarisation jury non-brassicole. ⚠️ À répéter chrono pour valider le niveau adapté à un jury pluridisciplinaire (tech/créa/marketing/audio-visuel). |
| **Éloquence** | 🟡 | Transversal — répétitions internes | **Pas d'oral blanc coach** (pas réservé à temps). Mitigation : 4 répétitions internes équipe (J-19 / J-14 / J-3 / J-1) + 1 répétition filmée + jury simulé amis externes. À tester. |
| **Aisance, préparation** | 🟡 | Transversal | Saynète V2 répétée 3 fois min avant J-14. 6 scripts blocs rédigés mot par mot. Pivots speaker pour 4 scénarios A/B/D + extensions. ⚠️ Répétitions internes encore à programmer. |
| **Gestion du temps** | ✅ | Plan-de-soutenance § Cartographie 6 phases | Découpage minute par minute : Saynète V2 4:30 + Cadrage 2:30 + Avant brassage 4:00 + Démo 5:00 + BM/Persp 7:00 + Marge 2:00 + Conclusion 1:00 + Tampon 4:00 = 30:00 pile. Quiz Wooclap 3 min en tête Q&A. Marge libérée par bloc 4 supprimé. |
| **Support esthétique et cohérent** | 🟡 | S0-S14 deck | Brand kit BB (jaune doré + brun cuivre + Manrope/Inter + mascotte). Squelette Canva post-restructure défini (canva-slides-detail-v2.md). ⚠️ Production en cours — peuplement collaboratif équipe Ydays J-21 → J-7. Cohérence visuelle finale validée à J-7 par Benoît. |
| **Pas lire les notes** | 🟡 | Transversal | 6 scripts blocs mémorisés via 4 répétitions. Aide-mémoire post-it sur le téléphone (not on slides). ⚠️ À valider en répétitions filmées. |

**Score estimé Qualité orale — état J-21 (2026-05-06) : 6-9 / 15.**

**Faiblesses objectives** :

- **Pas d'oral blanc coach** (créneau pas réservé) — pas de feedback expert externe avant J-0
- **Aucune répétition complète chronométrée** au moment de l'audit (J-21)
- **Saynète V2 jamais jouée** par P1+P2 — on n'a aucune idée de la fluidité réelle
- **Casting P1** non fait au moment de l'audit (planifié séance équipe 2026-05-06)
- **Vidéo backup démo** pas tournée — pas de répétition filmée pour audit rythme/gestes
- **Niveau de langue** présumé adapté mais non testé sur jury non-brassicole
- **Gestion imprévus** : safety net 4 niveaux théorique, **muscle memory pas développée** (transitions niveaux pas répétées en chrono)
- **Support** : deck Canva pas encore peuplé (commencement aujourd'hui en séance équipe)

**Score potentiel après exécution actions P0 (4 répétitions internes complètes + vidéo backup tournée + 1 répétition filmée) : 10-13 / 15.**

⚠️ **Cette catégorie est la plus à risque** car elle dépend entièrement des **répétitions et de l'exécution équipe**, pas de la documentation. Aucun document ne peut compenser un manque de répétitions.

### Coup de cœur — +1 pt

| Critère | Couverture | Localisation pitch | Notes |
|---|---|---|---|
| **Effet de marque + interactivité** | ✅ | Quiz Wooclap (post-30 min, 3 min) + Goodies (Kit BB #001 collector + chopes mascotte + dessous verre + décapsuleurs) | Idée originale : engagement smartphone du jury via quiz Wooclap. Kit BB #001 collector numéroté 1/1 comme 1er prix. Chopes gravées mascotte BB pour 2e/3e. Goodies libre-service sur la table pendant le pitch. Univers de marque renforcé. **Stratégie haut levier (peu de temps, gros bonus grille).** |

**Score estimé Coup de cœur — état J-21 (2026-05-06) : 0 / +1.**

**Faiblesses objectives** :

- **Quiz Wooclap** pas encore créé (Tâche I team-tasks, deadline J-7)
- **Goodies** pas commandés — devis pas même reçus (Tâche B team-tasks, livraison demain soir)
- **Kit BB #001** : composition pas figée (en attente devis), pas de fournisseur identifié
- **Page brasse-bouillon.com/jury** pas construite (Tâche G team-tasks, deadline J-7)
- **Saynète V2 mémorable** = potentiel théorique, dépend du casting P1 + 3 répétitions

**Score potentiel après exécution actions P0 (quiz créé, goodies commandés/livrés, page jury construite, saynète bien jouée) : +1 / +1.**

→ Le coup de cœur est **conditionné à l'exécution** des 5 actions ci-dessus. À J-21, c'est encore une intention, pas un acquis.

### Synthèse Partie 1 — Grille Pitch Entrepreneurial (deux scénarios)

| Catégorie | Points max | **État J-21 (objectif)** | **Potentiel post-actions P0** |
|---|---|---|---|
| Pitch | 15 | **8-11** | 12-14 |
| Production | 30 | **17-22** | 24-28 |
| Perspective | 20 | **11-15** | 16-19 |
| Qualité orale | 15 | **6-9** | 10-13 |
| Coup de cœur | +1 | **0** | +1 |
| **TOTAL** | **80 + 1** | **42-57 / 81** | **62-75 / 81** |

**Lecture honnête** :

- **État J-21 (aujourd'hui)** : si la soutenance avait lieu maintenant, on serait à **42-57 / 81** soit **52-70 %**. Beaucoup d'éléments documentés, mais peu exécutés (vidéo backup, répétitions, casting, sourcing chiffres, sprint Boutique, page jury, quiz Wooclap, goodies, recherche concurrentielle). Le pitch se tient sur le papier — pas sur scène.
- **Potentiel post-actions P0** (si TOUT est exécuté entre J-21 et J-0) : **62-75 / 81** soit **77-93 %**. C'est la cible réaliste.

**Différentiel = 20 points en 21 jours** = exécution disciplinée des actions P0 (9 actions critiques, cf. §Points d'action critiques).

⚠️ **Cette estimation est volontairement honnête, pas flatteuse**. La soutenance réelle dépend de l'exécution équipe + Benoît dans les 21 jours, pas de la qualité de la documentation déjà produite.

---

## Partie 2 — Résumé coach 2026-03-25 (consignes)

### Concours Y Days Event

| Consigne coach | Couverture | Notes |
|---|---|---|
| Catégorie « Pitch Entrepreneurial » (vs « Jeune Pousse ») | ✅ | Confirmé item 17.2 audit-decisions. BMC tangible + MVP livré = critères Pitch Entrepreneurial. |
| Concours intercampus national, sélection campus + accès incubateur | ✅ | Compris. SIRET filet équipe en cas de gains nationaux (item 10.4). |
| Sélection projets avec business model tangible et plus abouti | ✅ | BB MVP livré (8/11 features stables), BMC complet, 4 phases auto-financement chiffrées, 600+ tests = projet abouti. |

### Grille évaluation et structure

| Consigne coach | Couverture | Notes |
|---|---|---|
| Pondération 80/20 ; 30 min + 10 min Q&A | ✅ | Format respecté. Quiz Wooclap 3 min en tête Q&A → 7 min Q&A jury. Total 40 min. |
| 5 min réservées démo finale | ✅ | Phase 3 démo live 5 min strict (compressé de 8 → 5 selon consigne coach). |
| Pitch (15 pts) accroche percutante + raison d'être + PV + SMART | ✅ | Phase 0 + Phase 1 couvrent tous les critères (cf. Partie 1). |
| Démo production (innovation visuelle/fonctionnelle/technique/sociale) | ✅ | Phase 3 démo live + S13 perspectives produit. Innovation tech (monorepo + 600+ tests) + sociale (Couronnes + dégustation v0.2) + visuelle (design system, Recipe Hub PR #917, Recipe Detail PR #916). |
| Qualité présentation : niveau langue, éloquence, préparation, gestion imprévus, pas lire notes | 🟡 | Cf. Partie 1 §Qualité orale. À valider en répétitions internes. |

### Proposition de valeur et étude de marché/concurrence

| Consigne coach | Couverture | Notes |
|---|---|---|
| PV doit découler de l'étude de marché | ✅ | UVP 3 angles dérivés target_audience.md + competitive-deep-dive.md. Sources Mordor + Probity + Brasseurs de France. |
| Éviter comparaison frontale en soutenance | ✅ | Tableau comparatif S6 (BB vs Brewfather vs Little Bock) sans dénigrement, uniquement constatation factuelle. Q&A préparées si jury creuse. |
| Être prêt à justifier la différenciation lors des Q&R | ✅ | Q3 Q&A anticipées : « Différenciation vs Brewfather/Little Bock ? » avec 3 angles concrets. Réserve : BeerSmith, Untappd. |
| ⚠️ Anecdote dernier oral : un membre jury a tapé « brassage bière » et trouvé un site non cité | 🔴 | **PARKING — Recherche concurrentielle exhaustive à reprendre** (item D2.5 audit-decisions). À traiter avant J-7. |

### Livrables UX/créa et démonstration des productions intermédiaires

| Consigne coach | Couverture | Notes |
|---|---|---|
| Wireframes, maquettes, tests utilisateurs, intégration retours | 🟡 | docs/design/04_wireframes existe (9 screen wireframes). Tests utilisateurs limités. À enrichir post-soutenance. **Pas de slide dédié wireframes dans le deck v2 actuel** — Couvert via S8 (UX + design system) qui montre les vraies captures d'écran (état final, pas wireframes). |
| Expliquer cheminement (priorisation, coordination Dev, itérations, jalons) | 🟡 | Couvert partiellement S8 + Phase 5 quadrant Budget (CAPEX/OPEX). Pas de slide dédié rétroplanning. ⚠️ La grille **Pitch Entrepreneurial** ne demande PAS le rétroplanning détaillé (c'était la grille intermédiaire gestion de projet — 2026-03 oral intermédiaire). On peut le mentionner en Q&A. |
| Attentes fortes UX et tangibilité livrables | ✅ | S7 (4 personas v4) + S8 (UX + design system) + Recipe Hub Recipe Detail screenshots = livrables tangibles. |

### Démo finale et gestion des risques (effet démo)

| Consigne coach | Couverture | Notes |
|---|---|---|
| 5 min démo produit final, idéalement live téléphone | ✅ | Phase 3 démo live 5 min mirror téléphone (extensions B/D + scan capture). |
| Vidéo backup obligatoire | 🟡 | Doc demo-script-2026-05-27.md §3 décrit la spec. **Tournage J-14 → J-7 (deadline 2026-05-20 ferme)**. Tâche E team-tasks. ⚠️ À tourner. |
| Excuses techniques pas acceptables | ✅ | Safety net 4 niveaux (Live → Mode avion → Demo trigger → Vidéo backup) garantit que la démo passe. + Plan C demo trigger ajouté (item 16.3). |

### Perspectives (statut juridique, RH, market-com, développement, investissement)

| Consigne coach | Couverture | Notes |
|---|---|---|
| Statut juridique envisagé + justification | ✅ | Micro-entreprise BNC an 1 + matrice 12 critères + bascule SAS. Cf. Partie 1 §Perspective. |
| Stratégie market-com et commercialisation | ✅ | 5 canaux priorisés. Acquisition gratuite an 1 + content/SEO. Cf. Partie 1 §Perspective. |
| Développement (technique, fonctionnel, partenariats, investissements) | ✅ | Roadmap 50 épiques + 4 axes stratégiques. Cf. Partie 1 §Perspective. |
| Anticiper besoins RH | ✅ | 4 phases auto-financement BB. Premier recrutement Phase 4 si traction (design + marketing communauté). Pas de levée de fonds qui dilue. |

### Accroche et qualité oratoire

| Consigne coach | Couverture | Notes |
|---|---|---|
| Accroche aboutie (vs 1ère soutenance) | ✅ | Saynète V2 4:30 vs V1 simple — niveau d'aboutissement très supérieur (parcours utilisateur complet incarné). Path C (vs B précédent) réintroduit boutique + prix maison + Mode Batch. |
| Vulgarisation jury pluridisciplinaire | ✅ | Hybrid display vocab pro + populaire ("Amertume marquée · 40 IBU"). Schémas plutôt que code (S9 architecture monorepo en blocs visuels). |
| Pas lire les notes | 🟡 | Aide-mémoire post-it téléphone, pas sur slides. ⚠️ À valider en répétitions filmées. |
| Gestion fluide des supports | 🟡 | Bandeau overlay tech permanent S10 pendant démo. Slides sobres (peu de texte) facilitent la fluidité. ⚠️ À valider en répétitions. |

### Attentes du jury et niveau de vulgarisation

| Consigne coach | Couverture | Notes |
|---|---|---|
| Jury pluridisciplinaire (tech/créa/market-com/audio-visuel) | ✅ | Hybrid display vocab + 5 canaux GTM (couvre marketing) + S9 architecture (couvre tech) + S8 design system (couvre créa). |
| Preuves compréhensibles par tous + appréciables par experts | ✅ | Demo live (compréhensible par tous) + overlay tech permanent (apprécié par experts dev). |
| Schémas/infrastructures plutôt que code | ✅ | S9 schéma monorepo en blocs visuels, pas de code source dans le pitch. |

### Exigences administratives

| Consigne coach | Couverture | Notes |
|---|---|---|
| SIRET/RIB pour l'année prochaine si gains | ✅ | Filet SIRET membre équipe (item 10.4 audit). Création micro-entreprise BB ASAP recommandée. |

---

## Synthèse globale matrice de conformité

### Conformité grille Pitch Entrepreneurial

| Catégorie | % couverture estimée |
|---|---|
| Pitch | **87-100 %** |
| Production | **90-100 %** |
| Perspective | **90-100 %** |
| Qualité orale | **73-87 %** ⚠️ à valider en répétitions internes |
| Coup de cœur | **100 %** |

### Conformité résumé coach 25 mars

| Section | Statut |
|---|---|
| Concours Y Days Event | ✅ Couvert |
| Grille évaluation et structure | ✅ Couvert |
| PV et étude de marché | 🟡 Recherche concurrentielle exhaustive à finaliser |
| Livrables UX/créa | 🟡 Tests utilisateurs limités, mais grille FINALE Pitch Entrepreneurial n'exige pas les wireframes (c'était l'oral intermédiaire) |
| Démo finale | 🟡 Vidéo backup à tourner J-7 |
| Perspectives | ✅ Couvert (4 axes Légal/RH/GTM/Budget) |
| Accroche et qualité orale | ✅ Saynète V2 + 🟡 répétitions internes à programmer |
| Attentes jury pluridisciplinaire | ✅ Couvert |
| Exigences administratives | ✅ Filet SIRET |

---

## 🔴 Points d'action critiques pre-soutenance

| Action | Deadline | Priorité | Statut |
|---|---|---|---|
| Tourner vidéo backup démo (J-7) | 2026-05-20 | P0 | 🔴 À faire (Tâche E team-tasks) |
| Recherche concurrentielle exhaustive (anecdote dernier oral) | J-7 | P1 | 🔴 À faire (parking) |
| Sourcer rigoureusement chiffres marché (10 M FR / 1,5 Md€ / +8,5 % CAGR) | J-7 | P1 | 🔴 À faire (parking compile Perplexity+GPT+Claude) |
| 4 répétitions internes complètes chronométrées | J-19 / J-14 / J-3 / J-1 | P0 | 🔴 À programmer |
| Construire page brasse-bouillon.com/jury (Wooclap + APK + Discord) | J-7 | P0 | 🔴 À faire (Tâche G team-tasks) |
| Sprint Boutique panier visuel (Benoît, ~5-10h) | J-14 | P0 | 🔴 À faire (Tâche D team-tasks) |
| Pricing marathon épique #897 (D8/D9 dépendances) | J-7 ou post-soutenance | P2 | 🔵 Parking |
| Forme juridique révisée (D10 dépendances) | J-7 ou post-soutenance | P2 | 🔵 Parking |
| Refactor personas v4 doc (Léa primaire + 4 cards S7) | J-14 | P1 | 🟡 Décision prise, doc à mettre à jour |
| Audit pre-public repo (gitleaks + secrets + SECURITY.md) | J-3 | P0 | 🔴 À faire (Tâche H team-tasks) |
| Casting P1 saynète V2 | 2026-05-06 séance équipe | P0 | 🟡 Aujourd'hui en séance |
| Cartes de visite | J-14 | P1 | 🟡 Commande cette semaine |
| Devis goodies (Kit + chopes + dessous + décapsuleurs) | Demain soir | P1 | 🟡 Délégué membre équipe demain |

### Score estimé total — 3 scénarios objectifs

| Scénario | Hypothèse | Score estimé | % grille |
|---|---|---|---|
| **Pessimiste — actions P0 partielles** | Vidéo backup tournée mais pas répétée + casting P1 fait + chiffres marché restent comme aujourd'hui + 1-2 répétitions internes seulement + quiz/goodies arrivent en partie | **52-62 / 81** | **64-77 %** |
| **Médian — actions P0 complètes** | TOUTES les 9 actions P0 exécutées dans les 21 jours, mais qualité variable | **62-72 / 81** | **77-89 %** |
| **Agressif — actions P0 + parking déléguées équipe livrées** | Toutes actions P0 + 4 zones parking traitées par l'équipe (sourcing chiffres, recherche concurrentielle, pricing marathon, juridique révisé) avec qualité élevée + répétitions filmées | **70-78 / 81** | **86-96 %** |

**Cible objectif réaliste** : **scenario médian = 65-70 / 81**. Au-dessus = bonus, au-dessous = échec partiel.

→ **Le destin du score se joue dans les 3 prochaines semaines, pas dans la documentation déjà produite.**

---

## Liens vers documents associés

- [grille-pitch-entrepreneurial.md](../references/grille-pitch-entrepreneurial.md) — grille officielle Ynov
- [2026-03-25_coach-session-summary.md](../references/2026-03-25_coach-session-summary.md) — résumé coach 25 mars
- [audit-decisions-2026-05-05.md](audit-decisions-2026-05-05.md) — audit complet 17 domaines
- [plan-de-soutenance-finalise.md](plan-de-soutenance-finalise.md) — fiche de scène J-0
- [team-tasks-2026-05-06.md](team-tasks-2026-05-06.md) — actions critiques pre-soutenance
- [pitch-hook-saynete-v2-long.md](pitch-hook-saynete-v2-long.md) — saynète V2 4:30
- [canva-slides-detail-v2.md](canva-slides-detail-v2.md) — squelette deck v2
- [pitch-script-bloc5-bm-perspectives.md](pitch-script-bloc5-bm-perspectives.md) — bloc 5 réécrit auto-financement
- [financement-options-fr.md](financement-options-fr.md) — 12 aides publiques FR

---

**Dernière mise à jour** : 2026-05-06 — création initiale (matrice de fin de session audit).
