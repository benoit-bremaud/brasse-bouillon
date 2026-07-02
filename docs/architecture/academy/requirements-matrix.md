# Brewing Academy Requirements Matrix

## Scope

This matrix maps product needs to technical decisions and acceptance criteria.
It is intentionally implementation-oriented.

| ID | Need | Decision | Technical impact | Acceptance criteria | Priority |
| --- | --- | --- | --- | --- | --- |
| ACAD-REQ-001 | The Academy is a reference base, not the active tutorial. | Keep complete explanations in Academy and short contextual help in app flows. | Academy feature gets its own domain boundary. | Article pages can be opened independently from brew flows. | V1 |
| ACAD-REQ-002 | Users need beginner-first explanations without losing depth. | Articles include levels and optional deeper sections. | Metadata includes `level`, `prerequisites`, `learningObjectives`, and `teaches`. | A beginner article can still link to advanced notes. | V1 |
| ACAD-REQ-003 | Content must not remain hardcoded in screens. | Markdown/front matter is the canonical source. | Add parser, validator, and generated typed payloads. | New pilot articles render without article-specific JSX. | V1 |
| ACAD-REQ-004 | The app must work offline for core Academy content. | Generated content is bundled in the mobile app. | Repository reads local generated payloads. | Pilot articles open without network access. | V1 |
| ACAD-REQ-005 | Users need fast lookup on mobile. | Hub is search-first and category-aware. | Add local search index and compact mobile cards. | Search returns article and glossary results under normal mobile constraints. | V1 |
| ACAD-REQ-006 | Brewing terms must be explained consistently. | Glossary is central and structured. | Add `GlossaryTerm` contract and glossary repository. | The same term definition can be reused in article and future chatbot contexts. | V1 |
| ACAD-REQ-007 | Calculators and articles must reinforce each other. | Calculator links are bidirectional. | Add calculator link metadata and resolver. | Hops article links to IBU calculator and calculator links back to the article. | V1 |
| ACAD-REQ-008 | Brewing advice must be credible. | Sensitive topics require source metadata and review state. | Validation fails if required sources are missing. | Sensitive article cannot reach `published` without valid sources. | V1 |
| ACAD-REQ-009 | The future chatbot needs a reliable corpus. | Generate retrieval chunks from validated content later. | Content model includes source IDs, stable section IDs, and chunk candidates. | Article sections have stable identifiers usable as citations. | V1 prep |
| ACAD-REQ-010 | Chatbot must be safe and sourced. | Future RAG answers must cite Academy sources and abstain when unsupported. | Add future `RetrievalChunk` and `ChatbotAnswer` contracts only as prep. | Future chatbot sequence never answers from unsourced free text. | V2 |
| ACAD-REQ-011 | UX must work on phones and tablets. | Mobile-first layout with tablet-aware constraints. | Renderer supports compact and wider article layouts. | No overlap, clipping, or unreadable dense content on common mobile widths. | V1 |
| ACAD-REQ-012 | Accessibility must be treated as a requirement. | Visuals and controls carry accessible text. | Renderer maps image and diagram metadata to accessibility props. | Image blocks have useful accessible text or are marked decorative by design. | V1 |
| ACAD-REQ-013 | Editorial workflow must be simple. | Use Git review and article lifecycle states. | Front matter includes `status`, `version`, and review metadata. | Draft content does not appear in the published mobile index. | V1 |
| ACAD-REQ-014 | Implementation must remain maintainable. | Use Clean boundaries and pragmatic design patterns. | Domain, data, application, presentation layers are separated. | Screens do not parse Markdown, validate schemas, or resolve raw paths. | V1 |
| ACAD-REQ-015 | The system must be easy to test. | Validation and rendering behavior are deterministic. | Parser/generator and repositories expose pure testable functions where possible. | Unit tests can run without network or LLM calls. | V1 |

## Requirement Traceability

- ACAD-REQ-001 to ACAD-REQ-005 map to hub and article reader work.
- ACAD-REQ-006 to ACAD-REQ-008 map to domain validation work.
- ACAD-REQ-009 and ACAD-REQ-010 prepare the chatbot without implementing it.
- ACAD-REQ-011 and ACAD-REQ-012 map to mobile UX and accessibility.
- ACAD-REQ-013 to ACAD-REQ-015 map to quality gates and maintainability.
