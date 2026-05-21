/**
 * Feedback taxonomy — mirrored from the `feedback-widget` core package
 * (`@feedback-widget/core`, `domain/Feedback.ts`).
 *
 * The widget is the source of truth for the wire contract. This file
 * re-declares the allowed category / sub-category pairings server-side
 * so the API can reject malformed payloads independently of the client
 * (a client check is advisory only — never trusted).
 *
 * Keep in sync with the widget when its taxonomy evolves.
 */

export const TOP_LEVEL_CATEGORIES = [
  'bug',
  'typo',
  'error',
  'ambiguous',
  'suggestion',
  'other',
] as const;

export type TopLevelCategory = (typeof TOP_LEVEL_CATEGORIES)[number];

/**
 * Allowed sub-categories per top-level category. `other` carries no
 * sub-category (the wire value must be `null`).
 */
export const SUB_CATEGORIES_BY_CATEGORY = {
  bug: [
    'crash',
    'broken-feature',
    'visual-glitch',
    'wrong-output',
    'regression',
  ],
  typo: ['prose', 'code-sample', 'heading', 'link-text', 'alt-text'],
  error: ['js-console', 'http-404', 'http-5xx', 'broken-link', 'missing-asset'],
  ambiguous: [
    'wording',
    'navigation',
    'terminology',
    'example-unclear',
    'missing-context',
  ],
  suggestion: [
    'new-feature',
    'improvement',
    'new-example',
    'content-refactor',
    'accessibility',
  ],
  other: [],
} as const satisfies Record<TopLevelCategory, readonly string[]>;

/** User message length bounds — match the widget's view-layer validation. */
export const FEEDBACK_MESSAGE_MIN_LENGTH = 10;
export const FEEDBACK_MESSAGE_MAX_LENGTH = 2000;
