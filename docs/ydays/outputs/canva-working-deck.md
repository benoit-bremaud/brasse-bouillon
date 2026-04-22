# Deck Canva — fichier de travail 27 mai

**Finalité** : point d'entrée unique pour la production collaborative
du deck de soutenance du 2026-05-27. Cette page centralise les liens
d'édition (nouveau deck de travail) et de référence (ancien deck Ydays).

## Organisation Canva — dossier projet

Pour éviter que les decks se perdent dans les "Mes designs" de chacun,
on range les fichiers dans un **dossier Canva commun** :

- **Nom du dossier** : `Brasse-Bouillon — Soutenance Ydays`
- **Contenu** :
  - ancien deck Ydays (référence, lecture seule)
  - nouveau deck de travail S0-S14 (édition collaborative)
  - toute capture d'écran ou exports intermédiaires liés au deck

Note Canva : les **liens publics sont au niveau du design**, pas du
dossier. Les URLs ci-dessous pointent donc directement sur les
designs ; le dossier sert juste à retrouver les fichiers dans son
espace Canva personnel.

## Fichier de travail — soutenance 27 mai

- **URL Canva** : _à confirmer — vote en cours sur la mise en page (voir section ci-dessous)._
- **Accès final visé** : édition ouverte à toute personne ayant le lien.
- **Spec de contenu** : voir [Détail Canva S0-S14](canva-slides-detail.md).
- **Squelette 15 slides** : voir [Squelette du deck](slide-deck-outline.md).

## Vote équipe — choix de la mise en page

::: warning Deadline de vote : mercredi 2026-04-24 23h59
Vote sur Discord (thread dédié canal Ydays). Au-delà de cette date, les
previews côté Canva risquent d'expirer.
:::

Le 2026-04-22, Canva AI a généré **4 variations** du même deck à partir
de la spec S0-S14. **Même contenu textuel dans les 15 slides** ; seule
la mise en page change (typographie, alignements, couleurs d'accent,
choix d'icônes). On choisit la variation qu'on veut matérialiser comme
deck de travail définitif — l'équipe poursuivra ensuite l'édition
collaborative dessus.

| # | Preview Canva | Notes éventuelles |
|---|---|---|
| 1 | <https://www.canva.com/d/UVCLyhsVime9-Wp> | |
| 2 | <https://www.canva.com/d/DarT7uRYaEnQKIg> | |
| 3 | <https://www.canva.com/d/jEXQ-3wOAWbhThy> | |
| 4 | <https://www.canva.com/d/Dwvs2HKA7lsDbab> | |

### Comment voter

1. Ouvre les 4 previews dans 4 onglets (clic milieu sur chaque lien).
2. Compare visuellement — le contenu est identique, seule la forme
   change.
3. Vote sur le thread Discord dédié en mentionnant le numéro :
   `Vote : Candidat 3` (avec un mot d'argument bienvenu).
4. Une fois la deadline passée, le numéro le plus voté est matérialisé
   comme deck de travail définitif (URL d'édition publique partagée
   ici).

### Critères de jugement suggérés

- **Lisibilité à 5 m** : les titres et bullets sont-ils nets sur
  écran de salle ?
- **Charte cohérente** : couleurs, fond, polices accordés à
  l'identité Brasse-Bouillon (jaune doré, ardoise) ?
- **Hiérarchie visuelle** : titre dominant, puis bullets secondaires,
  pas de bouillie typographique ?
- **Densité** : pas plus de ~50 mots par slide, espace blanc
  respiré ?

::: info Hors scope du vote
Le contenu textuel des slides (titres, bullets) n'est PAS définitif —
il est issu d'un prompt brut. L'équipe l'affinera après matérialisation
en s'appuyant sur [canva-slides-detail.md](canva-slides-detail.md).
On vote sur la **forme**, pas sur le **fond**.
:::

## Référence — ancien deck Ydays

- **URL Canva** : <https://canva.link/5hbwq2wty8o8y3k>
- **Usage** : source d'inspiration pour charte graphique, logo,
  transitions déjà maîtrisées. À **ne pas modifier** — il documente
  l'historique de l'équipe.
- **À réutiliser en priorité** : brand kit (couleurs, polices),
  disposition des slides titres, éléments visuels Brasse-Bouillon.

## Mode d'édition collaborative

### Accès

Le lien du nouveau deck est réglé en **édition ouverte par lien**. Tout
membre de l'équipe (les 8 du projet) peut ouvrir, éditer, commenter.
Aucune invitation nominative n'est nécessaire.

### Précaution

Le lien est **public dans le même sens que ce site VitePress** : non
indexé par les moteurs de recherche, diffusé uniquement via Discord
interne. **Ne pas y coller** :

- e-mails personnels du coach ou du jury
- notes stratégiques sensibles (budgets réels, contrats, NDA)
- captures d'écran contenant des secrets (tokens, URLs prod, etc.)

Tout le reste du contenu est légitime à y voir (scripts, chiffres
sourcés, visuels produit).

## Comment contribuer

1. **Lire d'abord** [canva-slides-detail.md](canva-slides-detail.md)
   pour comprendre S0-S14, les contraintes de layout, la typographie.
2. **Ouvrir le Canva** via le lien de travail ci-dessus.
3. **Se réserver une slide** sur Discord avant de toucher (évite
   conflits d'édition).
4. **Appliquer la spec** titre + contenu + visuels comme décrit
   dans `canva-slides-detail.md`.
5. **Pinger sur Discord** quand une slide est prête pour relecture.

## Ordre de production recommandé

Priorité haute (chemin critique de la démo live) :

1. **S6-S9** — slides de démo (scanner → card bière → fiche détaillée)
   — ce sont les plus structurantes, elles cadrent la démo 5 min.
2. **S1** — slide titre saynète (impact premières secondes)
3. **S14** — CTA final (dernière image que garde le jury)

Priorité moyenne :

4. **S2-S5** — bloc 1 cadrage + bloc 2 avant brassage
5. **S10-S13** — bloc 4 après brassage + bloc 5 BM perspectives

Priorité basse (fonction d'enrobage, peuvent attendre l'oral blanc) :

6. **S0** — slide de garde saynète
7. **Slide de transition** éventuelle entre blocs

## Dépendances externes

- **Captures d'écran application mobile** (pré-requis S6, S7, S8, S9) :
  à produire avec 3 bières test A/B/C une fois le seed démo validé.
- **Vidéo backup démo** (non embarquée dans le deck, mais projetée
  en cas de panne) : deadline **2026-05-20** — cf.
  [risk-analysis.md](risk-analysis.md).
