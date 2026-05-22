# Desk research — Forums (HomeBrewTalk + brassageamateur.com)

**Note méthodologique :** HomeBrewTalk.com bloque les requêtes automatisées (HTTP 403), si bien que les
constats sur HBT reposent sur des extraits de résultats de recherche (titres + extraits indexés), et non
sur la lecture intégrale des fils. Les pages de brassageamateur.com ont été récupérées directement. Les
signaux de fréquence sont qualitatifs (récurrence de fils distincts), et non issus d'un comptage de
messages.

## Thèmes récurrents, classés

### 1. Demande de recettes clones de bières commerciales précises — TRÈS ÉLEVÉE
Le sujet le plus récurrent de tous. Flux continu de fils « clone de X » sur les deux forums, plus des
méta-fils demandant *où trouver* des clones.
- HBT entretient une longue culture du clone (« Why I Clone Commercial Brews » ; « Is there a Clone Recipe database? »).
- brassageamateur dispose d'un **sous-forum dédié aux clones : 133 fils / 170+ recettes partagées** (Orval,
  Westmalle, Duvel, Rochefort 10, Westvleteren 12, Hoegaarden, Kronenbourg 1664, Guinness, Punk IPA),
  avec des fils populaires totalisant 85 à 149 réponses, actifs jusqu'en 2025-2026.

**Évaluation :** La demande de clones est réelle, durable, auto-organisée. La question récurrente « existe-t-il
une base de données de clones ? » est une preuve directe d'un besoin non satisfait : un dépôt de clones
*recherchable et curé* — l'angle central. Réserve à gérer dans le discours : un clonage sur 5 gallons ne peut
pas reproduire parfaitement les conditions commerciales.

