---
slug: fermentescibles
title: "OG, FG et atténuation : calculer l’alcool d’une bière"
summary: "Comprends l’OG, la FG et l’atténuation pour suivre la fermentation, estimer l’alcool d’une bière maison et interpréter sa densité finale."
category: ingredients
level: beginner
status: published
version: 1.1.0
estimated_read_time_minutes: 10
tags:
  - malt
  - fermentables
  - gravity
  - alcohol
updated_at: 2026-07-27
web_publication:
  status: published
  slug: og-fg-attenuation-biere
related_articles:
  - introduction
  - levures
related_glossary_terms:
  - malt
  - mout
  - empatage
  - densite-initiale
  - densite-finale
  - attenuation
related_calculators:
  - slug: fermentescibles
    label: Fermentables calculator
    reason: Estimate alcohol, final gravity, and attenuation.
    target_slug: fermentescibles
learning_objectives:
  - Expliquer le rôle du malt et des autres fermentescibles dans une bière.
  - Distinguer densité initiale, densité finale, alcool et atténuation.
  - Comprendre comment fermentescibles, levure et profil d'empâtage influencent la bière finale.
prerequisites:
  - brewing-overview
teaches:
  - malt-basics
  - gravity-reading
  - alcohol-estimation
  - attenuation-basics
sensitive: true
risk_topics:
  - fermentation-health
source_ids:
  - palmer-2017
review:
  confidence_level: validated
  reviewed_by: Academy editorial review
  reviewed_at: 2026-07-27
  notes:
    - Migrated from the legacy mobile Academy fermentables topic.
    - Expanded into a beginner guide for OG, FG, apparent attenuation, and homebrew alcohol calculation search intent.
    - Gravity, attenuation, ABV, measurement-temperature, and fermentation-completion guidance cross-checked against Palmer.
    - Approved for public-web publication on 2026-07-27.
---

## Pourquoi mesurer l'OG, la FG et l'atténuation {#role-du-malt}

L'OG, ou densité initiale, mesure le moût avant la fermentation. La FG, ou
densité finale, mesure la bière lorsque le travail de la levure est terminé.
L'atténuation apparente compare ces deux valeurs pour estimer la proportion de
sucres consommée. Ensemble, elles permettent de suivre la fermentation,
d'estimer l'alcool et de comprendre si la bière sera plutôt sèche ou ronde.

Ces mesures partent des sucres apportés par le malt, les extraits ou d'autres
fermentescibles. La levure n'en consomme qu'une partie : la recette, la souche
et le profil d'empâtage influencent donc autant le résultat que la quantité de
malt utilisée.

:::definition id="definition-og-fg" term="OG et FG" definition="L'OG représente la densité initiale du moût avant fermentation ; la FG représente la densité finale de la bière après fermentation." sourceIds="palmer-2017":::

## Repères rapides {#reperes}

OG signifie Original Gravity : c'est la densité du moût avant fermentation. FG
signifie Final Gravity : c'est la densité après fermentation. ABV exprime le
pourcentage d'alcool final. L'atténuation indique la part des sucres consommée
par la levure. Ces quatre notions relient la recette, la fermentation et le
résultat en bouche.

:::glossaryReference id="initial-gravity-reference" termSlug="densite-initiale" label="Densité initiale" sourceIds="palmer-2017":::

:::glossaryReference id="final-gravity-reference" termSlug="densite-finale" label="Densité finale" sourceIds="palmer-2017":::

## Comprendre OG et FG {#og-fg}

Pense l'OG comme la quantité de sucres disponibles au départ, puis la FG comme
ce qu'il reste à la fin. L'écart entre OG et FG montre si la levure a transformé
les sucres comme prévu. Une OG élevée donne plus de potentiel alcool. Une FG
basse donne une bière plus sèche. Une FG haute peut donner plus de rondeur, mais
peut aussi signaler une fermentation incomplète si elle n'était pas attendue.

