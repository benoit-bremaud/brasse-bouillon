# Context diagram - Academy knowledge base

> **Feature**: Brewing Academy as a reference knowledge base.
> **Scope**: Mobile-first V1 with future chatbot path.

## Context

The app guides users through brewing workflows. The Academy answers deeper
questions raised by those workflows. The future chatbot is a conversational
interface over the same validated Academy and glossary corpus.

## Diagram

```mermaid
flowchart LR
  Brewer(("Brewer"))
  Editor(("Content editor"))

  subgraph Repo ["Git repository"]
    MD["Markdown articles<br/>docs/academy/**/*.md"]
    GlossarySrc["Glossary source<br/>structured content"]
    Sources["Source references<br/>books, standards, docs"]
  end

  subgraph Build ["Build-time content pipeline"]
    Parser["Academy parser"]
    Validator["Front matter and link validator"]
    Generator["Typed content generator"]
  end

  subgraph Mobile ["Brasse-Bouillon mobile app"]
    AppGuide["Active brewing guidance<br/>recipes, batches, calculators"]
    AcademyHub["Academy hub"]
    ArticleReader["Article reader"]
    Glossary["Glossary lookup"]
    LocalSearch["Local Academy search"]
    Calculators["Brewing calculators"]
  end

  subgraph Future ["Future cloud-assisted features"]
    SearchIndex["Search / retrieval index"]
    Chatbot["Sourced brewing chatbot"]
    Backend["Optional product backend APIs"]
  end

  Editor --> MD
  Editor --> GlossarySrc
  Editor --> Sources

  MD --> Parser
  GlossarySrc --> Parser
  Parser --> Validator
  Validator --> Generator
  Generator --> AcademyHub
  Generator --> ArticleReader
  Generator --> Glossary
  Generator --> LocalSearch
  Generator -. future chunks .-> SearchIndex

  Brewer --> AppGuide
  Brewer --> AcademyHub
  Brewer --> LocalSearch
  AcademyHub --> ArticleReader
  ArticleReader --> Glossary
  ArticleReader --> Calculators
  Calculators --> ArticleReader
  AppGuide --> ArticleReader

  Brewer -. future question .-> Chatbot
  Chatbot -. retrieve .-> SearchIndex
  SearchIndex -. source content .-> Generator
  Chatbot -. optional APIs .-> Backend
```

## Notes

- V1 does not require a backend for Academy content.
- V1 content is bundled/generated for mobile offline access.
- The future chatbot must cite generated article/glossary sources.
- App guidance remains separate from Academy reference content.
