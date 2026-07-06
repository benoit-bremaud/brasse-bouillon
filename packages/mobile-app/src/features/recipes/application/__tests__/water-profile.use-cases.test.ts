import {
  getCommunesByPostalCode,
  getLiveWaterProfile,
} from "@/features/recipes/data/water-profile.api";
import {
  isValidPostalCode,
  loadWaterProfile,
  resolveCommunes,
} from "@/features/recipes/application/water-profile.use-cases";

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
  });

  describe("loadWaterProfile", () => {
    it("delegates to the data layer with the commune code and year", async () => {
      mockGetProfile.mockResolvedValue({
        codeInsee: "59350",
        year: 2024,
        networkName: "LILLE",
        sampleCount: 100,
        conformity: "C",
        mineralsMgL: { ca: 116.7, mg: 21.2, cl: 50.2, so4: 98.9, hco3: 322.5 },
        hardnessFrench: 125.4,
      });

      const result = await loadWaterProfile("59350", 2024);

      expect(mockGetProfile).toHaveBeenCalledWith("59350", 2024, undefined);
      expect(result.codeInsee).toBe("59350");
    });
  });
});
