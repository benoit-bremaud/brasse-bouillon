# Stratégie IA — soutenance 27 mai 2026

**Finalité** : matière pour le bloc 5 (BM + Perspectives) et défense de la
viabilité technique du Pro tier. Identifie l'IA comme **différenciateur
produit majeur** vs Brewfather Plus AI (EN-only) et **investissement
stratégique principal** du solo dev pour démultiplier la productivité.

**Sources** : [competitive-deep-dive.md](competitive-deep-dive.md) (positionnement
Brewfather Plus AI), [personas-monetization.md](personas-monetization.md)
(use cases par persona).

## Pourquoi l'IA dans Brasse-Bouillon

### Trois rôles stratégiques

1. **Différenciateur produit** — face à Brewfather Plus (AI EN seulement) et
   au reste du marché qui n'a pas d'AI, Brasse-Bouillon propose un assistant
   FR natif avec water profiles France et souveraineté EU.
2. **Démultiplicateur productivité solo dev** — les agents IA permettent au
   fondateur de produire seul ce qui demanderait normalement une équipe
   (design, copy, recherche, code).
3. **Levier de monétisation Pro tier** — l'AI est l'argument premium qui
   justifie le passage de Premium 2,99 €/mo à Pro 5,99 €/mo pour les
   utilisateurs experts.

### Différenciation vs Brewfather Plus AI

| Aspect | Brewfather Plus AI | Brasse-Bouillon AI FR |
|---|---|---|
| Langue | EN seulement | **FR natif** |
| Water profiles | Standard international | **Profils eau France par région** |
| Vocabulaire brassicole | BJCP EN | **BJCP FR + jargon français** |
| Conformité data | Norvège (hors UE) | **France/UE souveraine** |
| Coût utilisateur | 49 €/an inclus Plus | Inclus Pro 49,99 €/an |

## Use cases AI par persona

### Léa la Curieuse — AI vulgarisateur

| Use case | Valeur |
|---|---|
| « Qu'est-ce que l'IBU ? Explique simplement » | Onboarding accessible |
| « Je veux brasser une bière simple, blonde, fruitée » | Première recette assistée |
| « Aide-moi à comprendre les étapes » | Réassurance pédagogique |

**Tier** : Free (5-10 requêtes/mois max anti-abuse)

### Nicolas le Débutant — AI assistant pratique

| Use case | Valeur |
|---|---|
| « Pourquoi ma bière a ce goût bizarre ? » | Diagnostic problèmes courants |
| « Quel houblon pour remplacer le Centennial ? » | Substitution ingrédients |
| « Adapter cette recette de 20 L à 10 L » | Scaling automatique |
| « Comment améliorer cette recette ? » | Conseils progression |

**Tier** : Premium (50 requêtes/mois)

### Claire l'Amatrice Créative — AI co-créatrice

| Use case | Valeur |
|---|---|
| « Crée-moi une recette saison avec fruits » | Création créative |
| « Cette recette colle au style BJCP X ? » | Validation style |
| « Décris cette bière à partir de la photo » | Vision + analyse |
| « Variantes possibles de cette recette » | Exploration |

**Tier** : Premium → Pro (50 → 200 requêtes/mois)

### Zoé la Brasseuse Éco-responsable — AI durabilité

| Use case | Valeur |
|---|---|
| « Empreinte carbone de ce brassin ? » | Calcul impact |
| « 3 recettes avec mes drêches » | Valorisation déchets |
| « Ingrédients bio/locaux pour cette recette ? » | Substitution éthique |

**Tier** : Premium (50/mois)

### Marc le Brasseur Expert — AI co-pilote technique

| Use case | Valeur |
|---|---|
| « Avec eau de Lille (composition X), comment brasser stout ? » | Water chemistry expert |
| « Pourquoi fermentation arrêtée à 1.020 ? » | Diagnostic complexe |
| « Compare ces 2 levures pour saison » | Analyse comparative |
| « Optimise ce mash schedule pour atteindre 1.085 OG » | Calculs avancés |

**Tier** : Pro (500 requêtes/mois)

## Comparatif des stacks AI

