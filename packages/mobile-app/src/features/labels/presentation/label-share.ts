import type { LabelDraft } from "@/features/labels/domain/label.types";

/**
 * Build the plain-text payload that lands in the OS share sheet
 * when the user taps "Partager" on the label details screen.
 *
 * Issue #629 KISS scope — this is a text-only handoff (no PDF, no
 * PNG, no print), so the goal is to give whoever receives the
 * message (WhatsApp / email / AirDrop) enough context to know
 * which beer the speaker is talking about. Visuals come later
 * when the full export pipeline ships.
 *
 * Pure function — no side-effects, no React. Tested in isolation.
 */
export function buildLabelShareMessage(draft: LabelDraft): string {
  const snapshot = draft.previewSnapshot;
  const lines = [
    `🍺 ${snapshot.title}`,
    snapshot.subtitle,
    "",
    snapshot.bottleFormatLabel,
    snapshot.templateLabel,
    snapshot.abvLabel,
    snapshot.volumeLabel,
    snapshot.brewDateLabel,
    snapshot.breweryLabel,
    "",
    snapshot.legalHint,
    "",
    "— Brouillon partagé depuis Brasse Bouillon",
  ];
  return lines.filter((line) => line !== null).join("\n");
}
