# T6 — Script démo live seconde-par-seconde (bloc 3, 8 min)

**Contexte** : bloc 3 du pitch, 10:00 → 18:00. C'est le bloc le plus
chronométré du pitch, et le plus évalué : critère **#525 Démo live
= 30 pts**. On y démontre Brasse-Bouillon en action devant le jury,
sur un vrai téléphone, via miroir d'écran.

**Différenciation vs saynète bloc 1** : la saynète a déjà montré
`scan → recette → ajustement volume → liste → ratio`. Le bloc 3
revisite le parcours **sous un angle différent** :
- On entre par **l'authentification** (nouveau vs saynète).
- On montre une **vue profonde d'une recette** (ingrédients + étapes +
  calculs).
- On refait un **scan avec une bière différente** pour prouver la
  robustesse.
- On isole un **calculateur ABV** standalone pour démontrer la
  précision.
- On conclut sur la **timeline batch** (nouveau vs saynète).

Ce double usage est volontaire : la saynète a raconté une histoire,
le bloc 3 démontre la maturité produit.

**Slides à l'écran** :
- 10:00 → 11:00 : **S9 — Architecture tech**
- 11:00 → 16:30 : **S10 — "Démonstration live"** (volontairement sobre,
  on bascule sur le miroir téléphone)
- 16:30 → 18:00 : **S9 maintenu ou retour S10** avec les chiffres
  techniques

**Durée cible** : 8:00 min.
**Budget mots** : ~1 075 mots à 135 mpm.

## Structure du bloc

| Séquence | Timecode | Rôle | Durée |
|----------|----------|------|-------|
| 1. Ouverture tech | 10:00-11:00 | Présentateur + slide S9 | 1:00 |
| 2. Démo Auth | 11:00-11:30 | Mirror téléphone | 0:30 |
| 3. Démo recette profonde | 11:30-12:30 | Mirror téléphone | 1:00 |
| 4. Démo scanner | 12:30-14:00 | Mirror téléphone | 1:30 |
| 5. Démo calculateur isolé | 14:00-14:45 | Mirror téléphone | 0:45 |
| 6. Démo batch timeline | 14:45-15:30 | Mirror téléphone | 0:45 |
| 7. Marge + stats tech | 15:30-17:00 | Slide + présentateur | 1:30 |
| 8. Transition bloc 4 | 17:00-18:00 | Présentateur | 1:00 |
| **Total** | 10:00-18:00 | | **8:00** |

## Séquence 1 — Ouverture tech (60 s, ~135 mots)

**Slide à l'écran** : **S9 — Architecture tech** (schéma monorepo
4 packages + stack).

**Posture** : Benoît face jury, pas en avant, ton confiant mais
posé. Le présentateur pointe les éléments de la slide quand il les
nomme.

> "Avant de vous montrer l'application en direct, je veux vous dire
> comment elle est construite.
>
> Brasse-Bouillon, c'est un **monorepo** de quatre packages :
> l'application mobile **React Native**, l'API **NestJS** en
> TypeScript strict, l'encyclopédie des bières en **Python FastAPI
> avec PostgreSQL**, et le site vitrine. **Quatre-vingt-dix-sept tests
> automatisés**, une CI GitHub Actions qui ne teste que les packages
> modifiés, **zéro `any` TypeScript** autorisé dans le code.
>
> Ce n'est pas du prototype, c'est du **code industriel**. Et
> maintenant, vous allez le voir en action sur un vrai téléphone,
> avec des vraies données, en direct.
>
> **(Geste vers le projecteur.)** On bascule sur l'écran du
> téléphone."

**→ Transition visuelle** : bascule source vidéo vers **mirror
téléphone**. Slide S10 affiche "Démonstration live" en sobre derrière,
invisible pendant le mirror.

## Séquence 2 — Démo Auth (30 s, ~65 mots)

**Slide** : mirror téléphone. Application BB fermée, icône sur home
screen.

**Actions & narration** :

| T | Action physique | Narration |
|---|----------------|-----------|
| 0:00 | Tap sur icône BB | "J'ouvre l'application." |
| 0:03 | Écran Login apparaît | "L'écran d'accueil, c'est le login. Email, mot de passe, **authentification JWT** côté serveur." |
| 0:08 | Entrer email démo | "J'entre mon compte démo…" |
| 0:15 | Entrer mot de passe | "…mon mot de passe…" |
| 0:20 | Tap "Se connecter" | "…et je me connecte." |
| 0:25 | Home dashboard | "Je suis sur le tableau de bord. Mes recettes, mes brassins, mes outils. Tout est là." |

