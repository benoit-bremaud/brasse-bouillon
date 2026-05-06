# Q&A anticipées — soutenance 27 mai

**Contexte** : après les 30 min de pitch, **10 minutes de questions /
réponses** avec le jury (format Ynov 2026-04-19). Ce document
anticipe **27 questions** probables avec **réponses prêtes de
30-45 s** chacune, regroupées par thème (22 questions en séance
principale Q1-Q20 + 7 back-pocket Q21-Q27 ; Q6-bis et Q6-ter sont
des sous-questions de la section Produit, pas des numéros séparés).

**Règle opérationnelle Q&A** (rappel) :

- Écouter la question **en entier** avant de répondre.
- **Reformuler** la question en 1 phrase pour gagner du temps de
  réflexion et vérifier la compréhension.
- Répondre en **30-45 secondes max**.
- Dire **"je ne sais pas"** quand c'est le cas (mieux que le bluff).
- Renvoyer vers le **repo public** ou `docs/ydays/` pour les détails.

## Thèmes couverts

1. Produit & MVP (7 questions — dont Couronnes, Dégustation)
2. Business model & monétisation (4 questions)
3. Technique & architecture (3 questions)
4. Marché & concurrence (4 questions — dont Joliebulle FERMÉ 2025)
5. Équipe & parcours Ydays (2 questions)
6. Statut juridique & perspectives (2 questions — micro vs SASU, Wooclap)

## 1. Produit & MVP

### Q1. "Vous avez dit 8 features stables sur 11. Quelles sont les 3 qui ne le sont pas ?"

**Réponse (~35 s)** :

> "Trois features ne sont pas stables au sens démo live :
> **Boutique** est exclue — c'est un scaffolding UI sans backend,
> on ne l'a pas prioritisée sur le MVP.
> **Recettes** et **Batches** sont partiellement livrées : la
> création et la modification côté mobile ne sont pas finies,
> donc on les montre en **lecture seule** pendant la démo.
> Post-soutenance, ces trois features sont le SMART prospectif
> numéro 7, livraison d'ici fin septembre 2026. Le détail feature
> par feature est dans `docs/ydays/outputs/audit-features-mvp.md`
> du repo."

### Q2. "Quel niveau de test sur le MVP ?"

**Réponse (~30 s)** :

> "**647 tests TypeScript** : **407 côté mobile** avec Jest et
> React Testing Library, **240 côté API** avec Jest sur NestJS.
> Le beer-encyclopedia Python a en sus **8 tests pytest** couvrant
> la chaîne YOLOv8 + EasyOCR — ces 8 tests sont hors du total
> de 647 qui ne compte que la stack TypeScript.
> On vise 80 % de couverture SonarQube sur les 4 packages d'ici
> fin 2026 — c'est le SMART prospectif numéro 8."

### Q3. "Quelle est la différence entre Brasse-Bouillon et Brewfather concrètement pour un utilisateur ?"

**Réponse (~40 s)** :

> "Trois différences concrètes.
> **Langue** : Brasse-Bouillon est **français natif** — pas
> traduit, pensé en français. Brewfather reste anglophone.
> **Courbe d'apprentissage** : Brewfather est conçu pour
> l'expert, interface dense, paramètres techniques partout.
> Brasse-Bouillon offre **trois niveaux** — Nicolas débutant,
> Claire créative, Marc expert.
> **Scanner code-barre couplé à l'encyclopedia** :
> Brasse-Bouillon scanne une bière commerciale, affiche sa
> fiche (brasserie, style, ABV, format) et suggère jusqu'à
> 3 recettes proches dans l'app. Brewfather ne
> scanne pas, Little Bock non plus, Untappd scanne pour noter,
> pas pour créer."

### Q4. "Le scanner code-barre, il marche vraiment ? Ou c'est une démo ?"

**Réponse (~30 s)** :

