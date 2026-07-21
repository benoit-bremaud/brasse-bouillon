import { listCurrentUserScans } from "@/features/scan/data/scan.api";

import { request } from "@/core/http/http-client";

jest.mock("@/core/http/http-client", () => ({
  request: jest.fn(),
}));

const mockedRequest = request as jest.MockedFunction<typeof request>;

describe("scan API", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it("maps current user scans for profile statistics", async () => {
    // Arrange
    mockedRequest.mockResolvedValue([
      {
        id: "scan-1",
        status: "matched",
        created_at: "2026-07-15T10:00:00.000Z",
      },
    ]);

    // Act
    const scans = await listCurrentUserScans();

    // Assert
    expect(scans).toEqual([
      {
        id: "scan-1",
        status: "matched",
        createdAt: "2026-07-15T10:00:00.000Z",
      },
    ]);
    expect(mockedRequest).toHaveBeenCalledWith("/scan");
  });

  it("propagates a scan history loading failure", async () => {
    // Arrange
    const error = new Error("Scan history unavailable");
    mockedRequest.mockRejectedValue(error);

    // Act
    const scansPromise = listCurrentUserScans();

    // Assert
    await expect(scansPromise).rejects.toBe(error);
  });
});
