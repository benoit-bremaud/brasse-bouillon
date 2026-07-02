# Activity diagram - Academy local search

> **Feature**: V1 local search over generated Academy index and glossary.

## Context

V1 search should help a mobile user quickly find concepts, articles, FAQ items,
and glossary definitions. It is lexical and local. Full-text and semantic search
are future phases.

## Diagram

```mermaid
flowchart TD
  Start([User types query]) --> Normalize["Normalize query<br/>lowercase, trim, accents strategy, tokenization"]
  Normalize --> Empty{"Query empty?"}
  Empty -->|yes| Suggestions["Show default suggestions<br/>pilot articles, categories, FAQ"]
  Empty -->|no| SearchTitle["Search title and slug"]

  SearchTitle --> SearchSummary["Search summary"]
  SearchSummary --> SearchTags["Search tags and category"]
  SearchTags --> SearchGlossary["Search glossary terms and aliases"]
  SearchGlossary --> SearchFaq["Search FAQ prompts"]

  SearchFaq --> Score["Score matches"]
  Score --> HasResults{"Has results?"}

  HasResults -->|yes| Group["Group by type<br/>articles, glossary, FAQ, calculators"]
  Group --> Render["Render mobile search results"]
  Render --> Open{"User selects result"}
  Open -->|article| Article["Open article route"]
  Open -->|glossary| Glossary["Open glossary term"]
  Open -->|calculator| Calculator["Open calculator"]
  Open -->|faq| FaqTarget["Open target article section"]

  HasResults -->|no| NoResult["Show no-result state<br/>suggest categories and future chatbot entry"]

  Suggestions --> End([Done])
  Article --> End
  Glossary --> End
  Calculator --> End
  FaqTarget --> End
  NoResult --> End
```

## V1 Ranking Rules

1. Exact title or glossary term match.
2. Exact alias match.
3. Tag/category match.
4. Summary match.
5. FAQ prompt match.

## Notes

- V1 search must not require network access.
- Results should be compact and thumb-friendly.
- Query logs must not be persisted by default.
- Future no-result flows can feed anonymized content-gap analysis only with a
  clear RGPD-compliant consent path.
