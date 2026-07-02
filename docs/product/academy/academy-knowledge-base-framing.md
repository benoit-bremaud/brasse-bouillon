# Brewing Academy knowledge base framing

## Status

Draft framing validated in conversation before implementation.

This document defines the product and design direction for the Brasse-Bouillon
Brewing Academy refactor. It is intentionally implementation-oriented: the
subsequent UML study, backlog, and code should implement the boundaries and
flows described here.

## Product Positioning

The Brasse-Bouillon mobile app remains the active pedagogical guide. It helps a
novice brewer progress through recipes, brew preparation, live batch guidance,
calculators, measurements, and contextual help.

The Brewing Academy is different. It is the reference knowledge base:

- It explains brewing concepts in depth.
- It answers questions raised by app workflows.
- It gives examples, sources, formulas, glossary links, and related tools.
- It provides a stable corpus for the future brewing chatbot.
- It should eventually be credible enough for brewing training centers to
  recommend as a pedagogical reference.

Product rule:

```text
Short help lives in the app flow.
Complete explanations live in the Academy.
Conversational answers later come from the Academy corpus.
```

## Target Audience

The default user experience must be beginner-first, but the Academy must support
all levels over time.

The first reading layer should be simple, reassuring, and explicit. Intermediate
and advanced content should remain available through "go deeper" sections,
technical notes, formulas, source references, and cross-links.

This avoids two failure modes:

- A beginner-only Academy that becomes shallow.
- An expert-first Academy that loses novice users on mobile.

## Scope Principles

### V1 Scope

V1 focuses on a high-quality vertical slice:

- Markdown + front matter as the editorial source.
- Git as the versioning and review mechanism.
- Three pilot articles: `houblons`, `levures`, `eau`.
- Mobile-first article reading UX, tablet-aware layout constraints.
- A lightweight hub with search, categories, reference articles, and FAQ links.
- A central structured glossary model.
- Bidirectional links between Academy articles and calculators.
- Strong source and review metadata.
- A generation and validation path that prevents hardcoded article content in
  React Native screens.

### Explicitly Out Of V1

The following are important but intentionally deferred:

- Backend-powered article publishing.
- Headless CMS or editorial back office.
- Persistent chatbot history.
- User-specific chatbot personalization.
- Full diagnostic chatbot.
- Vector search.
- Certification or quiz features.
- Public website publishing.

The V1 must be shaped so these can be added later without replacing the content
model.

## Architecture Direction

The canonical editorial source is Markdown with strict front matter.

```text
docs/academy/**/*.md
  -> parser and validator
  -> generated typed content for the mobile app
  -> Academy hub, article renderer, glossary, search
  -> future search index and chatbot retrieval corpus
```

This keeps editorial work separate from UI code while preserving offline
availability for core content.

The current hardcoded JSX article blocks should be treated as transitional
legacy content. New Academy content must be content data rendered by reusable
components, not conditional UI code tied to individual slugs.

## Editorial Source

V1 should use Markdown files with strict YAML front matter.

Example:

```yaml
---
title: "Hops"
slug: "houblons"
category: "ingredients"
level: "beginner"
status: "published"
version: "1.0.0"
estimated_read_time: 10
tags: ["hop", "ibu", "aroma", "boil-addition"]
related_calculators: ["houblons"]
related_glossary_terms: ["ibu", "dry-hop", "alpha-acids"]
sensitive: false
---
```

The article body should use Markdown plus a small controlled set of custom
blocks. The source must not become arbitrary embedded React components.

Allowed V1 block families:

- Paragraphs.
- Headings.
- Bullet lists.
- Tables.
- Formulas.
- Callouts.
- Calculator calls to action.
- Glossary references.
- Related article references.
- Source references.

## Article Metadata

Every article should carry enough metadata to support:

- Hub display.
- Search.
- Filtering.
- Related content.
- Source quality.
- Future chatbot citations.
- Future pedagogical paths.

Required article metadata:

```yaml
title: string
slug: string
category: AcademyCategory
level: beginner | intermediate | advanced
status: draft | review | published | deprecated
version: string
summary: string
estimated_read_time: number
tags: string[]
updated_at: YYYY-MM-DD
```

Recommended article metadata:

```yaml
related_calculators: string[]
related_glossary_terms: string[]
related_articles: string[]
faq_questions: string[]
learning_objectives: string[]
prerequisites: string[]
teaches: string[]
sensitive: boolean
risk_topics: string[]
sources: SourceReference[]
review:
  confidence_level: draft | reviewed | validated
  reviewed_by: string | null
  reviewed_at: YYYY-MM-DD | null
  notes: string[]
```

## Categories And Discovery

The Academy should be organized as a reference knowledge base, not primarily as
a learning path. Categories form the main structure; tags, levels, journeys, and
related app features act as secondary dimensions.

Recommended category backbone:

- Getting started.
- Ingredients.
- Process.
- Fermentation.
- Water.
- Equipment.
- Beer styles.
- Safety.
- Troubleshooting.
- Glossary.

Each article can also be attached to future learning paths:

```yaml
journeys:
  - "first-brew"
  - "improve-a-recipe"
related_features:
  - "calculator:houblons"
  - "brew-step:boil"
```

## Glossary Strategy

The glossary is a central structured knowledge object, not only an A-Z article.

Each term should have:

- A canonical slug.
- A display term.
- Aliases and acronyms.
- A short definition.
- Optional long explanation.
- Related articles.
- Related calculators.
- Level.
- Category.

Example:

```yaml
slug: "density"
term: "Density"
aliases: ["OG", "FG", "specific gravity", "gravity"]
short_definition: "A measurement of dissolved extract concentration in wort or beer."
related_articles: ["alcohol-density", "fermentation"]
related_calculators: ["fermentescibles"]
level: "beginner"
```

The glossary must be reusable by:

- Academy articles.
- Recipe details.
- Brew guidance.
- Calculators.
- Future chatbot answers.

## Article UX

The article experience must be mobile-first and tablet-aware.

Reading principle:

```text
Understand quickly.
Go deeper without getting lost.
Return to the original app context easily.
```

Recommended article layout:

- Title and badges.
- Quick summary.
- Key takeaways.
- Compact table of contents.
- Progressive detailed sections.
- Concrete example.
- Common mistakes.
- Related glossary terms.
- Related calculator CTA.
- Related articles.
- Sources and review notes.

Long sections may be collapsible when useful. The design must avoid dense
desktop documentation patterns on mobile.

Tablet layout can add a side summary or table of contents, but the V1 should
not require a separate tablet implementation.

## Hub UX

The Academy hub should behave like a mobile knowledge base entrypoint.

Recommended hub structure:

```text
Brewing Academy

[Search a concept, step, or term...]

Reference articles
- Hops
- Yeast
- Brewing water

Categories
[Ingredients] [Process] [Fermentation] [Water]
[Safety] [Troubleshooting] [Glossary]

Frequent questions
- What is IBU?
- Why does fermentation not start?
- How can I avoid flat beer?
```

Hub requirements:

- Search visible near the top.
- Compact mobile cards.
- Category chips or a mobile-friendly grid.
- No long instructional copy.
- Fast route to pilot reference articles.
- FAQ links that route to article sections, glossary terms, or calculators.

## Visuals

The Academy should use purposeful pedagogical visuals, not decoration.

V1 visual direction:

- Hops: boil addition timeline and bitterness/aroma/stability role diagram.
- Yeast: sugar to alcohol, CO2, and aroma diagram; fermentation activity curve.
- Water: main brewing ions and their effect on flavor/process.

Visual requirements:

- Mobile optimized.
- Tablet scalable.
- Accessible text for visual content, using React Native `Image` `alt` where
  available and accessibility labels or hints for interactive controls.
- Lightweight.
- Prefer simple SVG or native diagram components when appropriate.

## Calculator Links

Academy and calculators must be bidirectionally linked.

Examples:

```text
Hops article
  -> Open IBU calculator

IBU calculator
  -> Understand IBU and hop additions
```

Embedded mini-calculators inside articles are out of V1. The V1 should use clear
CTAs and deep links.

## FAQ And Troubleshooting

V1 should include a lightweight FAQ section on the hub. Each question should
route to an existing article, glossary term, calculator, or section.

V2 can introduce a dedicated troubleshooting category with articles structured
around brewing problems and safe diagnostic steps.

