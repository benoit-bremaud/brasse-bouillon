jest.mock("expo-secure-store", () => ({
  isAvailableAsync: jest.fn().mockResolvedValue(false),
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import { authSession } from "@/core/auth/session";

describe("authSession — unauthorized handler registry (#1130)", () => {
  afterEach(() => {
    authSession.setUnauthorizedHandler(null);
  });

  it("happy: notifyUnauthorized invokes the registered handler", () => {
    const handler = jest.fn();
    authSession.setUnauthorizedHandler(handler);

    authSession.notifyUnauthorized();

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("sad: notifyUnauthorized is a no-op when no handler is registered", () => {
    expect(() => authSession.notifyUnauthorized()).not.toThrow();
  });

  it("edge: a null handler clears a previously registered one", () => {
    const handler = jest.fn();
    authSession.setUnauthorizedHandler(handler);
    authSession.setUnauthorizedHandler(null);

    authSession.notifyUnauthorized();

    expect(handler).not.toHaveBeenCalled();
  });
});