> "Il marche vraiment — vous l'avez vu live tout à l'heure sur
> une vraie bière. Ce n'est pas une slide : le **parcours de
> scan existe réellement**. Côté mobile, Expo Camera lit le
> code-barre, demande 5 lectures identiques avant validation,
> puis affiche une fiche bière si la référence est reconnue.
> Si elle ne l'est pas, **fallback photo** avant/arrière pour
> poursuivre l'analyse. Le flux est couvert par des tests côté
> mobile, et le module `scan` existe côté API sur la branche
> `main`. Pour la soutenance, je sécurise un happy path démo
> sur des références préparées plutôt que de prétendre couvrir
> tout le marché."

### Q5. "Vos 4 personas sont documentés mais pas validés par des utilisateurs réels, non ?"

**Réponse (~40 s)** :

> "Bonne question. Les 4 personas — Léa la Curieuse, Nicolas le
> Débutant, Claire l'Amatrice, Marc l'Expert — sont dérivés de
> la recherche documentaire : étude **Brülosophy 2024** sur
> 2 200 répondants, données **Little Bock 36 378 inscrits**
> (janvier 2026), analyse marché européen 2024-2025.
> **Appuyés** par des données publiques, mais pas validés en
> interviews directes. C'est le SMART prospectif numéro 19 :
> **15 interviews semi-dirigées**, 5 par persona-type, d'ici
> fin septembre 2026. On l'assume comme un trou factuel du
> pitch à combler en priorité post-soutenance."

### Q6-bis. "L'embouteillage avec capsules couronnes, c'est dans l'app ?"

**Réponse (~25 s)** :

> "Oui. Le **Mode Batch** guide le brasseur à chaque étape de
> bout en bout — y compris la phase d'embouteillage.
> L'app calcule la **quantité de sucre de refermentation** pour
> atteindre le taux de CO₂ cible, et indique le timing avant
> décapsulage recommandé selon le style.
> La capsule couronne, c'est l'étape finale : l'app l'intègre
> dans le parcours et la chronomètre. On ne laisse pas le
> brasseur sortir de l'app pour aller chercher la réponse
> ailleurs."

### Q6-ter. "Y a-t-il une fonction de dégustation ou de notation de ses propres bières ?"

**Réponse (~30 s)** :

> "Oui — deux niveaux.
> **Free tier** : notes texte libres sur chaque brassin,
> horodatées. Simple, comme un carnet de cave numérique.
> **Pro tier** : fiche dégustation structurée — grille
> **BJCP** (couleur SRM, clarté, mousse, arôme, goût,
> amertume, finale), photo, note globale sur 5.
> L'historique des dégustations devient un outil de
> **versioning sensoriel** : on compare V1 et V2 de la même
> recette sur des critères normalisés, pas juste 'j'aimais
> plus l'ancienne'."

## 2. Business model & monétisation

### Q6. "Quelle grille tarifaire freemium précise ?"

**Réponse (~35 s)** :

> "La grille n'est pas figée — je l'assume. L'**application est
> gratuite** avec les fonctions essentielles : recettes,
> calculateurs, scanner, Academy. Le **tier payant** couvre :
> export CSV, intégration IoT, historiques avancés, templates
> premium. La grille précise — prix mensuel, prix annuel, seuils
> — se cale dans un **atelier entrepreneurial post-soutenance**,
> en lien avec les retours bêta sur les 4 personas. Mettre un
> prix ferme aujourd'hui sans avoir testé l'acceptation serait
> du bluff."

### Q7. "Comment financez-vous Brasse-Bouillon si l'app est gratuite au démarrage ?"

**Réponse (~40 s)** :

> "L'an 1, **Brasse-Bouillon ne coûte presque rien** : hébergement
> Fly.io ~10 €/mois, domaine, outils IA. Pas de masse salariale.
> En micro-entreprise, les premières recettes — abonnements
> Premium 2,99 €/mois, Pro 5,99 €/mois — couvrent les frais
> dès quelques centaines d'utilisateurs actifs.
> En parallèle, je prévois de déposer **3 dossiers de
> financement** — BPI, concours French Tech, incubateur
> régional — dans les 6 semaines post-soutenance.
> **C'est une courbe d'amorçage, pas un modèle qui nécessite
> du capital dès J+1.**"

