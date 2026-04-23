# Backlog — site VitePress de la soutenance du 27 mai

**Finalité** : transformer la documentation `docs/ydays/` en site
VitePress partageable par lien, afin que les membres de l'équipe
puissent lire la soutenance dans le bon ordre, s'imprégner du pitch
et produire des retours exploitables avant le 2026-05-27.

## Décisions de cadrage

- **Architecture** : mini-site VitePress **dédié** dans `docs/ydays/`,
  sans intégration dans `packages/website`.
- **Source de vérité** : les fichiers Markdown existants sous
  `docs/ydays/` restent la source principale ; le site les expose et
  les organise, sans recréer inutilement le contenu.
- **Déploiement cible** : Cloudflare Pages, une fois le build local
  validé.
- **Mode de diffusion retenu** : **public non indexé**, partage par
  lien direct, sans exposition depuis le site principal.
- **Canal de review initial** : **Discord**.
- **Widget feedback** : hors périmètre MVP ; intégration envisagée
  **uniquement après** mise en ligne du site et validation du parcours
  de lecture.

## Epic

### EPIC YD-VP-01 — Publier la documentation Ydays comme site VitePress partageable

**Objectif** : produire un site simple, lisible et partageable qui
permette à un collègue du projet de :

1. comprendre rapidement la soutenance du 27 mai ;
2. lire les documents dans un ordre logique ;
3. retrouver facilement les slides, scripts, Q&A et risques ;
4. faire des retours utiles sans devoir naviguer dans le repo.

**Critères de réussite** :

- un lien unique peut être partagé à toute l'équipe ;
- la navigation reflète le vrai parcours de préparation ;
- les documents pivots sont accessibles en moins de 2 clics ;
- le site est lisible sur desktop ;
- le mode de diffusion retenu est documenté et cohérent avec la
  sensibilité des contenus.

**Hors périmètre MVP** :

- personnalisation graphique poussée du thème ;
- refonte lourde du contenu des documents existants ;
- intégration du widget feedback avant la mise en ligne ;
- fusion avec le site vitrine public Brasse-Bouillon.

## Sous-issues proposées

