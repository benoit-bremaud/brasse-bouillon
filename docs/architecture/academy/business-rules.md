# Brewing Academy Business Rules

## Content Lifecycle

| Rule | Description | Validation |
| --- | --- | --- |
| ACAD-BR-001 | Only `published` articles appear in the mobile Academy index. | Generator excludes other states from published payload. |
| ACAD-BR-002 | `draft` and `review` articles may be generated for preview only. | Preview mode must be explicit. |
| ACAD-BR-003 | `deprecated` articles must keep stable slugs if still referenced. | Link validator rejects unresolved references. |
| ACAD-BR-004 | Article slugs are stable once published. | Slug changes require explicit migration notes. |

## Source And Review Rules

| Rule | Description | Validation |
| --- | --- | --- |
| ACAD-BR-010 | Sensitive articles require at least one source. | Generator fails on missing source metadata. |
| ACAD-BR-011 | Sensitive articles require review metadata before publication. | `review.confidenceLevel` cannot be `draft` for published sensitive content. |
| ACAD-BR-012 | Source IDs must resolve in the source registry. | Link validator checks every `SourceReference.id`. |
| ACAD-BR-013 | Formulas and safety guidance must cite a source when sensitive. | Block-level validation checks source references. |

## Link Rules

| Rule | Description | Validation |
| --- | --- | --- |
| ACAD-BR-020 | Article links must resolve to existing article slugs. | Generator fails on broken article links. |
| ACAD-BR-021 | Section links must resolve to existing stable section IDs. | Generator fails on broken section IDs. |
| ACAD-BR-022 | Glossary references must resolve to central glossary terms. | Generator fails on missing glossary slugs. |
| ACAD-BR-023 | Calculator links must use known calculator slugs. | Link resolver test covers known calculator mapping. |
| ACAD-BR-024 | Calculator links are bidirectional when a calculator is related to an article. | Test asserts article-to-calculator and calculator-to-article relationship. |

## Rendering Rules

| Rule | Description | Validation |
| --- | --- | --- |
| ACAD-BR-030 | Screens render content blocks, not article-specific UI branches. | Renderer tests use multiple article fixtures. |
| ACAD-BR-031 | Unsupported blocks fail generation or render a controlled fallback. | Tests cover unsupported block handling. |
| ACAD-BR-032 | Raw Markdown is not parsed at runtime. | Screen code review and imports check. |
| ACAD-BR-033 | Visual content must include accessible text or be explicitly decorative. | Renderer validation checks diagram/image metadata. |

## Search Rules

| Rule | Description | Validation |
| --- | --- | --- |
| ACAD-BR-040 | Search indexes only published content by default. | Generated search index excludes draft and review content. |
| ACAD-BR-041 | Search results resolve through `AcademyLinkResolver`. | Search result tests assert semantic targets. |
| ACAD-BR-042 | Empty queries show curated entry points instead of noisy results. | Hub tests cover empty search state. |

## Future Chatbot Rules

| Rule | Description | Validation |
| --- | --- | --- |
| ACAD-BR-050 | Chatbot must answer from validated Academy or glossary content only. | Future RAG eval gate rejects unsupported answers. |
| ACAD-BR-051 | Chatbot must cite article sections or source references. | Future answer contract includes citations. |
| ACAD-BR-052 | Chatbot must abstain when retrieval confidence is insufficient. | Future eval tests include unknown questions. |
| ACAD-BR-053 | No persistent conversation history in first chatbot version. | API and storage review. |