### Q8. "Qu'est-ce qui prouve qu'il y a un marché francophone pour ça ?"

**Réponse (~40 s)** :

> "Trois sources convergentes.
> **Little Bock** — plateforme FR équivalente — compte
> **36 378 inscrits** (janvier 2026) et 12 783 recettes :
> preuve que la demande FR existe et est mesurable.
> **Untappd France** : 108 910 utilisateurs en 2023 — la
> communauté bière FR est active sur le digital.
> **Marché craft français** estimé à **2 à 8 milliards de
> dollars** (sources sectorielles croisées), croissance
> **8 à 12 % par an** — France première d'Europe avec
> 2 500 brasseries actives (source : Brasseurs de France 2024).
> La cible existe, documentée, mesurée. Le gap : aucune app
> mobile FR native avec scanner — c'est `chiffres-marche-sources-rigoureuses.md`
> dans le repo, cinq sources croisées."

### Q9. "Les 1 000 pré-inscriptions, c'est réaliste ?"

**Réponse (~35 s)** :

> "Ambitieux mais défendable. Little Bock a 35 000 brasseurs
> actifs — capter **3 %** sur 6 mois avec une landing page
> ciblée, c'est cohérent. Les canaux d'acquisition sont
> identifiés : magasins spécialisés, YouTubers brassicoles FR,
> communautés Reddit et Facebook, salons CRAB et Saint-Malo.
> La **landing page est déjà en ligne** sur
> **brasse-bouillon.com** avec formulaire newsletter et
> questionnaire communauté actifs — la phase d'acquisition
> commence dès l'ouverture post-soutenance."

## 3. Technique & architecture

### Q10. "Pourquoi un monorepo avec 4 packages plutôt que 4 repos séparés ?"

**Réponse (~40 s)** :

> "Trois raisons pratiques.
> **Types partagés** : le mobile consomme l'API, ils partagent
> des interfaces TypeScript. Monorepo = une seule source de
> vérité sur les contrats.
> **CI filtrée par package** : on ne rebuild pas tout à chaque
> PR, le workflow GitHub Actions ne déclenche que les jobs du
> package touché.
> **Tooling unifié** : un seul Prettier, un seul ESLint, un
> seul `npm run test:all`. Onboarding d'un contributeur en
> moins d'une journée — SMART prospectif numéro 12."

### Q11. "La sécurité, c'est géré comment ?"

**Réponse (~40 s)** :

> "Trois couches.
> **CI baseline** : Gitleaks pour la détection de secrets, CodeQL
> pour l'analyse statique SAST, Dependency Review pour les CVE
> sur les dépendances. Bloquant sur tout PR.
> **Runtime API** : authentification JWT avec expiration 24h,
> secret signé par variable d'environnement — pas de secret en
> dur. Hash bcrypt sur les mots de passe.
> **Perspectives** : pen test OWASP Top 10 avant passage en
> production publique, audit RGPD externe. Le détail est dans
> `docs/architecture/security/`."

### Q12. "Le beer-label-ai, c'est opérationnel ou c'est un rêve ?"

**Réponse (~35 s)** :

> "Opérationnel **en laboratoire**, pas encore déployable.
> Pipeline **YOLOv8** pour la détection d'étiquette plus
> **EasyOCR** pour l'extraction texte, 8 tests Python qui
> couvrent la chaîne de bout en bout. **La précision sur
> étiquettes réelles en conditions variables n'est pas encore
> prouvée** — c'est pour ça que je le garde en R&D, pas en
> démo. Cible déploiement : courant 2027, une fois la base
> beer-encyclopedia enrichie par Open Brewery DB."

## 4. Marché & concurrence

### Q13. "Si Brewfather se met à traduire en français, vous êtes morts ?"

**Réponse (~35 s)** :

