# Sequence diagram - open an Academy article

> **Feature**: mobile article opening and rendering from generated content.

## Context

The hub loads lightweight metadata. The article screen loads the selected
article payload and renders blocks through a reusable renderer.

## Diagram

```mermaid
sequenceDiagram
  actor B as Brewer
  participant H as "Mobile - AcademyHubScreen"
  participant UC as "Academy use cases"
  participant Repo as "AcademyRepository"
  participant Index as "Generated academy index"
  participant Screen as "Mobile - AcademyArticleScreen"
  participant Payload as "Generated article payload"
  participant Renderer as "AcademyArticleRenderer"
  participant Links as "AcademyLinkResolver"

  B->>H: Open Academy
  H->>UC: getAcademyIndex()
  UC->>Repo: loadIndex()
  Repo->>Index: read metadata
  Index-->>Repo: article cards, categories, FAQ
  Repo-->>UC: AcademyIndex
  UC-->>H: display hub

  B->>H: Tap article slug
  H->>Screen: navigate(slug)
  Screen->>UC: getArticle(slug)
  UC->>Repo: loadArticle(slug)
  Repo->>Payload: read generated article content
  alt article found
    Payload-->>Repo: AcademyArticle
    Repo-->>UC: AcademyArticle
    UC-->>Screen: AcademyArticle
    Screen->>Renderer: render(article.body.sections)
    Renderer->>Links: resolve glossary / calculator / related routes
    Links-->>Renderer: resolved actions
    Renderer-->>B: article UI
  else article missing
    Repo-->>UC: not found
    UC-->>Screen: not found result
    Screen-->>B: not found state + back to Academy
  end
```

## Notes

- The screen receives article data, not slug-specific JSX.
- Missing articles must render a controlled empty state.
- Glossary and calculator links are resolved by a shared resolver.
- Tablet behavior may change layout, not data flow.
