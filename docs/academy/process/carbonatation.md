---
slug: carbonatation
title: Carbonatation
summary: Reference guide for carbonation targets, residual CO2, priming sugar, and safe packaging checks.
category: process
level: beginner
status: published
version: 1.0.0
estimated_read_time_minutes: 9
tags:
  - carbonation
  - packaging
  - priming
  - safety
updated_at: 2026-07-07
related_articles:
  - introduction
  - levures
related_glossary_terms: []
related_calculators:
  - slug: carbonatation
    label: Carbonation calculator
    reason: Estimate priming sugar for a target carbonation level.
    target_slug: carbonatation
learning_objectives:
  - Choose a carbonation target adapted to a beer style.
  - Understand residual CO2 and priming sugar calculations.
  - Identify the safety checks required before bottling.
prerequisites:
  - brewing-overview
  - fermentation-basics
teaches:
  - carbonation-targets
  - priming-sugar
  - packaging-safety
sensitive: true
risk_topics:
  - bottle-pressure
  - priming-dosage
source_ids:
  - palmer-2017
review:
  confidence_level: reviewed
  reviewed_by: Academy editorial review
  reviewed_at: 2026-07-07
  notes:
    - Migrated from the legacy mobile Academy carbonation topic.
    - Safety wording kept explicit because bottling too early can create dangerous pressure.
---

## Pourquoi la carbonatation est critique {#role-carbonatation}

La carbonatation ne sert pas seulement a faire des bulles. Elle influence la
mousse, la perception des aromes, la sensation en bouche et la coherence avec
le style. Une cible trop faible donne une biere plate ; une cible trop elevee
peut provoquer du gushing, une sensation agressive et, en bouteille, un risque
de surpression.

:::example id="example-carbonation-style" title="Lecture sensorielle" body="Une Bitter anglaise reste souvent peu petillante et douce au service, alors qu'une Saison ou une Weizen peut demander une carbonatation nettement plus elevee avec un contenant adapte." sourceIds="palmer-2017":::

## Reperes rapides {#reperes}

Un volume de CO2 signifie un litre de CO2 dissous dans un litre de biere. La
biere contient deja du CO2 residuel apres fermentation, et cette quantite depend
surtout de la temperature la plus haute atteinte avant conditionnement. Plus la
biere est froide, plus elle retient naturellement le CO2. Le priming consiste a
ajouter une quantite precise de sucre avant embouteillage pour generer le CO2
manquant.

:::definition id="definition-volume-co2" term="Volume de CO2" definition="Unite pratique de carbonatation. Une biere a 2,4 volumes contient environ 2,4 litres de CO2 dissous par litre de biere." sourceIds="palmer-2017":::

## Calculer le sucre de priming {#priming}

Le calcul part de trois donnees : la cible de CO2, le CO2 residuel et le volume
de biere a conditionner. Pour du glucose ou dextrose, un repere pratique est :
sucre en grammes environ egal a CO2 cible moins CO2 residuel, multiplie par le
volume en litres, puis par 4,0. Pour du saccharose, la quantite est legerement
plus faible, avec un coefficient pratique autour de 3,8.

:::calculatorCta id="carbonation-calculator" calculatorSlug="carbonatation" title="Calculer le sucre de priming" description="Utiliser le calculateur carbonatation pour relier volume, temperature, cible CO2 et type de sucre." sourceIds="palmer-2017":::

## CO2 residuel et temperature {#co2-residuel}

Le CO2 residuel doit etre estime avec la temperature la plus haute atteinte par
la biere avant conditionnement, pas seulement la temperature du jour de mise en
bouteille. Comme ordre de grandeur, une biere proche de 0°C retient environ 1,7
volume, autour de 10°C environ 1,2 volume, et autour de 20°C environ 0,85
volume. Ces valeurs servent de repere ; le calculateur doit rester la source de
dosage pratique.

## Exemple concret {#exemple-20l}

Pour un lot de 20 L a 20°C avec une cible de 2,4 volumes de CO2, le CO2
residuel peut etre estime autour de 0,85 volume. Le CO2 manquant est donc
environ 1,55 volume. Avec du dextrose, le dosage approche 1,55 x 20 x 4,0,
soit environ 124 g.

:::example id="example-priming-20l" title="Lot de 20 L" body="Une erreur de quelques dizaines de grammes peut deja changer fortement le resultat. Le sucre doit etre pese precisement et melange uniformement." sourceIds="palmer-2017":::

## Cibles utiles par style {#cibles-style}

Une Bitter ou une Stout anglaise se situe souvent autour de 1,8 a 2,2 volumes.
Une Pale Ale ou une IPA vise souvent 2,2 a 2,6 volumes. Une Belgian Ale ou une
biere de ble peut monter autour de 2,6 a 3,2 volumes. Les cibles tres hautes,
comme certaines Saisons ou Weizen, exigent des bouteilles adaptees a la
pression et une verification stricte de la fermentation terminee.

## Priming bouteille et force carbonation {#methodes}

Le priming est simple, autonome et adapte au conditionnement bouteille. La force
carbonation est plus rapide et plus precise pour le service en fut, mais elle
depend de la temperature de service et de la pression appliquee. En bouteille,
l'homogeneisation du sirop de sucre est essentielle pour eviter des bouteilles
sous-carbonatees et d'autres sur-carbonatees.

## Pieges et securite {#securite}

Ne jamais embouteiller une biere dont la FG n'est pas stable. Une fermentation
encore active peut creer une surpression dangereuse. Les autres erreurs
critiques sont un dosage approximatif du sucre, une mauvaise homogeneisation du
sirop, une temperature residuelle mal estimee, ou l'utilisation de bouteilles
non compatibles avec la pression cible.

:::relatedArticle id="related-yeast" articleSlug="levures" sectionId="fermentation" sourceIds="palmer-2017":::

## Checklist conditionnement {#checklist}

Avant conditionnement, verifier que la FG est stable sur 2 a 3 jours, noter la
temperature la plus haute atteinte avant packaging, calculer et peser le sucre
avec precision, melanger doucement et uniformement, utiliser des contenants
adaptes a la pression visee, puis controler une bouteille test apres 7 a 10
jours.
