import { request } from "@/core/http/http-client";
import {
  getEquipmentFit,
  mapCapacityFit,
} from "@/features/recipes/data/equipment-fit.api";

jest.mock("@/core/http/http-client", () => ({
  request: jest.fn(),
}));

const mockRequest = request as jest.MockedFunction<typeof request>;

const fullDto = {
  fermenter: "TOO_LARGE",
  fermenterReason: null,
  kettle: "WARNING",
  kettleReason: null,
  fermenterUsableL: 4.5,
  recipeVolumeL: 20,
  preBoilL: 6,
  kettleCapacityL: 5,
  scaleRatio: 4.44,
};

describe("equipment-fit.api", () => {
  afterEach(() => jest.clearAllMocks());

  describe("mapCapacityFit", () => {
    it("maps a full DTO verbatim", () => {
      expect(mapCapacityFit(fullDto)).toEqual({
        fermenter: "TOO_LARGE",
        fermenterReason: null,
        kettle: "WARNING",
        kettleReason: null,
        fermenterUsableL: 4.5,
        recipeVolumeL: 20,
        preBoilL: 6,
        kettleCapacityL: 5,
        scaleRatio: 4.44,
      });
    });

    it("falls back to NOT_EVALUATED for an unknown verdict and keeps a valid reason", () => {
      const fit = mapCapacityFit({
        fermenter: "WAT",
        fermenterReason: "NO_FERMENTER_VOLUME",
        kettle: null,
        kettleReason: "NO_RECIPE_WATER",
      });
      expect(fit.fermenter).toBe("NOT_EVALUATED");
      expect(fit.fermenterReason).toBe("NO_FERMENTER_VOLUME");
      expect(fit.kettle).toBe("NOT_EVALUATED");
      expect(fit.kettleReason).toBe("NO_RECIPE_WATER");
    });

    it("drops a reason on an evaluated verdict (never FITS-with-a-reason)", () => {
      const fit = mapCapacityFit({
        fermenter: "FITS",
        fermenterReason: "NO_PROFILE",
        kettle: "OK",
        kettleReason: "NO_PROFILE",
      });
      expect(fit.fermenterReason).toBeNull();
      expect(fit.kettleReason).toBeNull();
    });

    it("nulls an unknown reason and non-finite numbers", () => {
      const fit = mapCapacityFit({
        fermenter: "FITS",
        fermenterReason: "BOGUS",
        fermenterUsableL: Number.NaN,
        recipeVolumeL: null,
      });
      expect(fit.fermenterReason).toBeNull();
      expect(fit.fermenterUsableL).toBeNull();
      expect(fit.recipeVolumeL).toBeNull();
    });
  });

  describe("getEquipmentFit", () => {
    it("calls the recipe-scoped route without a profileId and maps the DTO", async () => {
      mockRequest.mockResolvedValue(fullDto);
      const controller = new AbortController();

      const fit = await getEquipmentFit(
        "recipe-1",
        undefined,
        controller.signal,
      );

      const [path, options] = mockRequest.mock.calls[0];
      expect(path).toBe("/recipes/recipe-1/equipment-fit");
      expect(options).toMatchObject({ signal: controller.signal });
      expect(fit.fermenter).toBe("TOO_LARGE");
    });

    it("appends an explicit profileId to the query", async () => {
      mockRequest.mockResolvedValue(fullDto);

      await getEquipmentFit("recipe-1", "profile-9");

      expect(mockRequest.mock.calls[0][0]).toBe(
        "/recipes/recipe-1/equipment-fit?profileId=profile-9",
      );
    });
  });
});
