# Recherche documentaire — r/Homebrewing

**Méthode / incertitude :** Reddit bloque la récupération automatisée (à la fois `www.reddit.com` et
`old.reddit.com`), et les requêtes `site:reddit.com` ont été déviées. Les constats sont triangulés à partir
(a) des forums HomeBrewTalk et Brewer's Friend, très similaires, (b) de compilations de recettes de clones
à fort trafic dont l'existence même est un signal de demande, et (c) du modèle officiel de partage de
Brewfather. Les signaux de fréquence sont **déduits**, et non issus de comptages de fils. Le classement est
indicatif.

## Thèmes récurrents classés

### 1. Demande de cloner une bière commerciale/artisanale précise — TRÈS ÉLEVÉE
Reproduire une bière nommée est l'un des objectifs les plus courants. Signal structurel : de vastes
compilations éditoriales existent uniquement pour le satisfaire (AHA « Top 50 Commercial Clone Recipes »,
Beer Maverick « 100+ Commercial Beer Clone Recipes », tours d'horizon par style). Les cibles les plus
clonées se concentrent autour des bières hype/difficiles à trouver : Pliny the Elder, Tree House Julius,
WeldWerks Juicy Bits, Founders, Deschutes. Motivées par l'aspiration (recréer une bière qu'on aime / qu'on
ne peut pas se procurer facilement).

### 2. « Les recettes de clone ne sont qu'un point de départ » — frustration sur la précision/reproductibilité — ÉLEVÉE
Les clones publiés n'ont souvent pas le goût de l'original ou sont obsolètes. La recette canonique de Pliny
de 2009 a été qualifiée d'« horriblement amère » et « ne ressemblait en rien à la Pliny ». Les brasseurs
traitent les recettes publiées comme une base de référence et les adaptent à leur propre système. C'est un
besoin de clones *itératifs, versionnés, validés par la communauté* — et non d'un seul PDF figé.

### 3. Organisation des recettes / suivi du journal de brassage — chronique, donne le sentiment de n'être jamais résolu — ÉLEVÉ
Genre de fil persistant à propos de conserver recettes, journaux de brassage, notes de dégustation et
historique des brassins dans un même endroit consultable. Les gens jonglent entre Excel, Word, carnets et
BeerSmith ; la frustration, c'est de vouloir « tout dans une seule vue » et des notes qui restent « utiles
quand on les relit plus tard ».

### 4. Abandon d'apps et lacunes de fonctionnalités (Brewfather vs Brewer's Friend vs BeerSmith) — ÉLEVÉ
Comparer/changer d'app est un sujet perpétuel. Moteurs : BeerSmith puissant mais daté/lourd ; Brewfather
interface moderne + multi-appareils (le chouchou du moment) ; Brewer's Friend basé sur le web mais plus
faible sur mobile et calculateurs d'eau déroutants. La friction de migration et l'UX de la chimie de l'eau
sont les points concrets les plus bruyants.

### 5. L'outillage de PARTAGE de recettes est faible — attribution, multi-groupe, export en lot — MOYEN-ÉLEVÉ
D'après les demandes de fonctionnalités sur Brewer's Friend : le partage **supprime la paternité** (« préoccupations
de propriété intellectuelle ») ; on ne peut partager qu'avec **un seul groupe** à la fois (les utilisateurs
veulent un partage multi-club avec le crédit préservé) ; pas d'**export en lot** des recettes sélectionnées.
Le partage est désiré mais donne l'impression d'être une réflexion après coup.

### 6. La couche de découverte et sociale autour des recettes est mince — MOYEN
La bibliothèque publique de Brewfather propose navigation/recherche, statistiques clés et votes
positifs/négatifs/vues/téléchargements — mais **pas de commentaires, pas de suivi, profils limités**, et
**la publication nécessite un abonnement payant**. La découverte existe ; la conversation autour d'une recette,
non. Espace clairement vacant.

### 7. Mise à l'échelle / conversion de l'efficacité lors de l'adoption de la recette d'un autre — MOYEN
Une recette construite sur l'équipement/l'efficacité d'un autre brasseur ne se transpose pas proprement —
la taxe cachée de toute fonctionnalité de partage. Le partage ne fonctionne que si la plateforme remet à
l'échelle pour le système du destinataire. (Confiance plus faible — déduit des discussions sur les
calculateurs.)

## Évaluations ciblées

- **Désir de cloner des bières précises :** fort et central, pas de niche. Valide l'angle pilier.
- **Volonté de partager ses propres recettes plutôt que de seulement consommer :** globalement positive mais
  avec un biais vers la consommation. Une vraie culture du partage existe, mais plus de gens *cherchent* des
  clones qu'ils n'en *publient* de soignés, et ceux qui partagent tiennent à l'**attribution/au crédit**. Un
  flux de partage à faible effort et créditant pourrait convertir les observateurs passifs.
- **Se plaignent-ils que le partage actuel est mauvais ?** Oui, concrètement : paternité supprimée, un seul
  groupe à la fois, pas d'export en lot (Brewer's Friend) ; publication derrière paywall, pas de
  commentaires/suivis (Brewfather).

## Signal sur l'hypothèse du pilier communauté/clone

**Soutenue, avec des réserves.** Cloner une bière précise est une motivation de premier ordre, à forte
charge émotionnelle, et l'insatisfaction n'est pas « aucun outil n'existe » mais « les outils clonent mal,
partagent maladroitement et ne communiquent pas entre eux ». Le coin différenciateur le plus fort est
l'**intersection** : une recette de clone validée par la communauté, versionnée, créditée et remise à
l'échelle automatiquement — c'est-à-dire résoudre ensemble les thèmes 2, 5, 6 et 7. Personne ne possède
« l'endroit où la communauté affine collectivement le clone de Pliny/Julius et où tu le forkes pour ton
système ». Les fonctionnalités fondations (organisation + suivi) sont demandées (thèmes 3 et 4) et doivent
être solides, mais ce n'est pas là que l'on gagne.

**Réserve / étape suivante :** la fréquence relative de « clone » vs « organisation » vs « partage » est
déduite, pas mesurée sur le subreddit. À consolider en échantillonnant des fils de r/Homebrewing via l'API
Reddit et en les étiquetant par thème. Noter que r/TheBrewery penche pro/commercial — un proxy plus faible
pour le persona du brasseur amateur intermédiaire.

## Sources
- https://homebrewersassociation.org/top-50-commercial-clone-beer-recipes/
- https://beermaverick.com/over-100-commercial-beer-clone-recipes-from-the-breweries-themselves/
- https://beermaverick.com/top-recipes-to-homebrew-the-most-iconic-hazy-ipas-ever/
- https://www.brewersfriend.com/forum/threads/has-anyone-in-this-forum-attempted-a-pliny-clone.11917/
- https://www.brewersfriend.com/forum/threads/suggested-fixes-and-features.12138/
- https://homebrewtalk.com/threads/brew-logs-and-recipe-tracking.498700/
- https://homebrewtalk.com/threads/brewfather-or-brewers-friend.694796/
- https://homebrewtalk.com/threads/brewfather-vs-brewers-friend.673669/
- https://docs.brewfather.app/library
- https://homebrewacademy.com/brewing-software-comparison/
