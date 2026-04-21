# Q&A anticipées — soutenance 27 mai

**Contexte** : après les 30 min de pitch, **10 minutes de questions /
réponses** avec le jury (format Ynov 2026-04-19). Ce document
anticipe **20 questions** probables avec **réponses prêtes de
30-45 s** chacune, regroupées par thème.

**Règle opérationnelle Q&A** (rappel) :

- Écouter la question **en entier** avant de répondre.
- **Reformuler** la question en 1 phrase pour gagner du temps de
  réflexion et vérifier la compréhension.
- Répondre en **30-45 secondes max**.
- Dire **"je ne sais pas"** quand c'est le cas (mieux que le bluff).
- Renvoyer vers le **repo public** ou `docs/ydays/` pour les détails.

## Thèmes couverts

1. Produit & MVP (5 questions)
2. Business model & monétisation (4 questions)
3. Technique & architecture (3 questions)
4. Marché & concurrence (3 questions)
5. Équipe & parcours Ydays (2 questions)
6. Studio web & suite post-soutenance (3 questions)

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

> "**97 tests automatisés**, répartis sur 3 stacks :
> **51 tests mobile** avec Jest et React Testing Library,
> **38 tests API** avec Jest côté NestJS,
> **8 tests Python** avec pytest sur le beer-encyclopedia.
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

### Q5. "Vos 3 personas sont documentés mais pas validés par des utilisateurs réels, non ?"

**Réponse (~40 s)** :

> "Bonne question. Les 3 personas sont dérivés de la recherche
> documentaire — étude **Brülosophy 2024** sur 2 200 répondants,
> étude **AHA 2024**, analyse marché européen 2024-2025. Donc
> **appuyés** par des données publiques, mais pas validés en
> interviews directes. C'est le SMART prospectif numéro 19 :
> **15 interviews semi-dirigées**, 5 par persona, d'ici fin
> septembre 2026. On l'assume comme un trou factuel du pitch à
> combler en priorité post-soutenance."

## 2. Business model & monétisation

### Q6. "Quelle grille tarifaire freemium précise ?"

**Réponse (~35 s)** :

> "La grille n'est pas figée — je l'assume. L'**application est
> gratuite** avec les fonctions essentielles : recettes,
> calculateurs, scanner, Academy. Le **tier payant** couvre :
> export CSV, intégration IoT, historiques avancés, templates
> premium. La grille précise — prix mensuel, prix annuel, seuils
> — se cale dans un **atelier entrepreneurial post-soutenance**,
> en lien avec les retours bêta sur les 3 personas. Mettre un
> prix ferme aujourd'hui sans avoir testé l'acceptation serait
> du bluff."

### Q7. "Comment le studio peut-il financer Brasse-Bouillon s'il ne vise que 10 k€ an 1 ?"

**Réponse (~40 s)** :

> "L'an 1 est un **amorçage**, pas une rentabilité pleine.
> 10 k€ suffisent à couvrir **mes outils IA** — Claude, Cursor,
> Vercel, hébergement — et à me dégager du temps pour bosser
> sur Brasse-Bouillon. Si l'an 1 valide l'ICP — 3 clients
> livrés, retours positifs — l'an 2 vise 30 à 60 k€, et là le
> financement sérieux de BB démarre. **C'est une courbe, pas un
> cliquet.** En parallèle, je prévois de déposer **3 dossiers
> de financement** — BPI, concours French Tech, incubateur
> régional — dans les 6 semaines post-soutenance,
> indépendamment du studio."

### Q8. "Qu'est-ce qui prouve qu'il y a un marché francophone pour ça ?"

**Réponse (~40 s)** :

> "Trois sources convergentes.
> **Little Bock** — plateforme FR équivalente — compte
> **35 524 brasseurs actifs** et 12 783 recettes.
> **Untappd France** a **108 910 utilisateurs** en 2023.
> **Marché européen équipement brassage** à **1,5 Md€ en 2024**,
> croissance **8,5 %/an** jusqu'en 2033 sur la France.
> La cible existe, elle est documentée, elle est mesurée.
> Le trou c'est que Little Bock vieillit, Brewfather est EN,
> et personne ne propose une app mobile FR native avec
> communauté intégrée. C'est le gap."

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

### Q15. "Pourquoi pas d'étude qualitative terrain dans votre présentation ?"

**Réponse (~45 s)** :

