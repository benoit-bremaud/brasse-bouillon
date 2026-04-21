# Script présentateur — Bloc 6 Conclusion + CTA + tagline (1 min)

**Contexte** : bloc 6 du pitch, 29:00 → 30:00. Suit la transition du
bloc 5 ("Il reste une dernière chose à vous dire."). Court, dense,
impactant. **Pose le point final avant le Q&A de 10 min**.

**Slide à l'écran** :
- 29:00 → 30:00 : **S14 — Tagline finale + crédits + CTA Q&A**

**Durée cible** : 1:00 min.
**Budget mots** : ~135 mots à 135 mpm.
**Posture** : regard ferme sur le jury, ton qui ralentit volontairement,
chaque mot compte. Pas de gestuelle parasite.

## Structure du bloc

| Séquence | Timecode | Contenu | Durée |
|----------|----------|---------|-------|
| 1. Rappel valeur | 29:00-29:15 | Synthèse 1 phrase du projet | 0:15 |
| 2. Engagement post-soutenance | 29:15-29:35 | Ce qu'on livre après le 27/05 | 0:20 |
| 3. Tagline finale | 29:35-29:45 | Phrase qui claque | 0:10 |
| 4. Remerciements + appel Q&A | 29:45-30:00 | Jury + transition | 0:15 |
| **Total** | 29:00-30:00 | | **1:00** |

## Séquence 1 — Rappel valeur (15 s, ~35 mots)