This is a direct foundation for a future diagnostic chatbot.

## Editorial Workflow

V1 editorial workflow stays lightweight:

```text
draft -> review -> published -> deprecated
```

Git branches and PRs provide review and history. Front matter stores visible
content status and review metadata.

The workflow must be compatible with a stricter future process:

```text
draft -> technical review -> editorial review -> published
```

## Source And Review Rigor

The long-term ambition is that brewing training centers can recommend the
Academy as a credible pedagogical reference.

Therefore V1 must already include source metadata, especially for technical and
sensitive subjects.

Source requirements:

- Sources are mandatory for sensitive or technical content.
- Sources may be hidden from the primary article UI at first, but must be stored.
- Future UI can expose sources more prominently.
- Chatbot answers must be able to cite article sections and source references.

Sensitive topics include:

- Bottle pressure.
- CO2.
- Chemical cleaning.
- Contamination.
- Alcohol and health.
- Safety-critical process advice.

## Chatbot Direction

The chatbot is not a V1 feature. The content architecture must prepare it.

Progression:

```text
V0: Academy search and article suggestions.
V1: sourced RAG chatbot over Academy + glossary.
V2: vector search if lexical search is insufficient.
V3: contextual chatbot using brew session, recipe, and equipment data.
```

Chatbot V1 constraints:

- Answers only from validated Academy and glossary content.
- No unsourced affirmative answer.
- Display citations and links.
- No persistent server-side conversation history.
- No user-specific data usage.
- Stronger caution for sensitive topics.

Expected V1 answer format:

```text
Direct answer
2-4 clear sentences.

Explanation
Why / how it works.

Sources
- Academy article: ...
- Glossary: ...

Go deeper
- Read the full article
- Open the related calculator

Caution
Only when the subject is sensitive.
```

## RGPD And Privacy

The chatbot and any future analytics must follow privacy-by-design principles:

- No persistent history by default.
- Explicit consent before any collection.
- Data minimization.
- Clear purpose.
- Limited retention.
- User deletion path.
- Strong anonymization or pseudonymization for product learning.

V1 chatbot history, if prototyped, should be session-only.

## Engineering Principles

The implementation must follow project architecture constraints and the
following principles:

- Clean Architecture boundaries where code is added.
- SOLID for renderer and use-case contracts.
- KISS: implement the vertical slice before generalizing.
- YAGNI: no backend/CMS/vector search before the content model proves itself.
- DRY: one glossary and one content model reused across Academy, search, and
  future chatbot.

ADR-0001 applies: build only the V1 need, but name and shape contracts so the
future chatbot, public web Academy, and stricter editorial workflow can land
without replacing the foundation.

## Pilot Articles

V1 pilot articles:

- `houblons`.
- `levures`.
- `eau`.

These cover:

- Different categories.
- Rich glossary links.
- Calculator relationships.
- Technical content.
- Source requirements.
- Visual explanation needs.
- Future chatbot retrieval needs.

## High-Level Backlog

1. Define Academy content and glossary schemas.
2. Create Markdown/front matter authoring structure.
3. Build a validator for article metadata, links, categories, glossary terms, and
   related calculators.
4. Generate typed mobile Academy index and article payloads.
5. Build the mobile article renderer.
6. Build the mobile hub refactor.
7. Add local search over titles, summaries, tags, categories, and glossary terms.
8. Migrate pilot articles: Hops, Yeast, Water.
9. Add bidirectional calculator links.
10. Add source and review metadata display rules.
11. Prepare generated retrieval chunks for future chatbot.
12. Build backlog and ADRs for backend/search/chatbot only after the V1 slice is
    validated.

## Definition Of Done For The V1 Slice

- No pilot article content is hardcoded as slug-specific JSX.
- The hub loads from generated index metadata.
- Pilot article details load from generated article content.
- Article renderer supports the required V1 block families.
- Glossary references resolve from a central glossary model.
- Calculator CTAs are driven by metadata.
- Search finds pilot articles and glossary terms.
- Sources and review metadata are validated.
- Mobile layout is the primary tested layout.
- Tablet layout does not regress readability.
- Tests cover happy path, invalid slug, missing article, glossary link, calculator
  CTA, and search behavior.
