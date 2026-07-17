const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");

module.exports = [
  {
    ignores: ["node_modules/**", ".expo/**", "dist/**"],
  },
  {
    files: ["**/*.{js,jsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
  },
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
    },
  },
  {
    // ADR-0029 guard. The bar overlays content, so a screen's scroller must
    // reserve its footprint. That used to be a per-screen opt-in: 36 screens
    // remembered, 5 never did, and their controls sat under the bar unnoticed
    // for months (#1457). The shared containers removed the need to remember —
    // this rule removes the ability to forget, mechanically, in CI.
    //
    // Scoped to *Screen.tsx: the defect is a screen's own vertical scroller.
    // Nested scrollers, tabs, modal content and components are not screens and
    // are covered by whatever container their screen already uses.
    //
    // Legitimate exceptions disable this rule ON THE LINE, with their reason —
    // deliberately not an allowlist file, which would rot out of sight. A
    // disable is visible in the diff and has to be justified to a reviewer.
    // `**/*Screen.tsx`, not `*Screen.tsx`: the tail must cross directory
    // boundaries or a screen nested one level deeper (presentation/wizard/…)
    // slips through — the same latent shape as the unused list components above.
    files: ["src/features/**/presentation/**/*Screen.tsx"],
    // The plugin must be re-declared here: a flat-config block can only use
    // rules from plugins IT loads, and the broader ts/tsx block above is a
    // separate object. Without this, ESLint exits 2 on an unknown rule key —
    // and a crashed lint reports no violations, which looks exactly like a
    // clean one. Verify this guard by exit code, never by grepping output.
    plugins: {
      "@typescript-eslint": tsPlugin,
    },
    rules: {
      // The @typescript-eslint variant, for `allowTypeImports`: a type-only
      // import renders nothing, so it cannot occlude anything and must not need
      // a documented exception.
      "no-restricted-imports": "off",
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "react-native",
              // Per-path, not top-level: the rule's schema rejects the option
              // anywhere else. A type-only import renders nothing, so it cannot
              // occlude anything and must not need a documented exception.
              allowTypeImports: true,
              // The whole raw-scroller family, not just the two in use today:
              // SectionList / VirtualizedList are the same class of defect and
              // would sail through green if listed later, which is exactly how
              // the 5 occluded screens stayed invisible.
              importNames: [
                "ScrollView",
                "FlatList",
                "SectionList",
                "VirtualizedList",
                "VirtualizedSectionList",
              ],
              message:
                "Use ScreenScrollView / ScreenFlatList from @/core/ui instead: they reserve the navigation bar's footprint and wire scroll tracking (ADR-0029 clause 4). A raw scroller silently hides bottom controls under the bar. No shared container exists for SectionList/VirtualizedList yet — add one rather than reaching for the raw component. If this scroller is horizontal, nested inside an already-reserved container, inside a Modal, on a screen with no bar, or imported for its type only, disable this rule on the import line and say which.",
            },
          ],
        },
      ],
    },
  },
];
