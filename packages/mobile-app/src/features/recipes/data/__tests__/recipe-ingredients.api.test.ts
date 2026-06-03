import { request } from "@/core/http/http-client";
import {
  listRecipeAdditives,
  listRecipeFermentables,
  listRecipeHops,
  listRecipeYeasts,
} from "@/features/recipes/data/recipe-ingredients.api";

jest.mock("@/core/http/http-client", () => ({
  request: jest.fn(),
}));

const mockedRequest = request as jest.MockedFunction<typeof request>;

beforeEach(() => {
  mockedRequest.mockReset();
});

describe("recipe-ingredients.api", () => {
  it("listRecipeFermentables: hits the endpoint and maps DTO → row", async () => {
    mockedRequest.mockResolvedValueOnce([
      {
        id: "f1",
        recipe_id: "r1",
        name: "Maris Otter",
        type: "base",
        weight_g: 5000,
        potential_gravity: 1.038,
        color_ebc: 5,
      },
    ] as never);

    const rows = await listRecipeFermentables("r1");

    expect(mockedRequest).toHaveBeenCalledWith("/recipes/r1/fermentables");
    expect(rows).toEqual([{ id: "f1", name: "Maris Otter", weightG: 5000 }]);
  });

  it("listRecipeHops: maps variety/weight/stage and a present addition time", async () => {
    mockedRequest.mockResolvedValueOnce([
      {
        id: "h1",
        recipe_id: "r1",
        variety: "Citra",
        type: "aroma",
        weight_g: 30,
        alpha_acid_percent: 12,
        addition_stage: "boil",
        addition_time_min: 10,
      },
    ] as never);

    const rows = await listRecipeHops("r1");

    expect(mockedRequest).toHaveBeenCalledWith("/recipes/r1/hops");
    expect(rows).toEqual([
      {
        id: "h1",
        variety: "Citra",
        weightG: 30,
        additionStage: "boil",
        additionTimeMin: 10,
      },
    ]);
  });

  it("listRecipeHops: edge — a missing addition time maps to null", async () => {
    mockedRequest.mockResolvedValueOnce([
      {
        id: "h2",
        recipe_id: "r1",
        variety: "Saaz",
        type: "aroma",
        weight_g: 20,
        addition_stage: "dry-hop",
      },
    ] as never);

    const rows = await listRecipeHops("r1");

    expect(rows[0].additionTimeMin).toBeNull();
  });

  it("listRecipeYeasts: hits the endpoint and maps DTO → row", async () => {
    mockedRequest.mockResolvedValueOnce([
      {
        id: "y1",
        recipe_id: "r1",
        name: "US-05",
        type: "ale",
        amount_g: 11,
        attenuation_percent: 81,
      },
    ] as never);

    const rows = await listRecipeYeasts("r1");

    expect(mockedRequest).toHaveBeenCalledWith("/recipes/r1/yeasts");
    expect(rows).toEqual([{ id: "y1", name: "US-05", amountG: 11 }]);
  });

  it("listRecipeAdditives: hits the endpoint and maps DTO → row", async () => {
    mockedRequest.mockResolvedValueOnce([
      {
        id: "a1",
        recipe_id: "r1",
        name: "Whirlfloc",
        type: "fining",
        amount_g: 2,
      },
    ] as never);

    const rows = await listRecipeAdditives("r1");

    expect(mockedRequest).toHaveBeenCalledWith("/recipes/r1/additives");
    expect(rows).toEqual([{ id: "a1", name: "Whirlfloc", amountG: 2 }]);
  });

  it("sad: an empty payload maps to an empty list", async () => {
    mockedRequest.mockResolvedValueOnce([] as never);

    await expect(listRecipeFermentables("r1")).resolves.toEqual([]);
  });
});
