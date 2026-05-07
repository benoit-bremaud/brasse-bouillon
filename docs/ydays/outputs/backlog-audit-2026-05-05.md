# Audit backlog épiques GitHub — 2026-05-05

**Finalité** : recenser les **50 épiques ouverts** dans le backlog GitHub `benoit-bremaud/brasse-bouillon` à J-22 de la soutenance, regroupés par thème, pour identifier ceux à mentionner dans la slide S13 (Perspectives produit) du pitch + ceux à parker en roadmap post-MVP.

**Source** : `gh issue list --label "type:epic" --state open --limit 50` (2026-05-05).

**Légende statut soutenance** :

- ⭐ **Mention pitch** — à teaser dans S13 quadrant Perspectives produit
- 📋 **Backlog v0.2** — roadmap court terme post-MVP
- 🔮 **Backlog v0.3+** — roadmap long terme, ne pas mentionner sauf en Q&A
- 🛠 **Tech / non-pitch** — refactor / hardening / outillage interne

---

## Thème 1 — Communauté & UGC (User-Generated Content)

| # | Titre | Statut soutenance |
|---|---|---|
| **#739** | epic(community): User-generated recipes — publication, ratings, badges, **credit economy (Couronnes)** | ⭐ **Mention pitch S13** |
| **#896** | feat(tasting): tasting feedback loop + collective events (3 phases) | ⭐ **Mention pitch S13** |
| **#803** | feat(scan): community contribution flow — guided 4-photo bottle tour | ⭐ **Mention pitch S13** |
| #738 | epic(admin): Admin Console v0.2 — manage catalog + brewery stories | 📋 v0.2 |

**Cluster « différenciation BB »** : ces 4 épiques articulés ensemble forment **le moat produit** que ne fait aucun concurrent (Brewfather, Little Bock, BeerSmith, BrewTarget). À sourcer dans S13 perspectives.

## Thème 2 — Monétisation & Pricing

| # | Titre | Statut soutenance |
|---|---|---|
| **#897** | Pricing & Monetization Strategy (placeholder marathon dédié) | ⭐ **Référence pitch S13** |
| #878 | epic(scan): rate-limit + freemium tiering — protect from abuse and monetise scan flow | 📋 v0.2 |
| #834 | epic(ai-design): AI-assisted label design (paid tier) | 📋 v0.2-v0.3 |

## Thème 3 — Brasseur expert (batches enrichis, calculateurs)

| # | Titre | Statut soutenance |
|---|---|---|
| #813 | feat(batches): rich step model — planned vs actual timestamps | 📋 v0.2 |
| #814 | feat(batches): alerts & reminders — phase deadlines, anomaly detection | 📋 v0.2 |
| #812 | feat(batches): structured observations — timestamped journal entries | 📋 v0.2 |
| #811 | feat(batches): intermediate measurements — gravity, temp, pH, SG | 📋 v0.2 |
| #810 | feat(batches): rich gravity & ABV metrics — recipe snapshot, dual ABV | 🔮 v0.3 |
| #809 | feat(batches): rich volume tracking — per-stage volumes, loss analysis | 🔮 v0.3 |
| #808 | feat(batches): rich brassin identity — tagline, self-rating, tags, cover photo | 🔮 v0.3 |
| #595 | refactor(batches): rewrite Mes Brassins detail | 🛠 actif (v0.1) |
| **#868** | Brewing assistant — guided live brewing session flow | ⭐ **Mention pitch S13** (lien Couronnes & dégustation) |
| #787 | Brewing calculators audit — formulas accuracy, single source of truth | 🛠 v0.2 hardening |

## Thème 4 — Catalog & data (encyclopédie BB)

