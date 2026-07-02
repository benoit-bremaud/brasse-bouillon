# Sequence diagram - future sourced chatbot RAG

> **Feature**: future Academy chatbot.
> **Status**: design target only, out of V1 implementation.

## Context

The chatbot should answer only from validated Academy and glossary content. If
the retrieval layer cannot find a reliable source, the chatbot should refuse to
answer affirmatively and suggest related reading.

## Diagram

```mermaid
sequenceDiagram
  actor B as Brewer
  participant UI as "Mobile - AcademyChatbotScreen"
  participant API as "API - Academy assistant"
  participant Guard as "Privacy and safety guard"
  participant Retrieve as "Retrieval service"
  participant Index as "Academy retrieval index"
  participant LLM as "LLM provider"
  participant Citations as "Citation builder"

  B->>UI: Ask brewing question
  UI->>API: POST question (session only)
  API->>Guard: validate request and privacy policy
  Guard-->>API: allowed
  API->>Retrieve: retrieve relevant chunks
  Retrieve->>Index: search Academy + glossary chunks
  Index-->>Retrieve: ranked chunks + sources

  alt no reliable source
    Retrieve-->>API: insufficient evidence
    API-->>UI: no sourced answer + related articles
    UI-->>B: "No validated Academy source yet"
  else sources found
    Retrieve-->>API: contextual chunks
    API->>LLM: answer with strict source-only prompt
    LLM-->>API: draft answer
    API->>Citations: attach article/section/source citations
    Citations-->>API: sourced answer
    API-->>UI: answer + citations + related actions
    UI-->>B: display sourced answer
  end
```

## V1 Chatbot Constraints When Built

- No unsourced affirmative answers.
- No persistent conversation history by default.
- No user-specific brew data in the first assistant version.
- Sensitive topics require caution blocks.
- Answers should link back to article sections and glossary terms.

## Future Extensions

- V2: troubleshooting decision trees and guided diagnostics.
- V3: explicit-consent access to brew session, recipe, equipment, and
  measurements.
- Later: vector search if lexical retrieval is not enough.
