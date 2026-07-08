---
slug: eau
title: Eau de brassage
summary: Repère pratique sur le pH d'empâtage, le profil minéral, l'alcalinité résiduelle et les ajustements de l'eau.
category: water
level: beginner
status: published
version: 1.0.0
estimated_read_time_minutes: 10
tags:
  - water
  - minerals
  - mash
  - ph
updated_at: 2026-07-07
related_articles:
  - introduction
  - houblons
related_glossary_terms:
  - profil-mineral
  - ph
  - calcium
  - sulfate
  - chlorure
related_calculators:
  - slug: eau
    label: Water calculator
    reason: Adjust a water profile for a recipe.
    target_slug: eau
learning_objectives:
  - Comprendre pourquoi la composition de l'eau influence le brassage.
  - Identifier les principales familles minérales utilisées pour ajuster l'eau.
  - Appliquer une méthode simple et sûre pour les premières corrections d'eau.
prerequisites:
  - brewing-overview
teaches:
  - water-profile
  - mash-ph
  - residual-alkalinity
sensitive: true
risk_topics:
  - chemical-dosage
  - ph-measurement
source_ids:
  - brun-water-knowledge
review:
  confidence_level: reviewed
  reviewed_by: Academy editorial review
  reviewed_at: 2026-07-07
  notes:
    - Migrated from the legacy mobile Academy water topic.
---

## Pourquoi l'eau est critique {#profil-mineral}

L'eau represente la tres grande majorite du volume final d'une biere. Elle
pilote aussi le pH d'empatage, l'extraction des sucres, la perception de
l'amertume et l'equilibre entre secheresse houblonnee et rondeur maltee.

:::glossaryReference id="water-profile-reference" termSlug="profil-mineral" label="Profil minéral" sourceIds="brun-water-knowledge":::

:::definition id="definition-profil-mineral" term="Profil minéral" definition="Composition de l'eau en ions principaux comme calcium, magnesium, sodium, sulfates, chlorures et bicarbonates." sourceIds="brun-water-knowledge":::

## Les 6 ions à connaître {#ions-principaux}

Les corrections d'eau deviennent plus simples quand on se concentre d'abord sur
les ions les plus utiles au brasseur. Le calcium aide le pH, la clarte et la
floculation. Le magnesium nourrit la levure mais doit rester modere. Le sodium
apporte de la rondeur a petite dose. Les sulfates accentuent la secheresse et la
perception de l'amertume. Les chlorures soutiennent la rondeur et l'expression
maltee. Les bicarbonates tamponnent le pH et sont souvent trop eleves dans une
eau calcaire.

:::example id="example-sulfate-chloride" title="Lecture rapide" body="A valeurs raisonnables, plus de sulfates pousse une IPA vers un profil sec et net ; plus de chlorures soutient une biere plus ronde et maltee." sourceIds="brun-water-knowledge":::

## Le pH à chaque étape {#ph-empatage}

Le repere principal pendant l'empatage reste une zone autour de 5,2 a 5,6.
En dehors de cette zone, les enzymes travaillent moins bien et la biere perd en
precision. Pour le rincage, rester proche de 5,5 a 5,8 aide a limiter
l'extraction de tannins. Un pH trop haut augmente les risques d'astringence ;
un pH trop bas peut rendre le profil agressif.

:::definition id="definition-mash-ph" term="pH d'empatage" definition="Mesure d'acidite de la maische. Elle influence l'activite enzymatique, l'extraction et la nettete aromatique." sourceIds="brun-water-knowledge":::

## Alcalinité résiduelle et ratio SO4/Cl {#alcalinite-ratio}

L'alcalinite residuelle resume la capacite de l'eau a resister a
l'acidification des malts. Plus elle est elevee, plus le pH a tendance a
monter. Repere pratique : RA en ppm environ egale a HCO3 moins Ca divise par
3,5 moins Mg divise par 7.

Le ratio sulfates/chlorures donne une intention sensorielle, mais il ne suffit
pas seul. Il faut toujours verifier les valeurs absolues en ppm pour eviter une
biere au gout mineral, chimique ou metallique.

:::example id="example-ra-style" title="Adapter au style" body="Une eau a RA faible convient mieux aux bieres pales. Une RA plus elevee peut aider certains styles fonces, dont les malts acidifient davantage la maische." sourceIds="brun-water-knowledge":::

## Méthode simple et fiable {#methode}

Commencer par lire l'analyse d'eau : calcium, magnesium, sodium, sulfates,
chlorures et bicarbonates. Choisir ensuite une cible de style, puis reduire en
priorite les bicarbonates si l'eau est trop calcaire, souvent par dilution avec
de l'eau osmosee. Les sels comme le gypse ou le chlorure de calcium viennent
ensuite pour ajuster progressivement le profil. Le pH de maische doit rester le
controle principal.

:::calculatorCta id="water-calculator" calculatorSlug="eau" title="Ajuster un profil d'eau" description="Utiliser le calculateur eau pour relier analyse de depart, cible de style et additions progressives." sourceIds="brun-water-knowledge":::

## Exemple IPA {#exemple-ipa}

Avec une eau de depart tres calcaire, il vaut mieux diluer d'abord pour
abaisser les bicarbonates, puis remonter les ions utiles au style. Pour une IPA,
le gypse peut augmenter calcium et sulfates pour un profil plus sec, tandis que
le chlorure de calcium peut garder assez de rondeur. Une cible de ratio SO4/Cl
autour de 3:1 a 5:1 peut servir de repere, a condition que les ppm restent
raisonnables.

:::example id="example-ipa-water" title="Ordre de correction" body="Diluer d'abord une eau trop bicarbonatee, ajuster ensuite avec les sels, puis verifier le pH mesure plutot que de se fier uniquement au calcul." sourceIds="brun-water-knowledge":::

## Pièges fréquents à éviter {#pieges}

Les erreurs les plus courantes sont d'ajuster les sels sans mesurer le pH de
maische, de se focaliser sur le ratio SO4/Cl sans regarder les ppm reels, de
surdoser les sels, d'oublier la dechloration de l'eau du robinet, ou d'utiliser
un pH-metre non calibre.