> "Non. La traduction ne suffit pas — c'est ce que Little Bock
> prouve à l'envers : une app FR qui vieillit faute
> d'**ancrage communautaire**. Ce qu'on construit c'est un
> **écosystème FR** : contenus Academy culturellement pertinents,
> ingrédients locaux référencés dans la beer-encyclopedia,
> **partenariats à nouer** avec magasins spécialisés (LHBS) et
> clubs de brasseurs amateurs FR. Brewfather traduit resterait
> un outil isolé. Nous, on joue la communauté."

### Q14. "Untappd a 109 000 utilisateurs FR, pourquoi vous ne partez pas plutôt sur la notation de bières ?"

**Réponse (~35 s)** :

> "Untappd adresse la **consommation** de bière. Brasse-Bouillon
> adresse la **création**. Ce sont deux marchés différents qui
> ne se chevauchent que partiellement.
> Un brasseur amateur qui note ses consommations sur Untappd n'a
> aucun outil pour **brasser ses propres bières**. C'est notre
> cible : le moment où un amateur passe de consommateur à
> créateur. L'intégration scanner Untappd est possible à moyen
> terme — on référence une bière notée sur Untappd, on propose
> la recette équivalente dans BB."

### Q15. "Joliebulle — c'est vraiment fermé ? Comment vous en êtes sûr ?"

**Réponse (~30 s)** :

> "Joliebulle était le seul logiciel desktop **gratuit en
> français** pour le brassage amateur. Le site joliebulle.org
> est inaccessible depuis début 2025. La fermeture a été
> confirmée par la communauté BrassageAmateur.com — les threads
> de discussion sont encore visibles sur le forum FR de
> référence, signalement 2025. C'est documenté dans notre
> étude concurrentielle, `recherche-concurrentielle-exhaustive.md`.
> Cette fermeture est pour nous un **signal fort** : on arrive
> au moment exact où l'écosystème FR perd son dernier outil
> gratuit — le vide que BB comble."

### Q16. "Pourquoi pas d'étude qualitative terrain dans votre présentation ?"

**Réponse (~40 s)** :

> "Vraie faiblesse assumée. Les rendus étude de marché terrain
> ont été incomplets dans le cadre Ydays, et je n'ai pas eu
> la bande passante produit pour les compenser moi-même. Je
> préfère vous le dire directement plutôt que de présenter une
> étude bâclée.
> Le pitch s'appuie sur une **recherche documentaire solide** —
> Brülosophy 2024 sur 2 200 brasseurs, données Little Bock
> live, analyse concurrentielle 9 outils. Le qualitatif
> terrain — **15 interviews semi-dirigées, 5 par persona** —
> est le SMART prospectif numéro 19, lancé dès post-soutenance."

## 5. Équipe & parcours Ydays

### Q17. "Vous avez travaillé seul ou en équipe ?"

**Réponse (~35 s)** :

> "Équipe de 8 personnes organisée en 3 pôles : Développement,
> Création, Marketing. Côté **Dev**, livraison en volume :
> monorepo 4 packages, **647 tests automatisés** (407 mobile +
> 240 API), 6 sprints Scrum documentés, CI industrialisée,
> authentification, 8 features stables.
> Côté **Création** : charte graphique, wireframes, design
> system. Côté **Marketing** : étude documentaire, personas.
> Certaines itérations prévues n'ont pas pu aboutir dans le
> calendrier Ydays — je prends le relais post-soutenance en
> pilotant seul le périmètre produit, sur des rails techniques
> déjà en place, sans dépendre d'un recrutement externe."

### Q18. "Qu'est-ce que vous avez appris des Ydays en tant que chef de projet ?"

**Réponse (~40 s)** :

> "Trois leçons concrètes.
> **Cadrer la livraison réelle vs la livraison annoncée** :
> les sprints Scrum aident mais ne suffisent pas si un pôle
> n'est pas engagé, il faut des contrats de livraison
> explicites.
> **Se doter d'outils de persistance** : j'ai mis en place un
> logbook `PROJECT_LOG.md` et un dossier `docs/ydays/` pour
> que rien ne vive uniquement en mémoire de conversation.
> Toutes les décisions sont sourcées et tracées.
> **Assumer les manques** plutôt que les cacher : c'est ce
> que fait ce pitch — nommer les trous factuels et donner
> le plan pour les combler post-soutenance."