> "Vraie faiblesse assumée. Les rendus étude de marché terrain
> ont été incomplets dans le cadre Ydays, et je n'ai pas eu
> la bande passante produit pour les compenser moi-même. Je
> préfère vous le dire directement plutôt que de présenter une
> étude bâclée. **C'est exactement pour ça que je lance le
> studio web** : dégager du temps et du budget pour refaire ce
> qui manque, sérieusement, dans les 3 à 6 mois qui viennent.
> Le pitch s'appuie sur une recherche documentaire solide —
> Brülosophy, AHA, données européennes. Le qualitatif terrain
> reste à construire post-soutenance."

## 5. Équipe & parcours Ydays

### Q16. "Vous avez travaillé seul ou en équipe ?"

**Réponse (~35 s)** :

> "Équipe de 8 personnes organisée en 3 pôles : Développement,
> Création, Marketing. Côté **Dev**, livraison en volume :
> monorepo 4 packages, 97 tests, 6 sprints Scrum documentés,
> CI industrialisée, authentification, 8 features stables.
> Côté **Création** : charte graphique, wireframes, design
> system. Côté **Marketing** : étude documentaire, personas.
> Certaines itérations prévues n'ont pas pu aboutir dans le
> calendrier Ydays — je prends le relais post-soutenance via
> le studio web pour combler ce qui manque, sans dépendre d'un
> recrutement externe."

### Q17. "Qu'est-ce que vous avez appris des Ydays en tant que chef de projet ?"

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
> que fait ce pitch, c'est ce que fait le studio web en
> plan B."

## 6. Studio web & suite post-soutenance

### Q18. "Le studio web, c'est sérieux ou c'est un B plan nonchalant ?"

**Réponse (~40 s)** :

> "Sérieux. Un **repo dédié** existe déjà — Next.js 16,
> TypeScript strict, Tailwind v4, CI en place, 22 commits sur
> 3 semaines. **Positionnement écrit** — artisan tech solo,
> méthode IA-driven, cible TPE food et boissons des
> Alpes-Maritimes, grille prix 1 500 à 8 000 €. **Premier
> prospect qualifié** (restaurateur local, site vitrine 2-3 k€),
> contact en cours. Premier devis dans les 6 semaines
> post-soutenance. Ce n'est pas une idée, c'est un projet
> engagé, documenté dans
> `docs/ydays/outputs/web-studio-brainstorming.md`."

### Q19. "Pourquoi micro-entreprise et pas SASU directement ?"

**Réponse (~40 s)** :

> "Trois raisons.
> **Zéro charge fixe** au démarrage : pas d'expert-comptable,
> pas de dépôt annuel, pas de 300 €/an de frais CAC.
> **Réversibilité** : si la traction dépasse 30-40 k€ en an 2,
> bascule vers EURL ou SASU sans friction.
> **Franchise TVA** jusqu'à 37 500 € de services : mes clients
> TPE ne récupèrent pas la TVA, ça me donne un avantage
> commercial direct vs un freelance en SASU qui facture HT
> plus TVA. Une matrice de comparaison sera formalisée avant
> l'oral blanc 06/05."

### Q20. "Dans 3 ans, le studio web vaut quoi ?"

**Réponse (~35 s)** :

> "Le studio reste **solo durablement** — c'est une option
> assumée. Positionnement **artisan tech** : je ne veux pas
> scaler en embauchant, je veux scaler en **outillant**.
> L'IA et l'industrialisation remplacent l'effet d'équipe.
> À 3 ans, objectif : 30 à 40 projets clients livrés, 2 à
> 3 retainers mensuels récurrents, **Brasse-Bouillon devenu
> le produit principal**, le studio = machine de trésorerie
> qui alimente le produit. Pas de plateforme, pas d'agence,
> pas de levée. Juste un studio qui marche."

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

> "Le studio web est précisément **ce plan de sortie**. S'il
> faut arrêter Brasse-Bouillon, le studio continue et devient
> l'activité principale. Les compétences accumulées — mobile,
> API, monorepo, CI, beer-encyclopedia en Python — sont
> transposables à n'importe quel projet client. Je n'ai pas
> construit une tour d'ivoire brassicole, j'ai construit une
> stack généraliste avec un vertical food appliqué."

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

### Q27. "Le prospect studio identifié — qui, quel secteur ?"

**Réponse (~25 s)** :

> "Restaurateur indépendant dans les Alpes-Maritimes, besoin
> site vitrine + réservation simple, enveloppe 2-3 k€. Contact
> déjà identifié, échange commercial prévu post-soutenance.
> Je n'entre pas dans le détail nominatif par respect du cadre
> commercial avant signature — mais le dossier est concret,
> pas un plan sur la comète."

### Q28. "Votre 'méthode IA-driven', c'est pas juste 'j'utilise ChatGPT' ?"

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
