---
slug: rendement
title: Rendement
summary: Repère pratique sur le rendement, les points de densité, les pertes de process et le plan d'eau.
category: process
level: beginner
status: published
version: 1.0.0
estimated_read_time_minutes: 9
tags:
  - efficiency
  - gravity
  - volumes
  - water-plan
updated_at: 2026-07-07
related_articles:
  - fermentescibles
  - eau
related_glossary_terms:
  - malt
  - densite-initiale
  - mout
related_calculators:
  - slug: rendement
    label: Efficiency calculator
    reason: Estimate brewhouse efficiency, process losses, and water plan.
    target_slug: rendement
learning_objectives:
  - Expliquer le rendement global à partir de l'OG mesurée, du volume et des fermentescibles.
  - Identifier où les points de densité et le volume se perdent dans le process.
  - Utiliser l'historique mesuré plutôt que des hypothèses théoriques.
prerequisites:
  - malt-basics
  - water-profile
teaches:
  - brewhouse-efficiency
  - gravity-points
  - process-losses
  - water-planning
sensitive: false
risk_topics: []
source_ids:
  - palmer-2017
review:
  confidence_level: reviewed
  reviewed_by: Academy editorial review
  reviewed_at: 2026-07-07
  notes:
    - Migrated from the legacy mobile Academy efficiency topic.
    - "Aligned with the existing Rendement calculator tabs: efficiency, volumes, and water plan."
---

## Pourquoi le rendement est critique {#role-rendement}

Le rendement mesure ce que ton installation extrait reellement du potentiel des
fermentescibles. Il relie la masse de malt, le potentiel PPG, l'OG mesuree et
le volume final. Un rendement mal connu rend les recettes imprevisibles : OG
trop basse, ABV plus faible que prevu, ou besoin de malt surestime.

:::example id="example-efficiency-impact" title="Impact concret" body="Si ton rendement reel est 67% mais que ta recette suppose 75%, l'OG obtenue sera plus basse que prevu ou il faudra davantage de malt pour atteindre la meme cible." sourceIds="palmer-2017":::

## Repères rapides {#reperes}

Les points de densite viennent de l'OG : 1,060 correspond a 60 points. Le PPG
exprime le potentiel theorique d'un fermentescible. Les points reels combinent
la densite mesuree et le volume obtenu. Les points theoriques viennent du grain
bill. Le rendement global compare ces points reels au potentiel total de la
recette.

:::definition id="definition-brewhouse-efficiency" term="Rendement global" definition="Pourcentage du potentiel fermentescible de la recette retrouve dans le volume mesure. Il combine extraction, pertes process et volume final." sourceIds="palmer-2017":::

## Calculer le rendement global {#calcul-rendement}

Le calculateur existant utilise l'OG mesuree, le volume final et les lignes de
fermentescibles avec leur PPG. Les points reels sont normalises depuis OG et
volume. Les points theoriques additionnent masse de chaque fermentescible et
PPG. Le rendement global est le rapport entre ces deux valeurs.

:::calculatorCta id="efficiency-calculator" calculatorSlug="rendement" title="Calculer rendement, volumes et plan d'eau" description="Utiliser le calculateur rendement pour relier OG mesuree, grain bill, pertes process et volumes d'eau." sourceIds="palmer-2017":::

## Rendements réalistes {#plages}

Les valeurs utiles dependent fortement de l'installation et de la methode. Un
BIAB peut souvent se situer autour de 60 a 70%. Une installation amateur trois
cuves bien reglee se situe souvent autour de 70 a 78%. Un systeme RIMS ou HERMS
amateur peut monter davantage. Le plus important n'est pas d'avoir la valeur la
plus haute, mais une valeur stable, mesuree et reutilisable dans les recettes.

## Où se perd le rendement {#pertes}

Le concassage influence fortement l'acces aux sucres. L'empatage peut perdre en
efficacite si le pH ou la temperature sortent de la zone utile. La filtration et
le rincage sont souvent une grande source de pertes en amateur. Les transferts,
le trub, l'evaporation et le refroidissement changent aussi le volume final,
donc le rendement global.

:::example id="example-process-losses" title="Ne pas isoler un seul chiffre" body="Deux brassins avec la meme extraction peuvent afficher un rendement global different si les pertes de volume au transfert ou au trub changent." sourceIds="palmer-2017":::

## Volumes et plan d'eau {#volumes-eau}

Le calculateur rendement couvre aussi les volumes process : volume froid cible,
evaporation, pertes au trub, retrait au refroidissement, eau d'empatage et eau
de rincage. Ces volumes ne sont pas accessoires. Une bonne estimation du volume
pre-ebullition et du plan d'eau rend l'OG finale plus previsible.

:::relatedArticle id="related-water" articleSlug="eau" sectionId="profil-mineral" sourceIds="palmer-2017":::

## Méthode de progression {#methode}

Mesurer OG et volume final a chaque brassin. Calculer le rendement reel et le
noter. Modifier une seule variable a la fois : concassage, rincage, ratio
d'eau, pH ou pertes process. Re-mesurer au brassin suivant. Quand la valeur se
stabilise, recalibrer les recettes sur ton rendement reel plutot que sur une
valeur ideale.

## Pièges fréquents à éviter {#pieges}

Les erreurs les plus courantes sont d'utiliser un rendement theorique jamais
verifie, de changer plusieurs parametres en meme temps, de confondre rendement
d'extraction et rendement global, ou d'oublier les pertes de volume. Un chiffre
de rendement n'est utile que s'il est mesure avec une methode constante.
