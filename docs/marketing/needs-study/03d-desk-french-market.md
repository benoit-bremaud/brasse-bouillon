# Desk research — Marché français du homebrew (passe boule de neige)

Passe boule de neige visant la plus grande lacune de données : la taille de la base FRANÇAISE / UE de brasseurs amateurs.
**Vocabulaire maintenu strictement distinct :** *brasseur amateur* (hobbyiste — CIBLE) vs *microbrasserie /
brasseur artisanal* (professionnel — adjacent, pas la cible). Drapeaux de fiabilité comme dans `03c`.

## Population de brasseurs amateurs français — la réponse honnête

**[N/F] Il n'existe AUCUN comptage officiel ou fiable des brasseurs amateurs français**, confirmé par des initiés :
- L'admin de BrassageAmateur.com : *« Tu ne trouveras aucun chiffre officiel »* — aucun chiffre officiel n'existe.
- Expertise Bière Conseil (2023) : *« Paradoxe : une pratique répandue et en croissance, mais des chiffres
  inexistants »* — pas de registre, pas de suivi centralisé.

**Meilleurs proxys de taille de communauté (aucun total national dérivable) :**
- **BrassageAmateur.com** (forum FR de référence, depuis 2003) : **~22 467 membres enregistrés, ~498k messages,
  36 250 sujets** ; pic de 5 321 utilisateurs simultanés (févr. 2026). Inscriptions cumulées, francophone (pas FR uniquement). [MED]
- **549 associations liées à la bière** dans le RNA français (2020-04-01), une catégorie étant *brassage amateur* ;
  pas d'adhésion par catégorie ; exclut l'Alsace-Moselle (total réel plus élevé) ; plus dense dans le Nord/Pas-de-Calais. [MED]
- **FNABRA** (Fédération Nationale des Associations Brassicoles, 2002 ; membre EBCU 2022) : *« plusieurs
  milliers de membres »* (mélange brasseurs amateurs + clubs de dégustation — pas un comptage pur de brasseurs amateurs). [MED]
