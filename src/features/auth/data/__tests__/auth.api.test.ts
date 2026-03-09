import { HttpError } from "@/core/http/http-error";
import { getCurrentUser } from "@/features/auth/data/auth.api";

const mockRequest = jest.fn();

jest.mock("@/core/http/http-client", () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

describe("auth.api", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it("loads current user from /auth/me", async () => {
    mockRequest.mockResolvedValue({
      id: "u1",
      email: "brewer@example.com",
      username: "brewer",
      first_name: "Benoit",
      last_name: "Bremaud",
      role: "user",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
    });

    const user = await getCurrentUser();

    expect(mockRequest).toHaveBeenCalledWith("/auth/me");
    expect(user).toEqual({
      id: "u1",
      email: "brewer@example.com",
      username: "brewer",
      firstName: "Benoit",
      lastName: "Bremaud",
      role: "user",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
  });

  it("falls back to /users/me when /auth/me is not found", async () => {
    mockRequest
      .mockRejectedValueOnce(new HttpError(404, "Not Found"))
      .mockResolvedValueOnce({
        id: "u2",
        email: "fallback@example.com",
        username: "fallback",
        first_name: "Fall",
        last_name: "Back",
        role: "admin",
        is_active: true,
        created_at: "2026-01-03T00:00:00.000Z",
        updated_at: "2026-01-04T00:00:00.000Z",
      });

    const user = await getCurrentUser();

    expect(mockRequest).toHaveBeenNthCalledWith(1, "/auth/me");
    expect(mockRequest).toHaveBeenNthCalledWith(2, "/users/me");
    expect(user).toMatchObject({
      id: "u2",
      email: "fallback@example.com",
      username: "fallback",
    });
  });

  it("throws when both profile endpoints return not found", async () => {
    mockRequest
      .mockRejectedValueOnce(new HttpError(404, "Not Found"))
      .mockRejectedValueOnce(new HttpError(404, "Not Found"));

    const promise = getCurrentUser();

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ status: 404 });
  });
});
