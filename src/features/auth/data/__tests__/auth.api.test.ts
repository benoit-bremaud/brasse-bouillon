import { getCurrentUser, signup } from "@/features/auth/data/auth.api";

import { HttpError } from "@/core/http/http-error";

const mockRequest = jest.fn();

const createTestCredential = () =>
  `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;

jest.mock("@/core/http/http-client", () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

describe("auth.api", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it("registers with /auth/register first", async () => {
    const credential = createTestCredential();

    mockRequest.mockResolvedValue({
      access_token: "access-token",
      user: {
        id: "u-signup",
        email: "new-user@example.com",
        username: "new-user",
        first_name: "New",
        last_name: "User",
        role: "user",
        is_active: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    });

    const session = await signup({
      email: "new-user@example.com",
      password: credential,
      username: "new-user",
      firstName: "New",
      lastName: "User",
    });

    expect(mockRequest).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: {
        email: "new-user@example.com",
        password: credential,
        username: "new-user",
        first_name: "New",
        last_name: "User",
      },
      auth: false,
    });

    expect(session).toMatchObject({
      accessToken: "access-token",
      user: {
        id: "u-signup",
        email: "new-user@example.com",
      },
    });
  });

  it("falls back to /auth/signup when /auth/register is not found", async () => {
    const credential = createTestCredential();

    mockRequest
      .mockRejectedValueOnce(new HttpError(404, "Not Found"))
      .mockResolvedValueOnce({
        access_token: "fallback-token",
        user: {
          id: "u-signup-fallback",
          email: "fallback-user@example.com",
          username: "fallback-user",
          role: "user",
          is_active: true,
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      });

    const session = await signup({
      email: "fallback-user@example.com",
      password: credential,
      username: "fallback-user",
    });

    expect(mockRequest).toHaveBeenNthCalledWith(
      1,
      "/auth/register",
      expect.objectContaining({ method: "POST", auth: false }),
    );
    expect(mockRequest).toHaveBeenNthCalledWith(
      2,
      "/auth/signup",
      expect.objectContaining({ method: "POST", auth: false }),
    );
    expect(session.accessToken).toBe("fallback-token");
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
