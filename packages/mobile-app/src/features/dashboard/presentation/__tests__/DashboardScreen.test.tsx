import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { DashboardScreen } from "@/features/dashboard/presentation/DashboardScreen";
import React from "react";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: () => null,
  };
});

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
    back: jest.fn(),
  }),
  usePathname: () => "/",
}));

// Mutable session mock so demo-mode tests can switch to Marie
// (demoUsers[0].id = "u-demo-1") and the production code's
// demoRecipes ownership lookup matches.
const sessionUserMock = {
  id: "u1",
  email: "brewer@example.com",
  username: "brewer",
  firstName: "Benoit",
  role: "user",
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

jest.mock("@/core/auth/auth-context", () => ({
  useAuth: () => ({
    session: {
      accessToken: "token",
      user: sessionUserMock,
    },
  }),
}));

// Mutable dataSource mock — flipping `useDemoData` in a test
// surfaces the hero / ribbon / explore sections in the production
// code, and the existing assertions keep their live-mode default.
const dataSourceMock = { useDemoData: false };
jest.mock("@/core/data/data-source", () => ({
  get dataSource() {
    return dataSourceMock;
  },
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

const liveBatch = {
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
};

jest.mock("@/features/batches/application/batches.use-cases", () => ({
  listBatches: jest.fn(),
}));

// Pull the mocked fn out after the jest.mock call so each test can
// override the resolved value (live-mode default vs demo-mode
// fil-rouge dataset).
import { listBatches } from "@/features/batches/application/batches.use-cases";

function renderDashboardScreen() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: Number.POSITIVE_INFINITY,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <DashboardScreen />
    </QueryClientProvider>,
  );
}

describe("DashboardScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    dataSourceMock.useDemoData = false;
    sessionUserMock.id = "u1";
    sessionUserMock.firstName = "Benoit";
    (listBatches as jest.Mock).mockResolvedValue([liveBatch]);
  });

  it("renders the new dashboard sections and interactions", async () => {
    renderDashboardScreen();

    expect(await screen.findByText("Tableau de bord brassage")).toBeTruthy();
    expect(screen.getByText(/Benoit/)).toBeTruthy();
    expect(screen.getByText("Vue d’ensemble")).toBeTruthy();
    expect(screen.getByText("Alertes & échéances")).toBeTruthy();
    expect(screen.getAllByText("Brassins actifs").length).toBeGreaterThan(0);

    // Issue #646 — the "Période d'analyse" widget (Année / 90 jours
    // / 30 jours) was misplaced on the home and is gone. Regression
    // guard: none of the chip labels nor the section title appear.
    expect(screen.queryByText("Période d’analyse")).toBeNull();
    expect(screen.queryByText("Année")).toBeNull();
    expect(screen.queryByText("90 jours")).toBeNull();
    expect(screen.queryByText("30 jours")).toBeNull();

    fireEvent.press(screen.getByLabelText("Voir plus de sections"));
    expect(screen.getByText("Sections métier")).toBeTruthy();
    expect(screen.getByText("Compte")).toBeTruthy();
    expect(screen.getByText("Scanner")).toBeTruthy();
    expect(screen.getByText("Mes étiquettes")).toBeTruthy();

    // Issue #644 — the "Paramètres globaux" entry was a dead duplicate
    // of "Profil" (both navigated to /(app)/profile). The single account
    // entry is now labelled "Mon compte". Regression guards: the old
    // duplicate must not render anywhere; the new label must render in
    // the More-sheet (account entry "Mon compte"). The dashboard header
    // action is icon-only since the layout refonte (chunk 2 of the demo
    // dashboard refresh) but is still reachable via accessibilityLabel
    // "Ouvrir Mon compte" — asserted separately below at line 149.
    expect(screen.queryByText("Paramètres globaux")).toBeNull();
    expect(screen.queryByText("Profil")).toBeNull();
    expect(screen.getByText("Mon compte")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Ouvrir Mes étiquettes"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/dashboard/labels");

    fireEvent.press(screen.getByLabelText("Voir plus de sections"));

    fireEvent.press(screen.getByLabelText("Ouvrir Scanner"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/dashboard/scan");

    // Issue #644 — header action label aligned with the More-sheet
    // and screen header ("Mon compte"). Previously labelled "Profil".
    fireEvent.press(screen.getByLabelText("Ouvrir Mon compte"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/profile");
  });
});

describe("DashboardScreen — demo-mode hero", () => {
  // Anchor the fil-rouge fermentation start 5 days ago so the ribbon
  // computes a sensible "J+5" value at render time. The mash batch
  // started 30 minutes ago so the hero shows "Empâtage · 30 min sur
  // 120" — matches the marketing screenshot intent. Dates are
  // refreshed inside beforeEach so the relative window stays accurate
  // even if the test runs at midnight.
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    dataSourceMock.useDemoData = true;
    sessionUserMock.id = "u-demo-1";
    sessionUserMock.firstName = "Marie";

    const now = Date.now();
    const thirtyMinutesAgo = new Date(now - 30 * 60 * 1000).toISOString();
    const fiveDaysAgo = new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

    (listBatches as jest.Mock).mockResolvedValue([
      {
        id: "b-demo-pdd-mash",
        ownerId: "u-demo-1",
        recipeId: "r-demo-pdd",
        status: "in_progress",
        currentStepOrder: 0,
        startedAt: thirtyMinutesAgo,
        fermentationStartedAt: null,
        fermentationCompletedAt: null,
        completedAt: null,
        createdAt: thirtyMinutesAgo,
        updatedAt: thirtyMinutesAgo,
      },
      {
        id: "b-demo-pdd-ferm",
        ownerId: "u-demo-1",
        recipeId: "r-demo-pdd",
        status: "in_progress",
        currentStepOrder: 2,
        startedAt: oneWeekAgo,
        fermentationStartedAt: fiveDaysAgo,
        fermentationCompletedAt: null,
        completedAt: null,
        createdAt: oneWeekAgo,
        updatedAt: fiveDaysAgo,
      },
      {
        id: "b-demo-pdd-done",
        ownerId: "u-demo-1",
        recipeId: "r-demo-pdd",
        status: "completed",
        currentStepOrder: 2,
        startedAt: "2026-04-22T09:00:00.000Z",
        fermentationStartedAt: "2026-04-22T11:30:00.000Z",
        fermentationCompletedAt: "2026-05-06T11:30:00.000Z",
        completedAt: "2026-05-12T15:00:00.000Z",
        createdAt: "2026-04-22T09:00:00.000Z",
        updatedAt: "2026-05-12T15:00:00.000Z",
      },
    ]);
  });

  it("renders the fil-rouge hero card with the recipe identity (happy path)", async () => {
    renderDashboardScreen();

    // Recipe name appears in the hero, in the contextual subtitle of
    // the header, AND in the "Brassins actifs" list below — assert
    // at least one occurrence.
    expect(
      (await screen.findAllByText("La Première du dimanche")).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText("En cours")).toBeTruthy();
    expect(screen.getByText("Suivre mon brassin")).toBeTruthy();
    // Stats line: 5 L volume + IBU 22 from the seeded recipe.
    expect(screen.getByText(/5 L/)).toBeTruthy();
    expect(screen.getByText(/22 IBU/)).toBeTruthy();
  });

  it("renders the three-figure ribbon with the fermentation day", async () => {
    renderDashboardScreen();

    await screen.findByText("Suivre mon brassin");

    expect(screen.getByText("brassins")).toBeTruthy();
    expect(screen.getByText("recette signée")).toBeTruthy();
    expect(screen.getByText("fermentation")).toBeTruthy();
    // Fermentation day computed from the 5-days-ago anchor above.
    expect(screen.getByText("J+5")).toBeTruthy();
  });

  it("renders the À explorer launchpad section", async () => {
    renderDashboardScreen();

    await screen.findByText("Suivre mon brassin");

    expect(screen.getByText("À explorer")).toBeTruthy();
    expect(screen.getByText("Scanne une bière qui t’inspire")).toBeTruthy();
    expect(screen.getByText("Apprends un nouveau geste")).toBeTruthy();
    expect(screen.getByText("Crée ta propre recette")).toBeTruthy();
  });

  it("navigates from the hero CTA + the explore cards (sad / edge paths)", async () => {
    renderDashboardScreen();

    await screen.findByText("Suivre mon brassin");

    fireEvent.press(
      screen.getByLabelText("Suivre le brassin La Première du dimanche"),
    );
    expect(mockPush).toHaveBeenCalledWith("/(app)/batches/b-demo-pdd-mash");

    fireEvent.press(screen.getByLabelText("Scanner une bière"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/dashboard/scan");

    fireEvent.press(screen.getByLabelText("Découvrir l'académie"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/academy");

    fireEvent.press(screen.getByLabelText("Créer ma propre recette"));
    expect(mockPush).toHaveBeenCalledWith("/(app)/recipes/catalog");
  });

  it("hides the legacy KPI and alerts cards when the hero is rendered", async () => {
    renderDashboardScreen();

    await screen.findByText("Suivre mon brassin");

    // Both the "Vue d'ensemble" section header and the "Alertes &
    // échéances" section header are suppressed in demo mode so the
    // hero narrative is not diluted.
    expect(screen.queryByText("Vue d’ensemble")).toBeNull();
    expect(screen.queryByText("Alertes & échéances")).toBeNull();
  });
});
