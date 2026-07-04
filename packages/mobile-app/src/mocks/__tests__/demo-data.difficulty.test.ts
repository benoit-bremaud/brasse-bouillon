import { demoRecipes } from "@/mocks/demo-data";

describe("demoRecipes — difficulty (ADR-0024)", () => {
  it("attaches a pre-computed difficulty to the community recipe", () => {
    const community = demoRecipes.find((r) => r.id === "r-demo-community-1");

    expect(community?.difficultyEffective).toBe("facile");
    expect(community?.difficultyReasons?.length).toBeGreaterThan(0);
  });

  it("models an author override (effective = override, computed kept for the hint)", () => {
    const overridden = demoRecipes.find((r) => r.id === "r-demo-8");

    expect(overridden?.difficultyComputed).toBe("intermediaire");
    expect(overridden?.difficultyOverride).toBe("avance");
    expect(overridden?.difficultyEffective).toBe("avance");
  });

  it("covers all three levels across the demo set (badge is demoable)", () => {
    const levels = new Set(
      demoRecipes
        .map((r) => r.difficultyEffective)
        .filter((level): level is NonNullable<typeof level> => level != null),
    );

    expect(levels).toEqual(new Set(["facile", "intermediaire", "avance"]));
  });
});
