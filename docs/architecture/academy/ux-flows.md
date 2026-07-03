# Brewing Academy UX Flows

## UX Principles

- The first screen should be useful immediately, not a marketing page.
- Mobile is the primary layout target; tablet gets better density without
  changing the mental model.
- Search, categories, and common questions are the main entry points.
- Articles should be readable in short sessions.
- Technical depth is progressive: beginner summary first, deeper material later.
- Controls must be familiar, accessible, and stable.

## Academy Hub

### Primary Content

- Search input visible near the top.
- Pilot article cards: `houblons`, `levures`, `eau`.
- Category chips or a compact category grid.
- Frequent questions linked to article sections, glossary terms, or calculators.
- Recently updated or recommended references if useful after V1.

### States

| State | Expected behavior |
| --- | --- |
| Ready | Search, categories, pilot cards, FAQ links visible. |
| Empty corpus | Controlled empty state explaining that Academy content is unavailable. |
| Search empty | Show curated article/category suggestions. |
| Search no result | Show clear no-result message and category shortcuts. |
| Invalid link | Show controlled error and return action. |

## Article Reader

### Layout

- Title, summary, level, reading time, category, and update date above content.
- Optional table of contents for long articles.
- Section headings with stable anchors.
- Inline glossary references.
- Callouts for warnings, tips, and technical notes.
- Calculator CTAs placed near relevant concepts.
- Source references visible without overwhelming beginners.

### Mobile Constraints

- No nested cards for ordinary sections.
- Text wraps before shrinking.
- Tables must be horizontally scrollable or transformed into readable rows.
- Formula blocks must avoid clipping.
- Diagrams must scale inside parent width.
- Touch targets must remain comfortable.

### Tablet Constraints

- Use extra width for table of contents, source side notes, or glossary preview
  only if readability improves.
- Do not create a desktop-only interaction model.

## Glossary Interaction

V1 recommended behavior:

- Inline glossary term opens a modal or bottom sheet.
- The modal shows short definition first.
- Detailed definition and related terms are secondary.
- A link to the full glossary entry can be added later.

Required states:

- Known term.
- Missing term fallback.
- Related term navigation.

## Calculator Links

User flow:

1. User reads a concept in an article.
2. Article shows a calculator CTA.
3. User opens calculator through resolved route.
4. Calculator offers a contextual link back to the article or section.

Rules:

- CTAs must explain why the calculator is relevant.
- Routes must be resolved centrally.
- Calculator screens should not duplicate long Academy explanations.

## Future Chatbot Entry

The chatbot is not V1, but UX preparation should reserve a future entry point:

- Suggested location: Academy hub or article-level "Ask about this topic".
- The bot must clearly indicate that it answers from Academy sources.
- The bot must warn users not to share personal data.
- Citations must be visible in answer UI.
- Abstention must feel intentional, not broken.

## Accessibility Checklist

- Search input has accessible label and clear placeholder.
- Icon-only controls have labels.
- Images and diagrams have useful alternative text unless decorative.
- Links have visible text explaining destination.
- Color is not the only way to convey callout meaning.
- Screen reader order follows visual order.
- Focus does not get trapped in glossary modal or future chatbot panel.
