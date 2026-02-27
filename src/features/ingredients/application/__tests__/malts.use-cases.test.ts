import {
  getMaltDetails,
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
});