| Provider | Modèles principaux | Hosting | FR natif | Coût | Argument souveraineté |
|---|---|---|---|---|---|
| **Mistral AI** | Mistral Large 2, Codestral, Pixtral, Ministral | **France 🇫🇷** | ✅ excellent | ~0,40-2 $/M tokens | **Argument fort, EU + FR** |
| **Anthropic Claude** | Haiku 4.5, Sonnet 4.6, Opus 4.7 | USA | ✅ très bon | 0,25-15 $/M tokens | Pas EU |
| **OpenAI** | GPT-4o, GPT-4o-mini, o1 | USA | ✅ bon | 0,15-15 $/M tokens | Pas EU |
| **Google Gemini** | Gemini Pro, Flash | USA | ✅ bon | 0,075-5 $/M tokens | Pas EU |

### Recommandation initiale

**Mistral AI** comme provider principal pour deux raisons :

1. **Souveraineté** : Mistral est la seule option qui aligne hosting EU,
   entreprise française, modèles multilingues FR de très haute qualité
2. **Cohérence brand** : « L'app FR brassicole qui utilise l'IA FR » est un
   argument marketing puissant, cohérent avec l'axe différenciation #3
   (souveraineté data EU + RGPD natif)

**Anthropic Claude** en backup pour cas complexes (water chemistry précise)
si Mistral montre des limites lors des tests préliminaires.

**Risque Mistral** : moins éprouvé que Claude/GPT-4 sur certaines tâches
techniques très pointues. **Mitigation** : tester avec prompts brassicoles
concrets avant commitment final.

## Économie unitaire AI

Estimation par requête : 1k tokens in + 500 tokens out ≈ 0,005-0,02 $.

| Tier | Requêtes/mois | Coût AI/utilisateur | Sur prix mensuel | Marge brute |
|---|---|---|---|---|
| Free | 5-10 | 0,10-0,20 $ | 0 € | -0,20 $ (perte assumée acquisition) |
| Premium 2,99 €/mo | 50 | 0,50-1,00 $ | 2,99 € | ~2 € |
| Pro 5,99 €/mo | 500 | 2-5 $ | 5,99 € | ~3-5 € |

→ Le **tier Pro reste rentable** même avec AI heavy. Le free tier perd un peu
mais c'est un coût d'acquisition acceptable.

## Roadmap d'intégration produit

| Phase produit BB | Feature AI | Effort | Priorité |
|---|---|---|---|
| **Phase 4** | AI conversationnel FR de base (Q&R brassage) | Moyen | ⭐⭐⭐ |
| **Phase 5** | AI water chemistry FR + diagnostic fermentation | Élevé | ⭐⭐ |
| **Phase 6+** | AI personnalisé (apprend tes goûts, suggère recettes ciblées) | Très élevé | ⭐ |

### MVP AI minimal (Phase 4)

- Endpoint chat conversationnel
- Rate limiting par tier
- Disclaimer « L'AI peut se tromper, valide avec un brasseur expérimenté »
- Logging anonymisé pour amélioration prompts
- A/B test Mistral vs Claude pour qualité réponses brassicoles

## Risques et garde-fous

| Risque | Mitigation |
|---|---|
| **Hallucinations** sur cas pointus (water chemistry précis, calculs avancés) | Disclaimer obligatoire + validation possible par mentor humain à terme |
| **Coûts API variables** (peut exploser si abus) | Rate limiting strict par tier + monitoring + alertes coût |
| **Évolution rapide modèles** | Architecture flexible (changer de modèle facile) |
| **Conformité RGPD** | Anonymisation des prompts utilisateur avant envoi APIs |
| **Dépendance fournisseur unique** | Backup Anthropic Claude si Mistral ne suffit pas |

## Synthèse pour défense soutenance

3 messages clés extractibles slide :

1. **Différenciateur stratégique** : seule app brassicole FR avec AI FR
   souveraine (Mistral), face à Brewfather Plus AI EN seulement.
2. **Économie unitaire viable** : Pro tier reste rentable avec ~500 requêtes
   AI/mois (~3-5 € marge brute par utilisateur Pro).
3. **Approche progressive** : MVP AI conversationnel en Phase 4, water
   chemistry FR en Phase 5, personnalisation en Phase 6+. Roadmap réaliste
   pour un solo dev.
