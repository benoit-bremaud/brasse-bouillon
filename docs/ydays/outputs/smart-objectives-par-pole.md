# 36 Objectifs SMART — par pôle

**Date de rédaction** : 2026-04-16
**Finalité** : fournir la matière pour la slide "Objectifs SMART" du pitch
et pour répondre aux questions du jury sur la mesurabilité de ce qui a été
livré et ce qui est planifié.

::: warning Références `#522-#528` = mapping historique, pas la grille réelle
Les annotations *Critère grille* qui apparaissent ci-dessous (`#522`,
`#523`, `#524`, `#525`, `#526`, `#527`, `#528`) renvoient à un **mapping
fictif** d'issues GitHub internes utilisé avant que la grille Ynov
officielle ne soit récupérée (2026-04-21). Elles sont conservées telles
quelles pour éviter de réécrire 36 annotations, mais **la grille réelle**
est la grille **Pitch Entrepreneurial** à 4 catégories :

- **Pitch (15 pts)** ← #522
- **Production (30 pts)** ← #524, #525, #527 (BM + innovation + démo + slide deck)
- **Perspective (20 pts)** ← #526
- **Qualité orale (15 pts)** ← #523 (transversal)
- **coup de cœur (+1)** ← #528

Référence canonique :
[references/grille-pitch-entrepreneurial.md](../references/grille-pitch-entrepreneurial.md).
:::

## Méthode de dérivation

Chaque SMART s'appuie sur une source **traçable** dans le repo. Toute
affirmation chiffrée qui ne peut être vérifiée factuellement est
explicitement marquée `[trou factuel]` et listée dans
[debrief/2026-04-16_session-decisions.md](../debrief/2026-04-16_session-decisions.md)
pour validation par le user avant la soutenance.

Structure par pôle :

- **Core 6 (rétrospectifs)** : slide pitch — ce qui est livré, mesuré sur
  sources existantes.
- **Extended 6 (prospectifs)** : matière Q&A et suivi post-soutenance —
  horizons 3 / 6 / 12 mois post-livraison.

Format : **Énoncé SMART** / **Source** / **Critère grille ciblé**.

---

## Pôle Développement

Rôle dans la soutenance : ancre la crédibilité technique du MVP (qualité
code, CI, tests, architecture).

### Rétrospectifs (core 6)

