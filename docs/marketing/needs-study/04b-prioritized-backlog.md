# Backlog priorisé — Besoins → Fonctionnalités → Ordre de construction

Cette page transforme les conclusions du desk research en un **ordre de construction priorisé** : quel besoin
réel chaque fonctionnalité sert, à quel point l'opportunité est forte, à quel point nous sommes confiants, et
dans quel ordre construire.

::: warning À lire d'abord
Ce classement repose sur la **recherche secondaire** (desk) — des hypothèses solides, pas une vérité confirmée sur le terrain.
Deux biais à garder à l'esprit :
1. Le desk research a surtout sondé les points de douleur **intermédiaires** (clone, partage, synchronisation), il
   **sous-pondère donc le besoin d'assistant guidé pour débutant** — réel mais étayé seulement indirectement (les fils
   « j'ai construit ma propre application de jour de brassage », les plaintes sur une UX trop ardue, les 40 % de flux de
   nouveaux arrivants). Ces lignes sont taguées *sous-sondé* et les entretiens doivent les confirmer.
2. Le fondateur est un **débutant** qui construit (d'abord) pour des **débutants** — nous séquençons donc délibérément
   **l'assistant en premier**, même là où le score brut du desk placerait le créneau de clone intermédiaire en tête.
:::

## Règle de priorisation

> **Opportunité = Importance (force/fréquence du besoin) × Sous-servi (mauvaise qualité du traitement par les acteurs en place).**
> Puis **séquencer par étape du parcours**, en commençant par l'assistant débutant (acquisition), parce que c'est
> le segment accessible au fondateur et l'entrée la moins risquée (un utilitaire utile au quotidien bat une
> communauté qui a besoin d'une foule pour exister — cf. l'arrêt d'AHA Brew Guru en 2026).

**Étiquettes de confiance :** `validé` (signal de desk fort et multi-sources) · `hypothèse` (déduit, plausible)
· `sous-sondé` (réel mais faiblement étayé — les entretiens doivent confirmer).

## Le parcours = la colonne vertébrale

```
Étape 1 — DÉBUTANT (assistant guidé)        →  ACQUISITION   →  le parcours en 4 étapes
Étape 2 — RÉGULIER (organiser & suivre)     →  RÉTENTION
Étape 3 — INTERMÉDIAIRE (cloner & partager) →  PROFONDEUR     →  le créneau phare du desk
```

## Étape 1 — Assistant débutant · le parcours en 4 étapes (construire en premier)

| Besoin | Fonctionnalité | Opportunité | Confiance |
|---|---|---|---|
| Ne pas rater un brassage ; savoir quoi faire, quand & pourquoi | **Assistant de jour de brassage guidé pas à pas** (empâtage/ébullition/refroidissement, minuteurs, températures, le « pourquoi ») | Élevé × Élevé = **Élevé** | sous-sondé |
| Réussir dès le tout premier lot, sans jargon | **Catalogue de recettes calibré pour débutant** (organisé, IBU/ABV/volume affichés) — étape 1 du parcours | Élevé × Moyen-élevé = **Élevé** | hypothèse |
| Savoir où en est ma fermentation | **Suivi de fermentation** (jours, densité, température, barre de progression) — étape 3 du parcours | Élevé × Moyen = **Moyen-élevé** | validé |
| Terminer & célébrer | **Mise en bouteille + étiquette + partage avec des amis** — étape 4 du parcours | Moyen × Moyen = **Moyen** | hypothèse |
| Le brassage se fait hors-ligne (garage/cave) | **Tolérant au hors-ligne**, pas de synchronisation forcée / pas de duplication des données | Élevé × Élevé = **Élevé** | validé |
| Les outils donnent une impression de surcharge | **UX épurée, sans encombrement et ludique** (le différenciateur éprouvé) | Élevé × Moyen = **Moyen** (exigence de qualité) | validé |

## Étape 2 — Brasseur régulier · organiser & suivre (rétention)

| Besoin | Fonctionnalité | Opportunité | Confiance |
|---|---|---|---|
| Mes recettes sont éparpillées (carnets, feuilles) | **Organisation & recherche de recettes** (tags par style/ingrédient/résultat) | Élevé × Moyen-élevé = **Élevé** | validé |
| Me souvenir de ce que j'ai fait d'un lot à l'autre | **Historique de lots / journal de brassage** avec notes consultables | Élevé × Moyen = **Moyen-élevé** | validé |
| Ne pas enfermer mes données | **Import-export BeerXML / BeerJSON** (pas de verrouillage, sans perte) | Élevé × Moyen = **Moyen-élevé** | validé |
| Fiabilité / ne pas perdre mon historique | **Stockage durable, pas de perte de données** (un message de confiance, surtout en FR après Joliebulle/Little Bock) | Élevé × Moyen = **Moyen-élevé** | validé |

## Étape 3 — Intermédiaire · cloner & communauté (profondeur — le créneau du desk)

| Besoin | Fonctionnalité | Opportunité | Confiance |
|---|---|---|---|
| Recréer une bière précise que j'aime | **Dépôt de clones consultable et organisé** | Très élevé × Élevé = **Très élevé** | validé |
| Les clones publiés sont erronés / statiques | **Clones versionnés, validés par la communauté** (la boucle d'itération que personne ne possède) | Élevé × Très élevé = **Élevé** | hypothèse |
| Partager sans perdre la paternité | **Partage avec crédit de l'auteur** (multi-groupe, export en lot) | Moyen-élevé × Élevé = **Élevé** | validé (EN) / hypothèse (FR) |
| Une recette partagée ne correspond pas à mon matériel | **Remise à l'échelle automatique vers l'équipement du destinataire** | Moyen × Élevé = **Moyen-élevé** | hypothèse |

**Transversal (toutes les étapes) :** une **offre gratuite juste et généreuse** — la fatigue des paywalls est l'un
des signaux les plus forts du desk ; c'est un principe de tarification, pas une fonctionnalité. Ne pas concurrencer
sur le calcul (les acteurs en place y gagnent).

## Ordre de construction (la réponse à « qu'implémente-t-on, et dans quel ordre »)

1. **P0 — l'entrée par l'assistant (Étape 1) :** assistant de jour de brassage guidé + catalogue débutant + suivi
   de fermentation + UX épurée + tolérance au hors-ligne. *C'est le créneau que nous livrons et validons en premier.*
2. **P1 — rétention (Étape 2) :** organisation & recherche, historique de lots, import/export BeerXML, durabilité.
3. **P2 — profondeur (Étape 3) :** dépôt de clones → clones versionnés → partage crédité → remise à l'échelle automatique.

Le dépôt de clones obtient un score **Très élevé** en opportunité brute, mais il vit à l'Étape 3 parce qu'il sert
les intermédiaires et a besoin d'une foule. Nous **entrons** par l'assistant et **grandissons vers** la communauté —
« l'application qui grandit avec le brasseur ».

## Ce que les entretiens doivent trancher (liens vers le [guide d'entretien](/05-interview-guide))

- **Le plus grand risque ouvert :** l'**assistant débutant** est-il vraiment un besoin fort, qui mérite qu'on s'y attarde,
  ou les brasseurs « passent-ils ce stade » trop vite pour en faire une activité viable ? (les lignes *sous-sondé* ci-dessus).
- Si la **sensibilité à la paternité** tient en FR comme en EN.
- Si le **versioning + la remise à l'échelle automatique** est ressenti comme un besoin réel ou un simple agrément.
- Si les intermédiaires **changeraient** d'un outil retranché.

Tant que ces questions ne sont pas tranchées, traitez l'ordre ci-dessus comme le **meilleur pari actuel**, et non comme une feuille de route arrêtée.
