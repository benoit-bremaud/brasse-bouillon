import {
  getMaltDetails,
  listAlternativeMalts,
  listMalts,
} from "@/features/ingredients/application/malts.use-cases";
import {
  getMaltDetailsApi,
  listMaltsApi,
} from "@/features/ingredients/data/malts.api";

import { dataSource } from "@/core/data/data-source";
import { MaltProduct } from "@/features/ingredients/domain/malt.types";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

jest.mock("@/features/ingredients/data/malts.api", () => ({
  listMaltsApi: jest.fn(),
  getMaltDetailsApi: jest.fn(),
}));

const mockedListMaltsApi = listMaltsApi as jest.MockedFunction<
  typeof listMaltsApi
>;
const mockedGetMaltDetailsApi = getMaltDetailsApi as jest.MockedFunction<
  typeof getMaltDetailsApi
>;

describe("malts use-cases", () => {
  beforeEach(() => {
    dataSource.useDemoData = true;
    mockedListMaltsApi.mockReset();
    mockedGetMaltDetailsApi.mockReset();
  });

  it("returns demo malts when demo data is enabled", async () => {
    const results = await listMalts();

    expect(results.length).toBeGreaterThanOrEqual(10);
    expect(results[0]).toMatchObject({
      id: expect.any(String),
      name: expect.any(String),
      specGroups: expect.any(Array),
    });
    expect(mockedListMaltsApi).not.toHaveBeenCalled();
  });

  it("filters demo malts by search keyword", async () => {
    const results = await listMalts("weyermann");

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((item) =>
        [item.name, item.brand, item.maltType]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLocaleLowerCase().includes("weyermann")),
      ),
    ).toBe(true);
  });

  it("filters demo malts by color EBC range", async () => {
    const results = await listMalts({
      colorEbcMin: 20,
      colorEbcMax: 60,
    });

    expect(results.length).toBeGreaterThan(0);

    const extractedColors = results
      .map((malt) => {
        const colorRow = malt.specGroups
          .flatMap((group) => group.rows)
          .find(
            (row) =>
              row.label.toLocaleLowerCase().includes("color") &&
              row.unit?.toLocaleLowerCase() === "ebc",
          );

        return colorRow ? Number.parseFloat(colorRow.value) : Number.NaN;
      })
      .filter((value) => Number.isFinite(value));

    expect(extractedColors.length).toBe(results.length);
    expect(extractedColors.every((value) => value >= 20 && value <= 60)).toBe(
      true,
    );
  });

  it("combines search and color filters", async () => {
    const results = await listMalts({
      search: "weyermann",
      colorEbcMax: 30,
    });

    expect(results.length).toBeGreaterThan(0);
    expect(
      results.every((malt) =>
        [malt.name, malt.brand, malt.maltType]
          .filter((value): value is string => Boolean(value))
          .some((value) => value.toLocaleLowerCase().includes("weyermann")),
      ),
    ).toBe(true);
  });

  it("returns malt details from demo data", async () => {
    const details = await getMaltDetails("malt-1");

    expect(details).toBeTruthy();
    expect(details?.id).toBe("malt-1");
    expect(details?.specGroups.length).toBeGreaterThan(0);
    expect(mockedGetMaltDetailsApi).not.toHaveBeenCalled();
  });

  it("uses live list API when demo data is disabled", async () => {
    dataSource.useDemoData = false;

    const liveMalts: MaltProduct[] = [
      {
        id: "malt-live-1",
        slug: "live-pilsner",
        name: "Live Pilsner Malt",
        brand: "Live Malt Co",
        maltType: "Base malt",
        specGroups: [],
      },
      {
        id: "malt-live-2",
        slug: "live-cara",
        name: "Live Cara Malt",
        brand: "Another Malt Co",
        maltType: "Caramel malt",
        specGroups: [],
      },
    ];
    mockedListMaltsApi.mockResolvedValue(liveMalts);

    const results = await listMalts("cara");

    expect(mockedListMaltsApi).toHaveBeenCalledTimes(1);
    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({ id: "malt-live-2" });
  });

  it("uses live details API when demo data is disabled", async () => {
    dataSource.useDemoData = false;
    mockedGetMaltDetailsApi.mockResolvedValue({
      id: "malt-live-1",
      slug: "live-pilsner",
      name: "Live Pilsner Malt",
      brand: "Live Malt Co",
      maltType: "Base malt",
      specGroups: [],
    });

    const details = await getMaltDetails("malt-live-1");

    expect(mockedGetMaltDetailsApi).toHaveBeenCalledWith("malt-live-1");
    expect(details).toMatchObject({ id: "malt-live-1" });
  });

  it("returns null when malt id is empty", async () => {
    dataSource.useDemoData = false;

    const details = await getMaltDetails("");

    expect(details).toBeNull();
    expect(mockedGetMaltDetailsApi).not.toHaveBeenCalled();
  });

  it("returns ranked alternatives for a malt id", async () => {
    const alternatives = await listAlternativeMalts("malt-1", 3);

    expect(alternatives).toHaveLength(3);
    expect(alternatives.every((malt) => malt.id !== "malt-1")).toBe(true);
  });

  it("returns empty alternatives list when malt id is empty", async () => {
    const alternatives = await listAlternativeMalts("");

    expect(alternatives).toEqual([]);
  });

  it("returns empty alternatives list when target malt does not exist", async () => {
    const alternatives = await listAlternativeMalts("unknown-malt");

    expect(alternatives).toEqual([]);
  });

  it("returns empty alternatives list when limit is zero", async () => {
    const alternatives = await listAlternativeMalts("malt-1", 0);

    expect(alternatives).toEqual([]);
  });
});
