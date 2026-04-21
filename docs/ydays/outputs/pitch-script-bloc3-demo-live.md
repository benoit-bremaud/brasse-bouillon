# T6 — Script démo live seconde-par-seconde (bloc 3, 5 min)

**Contexte** : bloc 3 du pitch. C'est le bloc le plus chronométré, et le
plus pondéré de la catégorie **Production (30 pts)** de la grille Ynov
(voir [../references/grille-pitch-entrepreneurial.md](../references/grille-pitch-entrepreneurial.md)).
On y démontre Brasse-Bouillon en action devant le jury, sur un vrai
téléphone, via miroir d'écran.

**Durée révisée 2026-04-21 : 5:00** (compression de 8:00 → 5:00 pour
honorer la consigne coach 2026-03-25 "5 min réservées à la démo finale",
cf. [../references/2026-03-25_coach-session-summary.md](../references/2026-03-25_coach-session-summary.md)).
Les 3 minutes libérées sont redistribuées dans le
[plan](plan-presentation-27-mai.md) — +1 bloc 1, +1 bloc 5, +1 marge flottante.

**Différenciation vs saynète bloc 1** : la saynète a déjà montré
`scan → recette → ajustement volume → liste → ratio`. Le bloc 3
revisite le parcours **sous un angle différent** :

- On entre par **l'authentification** (nouveau vs saynète, 20 s).
- On montre une **vue profonde d'une recette** (11 calculs, 30 s).
- On refait un **scan avec une bière différente** pour prouver la
  robustesse (1:15).
- On isole un **calculateur ABV** standalone pour démontrer la
  précision (30 s).
