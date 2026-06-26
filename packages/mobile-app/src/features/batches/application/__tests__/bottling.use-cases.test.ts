import { dataSource } from "@/core/data/data-source";
import { HttpError } from "@/core/http/http-error";
import {
  clearDemoTastings,
  closeBottling,
  getBottlingInfo,
  getTasting,
  recordTasting,
} from "@/features/batches/application/bottling.use-cases";
import {
  closeBottling as closeBottlingApi,
  createTasting as createTastingApi,
  getPriming as getPrimingApi,
  getTasting as getTastingApi,
} from "@/features/batches/data/batches.api";
import { Tasting } from "@/features/batches/domain/bottling.types";

jest.mock("@/core/data/data-source", () => ({
  dataSource: {
    useDemoData: true,
  },
}));

jest.mock("@/features/batches/data/batches.api", () => ({
  getPriming: jest.fn(),
  closeBottling: jest.fn(),
  createTasting: jest.fn(),
  getTasting: jest.fn(),
}));

const mockedGetPriming = getPrimingApi as jest.MockedFunction<
  typeof getPrimingApi
>;
const mockedClose = closeBottlingApi as jest.MockedFunction<
  typeof closeBottlingApi
>;
const mockedCreateTasting = createTastingApi as jest.MockedFunction<
  typeof createTastingApi
>;
const mockedGetTasting = getTastingApi as jest.MockedFunction<
  typeof getTastingApi
>;

const liveTasting: Tasting = {
  id: "t-live",
  batchId: "b-live",
  rating: 4,
  note: "Live note",
  createdAt: "2026-06-20T09:00:00.000Z",
};

describe("bottling use-cases", () => {
  beforeEach(() => {
    dataSource.useDemoData = true;
    mockedGetPriming.mockReset();
    mockedClose.mockReset();
    mockedCreateTasting.mockReset();
    mockedGetTasting.mockReset();
    clearDemoTastings();
  });

  it("returns null priming and skips the API for a missing batch id (edge path)", async () => {
    const result = await getBottlingInfo("");

    expect(result).toBeNull();
    expect(mockedGetPriming).not.toHaveBeenCalled();
  });

  it("computes a local priming dose in demo mode (happy path)", async () => {
    const priming = await getBottlingInfo("b-demo");

    expect(priming?.sugarType).toBe("table_sugar");
    expect(priming?.sugarGrams).toBeGreaterThan(0);
    expect(priming?.safetyWarning).toMatch(/EXPLOSER/);
    expect(mockedGetPriming).not.toHaveBeenCalled();
  });

  it("records and reads back a tasting locally in demo mode (happy path)", async () => {
    const recorded = await recordTasting("b-demo", {
      rating: 5,
      note: "  Très bon  ",
    });

    expect(recorded?.rating).toBe(5);
    // Whitespace is trimmed; non-empty stays.
    expect(recorded?.note).toBe("Très bon");
    expect(mockedCreateTasting).not.toHaveBeenCalled();

    const readBack = await getTasting("b-demo");
    expect(readBack?.rating).toBe(5);
  });

  it("normalises a whitespace-only note to null in demo mode (edge path)", async () => {
    const recorded = await recordTasting("b-demo", {
      rating: 3,
      note: "   ",
    });

    expect(recorded?.note).toBeNull();
  });

  it("returns null tasting for a batch with no recorded tasting (sad path)", async () => {
    const result = await getTasting("b-demo-empty");

    expect(result).toBeNull();
    expect(mockedGetTasting).not.toHaveBeenCalled();
  });

  it("returns the demo batch on close in demo mode (happy path)", async () => {
    const batch = await closeBottling("b-demo-pdd-done");

    expect(batch?.id).toBe("b-demo-pdd-done");
    expect(mockedClose).not.toHaveBeenCalled();
  });

  it("delegates to the data layer in live mode (happy path)", async () => {
    dataSource.useDemoData = false;
    mockedGetTasting.mockResolvedValue(liveTasting);
    mockedCreateTasting.mockResolvedValue(liveTasting);

    const recorded = await recordTasting("b-live", { rating: 4 });
    const read = await getTasting("b-live");

    expect(mockedCreateTasting).toHaveBeenCalledWith("b-live", { rating: 4 });
    expect(mockedGetTasting).toHaveBeenCalledWith("b-live");
    expect(recorded).toEqual(liveTasting);
    expect(read).toEqual(liveTasting);
  });

  it("maps a live 404 HttpError from getTasting to null (sad path)", async () => {
    dataSource.useDemoData = false;
    mockedGetTasting.mockRejectedValue(new HttpError(404, "Tasting not found"));

    const result = await getTasting("b-live");

    expect(result).toBeNull();
  });

  it("propagates a non-404 HttpError from getTasting instead of masking it (sad path)", async () => {
    dataSource.useDemoData = false;
    mockedGetTasting.mockRejectedValue(new HttpError(500, "Server error"));

    await expect(getTasting("b-live")).rejects.toBeInstanceOf(HttpError);
  });

  it("propagates a live close error (sad path)", async () => {
    dataSource.useDemoData = false;
    mockedClose.mockRejectedValue(new Error("Batch already completed"));

    await expect(closeBottling("b-live")).rejects.toThrow(
      "Batch already completed",
    );
  });
});