## 6. Statut juridique & perspectives

### Q19. "Pourquoi micro-entreprise et pas SASU directement ?"

**Réponse (~35 s)** :

> "La matrice est documentée dans
> `docs/ydays/outputs/statut-juridique-analyse.md` — cinq
> régimes comparés sur sept critères. Micro-entreprise gagne
> sur **l'an 1** avec un score pondéré de 3,73/5 contre
> 3,28 pour la SASU. Trois raisons pratiques :
> **zéro charge fixe** — pas d'expert-comptable, pas de dépôt
> annuel, pas de 300 €/an de frais CAC ;
> **franchise TVA** jusqu'à 37 500 € — les premiers clients
> bêta ne récupèrent pas la TVA, donc facturer sans TVA est
> un avantage compétitif direct ;
> **réversibilité** — bascule vers SASU si CA dépasse 40 k€
> ou si je lève des fonds. On y va quand les signaux l'exigent,
> pas par anticipation."

### Q20. "Le quiz Wooclap à la fin, c'est quoi ?"

**Réponse (~25 s)** :

> "On clôt la présentation avec un **quiz Wooclap de 3
> questions** sur le brassage — accessible via QR code depuis
> votre téléphone. C'est volontaire, 60 secondes, pas de
> compte requis. Deux objectifs : rendre la fin de séance
> mémorable, et valider en live que le positionnement
> 'brassage accessible' passe auprès d'un public non-brasseur.
> On récupère les résultats anonymes — premier data point de
> validation communautaire."

## Questions que le jury **ne posera probablement pas** mais à préparer en back-pocket

### Q21. "Combien d'heures par semaine sur le projet Ydays ?"

**Réponse (~25 s)** :

> "Variable — 10 à 25 h/semaine selon les sprints, plus les
> séances en présentiel. Le PROJECT_LOG.md retrace les
> livraisons semaine par semaine. Le chiffre exact dépend de
> ce qu'on compte — code, doc, réunions, communication."

### Q22. "Est-ce que vous ouvrez Brasse-Bouillon en open source ?"

**Réponse (~30 s)** :

> "Question intéressante. Actuellement privé pour protéger le
> brand pré-lancement, mais le SMART prospectif numéro 12
> vise un `CONTRIBUTING.md` et un `AGENTS.md` pour accueillir
> des contributeurs. Une fois la V1 publique, une bascule
> open-source partielle — le core engine de calcul brassicole,
> le beer-encyclopedia — est dans le plan. Pas les modules
> premium."

### Q23. "Quel est votre plan de sortie si le projet ne marche pas ?"

**Réponse (~30 s)** :

> "La **micro-entreprise en place dès l'an 1** permet de pivoter
> sans friction : si Brasse-Bouillon ne décolle pas, les
> compétences accumulées — mobile React Native, API NestJS,
> monorepo CI, IA appliquée — sont directement transposables
> à des missions freelance ou à un autre projet produit.
> Je n'ai pas construit une tour d'ivoire brassicole, j'ai
> construit une **stack full-stack généraliste** appliquée à
> un vertical food. La reconversion reste valide quelle que
> soit la trajectoire de BB."

### Q24. "Quel feedback avez-vous eu de vrais brasseurs sur l'app ?"

**Réponse (~35 s)** :

> "Honnêtement, **peu de feedback qualitatif terrain** à date —
> c'est une limite que j'assume. Ce que nous avons : le
> **questionnaire communauté** live sur brasse-bouillon.com, qui
> commence à recueillir des réponses ; des **échanges informels**
> avec des brasseurs amateurs de mon entourage pendant la
> conception des 3 personas ; et la base documentaire Brülosophy
> sur 2 200 brasseurs. Le chantier interviews semi-dirigées —
> **15 brasseurs, 5 par persona** — démarre dès la diffusion du
> questionnaire élargie post-oral blanc."

### Q25. "Comment protégez-vous les données utilisateur côté RGPD spécifiquement ?"

**Réponse (~35 s)** :