| # | Titre | Statut soutenance |
|---|---|---|
| **#915** | feat(catalog): catalog expansion + custom user ingredients (Strategy B) | ⭐ **Mention pitch S13** |
| #883 | feat(catalog): curated recipe catalog (clone-recipes + signatures) | 📋 v0.1+ |
| **#853** | epic(beer-encyclopedia): DB autonomy strategy — bet on our own data | ⭐ **Mention pitch S13** |
| #849 | epic(beer-encyclopedia): AI-research importer (Perplexity-like) + double-validation | 📋 v0.2 |
| **#730** | Multi-source beer enrichment — towards the world's most complete beer DB | ⭐ **Mention pitch S13** (vision 5 ans) |
| **#541** | epic(beer-encyclopedia): transform beer-label-ai into a world-scale beer encyclopedia | ⭐ **Mention pitch S13** (R&D label-ai) |
| #738 | epic(admin): Admin Console v0.2 | 📋 v0.2 |

## Thème 5 — Scan & reconnaissance

| # | Titre | Statut soutenance |
|---|---|---|
| **#751** | feat(scan): smart bottle photo capture — guided panoramic | ⭐ **Mention pitch S13** (fallback variante C) |
| **#803** | feat(scan): community contribution flow | ⭐ **Mention pitch S13** |
| #795 | epic(scan): expand product range — wine, cider, fermented drinks | 🔮 v0.3+ |
| #878 | epic(scan): rate-limit + freemium tiering | 📋 v0.2 |

## Thème 6 — Designer / création visuelle

| # | Titre | Statut soutenance |
|---|---|---|
| #834 | epic(ai-design): AI-assisted label design (paid tier) | 📋 v0.2-v0.3 |
| #833 | epic(tegestophilie): tasting and label collection | 🔮 v0.3 |
| #832 | epic(creator-gallery): brewing gallery and label design history | 🔮 v0.3 |
| **#895** | feat(alchimiste): interactive recipe designer in Mon Carnet | ⭐ **Mention pitch S13** |

## Thème 7 — Inventory & équipement

| # | Titre | Statut soutenance |
|---|---|---|
| #774 | Inventory management — track ingredient surplus | 📋 v0.2 |
| #475 | EPIC: E10 - Equipment & Shop | 📋 v0.2 |

## Thème 8 — Recipe / Mes Recettes

| # | Titre | Statut soutenance |
|---|---|---|
| #740 | epic(recipes): Mes Recettes Hub + Recipe Detail Refonte | 🛠 actif (v0.1) |
| #467 | EPIC: E02 - Recipe Management | 🛠 actif (v0.1) |
| **#895** | feat(alchimiste): interactive recipe designer | ⭐ déjà cité Thème 6 |

## Thème 9 — Veille concurrentielle (n8n pipelines)

| # | Titre | Statut soutenance |
|---|---|---|
| #825 | feat(competitive-watch): n8n weekly digest pipeline | 🔮 v0.3 (hors MVP) |
| #816 | feat(competitive-watch): static catalog + n8n weekly intel + defense section | 🔮 v0.3 (hors MVP) |

## Thème 10 — Tech / hardening / Ops

| # | Titre | Statut soutenance |
|---|---|---|
| #789 | Post-public security hardening — gitleaks + secret rotation + CodeQL | 🛠 J-3 (audit pre-public) |
| #771 | Database audit — schema, integrity, indexes, GDPR & performance | 🛠 v0.2 |
| #746 | Multi-channel release notification — in-app + Discord/email | 🛠 v0.2 |
| #723 | Conception & design formel — UML + specs + réorg docs | 🛠 v0.2 |
| #713 | App-wide metric ⇄ imperial unit conversion | 🛠 v0.2 |
| #611 | refactor(navigation): unify 3 overlapping nav layers | 🛠 actif (v0.1) |
| #565 | epic(ydays-site): publish Ydays documentation as VitePress site | ✅ **livré** |

## Thème 11 — Datasheets & docs produit

| # | Titre | Statut soutenance |
|---|---|---|
| #772 | Datasheets / fiches techniques — brainstorming + content model | 📋 v0.2 |

## Thème 12 — Légal / Origine Ydays

