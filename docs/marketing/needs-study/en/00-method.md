# Marketing Needs Study — Method

## Why this study exists

No formal user-needs study had ever been done for Brasse-Bouillon. Before investing further
in features and positioning, we run a proper marketing needs study to identify what
intermediate homebrewers actually want, validate (or kill) our differentiating hypothesis,
and ground product decisions in evidence rather than assumption.

## Strategic frame (decided during the kickoff debrief)

- **Primary target (beachhead):** regular / intermediate homebrewers; international / English-speaking
  first, French also in scope.
- **Product language:** bilingual FR + EN (implies an i18n effort tracked as a separate epic).
- **Positioning hypothesis:**
  - **Hook (hero):** a community for cloning and sharing beer recipes.
  - **Foundation (table-stakes):** recipe organization + brew/fermentation tracking.
- **Starting channels (2):** r/Homebrewing (users) + Indie Hackers (founder build-in-public);
  LinkedIn kept in French for the founder's reconversion narrative.

## Research design

Two phases, cheap-to-expensive:

1. **Secondary research (desk research) — DONE.** Mine what already exists publicly: competitor
   app reviews, Reddit, homebrewing forums. Cheap, fast, generates hypotheses.
2. **Primary research — TODO.** Talk to real brewers: a structured interview guide
   (via the `customer-research` skill) + 10-15 interviews to confirm or refute the desk findings.

The order matters: secondary first to build hypotheses, primary second to confirm with real people.

## Secondary research execution

Six desk passes across source families:

- `01-desk-competitors.md` — reviews of Brewfather, BeerSmith, Brewer's Friend, BrewBuddy, and adjacent apps.
- `02-desk-reddit.md` — r/Homebrewing recurring questions and pains.
- `03-desk-forums.md` — HomeBrewTalk (EN) + brassageamateur.com (FR).
- `03b-desk-french.md` — dedicated French-language pass (FR blogs, tools, community channels).
- `03c-desk-market-data.md` — quantitative layer (market size, downloads, recipe-DB sizes, uncovered competitors).
- `03d-desk-french-market.md` — snowball pass on the French homebrewer population / market (fills the FR data gap).
- `04-synthesis.md` — consolidated needs map + market context + one-sentence positioning statement.
- `05-interview-guide.md` — bilingual primary-research instrument (JTBD interview guide).
- `06-report.md` — final report (epic closure deliverable; written after primary research).

## Method limitations (read before trusting the numbers)

- **Reddit and HomeBrewTalk block automated fetching (HTTP 403).** r/Homebrewing findings are
  *inferred* from adjacent forums and from the prevalence of clone-recipe compilations, not from
  direct thread reads or upvote counts. HomeBrewTalk findings rely on search-result snippets.
  brassageamateur.com was fetched directly.
- **Frequency signals are qualitative** (recurrence of distinct threads / reviews), not scraped counts.
  Treat rankings as directional.
- **Forums over-represent people who are stuck** — a strong hypothesis generator, not proof.
  This is exactly why primary research (interviews) follows.
- To harden: read a sample of r/Homebrewing threads via an authenticated/API path and tag posts by
  theme for true counts.

## Status

- Secondary research: complete (captured in `01`–`03d`, consolidated in `04`).
- Primary research: not started.
- Final report: not started.