> "Trois mesures concrètes, et une perspective.
> **Minimisation** : on ne collecte qu'email et pseudo à
> l'inscription — rien de plus pour l'instant.
> **Stockage** : SQLite sur volume Fly.io, région `cdg`
> (Paris / UE), mots de passe hachés avec bcrypt.
> **Consentement** : le module scan demande un accord explicite
> avec durée de rétention paramétrable côté mobile.
> **Perspective** : audit RGPD externe + pen test OWASP avant
> ouverture publique. Registre des traitements, procédure
> d'accès et suppression restent à formaliser avant ouverture
> grand public."

### Q26. "Pourquoi croire que vous livrerez en 1 an ce que vous n'avez pas livré en Ydays ?"

**Réponse (~40 s)** :

> "Question légitime. Trois différences structurelles.
> **Scope** : en Ydays, je coordonnais 3 pôles dont je ne
> contrôlais pas le rythme. Post-soutenance, je pilote seul le
> périmètre produit, avec un studio qui finance le temps.
> **Outillage** : tout le chantier structurel est fait —
> monorepo, CI, tests, auth, architecture. Ce qui reste à
> livrer, c'est du produit incrémental sur des rails solides.
> **Cadence** : les 6 sprints Scrum documentés dans
> `docs/project-management/` montrent une vélocité réelle
> mesurée, pas projetée. Je ne promets pas tout — je promets
> les 3 features manquantes (SMART #7) et les interviews
> utilisateurs d'ici fin septembre."

### Q27. "Votre 'méthode IA-driven', c'est pas juste 'j'utilise ChatGPT' ?"

**Réponse (~40 s)** :

> "Non, c'est plus structuré que ça. Trois couches.
> **Outils** : Claude Code comme orchestrateur principal, MCP
> Chrome DevTools pour l'inspection live, Git worktrees pour
> paralléliser les chantiers, pre-commit hooks pour la
> qualité.
> **Méthode** : mémoire persistante du projet dans
> `PROJECT_LOG.md`, conventions documentées dans `CLAUDE.md`
> par package, revues PR automatisées avant merge humain.
> **Garde-fous** : jamais de merge sans CI verte et review
> Copilot adressée, jamais de `--no-verify`. L'IA accélère,
> elle ne dispense pas de la rigueur — elle l'outille."

## Méthode de préparation aux répétitions

**Pré-exercice J-7 / J-3** : demander à un proche (Fabien, Thomas,
ami extérieur) de tirer **5 questions au hasard** dans cette liste
et de les poser **en conditions réelles** (pas d'avertissement,
pas de relecture). Chronométrer.

**Grille d'évaluation auto-diagnostique** après chaque Q&A blanche :

| Critère | OK si |
|---|---|
| Durée réponse | Entre 25 et 45 s |
| Structure | Affirmation → chiffre/source → conclusion |
| Posture | Regard jury, pas ordi/slides |
| Honnêteté | 1 "je ne sais pas" toléré sur 10 Q |
| Précision | 0 chiffre inventé |

## Points de vigilance pour la répétition

- Verrouiller le **happy path scanner** sur une référence
  préparée pour la soutenance ; si le live n'est pas stable à
  J-3, garder un fallback vidéo.
- Si le jury demande les **3 dossiers de financement**, les
  présenter comme des dépôts planifiés post-soutenance, pas
  comme des dossiers déjà instruits.
- Si le jury creuse le **prospect studio**, rester anonyme sur
  le nom mais être précis sur le secteur, le besoin et
  l'enveloppe.
- Réviser les chiffres cités (SMART numbers, montants k€)
  après les répétitions si certains se révèlent imprécis.

## Prochaines étapes logiques

1. **Détail slides Canva** : contenu exact de S1-S14 avec
   titres/bullets/visuels → `canva-slides-detail.md`.
2. **Première répétition chronométrée intégrale** : 30 min
   pitch + 10 min Q&A simulé avec un tiers → ajuster les réponses
   qui dépassent 45 s.
3. **Réserver l'oral blanc 2026-05-06** avec la coach.
