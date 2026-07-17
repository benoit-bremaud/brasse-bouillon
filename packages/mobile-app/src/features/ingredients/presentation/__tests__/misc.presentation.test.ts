import {
  getMiscTypeLabel,
  getMiscUseLabel,
} from "@/features/ingredients/presentation/misc.presentation";

describe("misc.presentation", () => {
  // Happy path — the catalog serves raw BeerXML enums; a French app aimed at
  // novices must not print "water_agent" at them.
  it.each([
    ["spice", "Épice"],
    ["fining", "Clarifiant"],
    ["water_agent", "Sel d'eau"],
    ["herb", "Plante"],
    ["flavor", "Arôme"],
    ["other", "Autre"],
  ])("translates the %s type", (raw, expected) => {
    expect(getMiscTypeLabel(raw)).toBe(expected);
  });

  it.each([
    ["mash", "Empâtage"],
    ["boil", "Ébullition"],
    ["primary", "Fermentation primaire"],
    ["secondary", "Fermentation secondaire"],
    ["bottling", "Embouteillage"],
  ])("translates the %s use", (raw, expected) => {
    expect(getMiscUseLabel(raw)).toBe(expected);
  });

  // Edge — the catalog columns are free-form strings, so casing and padding
  // are not guaranteed.
  it("tolerates casing and surrounding whitespace", () => {
    expect(getMiscTypeLabel("  FINING ")).toBe("Clarifiant");
    expect(getMiscUseLabel("Boil")).toBe("Ébullition");
  });

  // Sad — an enum the catalog adds before this map knows it must still show.
  // Passing it through beats hiding it: a visible oddity gets reported, a
  // silently dropped spec makes the ingredient look incomplete.
  it("passes an unmapped value through untouched", () => {
    expect(getMiscTypeLabel("nanobubbles")).toBe("nanobubbles");
    expect(getMiscUseLabel("whirlpool")).toBe("whirlpool");
  });

  // Edge — every misc spec is nullable in the catalog.
  it("returns null when the value is absent", () => {
    expect(getMiscTypeLabel(undefined)).toBeNull();
    expect(getMiscUseLabel(undefined)).toBeNull();
    expect(getMiscTypeLabel("")).toBeNull();
  });
});
