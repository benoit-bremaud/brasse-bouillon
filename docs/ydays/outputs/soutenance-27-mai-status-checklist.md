# Checklist de statut — soutenance du 27 mai 2026

**Finalité** : transformer la masse documentaire `docs/ydays/` en
tableau de pilotage simple pour savoir, à date, ce qui est :

- **fait** ;
- **à faire en priorité** ;
- **important mais non bloquant** ;
- **hors périmètre critique**.

## Lecture rapide

### État global

La préparation est **très avancée sur le fond**, mais **pas encore
verrouillée sur l'exécution**.

**Bilan synthétique** :

- **Fond / stratégie / contenu** : majoritairement prêt
- **Exécution réelle** : encore incomplète
- **Risque principal** : soutenance bien pensée mais insuffisamment
  matérialisée / répétée

### Verdict opérationnel

**Non, la soutenance n'est pas "finie"** au sens exécutable.

Pour considérer la soutenance comme réellement prête, il faut au
minimum :

1. demander aux profs / coachs un créneau de **pré-présentation / oral blanc** le **2026-05-06** ;
2. produire le deck Canva réel ;
3. verrouiller la démo live 5 min ;
4. tourner la vidéo backup ;
5. faire au moins une répétition complète chronométrée ;
6. fermer les derniers arbitrages CTA / QR / repo / logistique.

## 1. Ce qui est déjà fait

### 1.1 Cadrage et architecture de la soutenance

- [x] Format officiel **30 min pitch + 10 min Q&A** documenté
- [x] Salle, catégorie et logique générale de la soutenance fixées
- [x] Découpage macro en 6 blocs stabilisé
- [x] Place de la démo compressée à **5 minutes** intégrée au plan
- [x] USP live retenue : **scanner code-barre**
- [x] `beer-label-ai` relégué en R&D / perspectives seulement

**Sources** :

- [README.md](../README.md)
- [plan-presentation-27-mai.md](plan-presentation-27-mai.md)

### 1.2 Pitch, scripts et défense

- [x] Scripts bloc 1 à 6 rédigés
- [x] Transitions rédigées
- [x] Q&A anticipées consolidées et durcies
- [x] Différenciation concurrence clarifiée
- [x] Narration studio web intégrée dans les perspectives

**Sources** :

- [pitch-script-bloc1-cadrage.md](pitch-script-bloc1-cadrage.md)
- [pitch-script-bloc2-avant-brassage.md](pitch-script-bloc2-avant-brassage.md)
- [pitch-script-bloc3-demo-live.md](pitch-script-bloc3-demo-live.md)
- [pitch-script-bloc4-apres-brassage.md](pitch-script-bloc4-apres-brassage.md)
- [pitch-script-bloc5-bm-perspectives.md](pitch-script-bloc5-bm-perspectives.md)
- [pitch-script-bloc6-conclusion.md](pitch-script-bloc6-conclusion.md)
- [pitch-transitions.md](pitch-transitions.md)
- [pitch-anticipated-qa.md](pitch-anticipated-qa.md)

### 1.3 Risques, critères et preuves

- [x] Grille Pitch Entrepreneurial archivée
- [x] Résumé coach 2026-03-25 archivé
- [x] Matrice de risques produite
- [x] Audit MVP produit / démo rédigé
- [x] BMC et SMART de soutien disponibles
- [x] Landing `brasse-bouillon.com` identifiée comme base réelle

**Sources** :

- [references/grille-pitch-entrepreneurial.md](../references/grille-pitch-entrepreneurial.md)
- [references/2026-03-25_coach-session-summary.md](../references/2026-03-25_coach-session-summary.md)
- [risk-analysis.md](risk-analysis.md)
- [audit-features-mvp.md](audit-features-mvp.md)
- [business-model-canvas.md](business-model-canvas.md)
- [smart-objectives-par-pole.md](smart-objectives-par-pole.md)

## 2. Chemin critique — à faire en priorité

Ces tâches conditionnent directement la qualité ou la sécurité de la
soutenance. Tant qu'elles ne sont pas traitées, la préparation ne peut
pas être considérée comme verrouillée.

| Priorité | Tâche | Statut | Deadline cible | Pourquoi c'est critique | Source |
|---|---|---|---|---|---|
| P0 | Demander aux profs / coachs un créneau de pré-présentation / oral blanc | À faire | **2026-05-06** | Point de contrôle majeur avant J-21 | [plan-presentation-27-mai.md](plan-presentation-27-mai.md), [risk-analysis.md](risk-analysis.md) |
| P0 | Produire le deck Canva réel S0-S14 | À faire | avant répétition complète | Sans slides réelles, impossible de répéter sérieusement | [canva-slides-detail.md](canva-slides-detail.md) |
| P0 | Verrouiller le parcours démo 5 min | À faire | avant oral blanc | La démo est une partie centrale de la note | [pitch-script-bloc3-demo-live.md](pitch-script-bloc3-demo-live.md) |
| P0 | Obtenir / valider le seed de démo | À faire | avant répétition démo | Réduit fortement le risque D7 | [pitch-script-bloc3-demo-live.md](pitch-script-bloc3-demo-live.md) |
| P0 | Choisir les bières test A / B / C | À faire | avant répétition démo | Réduit le risque scanner D2 | [pitch-script-bloc3-demo-live.md](pitch-script-bloc3-demo-live.md) |
| P0 | Tourner la vidéo backup | À faire | **2026-05-20** max | Exigence coach + mitigation D1 | [README.md](../README.md), [risk-analysis.md](risk-analysis.md) |
| P0 | Faire une répétition complète chrono | À faire | avant oral blanc | Réduit le risque C3 (dépassement) | [risk-analysis.md](risk-analysis.md) |
| P0 | Valider l'hébergement backend (Klouders A / Fly.io B activable) | En cours | **2026-05-20** | La démo live suppose une API joignable depuis internet | [hosting-strategy.md](hosting-strategy.md) |

