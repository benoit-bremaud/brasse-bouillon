import {
  cancelCurrentUserDeletion,
  changeCurrentUserPassword,
  deleteCurrentUser,
  getCurrentUser,
  requestPasswordReset,
  requestCurrentUserDeletion,
  signup,
  updateCurrentUser,
} from "@/features/auth/data/auth.api";

import { HttpError } from "@/core/http/http-error";

const mockRequest = jest.fn();

jest.mock("@/core/http/http-client", () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

describe("auth.api", () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it("registers with /auth/register first", async () => {
    // Arrange
    const credential = "Password1!";

    mockRequest.mockResolvedValue({
      access_token: "access-token",
      user: {
        id: "u-signup",
        email: "new-user@example.com",
        username: "new-user",
        first_name: "New",
        last_name: "User",
        bio: "Brewer",
        role: "user",
        is_active: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    });

    // Act
    const session = await signup({
      email: "new-user@example.com",
      password: credential,
      username: "new-user",
      firstName: "New",
      lastName: "User",
    });

    // Assert
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
        bio: "Brewer",
      },
    });
  });

  it("falls back to /auth/signup when /auth/register is not found", async () => {
    // Arrange
    const credential = "Password1!";

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

    // Act
    const session = await signup({
      email: "fallback-user@example.com",
      password: credential,
      username: "fallback-user",
    });

    // Assert
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

  it("requests password reset via /auth/forgot-password", async () => {
    // Arrange
    const email = "reset@example.com";
    mockRequest.mockResolvedValue(undefined);

    // Act
    await requestPasswordReset(email);

    // Assert
    expect(mockRequest).toHaveBeenCalledWith("/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    });
  });

  it("falls back to /auth/password/forgot when /auth/forgot-password is not found", async () => {
    // Arrange
    const email = "reset-fallback@example.com";
    mockRequest
      .mockRejectedValueOnce(new HttpError(404, "Not Found"))
      .mockResolvedValueOnce(undefined);

    // Act
    await requestPasswordReset(email);

    // Assert
    expect(mockRequest).toHaveBeenNthCalledWith(1, "/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    });
    expect(mockRequest).toHaveBeenNthCalledWith(2, "/auth/password/forgot", {
      method: "POST",
      body: { email },
      auth: false,
    });
  });

  it("propagates forgot password errors when they are not 404", async () => {
    // Arrange
    const email = "reset@example.com";
    const error = new HttpError(500, "Internal Server Error");
    mockRequest.mockRejectedValue(error);

    // Act
    const requestPromise = requestPasswordReset(email);

    // Assert
    await expect(requestPromise).rejects.toBe(error);
    expect(mockRequest).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledWith("/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    });
  });

  it("throws when both forgot-password endpoints are missing", async () => {
    // Arrange
    const email = "missing-reset@example.com";

    mockRequest
      .mockRejectedValueOnce(new HttpError(404, "Not Found"))
      .mockRejectedValueOnce(new HttpError(404, "Not Found"));

    // Act
    const requestPromise = requestPasswordReset(email);

    // Assert
    await expect(requestPromise).rejects.toThrow(
      "Password reset endpoint unavailable.",
    );
    expect(mockRequest).toHaveBeenNthCalledWith(1, "/auth/forgot-password", {
      method: "POST",
      body: { email },
      auth: false,
    });
    expect(mockRequest).toHaveBeenNthCalledWith(2, "/auth/password/forgot", {
      method: "POST",
      body: { email },
      auth: false,
    });
  });

  it("loads current user from /auth/me", async () => {
    // Arrange
    mockRequest.mockResolvedValue({
      id: "u1",
      email: "brewer@example.com",
      username: "brewer",
      first_name: "Benoit",
      last_name: "Bremaud",
      bio: "Brasseur amateur",
      role: "user",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-02T00:00:00.000Z",
    });

    // Act
    const user = await getCurrentUser();

    // Assert
    expect(mockRequest).toHaveBeenCalledWith("/auth/me");
    expect(user).toEqual({
      id: "u1",
      email: "brewer@example.com",
      username: "brewer",
      firstName: "Benoit",
      lastName: "Bremaud",
      bio: "Brasseur amateur",
      role: "user",
      isActive: true,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    });
  });

  it("falls back to /users/me when /auth/me is not found", async () => {
    // Arrange
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

    // Act
    const user = await getCurrentUser();

    // Assert
    expect(mockRequest).toHaveBeenNthCalledWith(1, "/auth/me");
    expect(mockRequest).toHaveBeenNthCalledWith(2, "/users/me");
    expect(user).toMatchObject({
      id: "u2",
      email: "fallback@example.com",
      username: "fallback",
    });
  });

  it("throws when both profile endpoints return not found", async () => {
    // Arrange
    mockRequest
      .mockRejectedValueOnce(new HttpError(404, "Not Found"))
      .mockRejectedValueOnce(new HttpError(404, "Not Found"));

    // Act
    const promise = getCurrentUser();

    // Assert
    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ status: 404 });
  });

  it("updates the current user with the backend field names", async () => {
    // Arrange
    mockRequest.mockResolvedValue({
      id: "u1",
      email: "new@example.com",
      username: "new_user",
      first_name: "New",
      last_name: "Name",
      bio: "Brasseur amateur",
      role: "user",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-03T00:00:00.000Z",
    });

    // Act
    const user = await updateCurrentUser({
      email: "new@example.com",
      username: "new_user",
      firstName: "New",
      lastName: "Name",
      bio: "Brasseur amateur",
    });

    // Assert
    expect(mockRequest).toHaveBeenCalledWith("/auth/me", {
      method: "PATCH",
      body: {
        email: "new@example.com",
        username: "new_user",
        first_name: "New",
        last_name: "Name",
        bio: "Brasseur amateur",
      },
    });
    expect(user.firstName).toBe("New");
  });

  it("changes the current user's password", async () => {
    // Arrange
    mockRequest.mockResolvedValue({ message: "Password changed successfully" });

    // Act
    await changeCurrentUserPassword({
      currentPassword: "OldPassword1!",
      newPassword: "NewPassword1!",
    });

    // Assert
    expect(mockRequest).toHaveBeenCalledWith("/auth/me/change-password", {
      method: "POST",
      body: {
        old_password: "OldPassword1!",
        new_password: "NewPassword1!",
      },
    });
  });

  it("omits optional signup fields when they are not provided", async () => {
    // Arrange
    mockRequest.mockResolvedValue({
      access_token: "access-token",
      user: {
        id: "u-minimal",
        email: "minimal@example.com",
        username: "minimal",
        role: "user",
        is_active: true,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    });

    // Act
    await signup({
      email: "minimal@example.com",
      password: "Password1!",
    });

    // Assert
    expect(mockRequest).toHaveBeenCalledWith("/auth/register", {
      method: "POST",
      body: {
        email: "minimal@example.com",
        password: "Password1!",
      },
      auth: false,
    });
  });

  it("sends only the profile fields provided by the caller", async () => {
    // Arrange
    mockRequest.mockResolvedValue({
      id: "u1",
      email: "new@example.com",
      username: "new_user",
      role: "user",
      is_active: true,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-03T00:00:00.000Z",
    });

    // Act
    await updateCurrentUser({ email: "new@example.com" });

    // Assert
    expect(mockRequest).toHaveBeenCalledWith("/auth/me", {
      method: "PATCH",
      body: { email: "new@example.com" },
    });
  });

  it("propagates a profile update failure", async () => {
    // Arrange
    const error = new HttpError(422, "Email already used");
    mockRequest.mockRejectedValue(error);

    // Act
    const updatePromise = updateCurrentUser({
      email: "duplicate@example.com",
    });

    // Assert
    await expect(updatePromise).rejects.toBe(error);
  });

  it("propagates a password change failure", async () => {
    // Arrange
    const error = new HttpError(401, "Current password is invalid");
    mockRequest.mockRejectedValue(error);

    // Act
    const changePromise = changeCurrentUserPassword({
      currentPassword: "WrongPassword1!",
      newPassword: "NewPassword1!",
    });

    // Assert
    await expect(changePromise).rejects.toBe(error);
  });

  it("deletes the current account through the authenticated endpoint", async () => {
    // Arrange
    mockRequest.mockResolvedValue({ message: "User deleted successfully" });

    // Act
    await deleteCurrentUser();

    // Assert
    expect(mockRequest).toHaveBeenCalledWith("/auth/me", {
      method: "DELETE",
    });
  });

  it("propagates account deletion failures", async () => {
    // Arrange
    const error = new HttpError(500, "Deletion failed");
    mockRequest.mockRejectedValue(error);

    // Act
    const deletionPromise = deleteCurrentUser();

    // Assert
    await expect(deletionPromise).rejects.toBe(error);
  });

  it("requests a 30-day deletion grace period", async () => {
    // Arrange
    mockRequest.mockResolvedValue({
      status: "scheduled",
      requested_at: "2026-07-16T10:00:00.000Z",
      scheduled_for: "2026-08-15T10:00:00.000Z",
      grace_period_days: 30,
    });

    // Act
    const result = await requestCurrentUserDeletion();

    // Assert
    expect(result).toEqual({
      status: "scheduled",
      requestedAt: "2026-07-16T10:00:00.000Z",
      scheduledFor: "2026-08-15T10:00:00.000Z",
      gracePeriodDays: 30,
    });
    expect(mockRequest).toHaveBeenCalledWith("/auth/me/deletion", {
      method: "POST",
    });
  });

  it("cancels the authenticated deletion request", async () => {
    // Arrange
    mockRequest.mockResolvedValue({ message: "Account deletion canceled" });

    // Act
    await cancelCurrentUserDeletion();

    // Assert
    expect(mockRequest).toHaveBeenCalledWith("/auth/me/deletion", {
      method: "DELETE",
    });
  });
});
