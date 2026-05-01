import { buildLabelDraft } from "@/features/labels/test-utils/label-test-fixtures";

import { buildLabelShareMessage } from "../label-share";

describe("buildLabelShareMessage (Issue #629 — KISS Share text scope)", () => {
  it("happy: includes every preview snapshot line + legal hint + signature", () => {
    const draft = buildLabelDraft();

    const message = buildLabelShareMessage(draft);

    expect(message).toContain("🍺 Saison");
    expect(message).toContain("Ferme");
    expect(message).toContain("33cl Long Neck");
    expect(message).toContain("Template Héritage");
    expect(message).toContain("ABV 6.2%");
    expect(message).toContain("33 cl");
    expect(message).toContain("2026-02-10");
    expect(message).toContain("Brasse Bouillon");
    expect(message).toContain(
      "L’abus d’alcool est dangereux pour la santé, à consommer avec modération.",
    );
    expect(message).toContain("Brouillon partagé depuis Brasse Bouillon");
  });

  it("sad: never returns an empty string even on a minimal-data draft", () => {
    const draft = buildLabelDraft({
      previewSnapshot: {
        title: "X",
        subtitle: "",
        bottleFormatLabel: "",
        templateLabel: "",
        abvLabel: "",
        volumeLabel: "",
        breweryLabel: "",
        brewDateLabel: "",
        legalHint: "",
      },
    });

    const message = buildLabelShareMessage(draft);

    expect(message.length).toBeGreaterThan(0);
    expect(message).toContain("🍺 X");
    expect(message).toContain("Brouillon partagé depuis Brasse Bouillon");
  });

  it("edge: preserves diacritics and special characters from the snapshot verbatim", () => {
    const draft = buildLabelDraft({
      previewSnapshot: {
        title: "Saison à l'épeautre",
        subtitle: "Brassée par Loïc — N°7",
        bottleFormatLabel: "75cl Champenoise",
        templateLabel: "Template Héritage",
        abvLabel: "ABV 7,8%",
        volumeLabel: "75 cl",
        breweryLabel: "Brasserie Dupont",
        brewDateLabel: "12 mars 2026",
        legalHint: "À consommer avec modération.",
      },
    });

    const message = buildLabelShareMessage(draft);

    expect(message).toContain("Saison à l'épeautre");
    expect(message).toContain("Brassée par Loïc — N°7");
    expect(message).toContain("ABV 7,8%");
    expect(message).toContain("À consommer avec modération.");
  });
});