## 3. Tâches importantes mais non encore fermées

Ces tâches ne sont pas toutes bloquantes individuellement, mais elles
font perdre en crédibilité, fluidité ou qualité perçue si elles restent
ouvertes trop tard.

| Priorité | Tâche | Statut | Commentaire | Source |
|---|---|---|---|---|
| P1 | Sourcer ou remplacer le chiffre "10 millions" | Ouvert | Ne pas garder un big number fragile | [pitch-script-bloc1-cadrage.md](pitch-script-bloc1-cadrage.md), [canva-slides-detail.md](canva-slides-detail.md) |
| P1 | Identifier le binôme P1/P2 de la saynète | Ouvert | Impact direct sur l'ouverture | [plan-presentation-27-mai.md](plan-presentation-27-mai.md), [pitch-hook-saynete-storyboard.md](pitch-hook-saynete-storyboard.md) |
| P1 | Trancher l'overlay S10 vs segment stats dédié | Ouvert | Impacte la narration de la démo | [pitch-script-bloc3-demo-live.md](pitch-script-bloc3-demo-live.md) |
| P1 | Confirmer que la timeline batch est démontrable | Ouvert | Point de crédibilité du bloc 4 | [pitch-script-bloc4-apres-brassage.md](pitch-script-bloc4-apres-brassage.md) |
| P1 | Valider les formulations sensibles bloc 5 | Ouvert | Notamment "pas un plan B", "pas de prétexte" | [pitch-script-bloc5-bm-perspectives.md](pitch-script-bloc5-bm-perspectives.md) |
| P1 | Trancher la cible du QR code final | Ouvert | `brasse-bouillon.com/jury` ou README GitHub | [pitch-script-bloc6-conclusion.md](pitch-script-bloc6-conclusion.md), [canva-slides-detail.md](canva-slides-detail.md) |
| P1 | Valider visibilité du repo au 27/05 | Ouvert | Public vs privé | [canva-slides-detail.md](canva-slides-detail.md) |
| P1 | Confirmer l'URL LinkedIn exacte | Ouvert | Bloc 6 / slide S14 | [canva-slides-detail.md](canva-slides-detail.md) |
| P1 | Commander les cartes de visite | Ouvert | Deadline documentée au **2026-05-13** | [canva-slides-detail.md](canva-slides-detail.md), [pitch-script-bloc6-conclusion.md](pitch-script-bloc6-conclusion.md) |

## 4. Tâches logistiques programmées mais pas encore exécutables

Ces tâches sont normales à ce stade ; elles doivent être fermées à
mesure qu'on approche de J-7, J-3 puis J-1.

### J-7 / J-3 / J-1

- [ ] Export PDF offline
- [ ] Copie sur clé USB
- [ ] Copie sur Google Drive personnel
- [ ] Test écran externe / HDMI
- [ ] Test miroir téléphone
- [ ] Mode avion / anti-notifications / verrouillage auto désactivé
- [ ] Matériel soutenance préparé

**Source** :

- [risk-analysis.md](risk-analysis.md)
- [canva-slides-detail.md](canva-slides-detail.md)

## 5. Éléments non bloquants ou à traiter seulement si le temps le permet

Ces sujets ne doivent pas retarder le chemin critique.

- [ ] Récupérer les 2 autres grilles Ynov mentionnées dans l'email
  si elles existent vraiment pour cette catégorie
- [ ] Clarifier le niveau WCAG exact
- [ ] Affiner le décompte précis de wireframes
- [ ] Finaliser l'option tabliers floqués

**Sources** :

- [plan-presentation-27-mai.md](plan-presentation-27-mai.md)
- [tabliers-floques-specs.md](tabliers-floques-specs.md)
- [pitch-script-bloc2-avant-brassage.md](pitch-script-bloc2-avant-brassage.md)

## 6. Definition of Ready — soutenance réellement prête

La soutenance du 27 mai peut être considérée **prête** si et seulement
si les points ci-dessous sont vrais :

- [ ] pré-présentation / oral blanc du **2026-05-06** demandé, réservé et passé
- [ ] hébergement backend validé (Klouders actif OU Fly.io déployé)
- [ ] deck Canva réel produit
- [ ] PDF exporté et testé offline
- [ ] démo 5 min verrouillée sur un parcours précis
- [ ] seed démo validé
- [ ] bières de test choisies
- [ ] vidéo backup tournée
- [ ] au moins une répétition complète 30 + 10 réalisée
- [ ] QR final décidé
- [ ] arbitrage repo public / privé décidé
- [ ] S14 et CTA final stabilisés

## 7. Ordre d'action recommandé a partir de maintenant

1. **Demander puis réserver la pré-présentation / l'oral blanc**
2. **Produire le deck Canva**
3. **Verrouiller la démo 5 min**
4. **Obtenir le seed + choisir les bières**
5. **Faire une première répétition complète**
6. **Tourner la vidéo backup**
7. **Fermer QR / repo / LinkedIn / cartes de visite**

## 8. Mise a jour conseillée

Relire et mettre à jour ce fichier :

- après chaque session de travail soutenance ;
- après l'oral blanc ;
- après la première répétition intégrale ;
- après production du deck final ;
- après tournage de la vidéo backup.
