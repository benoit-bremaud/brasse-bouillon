import { request } from "@/core/http/http-client";
import {
  getCommunesByPostalCode,
  getLiveWaterProfile,
  mapConformity,
  mapGeoCommune,
  mapWaterProfile,
} from "@/features/recipes/data/water-profile.api";

jest.mock("@/core/http/http-client", () => ({
  request: jest.fn(),
}));

const mockRequest = request as jest.MockedFunction<typeof request>;

describe("water-profile.api", () => {
  afterEach(() => jest.clearAllMocks());

  describe("mapGeoCommune", () => {
    it("maps `code` to `codeInsee` and keeps postal codes", () => {
      expect(
        mapGeoCommune({
          code: "59350",
          nom: "Lille",
          codesPostaux: ["59000", "59160"],
        }),
      ).toEqual({
        codeInsee: "59350",
        nom: "Lille",
        codesPostaux: ["59000", "59160"],
      });
    });

    it("defaults missing postal codes to an empty array", () => {
      expect(
        mapGeoCommune({ code: "75056", nom: "Paris" }).codesPostaux,
      ).toEqual([]);
    });
  });

  describe("mapConformity", () => {
    it.each(["C", "N", "D", "S", "UNKNOWN"] as const)(
      "keeps the known enum value %s",
      (value) => {
        expect(mapConformity(value)).toBe(value);
      },
    );

    it.each(["", "X", "conforme"])(
      "falls back to UNKNOWN for the unknown value %s",
      (value) => {
        expect(mapConformity(value)).toBe("UNKNOWN");
      },
    );
  });

  describe("mapWaterProfile", () => {
    it("maps a full DTO to the domain profile", () => {
      const profile = mapWaterProfile({
        codeInsee: "59350",
        year: 2024,
        networkName: "LILLE",
        sampleCount: 100,
        conformity: "N",
        mineralsMgL: { ca: 116.7, mg: 21.2, cl: 50.2, so4: 98.9, hco3: 322.5 },
        hardnessFrench: 125.4,
      });

      expect(profile).toEqual({
        codeInsee: "59350",
        year: 2024,
        networkName: "LILLE",
        sampleCount: 100,
        conformity: "N",
        mineralsMgL: { ca: 116.7, mg: 21.2, cl: 50.2, so4: 98.9, hco3: 322.5 },
        hardnessFrench: 125.4,
      });
    });

    it("tolerates a null minerals block and null values (partial data)", () => {
      const profile = mapWaterProfile({
        codeInsee: "67482",
        year: 2024,
        networkName: null,
        sampleCount: 0,
        conformity: "zz",
        mineralsMgL: null,
        hardnessFrench: null,
      });

      expect(profile.conformity).toBe("UNKNOWN");
      expect(profile.mineralsMgL).toEqual({
        ca: null,
        mg: null,
        cl: null,
        so4: null,
        hco3: null,
      });
      expect(profile.hardnessFrench).toBeNull();
    });
  });

  describe("getCommunesByPostalCode", () => {
    it("calls the sovereign geo API unauthenticated and maps the result", async () => {
      mockRequest.mockResolvedValue([
        { code: "59350", nom: "Lille", codesPostaux: ["59000"] },
      ]);
      const controller = new AbortController();

      const result = await getCommunesByPostalCode("59000", controller.signal);

      expect(mockRequest).toHaveBeenCalledTimes(1);
      const [path, options] = mockRequest.mock.calls[0];
      expect(path).toBe(
        "/communes?codePostal=59000&fields=nom,code,codesPostaux",
      );
      expect(options).toMatchObject({
        auth: false,
        baseUrl: "https://geo.api.gouv.fr",
        signal: controller.signal,
      });
      expect(result).toEqual([
        { codeInsee: "59350", nom: "Lille", codesPostaux: ["59000"] },
      ]);
    });
  });

  describe("getLiveWaterProfile", () => {
    it("calls the backend /water with codeInsee + year and maps the DTO", async () => {
      mockRequest.mockResolvedValue({
        codeInsee: "59350",
        year: 2024,
        networkName: "LILLE",
        sampleCount: 100,
        conformity: "C",
        mineralsMgL: { ca: 116.7, mg: 21.2, cl: 50.2, so4: 98.9, hco3: 322.5 },
        hardnessFrench: 125.4,
      });

      const controller = new AbortController();
      const result = await getLiveWaterProfile(
        "59350",
        2024,
        controller.signal,
      );

      const [path, options] = mockRequest.mock.calls[0];
      expect(path).toBe("/water?codeInsee=59350&year=2024");
      expect(options).toMatchObject({ signal: controller.signal });
      expect(result.networkName).toBe("LILLE");
      expect(result.conformity).toBe("C");
      expect(result.mineralsMgL.ca).toBe(116.7);
    });
  });
});
