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
  box Source_Driver
    participant Git as "Git repository"
    participant Markdown as "Markdown/front matter files"
  end
  box Pipeline_Adapter
    participant Parser as "ContentParserAdapter"
    participant Blocks as "ContentBlockFactory"
    participant Gen as "TypedContentGenerator"
  end
  box Domain_Validation
    participant Schema as "AcademySchemaSpecifications"
    participant Links as "AcademyLinkSpecifications"
    participant Safety as "AcademySafetySpecifications"
  end
  box Generated_Driver
    participant Mobile as "Generated mobile content"
    participant Retrieval as "Retrieval chunks (future)"
  end

  E->>Git: Add or edit Markdown article
  Git->>Markdown: version content source
  Markdown->>Parser: read docs/academy/**/*.md
  Parser->>Parser: split front matter and Markdown body
  Parser-->>Schema: parsed article documents

  Schema->>Schema: validate required metadata
  Schema->>Schema: validate enums and dates
  Schema->>Schema: validate review/source fields
  Schema->>Safety: validate sensitive content rules

  alt metadata invalid
    Schema-->>E: fail with actionable errors
  else metadata valid
    Schema-->>Links: validated documents
    Links->>Links: validate article slugs
    Links->>Links: validate glossary terms
    Links->>Links: validate calculator slugs
    Links->>Links: validate source references
    Links->>Safety: validate source requirements

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
      Gen->>Retrieval: write retrieval chunks (future)
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
- This sequence shows Clean boundaries because generation crosses source
  drivers, parser/generator adapters, domain validation specifications, and
  generated drivers.
- Domain validation specifications must not depend on filesystem, Markdown
  parser, or mobile output details.
