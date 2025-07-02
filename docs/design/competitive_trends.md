# Etude concurrentielle

Voici un compte rendu complet, clair et concis de l’ensemble des informations présentes dans l’espace Brasse-Bouillon, couvrant à la fois l’analyse marché, la stratégie produit et la feuille de route design.

## 1. **Panorama du marché des applications de brassage**

- **Marché mature mais fragmenté** : Les solutions existantes se répartissent entre outils techniques avancés (Brewfather, BeerSmith) et plateformes communautaires/sociales (Untappd), sans qu’aucune ne combine efficacement gestion de recettes et engagement communautaire fort. Ce « gap » crée une opportunité majeure pour une plateforme intégrée, spécifiquement adaptée à l’écosystème craft européen.
- **Principaux acteurs et positionnements** :
  - **Brewfather** : Leader moderne, interface mobile-first, gestion avancée des recettes, synchronisation multi-appareils, intégration capteurs IoT, mais communauté limitée.
  - **BeerSmith** : Référence technique exhaustive, interface vieillissante, forte base installée, effet de lock-in, mais peu adaptée aux usages modernes et web.
  - **Brewers Friend** : Alternative économique, interface simple, large bibliothèque de recettes publiques, cible débutants/intermédiaires.
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

**En synthèse :**
Brasse-Bouillon s’inscrit dans une dynamique de rupture, visant à combler le fossé entre outils techniques et communautés craft, en misant sur l’intégration technologique (IA, AR, IoT), l’accessibilité universelle et une identité visuelle forte, structurée autour d’une roadmap design rigoureuse et itérative.
