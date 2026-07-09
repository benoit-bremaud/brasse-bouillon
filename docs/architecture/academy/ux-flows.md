# Brewing Academy UX Flows

## UX Principles

- The first screen should be useful immediately, not a marketing page.
- Mobile is the primary layout target; tablet gets better density without
  changing the mental model.
- Search, categories, and common questions are the main entry points.
- Articles should be readable in short sessions.
- Technical depth is progressive: beginner summary first, deeper material later.
- Controls must be familiar, accessible, and stable.

## Mobile Visual Review Follow-Ups

Observed during local Android emulator review on 2026-07-08 and 2026-07-09.
These are follow-up items, not immediate implementation scope. Items marked as
addressed still need one final emulator confirmation before the PR review.

### Must Fix

- Explicit navigation to an Academy page must follow the global app navigation
  invariant: new page = top of page; back navigation may restore the previous
  position when useful.
- Glossary explicit entry and glossary deep links must not reuse a stale middle
  scroll position.
- Glossary `termSlug` deep links must open the focused term card reliably.
- Glossary search ranking must prioritize exact term/title matches before
  secondary matches in definitions or related metadata. Example observed:
  searching `ibu` showed `Acide alpha` and `Calcium` before `IBU`.
- The glossary article should avoid showing duplicate glossary/article content
  below the interactive glossary section, especially when the keyboard is open.

### Should Improve

- The fixed detail header consumes significant vertical space while reading on a
  phone. Consider a compact or collapsible header pattern after the first screen.
- The article hero order should be reviewed when an article has a calculator
  CTA. In the current visual pass, the calculator CTA appears before the
  article summary content, which can make the page feel tool-first instead of
  reference-first.
- Category chips work horizontally, but partially clipped chips at the viewport
  edge are not self-explanatory. Consider a subtle horizontal fade or adjusted
  side padding.
- Search focus can remain visible after selecting a category chip. Consider
  dismissing search focus when the user switches category.
- Inline glossary reference chips work, but their visual treatment is minimal.
  Consider making them more explicit as tappable vocabulary references without
  adding heavy UI.
- Low-density category results can leave a large empty viewport. Consider
  suggested adjacent articles or a short helper state when a category has only
  one item.
- Replace current generic topic icons with a coherent pedagogical iconography or
  illustration set. Priority subjects: malt, hops, yeast, water, density,
  color, process, fermentation, glossary, and calculators.
- Plan a dedicated review of all calculator tools before relying on them as
  Academy-linked pedagogical references: formulas, units, rounding, edge cases,
  validation messages, source alignment, and educational wording.
- Before the calculator review/refactor, create a proper UML design study for
  calculator tools: use-case diagrams, domain class diagrams, sequence diagrams
  for calculations and validation, component boundaries, and Clean Architecture
  dependencies.
- Academy-to-calculator navigation should provide a clear way back to the
  originating article or concept when the user arrives from an Academy CTA.
- Calculator result sections must respect bottom navigation clearance. The
  fermentescibles calculator result card was partially hidden by the bottom nav
  during the visual pass.
- Hub and glossary empty states can later suggest adjacent categories, popular
  searches, or a one-tap clear action, but this is not a blocker for the current
  Academy slice.

### Addressed, Pending Visual Confirmation

- Article detail no longer repeats the article title in the fixed header and in
  the article hero. The fixed header now provides navigation context only.
- Academy article/detail scroll views now add extra bottom clearance above the
  bottom navigation.
- Calculator CTAs now name the target calculator instead of using only the
  generic "Ouvrir le calculateur" label.
- The focused glossary card label now uses "Terme sélectionné".

### Next Emulator Checklist

- Open the Academy hub from the bottom navigation and verify the page starts at
  the top.
- Open `Malts et fermentescibles`; verify the first viewport has only one
  primary article title.
- Scroll to the end of `Malts et fermentescibles`; verify sources and footer
  navigation stay above the bottom navigation.
- Tap the calculator CTA; verify the button label is explicit and the calculator
  route opens.
- Use Android back from the calculator; verify the user can return to the
  Academy context.
- Open `Glossaire brassicole`, search `ibu`, and verify exact term ranking.
- Open the `IBU` glossary term; verify the focused card appears and starts from
  the expected top position.
- Navigate from a related glossary term and from a related article; verify new
  pages start at the top while back navigation restores context.

### Confirmed Good

- The Academy hub hierarchy is readable on mobile: title, value card, search,
  category chips, and article cards are understandable.
- "Malts et fermentescibles" is visible from the first hub viewport, which fits
  the ingredient-first learning expectation.
- Focused glossary cards are readable on mobile and show definition, aliases,
  related terms, and sources in a useful order.
- Related glossary term navigation works from the focused card.
- Hub search filters results immediately and has a visible clear action.
- Hub empty search state is clear and readable.
- Returning from an article to the hub restores the selected category and
  horizontal chip position, which is appropriate for back navigation.
- Article-to-article "Lire aussi" navigation opens the target article at the top,
  and returning restores the source article near the related-link position.
- Android system back from article reading returns to the Academy hub with the
  previous filter context restored.
- Article-to-glossary reference chips open the focused glossary term correctly.

## Academy Hub

### Primary Content

- Search input visible near the top.
- Pilot article cards: `houblons`, `levures`, `eau`.
- Category chips or a compact category grid.
- Frequent questions linked to article sections, glossary terms, or calculators.
- Recently updated or recommended references if useful after V1.

### States

| State            | Expected behavior                                                      |
| ---------------- | ---------------------------------------------------------------------- |
| Ready            | Search, categories, pilot cards, FAQ links visible.                    |
| Empty corpus     | Controlled empty state explaining that Academy content is unavailable. |
| Search empty     | Show curated article/category suggestions.                             |
| Search no result | Show clear no-result message and category shortcuts.                   |
| Invalid link     | Show controlled error and return action.                               |

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