**Fallback si login échoue** : bascule immédiate sur un compte démo
de backup (deuxième paire d'identifiants pré-enregistrée dans le
téléphone).

## Séquence 3 — Démo recette profonde (60 s, ~140 mots)

**Actions & narration** :

| T | Action | Narration |
|---|--------|-----------|
| 0:00 | Tap onglet Recettes | "Je vais dans ma bibliothèque de recettes. Voici les miennes." |
| 0:06 | Liste recettes visible | "Ma *IPA du dimanche*, ma *Pale Ale session*, ma *Stout d'hiver*." |
| 0:12 | Tap sur "IPA du dimanche" | "Je rentre dans l'IPA." |
| 0:15 | Vue détail recette | "Vous voyez tout : les **ingrédients** avec leurs quantités précises, les **étapes** du brassage, les **températures et durées**." |
| 0:30 | Scroll vers les calculs | "Et en bas, les **calculs automatiques** : densité initiale, densité finale, **degré d'alcool à 5,8 %**, **amertume à 42 IBU**, couleur estimée en **SRM 8**." |
| 0:45 | Pointer les chiffres | "Ces chiffres sont **recalculés à la volée** à chaque fois que je change un ingrédient. Onze calculateurs brassicoles intégrés, tous testés unitairement." |

**Fallback si la recette ne charge pas** : garder une recette
statique en mémoire locale (mode offline), démontrer les calculs sur
cette recette.

## Séquence 4 — Démo scanner (90 s, ~200 mots)

**Actions & narration** :

| T | Action | Narration |
|---|--------|-----------|
| 0:00 | Tap onglet Scan | "Maintenant on scanne. J'ai une bouteille ici." |
| 0:05 | Sortir bouteille #2 (différente de la saynète) | "Pas celle du début du pitch — une autre, pour vous prouver que ça marche plusieurs fois." |
| 0:12 | Écran scan ouvert | "L'appareil photo s'active. Je vise le code-barre." |
| 0:20 | Scanner le code | "*(bip de scan)* Et voilà." |
| 0:25 | Fiche bière s'affiche | "La fiche bière remonte : **nom**, **brasserie**, **style**, **degré d'alcool**, **amertume**, **provenance**, **date de brassage si disponible**." |
| 0:45 | Scroll fiche bière | "C'est alimenté par notre **beer-encyclopedia**, notre propre base PostgreSQL avec quinze styles seedés et une recherche floue trigrammes pour gérer les fautes de frappe ou les codes-barres proches." |
| 1:05 | Tap "Recettes similaires" | "Et sous la fiche, je propose des **recettes équivalentes** : la même bière reproductible chez moi." |
| 1:20 | Liste recettes équivalentes | "Ce lien **scan → recette**, c'est notre différenciateur produit. Aucun concurrent francophone ne le propose." |