- **Paris Beer Club > 300 membres** ; organise un concours annuel de brassage amateur. [MED]
- Affluence aux concours (signal d'activité) : 27e concours amateur des Amis de la Bière (sept. 2025) a jugé
  **61 bières** (18 inscrits à la 1re édition de 1998) — la participation compétitive croît lentement, faible en valeur absolue. [MED]

## Signaux du marché français du homebrew

- **Légalisation récente (stratégiquement importante) :** le brassage amateur a été clarifié/légalisé
  **2021-01-01** via l'**Article 520 bis CGI** (loi de finances 2021). La bière brassée à domicile pour usage
  personnel/familial/entre invités est exonérée d'accise et libérée des obligations d'entrepositaire agréé, à condition
  de ne pas être vendue. Le loisir n'a pleinement quitté la zone grise juridique qu'il y a ~5 ans — ce qui explique en
  partie l'absence de données historiques et signale un marché légal jeune, en expansion. [HIGH]
- **Saveur Bière** (2007 ; leader FR en ligne ; AB InBev depuis 2016) : ~105 employés, CA « plusieurs dizaines de
  millions d'euros » ; demande en hausse rapportée ; kit de brassage parmi les meilleures ventes. **Rebaptisé PerfectDraft
  Europe en 2023**, pivotant vers la gamme de machines à pression (un mouvement partiel *à l'écart* de la vente de pur kit de homebrew). [MED]
- **Écosystème mature de fournisseurs basés en France** (était dépendant des imports) : Rolling Beers, Brouwland, Autobrasseur,
  Le Comptoir du Brasseur, Radis et Capucine, etc. ; segmentation kit-extrait vs tout-grain ; catégorie best-seller Amazon.fr
  « Kits de brassage maison ». Croissance qualitative, **aucun chiffre de vente solide [N/F]**. [MED/LOW]

## Recomposition des outils FR de brassage amateur (2025) — signal de marché

Les *logiciels de brassage* sont des concurrents (vocabulaire cohérent : ce sont des outils pour brasseurs amateurs, donc
sur cible). Leurs fiches détaillées vivent dans `01-desk-competitors` et `03b-desk-french` ; ce qui suit est le **signal de
marché** spécifiquement FR, rafraîchi en mai 2026 :

- **Joliebulle, le logiciel FR historique, a fermé début 2025.** Sa propre page d'accueil le formalise au passé :
  *« c'était joliebulle, un logiciel pour les brasseurs amateurs et artisans, de 2010 à 2025 »*. Outil desktop open-source
  (GPL) devenu en partie payant (distribution Gumroad) en fin de vie. Sa disparition **déplace une base d'utilisateurs FR**
  qui cherche un nouveau foyer ; la **migration des fichiers Joliebulle** vers d'autres outils est possible mais imparfaite
  (conversions d'unités erronées rapportées à l'import XML). [HIGH]
- **Little Bock (littlebock.fr) est le successeur FR naturel** — et le seul outil de recettes/brassage *web* franco-français
  encore actif à grande échelle. Réserve structurelle : c'est un produit **mono-mainteneur**, créé et développé par une
  seule personne (Michaël, alias « Micka », brasseur amateur + développeur + auteur du blog). 100 % navigateur (recettes
  accessibles depuis n'importe quel terminal), base d'ingrédients fournie, suivi de brassin poussé, **profils de brasseurs +
  partage communautaire de recettes**. Modèle **freemium** : gratuit plafonné à **5 recettes + 5 brassins** ; **Premium
  19,99 €/an (ou 1,99 €/mois)** → recettes/brassins illimités, gestion des coûts, alertes de stock, accès API, sans
  publicité. Sentiment communautaire (forum BrassageAmateur) **positif** : interface claire, calculs cohérents, créateur
  réactif. [MED]
- **Lecture stratégique.** En 2025 le marché FR des outils amateurs a perdu son acteur historique (Joliebulle) et repose
  désormais largement sur **un produit solo** (Little Bock) — un signal de **fragilité / durabilité** qui sert directement le
  créneau de Brasse-Bouillon (données durables, partage **versionné et crédité**, mainteneur présent et pluriel). Le plafond
  gratuit de Little Bock (5 recettes) laisse en outre un espace pour une offre gratuite plus généreuse. La fiabilité est donc
  ici un **message marketing**, pas seulement un SLA. [MED]

### Forum vs outil — qui sert quoi (chiffres sourcés)

Confusion fréquente : **BrassageAmateur.com et Little Bock ne jouent pas le même rôle**. Le premier est un *forum*
(communauté), le second un *logiciel* (app de brassage). Ils ne se comparent pas terme à terme — ils se recoupent seulement
sur la fonction « partage de recettes ».

| Acteur | Nature | Partage de recettes | Chiffres clés (sourcés) |
|---|---|---|---|
| **BrassageAmateur.com** | Forum communautaire FR de référence (depuis 2003) | Couche légère via son app **BrewRecipes** (import BeerXML, filtres, styles BJCP, notes/commentaires, analyse IA, timeline) | ~**22 467 membres**, ~498k messages, 36 250 sujets [MED] ; **BrewRecipes : 350+ recettes** partagées [MED] |
| **Little Bock** | Logiciel de brassage *web* (création + calculs + suivi de brassin + stocks) | Bibliothèque communautaire intégrée + profils de brasseurs | **Pas de total officiel publié [N/F]** ; annuaire de brasseurs fortement paginé + profils à dizaines/centaines de recettes (profil officiel : 50 recettes, **2 288 abonnés**) → communauté d'un ordre de grandeur de plusieurs milliers de brasseurs [LOW/MED] |

- **Lien entre les deux : aucun.** Pas d'affiliation ; le seul partenaire listé par Little Bock est Brewspot (ateliers de brassage). [HIGH]
- **Implication.** En FR, le « partage de recettes » est déjà partiellement servi par les **deux** — la couche sociale du forum (BrewRecipes) *et* l'app Little Bock. Mais aucun n'offre la **lignée versionnée + crédit auteur + remise à l'échelle automatique** : c'est précisément l'écart que vise Brasse-Bouillon. [MED]

## Contexte des microbrasseries artisanales françaises (PROFESSIONNEL — adjacent, bien documenté)

Utile pour la vitalité de la culture bière, les cibles de clones, les angles B2B/partenariat — **pas la cible** :
- **~2 500-2 589 brasseries en France (2024-2025) ; la France est n°1 en Europe par nombre de brasseries** ; 10 000+ références. [HIGH]
- Croissance puis maturation : ~200 (2006) → 1 600 (2018) → ~2 500 (2024) ; ~7x entre 2011-2022 ; +15 % sur 5 ans. [HIGH]
- **Maintenant en plateau :** 2025 ≈ 209 fermetures vs 213 ouvertures (~4 fermetures/semaine) — segment professionnel arrivé à maturité. [HIGH]
- Emploi du secteur ~130 500 ; consommation FR par habitant ~33 L/an (la plus basse de l'UE) ; le SNBI représente les indépendants. [HIGH/MED]

## Profil / démographie des brasseurs amateurs

- **France : [N/F]** — aucune étude démographique trouvée (seulement de l'anecdotique : davantage de nouveaux venus curieux qui se lancent).
- **Proxy US (à utiliser avec prudence) :** AHA/Brewers Association 2017 (18k+ répondants) : 1,1 M (désormais ~1,2 M) ; âge moyen
  **42**, 52 % âgés de 30 à 49 ans, majoritairement hommes, 68 % diplômés du supérieur, ~68 % de revenu de ménage ≥75k$ ; **40 % ont commencé
  au cours des 4 années précédentes** (fort afflux de nouveaux venus). [HIGH pour les US]

## Nouvelles pistes / fils boule de neige à suivre

- **BrassageAmateur.com** — plus grande communauté FR ; meilleur lieu unique pour une enquête utilisateur directe afin de combler la lacune de données + portée du concours (BRASSAM).
- **FNABRA** — pourrait être sollicitée directement pour une estimation agrégée de membres/clubs.
- **Projet Amertume** (déjà mis en favori en mémoire) — série temporelle des brasseries + liste d'associations.
- Pistes régionales/clubs : Les Amis de la Bière (FIBA), ABAHF, Paris Beer Club, BAF, Elsassbrau.
- Événements/salons : Salon du Brasseur, Saint-Malo Craft Beer Expo, CRAB, FIBA.
- Blogs/communautés de fournisseurs comme entonnoirs : Saveur Bière/PerfectDraft, Rolling Beers, Brouwland, Autobrasseur, Carnet d'un brasseur amateur.
- Études à poursuivre : deck démographique complet de l'AHA (référence US) ; rapport de la Fédération belge des brasseurs (seules données UE structurées, selon l'admin du forum) ; EBCU.

## Note stratégique

**Renforce la stratégie.** L'absence de tout comptage officiel des brasseurs amateurs est en soi un fossé défensif — aucun
acteur en place ne possède cette donnée ; Brasse-Bouillon pourrait *devenir* le jeu de données en instrumentant sa propre
communauté. La légalisation récente (2021) + un écosystème de fournisseurs FR désormais mature + un marché *professionnel* des
microbrasseries en saturation pointent tous vers une base de *hobbyistes* jeune, sous-servie, en croissance, dont l'attraction
naturelle est communauté + clone/partage. Réserve : les seules démographies solides (30-49 ans, hommes, diplômés, aisés,
débutants récents) sont américaines — à valider sur les utilisateurs FR en entretiens.

## Sources
- https://www.brassageamateur.com/forum/ftopic23796.html
- https://expertise-biere-conseil.com/2023/03/brassage-amateur-etat-des-lieux-dune-activite-en-expansion/
- https://www.brassageamateur.com/forum/
- https://www.happybeertime.com/blog/2020/10/06/recensement-des-associations-liees-a-la-biere-en-france/
- https://www.fnabra.org/associations-membres/
- https://www.parisbeerclub.fr/concours-de-brassage
- https://www.amis-biere.org/category/brassage-amateur/
- https://www.legifrance.gouv.fr/codes/id/LEGISCTA000006163065
- https://www.assemblee-nationale.fr/dyn/15/amendements/3360C/CION_FIN/CF1540
- https://www.lejournaldesentreprises.com/hauts-de-france/article/saveur-biere-fait-face-une-hausse-de-la-demande-et-recrute-495310
- https://brasseurs-de-france.com/tout-savoir-sur-la-biere/le-marche-de-la-biere/
- http://projet.amertume.free.fr/html/evolution_nombre_brasseries.htm
- https://fr.statista.com/statistiques/830080/nombre-micro-brasseries-france/
- https://homebrewersassociation.org/news/1-1-million-americans-homebrew-beer/
- https://www.insee.fr/fr/statistiques/6535287
- https://joliebulle.org/ (page d'accueil au passé : « de 2010 à 2025 » — fermeture confirmée)
- https://colibre.org/jolibulle-le-logiciel-de-brassage-amateur-open-source/ (historique GPL → fin de vie)
- https://www.littlebock.fr/fonctionnalites-et-tarifs (freemium : gratuit 5 recettes/5 brassins ; Premium 19,99 €/an)
- https://www.littlebock.fr/a-propos (projet mono-mainteneur — fondateur Michaël)
- https://www.brassageamateur.com/forum/viewtopic.php?t=35668 (sentiment communautaire Little Bock)
- https://superpotion.fr/etat-des-lieux-marche-brassicole/ (état des lieux marché brassicole 2026 — plateau/consolidation)
- https://www.brassageamateur.com/ (app BrewRecipes du forum — 350+ recettes, import BeerXML, styles BJCP, analyse IA, timeline)
- https://www.littlebock.fr/brasseurs/ (annuaire des brasseurs Little Bock — profils, recettes, abonnés)
- https://docs.littlebock.fr/ (documentation Little Bock)
- https://www.littlebock.fr/partenaires (partenaire unique listé : Brewspot — aucune affiliation à BrassageAmateur)
