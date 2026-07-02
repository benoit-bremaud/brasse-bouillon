# Sequence diagram - generate Academy content

> **Feature**: build-time Markdown/front matter validation and typed payload
> generation.

## Context

The content pipeline converts editorial Markdown into data that the mobile app
can import safely. It catches broken metadata, unknown categories, invalid
glossary references, broken article links, and unsupported blocks before runtime.

## Diagram

```mermaid
sequenceDiagram
  actor E as Editor
  participant Git as "Git repository"
  participant Parser as "Content parser"
  participant Schema as "Schema validator"
  participant Links as "Link validator"
  participant Blocks as "Block transformer"
  participant Gen as "Content generator"
  participant Mobile as "Generated mobile content"

  E->>Git: Add or edit Markdown article
  Git->>Parser: read docs/academy/**/*.md
  Parser->>Parser: split front matter and Markdown body
  Parser-->>Schema: parsed article documents

  Schema->>Schema: validate required metadata
  Schema->>Schema: validate enums and dates
  Schema->>Schema: validate review/source fields

  alt metadata invalid
    Schema-->>E: fail with actionable errors
  else metadata valid
    Schema-->>Links: validated documents
    Links->>Links: validate article slugs
    Links->>Links: validate glossary terms
    Links->>Links: validate calculator slugs
    Links->>Links: validate source references

    alt links invalid
      Links-->>E: fail with broken-link report
    else links valid
      Links-->>Blocks: linked documents
      Blocks->>Blocks: convert Markdown/custom blocks
      Blocks->>Blocks: reject unsupported blocks
      Blocks-->>Gen: normalized article model
      Gen->>Mobile: write academy index
      Gen->>Mobile: write article payloads
      Gen->>Mobile: write glossary payload
      Gen->>Mobile: write search entries
      Gen->>Mobile: write retrieval chunks (future)
      Mobile-->>E: generated content ready
    end
  end
```

## Notes

- Validation must be deterministic and CI-friendly.
- The parser should produce clear errors with file path and line/field context
  where possible.
- Retrieval chunk generation can be present as a future-facing artifact, but the
  chatbot remains out of V1 runtime scope.
