# Analyse des risques — soutenance 27 mai 2026

**Finalité** : anticiper les risques de la journée J et de la préparation,
avec probabilité / impact / mitigation pour chaque scénario. Ce document
nourrit directement les choix de backup (vidéos démo, export PDF offline,
équipement) et les checklists J-7 / J-3 / J-1.

## Échelle

- **Probabilité** : 🟢 faible · 🟡 moyenne · 🔴 élevée
- **Impact** : 🟢 mineur (incident visuel) · 🟡 moyen (perte 1-2 pts) ·
  🔴 majeur (perte 5-10 pts ou échec démo)

## Risques liés au support (slides)

| # | Risque | P | I | Mitigation |
|---|--------|---|---|------------|
| S1 | Pas de connexion internet dans la salle | 🟡 | 🔴 | **Export PDF + Keynote/PPT offline** sur laptop J-1 ; Canva téléchargé en PDF HD ; test lecture offline la veille |
| S2 | Laptop Benoît tombe en panne / batterie à plat | 🟢 | 🔴 | Chargeur dans le sac ; PDF sur clé USB de backup ; demander à Ynov un laptop de secours si possible |
| S3 | Câble HDMI incompatible (USB-C only côté laptop) | 🟡 | 🔴 | **Adaptateur USB-C → HDMI dans le sac** ; tester J-1 sur un écran externe chez soi |
| S4 | Résolution slides cassée sur projecteur (16:9 vs 4:3, flou) | 🟡 | 🟡 | Canva export "Présentation 16:9" HD ; vérif sur écran externe J-1 ; fallback : réexport en 4:3 la veille si besoin |
| S5 | Police custom non embarquée dans le PDF | 🟢 | 🟡 | Canva embarque les polices par défaut ; utiliser polices système (Inter / Manrope / Arial) pour robustesse |
| S6 | Télécommande HS / pas de pile | 🟡 | 🟢 | Piles de rechange ; slides navigables aussi au clavier (flèches) |
| S7 | Tablette pense-bête se déconnecte / décharge | 🟡 | 🟡 | Charger à 100 % la veille ; avoir une copie papier des notes clés (1 page A4 pliée) |

## Risques liés à la démo live

