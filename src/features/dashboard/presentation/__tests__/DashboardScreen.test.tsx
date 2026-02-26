import { fireEvent, render, screen } from "@testing-library/react-native";

import { DashboardScreen } from "@/features/dashboard/presentation/DashboardScreen";
import React from "react";

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockLogout = jest.fn().mockResolvedValue(undefined);

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
  }),
}));

jest.mock("@/core/auth/auth-context", () => ({
  useAuth: () => ({
    session: {
      accessToken: "token",
      user: {
        id: "u1",
        email: "brewer@example.com",
        username: "brewer",
        firstName: "Benoit",
        role: "user",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    },
    logout: mockLogout,
  }),
}));

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  listRecipes: jest.fn().mockResolvedValue([
    {
      id: "r1",
      ownerId: "u1",
      name: "Session IPA",
      visibility: "private",
      description: null,
      stats: null,
      ingredients: [],
      version: 1,
      rootRecipeId: "r1",
      parentRecipeId: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]),
}));

jest.mock("@/features/batches/application/batches.use-cases", () => ({
  listBatches: jest.fn().mockResolvedValue([
    {
      id: "b1",
      ownerId: "u1",
      recipeId: "r1",
      status: "in_progress",
      currentStepOrder: 1,
      startedAt: "2026-01-01T00:00:00.000Z",
      fermentationStartedAt: null,
      fermentationCompletedAt: null,
      completedAt: null,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]),
}));

describe("DashboardScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    mockLogout.mockClear();
  });

  it("renders the new dashboard sections and interactions", async () => {
    render(<DashboardScreen />);

    expect(await screen.findByText("Tableau de bord brassage")).toBeTruthy();
    expect(screen.getByText("Période d’analyse")).toBeTruthy();
    expect(screen.getByText("Vue d’ensemble")).toBeTruthy();
    expect(screen.getByText("Alertes & échéances")).toBeTruthy();
    expect(screen.getAllByText("Brassins actifs").length).toBeGreaterThan(0);
    expect(screen.getByText("Navigation rapide")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Voir plus de sections"));
    expect(screen.getByText("Sections métier")).toBeTruthy();
    expect(screen.getByText("Compte")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Ouvrir le profil"));
    expect(screen.getByText("Paramètres globaux")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Se déconnecter"));
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
