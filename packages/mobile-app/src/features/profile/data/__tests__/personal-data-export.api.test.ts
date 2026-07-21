import { request } from "@/core/http/http-client";

import { getPersonalDataExport } from "../personal-data-export.api";

jest.mock("@/core/http/http-client", () => ({
  request: jest.fn(),
}));

const mockedRequest = jest.mocked(request);

describe("personal data export API adapter", () => {
  beforeEach(() => {
    mockedRequest.mockReset();
  });

  it("requests the authenticated export endpoint", async () => {
    // Arrange
    const exportPayload = { schema_version: "1.0" };
    mockedRequest.mockResolvedValue(exportPayload);

    // Act
    const result = await getPersonalDataExport();

    // Assert
    expect(result).toBe(exportPayload);
    expect(mockedRequest).toHaveBeenCalledWith("/auth/me/export");
  });

  it("propagates an API failure without returning partial data", async () => {
    // Arrange
    mockedRequest.mockRejectedValue(new Error("Export unavailable"));

    // Act
    const exportPromise = getPersonalDataExport();

    // Assert
    await expect(exportPromise).rejects.toThrow("Export unavailable");
  });
});
