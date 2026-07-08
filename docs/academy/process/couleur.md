---
slug: couleur
title: Couleur
summary: Repère pratique sur la couleur, l'apport des malts, les MCU, SRM, EBC et l'estimation Morey.
category: process
level: beginner
status: published
version: 1.0.0
estimated_read_time_minutes: 8
tags:
  - color
  - malt
  - srm
  - ebc
updated_at: 2026-07-07
related_articles:
  - introduction
  - fermentescibles
related_glossary_terms: []
related_calculators:
  - slug: couleur
    label: Color calculator
    reason: Estimate final beer color from malt bill and volume.
    target_slug: couleur
learning_objectives:
  - Expliquer pourquoi la couleur est un signal de régularité d'une recette.
  - Distinguer couleur des malts, MCU, SRM et EBC.
  - Identifier les erreurs fréquentes dans l'estimation de la couleur.
prerequisites:
  - brewing-overview
  - malt-basics
teaches:
  - beer-color
  - malt-color-contribution
  - srm-ebc-conversion
sensitive: false
risk_topics: []
source_ids:
  - palmer-2017
review:
  confidence_level: reviewed
  reviewed_by: Academy editorial review
  reviewed_at: 2026-07-07
  notes:
    - Migrated from the legacy mobile Academy color topic.
---

## Pourquoi la couleur est un repere cle {#role-couleur}

La couleur n'est pas seulement esthetique. Elle annonce souvent une partie du
profil attendu : biere pale et legere, ambrage caramelise, ou expression
torrefiee. Elle aide aussi a verifier que la recette reste coherente avec le
style vise. Une IPA ambree, une Pilsner pale et une Stout ne racontent pas la
meme chose avant meme la premiere gorgee.

La couleur reste toutefois un indicateur, pas une preuve de gout. Deux bieres de
couleur proche peuvent etre tres differentes si les malts, le houblonnage, la
fermentation ou le process changent.

:::example id="example-style-color" title="Lecture rapide" body="Une Pilsner tres claire attend un profil net et leger ; une Stout noire annonce souvent des malts torrefies et une perception plus intense." sourceIds="palmer-2017":::

## Reperes rapides {#reperes}

La couleur de la biere depend surtout des malts et du volume final. Le MCU est
une unite intermediaire calculee depuis les malts. Le SRM est l'echelle souvent
utilisee cote americain ; l'EBC est l'echelle courante en Europe. En repere
pratique, EBC vaut environ SRM multiplie par 1,97.

:::definition id="definition-srm-ebc" term="SRM et EBC" definition="Deux echelles de couleur de la biere. Le SRM est courant aux Etats-Unis, l'EBC en Europe ; EBC vaut environ SRM x 1,97." sourceIds="palmer-2017":::

## Calculer la couleur avec Morey {#morey}

La methode courante en brassage amateur consiste a calculer le MCU depuis la
charge de malts, puis a estimer le SRM avec la formule de Morey. Le SRM est
environ egal a 1,4922 multiplie par MCU puissance 0,6859. Cette relation n'est
pas lineaire, car la perception de couleur ne progresse pas simplement comme la
quantite de malt colore.

:::calculatorCta id="color-calculator" calculatorSlug="couleur" title="Estimer la couleur finale" description="Utiliser le calculateur couleur pour relier malts, volume final, SRM et EBC." sourceIds="palmer-2017":::

## Exemple simple {#exemple}

Si une recette donne un MCU de 10,3, la formule de Morey donne un SRM proche de
7,4. La conversion EBC donne ensuite environ 14,6. Visuellement, cela correspond
a un dore soutenu. Ce resultat reste une estimation : le process, le volume
final, l'ebullition et la perception visuelle peuvent faire varier le rendu.

:::example id="example-color-estimate" title="MCU vers EBC" body="MCU 10,3 donne environ SRM 7,4, puis EBC 14,6. La lecture pratique est une couleur doree soutenue." sourceIds="palmer-2017":::

## Plages utiles {#plages}

Le calculateur classe la couleur depuis l'echelle SRM : tres clair jusqu'a 3,
paille ou dore clair jusqu'a 6, dore jusqu'a 10, ambre clair jusqu'a 15, ambre
jusqu'a 22, brun clair jusqu'a 30, brun jusqu'a 35, puis tres fonce ou noir.
L'equivalent EBC est obtenu ensuite par conversion depuis le SRM.

## Pieges frequents a eviter {#pieges}

Les erreurs les plus courantes sont de confondre l'EBC du malt avec l'EBC final
de la biere, d'oublier l'impact du volume final, de croire que MCU et SRM sont
identiques, ou de surdoser les malts torrefies pour atteindre une couleur sans
tenir compte de leur impact aromatique.