**Fallback si le scan échoue** :
1. Premier échec → retenter 1 fois avec un meilleur angle.
2. Deuxième échec → **bascule immédiate sur mode photo** (feature
   fallback intégrée, audit #10).
3. Troisième échec → annoncer "je reprends la démo sur le
   calculateur" et passer à la séquence 5 sans s'attarder.

## Séquence 5 — Démo calculateur isolé (45 s, ~100 mots)

**Actions & narration** :

| T | Action | Narration |
|---|--------|-----------|
| 0:00 | Tap onglet Outils → Calculateurs | "Les calculateurs, on peut aussi les utiliser indépendamment, sans passer par une recette." |
| 0:10 | Tap "ABV" | "Le plus simple : l'**ABV**, degré d'alcool." |
| 0:15 | Écran calculateur ABV | "Je rentre ma densité initiale…" |
| 0:20 | Entrer 1.050 | "…1.050." |
| 0:25 | Entrer densité finale 1.010 | "Ma densité finale, 1.010." |
| 0:30 | Affichage ABV : 5,25% | "Et j'obtiens **cinq virgule vingt-cinq pour cent d'alcool**. Calculé **instantanément**, sans réseau, totalement déterministe. **Onze tests unitaires** garantissent le résultat." |

**Fallback** : rien à dire, le calculateur est offline et
déterministe — le risque d'échec est quasi-nul.

## Séquence 6 — Démo batch timeline (45 s, ~100 mots)

**Actions & narration** :

| T | Action | Narration |
|---|--------|-----------|
| 0:00 | Tap onglet Brassins | "Quand j'ai lancé un brassin, je le suis ici." |
| 0:05 | Liste batches | "Chaque brassin a sa **timeline**." |
| 0:12 | Tap batch "IPA-2026-03" | "Mon IPA du mois dernier." |
| 0:15 | Timeline affichée | "Vous voyez : **date de brassage**, **densité mesurée**, **évolution de fermentation**, **mise en bouteille prévue**." |
| 0:28 | Pointer un jalon | "Chaque étape est **datée et notée**. Si je veux reproduire exactement, j'ai toute l'histoire." |
| 0:40 | Retour dashboard | "Voilà le parcours complet : de la recette au brassin terminé." |

**Fallback** : si la timeline ne charge pas, rester sur la liste
batches et commenter oralement.

## Séquence 7 — Marge + stats tech (90 s, ~200 mots)

**→ Transition visuelle** : **bascule source vidéo vers slide S9**
(ou S10 avec chiffres techniques).

**Posture** : Benoît revient face jury, pose le téléphone, ton
récapitulatif confiant.

> "Ce que vous venez de voir, c'est **huit fonctionnalités MVP sur
> onze déjà stables en production interne**.
>
> **Quatre-vingt-dix-sept tests** automatisés valident chaque commit.
> La **CI GitHub Actions** tourne en moins de trois minutes parce
> qu'elle ne teste que les packages modifiés. **Zéro `any` TypeScript**
> toléré.
>
> La **beer-encyclopedia** tourne sur PostgreSQL avec un modèle de
> données à dix tables et une recherche floue **pg_trgm** en
> production. L'API **NestJS** a son propre jeu de tests de contrat.
> Le mobile a son design system unifié, zéro valeur en dur.
>
> Ce n'est pas un proof-of-concept qu'on a monté la semaine dernière.
> C'est **six mois de travail itératif**, livré selon une méthode
> **Scrum** documentée, avec six sprints, une *Definition of Done*,
> une *Definition of Ready*, des revues régulières.
>
> Le produit est là. Il est solide. Il est prêt à être utilisé."

## Séquence 8 — Transition bloc 4 (60 s, ~140 mots)

**Slide** : S9 maintenue.

> "Mais brasser, ce n'est pas seulement **produire** une bière.
>
> Un brasseur amateur veut aussi **apprendre**, **progresser**,
> **partager**, **personnaliser** ce qu'il a créé.
>
> C'est pourquoi Brasse-Bouillon ne s'arrête pas à la marmite.
> L'application accompagne le brasseur **avant** — vous l'avez vu —
> **pendant** — vous venez de le voir — et **après** le brassage.
>
> **L'après-brassage**, c'est là où se joue la différenciation durable
> par rapport à **Brewfather** et à **Little Bock**. C'est
> l'**Academy**, ce sont les **labels personnalisés**, c'est la
> **communauté**.
>
> Regardons ça."

**→ Transition visuelle** : bascule vers **slide S11 — Après brassage
Academy + Labels + Communauté**.

## Vérification budget global

| Séquence | Secondes |
|----------|----------|
| 1. Ouverture tech | 60 |
| 2. Démo Auth | 30 |
| 3. Démo recette | 60 |
| 4. Démo scanner | 90 |
| 5. Démo calculateur | 45 |
| 6. Démo batch | 45 |
| 7. Marge + stats | 90 |
| 8. Transition | 60 |
| **Total** | **480 s = 8:00** |

Exactement 8 min. Zéro marge naturelle — d'où la **marge à la
séquence 7** qui peut absorber 10-20 s de retard cumulé des
séquences démo.

## Préparation technique pré-soutenance

### Dispositif téléphone

- **Téléphone démo dédié** (pas le téléphone perso), mode avion
  activé après le seed des données, wifi manuel pour l'API mobile.
- **Luminosité à 100 %** pour la captation vidéo mirror.
- **Notifications désactivées** sur toutes les applications.
- **Verrouillage auto désactivé**.
- **Compte démo seedé** : 3 recettes nommées, 1 brassin sur la
  timeline avec mesures, 2 bières de référence scannables.
- **Mirror testé** sur projecteur HDMI **avant chaque répétition**.

### Jeu de données démo reproductible

À produire en **commande Make** (`make seed-demo`) exécutée avant
chaque répétition :

- Utilisateur `demo@brasse-bouillon.fr` / mot de passe connu.
- Recettes : "IPA du dimanche", "Pale Ale session", "Stout d'hiver".
- Brassin "IPA-2026-03" avec 4 mesures de densité réparties sur
  2 semaines.
- Beer-encyclopedia pré-peuplée avec 15 styles + 30 bières connues
  (dont 2 testées pour le scanner).

**⚠️ Ce seed est à produire dans un autre chat (dev). Ici on fait
rédaction uniquement.**

### Bières de test scanner

- **Bière A** : celle utilisée dans la saynète du bloc 1 (code-barre
  pré-testé, recette équivalente existante).
- **Bière B** : une deuxième différente (pour la séquence 4 du
  bloc 3), code-barre également pré-testé.
- **Bière C** : backup au cas où A ou B échoue à la soutenance.

### Fallback global bloc 3

Si **l'API tombe pendant la démo** :

1. Terminer la séquence en cours avec les données déjà en mémoire
   (recettes et calculs fonctionnent offline).
2. Passer directement au calculateur ABV (séquence 5, zéro
   dépendance).
3. Si tout le téléphone est HS : basculer sur la **vidéo backup
   pré-enregistrée** (à tourner en J-7, cf.
   [risk-analysis.md](risk-analysis.md) risque D1).

## Chiffres et sources

| Chiffre cité | Source | Statut |
|---|---|---|
| 97 tests automatisés | [audit-features-mvp.md](audit-features-mvp.md) | ✅ Sourcé |
| 8/11 features stables | [audit-features-mvp.md](audit-features-mvp.md) | ✅ Sourcé |
| CI GitHub Actions < 3 min | À vérifier dans .github/workflows/ci.yml | 🟡 À confirmer |
| 11 calculateurs brassicoles | [audit-features-mvp.md](audit-features-mvp.md) #4 | ✅ Sourcé |
| 15 styles seedés beer-encyclopedia | [PROJECT_LOG.md](../../../PROJECT_LOG.md) #544 | ✅ Sourcé |
| Recherche floue pg_trgm | [PROJECT_LOG.md](../../../PROJECT_LOG.md) #544 | ✅ Sourcé |
| 6 sprints exécutés | [sprint-definition.md](../../project-management/sprint-definition.md) | ✅ Sourcé |
| 10 tables beer-encyclopedia | [PROJECT_LOG.md](../../../PROJECT_LOG.md) #544 | ✅ Sourcé |

## Notes de direction scénique

- **Tenir le téléphone bas** pendant la démo pour que la caméra de
  mirror capte bien — ne pas l'agiter.
- **Pointer avec le doigt** les éléments à l'écran mirror, en
  regardant alternativement le téléphone et le jury.
- **Respirer entre les séquences** — 1 seconde de pause signale la
  fin d'une fonctionnalité au jury.
- **Éviter les "voilà", "et donc", "du coup"** qui alourdissent
  un script déjà dense.
- **Bannir les jargons inutiles** : "JWT côté serveur" OK (vérifiable,
  bref), mais pas "méthode POST à l'endpoint /auth/login" qui perd
  un jury non-dev.

## À arbitrer par le user

- [ ] Valider le parcours démo bloc 3 (Auth → Recette profonde →
  Scanner bière B → Calculateur ABV isolé → Batch timeline).
- [ ] Commander le jeu de données démo seedé dans l'autre chat (dev).
- [ ] Identifier les 3 bières test (A / B / C backup) — prévoir
  achat si pas sous la main.
- [ ] Chronométrer une **vraie répétition** avec l'app ouverte pour
  vérifier que les timings tiennent (objectif : avant l'oral blanc
  06/05).
- [ ] Tourner la **vidéo backup** (fallback D1) en J-7 maximum.

## Prochaines étapes logiques

1. Rédiger le **script bloc 4** (Après brassage, 5 min) — continuité
   directe de la transition 8.
2. Rédiger le **script bloc 5** (BM + Perspectives + studio,
   6 min) — grosse matière déjà prête dans le brainstorming.
3. Rédiger le **script bloc 6** (conclusion + CTA, 1 min) — court.
4. Anticiper les **questions Q&A** les plus probables.
