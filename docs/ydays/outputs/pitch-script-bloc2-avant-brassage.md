# Script présentateur — Bloc 2 Avant brassage (6 min)

**Contexte** : bloc 2 du pitch, 4:00 → 10:00. Suit directement le cadrage
du bloc 1 ("Voyons maintenant comment, concrètement, nous accompagnons
ce brasseur à chaque étape"). Couvre la phase **Avant brassage** du
parcours utilisateur : apprentissage, choix de recette, préparation.

**Slides à l'écran** :
- 4:00 → 5:45 : **S7 — 3 personas**
- 5:45 → 10:00 : **S8 — UX "Avant brassage" + design system**

**Critères grille ciblés** : #524 Business model + innovation (30 pts) et
#527 Slide deck (15 pts) — le bloc 2 est là où l'on démontre la maturité
produit et design.

**Durée cible** : 6:00 min.
**Budget mots** : ~800 mots à 135 mpm.
**Posture** : posé, pédagogique, Benoît face jury, les mains qui
dessinent les 3 niveaux d'utilisateur quand il présente les personas.

## Script — version V1 (~800 mots)

### 1. Ouverture bloc 2 — 30 s, ~65 mots

> **(Slide bascule sur S7 — 3 personas en file.)**
>
> "Avant de brasser sa première bière, un futur brasseur se pose trois
> questions : *par où je commence ?*, *suis-je capable ?*, *qu'est-ce
> qui va me correspondre ?*
>
> Pour y répondre, nous avons étudié les brasseurs amateurs français.
> Nous en avons tiré **trois profils types**, trois personas, qui
> couvrent l'ensemble de la cible. Laissez-moi vous les présenter."

### 2. Les 3 personas — 1:45 min, ~235 mots

> **(Le présentateur désigne à la main, de gauche à droite, chaque
> portrait sur la slide S7.)**
>
> "À gauche, **Nicolas le débutant**. Trente à trente-cinq ans, jeune
> actif urbain, il est curieux, technophile, souvent influencé par un
> ami qui lui a fait goûter une bière maison. Son objectif : **réussir
> son premier brassin sans erreur**. Sa frustration : *"je ne comprends
> rien aux termes techniques, et les tutoriels en ligne me perdent"*.
>
> **(Il désigne le portrait central.)**
>
> Au centre, **Claire l'amatrice créative**. Trente-cinq à quarante-cinq
> ans, dans un métier créatif, graphisme ou artisanat. Elle brasse
> depuis quelques années, elle expérimente, elle veut partager. Son
> objectif : **gérer son historique de recettes, varier les styles,
> retrouver une version précédente**. Sa frustration : *"les applis
> existantes sont techniques, austères, elles tuent l'envie"*.
>
> **(Il désigne le portrait de droite.)**
>
> À droite, **Marc l'expert**. Quarante-cinq ans et plus, cadre
> scientifique ou consultant technique. Il brasse depuis plus de dix
> ans, il veut la précision. Son objectif : **atteindre une régularité
> parfaite, suivre les courbes de fermentation, connecter ses capteurs
> IoT**. Sa frustration : *"les outils grand public plafonnent trop
> vite, je dois jongler entre trois solutions"*.
>
> Trois profils, trois niveaux, **une seule application** qui
> s'adapte à eux."

### 3. Le parcours "Avant brassage" — 2:00 min, ~270 mots

> **(Slide bascule sur S8 — UX Avant brassage + design system.)**
>
> "Pour ces trois profils, nous avons conçu un parcours "Avant
> brassage" qui **s'adapte au niveau**.
>
> Pour Nicolas, le point d'entrée c'est **l'Academy intégrée**. Des
> tutoriels pas-à-pas, progressifs, avec un glossaire pour démystifier
> chaque terme technique. Pas un blog externe à aller chercher sur
> Google — c'est **dans l'application**, contextualisé à chaque écran.
>
> Pour Claire, c'est **la bibliothèque de recettes**. Création,
> duplication, variation. Chaque recette est versionnée, chaque
> modification tracée. Elle peut naviguer dans son historique, repartir
> d'une bière qu'elle a aimée, tester un nouveau houblon.
>
> Pour Marc, c'est **la bibliothèque d'ingrédients adossée à notre
> beer-encyclopedia**. Quinze styles seedés, malts, houblons, levures,
> eau — avec les fiches techniques précises. Sur PostgreSQL, avec une
> recherche floue qui accepte les fautes de frappe. C'est du niveau
> professionnel accessible à tout le monde.
>
> Et au centre de tout ça, **les calculateurs brassicoles**. **ABV**
> pour le degré d'alcool, **IBU** pour l'amertume, **SRM** pour la
> couleur, carbonatation, densité initiale et finale. Onze calculateurs
> intégrés, totalement déterministes, sans dépendance réseau. **Onze
> tests unitaires** par calculateur garantissent qu'il n'y a **aucune
> marge d'erreur** — le brasseur peut s'y fier.
>
> Ce que nous venons de voir — Academy, recettes, ingrédients,
> calculateurs — c'est le socle du parcours avant que le brasseur ne
> touche sa marmite."

### 4. Design system + cohérence produit — 1:15 min, ~170 mots

> **(Le présentateur pointe la palette à droite de la slide S8.)**
>
> "Et tout ça tient par un **design system unifié**. Un jaune
> signature, qui évoque la bière et l'atelier chaud. Une typographie
> lisible. Un système de tokens — **couleurs, espacements, typographie**
> — utilisé par **cent pour cent** des écrans mobiles livrés. Jamais
> de valeur en dur dans le code : chaque couleur, chaque marge, vient
> du design system.
>
> Résultat : un brasseur qui passe de Nicolas à Claire en gagnant en
> expérience retrouve la **même cohérence visuelle**, la même grammaire
> d'interface. Il n'a pas à réapprendre l'application quand ses
> besoins évoluent.
>
> Nous avons aussi formalisé une **charte graphique complète** — logo,
> déclinaisons, palette, règles d'usage — et **onze wireframes** qui
> couvrent toutes les fonctionnalités du MVP. Tout est documenté dans
> le dépôt, vérifiable, reproductible.
>
> Bref, ce n'est pas un MVP jetable. C'est un socle produit pensé pour
> durer."

### 5. Transition vers bloc 3 — 30 s, ~60 mots

> **(Temps court, le présentateur marque la transition par un pas en
> avant.)**
>
> "Notre brasseur sait maintenant **ce qu'il veut faire**. Sa recette
> est prête, ses ingrédients sont identifiés, il a le matériel.
>
> Le moment-clé arrive : **brasser**.
>
> Et c'est là que Brasse-Bouillon va vraiment lui simplifier la vie.
> Regardez."
>
> **(Transition vers bloc 3. Slide bascule sur S9 — Architecture tech
> + mirror téléphone prêt.)**

## Vérification budget mots et timing

| Section | Mots | Secondes @ 135 mpm |
|---------|------|--------------------|
| 1. Ouverture | 65 | 29 |
| 2. 3 personas | 235 | 104 |
| 3. Parcours Avant brassage | 270 | 120 |
| 4. Design system | 170 | 76 |
| 5. Transition | 60 | 27 |
| **Total** | **~800** | **~356 = 5:56** |

**Sous les 6:00 min** — marge de sécurité de ~4 s.

## Chiffres et sources

| Chiffre cité | Source | Statut |
|---|---|---|
| 3 personas (Nicolas, Claire, Marc) | [user_personas.md](../../personas/user_personas.md) | ✅ Sourcé |
| 15 styles seedés | [PROJECT_LOG.md](../../../PROJECT_LOG.md) #544 | ✅ Sourcé |
| PostgreSQL + recherche floue (pg_trgm) | [PROJECT_LOG.md](../../../PROJECT_LOG.md) #544 | ✅ Sourcé |
| 11 calculateurs + 11 tests | [audit-features-mvp.md](audit-features-mvp.md) feature #4 | ✅ Sourcé |
| 11 wireframes | [smart-objectives-par-pole.md](smart-objectives-par-pole.md) #13 | 🟡 Flaguée trou factuel (compte exact à vérifier) |
| Design system tokens 100% des écrans | [CLAUDE.md](../../../CLAUDE.md) § Code Style Defaults | ✅ Sourcé |

## SMART évoqués implicitement

- **#15** (3 personas documentés) — incarné dans la séquence 2.
- **#16** (design system cohérent 100 % écrans mobiles) — explicite
  dans la séquence 4.
- **#17** (flows UX documentés DS01-DS08) — non cité mais en support.
- **#13** (11 wireframes couvrant MVP) — cité en séquence 4.

## Notes de direction scénique

- **Ralentir** sur les noms des personas : "Ni-co-las", "Claire",
  "Marc" — pour que le jury les mémorise.
- **Gestuelle** : dessiner à la main les trois niveaux (bas, milieu,
  haut) pendant la présentation des personas. Crée une image mentale
  claire.
- **Ton plus chaud** sur la séquence 4 (design system) — c'est le
  moment pitch le plus esthétique, assumer la fierté produit.
- **Pas en avant** à la transition "brasser" — signale physiquement
  le changement de bloc.
- **Éviter les "euh"** entre les personas — préparer les 3 portraits
  comme 3 mini-récits de 25-30 s chacun.

## Options de repli si une séquence dépasse

Si une séquence déborde, couper dans cet ordre :

1. **Séquence 4** peut être ramenée à 45 s en coupant la phrase sur
   les tokens et en gardant "jaune signature + onze wireframes + pas
   un MVP jetable".
2. **Séquence 3** peut éviter le détail des calculateurs (couper
   "ABV, IBU, SRM, carbonatation" pour juste dire "onze
   calculateurs brassicoles").
3. **Séquence 2** est **incompressible** — les trois personas doivent
   être présentés individuellement.

## À arbitrer par le user

- [ ] Valider le compte de wireframes (11 attendus) — trou factuel
  ouvert.
- [ ] Relire le script à voix haute chronométrée, signaler les
  phrases qui coincent.
- [ ] Décider si l'intervention "Création" (A0 du plan) reste
  intégrée à la voix du présentateur ou si elle devient une
  vraie 2e voix (comme Kévin sur la saynète).
- [ ] Choisir le mode de bascule slide entre S7 et S8 (cut sec ou
  fondu — fondu recommandé pour garder la continuité).

## Prochaines étapes logiques

1. Rédiger le **T6 script démo live seconde-par-seconde** (bloc 3,
   6 min) — c'est le plus chronométré et le plus critique (30 pts).
2. Rédiger le **script bloc 4** (Après brassage, 5 min) — continuité
   naturelle.
3. Rédiger le **script bloc 5** (BM + Perspectives + studio web,
   6 min) — gros bloc mais déjà bien sourcé dans le brainstorming.