| ID | Type | Priorité | Est. | Dépend de | Résumé |
|----|------|----------|------|-----------|--------|
| YD-VP-01 | Task | P0 | 1 SP | — | Cadrer le périmètre éditorial du site |
| YD-VP-02 | Feature | P0 | 3 SP | YD-VP-01 | Créer le squelette VitePress dans `docs/ydays/` |
| YD-VP-03 | Docs | P0 | 3 SP | YD-VP-01 | Concevoir la navigation et l'ordre de lecture |
| YD-VP-04 | Docs | P0 | 3 SP | YD-VP-03 | Créer la homepage orientée prise en main |
| YD-VP-05 | Docs | P1 | 5 SP | YD-VP-03 | Créer les pages d'index et parcours guidés ✅ |
| YD-VP-06 | Docs | P0 | 3 SP | YD-VP-02, YD-VP-03 | Brancher les documents Ydays existants dans le site |
| YD-VP-07 | Docs | P1 | 3 SP | YD-VP-05, YD-VP-06 | Lisser l'expérience de lecture |
| YD-VP-08 | Docs | P1 | 2 SP | YD-VP-04 | Ajouter une page "comment faire un bon retour" |
| YD-VP-09 | Chore | P2 | 2 SP | YD-VP-02 | Ajouter recherche, metadata et finitions minimales |
| YD-VP-10 | Chore | P0 | 3 SP | YD-VP-02, YD-VP-06 | Préparer le déploiement Cloudflare Pages |
| YD-VP-11 | Task | P0 | 1 SP | YD-VP-10 | Trancher le mode d'accès : public ou protégé |
| YD-VP-12 | Task | P2 | 2 SP | YD-VP-10, YD-VP-11 | Valider le site avec 1 à 2 lecteurs internes |
| YD-VP-13 | Feature | P2 | 5 SP | YD-VP-10, YD-VP-12 | Intégrer le widget feedback en toute fin si le temps le permet |
| YD-VP-14 | Feature | P2 | 2 SP | YD-VP-10 | Afficher la version du site + page changelog accessible depuis la nav (issue #579) |

## Détail des sous-issues

### YD-VP-01 — Cadrer le périmètre éditorial du site

**But** : décider ce qui doit apparaître dans le site et dans quel
ordre.

**Livrables** :

- liste des documents inclus ;
- liste des documents relégués en annexe ;
- ordre de lecture principal ;
- ordre de lecture rapide ("10 minutes") pour les collègues.

**Definition of Done** :

- le périmètre éditorial du MVP est figé ;
- les documents pivots sont identifiés ;
- les debriefs historiques ne polluent pas la lecture principale.

### YD-VP-02 — Créer le squelette VitePress dans `docs/ydays/`

**But** : disposer d'un site local fonctionnel sans toucher au site
marketing existant.

**Livrables** :

- `docs/ydays/package.json` ;
- `docs/ydays/.vitepress/config.ts` ;
- scripts `dev`, `build`, `preview` ;
- page d'accueil minimale.

**Definition of Done** :

- le serveur local démarre ;
- le build statique réussit ;
- le sous-projet est autonome vis-à-vis de `packages/website`.

### YD-VP-03 — Concevoir la navigation et l'ordre de lecture

**But** : éviter un simple dump de fichiers Markdown.

**Navigation cible** :

- Accueil
- Lire d'abord
- Plan de soutenance
- Deck & slides
- Scripts
- Q&A jury
- Risques & backup
- Références
- Historique / décisions

**Definition of Done** :

- un collègue peut comprendre où cliquer sans connaître le repo ;
- l'ordre de lecture reflète la vraie préparation de l'oral.

### YD-VP-04 — Créer la homepage orientée prise en main

**But** : rendre le site immédiatement utile pour l'équipe.

**Contenu attendu** :

- ce qu'est la soutenance du 27 mai ;
- le format 30 + 10 ;
- comment lire la documentation ;
- trois entrées principales :
  - comprendre la soutenance en 10 min ;
  - relire le pitch complet ;
  - faire un retour utile.

**Definition of Done** :

- la homepage sert de porte d'entrée claire ;
- elle guide au lieu d'exposer des fichiers bruts.

### YD-VP-05 — Créer les pages d'index et parcours guidés

**But** : introduire les sections avant d'envoyer le lecteur dans les
documents détaillés.

**Pages candidates** :

- `index.md`
- `read-first.md`
- `pitch-overview.md`
- `slides-overview.md`
- `scripts-overview.md`
- `qa-overview.md`
- `risks-overview.md`

**Definition of Done** :

- chaque grande section a une page d'index courte ;
- les liens vers les fichiers source sont regroupés proprement.

### YD-VP-06 — Brancher les documents Ydays existants dans le site

**But** : exposer les contenus déjà produits sans les dupliquer.

**Documents prioritaires** :

- `README.md`
- `plan-presentation-27-mai.md`
- `slide-deck-outline.md`
- `canva-slides-detail.md`
- `pitch-script-bloc1-cadrage.md` à `pitch-script-bloc6-conclusion.md`
- `pitch-transitions.md`
- `pitch-anticipated-qa.md`
- `risk-analysis.md`
- `business-model-canvas.md`
- `smart-objectives-par-pole.md`
- `web-studio-brainstorming.md`
- `references/`

**Definition of Done** :

- tous les documents pivots sont accessibles depuis la navigation ;
- les liens internes sont valides ;
- aucun doublon de contenu n'a été créé sans nécessité.

### YD-VP-07 — Lisser l'expérience de lecture

**But** : rendre le site agréable et lisible pour des collègues non
techniques.

**Travaux** :

- harmoniser les titres trop techniques ;
- ajouter quelques callouts (`A retenir`, `A verifier`, `Risque`) ;
- alléger la navigation si certains docs sont trop bruts.

**Definition of Done** :

- lecture fluide sur desktop ;
- pas d'effet "wiki brouillon".

### YD-VP-08 — Ajouter une page "comment faire un bon retour"

**But** : transformer la lecture en revue utile.

**Contenu attendu** :

- ce qu'on attend des collègues ;
- les points prioritaires à challenger ;
- le format de feedback souhaité :
  - points flous ;
  - contradictions ;
  - timings trop longs ;
  - claims peu crédibles ;
  - slides trop chargées.

**Definition of Done** :

- les retours attendus sont cadrés ;
- le site aide à récupérer des feedbacks exploitables.

### YD-VP-09 — Ajouter recherche, metadata et finitions minimales

**But** : rendre le site praticable au quotidien.

**Travaux** :

- recherche locale VitePress ;
- titres de page propres ;
- description du site ;
- favicon minimal ;
- footer simple.

**Definition of Done** :

- retrouver un document-clé prend quelques secondes ;
- le site fait propre sans entrer dans une personnalisation lourde.

### YD-VP-10 — Préparer le déploiement Cloudflare Pages

**But** : obtenir un lien preview puis un lien partageable.

**Travaux** :

- définir la commande de build ;
- définir le dossier de sortie ;
- préparer la configuration Cloudflare Pages ;
- vérifier que le site se publie sans dépendre du reste du monorepo.

**Definition of Done** :

- le build de prod est reproductible ;
- une preview déployée fonctionne.

### YD-VP-11 — Formaliser le mode d'accès retenu

**But** : documenter clairement l'arbitrage de diffusion retenu.

**Décision retenue** :

- site **public non indexé** ;
- diffusion **contrôlée par lien direct** ;
- pas de lien depuis le site public principal ;
- bascule vers Cloudflare Access seulement si le cercle de diffusion
  s'élargit.

**Definition of Done** :

- la décision est écrite dans la documentation ;
- les garde-fous `noindex` sont présents ;
- le mode de diffusion est cohérent avec la sensibilité des contenus.

### YD-VP-12 — Valider le site avec 1 à 2 lecteurs internes

**But** : vérifier que l'outil sert réellement à l'équipe.

**Test attendu** :

- demander à 1 ou 2 collègues de retrouver seuls :
  - le plan de soutenance ;
  - le deck ;
  - le Q&A ;
  - les risques ;
  - la façon de faire un retour.

**Definition of Done** :

- les lecteurs s'orientent sans aide ;
- les retours portent sur le fond, pas sur la navigation.

### YD-VP-13 — Intégrer le widget feedback en toute fin si le temps le permet

**But** : faciliter la collecte de retours directement dans le site.

**Référence** :

- dépôt : `https://github.com/benoit-bremaud/feedback-widget.git`

**Contraintes** :

- à traiter **après** mise en ligne du site ;
- à traiter seulement si le MVP VitePress est déjà utile sans lui ;
- l'intégration ne doit pas dégrader la lisibilité ni ralentir la
  diffusion.

**Definition of Done** :

- le site est déjà en ligne ;
- le widget est intégré proprement ;
- le parcours de feedback reste simple pour un collègue non technique.

## Phasage recommandé

### Phase 1 — MVP partageable

- YD-VP-01
- YD-VP-02
- YD-VP-03
- YD-VP-04
- YD-VP-06
- YD-VP-10
- YD-VP-11

**Résultat** : un site lisible, navigable, déployable, partageable.

### Phase 2 — Amelioration de l'experience de lecture

- YD-VP-05
- YD-VP-07
- YD-VP-08
- YD-VP-09

**Résultat** : un site plus agréable, mieux structuré et plus utile
pour la revue.

### Phase 3 — Validation et extensions

- YD-VP-12
- YD-VP-13

**Résultat** : un site validé par l'équipe, avec widget feedback
seulement si le temps et la stabilité le permettent.

## Chemin critique

Ordre d'execution recommandé :

1. YD-VP-01 — cadrage éditorial
2. YD-VP-02 — bootstrap VitePress
3. YD-VP-03 — navigation
4. YD-VP-04 — homepage
5. YD-VP-06 — branchement des docs
6. YD-VP-10 — déploiement Cloudflare
7. YD-VP-11 — décision d'accès

## Estimation globale

- **MVP utile en local** : 2 à 4 heures
- **Version propre partageable** : 4 à 6 heures
- **Version bien finie** : environ 1 journée

## Questions ouvertes a trancher plus tard

- Lien **public** ou **protégé** pour les collègues ?
- Sous-domaine dédié ou URL Cloudflare Pages standard ?
- Le widget feedback doit-il créer un canal structuré (email, notion,
  issue, autre) ou seulement une capture libre ?
