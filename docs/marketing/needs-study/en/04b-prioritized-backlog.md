# Prioritized Backlog — Needs → Features → Build Order

This page turns the desk findings into a **prioritized build order**: which real need each feature
serves, how strong the opportunity is, how confident we are, and in what order to build.

::: warning Read this first
This ranking is built on **secondary research** (desk) — strong hypotheses, not field-confirmed truth.
Two biases to keep in mind:
1. The desk scan mostly probed **intermediate** pains (clone, sharing, sync), so it **under-weights the
   beginner guided-assistant need** — which is real but evidenced only indirectly (the "I built my own
   brew-day app" threads, the steep-UX complaints, the 40% newcomer inflow). Those rows are tagged
   *under-probed* and the interviews must confirm them.
2. The founder is a **beginner** building (first) for **beginners** — so we deliberately sequence
   **assistant-first**, even where the raw desk score would put the intermediate clone wedge on top.
:::

## Prioritization rule

> **Opportunity = Importance (how strong/frequent the need) × Under-served (how poorly incumbents do it).**
> Then **sequence by journey stage**, starting with the beginner assistant (acquisition), because that is
> the founder's accessible segment and the lowest-risk entry (a daily-useful utility beats a
> community that needs a crowd to exist — cf. AHA Brew Guru's 2026 shutdown).

**Confidence labels:** `validated` (strong, multi-source desk signal) · `hypothesis` (inferred, plausible)
· `under-probed` (real but thinly evidenced — interviews must confirm).

## The journey = the spine

```
Stage 1 — BEGINNER (guided assistant)   →  ACQUISITION   →  the 4-step journey
Stage 2 — REGULAR  (organize & track)   →  RETENTION
Stage 3 — INTERMEDIATE (clone & share)  →  DEPTH         →  the desk's headline wedge
```

## Stage 1 — Beginner assistant · the 4-step journey (build first)

| Need | Feature | Opportunity | Confidence |
|---|---|---|---|
| Don't ruin a brew; know what to do, when & why | **Guided step-by-step brew-day assistant** (mash/boil/cooling, timers, temps, the "why") | High × High = **High** | under-probed |
| Succeed on the very first batch, no jargon | **Beginner-calibrated recipe catalog** (curated, IBU/ABV/volume shown) — journey step 1 | High × Med-High = **High** | hypothesis |
| Know where my fermentation stands | **Fermentation tracking** (days, gravity, temperature, progress bar) — journey step 3 | High × Med = **Med-High** | validated |
| Finish & celebrate | **Bottling + label + share with friends** — journey step 4 | Med × Med = **Med** | hypothesis |
| Brewing happens offline (garage/cellar) | **Offline-tolerant**, no forced sync / no data duplication | High × High = **High** | validated |
| Tools feel overwhelming | **Clean, uncluttered, playful UX** (the proven differentiator) | High × Med = **Med** (quality bar) | validated |

## Stage 2 — Regular brewer · organize & track (retention)

| Need | Feature | Opportunity | Confidence |
|---|---|---|---|
| My recipes are scattered (notebooks, sheets) | **Recipe organization & search** (tags by style/ingredient/outcome) | High × Med-High = **High** | validated |
| Remember what I did across batches | **Batch history / brew log** with reviewable notes | High × Med = **Med-High** | validated |
| Don't trap my data | **BeerXML / BeerJSON import-export** (no lock-in, lossless) | High × Med = **Med-High** | validated |
| Reliability / don't lose my history | **Durable storage, no data loss** (a trust message, esp. FR after Joliebulle/Little Bock) | High × Med = **Med-High** | validated |

## Stage 3 — Intermediate · clone & community (depth — the desk wedge)

| Need | Feature | Opportunity | Confidence |
|---|---|---|---|
| Recreate a specific beer I love | **Searchable, curated clone repository** | Very High × High = **Very High** | validated |
| Published clones are wrong / static | **Versioned, community-validated clones** (the iteration loop nobody owns) | High × Very High = **High** | hypothesis |
| Share without losing authorship | **Sharing with author credit** (multi-group, bulk export) | Med-High × High = **High** | validated (EN) / hypothesis (FR) |
| A shared recipe doesn't fit my kit | **Auto-rescale to the recipient's equipment** | Med × High = **Med-High** | hypothesis |

**Cross-cutting (all stages):** a **fair, generous free tier** — paywall fatigue is one of the strongest
desk signals; it's a pricing principle, not a feature. Don't compete on calculation (incumbents win there).

## Build order (the answer to "what do we implement, and in what order")

1. **P0 — the assistant entry (Stage 1):** guided brew-day assistant + beginner catalog + fermentation
   tracking + clean UX + offline tolerance. *This is the wedge we ship and validate first.*
2. **P1 — retention (Stage 2):** organization & search, batch history, BeerXML import/export, durability.
3. **P2 — depth (Stage 3):** clone repository → versioned clones → credited sharing → auto-rescale.

The clone repository scores **Very High** on raw opportunity, but it lives in Stage 3 because it serves
intermediates and needs a crowd. We **enter** by the assistant and **grow into** the community — "the app
that grows with the brewer."

## What the interviews must settle (ties to the [interview guide](/en/05-interview-guide))

- **The biggest open risk:** is the **beginner assistant** truly a strong, willing-to-pay-attention need,
  or do brewers "graduate" past it too fast to build a business on? (the *under-probed* rows above).
- Whether **attribution-sensitivity** holds in FR as it does in EN.
- Whether **versioning + auto-rescale** is felt as a real need or a nice-to-have.
- Whether intermediates would **switch** from an entrenched tool.

Until these are answered, treat the order above as the **best current bet**, not a settled roadmap.