1. **Livrer un MVP multi-plateforme sur 4 packages (`mobile-app`, `api`,
   `beer-encyclopedia`, `website`) opérationnels sur `main` avant le 2026-05-27.**
   - *Source* : structure monorepo npm workspaces,
     [CLAUDE.md](../../../CLAUDE.md) § Monorepo Structure
   - *Critère grille* : Démo live (#525, 30 pts)

2. **Atteindre ≥ 8/11 features MVP stables démontrables en live au 2026-04-16.**
   - *Source* : [audit-features-mvp.md](audit-features-mvp.md) — verdict
     8/11 ✅, 2/11 🟡, 1/11 R&D
   - *Critère grille* : Démo live (#525, 30 pts)

3. **Maintenir une suite de tests automatisés d'au moins 95 tests sur les
   3 stacks (mobile / API / Python) au 2026-04-16.**
   - *Source* : [audit-features-mvp.md](audit-features-mvp.md) — agrégé
     51 mobile + 38 API + 8 Python = 97 tests
   - *Critère grille* : Business model + innovation (#524, 30 pts)
     (fiabilité produit)

4. **Industrialiser la CI GitHub Actions avec filtrage par package pour
   limiter le temps de build aux seuls packages modifiés.**
   - *Source* : [.github/workflows/ci.yml](../../../.github/workflows/ci.yml),
     [CLAUDE.md](../../../CLAUDE.md) § CI Pipeline
   - *Critère grille* : Business model + innovation (#524, 30 pts)

5. **Implémenter l'authentification JWT sur `packages/api` avec tests de
   contrat livrés au Sprint 4.**
   - *Source* : [audit-features-mvp.md](audit-features-mvp.md) feature #1,
     [PROJECT_LOG.md](../../../PROJECT_LOG.md) (Sprint 4)
   - *Critère grille* : Démo live (#525, 30 pts)

6. **Formaliser un framework Scrum documenté (sprints, DoR, DoD,
   cérémonies) et l'exécuter sur 6 sprints entre 2025-12 et 2026-05.**
   - *Source* :
     [sprint-definition.md](../../project-management/sprint-definition.md),
     [definition-of-done.md](../../project-management/definition-of-done.md),
     [definition-of-ready.md](../../project-management/definition-of-ready.md)
   - *Critère grille* : Slide deck (#527, 15 pts)

### Prospectifs (extended 6)

7. **Compléter les 3 features 🟡/🔴 restantes (Recettes CRUD mobile complet,
   Batches mesures, Boutique backend) d'ici 2026-09-30 (horizon 3 mois).**
   - *Source* : [audit-features-mvp.md](audit-features-mvp.md) + backlog
     post-soutenance
   - *Critère grille* : Perspectives (#526, 20 pts)

8. **Atteindre 80 % de couverture de tests mesurée par SonarQube sur les
   4 packages d'ici 2026-12-31 (horizon 6 mois).**
   - *Source* : [sonar-project.properties](../../../sonar-project.properties),
     [tools/ci/](../../../tools/ci/) ; cible standard fixée dans
     [CLAUDE.md](../../../CLAUDE.md) § Code Quality
   - *Critère grille* : Perspectives (#526, 20 pts)

9. **Conduire 2 itérations bêta fermées (10 utilisateurs/iter) entre
   2026-07 et 2026-09 avec NPS et retours qualifiés consignés.**
   - *Source* : objectif repris du [vision.md](../../vision/vision.md)
     § Prochaines étapes (bêta test) — modalités à affiner
   - *Critère grille* : Perspectives (#526, 20 pts)

10. **Réaliser un pen test OWASP Top 10 + audit RGPD externe avant la
    mise en production publique (horizon avant V1.0).**
    - *Source* :
      [security_standards.md](../../architecture/security/security_standards.md),
      CLAUDE.md § CI Security Tooling ; date cible à caler avec le go-to-market
    - *Critère grille* : Perspectives légal (#526, 20 pts)

11. **Déployer une infrastructure de production (PostgreSQL managé +
    hébergement API + CDN) avant 2026-12-31, avec monitoring (Sonar +
    Sentry ou équivalent).**
    - *Source* : [infrastructure.md](../../architecture/infrastructure.md),
      [ci_cd.md](../../architecture/ci_cd.md)
    - *Critère grille* : Perspectives budget (#526, 20 pts)

12. **Publier un guide `CONTRIBUTING.md` + `AGENTS.md` permettant
    l'onboarding d'un contributeur externe en < 1 journée, validé par
    l'onboarding effectif d'au moins 1 contributeur d'ici 2026-09.**
    - *Source* : [CONTRIBUTING.md](../../../CONTRIBUTING.md) existe déjà ;
      objectif = validation empirique
    - *Critère grille* : Business model + innovation — aspect open-source
      différenciant (#524, 30 pts)

---

## Pôle Création (UX / UI / Design)

Rôle dans la soutenance : démontrer la différenciation produit par le
design (simplicité évolutive, identité FR, personas couverts).

### Rétrospectifs (core 6)

13. **Livrer 11 wireframes couvrant toutes les features MVP avant la
    soutenance.**
    - *Source* :
      [docs/design/04_wireframes/](../../design/04_wireframes/) à vérifier
    - *Critère grille* : Slide deck (#527, 15 pts)
    - **Note** : à cross-checker — le count exact n'a pas été confirmé.

14. **Formaliser une charte graphique (couleurs, typographie, iconographie)
    dans `docs/design/06_design-charter/`.**
    - *Source* :
      [docs/design/06_design-charter/](../../design/06_design-charter/)
    - *Critère grille* : Slide deck (#527, 15 pts)

15. **Documenter les 3 personas (Nicolas débutant, Claire créative, Marc
    expert) avec objectifs, frustrations et fonctionnalités attendues.**
    - *Source* :
      [user_personas.md](../../personas/user_personas.md) — 3 personas
      présents (NB : décision 16/04 mentionnait "2 personas + 3e à produire"
      — à reconsolider, cf. debrief)
    - *Critère grille* : Pitch (#522, 15 pts) + BM (#524, 30 pts)

16. **Implémenter un design system cohérent (tokens couleurs / spacing /
    typography) utilisé par 100 % des écrans mobiles livrés.**
    - *Source* : [CLAUDE.md](../../../CLAUDE.md) § Code Style Defaults —
      interdit les valeurs hardcodées ; principe appliqué dans
      `packages/mobile-app/src/`
    - *Critère grille* : Slide deck (#527, 15 pts)

17. **Documenter les flows UX des 11 features MVP (avant/pendant/après
    brassage) dans les diagrammes de séquence DS01–DS08.**
    - *Source* :
      [docs/architecture/sequence_diagrams/](../../architecture/sequence_diagrams/)
      — 8 diagrammes DS01–DS08 présents
    - *Critère grille* : Business model + innovation (#524, 30 pts)

18. **Appuyer la cible design sur la recherche démographique publiée dans
    `docs/design/01_target-audience/target_audience.md` (brasseurs FR
    30-50 ans, gap vs Brewfather anglophone).**
    - *Source* :
      [target_audience.md](../../design/01_target-audience/target_audience.md)
    - *Critère grille* : Pitch (#522, 15 pts) + BM (#524, 30 pts)

### Prospectifs (extended 6)

19. **Valider chaque persona par 5 interviews semi-dirigées (total 15
    interviews) d'ici 2026-09-30 (horizon 3 mois après soutenance).**
    - *Source* : [user_personas.md](../../personas/user_personas.md) +
      horizon fixé arbitrairement, à valider avec le pôle
    - *Critère grille* : Perspectives (#526, 20 pts)

20. **Atteindre un taux de complétion du funnel d'onboarding ≥ 60 %
    (création compte → première recette créée) mesuré sur la bêta
    fermée (horizon 6 mois).**
    - *Source* : besoin identifié dans
      [target_audience.md](../../design/01_target-audience/target_audience.md)
      § Onboarding progressif ; outil mesure à définir
    - *Critère grille* : Perspectives (#526, 20 pts)

21. **Atteindre la conformité WCAG 2.1 niveau AA sur les 5 écrans
    critiques (login, home, recette, calculateur, scan) d'ici 2026-12-31.**
    - *Source* : exigence standard ; pas encore mesurée dans le repo —
      *[trou factuel : niveau actuel d'accessibilité à auditer]*
    - *Critère grille* : Perspectives (#526, 20 pts)

22. **Produire 3 mockups haute-fidélité par persona (total 9) pour le
    prochain jalon produit, avant fin Q3 2026.**
    - *Source* : dossier
      [docs/design/05_mockups/](../../design/05_mockups/) à compléter
    - *Critère grille* : Slide deck (#527, 15 pts)

23. **Itérer le design system vers une identité "premium artisanale"
    (inspiration craft FR) sur 2 cycles de 6 semaines avant 2026-12.**
    - *Source* : positionnement dérivé de
      [target_audience.md](../../design/01_target-audience/target_audience.md)
      § Différenciation vs outils propriétaires ; plan d'itération à
      formaliser
    - *Critère grille* : BM + innovation (#524, 30 pts)

24. **Conduire 3 tests utilisateurs modérés (5 participants chacun) sur
    les flows critiques (recette, scan, calculateur) entre 2026-07 et
    2026-10 avec rapports livrables.**
    - *Source* : méthodologie UX standard ; à caler avec pôle
    - *Critère grille* : Perspectives (#526, 20 pts)

---

## Pôle Marketing

Rôle dans la soutenance : démontrer la compréhension du marché, du
positionnement et du go-to-market. Plusieurs chiffres attendus proviennent
d'un sondage interne non trouvé dans le repo → voir `[trou factuel]`.

### Rétrospectifs (core 6)

25. **Documenter une étude de marché s'appuyant sur 5 sources externes
    (Brülosophy 2024, AHA 2024, Little Bock, Untappd FR, YouGov UK) et
    identifiant un gap technologique français exploitable.**
    - *Source* :
      [target_audience.md](../../design/01_target-audience/target_audience.md)
      § Sources et études
    - *Critère grille* : BM + innovation (#524, 30 pts)

26. **Formuler une proposition de valeur centrée sur "simplifier le
    brassage artisanal francophone grâce à un outil intuitif,
    communautaire et progressif" publiée dans `docs/vision/vision.md`.**
    - *Source* : [vision.md](../../vision/vision.md)
    - *Critère grille* : Pitch (#522, 15 pts)

27. **Cibler un segment primaire de 30-50 ans, brasseurs intermédiaires
    (2-10 ans d'expérience), francophones, adopteurs d'applications
    mobiles, documenté avec données démographiques.**
    - *Source* :
      [target_audience.md](../../design/01_target-audience/target_audience.md)
      § Cible primaire recommandée
    - *Critère grille* : Pitch (#522, 15 pts) + BM (#524, 30 pts)

28. **Identifier 4 canaux d'acquisition prioritaires (LHBS, YouTubers FR,
    Reddit/FB, salons CRAB/Saint-Malo) avec justification documentée.**
    - *Source* :
      [target_audience.md](../../design/01_target-audience/target_audience.md)
      § Canaux d'acquisition prioritaires
    - *Critère grille* : BM + innovation (#524, 30 pts)

29. **Collecter les premières réponses au questionnaire communauté live
    sur [brasse-bouillon.com](https://brasse-bouillon.com) avant le
    2026-05-27 — objectif minimum 30 répondants pour disposer d'une
    base défendable en Q&A.**
    - *Source* : questionnaire communauté déployé dans le package
      website ([packages/website/index.html](../../../packages/website/index.html)
      §`questionnaireFr`) — 4 sections (profil, pratique, attentes,
      contact). **Les chiffres "63,3 % / 54 répondants / 2 personas
      validés" évoqués dans les sessions antérieures étaient des
      estimations, pas des résultats d'enquête** — à retirer des
      supports. Le sondage réel reste à conduire (diffusion via
      réseau personnel + Discord brasseurs + Reddit r/Brasserie FR
      avant oral blanc 2026-05-06).
    - *Critère grille* : Production (30 pts) — validation marché
      honnête et traçable.

30. **Poser une identité de marque (nom Brasse-Bouillon, tagline, visuels
    associés) cohérente avec la cible francophone.**
    - *Source* : tagline en cours — voir [CLAUDE.md](../../../CLAUDE.md)
      § UI stays French ; fichier de déclinaison marketing non centralisé
      dans le repo *[trou factuel : emplacement canonical de la tagline]*
    - *Critère grille* : Pitch (#522, 15 pts)

### Prospectifs (extended 6)

31. **Lancer un studio web personnel en micro-entreprise après la
    soutenance, livrer 3 sites clients (dont 2 sites vitrines TPE
    food/boissons) avant 2026-11-30 pour un CA cumulé ≥ 6 000 €,
    et publier le site du studio avec sa grille de prix
    transparente.**
    - *Source* : pivot décidé 2026-04-19 (cf.
      [web-studio-brainstorming.md](web-studio-brainstorming.md) et
      [../debrief/2026-04-19_session-decisions.md](../debrief/2026-04-19_session-decisions.md))
      — remplace l'ancien SMART "recruter un référent Marketing".
      Logique : le studio **finance** le développement sérieux de
      Brasse-Bouillon (étude marché et marketing non tenus en
      Ydays). Variante B (équilibrée) retenue, 2 autres variantes
      (A prudente, C ambitieuse) disponibles pour arbitrage à
      l'oral blanc 06/05.
    - *Critère grille* : Perspectives RH (#526, 20 pts)

32. **Définir un plan GTM avec 3 canaux priorisés par persona (9 couples
    canal/persona) et chiffrer le coût d'acquisition visé avant
    2026-09-30.**
    - *Source* :
      [target_audience.md](../../design/01_target-audience/target_audience.md)
      § Canaux × personas [user_personas.md](../../personas/user_personas.md)
    - *Critère grille* : Perspectives GTM (#526, 20 pts)

33. **Sécuriser 3 partenariats formalisés avec des magasins spécialisés
    (LHBS) ou brasseries artisanales locales avant 2026-12-31.**
    - *Source* :
      [target_audience.md](../../design/01_target-audience/target_audience.md)
      § Partenariats LHBS
    - *Critère grille* : Perspectives GTM (#526, 20 pts)

34. **Atteindre 1 000 pré-inscriptions newsletter sur
    [brasse-bouillon.com](https://brasse-bouillon.com) avant le
    lancement public V1.0 (horizon 6 mois post-soutenance).**
    - *Source* : KPI de succès repris de
      [vision.md](../../vision/vision.md) § Indicateurs — 1 000 utilisateurs
      actifs dans les 6 mois. **Landing live** — package
      [packages/website](../../../packages/website/README.md) déployé sur
      GitHub Pages, domaine `brasse-bouillon.com`, formulaire newsletter
      actif (`#newsletterFr`) + questionnaire communauté
      (`#questionnaireFr`). CNAME = `brasse-bouillon.com`.
    - *Critère grille* : Perspectives GTM (20 pts)

35. **Publier 10 contenus éducatifs bilingues Fr/technique (Academy)
    entre 2026-06 et 2026-12 pour soutenir l'acquisition organique.**
    - *Source* : feature Academy, [audit-features-mvp.md](audit-features-mvp.md)
      #9 — déjà stable localement, volume éditorial à planifier
    - *Critère grille* : Perspectives GTM (#526, 20 pts)

36. **Déposer 3 dossiers de financement (BPI, concours French Tech,
    incubateur régional) d'ici 2026-12-31 pour sécuriser la phase de
    croissance.**
    - *Source* : horizon post-soutenance standard ; pas de source repo —
      *[trou factuel : budget / modèle de revenu à formaliser]*
    - *Critère grille* : Perspectives budget (#526, 20 pts)

---

## Synthèse — pitch "core 6"

Pour la slide SMART du pitch (90 sec max), retenir **1 SMART par pôle
× 2 (1 rétro + 1 prospectif)** = 6 SMART :

- Dev rétro : **#2** (8/11 features stables démontrées en live)
- Dev prospectif : **#8** (80 % couverture tests sous 6 mois)
- Création rétro : **#15** (3 personas documentés)
- Création prospectif : **#20** (60 % complétion onboarding bêta)
- Marketing rétro : **#25** (étude de marché 5 sources, gap FR identifié)
- Marketing prospectif : **#34** (1 000 pré-inscriptions avant V1.0)

Les 30 autres sont mobilisables en Q&A et dans les annexes (#527 slide
deck + repo).

## Trous factuels à combler avant le 2026-05-27

Listés aussi dans
[debrief/2026-04-16_session-decisions.md](../debrief/2026-04-16_session-decisions.md) :

1. ~~Sondage interne "63,3 % / 54 répondants"~~ → **résolu 2026-04-21** :
   les chiffres n'étaient pas issus d'un vrai sondage mais d'estimations.
   **Retirés de tous les supports**. Le questionnaire communauté est
   live sur [brasse-bouillon.com](https://brasse-bouillon.com) et peut
   être diffusé avant l'oral blanc 2026-05-06 pour produire une base
   réelle (objectif 30 répondants min).
2. ~~Landing page live~~ → **résolu 2026-04-21** : **brasse-bouillon.com**
   déployé via GitHub Pages (CNAME ok), formulaire newsletter + questionnaire
   actifs. Source : [packages/website/README.md](../../../packages/website/README.md).
3. ~~Tagline canonique Brasse-Bouillon~~ → **résolu 2026-04-21** :
   tagline A = "Brasser. Partager. Recommencer." arbitrée dans
   [pitch-script-bloc6-conclusion.md](pitch-script-bloc6-conclusion.md).
   À propager dans CLAUDE.md / README / landing site si pas déjà fait.
4. ~~Statut recrutement pôle marketing~~ → **résolu 2026-04-19** :
   pivot abandonné, remplacé par vision studio web personnel (cf.
   [web-studio-brainstorming.md](web-studio-brainstorming.md)).
5. Niveau d'accessibilité actuel (WCAG) — à auditer. **Non bloquant
   soutenance** ; SMART #21 prospectif suffit.
6. Wireframes — compter factuellement le nombre livré (11 attendus).
   **Non bloquant** ; SMART #13 sourcé sur repo actuel.