> **(Le présentateur pose les mains sur le pupitre — posture de
> clôture, plus d'écran, plus de gestes amples.)**
>
> "Pendant trente minutes, je vous ai présenté un **produit qui
> existe**, un **modèle qui tient**, une **vision qui a un plan
> concret de financement et d'exécution**."

## Séquence 2 — Engagement post-soutenance (20 s, ~45 mots)

> "Après le 27 mai, trois choses démarrent. **Le studio web
> ouvre** ses premiers devis clients. **Brasse-Bouillon** passe
> en bêta fermée sur ses trois personas. **Les dossiers de
> financement** partent à la BPI et aux incubateurs français.
>
> Pas dans six mois. Dans six semaines."

## Séquence 3 — Tagline finale (10 s, ~25 mots)

> **(Le présentateur marque une pause d'une seconde avant la
> tagline. Slide S14 affiche la tagline en grand.)**
>
> "Brasse-Bouillon, c'est **trois verbes** :
>
> **Brasser. Partager. Recommencer.**"

### Tagline retenue (arbitrage 2026-04-21)

**A — Brasser. Partager. Recommencer.** (3 mots)

Triptyque qui couvre le parcours Avant/Pendant/Après sans le dire
explicitement, évoque le cycle artisanal brassicole, se retient
facilement. Décomposition scénique obligatoire :

- "Brasser." [pause 0,5 s]
- "Partager." [pause 0,5 s]
- "Recommencer."

Trois impacts séparés, pas une phrase fluide. Slide S14 affiche les
trois mots en grand, idéalement alignés verticalement pour imiter le
rythme oral.

### Variantes non retenues (archive — pour historique seulement)

| # | Tagline | Mots | Raison non retenue |
|---|---------|------|--------------------|
| B | Brasse-Bouillon : l'outil français qui fait grandir les brasseurs. | 11 | Factuel mais moins percutant que A. |
| C | Brasse-Bouillon : parce que faire sa bière mérite un vrai outil. | 11 | Ton défensif, implique agressivement que Brewfather/Little Bock ne sont pas "vrais". |
| D | Brasse-Bouillon : brassez français, pensez francophone. | 6 | Trop politique, moins produit. |
| E | Brasse-Bouillon : du grain à la bouteille, pas à pas. | 9 | Poétique mais manque de punch entrepreneurial. |

## Séquence 4 — Remerciements + appel Q&A (15 s, ~30 mots)

> **(Le présentateur lève les yeux vers le jury, regarde chaque
> membre brièvement. Slide S14 reste affichée avec tagline + QR code
> + mention APK téléchargeable + cartes distribuées.)**
>
> "Merci aux coachs Ydays, merci à l'équipe pédagogique, merci à
> vous pour votre attention. Le **QR code** sur l'écran et les
> **cartes distribuées** vous amènent au projet, à mes contacts —
> et vous pouvez **installer Brasse-Bouillon sur votre téléphone
> dès maintenant**, l'APK est prêt.
>
> Je prends vos questions."

**Note CTA physique** (arbitrage 2026-04-21) : triple canal retenu —
**QR code sur S14** (lien APK + repo GitHub + email contact) +
**cartes de visite** distribuées au jury + **APK Android
téléchargeable en direct** (EAS preview profile, PR #558,
[packages/mobile-app/docs/EAS_BUILD.md](../../../packages/mobile-app/docs/EAS_BUILD.md)).
Le QR code S14 peut pointer vers une page landing simple listant les
3 actions : installer l'APK, voir le repo, contacter Benoît. Voir
section "CTA final" ci-dessous pour les spécifications.

## CTA final — spécifications (arbitrage 2026-04-21)

Triple canal de rétention retenu : QR code + cartes de visite + APK
direct. Chaque canal joue un rôle différent dans le parcours post-pitch.

**4e canal en cours d'évaluation** : **tablier floqué Brasse-Bouillon**
distribué en sortie de salle et potentiellement porté par l'équipe
Ydays pendant la soutenance. Production au Fablab Grasse, spec complète
dans [tabliers-floques-specs.md](tabliers-floques-specs.md). Décision
finale dépend du devis Fablab (attendu cette semaine). Si validé, la
slide S14 ajoute une 4e mention et P1 portera le tablier pendant la
saynète bloc 1.

### 1. QR code sur slide S14

- **Cible** : une page landing minimale listant les 3 actions (installer
  l'APK, voir le repo GitHub, contacter Benoît). URL courte lisible
  recommandée — e.g. `brasse-bouillon.fr/jury` ou, à défaut, un lien
  GitHub Pages hébergé depuis le repo.
- **Position S14** : bas à droite, ~15 % de la largeur de slide, encadré
  blanc pour contraster avec la tagline en grand au centre.
- **Texte sous le QR** : "Scan → installez l'app, lisez le code, écrivez-moi."
- **Fallback si pas de landing dédiée** : QR pointe directement vers le
  README du repo GitHub (il contient déjà les liens APK via
  [packages/mobile-app/docs/EAS_BUILD.md](../../../packages/mobile-app/docs/EAS_BUILD.md)).

### 2. Cartes de visite (~15-20 exemplaires)

- **Quantité** : prévoir pour le jury (3-5 personnes) + coachs + invités
  éventuels. Bilan ~20 cartes.
- **Recto** : logo Brasse-Bouillon + tagline "Brasser. Partager. Recommencer."
- **Verso** : nom + rôle (Benoît Bremaud, fondateur) + email + URL repo
  + URL APK + QR code identique à S14.
- **Prod** : commande imprimerie en ligne (Moo, Vistaprint, etc.), délai
  48-72 h, coût ~15-25 €. **À commander avant 2026-05-13** (J-14) pour
  marge de sécurité.
- **Distribution** : déposées sur la table du jury à l'entrée, ou
  remises à la main en début de pitch. **Pas distribuées en plein
  pitch** (distrait).

### 3. APK Android téléchargeable en direct

- **Source** : EAS preview profile, ship depuis 2026-04-20 (PR #558).
  Docs install : [packages/mobile-app/docs/APK_INSTALL.md](../../../packages/mobile-app/docs/APK_INSTALL.md).
- **Lien** : à inclure dans la landing page ciblée par le QR.
- **Pitch pendant le Q&A** : si un jury installe pendant la Q&A,
  laisser faire. Mention "l'APK est prêt" en séquence 4 invite
  naturellement à ce geste.
- **Points forts à valoriser si la question vient en Q&A** :
  - Signature code + keystore EAS
  - Mises à jour OTA via canal `preview`
  - Archive < 5 MB (optimisé `.easignore`)
  - Compte démo accessible sans création (`EXPO_PUBLIC_USE_DEMO_DATA=true`)

### Risques CTA

- **QR code défectueux** : tester l'impression en grand et le scan avec
  3 téléphones différents la veille. Garder une URL courte en texte
  lisible sous le QR comme backup ("brasse-bouillon.fr/jury").
- **Cartes pas livrées** : commande 2 semaines avant (deadline
  2026-05-13). Plan B : impression maison en A4 pré-découpée la veille.
- **APK install bloqué** : téléphones Android only. Pour un jury iOS,
  rediriger vers la démo live (bloc 3) et le repo GitHub. Ne pas
  promettre iOS.

## Vérification budget mots et timing

| Séquence | Mots | Secondes @ 135 mpm |
|---|---|---|
| 1. Rappel valeur | 35 | 16 |
| 2. Engagement | 45 | 20 |
| 3. Tagline | 25 | 11 |
| 4. Remerciements | 30 | 13 |
| **Total** | **~135** | **~60 = 1:00** |

**Parfaitement calé** sur la minute. Aucune marge, mais c'est ce
qu'on veut pour une conclusion — pas de traînage.

## Chiffres et engagements cités

| Élément | Source | Statut |
|---|---|---|
| Studio ouvre ses devis | [web-studio-brainstorming.md](web-studio-brainstorming.md) Q11 — prospect identifié | ✅ |
| BB bêta fermée sur 3 personas | [smart-objectives-par-pole.md](smart-objectives-par-pole.md) #9 + user_personas.md (3) | ✅ |
| Dossiers BPI + incubateurs | [smart-objectives-par-pole.md](smart-objectives-par-pole.md) #36 | ✅ |
| 6 semaines après soutenance | Calcul : 27 mai → 8 juillet | ✅ Cohérent |

## Notes de direction scénique

- **Transition physique** entre bloc 5 et bloc 6 : le présentateur
  **pose les mains sur le pupitre ou sur la table**. Signal
  non-verbal : on arrête de bouger, on va conclure.
- **Ralentir le débit** : passer de 135 à environ 110 mots/minute
  pendant les séquences 2 et 3. Chaque mot tombe.
- **Pause de 1 seconde** après "Pas dans six mois." — très forte
  ponctuation avant "Dans six semaines".
- **Pause de 1 seconde** avant la tagline. Le silence prépare la
  phrase finale.
- **Décomposer la tagline** : "Brasser. [pause 0.5s] Partager.
  [pause 0.5s] Recommencer." — trois impacts, pas une phrase
  fluide.
- **Sourire discret** sur "Je prends vos questions" — on montre
  qu'on est serein, pas sur la défensive.

## Ce que le jury retient de la fin du pitch

Le bloc 6 sert 4 objectifs mesurables :

1. **Réaffirmer la solidité** : "produit qui existe, modèle qui
   tient, vision qui a un plan" — trois piliers, trois niveaux de
   maturité.
2. **Donner des dates concrètes** : pas de "un jour", pas de
   "bientôt". Le studio démarre en six semaines. Les dossiers
   partent en six semaines. La bêta fermée démarre en six
   semaines.
3. **Laisser une tagline mémorable** : le jury doit pouvoir la
   répéter à quelqu'un qui n'était pas dans la salle.
4. **Ouvrir une Q&A sereine** : pas de posture fragile, pas de
   "j'espère que ça vous a plu". Respect direct.

## Options de repli si le bloc déborde

Le bloc 6 fait 1:00 pile. Si à la répétition il fait 1:10 ou plus,
couper dans cet ordre :

1. **Séquence 2** : remplacer les 3 puces par une phrase unique —
   "Après le 27 mai, le studio ouvre, la bêta démarre, les dossiers
   partent. En six semaines, pas en six mois." — gagne ~5 s.
2. **Séquence 4** : supprimer "merci à l'équipe pédagogique" —
   garder juste "Merci aux coachs, merci à vous. Je prends vos
   questions." — gagne ~3 s.

**Ne pas couper** la tagline (séquence 3) ni le rappel valeur
(séquence 1). Ce sont les seuls moments où le jury peut retenir une
phrase pour la restituer.

## Gestion de la Q&A qui suit

La Q&A dure **10 minutes**, hors 30 min du pitch. Règles
opérationnelles :

- **Écouter la question en entier** avant de répondre. Ne pas
  couper, ne pas anticiper.
- **Reformuler** la question en une phrase avant d'y répondre :
  "Si je comprends bien, vous me demandez comment…". Gagne du
  temps de réflexion et vérifie qu'on a compris.
- **Répondre en 30-45 secondes par question** max. 10 min / 45 s =
  ~13 questions potentielles. Laisser de l'air pour 2-3 questions
  longues.
- **Dire "je ne sais pas"** quand c'est le cas. Pire que
  l'ignorance : le bluff que le jury détecte.
- **Questions anticipées** → voir
  [pitch-anticipated-qa.md](pitch-anticipated-qa.md) (à rédiger).

## À arbitrer par le user

- [x] ~~**Choisir la tagline**~~ → **A — Brasser. Partager. Recommencer.**
  (arbitré 2026-04-21).
- [x] ~~**Décider du CTA physique**~~ → **Triple canal : QR code S14 +
  cartes de visite + APK téléchargeable** (arbitré 2026-04-21). Voir
  section "CTA final" pour les specs.
- [ ] **Valider les 3 engagements six semaines** (studio ouvre,
  bêta fermée, dossiers financement) — cohérent avec ta capacité
  d'exécution ?
- [ ] **Commander les cartes de visite** avant 2026-05-13 (J-14).
  Imprimerie en ligne, ~15-25 €, 20 exemplaires.
- [ ] **Décider de la landing page cible du QR** : page dédiée
  `brasse-bouillon.fr/jury` (à construire, 2-3 h) ou redirect direct
  README GitHub (zéro prod). Lié au trou factuel #3 (landing page
  existence).
- [ ] Confirmer "Merci aux coachs Ydays, merci à l'équipe
  pédagogique" — si tu préfères citer des noms (Mme/M. X, Y),
  remplacer.

## Prochaines étapes logiques

1. Rédiger les **transitions entre blocs** en un document unifié
   (5 transitions consolidées : intro→1, 1→2, 2→3, 3→4, 4→5,
   5→6).
2. Rédiger les **questions Q&A anticipées** (15-20 questions avec
   réponses prêtes de 30-45 s chacune).
3. Détailler le **contenu exact de chaque slide Canva** S1-S14
   (titres, bullets, visuels, contraintes de mise en page).
4. Première **répétition chronométrée à voix haute** sur les 6
   blocs enchainés pour valider les 30:00 totales.
