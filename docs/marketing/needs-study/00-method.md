# Étude des besoins marketing — Méthode

## Pourquoi cette étude existe

Aucune étude formelle des besoins utilisateurs n'avait jamais été menée pour Brasse-Bouillon. Avant
d'investir davantage dans les fonctionnalités et le positionnement, nous menons une véritable étude
des besoins marketing afin d'identifier ce que les brasseurs amateurs intermédiaires veulent
réellement, de valider (ou d'écarter) notre hypothèse différenciante, et d'ancrer les décisions
produit dans des preuves plutôt que dans des suppositions.

## Cadre stratégique (décidé lors du débrief de lancement)

- **Cible principale (tête de pont) :** brasseurs amateurs réguliers / intermédiaires ; international /
  anglophones d'abord, le français étant également dans le périmètre.
- **Langue du produit :** bilingue FR + EN (ce qui implique un effort d'i18n suivi comme un epic distinct).
- **Hypothèse de positionnement :**
  - **Accroche (hero) :** une communauté pour cloner et partager des recettes de bière.
  - **Socle (table-stakes) :** organisation des recettes + suivi du brassage / de la fermentation.
- **Canaux de départ (2) :** r/Homebrewing (utilisateurs) + Indie Hackers (fondateur en build-in-public) ;
  LinkedIn conservé en français pour le récit de reconversion du fondateur.

## Conception de la recherche

Deux phases, du moins coûteux au plus coûteux :

1. **Recherche secondaire (desk research) — FAIT.** Exploiter ce qui existe déjà publiquement : avis sur
   les applications concurrentes, Reddit, forums de brassage amateur. Peu coûteux, rapide, générateur
   d'hypothèses.
2. **Recherche primaire — À FAIRE.** Parler à de vrais brasseurs : un guide d'entretien structuré
   (via le skill `customer-research`) + 10-15 entretiens pour confirmer ou infirmer les conclusions du desk research.

L'ordre compte : le secondaire d'abord pour construire des hypothèses, le primaire ensuite pour confirmer auprès de vraies personnes.

## Exécution de la recherche secondaire

Six passes de desk research à travers des familles de sources :

- `01-desk-competitors.md` — avis sur Brewfather, BeerSmith, Brewer's Friend, BrewBuddy et applications adjacentes.
- `02-desk-reddit.md` — questions et points de douleur récurrents sur r/Homebrewing.
- `03-desk-forums.md` — HomeBrewTalk (EN) + brassageamateur.com (FR).
- `03b-desk-french.md` — passe dédiée en langue française (blogs FR, outils, canaux communautaires).
- `03c-desk-market-data.md` — couche quantitative (taille du marché, téléchargements, taille des bases de recettes, concurrents non couverts).
- `03d-desk-french-market.md` — passe en boule de neige sur la population / le marché français des brasseurs amateurs (comble le manque de données FR).
- `04-synthesis.md` — carte consolidée des besoins + contexte marché + énoncé de positionnement en une phrase.
- `05-interview-guide.md` — instrument de recherche primaire bilingue (guide d'entretien JTBD).
- `06-report.md` — rapport final (livrable de clôture de l'epic ; rédigé après la recherche primaire).

## Limites de la méthode (à lire avant de faire confiance aux chiffres)

- **Reddit et HomeBrewTalk bloquent la récupération automatisée (HTTP 403).** Les conclusions sur
  r/Homebrewing sont *déduites* de forums adjacents et de la prévalence des compilations de recettes de
  clones, et non de lectures directes de fils ou de comptages de votes. Les conclusions sur HomeBrewTalk
  reposent sur des extraits de résultats de recherche. brassageamateur.com a été récupéré directement.
- **Les signaux de fréquence sont qualitatifs** (récurrence de fils / avis distincts), et non des comptages
  scrapés. Traitez les classements comme indicatifs.
- **Les forums sur-représentent les personnes qui sont bloquées** — un puissant générateur d'hypothèses,
  pas une preuve. C'est exactement pourquoi la recherche primaire (entretiens) suit.
- Pour consolider : lire un échantillon de fils r/Homebrewing via un accès authentifié / API et taguer les
  publications par thème pour obtenir de vrais comptages.

## Statut

- Recherche secondaire : terminée (consignée dans `01`–`03d`, consolidée dans `04`).
- Recherche primaire : non commencée.
- Rapport final : non commencé.