| # | Titre | Statut soutenance |
|---|---|---|
| #466 | EPIC: E01 - Authentication & User Profile | ✅ **livré** v0.1 |
| #467 | EPIC: E02 - Recipe Management | 🛠 actif |
| #468 | EPIC: E03 - Brewing Calculators | ✅ **livré** v0.1 |
| #469 | EPIC: E04 - Batch Tracking | 🛠 actif |
| #470 | EPIC: E05 - Ingredient Library | ✅ **livré** v0.1 |
| #471 | EPIC: E06 - Brewing Academy | ✅ **livré** v0.1 |
| #472 | EPIC: E07 - Label Designer & Scanner | 🛠 actif |
| #473 | EPIC: E08 - Dashboard & Navigation | ✅ **livré** v0.1 |
| #474 | EPIC: E09 - Community & Sharing | 📋 v0.2 |
| #475 | EPIC: E10 - Equipment & Shop | 📋 v0.2 |

---

## Synthèse — 13 épiques à mentionner dans S13 perspectives

Ordre proposé pour la slide S13 quadrant Perspectives produit (4-5 épiques affichés visuellement, le reste réservé Q&A) :

### Cluster « moat communautaire » (différenciation forte)

1. **#739** — Couronnes (credit economy) ⭐⭐⭐
2. **#896** — Tasting feedback loop + collective events ⭐⭐⭐
3. **#803** — Scan community contribution flow ⭐⭐
4. **#895** — Alchimiste interactive recipe designer ⭐⭐

### Cluster « données » (vision 5 ans)

5. **#915** — Catalog expansion + custom user ingredients
6. **#853** — DB autonomy strategy
7. **#730** — Multi-source beer enrichment
8. **#541** — Beer-label-ai world-scale encyclopedia

### Cluster « brewing assistant » (lien batches)

9. **#868** — Brewing assistant guided live session
10. **#751** — Smart bottle photo capture (panoramic)

### Cluster « monétisation »

11. **#897** — Pricing & Monetization Strategy
12. **#834** — AI-assisted label design (paid tier)

### Cluster « ops »

13. **#789** — Post-public security hardening (audit pre-public)

---

## Mention pitch — slide S13 quadrant Perspectives produit (proposition)

> *« Brasse-Bouillon a un backlog de 50 épiques détaillés à 6 mois, organisés autour de 4 axes :*
>
> *1. **Moat communautaire** — couronnes (#739), feedback loop dégustation 3 phases (#896), contribution catalogue scan (#803), Alchimiste (#895). Aucun concurrent ne ferme cette boucle "design → brassage → dégustation → suggestion → re-design".*
>
> *2. **Stratégie données** — élargissement catalogue (#915), autonomie DB (#853), enrichissement multi-sources (#730), encyclopédie monde (#541). On ne dépend de personne.*
>
> *3. **Assistant brassage** — session guidée live (#868), capture panoramique étiquettes (#751).*
>
> *4. **Monétisation progressive** — freemium scan (#878), AI design label paid tier (#834), strategy marathon dédié (#897).*
>
> *Tout est tracé sur GitHub, public au 27 mai. Le QR code en S14 vous y emmène. »*

---

## Note importante — épiques satellites du sujet « financement / subventions »

Il existe une discussion sur les sources de financement (BPI, subventions, JEI, CIR, Bpifrance, incubateurs, prêts d'honneur, crowdfunding, business angels, love money) dans la session Claude Code `10a52b3f-d8bf-445d-9ff1-c19eb7d1a931` (242 mentions). Cette matière n'est **pas encore commitée dans le sitepress**. À extraire et formaliser dans un document dédié (`financement-options-fr.md` ou enrichissement de `capex-financement.md`).

Cf. todo Phase C : « Extract funding discussion from chat history 10a52b3f → financement-options-fr.md ».

---

## Liens vers documents associés

- [audit-decisions-2026-05-05.md](audit-decisions-2026-05-05.md) — décisions soutenance
- [feature-couronnes-roadmap-v02.md](feature-couronnes-roadmap-v02.md) — feature Couronnes (#739) extraite
- [influenceurs-canaux-fr.md](influenceurs-canaux-fr.md) — canal influenceurs FR
- [slide-deck-outline.md](slide-deck-outline.md) S13 — quadrant Perspectives
- [pitch-script-bloc5-bm-perspectives.md](pitch-script-bloc5-bm-perspectives.md) — narratif bloc 5

---

**Dernière mise à jour** : 2026-05-05 — création initiale (audit 50 épiques GitHub via `gh issue list`).
