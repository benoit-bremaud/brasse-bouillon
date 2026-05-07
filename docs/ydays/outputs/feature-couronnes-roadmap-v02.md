# Feature Couronnes — gamification communautaire (roadmap v0.2+)

**Finalité** : capturer la mécanique de gamification BB (système de monnaie virtuelle « Couronnes ») en synthèse pour le pitch S13 quadrant Perspectives produit. Source canonique : **épique GitHub #739** + sub-discussion session Claude Code 2026-05-02 (1622cb0f).

**Statut** : feature roadmap v0.2+, **non incluse dans le MVP v0.1** soutenance. Mention possible en S13 comme levier post-MVP différenciant.

---

## Pourquoi « Couronnes »

- **Terme métier brassicole** — *capsule couronne* (crown cap) est le terme exact dans tous les catalogues fournisseurs (BJCP, brasseries pros). Dès qu'on dit « Couronne » à un brasseur amateur, il voit la capsule.
- **Connotation prestigieuse** — « couronner = récompenser », identité 100 % française, éloignée des clichés Fallout (caps).
- **Champ lexical exploitable** : *gagner ses couronnes*, *décapsuler un avantage*, *couronner un contributeur*, *les couronnés du mois*, *trésor de couronnes*.

## Flow utilisateur — invitation dégustation post-brassage

Le scénario que Brasse-Bouillon formalise (et qui n'existe nulle part sur le marché) :

```
1. Brasseur (A) termine sa bière depuis une recette communautaire
   → +25 couronnes pour A
   → +10 couronnes pour l'auteur de la recette

2. A invite des amis à la dégustation via l'app BB
   (envoi d'une invitation native — push + email)

3. Les invités arrivent. Deux modes de retour disponibles :
   (a) Mode app — l'invité scanne un QR code, ouvre BB, remplit un
       formulaire interactif 4 axes (Goût / Difficulté perçue /
       Coût estimé / Fidélité au style)
   (b) Mode papier — A imprime des formulaires papier. Les invités
       remplissent au stylo. A scanne ensuite chaque formulaire
       avec BB (OCR), les retours sont rapatriés dans l'app

4. Chaque review validée donne :
   → +10 couronnes à l'invité (rétribution de son temps)
   → contribue au scoring de la recette communautaire
   → enrichit le profil dégustation de A

5. Si la recette atteint M reviewers (M = seuil de validation, à caler) :
   → l'auteur de la recette gagne +100 couronnes (publication validée)
   → la recette devient « certifiée communauté »
```

## Économie — barème acté #739 Round 3.5

| Activité | Couronnes |
|---|---|
| Soumission de bière validée (catalogue beer-encyclopedia) | 50 |
| Review de recette 4 axes (Goût/Difficulté/Coût/Fidélité au style) | 10 |
| Publication de recette validée par M+ reviewers | 100 |
| Brassin terminé depuis recette communautaire | 25 brasseur + 10 auteur |

## Boutique — 4 niveaux roadmap

| Niveau | Contenu | Roadmap |
|---|---|---|
| 1 | Réduction partenaires LHBS / brasseries | v0.2-v0.3 |
| 2 | Contenu premium (recettes exclusives, masterclasses) | v0.3 |
| 3 | Goodies physiques (chopes, tabliers, kit) | v0.3-v0.4 |
| 4 | Moonshot blockchain/NFT — collections de couronnes rares | v0.4+ |

## Anti-abus

- **Plafond mensuel** d'attribution couronnes — éviter le farm
- **Non-transférable** — les couronnes restent attachées au compte
- **Expiration après 12 mois d'inactivité** — incite au retour régulier
- **Modération** — chaque review valide a un poids dans le scoring (anti-spam)

## Schéma BDD acté #739

Trois tables côté API NestJS :

- `user_credits` — solde courant par utilisateur
- `credit_transactions` — historique d'attribution / dépense (audit trail)
- `shop_redemptions` — table de jonction avec le catalogue boutique

**Règle architecturale** : tout calcul d'attribution vit côté API (ADR-0002, jamais dans le bundle mobile). Tracker un comportement utilisateur pour octroyer des couronnes nécessite **consentement explicite** (ADR-0003 — consent comme source de vérité).

## Garde-fous réglementaires

⚠️ Si les couronnes deviennent **convertibles en valeur monétaire** (réductions chez brasseries partenaires, dons, échange), on bascule dans le **réglementaire financier** (loi monnaies électroniques française, CGU spécifiques). À anticiper dès la conception, pas à la mise en production.

## Épiques satellites cohérents

- **[Épique #739](https://github.com/benoit-bremaud/brasse-bouillon/issues/739)** — User-generated recipes : publication, ratings, badges, credit economy (épique mère)
- **[Épique #803](https://github.com/benoit-bremaud/brasse-bouillon/issues/803)** — Scan Panoramique Intelligent (le flow de contribution catalogue qui rapporte 50 couronnes)
- **[Épique #849](https://github.com/benoit-bremaud/brasse-bouillon/issues/849)** — AI-research importer + double-validation human + community

## Mention dans le pitch — slide S13 quadrant Perspectives produit

À intégrer dans le bloc 5 BM + Perspectives — quadrant Perspectives v0.2+ :

> *« v0.2+ : système de monnaie virtuelle "Couronnes" — capsule couronne, terme métier brassicole. L'utilisateur gagne des Couronnes en contribuant : soumission de bières au catalogue (+50), review de recettes 4 axes (+10), publication recette validée (+100), brassin terminé (+25). Flow signature : invitation à la dégustation post-brassage, formulaire interactif ou OCR papier, retour 4 axes des invités → couronnes pour tout le monde + scoring recette. Boutique 4 niveaux pour les dépenser : réductions LHBS, contenu premium, goodies, moonshot blockchain. Économie communautaire native, transforme l'app en lieu de partage et pas seulement en outil. »*

## À consolider plus tard

- Choix du seuil M de reviewers pour valider une recette publiée
- Plafond mensuel exact d'attribution couronnes
- Tarification boutique niveau 1 (combien de couronnes = X € de réduction LHBS)
- Sound design + animation visuelle de la capsule (micro-interaction)
- Mock-ups UI : formulaire interactif 4 axes / formulaire papier OCR / balance display couronnes / boutique
- Cadre juridique précis si bascule en monnaie électronique (loi française)

---

## Liens

- [Épique #739](https://github.com/benoit-bremaud/brasse-bouillon/issues/739) — épique mère credit economy
- Session Claude Code 2026-05-02 (`1622cb0f`) — naming "Couronnes" + champ lexical
- [retention-levers.md](retention-levers.md) — leviers de rétention complémentaires (Couronnes = Levier 8 streaks/achievements amplifié)
- [audit-decisions-2026-05-05.md](audit-decisions-2026-05-05.md) — décisions soutenance, item nouveau Domaine 18
- [pitch-script-bloc5-bm-perspectives.md](pitch-script-bloc5-bm-perspectives.md) — script bloc 5 (à mettre à jour S13 Perspectives produit)
- [slide-deck-outline.md](slide-deck-outline.md) — S13 quadrant Perspectives

---

**Dernière mise à jour** : 2026-05-05 — création initiale (extraction depuis chat history session 2026-05-02 + épique #739).
