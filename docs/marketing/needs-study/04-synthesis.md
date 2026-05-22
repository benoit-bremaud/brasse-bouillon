# Synthèse — Carte des besoins & Positionnement

Consolidation de six passes de desk research (`01` concurrents, `02` Reddit, `03` forums, `03b` sources
françaises, `03c` données marché / quantitatives, `03d` marché français). Il s'agit d'un ensemble
d'hypothèses construit à partir de la recherche secondaire ; il n'est **pas encore confirmé** par la
recherche primaire (entretiens). Lire `00-method.md` pour les limites. Les passes ultérieures ont
largement **confirmé** les conclusions antérieures (un signal de saturation) tout en ajoutant les
raffinements spécifiques au marché FR et au contexte marché ci-dessous.

## Message clé

L'hypothèse différenciante — **une communauté pour cloner et partager des recettes** — est **soutenue**
à travers les six passes de desk research, et **affinée** : le créneau défendable n'est pas le « social »
ou la « liste de clones » seuls, mais leur intersection.

## Le créneau affiné

> L'endroit où la communauté met au point de manière collaborative le clone d'une bière précise, avec une
> recette **versionnée, créditée à ses auteurs et automatiquement remise à l'échelle** de l'équipement de chaque brasseur.

Aucun acteur en place ne possède cela. Aujourd'hui, le marché se divise en :
- **Listes de clones statiques** (AHA, Beer Maverick, BrewDog DIY Dog) — pas de boucle d'itération, pas de remise à l'échelle.
- **Calculateurs avec une bibliothèque de recettes** (Brewfather, Brewer's Friend, BeerSmith) — publication
  derrière un paywall, le partage supprime la paternité, aucune conversation autour d'une recette.

## Carte des besoins (classés par signal, avec étiquette hero/socle)

| # | Besoin | Signal | Rôle |
|---|---|---|---|
| 1 | Dépôt **de clones** consultable et organisé pour des bières précises | Très élevé | **Hero** |
| 2 | Clones **versionnés / validés par la communauté** (et non un PDF statique, souvent erroné) | Élevé | **Hero** |
| 3 | **Partage à faible friction avec crédit de l'auteur** (multi-groupe, en lot, paternité conservée) | Moyen-élevé | **Hero** |
| 4 | **Remise à l'échelle** automatique d'une recette partagée vers l'équipement du destinataire | Moyen | Facilitateur hero |
| 5 | **Organisation & recherche** fiables (tags par style / ingrédient / résultat) | Élevé | Socle |
| 6 | **Suivi de jour de brassage / fermentation** solide (journaux, notes, historique) | Élevé | Socle |
| 7 | **Synchronisation + hors-ligne sans friction** sans payer ni dupliquer les données | Très élevé | Socle / table-stakes |
| 8 | **Tarification juste** (fatigue des abonnements/paywalls ; offres gratuites bridées) | Très élevé | Table-stakes |
| 9 | **Portabilité des données** — import/export BeerXML/BeerJSON, pas de verrouillage, pas de perte de données | Élevé | Table-stakes |
| 10 | **UX mobile** moderne et épurée | Fréquent | Table-stakes |

Les hero 1-4 sont là où Brasse-Bouillon peut gagner. Les 5-10 sont indispensables pour être crédible et
fidéliser, mais ne différencient pas (les acteurs en place font déjà la plupart, et gagnent sur le calcul).

## Ce que les preuves disent de chaque croyance à risque

- **Les brasseurs veulent-ils cloner des bières précises ?** Oui — fort, durable, porté par l'émotion. *Validé.*
- **Partageront-ils leurs propres recettes (et pas seulement consommer) ?** Culture globalement positive, mais
  avec un biais vers la consommation et une condition impérative : **la paternité / le crédit doit être préservé**. *Plausible, à confirmer en entretiens.*
- **Le besoin est-il déjà satisfait ailleurs ?** Non — les clones sont erronés/statiques, les outils de partage
  suppriment la paternité et mettent la publication derrière un paywall, et il n'y a pas de couche de conversation. *L'écart est réel.*
- **Changeraient-ils d'outil ?** Risqué — les acteurs en place sont retranchés sur le calcul et possèdent
  l'historique de l'utilisateur. Atténuation : ne pas se battre sur le calcul ; mener avec la boucle clone/communauté
  + l'import BeerXML pour abaisser le coût de changement. *Croyance la plus risquée — à tester explicitement.*

## Garde-fous stratégiques (issus des preuves)

- **Ne pas concurrencer sur le calcul.** Le rempart = curation + communauté + fiabilité + tarification juste + interopérabilité.
- **Présenter la communauté comme le tissu conjonctif autour du partage de clones**, et non comme un réseau
  social autonome (cf. arrêt de l'application communautaire AHA Brew Guru en février 2026).
- **Bilingue ≠ dupliqué.** Localiser le contenu d'amorçage des clones par région ; respecter la plus grande
  sensibilité au prix de l'audience FR et son attente d'un mainteneur présent.
- **Surveiller Build-A-Beer** (génération de clones par IA + partage) — le concurrent direct le plus proche du créneau.

## Contexte marché (issu de `03c` / `03d`)

- **Ancrage du TAM :** marché des *équipements de loisir* du brassage maison d'environ 2 Md$, ~7,5 % de TCAC
  (ignorer les rapports « machines » à 26-85 Md$ — périmètre différent). Brasseurs amateurs US ≈ 1,1-1,2 M ;
  r/Homebrewing ≈ 1,2 M de membres.
- **Les corpus de recettes des acteurs en place sont vastes** (Brewer's Friend 320 k+ recettes publiques) mais
  mènent avec un *dépôt + des calculateurs*, et non avec la lignée de clones / le social — confirmant
  quantitativement que le créneau est ouvert.
- **France : aucun décompte officiel des brasseurs amateurs n'existe** (confirmé par des initiés) — un manque de
  données qui est lui-même un rempart : Brasse-Bouillon pourrait *devenir* le jeu de données en instrumentant sa
  communauté. Approximations : brassageamateur ≈ 22,5 k membres ; 549 associations de bière ; FNABRA « plusieurs milliers » de membres.
- **Loisir français légalisé seulement en 2021** (Art. 520 bis CGI) → marché légal jeune et en expansion ;
  écosystème de fournisseurs FR mature ; le marché *professionnel* des microbrasseries (France n°1 en Europe, ~2 500)
  plafonne désormais.
- **Les seules données démographiques solides sont américaines** (âge 30-49 ans, masculin, diplômé, aisé, 40 % de
  débutants récents) — à valider en FR.

## Raffinements spécifiques à la France (issus de `03b`)

- **Une UI en priorité française est un véritable levier concurrentiel** — le tout-anglais de Brewfather est un
  facteur rédhibitoire déclaré pour une partie de l'audience FR. Le bilinguisme n'est pas qu'une localisation ;
  c'est un créneau en FR.
- **En FR, le partage est déjà partiellement servi** (l'application BrewRecipes de brassageamateur elle-même + la
  bibliothèque publique de Little Bock). La différenciation FR ne peut donc pas être « le partage existe » — elle
  doit être **versioning + crédit de l'auteur + remise à l'échelle automatique**.
- **Joliebulle a fermé (2010-2025, confirmé)** → une base d'utilisateurs FR déplacée cherche activement un nouveau
  foyer. Opportunité d'acquisition concrète ; l'import BeerXML abaisse leur coût de changement.
- **La durabilité des données + la portabilité BeerXML sont critiques pour la confiance en FR** après les récentes
  défaillances d'outils (mort de Joliebulle, panne de Little Bock). La fiabilité est un message marketing, pas seulement un SLA.
- **Les cibles de clones FR** penchent vers le belge / trappiste (Orval, La Chouffe, Westmalle) + le craft (Punk IPA).
  La lager macro française n'a PAS émergé comme une cible significative (corrige une hypothèse antérieure).
- **La sensibilité à la paternité est forte en EN mais peu étayée en FR** — ne pas supposer qu'elle se transfère ;
  à tester explicitement en entretiens (voir ci-dessous).

## Positionnement en une phrase (brouillon, à valider)

> Pour les brasseurs amateurs réguliers qui veulent recréer de façon fiable les bières qu'ils aiment,
> Brasse-Bouillon est l'application de recettes communautaire où les clones sont affinés collaborativement,
> crédités et remis à l'échelle de votre propre installation — avec l'organisation des recettes et le suivi
> de brassage que vous attendez, et sans verrouillage.

## Étape suivante : recherche primaire

Confirmer ou infirmer avec 10-15 entretiens de brasseurs amateurs réguliers, recrutés sur r/Homebrewing (EN) et
brassageamateur (FR). Croyances prioritaires à tester : (a) **sensibilité à la paternité** — forte en EN,
peu étayée en FR, donc sonder les deux audiences ; (b) **changement d'outil** — quitteraient-ils un outil
retranché ; (c) si l'angle **versioning + remise à l'échelle automatique** est ressenti comme un besoin réel ou
un simple agrément. Le guide d'entretien se trouve dans `05-interview-guide.md` (construit avec le skill
`customer-research`). Les conclusions alimentent `06-report.md`.
