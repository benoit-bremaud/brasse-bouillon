# Etude concurrentielle

**Dernière mise à jour** : 2026-04-30 (intégration intel pricing Brewer's Friend, voir §5).

Voici un compte rendu complet, clair et concis de l’ensemble des informations présentes dans l’espace Brasse-Bouillon, couvrant à la fois l’analyse marché, la stratégie produit et la feuille de route design.

## 1. **Panorama du marché des applications de brassage**

- **Marché mature mais fragmenté** : Les solutions existantes se répartissent entre outils techniques avancés (Brewfather, BeerSmith) et plateformes communautaires/sociales (Untappd), sans qu’aucune ne combine efficacement gestion de recettes et engagement communautaire fort. Ce « gap » crée une opportunité majeure pour une plateforme intégrée, spécifiquement adaptée à l’écosystème craft européen.
- **Principaux acteurs et positionnements** :
  - **Brewfather** : Leader moderne, interface mobile-first, gestion avancée des recettes, synchronisation multi-appareils, intégration capteurs IoT, mais communauté limitée.
  - **BeerSmith** : Référence technique exhaustive, interface vieillissante, forte base installée, effet de lock-in, mais peu adaptée aux usages modernes et web.
  - **Brewer's Friend** : Alternative économique freemium structurée en 3 tiers payants (Premium $36/an, Premium Plus $120/an, Premium Pro $540/an — voir §5 pour le détail). Free tier restrictif (impossible de supprimer ses propres recettes, pubs présentes). Premium d'entrée n'inclut **pas** les recettes illimitées (gated derrière Premium Plus). Premium Pro = vrai segment B2B brasseries (multi-user, tank tracking, split batches). Cible historique débutants/intermédiaires, mais escalade vers les pros via le tier supérieur.
  - **Untappd** : Domine l’aspect social (11M d’utilisateurs), gamification, influence directe sur les ventes, mais aucune gestion de recettes.
  - **Grainfather** : Intégration verticale matériel-logiciel, solution gratuite mais limitée à l’écosystème propriétaire.
  - **Tilt, iSpindel, PLAATO** : Innovations hardware pour le suivi de fermentation en temps réel, adoption freinée par le coût et la complexité technique.
- **Forces et faiblesses stratégiques** :
  - Aucun acteur ne combine gestion technique complète et communauté engagée.
  - L’accessibilité (UX, langues, vocal, etc.) reste un point faible généralisé.
  - L’intégration d’IA, de réalité augmentée (AR) et de modèles économiques alternatifs (marketplace ingrédients, collaboration) est quasi inexistante.

## 2. **Tendances design et technologiques 2023-2025**

- **Expérience utilisateur** :
  - **Mobile-first** et synchronisation web deviennent la norme.
  - **Contrôle vocal et interfaces multi-modales** (voix, gestes) répondent aux besoins mains-libres en cuisine/brassage.
  - **Mode sombre** généralisé pour économie d’énergie et confort visuel.
  - **Micro-interactions et gamification** (badges, leaderboards) renforcent l’engagement communautaire, à l’image du succès d’Untappd.
- **Technologies émergentes** :
  - **IA personnalisée** : Recommandations, prédiction de résultats, assistance à la formulation de recettes.
  - **Réalité augmentée** : Reconnaissance d’ingrédients, visualisation de profils aromatiques, assistance immersive au brassage.
  - **Marketplace intégrée** : Ingrédients locaux, matériel d’occasion, économie circulaire.
- **Accessibilité** :
  - Interfaces adaptatives, contraste élevé, lecture vocale, respect des normes WCAG dès le MVP.

## 3. **Feuille de route et livrables design Brasse-Bouillon**

Le plan de développement de la charte graphique Brasse-Bouillon est structuré par phases (CG0 à CG6), chacune avec des objectifs, tâches et livrables précis :


| Phase | Objectifs principaux | Livrables attendus |
| :-- | :-- | :-- |
| **CG0** | Définir la structure du plan, organiser les jalons, valider avec l’équipe | docsdesigncgplan.md |
| **CG1** | Identifier piliers identitaires, cible, analyse concurrence, contraintes techniques | Synthèse valeurs, analyse concurrence, moodboard refs |
| **CG2** | Collecte inspirations visuelles, choix palettes, typographies, direction iconographique | Moodboard, validation direction artistique |
| **CG3** | Création/refonte logo, choix définitif couleurs/typos, définition styles UI | Logos SVG/PNG, palettes, guides typo, composants UI |
| **CG4** | Définir les écrans clés, wireframes low-fidelity, mapping des parcours utilisateurs | wireframes.png, wireframesREADME.md |
| **CG5** | UI Kit Figma, maquettes haute fidélité, variantes dark/light, export des assets | ui-kit.figma, mockups.fig/png, assets exportés |
| **CG6** | Finalisation documentation, guidelines dev, validation assets, archivage versionné | chartegraphique.md, styleguide.md, docsdesignassets |

- **Livrables majeurs** :
  - Documentation complète (roadmap, guidelines, styleguide)
  - Identité visuelle (logos, palettes, typographies)
  - UI Kit et composants réutilisables
  - Wireframes et maquettes haute fidélité
  - Assets prêts pour intégration frontend

## 4. **Recommandations stratégiques et positionnement optimal**

- **Fusion technique-social** : Première plateforme européenne alliant designer de recettes intuitif, suivi IoT temps réel et communauté craft géolocalisée.
- **Accessibilité native** : Contrôle vocal, interface adaptable, support multilingue.
- **Marketplace européen** : Ingrédients locaux, matériel d’occasion, économie circulaire.
- **IA éducative** : Assistant brassage intelligent, badges d’apprentissage, prédiction de résultats.
- **Intégration IoT ouverte** : API flexible pour capteurs de fermentation et extensions partenaires.

## 5. **Mise à jour pricing concurrents — avril 2026**

> **Source** : capture utilisateur du 2026-04-30, page pricing officielle Brewer's Friend (`brewersfriend.com/pricing/`).

### 5.1 — Brewer's Friend, structure tarifaire détaillée

Brewer's Friend a structuré son offre payante en **3 tiers**, avec un fort différentiel de prix entre le tier d'entrée et le tier B2B brasseries.

| Tier | Prix mensuel (sans discount) | Prix mensuel annualisé | Total annuel | Cible |
| :-- | :-- | :-- | :-- | :-- |
| **Premium** | $5/mo | **$3/mo** | $36/an (~33 €) | Hobby brewers (entrée de gamme) |
| **Premium Plus** | $15/mo | **$10/mo** | $120/an (~110 €) | Expert homebrewers |
| **Premium Pro** | $50/mo | **$45/mo** | $540/an (~495 €) | Brasseries professionnelles |

Discount annuel affiché : **« Save up to 40 % »** entre tarif mensuel sans engagement et tarif annuel équivalent.

### 5.2 — Features par tier

**Premium ($36/an)** — entrée de gamme, étonnamment léger :

- Ability to Delete Recipes & Brews ⚠️ (le free tier ne permet **pas** de supprimer ses propres recettes)
- No Advertising (le free a des pubs)
- Tilt & iSpindel Integration
- Join Plus/Pro Groups by Invite
- Premium Support

**Premium Plus ($120/an)** — mid-tier avec déverrouillage des limites volumétriques :

- All Premium features
- **Unlimited Recipes** + **Unlimited Brews**
- Creating Brewer Groups
- Device Notifications & Fermentation Alerts
- Recipe Versioning (jusqu'à 25 versions)
- Priority Support

**Premium Pro ($540/an)** — segment B2B brasseries :

- All Premium and Premium Plus features
- Multiple user recipe editing and recipe versions
- Multiple user inventory management
- Tank tracking with status and clean history
- Support for Split Batches, Double Batches, etc.
- Recipe Versioning (jusqu'à 100 versions)

### 5.3 — Implications pour Brasse-Bouillon

1. **Notre Premium 2,99 €/mo avec recettes illimitées** est plus généreux que leur Premium $3/mo qui ne donne pas l'illimité. **Avantage concurrentiel** à valoriser dans la copy site/store.
2. **Notre Pro 5,99 €/mo se positionne face à leur Premium Plus $10/mo**, en proposant en plus AI assistant FR, souveraineté EU et import BeerXML qu'ils n'ont pas.
3. **Un futur tier B2B brasseries** (ex. 25-50 €/mo) calé sur leur Premium Pro est à mettre au backlog stratégie long terme (Phase 6+ produit).
4. **Discount annuel 30 %** retenu pour Brasse-Bouillon peut-être à reconsidérer — Brewer's Friend va jusqu'à 40 %, c'est l'attente du marché.
5. **Free tier sans suppression de recettes** = anti-pattern UX à éviter formellement chez Brasse-Bouillon. Notre free tier doit toujours permettre à l'utilisateur de gérer (et supprimer) ses propres données, conformément à l'esprit RGPD et à la valeur « pas de paywall agressif sur les essentiels ».

**En synthèse :**
Brasse-Bouillon s’inscrit dans une dynamique de rupture, visant à combler le fossé entre outils techniques et communautés craft, en misant sur l’intégration technologique (IA, AR, IoT), l’accessibilité universelle et une identité visuelle forte, structurée autour d’une roadmap design rigoureuse et itérative.