### 2. Insatisfaction vis-à-vis des outils/apps & comparaison avant achat — ÉLEVÉE
Flux constant de fils « quel logiciel / X vs Y » ; aucun utilisateur pleinement satisfait. Plaintes précises :
- **Perte de données / méfiance envers l'outil comme source de vérité** (« I have lost enough recipes... I stopped using brewing software as my source »).
- **Lassitude des abonnements** (« I don't see the value in the subscription model »).
- **Faible liaison inventaire↔recette** (Brewer's Friend « still lacks inventory management » ; impossible de filtrer les recettes par stock).
- **Mauvaise portabilité des données / migration pénible** (import BeerXML qui perd des données ; impossible de séparer recettes et brassins).
- Les apps sont « largement auto-apprises » (UX abrupte, non documentée).

**Évaluation :** Les ouvertures = fiabilité/zéro perte de données, tarification juste, prise en main douce, vraie
liaison recette↔inventaire. Les acteurs en place sont matures sur le calcul — se battre sur le calcul seul est
perdu d'avance.

### 3. Douleur d'organisation des recettes (« trop de recettes, aucun bon système ») — ÉLEVÉE
Fils persistants (« Organizing recipes? », « Personal Recipe Database/Records? », « Organization Tips »).
Les utilisateurs se rabattent sur des **classeurs, des onglets par catégorie BJCP, des tags Evernote, Google Docs,
des tableurs multi-onglets** — autrement dit ils *quittent les apps de brassage* pour organiser. Les dossiers
BeerSmith sont critiqués comme rigides.

**Évaluation :** Le tag/filtrage (par style, ingrédient, résultat de brassin) est un gain concret réclamé. Des
utilisateurs qui défectent vers des outils généralistes = les apps de brassage desservent mal l'organisation.

### 4. Suivi de brassin / fermentation (« j'ai construit le mien parce que rien n'était assez bon ») — ÉLEVÉE
Fort volume sur la journalisation du jour de brassage + de la fermentation. Signal DIY fort — plusieurs
utilisateurs ont construit leurs propres apps (ex. « I couldn't find a good fermentation log-app for cider/mead, so I built one »). Intérêt croissant pour les
densimètres connectés (Tilt, iSpindel) alimentant des courbes de fermentation.

**Évaluation :** Le suivi est une fonctionnalité socle validée ; les fils « j'ai construit le mien » = besoin non
satisfait. L'import Tilt/iSpindel est une demande récurrente — à signaler en v0.2+ (périmètre).

### 5. Partage de recettes & disposition à partager — MOYENNE-ÉLEVÉE, majoritairement POSITIVE
Les brasseurs amateurs sont culturellement ouverts (« flattered to share... an honor » ; « willing to share any recipe »).
Les mécanismes existants sont fragmentés/déclinants : recherche BeerSmith Cloud, le défunt Hopville, l'export
BeerXML ; demandes récurrentes pour « télécharger une base BeerXML complète ». brassageamateur *est* de fait une
bibliothèque communautaire de recettes.

**Évaluation :** La disposition est élevée ; le manque est une *bonne* surface de partage/découverte — la barre est
« mieux qu'un fil de forum + un fichier BeerXML », nécessitant un import/export BeerXML/BeerJSON sans friction pour
interopérer (pas d'enfermement). Réserve : les brasseries commerciales sont protectrices ; le couloir ouvert est
*de brasseur amateur à brasseur amateur*.

## Anglophone (HomeBrewTalk) vs francophone (brassageamateur)

| Dimension | HomeBrewTalk (EN) | brassageamateur (FR) |
|---|---|---|
| Échelle & cadence | Très grand, fort volume, nombreux fils parallèles | Plus petit mais soudé ; sous-forums structurés ; fils sur plusieurs années |
| Cibles de clones | Craft US/UK + macro (Manny's, Heineken, Spaten, Smithwick's) | Belge/trappiste + français (Orval, Westvleteren, Duvel, Kronenbourg 1664, Météor) |
| Outillage | Apps commerciales : BeerSmith, Brewfather, Brewer's Friend | Gratuit/open + maison : **Beerxcel (Excel), Joliebulle (open-source), Little Bock**, BYOB |
| Modèle de partage | Clouds d'apps + fichiers BeerXML ; texte de forum | Le forum *est* la bibliothèque partagée ; bases Beerxcel/recettes communautaires ; attachement aux outils gratuits |
| Sensibilité au prix | Sceptique sur l'abonnement mais paie | Plus réticent aux paywalls (le passage payant de Little Bock a généré des frictions) |
| Instabilité | Acteurs matures, stables | **Joliebulle fermé (2010-2025)** — incertain à cette passe, ensuite **confirmé** dans `03b`/`03d` |

**Implications bilingues**
- Localiser le contenu d'amorçage de clones par région (belge/trappiste pour FR ; craft US/UK pour EN) — les
  catalogues de clones ne sont pas interchangeables. (`03d` constate que la *lager macro* FR n'est PAS une cible
  de clone significative, malgré la présence de Kronenbourg 1664 dans la liste du sous-forum ci-dessus — traiter
  la cellule des cibles de clones FR comme une observation brute, non une priorité de contenu d'amorçage.)
- Audience FR plus sensible au prix et plus fidèle aux outils gratuits → la frontière freemium y compte davantage
  (cohérent avec le maintien de l'export BeerXML/BeerJSON en payant uniquement si le palier gratuit reste réellement utile).
- L'audience FR attend des mainteneurs réactifs et présents → l'animation de communauté fait partie du produit.
- L'import/export BeerXML est un prérequis des deux côtés (capter les migrants de BeerSmith/Brewfather EN, Joliebulle/Little Bock FR).

## Lecture nette pour le positionnement
Le différenciateur (communauté pour le clonage + le partage) recouvre directement les deux besoins non satisfaits
les plus fréquents : une base de *clones* curée et recherchable (#1) et une *meilleure surface de partage que les
fils de forum* (#5), par-dessus deux socles validés que les utilisateurs bricolent aujourd'hui — l'organisation (#3)
et le suivi (#4). Le fossé défensif n'est **pas** le calcul ; c'est curation + communauté + fiabilité + tarification
juste + import/export sans friction.

**Incertitudes clés :** constats HBT fondés sur des extraits (403) ; fréquence qualitative. (La fermeture de
Joliebulle, signalée comme incertaine à cette passe, a ensuite été **confirmée** dans `03b`/`03d`.)

## Sources
- https://www.homebrewtalk.com/threads/is-there-a-clone-recipe-database.679618/
- https://www.homebrewtalk.com/threads/why-i-clone-commercial-brews.678756/
- https://www.brassageamateur.com/forum/viewforum.php?f=95
- https://homebrewtalk.com/threads/comparing-homebrewing-software.679134/
- https://homebrewtalk.com/threads/brewfather-vs-brewers-friend.673669/
- https://homebrewtalk.com/threads/scaling-with-beersmith-vs-brewfather-troubles.692447/
- https://homebrewtalk.com/threads/organizing-recipes.232447/
- https://www.homebrewtalk.com/threads/personal-recipe-database-records.99384/
- https://homebrewtalk.com/threads/organization-tips-for-homebrewers.678855/
- https://homebrewtalk.com/threads/i-couldnt-find-a-good-fermentation-log-app-for-cider-mead-so-i-built-one.738999/
- https://homebrewtalk.com/threads/phone-app-for-detailed-brew-day-notes.484531/
- https://homebrewtalk.com/threads/brew-logs-and-recipe-tracking.498700/
- https://www.homebrewtalk.com/threads/recipes-kept-secret.199276/
- https://homebrewtalk.com/threads/where-can-i-download-a-full-beerxml-database.486803/
- https://www.brassageamateur.com/forum/viewtopic.php?t=42555
- https://www.brassageamateur.com/forum/viewtopic.php?t=29232
- https://joliebulle.org/
- https://univers-biere.net/logiciels.php