| # | Risque | P | I | Mitigation |
|---|--------|---|---|------------|
| D1 | L'API ne répond pas (pas de wifi ou backend HS) | 🟡 | 🔴 | **Vidéo backup du parcours démo 5 min** pré-enregistrée ; lancer l'API en local sur laptop avant d'entrer (mode offline mobile → local via LAN) |
| D2 | Scanner code-barre échoue sur la bière présentée | 🟡 | 🟡 | Fallback photo intégré dans la feature (audit #10) ; tester avec 2 bières distinctes J-1, en choisir 1 "safe" |
| D3 | Écran mobile illisible projeté (trop petit, noir) | 🟡 | 🟡 | **Miroir écran via scrcpy / Reflector** testé J-3 ; avoir screenshots des écrans clés dans les slides en fallback |
| D4 | Expo dev server plante pendant la démo | 🟢 | 🔴 | Build standalone Expo (preview) J-3, installer sur téléphone en natif, pas en Expo Go ; pas de live reload pendant la démo |
| D5 | Téléphone se verrouille au milieu de la démo | 🟡 | 🟢 | Désactiver verrouillage auto (réglages → jamais) J-1 ; mode "Ne pas déranger" activé |
| D6 | Notification perso intrusive (SMS, appel) pendant la démo | 🟡 | 🟢 | Mode avion activé avant la démo ; wifi/Bluetooth manuel si nécessaire |
| D7 | Jeu de données démo corrompu (recette manquante) | 🟢 | 🔴 | **Script de seed reproductible** (`make seed-demo`) exécuté J-1 ; vérif manuelle des 3-5 recettes + 1 brassin timeline |
| D8 | La démo dépasse les 90 s annoncées | 🟡 | 🟡 | Chronométrage strict aux répétitions J-7/J-3/J-1 ; script T6 seconde-par-seconde |

## Risques liés au contenu / pitch

| # | Risque | P | I | Mitigation |
|---|--------|---|---|------------|
| C1 | Question jury sur la volumétrie "1 000 pré-inscriptions" (SMART #34) | 🟡 | 🟡 | Landing [brasse-bouillon.com](https://brasse-bouillon.com) live avec newsletter + questionnaire actifs ; répondre "objectif 6 mois post-V1, correspondant à 3 % de la base Little Bock (35 000 brasseurs actifs) — cohérent" ; si pression, préciser "landing live, métrique trackée, revue trimestrielle". **Le chiffre "63,3 % / 54 répondants" a été retiré du pitch le 2026-04-21 (estimations, pas une enquête réelle).** |
| C2 | Question jury sur modèle de revenu précis | 🔴 | 🟡 | **Workshop monétisation** planifié, livrable dans BMC ; au pire, réponse "freemium + partenariats LHBS, grille tarifaire en cours de finalisation" |
| C3 | Dépassement des 30 min de pitch (Q&A de 10 min à part) | 🔴 | 🔴 | Chronométrage strict sur les 30 min pleines, scripts minutés par bloc ; budget révisé 2026-04-21 = **5/6/5/5/7/1 min + 1 min marge flottante** (28:00-29:00) ; la marge absorbe les dérives des blocs 1-5 sans rogner sur la conclusion ; fallbacks documentés dans chaque script (ex. bloc 5 séq. 5 compressible si bloc 3 déborde) |
| C4 | Oubli / trou noir pendant le pitch | 🟡 | 🟡 | Pense-bête tablette ou papier A4 avec 6 mots-clés par bloc ; répétitions ≥ 3 en conditions |
| C5 | Question sur beer-label-ai : "pourquoi pas en démo ?" | 🟡 | 🟢 | Réponse pré-préparée : "pipeline opérationnel en labo, précision non prouvée sur étiquettes réelles en conditions variables, on le garde pour la V2 post-soutenance" (KISS + YAGNI assumé) |
| C6 | Question hostile sur concurrence (Brewfather / Little Bock) | 🟡 | 🟡 | Table comparative dans BMC prête (Markdown) ; mémoriser 3 différenciateurs clairs : FR natif, simplicité évolutive, scanner code-barre |
| C7 | Critique design "pas abouti" (mockups manquants) | 🟡 | 🟡 | Assumer : "design system et tokens livrés, mockups HD en Sprint 6 ; le design ships with l'app, pas en Figma" → rediriger vers la démo live |

## Risques équipe / logistique

| # | Risque | P | I | Mitigation |
|---|--------|---|---|------------|
| L1 | Arrivée en retard le jour J | 🟡 | 🔴 | Repérer la salle J-3 ; arrivée sur place 45 min avant ; prévoir 2 itinéraires |
| L2 | Stress / fatigue qui dégrade la perf oral | 🔴 | 🟡 | Répétitions ≥ 3 en conditions ; respiration + pause veille ; petit-déj équilibré J |
| L3 | Matériel démo oublié chez soi | 🟢 | 🔴 | **Checklist matériel J-1** (liste ci-dessous) ; sac préparé la veille au soir |
| L4 | Aucun autre membre de l'équipe présent / disponible | 🔴 | 🟢 | Pitch conçu pour être porté en solo (A0 hybride = voix narrative unique, interventions expertes optionnelles) ; si seul = version "1 voix" préparée en amont |
| L5 | Jury change la durée / format le jour J | 🟢 | 🟡 | Version compacte 15 min pré-rédigée (blocs 1-6 condensés) au cas où |
| L6 | Ynov modifie le format annoncé (30+10 → 20+10 ou autre) | 🟢 | 🟡 | Version compacte 20 min pré-rédigée (supprime bloc 4, condense 2 et 5) prête J-3 ; vérif format auprès du coach à l'oral blanc 06/05 |

## Checklist matériel J-1

- [ ] Laptop chargé à 100 % + chargeur dans le sac
- [ ] Clé USB avec PDF slides + vidéos backup démo
- [ ] Adaptateur USB-C → HDMI (testé sur écran externe)
- [ ] Téléphone démo chargé, mode avion, jeu données seed vérifié
- [ ] 2 bières test pour scanner code-barre (codes barre lisibles)
- [ ] Télécommande slides + piles neuves de rechange
- [ ] Tablette pense-bête chargée (si retenue) + notes papier A4 backup
- [ ] Version PDF slides imprimée en 3 exemplaires (jury ?)
- [ ] Bouteille d'eau
- [ ] Tenue préparée

## Top 3 mitigations à prioriser

1. **D1 — Vidéo backup démo** : tourner en J-5 max ; ~3 min encodées 1080p,
   montées sans voix off (narration live) ; stockées sur laptop +
   Google Drive + clé USB.
2. **S1 — Export PDF offline** : export Canva J-1 matin ; test lecture en
   plein écran sur laptop déconnecté J-1 soir.
3. **C3 — Chronométrage strict** : chaque répétition J-7/J-3/J-1 timée au
   chrono ; script T6 en annexe avec minutage par phrase.

## Sessions dédiées à prévoir

| Session | Date cible | Livrable |
|---------|-----------|----------|
| **Oral blanc Ynov** | **2026-05-06 (J-21)** | **Séance Ydays coach : présentation complète à chaud + feedback officiel — à réserver** |
| Tournage vidéo backup démo | 2026-05-20 (J-7) | 3 vidéos : parcours démo complet + 2 micro-backups (scanner / calculateur) |
| Répétition 1 | 2026-05-20 (J-7) | Chrono complet 30 min + feedback écrit |
| Répétition 2 | 2026-05-24 (J-3) | Chrono + test matériel complet (HDMI, télécommande) |
| Répétition 3 | 2026-05-26 (J-1) | Chrono final + checklist matériel validée |

## Suivi

Ce document doit être **relu à chaque fin de session de préparation**
pour ajuster les risques (certains vont baisser au fur et à mesure,
d'autres vont émerger). Versionné dans
[docs/ydays/outputs/](.), commits réguliers.
