import type {
  RecipeDetailsEquipmentItem,
  RecipeDetailsIngredientItem,
} from "@/features/recipes/application/recipes.use-cases";
import {
  buildIngredientCartItems,
  calculateScalingFactor,
  calculateWaterCompatibility,
  formatQuantity,
  getIngredientGroupEntries,
  groupIngredientsByType,
  isVolumeCompatible,
  mapIngredientCategoryToShopCategory,
  parseTargetVolume,
  scaleQuantity,
  toEquipmentCartItem,
  toIngredientCartItem,
} from "@/features/recipes/presentation/recipe-details.utils";

describe("recipe-details.utils", () => {
  const baseIngredients: RecipeDetailsIngredientItem[] = [
    {
      ingredientId: "malt-1",
      amount: 5,
      unit: "kg",
      timing: null,
      notes: null,
      ingredient: {
        id: "malt-1",
        name: "Pale Malt",
        category: "malt",
        maltType: "base",
        ebc: 6,
        potentialSg: 1.037,
        maxPercent: 100,
      },
    },
    {
      ingredientId: "hop-1",
      amount: 25,
      unit: "g",
      timing: "boil - 10 min",
      notes: null,
      ingredient: {
        id: "hop-1",
        name: "Citra",
        category: "hop",
        form: "pellet",
        hopUse: "dual",
        alphaAcid: 13,
        betaAcid: 4.5,
      },
    },
    {
      ingredientId: "yeast-1",
      amount: 1,
      unit: "pack",
      timing: null,
      notes: null,
      ingredient: {
        id: "yeast-1",
        name: "US-05",
        category: "yeast",
        yeastType: "ale",
        attenuationMin: 78,
        attenuationMax: 82,
        flocculation: "medium",
        fermentationMinC: 18,
        fermentationMaxC: 26,
      },
    },
    {
      ingredientId: "other-1",
      amount: 2,
      unit: "g",
      timing: null,
      notes: null,
      ingredient: null,
    },
  ];

  const equipment: RecipeDetailsEquipmentItem = {
    equipmentId: "eq-1",
    role: "Mash & boil",
    notes: null,
    equipment: {
      id: "eq-1",
      name: "Braumeister 20L",
      type: "all-in-one",
      volumeLiters: 20,
      efficiencyPercent: 72,
    },
  };

  it("parses target volume with dot and comma separators", () => {
    expect(parseTargetVolume("25.5", 20)).toBe(25.5);
    expect(parseTargetVolume("25,5", 20)).toBe(25.5);
  });

  it("falls back to base volume on invalid target volume", () => {
    expect(parseTargetVolume("", 20)).toBe(20);
    expect(parseTargetVolume("abc", 20)).toBe(20);
    expect(parseTargetVolume("-2", 20)).toBe(20);
    expect(parseTargetVolume("0", 20)).toBe(20);
  });

  it("computes scaling factor and fallback behavior", () => {
    expect(calculateScalingFactor(20, 40)).toBe(2);
    expect(calculateScalingFactor(20, 10)).toBe(0.5);
    expect(calculateScalingFactor(0, 10)).toBe(1);
    expect(calculateScalingFactor(20, 0)).toBe(1);
  });

  it("scales and formats quantities", () => {
    expect(scaleQuantity(25, 1.5)).toBe(37.5);
    expect(scaleQuantity(1, 1 / 3)).toBe(0.333);
    expect(formatQuantity(25, "g")).toBe("25 g");
    expect(formatQuantity(12.3456, "g")).toBe("12.35 g");
    expect(formatQuantity(Number.NaN, "g")).toBe("0 g");
  });

  it("groups ingredients by type with expected bucket order support", () => {
    const grouped = groupIngredientsByType(baseIngredients);

    expect(grouped.malt).toHaveLength(1);
    expect(grouped.hop).toHaveLength(1);
    expect(grouped.yeast).toHaveLength(1);
    expect(grouped.other).toHaveLength(1);

    const entries = getIngredientGroupEntries(grouped);
    expect(entries).toEqual([
      { key: "malt", label: "Malts" },
      { key: "hop", label: "Hops" },
      { key: "yeast", label: "Yeasts" },
      { key: "other", label: "Others" },
    ]);
  });

  it("maps ingredient categories to shop categories", () => {
    expect(mapIngredientCategoryToShopCategory("malt")).toBe("malts");
    expect(mapIngredientCategoryToShopCategory("hop")).toBe("houblons");
    expect(mapIngredientCategoryToShopCategory("yeast")).toBe("levures");
    expect(mapIngredientCategoryToShopCategory(undefined)).toBe("accessoires");
    expect(mapIngredientCategoryToShopCategory(null)).toBe("accessoires");
  });

  it("builds ingredient cart items with scaled quantities", () => {
    const hop = baseIngredients[1];
    const single = toIngredientCartItem(hop, 2);

    expect(single).toEqual({
      key: "ingredient-hop-1-g",
      source: "ingredient",
      refId: "hop-1",
      name: "Citra",
      category: "houblons",
      quantity: 50,
      unit: "g",
    });

    const all = buildIngredientCartItems(baseIngredients, 2);
    expect(all).toHaveLength(4);
    expect(all[0].quantity).toBe(10);
    expect(all[1].quantity).toBe(50);
  });

  it("builds equipment cart item", () => {
    expect(toEquipmentCartItem(equipment)).toEqual({
      key: "equipment-eq-1",
      source: "equipment",
      refId: "eq-1",
      name: "Braumeister 20L",
      category: "materiel",
      quantity: 1,
      unit: "unit",
    });
  });

  it("checks target volume compatibility against equipment capacity", () => {
    expect(isVolumeCompatible(20, 20)).toBe(true);
    expect(isVolumeCompatible(15, 20)).toBe(true);
    expect(isVolumeCompatible(21, 20)).toBe(false);
    expect(isVolumeCompatible(30, null)).toBe(true);
    expect(isVolumeCompatible(30, 0)).toBe(true);
  });

  it("calculates water compatibility from profiles", () => {
    const recommended = {
      ca: 80,
      mg: 10,
      na: 20,
      so4: 100,
      cl: 70,
      hco3: 60,
    };

    const closeActual = {
      ca: 85,
      mg: 11,
      na: 18,
      so4: 95,
      cl: 72,
      hco3: 58,
    };

    const farActual = {
      ca: 10,
      mg: 1,
      na: 120,
      so4: 10,
      cl: 200,
      hco3: 250,
    };

    const closeResult = calculateWaterCompatibility(recommended, closeActual);
    expect(closeResult.score).toBeGreaterThanOrEqual(85);
    expect(closeResult.label).toBe("Excellent");
    expect(closeResult.matchedMetrics).toBeGreaterThanOrEqual(5);

    const farResult = calculateWaterCompatibility(recommended, farActual);
    expect(farResult.score).toBeLessThan(50);
    expect(farResult.label).toBe("Low");
    expect(farResult.totalMetrics).toBe(6);
  });
});