:::example id="example-og-fg" title="Exemple courant" body="Une bière qui passe de 1,060 à 1,012 a fermenté de façon cohérente pour beaucoup d'Ales, avec une finale plutôt sèche et un ABV estimé autour de 6,3 %." sourceIds="palmer-2017":::

## Calculer l'alcool simplement {#abv}

La formule pratique la plus courante est : ABV ≈ (OG − FG) × 131,25. Elle
transforme un écart de densité en estimation du pourcentage d'alcool. Ce n'est
pas une loi physique parfaite, mais c'est un repère fiable pour le brassage
amateur lorsque les deux densités sont correctement mesurées.

:::example id="example-abv-calculation" title="Calcul avec une OG de 1,060 et une FG de 1,012" body="(1,060 − 1,012) × 131,25 donne environ 6,3 % ABV. Le résultat reste une estimation et dépend de la précision des mesures." sourceIds="palmer-2017":::

:::calculatorCta id="fermentables-calculator" calculatorSlug="fermentescibles" title="Estimer l'alcool et l'atténuation" description="Découvre comment Brasse-Bouillon relie OG, FG, atténuation et ABV sans refaire les conversions à la main." sourceIds="palmer-2017":::

## Estimer la FG avec l'atténuation {#attenuation}

L'atténuation annoncée par une levure aide à prévoir une FG réaliste avant le
brassage. Une Ale se situe souvent autour de 70 à 85 % d'atténuation apparente,
selon la souche, la recette et le profil d'empâtage. Une bière plus atténuée
sera souvent plus sèche ; une bière moins atténuée gardera plus de corps ou de
sucres résiduels.

L'atténuation apparente se calcule avec les points de densité :
((OG − FG) ÷ (OG − 1)) × 100. Pour une bière qui passe de 1,060 à 1,012,
le calcul donne 80 %. Cette valeur doit être comparée à la plage de la levure,
à la recette et aux mesures des brassins précédents.

:::definition id="definition-attenuation" term="Atténuation apparente" definition="Pourcentage de baisse de densité observé entre OG et FG. Elle estime la part des sucres consommée pendant la fermentation." sourceIds="palmer-2017":::

:::glossaryReference id="attenuation-reference" termSlug="attenuation" label="Atténuation" sourceIds="palmer-2017":::

## Plages utiles pour se repérer {#plages}

Une OG autour de 1,044 à 1,050 correspond souvent à des bières légères. Une OG
autour de 1,055 à 1,070 correspond à de nombreuses IPA et bières plus fortes.
Une FG autour de 1,008 à 1,012 donne souvent une finale sèche ; une FG au-dessus
de 1,015 donne souvent plus de douceur et de corps. En brassage maison, beaucoup
de recettes courantes se situent entre 4 et 7 % ABV.

Ces plages servent uniquement de repères. Le style, la souche, la température,
la composition du moût et le profil d'empâtage peuvent déplacer la FG attendue.
Une valeur isolée ne suffit donc pas à déclarer une fermentation terminée.

## Pièges fréquents à éviter {#pieges}

Les erreurs les plus courantes sont de lire la densité sans corriger la
température de mesure, de mélanger SG, degrés Plato et points sans conversion,
ou de confondre une estimation avec une preuve de fin de fermentation. Vérifie
la température d'étalonnage de l'instrument et prélève un échantillon
représentatif sans le reverser dans le fermenteur.

Une FG stable sur plusieurs mesures espacées est plus utile qu'une date prévue
ou que l'arrêt du barboteur. Si la densité reste nettement au-dessus de la cible,
vérifie la température, la souche et le temps écoulé avant de conditionner.

:::relatedArticle id="related-yeast" articleSlug="levures" sectionId="fermentation" sourceIds="palmer-2017":::

:::relatedArticle id="related-first-brew" articleSlug="introduction" sectionId="jour-brassage" sourceIds="palmer-2017":::
