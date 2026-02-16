import { render, screen } from "@testing-library/react-native";

import { DashboardScreen } from "@/features/dashboard/presentation/DashboardScreen";
import React from "react";

jest.mock("@/core/auth/auth-context", () => ({
  useAuth: () => ({
    session: {
      accessToken: "token",
      user: {
        id: "u1",
        email: "brewer@example.com",
        username: "brewer",
        role: "user",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    },
    logout: jest.fn(),
  }),
}));

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  listRecipes: jest.fn().mockResolvedValue([
    { id: "r-private", name: "Private IPA", visibility: "private" },
    { id: "r-public", name: "Public Lager", visibility: "public" },
  ]),
}));

jest.mock("@/features/batches/application/batches.use-cases", () => ({
  listBatches: jest.fn().mockResolvedValue([
    {
      id: "b1",
      status: "in_progress",
      recipeId: "r-private",
      ownerId: "u1",
      currentStepOrder: 1,
      startedAt: "2026-01-01T00:00:00.000Z",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]),
}));

describe("DashboardScreen", () => {
  it("renders key dashboard sections", async () => {
    render(<DashboardScreen />);

    expect(await screen.findByText("Tableau de bord")).toBeTruthy();
    expect(screen.getByText("Profil")).toBeTruthy();
    expect(screen.getByText("Mes recettes privées")).toBeTruthy();
    expect(screen.getByText("Recettes publiques favorites")).toBeTruthy();
    expect(screen.getAllByText("Brassins en cours").length).toBeGreaterThan(0);
    expect(screen.getByText("Accès rapide à tous les écrans")).toBeTruthy();
    expect(screen.getByText("Utilisateurs")).toBeTruthy();
    expect(screen.getByText("Private IPA")).toBeTruthy();
  });
});
