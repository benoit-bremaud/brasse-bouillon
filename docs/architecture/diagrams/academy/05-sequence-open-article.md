# Sequence diagram - open an Academy article

> **Feature**: mobile article opening and rendering from generated content.

## Context

The hub loads lightweight metadata. The article screen loads the selected
article payload and renders blocks through a reusable renderer.

## Diagram

```mermaid
sequenceDiagram
  actor B as Brewer
  box Presentation
    participant H as "AcademyHubScreen"
    participant Screen as "AcademyArticleScreen"
    participant Renderer as "AcademyArticleRenderer"
  end
  box Application
    participant UC as "AcademyArticleUseCases"
    participant Presenter as "AcademyArticlePresenter"
    participant LinkPort as "AcademyLinkResolverPort"
  end
  box Domain
    participant Article as "AcademyArticle"
    participant Blocks as "AcademyContentBlock[]"
  end
  box Adapter
    participant Repo as "GeneratedAcademyRepository"
    participant Links as "ExpoAcademyLinkResolver"
  end
  box Framework_Driver
    participant Index as "Generated academy index"
    participant Payload as "Generated article payload"
  end

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
    Payload-->>Repo: raw generated article data
    Repo-->>Article: map to domain article
    Article-->>Repo: AcademyArticle
    Repo-->>UC: AcademyArticle
    UC->>Presenter: toArticleViewModel(article)
    Presenter->>Blocks: read block contracts
    Blocks-->>Presenter: renderable sections
    Presenter-->>UC: ArticleViewModel
    UC-->>Screen: ArticleViewModel
    Screen->>Renderer: render(viewModel.sections)
    Renderer->>LinkPort: resolve semantic link targets
    LinkPort->>Links: resolve with Expo Router mapping
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
- Clean Architecture is shown only because this scenario crosses presentation,
  application, domain, adapter, and generated-driver boundaries.
- Presentation depends on use cases and presenters; the domain does not depend
  on React Native, Expo Router, or generated files.
