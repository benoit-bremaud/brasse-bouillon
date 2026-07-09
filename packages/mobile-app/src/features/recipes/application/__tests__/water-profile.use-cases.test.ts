import { HttpError } from "@/core/http/http-error";
import {
  getCommunesByPostalCode,
  getLiveWaterProfile,
} from "@/features/recipes/data/water-profile.api";
import {
  describeWaterFreshness,
  isValidPostalCode,
  loadWaterProfile,
  resolveCommunes,
} from "@/features/recipes/application/water-profile.use-cases";
import type { LiveWaterProfile } from "@/features/recipes/domain/water-profile.types";

jest.mock("@/features/recipes/data/water-profile.api", () => ({
  getCommunesByPostalCode: jest.fn(),
  getLiveWaterProfile: jest.fn(),
}));

const mockGetCommunes = getCommunesByPostalCode as jest.MockedFunction<
  typeof getCommunesByPostalCode
>;
const mockGetProfile = getLiveWaterProfile as jest.MockedFunction<
  typeof getLiveWaterProfile
>;

const profile: LiveWaterProfile = {
  codeInsee: "59350",
  year: 2025,
  networkName: "LILLE",
  sampleCount: 100,
  conformity: "C",
  mineralsMgL: { ca: 116.7, mg: 21.2, cl: 50.2, so4: 98.9, hco3: 322.5 },
  hardnessFrench: 125.4,
  freshnessDate: null,
};

// Fixed reference date so freshness ages are deterministic: 2024-09-15.
const NOW = new Date(2024, 8, 15);

describe("water-profile.use-cases", () => {
  afterEach(() => jest.clearAllMocks());

  describe("isValidPostalCode", () => {
    it.each(["59000", "75056", "97400", " 59000 "])(
      "accepts the 5-digit code %s",
      (value) => {
        expect(isValidPostalCode(value)).toBe(true);
      },
    );

    it.each(["5900", "590000", "abcde", "", "59 00"])(
      "rejects the malformed code %s",
      (value) => {
        expect(isValidPostalCode(value)).toBe(false);
      },
    );
  });

  describe("resolveCommunes", () => {
    it("trims the postal code and delegates to the data layer", async () => {
      mockGetCommunes.mockResolvedValue([
        { codeInsee: "59350", nom: "Lille", codesPostaux: ["59000"] },
      ]);

      const result = await resolveCommunes(" 59000 ");

      expect(mockGetCommunes).toHaveBeenCalledWith("59000", undefined);
      expect(result).toHaveLength(1);
    });

    it("passes an empty result through unchanged (unknown postal code)", async () => {
      mockGetCommunes.mockResolvedValue([]);
      expect(await resolveCommunes("00000")).toEqual([]);
    });
  });

  describe("loadWaterProfile", () => {
    it("returns the current-year profile when it exists", async () => {
      mockGetProfile.mockResolvedValue(profile);

      const result = await loadWaterProfile("59350");

      expect(mockGetProfile).toHaveBeenCalledTimes(1);
      expect(result.codeInsee).toBe("59350");
    });

    it("falls back to the previous year on a 404", async () => {
      mockGetProfile
        .mockRejectedValueOnce(new HttpError(404, ""))
        .mockResolvedValueOnce(profile);

      const result = await loadWaterProfile("59350");

      expect(mockGetProfile).toHaveBeenCalledTimes(2);
      const [first, second] = mockGetProfile.mock.calls;
      expect(second[1]).toBe(first[1] - 1);
      expect(result.codeInsee).toBe("59350");
    });

    it("rethrows a non-404 error without a year fallback", async () => {
      mockGetProfile.mockRejectedValue(new HttpError(500, "boom"));

      await expect(loadWaterProfile("59350")).rejects.toBeInstanceOf(HttpError);
      expect(mockGetProfile).toHaveBeenCalledTimes(1);
    });
  });

  describe("describeWaterFreshness", () => {
    it("marks a date under 6 months old as a green « Récent » pastille", () => {
      const view = describeWaterFreshness("2024-06-01", NOW); // ~3.5 months
      expect(view).toEqual({
        tone: "success",
        label: "Récent",
        dateLabel: "01/06/2024",
      });
    });

    it("marks a 6–24 month old date as an orange « À confirmer » pastille", () => {
      const view = describeWaterFreshness("2023-06-01", NOW); // ~15 months
      expect(view?.tone).toBe("warning");
      expect(view?.label).toBe("À confirmer");
      expect(view?.dateLabel).toBe("01/06/2023");
    });

    it("marks a date over 24 months old as a grey « Ancien » pastille", () => {
      const view = describeWaterFreshness("2021-01-10", NOW); // ~44 months
      expect(view?.tone).toBe("neutral");
      expect(view?.label).toBe("Ancien");
    });

    it("treats exactly 6 months as « À confirmer » (boundary is inclusive of orange)", () => {
      const view = describeWaterFreshness("2024-03-15", NOW); // exactly 6 months
      expect(view?.tone).toBe("warning");
    });

    it("treats exactly 24 months as « À confirmer » (orange is inclusive of 24)", () => {
      const view = describeWaterFreshness("2022-09-15", NOW); // exactly 24 months
      expect(view?.tone).toBe("warning");
    });

    it("treats over 24 months as grey « Ancien »", () => {
      const view = describeWaterFreshness("2022-08-15", NOW); // 25 months
      expect(view?.tone).toBe("neutral");
      expect(view?.label).toBe("Ancien");
    });

    it("returns null for a null date so the panel falls back to the year line", () => {
      expect(describeWaterFreshness(null, NOW)).toBeNull();
    });

    it("returns null for a future date (never a reassuring « Récent »)", () => {
      // Clock skew or a bad backend max date → fall back, don't render green.
      expect(describeWaterFreshness("2025-01-01", NOW)).toBeNull();
    });

    it.each(["2024-13-01", "2024-02-31", "15/03/2024", "garbage", ""])(
      "returns null for the malformed date %s",
      (value) => {
        expect(describeWaterFreshness(value, NOW)).toBeNull();
      },
    );
  });
});
