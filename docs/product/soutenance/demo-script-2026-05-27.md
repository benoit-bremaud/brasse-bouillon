# Demo Script — Brasse-Bouillon Soutenance 2026-05-27

**Issue**: #702
**Defense date**: 2026-05-27 (J-0 reference)
**Soutenance blanche**: 2026-05-06 (J-21 — 21 days before defense, first rehearsal of this script)
**Recording session**: week of 2026-05-20 (J-7 — 7 days before defense, after rc1 feature freeze)

> Date convention used throughout this document: **J-X = X days before defense** (defense day = J-0). This matches the project-wide convention used in the J-29 sprint scoping session on 2026-04-28.

This document captures the full **90-second nominal demo** (scenario A — known beer), the **four adaptive jury-beer variants** (A/B/C/D), the **screencast backup specification**, and the **jury request email draft**. It supersedes the original 90s script in [scan-2026-04-24.md §5](../brainstorms/scan-2026-04-24.md#5-demo-strategy--2026-05-27-defense) by promoting it from brainstorm shorthand to soutenance-ready stage directions.

Spoken lines are in **French** (the soutenance language). Stage directions and structural commentary stay in English (project convention for internal docs).

---

## 1. Nominal 90-second script (scenario A — Punk IPA)

The reference timing on stage. Aim for ~85s spoken, leaving ~5s of breathing room.

### [0:00 → 0:15] INTRO — narrative setup

**Stage**:

- Punk IPA bottle visible on the table (real glass bottle, label facing the camera)
- Demo laptop projected on screen, mobile device unlocked, Brasse-Bouillon open on the **scan dashboard** (camera viewfinder visible)
- Speaker stands beside the table, app pointing at the bottle

**Speaker (FR)**:

> « Imaginez Léa, 28 ans. Hier soir, une amie lui a fait découvrir cette Punk IPA. Elle a kiffé. Et là, ce matin, elle se pose la question : *est-ce que je pourrais brasser une bière similaire chez moi ?*
> Aucune appli brassicole ne sait répondre à cette question — sauf une. »

**Cue for next phase**: speaker raises the bottle towards the device, framing the scan gesture.

### [0:15 → 0:35] SCAN — gesture and recognition

**Stage**:

- Speaker scans the Punk IPA barcode (5060277380019) — the seed contains a verified entry
- Recognition completes within 1-2 seconds
- The result screen appears: hero image (EBC-tinted background), beer name "Punk IPA", brewery "BrewDog", ABV "5.4 %"

**Speaker (FR)**:

> « Léa scanne. La bière est reconnue en moins de deux secondes. Pas besoin de connaître son code-barres, son IBU, son style — l'application sait. »

**Visual cue**: pause briefly on the result card, let the projected screen breathe.

### [0:35 → 1:00] DISCOVERY — vocabulary adapts to the user

**Stage**:

- Speaker scrolls down on the result screen
- The "at-a-glance" section shows **qualitative** words: *De session*, *Ambrée*, *Modérément amère*
- Speaker taps the **"▾ Détails techniques"** fold; the technical numbers appear: ABV, IBU, EBC, fermentation, aromatic tags

**Speaker (FR)**:

> « Léa, qui ne connaît rien au brassage, voit des mots qu'elle comprend : *de session, ambrée, modérément amère*. Mais le brasseur expérimenté qui regarde par-dessus son épaule, lui, déplie les détails techniques et trouve l'IBU, l'EBC, le profil de fermentation. **L'application s'adapte à qui la regarde.** »

**Cue for next phase**: speaker scrolls back up to the matching section.

### [1:00 → 1:20] MATCH — the pharmacy metaphor

**Stage**:

- Speaker scrolls to the **"🏆 Recette officielle"** section: a single card showing the BrewDog DIY Dog official recipe with a gold accent
- Speaker scrolls to **"🧪 Recettes équivalentes"**: three community-rated alternatives (Session IPA Citra, NEIPA Tropical, White IPA), each with rating + brew count

**Speaker (FR)**:

> « Et c'est là qu'on assume notre métaphore : Brasse-Bouillon, c'est la pharmacie de la bière. La recette officielle de BrewDog, c'est la marque. Les trois recettes communautaires en dessous, ce sont les génériques — testées, notées, brassées par la communauté. Léa choisit. »

### [1:20 → 1:30] IMPORT — closing

**Stage**:

- Speaker taps the first community recipe (e.g. *Session IPA Citra*)
- An import alert appears: *"Recette importée"*
- Speaker taps **"Voir la recette"**; the app navigates to the imported recipe in *Mes Recettes*

**Speaker (FR)**:

> « Un tap. La recette atterrit dans *Mes Recettes*. Léa peut commencer à brasser. C'est l'histoire qu'on raconte ce matin — du pub à la cuve, en 90 secondes. »

**Final cue**: speaker steps back from the device, lets the imported-recipe screen breathe for 1-2 seconds before the next slide.

---

## 2. Jury-beer adaptive variants

The product owner will ask the jury to bring empty beer bottles on defense day, so the demo runs on real conditions. The four scenarios below cover every case the jury can throw — and the script flips into the appropriate variant based on what happens at [0:15 → 0:35].

### A — Known beer (nominal flow)

**Trigger**: scanned barcode is in the seed catalog OR successfully resolved by OpenFoodFacts as a beer category.

**App behavior**: full happy path, sections 1.[0:00 → 0:15] through 1.[1:20 → 1:30] above.

**Speaker pivot (none)**: this is the reference.

### B — Unknown beer (catalog miss)

**Trigger**: barcode resolves nowhere (404 from API, not in seed, not in OFF).

**App behavior**: graceful not-found UI (PR #799 / issue #796) — scanned barcode displayed prominently, *"Suggérer une correction"* mailto CTA, *"Ajouter cette bière au catalogue"* mailto CTA.

**Speaker pivot (FR)**:

> « Et là, mesdames messieurs, vous voyez exactement ce qu'on a anticipé. Cette bière n'est pas encore dans notre base — la communauté ne l'a pas encore rencontrée. L'application affiche le code-barres scanné, et propose à Léa de **suggérer la correction** en un tap. Demain, cette bière y sera. C'est comme ça que la pharmacie grandit. »

**Time budget**: ~20s (the not-found screen is denser than the happy path).

### C — Unreadable barcode (camera failure)

**Trigger**: the camera fails to read the barcode (out of focus, partial, broken EAN-13).

**App behavior**: invalid-barcode error UI (PR #801 / issue #797) — *"Photographier l'étiquette"* CTA opens an alert referencing v0.2 / epic #751.

**Speaker pivot (FR)**:

> « Le code-barres est abîmé. Ça arrive. L'application **pivote en mode photo** — c'est la prochaine grande feature, prévue dès la v0.2. En attendant, Léa peut saisir le code à la main, ou tenter une autre bouteille. Pas de cul-de-sac. »

**Time budget**: ~15s (placeholder explanation, no full flow).

### D — Not a beer (cider, soda, food)

**Trigger**: barcode resolves on OpenFoodFacts but the product's `categories_tags` does not include any beer category.

**App behavior**: dedicated UI (PR #800 / issue #798) — *"Tu as scanné « `<productName>` » — ce n'est pas une bière"* + *"Scanner une bière"* CTA returning to the camera.

**Speaker pivot (FR)** (with humor):

> « Ah ! Quelqu'un voulait nous tester. *« Tu as scanné Coca-Cola » — ce n'est pas une bière*. Et c'est exactement ce qu'on attend de l'application : elle sait ce qu'elle est, et ce qu'elle n'est pas. La détection se fait directement côté serveur, sur les catégories OpenFoodFacts. Léa retourne au scan, et on continue. »

**Time budget**: ~15s (humor + pivot, then back to a known beer if time allows).

### Variant matrix — what we expect from each scenario

| Scenario | Probability (jury behavior) | Ready since | Demo time | Narrative theme |
|---|---|---|---|---|
| A | High (nominal beer) | day 1 | 90s | Pharmacy metaphor full flow |
| B | Medium (obscure microbrewery) | PR #799 (2026-04-29) | 20s | Community grows |
| C | Low (damaged label) | PR #801 (2026-04-29) | 15s | Forward-looking (v0.2 photo mode) |
| D | Low-medium (deliberate test) | PR #800 (2026-04-29) | 15s | Robustness, knows its scope |

---

## 3. Screencast backup specification

If the live demo fails on stage (network outage, device freeze, projector incompatibility), we play a pre-recorded screencast of scenario A.

### Recording requirements

- **Format**: MP4 (H.264 video + AAC audio)
- **Resolution**: 1920×1080 (matches typical projector native)
- **Frame rate**: 30 fps
- **Audio**: speaker voiceover synced to the timing of section 1, recorded separately and mixed in
- **Duration**: 88-92 seconds
- **File size target**: under 50 MB (project-friendly transfer)

### Recording session checklist (week of 2026-05-20)

- [ ] All Sprint A + Sprint B features feature-complete and merged on `main`
- [ ] `EXPO_PUBLIC_USE_DEMO_DATA=false` (real backend mode for the recording)
- [ ] Mobile device fully charged, do-not-disturb on, all notifications off
- [ ] Screen recorder configured: 30 fps, full-screen capture, system audio muted
- [ ] Voiceover script printed (this document, section 1)
- [ ] Two takes minimum, pick the cleanest

### On-stage playback setup

- [ ] Primary copy: on the demo laptop's desktop (`~/Desktop/brasse-bouillon-demo.mp4`)
- [ ] Secondary copy: on a USB stick, plugged into the laptop before the soutenance starts
- [ ] Keyboard shortcut prepared: VLC bound to `Cmd+Shift+P` (macOS) or `Win+Shift+P` (Windows) to open the file in fullscreen, ready to play in under 3 seconds
- [ ] **Practice the failover** at the soutenance blanche on 2026-05-06 — if anyone touches the laptop, the muscle memory must be there

### Decision matrix on stage

| Situation | Action |
|---|---|
| App runs nominally | Live demo, no backup |
| App freezes for >5s | Speaker says *« On voit en direct un comportement réseau, je vous montre l'enregistrement »*, switches to backup |
| Network down (offline) | Speaker can stay live (airplane mode + 9 seeded beers — PR #791 added Heineken + Cervoise Lancelot to the mix), no backup needed |
| Device dead / projector failure | Speaker switches to laptop screen, plays backup |

---

## 4. Jury request email — coach draft (FR)

Email to send to the soutenance coach approximately 10 days before defense (2026-05-17). The intent is to get explicit jury permission to bring empty beer bottles for the live scan demonstration.

```text
Sujet : Brasse-Bouillon — soutenance du 2026-05-27 — demande au jury

Bonjour [coach],

Pour la soutenance du 2026-05-27, l'équipe Brasse-Bouillon souhaite proposer
au jury une démonstration en conditions réelles.

Notre application centrale est un scanner de bouteille de bière. Plutôt que
de présenter uniquement un parcours préenregistré sur une bière de référence,
nous aimerions inviter chaque jury à apporter une bouteille de bière vide
de son choix. La démonstration scannera cette bouteille en direct.

Nous avons préparé l'application pour couvrir tous les cas de figure :

- Bière reconnue → parcours nominal complet (90 secondes)
- Bière inconnue → l'application propose à l'utilisateur de suggérer la
  correction, démontrant la croissance communautaire du catalogue
- Code-barres illisible → bascule en mode photo (placeholder pour la v0.2,
  feature complète prévue post-soutenance)
- Produit non-bière (sodas, cidre, vin) → détection automatique côté serveur
  par catégorie OpenFoodFacts, message dédié

Chaque cas a été testé, et fait partie intégrante du script de démonstration.

Question : le jury pourrait-il être averti à l'avance qu'il peut, s'il le
souhaite, apporter une bouteille de bière vide pour participer à la démo ?
Si l'organisation préfère qu'on s'en tienne à notre bière de référence, nous
restons préparés pour le scénario nominal seul.

Merci pour votre retour,

Benoît Bremaud
PO + Dev Brasse-Bouillon
```

**Sending checklist**:

- [ ] Send to coach by 2026-05-17 at the latest (10 days before defense)
- [ ] CC the team (Smith06S, Thais9723, vitalikevin, Fabien-Ori, Lin0ooo, Liamggn) so they have visibility
- [ ] Save the response (whatever it is) to the team Slack/Discord for soutenance prep reference
- [ ] If the answer is "no", trim variants B/C/D from the script and lean fully on the screencast backup as the safety net

---

## 5. Rehearsal & validation log

The script is validated through dry runs leading up to the defense. Each rehearsal entry below records what worked, what broke, and what was changed.

### 2026-05-06 — Soutenance blanche (J-21 from defense)

- [ ] Run the nominal 90s script end-to-end
- [ ] Trigger scenarios B / C / D voluntarily to test the pivots
- [ ] Time the spoken lines (target 85s spoken, 5s breathing)
- [ ] Capture coach + peer feedback for the next iteration

### 2026-05-20 → 2026-05-26 — Final week

- [ ] Final rehearsal at 2026-05-24 with full Sprint C/D/E features merged
- [ ] Screencast recording session (see §3)
- [ ] Final coach review at 2026-05-26
- [ ] Soutenance day at 2026-05-27

---

## References

- [Scan brainstorm 2026-04-24 §5](../brainstorms/scan-2026-04-24.md#5-demo-strategy--2026-05-27-defense) — original 90s shorthand
- [Persona Léa la Curieuse v3](../../personas/user_personas.md#-persona-1--léa-la-curieuse-) — primary demo target
- [Roadmap v0.1 consolidated](../roadmap-v0.1-consolidated.md) — full v0.1 scope across 9 topics
- Sprint A jury edge cases: PRs #799 (B), #800 (D), #801 (C), epic #794
- Issue #642 — physical demo bottles preparation (Sprint B parallel)
- Issue #533 — full backup video (separate from the 90s screencast)
