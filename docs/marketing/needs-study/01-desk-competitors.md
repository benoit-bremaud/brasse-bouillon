# Recherche documentaire — Analyse des avis sur les apps concurrentes

Familles de sources : synthèses d'avis App Store / Google Play, comparaisons Reddit/forums, blogs
comparatifs, documentation officielle. **Mise en garde :** HomeBrewTalk et certaines pages d'avis ont
renvoyé une erreur 403 ; le corps des fils Reddit n'a pas pu être récupéré, si bien que quelques
affirmations s'appuient sur des extraits de recherche et sont signalées comme telles. Les notes en
étoiles correspondent aux synthèses de fiches au moment de la recherche (mai 2026).

## Constats par concurrent

### Brewfather (basé sur le cloud ; le leader en matière de satisfaction)

**Points forts**
- Synchronisation cloud multi-appareils inégalée (concevoir sur un ordinateur portable, relever la densité sur le téléphone) — la raison de changement la plus souvent citée.
- Interface épurée, moderne, non écrasante ; prise en main rapide.
- Système de brassins robuste (chaque brassin = une variation d'une recette mère) + suivi de fermentation ; intégrations Tilt/Grainfather (le graphique Tilt intégré à l'app est un déclencheur d'achat nommément cité).
- Sans publicité, support développeur réactif, peu coûteux (~20 $/an).

**Reproches / lacunes**
- Abonnement obligatoire pour les fonctionnalités complètes ; pas d'achat unique — le ressentiment lié au coût récurrent est le reproche le plus fréquent.
- Fonctionnement hors ligne limité (la plupart des fonctionnalités nécessitent Internet).
- Peut sembler surchargé en fonctionnalités au premier abord.
- Une bibliothèque communautaire existe, mais **la publication de recettes est réservée à l'abonnement payant**, et les utilisateurs gratuits atteignent une limite de nombre de recettes même lorsqu'ils *copient* une recette de la communauté.

### BeerSmith Mobile (achat unique ; héritage desktop) — la moins bien notée (≈2,9★ App Store)

**Points forts**
- Le moteur de calcul le plus établi et le plus reconnu du loisir ; très précis une fois calibré.
- Minuteur de jour de brassage intégré avec rappels étape par étape.
- Achat unique, sans abonnement.

**Reproches / lacunes**
- Synchronisation pénible : desktop → cloud → téléphone, si bien que « la même recette existe en 3 exemplaires ». **Le point de douleur le plus fort et le plus concret de l'ensemble.**
- Interface à dossiers imbriqués lourde, lente et datée ; la recherche se casse à l'intérieur des dossiers imbriqués (le développeur a reconnu les plaintes sur le stockage des fichiers et les menus).
- Parcours maladroits (il faut revenir « en arrière » pour lancer le minuteur après une modification).
- Pas d'import `.bsmx` sur mobile ; profils à ressaisir sur chaque appareil ; le partage exige un téléchargement depuis le cloud. Courbe d'apprentissage élevée.

### Brewer's Friend (web d'abord + apps ; réputation des calculateurs)

**Points forts**
- Les calculateurs de brassage les mieux considérés (« sans équivalent ») et des outils de chimie de l'eau.
- Entièrement basé sur le web — les recettes sont à l'abri dans le cloud.
- Achat d'ingrédients direct ; vaste base de données publique de recettes.

**Reproches / lacunes**
- Niveau gratuit plafonné à 5 recettes **et avec publicités** ; la synchronisation et la suppression des publicités exigent l'offre Premium.
- Faible ergonomie mobile (minuteur difficile à trouver) ; certains « regrettent l'abonnement annuel » et sont partis ailleurs.
- Bugs Android signalés (densité qui ne se met pas à jour, erreurs métrique↔impérial, modifications non enregistrées) avec des corrections lentes.

### BrewBuddy (utilitaire iOS) — point de contraste, pas un concurrent direct
- Calculateurs hors ligne volontairement minimalistes ; pas de comptes, pas de données sauvegardées, pas de suivi.
- Confirme l'existence d'une niche qui se méfie des apps cloud/abonnement et veut simplement des outils hors ligne.

### Points adjacents / signaux
- **App Grainfather :** les calculs divergent de Brewfather pour une même recette (profils d'équipement) — friction lors du déplacement de recettes entre écosystèmes.
- **AHA Brew Guru** (app recette + bons plans + communauté) : **arrêtée le 1er février 2026**, réintégrée au site web de l'AHA ; « contenu limité », retours mitigés. Une app communauté/recettes dédiée qui n'a pas su perdurer — une mise en garde pour le pilier communautaire.
- **Build-A-Beer :** app gratuite dont la fonctionnalité phare est la **génération de recettes de clone par IA** à partir des caractéristiques d'une bière + « partagez vos créations ». Concurrent direct sur l'angle clone/partage — à surveiller.

## Principaux besoins non satisfaits (classés par force du signal)

1. **Synchronisation sans friction + véritable hors ligne sans payer ni dupliquer les données** — *très fréquent.* Le triple exemplaire de BeerSmith est la plainte unique la plus bruyante ; la dépendance en ligne de Brewfather y fait écho. Le brassage se fait dans des garages/caves à mauvaise connectivité.
2. **Friction liée à l'abonnement / au paywall** — *très fréquent.* Les niveaux gratuits semblent bridés (publication, synchronisation, import/export verrouillés).
3. **UX mobile moderne et épurée** — *fréquent.* Brewfather gagne précisément en étant épuré — l'UX est un différenciateur prouvé.
4. **Organisation et recherche de recettes fiables** — *modéré.* La recherche de BeerSmith se casse dans les dossiers imbriqués.
5. **Partage de recettes facile et sans friction** — *modéré.* Le partage est maladroit (téléchargement cloud / publication payante). La demande existe mais n'est que partiellement satisfaite.
6. **Fiabilité sans bugs et calculs précis** — *modéré.* La divergence des calculs entre apps mine la confiance lors du déplacement des recettes.
7. **Suivi des stocks / des coûts, intégrations matérielles (Tilt)** — *occasionnel mais facteur de fidélité.*

## Signal sur l'hypothèse du pilier PARTAGE / CLONAGE / COMMUNAUTÉ

- **Cloner des bières commerciales : demande forte et durable.** Les guides de clones des 50 États de l'AHA, *DIY Dog* de BrewDog, les 100+ de Beer Maverick, Build-A-Beer existent tous parce que la demande est réelle et récurrente. Valide l'angle clone.
- **Bibliothèques de recettes communautaires : validées mais partiellement satisfaites et difficiles à monétiser.** Brewfather/Brewer's Friend montrent que les utilisateurs veulent parcourir/copier les recettes des autres — mais la publication est derrière un paywall et la copie est plafonnée, ce qui laisse une ouverture pour un modèle plus ouvert, centré sur le partage. Prudence : l'arrêt de Brew Guru en février 2026 montre que le social intégré à l'app n'est pas prouvé comme moteur *principal* de rétention ; aujourd'hui, l'essentiel de la « communauté » vit sur Reddit/Discord/Facebook/les forums.
- **Implication :** la combinaison *clonage + partage ouvert* est le pilier le plus défendable. Présenter le « social » pur comme le tissu conjonctif autour du partage de clones, et non comme une fonctionnalité autonome. Les fonctionnalités fondations ciblent les 4 premiers besoins non satisfaits et constituent le minimum vital pour la rétention.

## Carte de positionnement

Une **carte de positionnement** place les concurrents sur deux axes qui comptent pour l'utilisateur, pour
rendre visible le **coin que personne n'occupe**. Les deux axes retenus, tirés du desk :

- **horizontal** : *Simple / guidé* ←→ *Puissant / orienté calcul-expert* ;
- **vertical** : *Solo / privé* ←→ *Communautaire (partage de recettes)*.

|  | **Simple / guidé** | **Puissant / calcul-expert** |
|---|---|---|
| **Communautaire (partage)** | ◎ **Brasse-Bouillon** (cible) · Build-A-Beer | Brewer's Friend |
| **Solo / privé** | Little Bock | Brewfather · BeerSmith |

**Placements (perception desk, niveau de confiance) :**

- **BeerSmith** — extrême *puissant + solo* : héritage desktop, calculs profonds, partage quasi nul, données dupliquées. [HIGH]
- **Brewfather** — *puissant + plutôt solo* : UX moderne, mais bibliothèque/publication derrière paywall → communauté bridée. [HIGH]
- **Brewer's Friend** — *puissant + un peu communautaire* : calculateurs réputés + parcours/copie de recettes, publication plafonnée. [MED]
- **Little Bock** (FR) — *plutôt simple + un peu communautaire* : outil FR accessible, base de recettes, gratuit. [MED]
- **Build-A-Beer** — *simple + communautaire* : génération de clone par IA + partage, gratuit. **Seul occupant de notre coin.** [HIGH]
- **Brasse-Bouillon** (cible) — *simple/guidé + communautaire* : assistant débutant d'abord, puis clone versionné, crédité, remis à l'échelle.

**Lecture stratégique :**

- Le coin *simple + communautaire* (haut-gauche) est **quasi vide** : seul **Build-A-Beer** y est → c'est notre champ de bataille, **pas** Brewfather/BeerSmith (qui dominent le bas-droit *puissant + solo*, terrain qu'on évite — cohérent avec « ne pas concourir sur le calcul »).
- Différenciation *dans* le coin, face à Build-A-Beer : une génération IA jetable n'est pas une recette clone **versionnée + créditée + remise à l'échelle** adossée à un **assistant guidé**. C'est la profondeur qui manque à Build-A-Beer.
- Garde-fou : la zone communautaire est mortelle si menée *seule* (arrêt de Brew Guru, fév. 2026) → entrer par l'**assistant** (bas-gauche → haut-gauche), la communauté en **couche de rétention**.

*Hypothèse à confirmer en terrain : ces placements reflètent la perception issue du desk, pas une mesure.*

## Sources
- https://homebrewacademy.com/brewing-software-comparison/
- https://play.google.com/store/apps/details?id=com.warpkode.brewfather&hl=en_US
- https://docs.brewfather.app/library
- https://docs.brewfather.app/faq
- https://hazyandhoppy.com/why-i-switched-to-the-brewfather-app/
- https://apps.apple.com/us/app/beersmith-mobile-home-brewing/id640670118
- https://apps.apple.com/us/app/brewers-friend/id1580297037
- https://apps.apple.com/us/app/brewbuddy-homebrew-tools/id6450740421
- https://homebrewersassociation.org/news/brew-guru-sunsetting-feb-1/
- https://homebrewersassociation.org/top-50-commercial-clone-beer-recipes/
- https://beermaverick.com/over-100-commercial-beer-clone-recipes-from-the-breweries-themselves/
- https://buildabeer.app/
