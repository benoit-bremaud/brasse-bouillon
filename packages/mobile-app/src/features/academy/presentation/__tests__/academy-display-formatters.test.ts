import {
  formatAcademyCategoryLabel,
  formatAcademyLevelLabel,
  formatAcademyReadTime,
} from "../academy-display-formatters";

describe("academy display formatters", () => {
  it("formats article metadata labels for presentation", () => {
    expect(formatAcademyLevelLabel("beginner")).toBe("Débutant");
    expect(formatAcademyLevelLabel("intermediate")).toBe("Intermédiaire");
    expect(formatAcademyLevelLabel("advanced")).toBe("Avancé");
    expect(formatAcademyCategoryLabel("getting-started")).toBe("Premiers pas");
    expect(formatAcademyCategoryLabel("history")).toBe("Histoire");
    expect(formatAcademyCategoryLabel("ingredients")).toBe("Ingrédients");
    expect(formatAcademyCategoryLabel("glossary")).toBe("Glossaire");
    expect(formatAcademyReadTime(6)).toBe("6 min");
  });
});
