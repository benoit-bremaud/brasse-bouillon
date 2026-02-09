import { render, screen } from "@testing-library/react-native";

import { LoginScreen } from "@/features/auth/presentation/LoginScreen";
import React from "react";

jest.mock("@/core/auth/auth-context", () => ({
  useAuth: () => ({
    login: jest.fn(),
    isLoading: false,
    error: null,
  }),
}));

describe("LoginScreen", () => {
  it("renders login form", () => {
    render(<LoginScreen />);

    expect(screen.getByText("Brasse Bouillon")).toBeTruthy();
    expect(screen.getByText("Sign in to continue")).toBeTruthy();
    expect(screen.getByPlaceholderText("Email")).toBeTruthy();
    expect(screen.getByPlaceholderText("Password")).toBeTruthy();
  });
});
