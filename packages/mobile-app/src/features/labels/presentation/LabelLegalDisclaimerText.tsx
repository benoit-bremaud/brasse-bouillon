import { StyleSheet, Text } from "react-native";

import { spacing, typography } from "@/core/theme";

type Props = {
  // Disclaimer text to render. Source-agnostic on purpose: callers
  // pass either the snapshot's `legalHint` (LabelDetails) or the
  // canonical `DEFAULT_LABEL_LEGAL_HINT` constant (LabelEditor).
  text: string;
  // Palette foreground color so the disclaimer stays legible against
  // the user-chosen palette background. Inline because the value is
  // runtime-derived from the palette the user picked.
  color: string;
};

// Loi Évin disclaimer — mandatory on every alcoholic-beverage label
// (article L.3323-4 du Code de la santé publique). Rendered on the
// VISUAL preview so it carries through to future PDF / PNG exports
// (#630). No `accessibilityLabel` on the Text — the legal wording
// itself is what assistive tech MUST read out loud.
//
// Extracted as a shared component so the LabelEditor live preview and
// the LabelDetails saved preview cannot drift in styling or markup
// (#634 review).
export function LabelLegalDisclaimerText({ text, color }: Props) {
  return <Text style={[styles.text, { color }]}>{text}</Text>;
}

const styles = StyleSheet.create({
  text: {
    marginTop: spacing.sm,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontStyle: "italic",
    opacity: 0.85,
    textAlign: "center",
  },
});
