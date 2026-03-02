import {
  getYeastDetailsApi,
  listYeastsApi,
} from "@/features/ingredients/data/yeasts.api";
import {
  getYeastDetails,
  listAlternativeYeasts,
  listYeasts,
} from "../yeasts.use-cases";

import { dataSource } from "@/core/data/data-source";
import { YeastProduct } from "@/features/ingredients/domain/yeast.types";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

jest.mock("@/features/ingredients/data/yeasts.api", () => ({
  listYeastsApi: jest.fn(),
  getYeastDetailsApi: jest.fn(),
}));

const mockedListYeastsApi = listYeastsApi as jest.MockedFunction<
  typeof listYeastsApi
>;
const mockedGetYeastDetailsApi = getYeastDetailsApi as jest.MockedFunction<
  typeof getYeastDetailsApi
>;

describe("yeasts use-cases", () => {
  beforeEach(() => {
    dataSource.useDemoData = true;
    mockedListYeastsApi.mockReset();
    mockedGetYeastDetailsApi.mockReset();
  });

  describe("listYeasts", () => {
    it("returns demo yeasts when no filters are provided", async () => {
      const results = await listYeasts();

      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        specGroups: expect.any(Array),
      });
      expect(mockedListYeastsApi).not.toHaveBeenCalled();
    });

    it("filters demo yeasts by search keyword", async () => {
      const results = await listYeasts("safale");

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((item) =>
          [item.name, item.brand, item.yeastType]
            .filter((value): value is string => Boolean(value))
            .some((value) => value.toLocaleLowerCase().includes("safale")),
        ),
      ).toBe(true);
    });

    it("filters demo yeasts by attenuation min", async () => {
      const results = await listYeasts({ attenuationMin: 80 });

      expect(results.length).toBeGreaterThan(0);
      expect(
        results.every((item) => {
          const attenuationRow = item.specGroups
            .flatMap((group) => group.rows)
            .find((row) =>
              row.label.toLocaleLowerCase().includes("attenuation"),
            );

          if (!attenuationRow) {
            return false;
          }

          const values = attenuationRow.value
            .split("-")
            .map((value) => Number.parseFloat(value));
          const averageAttenuation =
            values.length === 2 ? (values[0] + values[1]) / 2 : values[0];

          return (
            Number.isFinite(averageAttenuation) && averageAttenuation >= 80
          );
        }),
      ).toBe(true);
    });

    it("uses live list API when demo mode is disabled", async () => {
      dataSource.useDemoData = false;

      const liveYeasts: YeastProduct[] = [
        {
          id: "yeast-live-1",
          slug: "live-us05",
          name: "Live US-05",
          brand: "Live Labs",
          yeastType: "American Ale",
          specGroups: [
            {
              id: "yeast-live-1-fermentation",
              title: "Fermentation characteristics",
              rows: [
                {
                  id: "yeast-live-1-attenuation",
                  label: "Attenuation",
                  value: "78-82",
                  unit: "%",
                },
              ],
            },
          ],
        },
        {
          id: "yeast-live-2",
          slug: "live-belgian",
          name: "Live Belgian",
          brand: "Live Labs",
          yeastType: "Belgian Ale",
          specGroups: [
            {
              id: "yeast-live-2-fermentation",
              title: "Fermentation characteristics",
              rows: [
                {
                  id: "yeast-live-2-attenuation",
                  label: "Attenuation",
                  value: "82-86",
                  unit: "%",
                },
              ],
            },
          ],
        },
      ];
      mockedListYeastsApi.mockResolvedValue(liveYeasts);

      const results = await listYeasts({
        search: "belgian",
        attenuationMin: 83,
      });

      expect(mockedListYeastsApi).toHaveBeenCalledTimes(1);
      expect(results).toHaveLength(1);
      expect(results[0]).toMatchObject({ id: "yeast-live-2" });
    });
  });

  describe("getYeastDetails", () => {
    it("returns demo yeast details for valid id", async () => {
      const details = await getYeastDetails("yeast-1");

      expect(details).toBeTruthy();
      expect(details?.id).toBe("yeast-1");
      expect(details?.specGroups.length).toBeGreaterThan(0);
      expect(mockedGetYeastDetailsApi).not.toHaveBeenCalled();
    });

    it("returns null for empty id", async () => {
      const details = await getYeastDetails("");

      expect(details).toBeNull();
      expect(mockedGetYeastDetailsApi).not.toHaveBeenCalled();
    });

    it("uses live details API when demo mode is disabled", async () => {
      dataSource.useDemoData = false;
      mockedGetYeastDetailsApi.mockResolvedValue({
        id: "yeast-live-1",
        slug: "live-us05",
        name: "Live US-05",
        brand: "Live Labs",
        yeastType: "American Ale",
        specGroups: [],
      });

      const details = await getYeastDetails("yeast-live-1");

      expect(mockedGetYeastDetailsApi).toHaveBeenCalledWith("yeast-live-1");
      expect(details).toMatchObject({ id: "yeast-live-1" });
    });
  });

  describe("listAlternativeYeasts", () => {
    it("returns alternatives for valid yeast id", async () => {
      const alternatives = await listAlternativeYeasts("yeast-1", 3);

      expect(alternatives).toHaveLength(3);
      expect(alternatives.every((item) => item.id !== "yeast-1")).toBe(true);
    });

    it("returns empty list when id is empty", async () => {
      const alternatives = await listAlternativeYeasts("");

      expect(alternatives).toEqual([]);
    });

    it("returns empty list when target yeast does not exist", async () => {
      const alternatives = await listAlternativeYeasts("unknown-yeast");

      expect(alternatives).toEqual([]);
    });

    it("returns empty list when limit is zero", async () => {
      const alternatives = await listAlternativeYeasts("yeast-1", 0);

      expect(alternatives).toEqual([]);
    });
  });
});