- On conclut sur la **timeline batch avec incrustation stats archi**
  (1:00, l'intervention Dev est **diluée en slide overlay** plutôt
  qu'en segment séparé — gagne 1:30 sans perdre les preuves techniques).

Ce double usage est volontaire : la saynète raconte une histoire, le
bloc 3 démontre la maturité produit.

## Slides à l'écran

- **Ouverture (15 s)** : **S9 — Architecture tech** (schéma monorepo + stack)
- **11:15 → 15:45** : bascule sur **miroir téléphone**, avec **S10 en
  overlay réduit** affichant en permanence les preuves techniques
  (97 tests, 11 calculateurs, 10 tables PG, zéro `any`, 6 sprints)
- **15:45 → 16:00** : retour S9 ou bascule S11 pour la transition bloc 4

## Structure du bloc (5:00)

| Séquence | Timecode | Rôle | Durée |
|----------|----------|------|-------|
| 1. Ouverture tech éclair | 0:00-0:15 | Présentateur + S9 | 0:15 |
| 2. Auth + dashboard | 0:15-0:35 | Mirror téléphone | 0:20 |
| 3. Recette profonde | 0:35-1:05 | Mirror téléphone | 0:30 |
| 4. Scanner bière B | 1:05-2:20 | Mirror téléphone | 1:15 |
| 5. Calculateur ABV isolé | 2:20-2:50 | Mirror téléphone | 0:30 |
| 6. Timeline batch + overlay archi | 2:50-3:50 | Mirror + overlay S10 | 1:00 |
| 7. Transition bloc 4 | 3:50-4:50 | Présentateur + S9 | 1:00 |
| Marge | 4:50-5:00 | — | 0:10 |
| **Total** | 0:00-5:00 | | **5:00** |

**Budget mots** : ~675 mots à 135 mpm (vs 1 075 dans la version 8 min —
compression de ~37 %).

## Séquence 1 — Ouverture tech éclair (15 s, ~35 mots)

**Slide** : **S9 — Architecture tech** (schéma monorepo 4 packages + stack).
**Posture** : Benoît face jury, geste large vers la slide.

> "Avant la démo, **l'architecture en dix secondes** : monorepo, quatre
> packages, React Native, NestJS, FastAPI, PostgreSQL. **Quatre-vingt-dix-sept
> tests automatisés**, zéro `any` TypeScript. Du code industriel, pas un
> prototype. **(geste vers le projecteur)** Je bascule sur le téléphone."

**→ Transition visuelle** : bascule source vidéo vers mirror téléphone,
overlay S10 affiche les chiffres clés en permanence.

## Séquence 2 — Auth + dashboard (20 s, ~45 mots)

**Slide** : mirror + overlay chiffres.

| T | Action | Narration |
|---|--------|-----------|
| 0:00 | App ouverte sur écran Login | "J'ouvre l'appli." |
| 0:05 | Tap "Se connecter" (champs pré-remplis) | "**Authentification JWT**, compte démo." |
| 0:10 | Home dashboard | "Tableau de bord : mes recettes, mes brassins, mes outils. Tout est là." |
| 0:18 | Tap onglet Recettes | "On entre par les recettes." |

**Fallback login** : identifiants pré-saisis dans le mobile ; en cas
d'échec, basculer directement vers l'écran Recettes déjà ouvert dans
l'historique d'app.

## Séquence 3 — Recette profonde (30 s, ~70 mots)

| T | Action | Narration |
|---|--------|-----------|
| 0:00 | Liste recettes visible | "Ma bibliothèque. *IPA du dimanche*, *Pale Ale session*, *Stout d'hiver*." |
| 0:06 | Tap "IPA du dimanche" | "Je rentre dans l'IPA." |
| 0:10 | Vue détail | "**Ingrédients**, **étapes**, **températures**, **durées**. Tout est structuré." |
| 0:18 | Scroll vers calculs | "Et en bas, les **onze calculs automatiques** : densité, **ABV 5,8 %**, **IBU 42**, SRM 8." |
| 0:26 | Pointer chiffres | "**Recalculés à la volée**. Onze calculateurs, tous testés unitairement." |

**Fallback** : recette statique en cache local, les calculs restent
fonctionnels offline.

## Séquence 4 — Scanner bière B (1:15, ~170 mots)

**Séquence cœur** de la démo — le différenciateur produit. **Prendre le
temps nécessaire ici** ; toute surconsommation vole sur la marge finale.

| T | Action | Narration |
|---|--------|-----------|
| 0:00 | Tap onglet Scan + sortir bière B | "On scanne. **Une autre bière que celle de la saynète**, pour prouver la robustesse." |
| 0:10 | Écran scan ouvert, caméra active | "La caméra s'active. Je vise le code-barre." |
| 0:18 | Scan *(bip)* | "*(bip)* Et voilà." |
| 0:25 | Fiche bière apparaît | "La fiche remonte : **nom**, **brasserie**, **style**, **ABV**, **IBU**, **provenance**." |
| 0:40 | Scroll fiche | "Alimenté par notre **beer-encyclopedia** : PostgreSQL, dix tables, **recherche floue pg_trgm** pour gérer fautes de frappe et codes-barres proches." |
| 0:55 | Tap "Recettes similaires" | "Et sous la fiche, les **recettes équivalentes** : cette bière, reproductible chez moi." |
| 1:08 | Liste recettes équivalentes | "**Scan → recette** : notre différenciateur. Aucun concurrent francophone ne le propose." |

**Fallback scanner** :

1. Premier échec → réessayer 1 fois avec meilleur angle.
2. Deuxième échec → **bascule mode photo** (fallback intégré, audit #10).
3. Troisième échec → "je passe au calculateur" et sauter à la séquence 5.

## Séquence 5 — Calculateur ABV isolé (30 s, ~70 mots)

| T | Action | Narration |
|---|--------|-----------|
| 0:00 | Tap Outils → Calculateurs → ABV | "Les calculateurs marchent **indépendamment**, sans recette. Le plus simple : **l'ABV**." |
| 0:10 | Entrer densité initiale 1.050 | "Densité initiale, 1.050." |
| 0:17 | Entrer densité finale 1.010 | "Finale, 1.010." |
| 0:22 | Résultat affiché : 5,25 % | "**Cinq virgule vingt-cinq pour cent**. Instantané, offline, déterministe. **Onze tests unitaires** garantissent ce résultat." |

**Fallback** : aucun — calculateur 100 % offline et déterministe.

## Séquence 6 — Timeline batch + overlay archi (1:00, ~180 mots)

**Slide** : mirror + **overlay S10 agrandi** affichant les chiffres
archi (97 tests, CI < 3 min, 0 `any`, 6 sprints, 8/11 features stables).

L'intervention Dev (architecture + tests + méthodologie) **se lit dans
l'overlay pendant que Benoît commente la timeline** — gagne 1:30 vs la
version 8 min où c'était un segment séparé.

| T | Action | Narration |
|---|--------|-----------|
| 0:00 | Tap onglet Brassins | "Les brassins lancés, je les suis ici." |
| 0:08 | Liste batches + tap IPA-2026-03 | "Chacun a sa **timeline**. Mon IPA du mois dernier." |
| 0:15 | Timeline affichée | "**Date de brassage**, **densités mesurées**, **évolution fermentation**, **mise en bouteille prévue**." |
| 0:30 | Pointer un jalon + geste vers overlay | "Chaque étape est datée. Et pendant que je vous montre ça, regardez l'écran : **97 tests**, **CI GitHub Actions sous 3 minutes**, **zéro `any` TypeScript**, **six sprints documentés Scrum**." |
| 0:50 | Retour dashboard | "**Huit fonctionnalités sur onze** sont déjà stables. Ce n'est pas un proof-of-concept. **C'est du produit.**" |

**Fallback** : si la timeline ne charge pas, rester sur la liste
batches et commenter oralement ; l'overlay fournit déjà les preuves
techniques.

## Séquence 7 — Transition bloc 4 (1:00, ~135 mots)

**Slide** : retour **S9** ou pivot direct vers S11 "Après brassage".

**Posture** : Benoît repose le téléphone, face jury, ton récapitulatif
confiant.

> "Ce que vous venez de voir, c'est **huit fonctionnalités sur onze**
> déjà stables. Du code industriel, **six mois de travail itératif**,
> livré en méthode **Scrum** documentée — *Definition of Done*,
> *Definition of Ready*, revues régulières, six sprints.
>
> Mais brasser, ce n'est pas seulement **produire** une bière.
>
> Un brasseur amateur veut aussi **apprendre**, **progresser**,
> **partager**, **personnaliser** ce qu'il a créé.
>
> C'est pourquoi Brasse-Bouillon ne s'arrête pas à la marmite.
> L'application accompagne le brasseur **avant** — vous l'avez vu dans
> la saynète — **pendant** — vous venez de le voir — et **après** le
> brassage.
>
> **L'après-brassage**, c'est là où se joue la différenciation durable
> face à **Brewfather** et **Little Bock**. Regardons ça."

**→ Transition visuelle** : bascule vers **slide S11 — Après brassage
Academy + Labels + Communauté**.

## Vérification budget global

| Séquence | Secondes |
|----------|----------|
| 1. Ouverture tech éclair | 15 |
| 2. Auth + dashboard | 20 |
| 3. Recette profonde | 30 |
| 4. Scanner bière B | 75 |
| 5. Calculateur ABV | 30 |
| 6. Timeline batch + overlay | 60 |
| 7. Transition bloc 4 | 60 |
| Marge absorption | 10 |
| **Total** | **300 s = 5:00** |

**Exactement 5 min.** 10 s de marge naturelle (séquence "marge
absorption" en fin), plus les 1:15 de la séquence 4 qui peuvent céder
5-10 s si le scanner prend trop de temps.

## Ce qui a été coupé vs version 8 min

- **Séquence 1 "Ouverture tech" (60 → 15 s)** : l'architecture détaillée
  est maintenant **en overlay S10 permanent** pendant la démo, pas en
  narration dédiée.
- **Séquence 2 "Auth" (30 → 20 s)** : champs pré-remplis, pas de
  commentaire JWT détaillé (la mention JWT tient en 2 s).
- **Séquence 3 "Recette" (60 → 30 s)** : moins de scroll, concentration
  sur les 11 calculs (point-clé) plutôt que sur les ingrédients/étapes
  exhaustifs.
- **Séquence 4 "Scanner" (90 → 75 s)** : compression serrée, la
  séquence reste la plus longue du bloc car c'est le différenciateur.
- **Séquence 5 "Calculateur" (45 → 30 s)** : narration condensée.
- **Séquence 6 "Batch" (45 → 60 s)** : +15 s car on fusionne avec les
  stats archi de l'ancienne séquence 7 via l'overlay.
- **Séquence 7 "Marge + stats"** : **supprimée en tant que segment**,
  diluée dans l'overlay S10 pendant les séquences 4–6.
- **Séquence 8 "Transition" (60 → 60 s)** : inchangée, même texte
  légèrement ré-agencé (inclut maintenant le récap "6 mois / Scrum /
  6 sprints" qui était dans l'ex-séquence 7).

## Préparation technique pré-soutenance

### Dispositif téléphone

- **Téléphone démo dédié** (pas le perso), mode avion activé après
  seed, wifi manuel pour l'API mobile.
- **Luminosité 100 %** pour la captation mirror.
- **Notifications désactivées**, verrouillage auto désactivé.
- **Compte démo seedé** : 3 recettes nommées, 1 brassin timeline avec
  mesures, 2 bières de référence scannables.
- **Mirror testé** sur projecteur HDMI **avant chaque répétition**.

### Jeu de données démo reproductible

À produire en **commande Make** (`make seed-demo`) exécutée avant
chaque répétition :

- Utilisateur `demo@brasse-bouillon.fr` / mot de passe connu.
- Recettes : "IPA du dimanche", "Pale Ale session", "Stout d'hiver".
- Brassin "IPA-2026-03" avec 4 mesures de densité sur 2 semaines.
- Beer-encyclopedia pré-peuplée : 15 styles + 30 bières (dont 2
  testées scanner).

**⚠️ Ce seed est à produire dans un autre chat (dev). Ici on fait
rédaction uniquement.**

### Bières de test scanner

- **Bière A** : utilisée dans la saynète bloc 1 (code-barre pré-testé).
- **Bière B** : différente, pour la séquence 4 du bloc 3 (code-barre
  pré-testé).
- **Bière C** : backup si A ou B échoue.

### Vidéo backup — priorité P0

Fallback global du bloc 3 si l'API / le téléphone / le mirror tombent
pendant la démo :

1. Terminer la séquence en cours avec les données en mémoire (recettes
   et calculs offline).
2. Passer au calculateur ABV (séquence 5, zéro dépendance).
3. Si tout est HS : basculer sur **vidéo backup pré-enregistrée**
   (3 min encodée 1080p, à tourner avant **2026-05-20**, cf.
   [risk-analysis.md](risk-analysis.md) risque D1).

## Chiffres et sources

| Chiffre cité | Source | Statut |
|---|---|---|
| 97 tests automatisés | [audit-features-mvp.md](audit-features-mvp.md) | ✅ Sourcé |
| 8/11 features stables | [audit-features-mvp.md](audit-features-mvp.md) | ✅ Sourcé |
| CI GitHub Actions < 3 min | À vérifier dans `.github/workflows/ci.yml` | 🟡 À confirmer |
| 11 calculateurs brassicoles | [audit-features-mvp.md](audit-features-mvp.md) #4 | ✅ Sourcé |
| 15 styles seedés beer-encyclopedia | [PROJECT_LOG.md](../../../PROJECT_LOG.md) #544 | ✅ Sourcé |
| Recherche floue pg_trgm | [PROJECT_LOG.md](../../../PROJECT_LOG.md) #544 | ✅ Sourcé |
| 6 sprints exécutés | [sprint-definition.md](../../project-management/sprint-definition.md) | ✅ Sourcé |
| 10 tables beer-encyclopedia | [PROJECT_LOG.md](../../../PROJECT_LOG.md) #544 | ✅ Sourcé |
| Zéro `any` TypeScript | [CLAUDE.md](../../../CLAUDE.md) | ✅ Sourcé |

## Notes de direction scénique

- **Tenir le téléphone bas** pendant la démo pour que la caméra mirror
  capte bien — ne pas l'agiter.
- **Pointer avec le doigt** les éléments à l'écran mirror, en regardant
  alternativement le téléphone et le jury.
- **Respirer entre les séquences** — 1 s de pause signale la fin d'une
  fonctionnalité.
- **Éviter "voilà", "et donc", "du coup"** qui alourdissent un script
  déjà dense.
- **Bannir les jargons inutiles** : "JWT" OK (bref, vérifiable), mais
  pas "méthode POST à /auth/login".
- **Overlay S10** : Benoît pointe une fois du regard pendant la
  séquence 6 ("pendant que je vous montre ça, regardez l'écran") —
  permet au jury de lire les chiffres sans que le présentateur les
  énumère tous à l'oral.

## À arbitrer par le user

- [ ] Valider le parcours 5 min (Auth → Recette → Scanner B →
  Calculateur ABV → Timeline batch + overlay archi).
- [ ] Commander le jeu de données démo seedé dans l'autre chat (dev).
- [ ] Identifier les 3 bières test (A / B / C backup).
- [ ] Valider l'approche **overlay S10 permanent** vs **segment stats
  dédié** pour la narration Dev.
- [ ] Chronométrer une **vraie répétition** avant l'oral blanc du
  2026-05-06.
- [ ] Tourner la **vidéo backup** (fallback D1) avant **2026-05-20**.

## Prochaines étapes logiques

1. Répéter le bloc avec un proxy / tiers en public pour validation
   chrono (objectif : avant oral blanc 06/05).
2. Tourner la vidéo backup démo (J-7 ≤ 2026-05-20).
3. Intégrer l'accroche arbitrée (cf.
   [pitch-hook-variants.md](pitch-hook-variants.md)) dans le bloc 1.
