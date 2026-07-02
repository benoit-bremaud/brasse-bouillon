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
  box Presentation
    participant UI as "AcademyChatbotScreen"
  end
  box Application
    participant API as "AcademyAssistantUseCase"
    participant Guard as "PrivacySafetyGuard"
    participant RetrievalPort as "RetrievalPort"
    participant LlmPort as "LlmPort"
    participant Citations as "CitationBuilder"
  end
  box Domain
    participant Policy as "SourcedAnswerPolicy"
    participant Answer as "ChatbotAnswer"
  end
  box Adapter
    participant Retrieve as "AcademyRetrievalAdapter"
    participant LLM as "LlmProviderAdapter"
  end
  box Framework_Driver
    participant Index as "Academy retrieval index"
    participant Provider as "External LLM provider"
  end

  B->>UI: Ask brewing question
  UI->>API: POST question (session only)
  API->>Guard: validate request and privacy policy
  Guard-->>API: allowed
  API->>RetrievalPort: retrieve relevant chunks
  RetrievalPort->>Retrieve: retrieve with configured strategy
  Retrieve->>Index: search Academy + glossary chunks
  Index-->>Retrieve: ranked chunks + sources

  alt no reliable source
    Retrieve-->>API: insufficient evidence
    API->>Policy: build abstention
    Policy-->>Answer: no sourced answer
    API-->>UI: no sourced answer + related articles
    UI-->>B: "No validated Academy source yet"
  else sources found
    Retrieve-->>API: contextual chunks
    API->>Policy: validate source coverage
    Policy-->>API: source-only prompt constraints
    API->>LlmPort: answer with strict source-only prompt
    LlmPort->>LLM: call provider adapter
    LLM->>Provider: request completion
    Provider-->>LLM: provider response
    LLM-->>API: draft answer
    API->>Citations: attach article/section/source citations
    Citations-->>Answer: sourced answer
    Answer-->>API: ChatbotAnswer
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
- Clean Architecture is shown because the future chatbot crosses UI,
  application policy, domain answer rules, retrieval/LLM adapters, and external
  providers.
- The use case depends on `RetrievalPort` and `LlmPort`, not directly on vector
  storage or LLM provider SDKs.

## Future Extensions

- V2: troubleshooting decision trees and guided diagnostics.
- V3: explicit-consent access to brew session, recipe, equipment, and
  measurements.
- Later: vector search if lexical retrieval is not enough.
