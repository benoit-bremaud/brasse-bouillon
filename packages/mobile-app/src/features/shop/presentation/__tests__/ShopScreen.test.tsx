import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import React from "react";
import { ShopScreen } from "@/features/shop/presentation/ShopScreen";
import { listIngredientCategoriesSummary } from "@/features/ingredients/application/ingredients.use-cases";
import type { IngredientCategorySummary } from "@/features/ingredients/domain/ingredient.types";

jest.mock("@expo/vector-icons", () => {
  return {
    Ionicons: () => null,
  };
});

const mockPush = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: jest.fn(),
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/ingredients/application/ingredients.use-cases", () => ({
  listIngredientCategoriesSummary: jest.fn(),
}));

const mockListSummary = jest.mocked(listIngredientCategoriesSummary);

function renderShopScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <ShopScreen />
    </QueryClientProvider>,
  );
}

describe("ShopScreen", () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockListSummary.mockReset();
    mockListSummary.mockResolvedValue([
      { category: "malt", count: 10 },
      { category: "hop", count: 4 },
      { category: "yeast", count: 4 },
      { category: "misc", count: 4 },
    ]);
  });

  it("renders every rayon, counting the live ones from the catalog", async () => {
    renderShopScreen();

    expect(await screen.findByText("10")).toBeTruthy();
    expect(screen.getByText("Malts")).toBeTruthy();
    expect(screen.getByText("Houblons")).toBeTruthy();
    expect(screen.getByText("Levures")).toBeTruthy();
    expect(screen.getByText("Kits")).toBeTruthy();
    expect(screen.getByText("Matériel")).toBeTruthy();
    expect(screen.getByText("Accessoires")).toBeTruthy();
  });

  it("opens the real catalog category when a live rayon is pressed", async () => {
    renderShopScreen();

    fireEvent.press(await screen.findByLabelText("Ouvrir le rayon Houblons"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]",
      params: { category: "hop" },
    });
  });

  // #1453's guard, narrowed rather than dropped — the re-decision it was
  // built to force. Live rayons are pressable by design now; a rayon with no
  // catalog source must stay inert, because the shop promises nothing it
  // cannot deliver (#1444).
  it("leaves a sourceless rayon inert", async () => {
    renderShopScreen();
    await screen.findByText("10");

    // Accessoires left this list when its catalog was wired — the guard
    // forcing that re-decision is the point of keeping it narrow.
    expect(screen.queryByLabelText("Ouvrir le rayon Kits")).toBeNull();
    expect(screen.queryByLabelText("Ouvrir le rayon Matériel")).toBeNull();
    // `Badge` uppercases its label by design (design-system § Badge).
    expect(screen.getAllByText("BIENTÔT")).toHaveLength(2);
  });

  it("opens the misc catalog from the Accessoires rayon", async () => {
    renderShopScreen();

    fireEvent.press(
      await screen.findByLabelText("Ouvrir le rayon Accessoires"),
    );

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]",
      params: { category: "misc" },
    });
  });

  // #1444 deleted a catalog of invented prices. No price may render until
  // real products exist — and they do not.
  it("displays no price", async () => {
    renderShopScreen();
    await screen.findByText("10");

    expect(screen.queryByText(/€/)).toBeNull();
  });

  it("surfaces the catalog error, with a retry", async () => {
    mockListSummary.mockRejectedValue(new Error("Catalogue injoignable"));

    renderShopScreen();

    // `getErrorMessage` prefers the error's own message and falls back to
    // ours only when it has none — so the brewer reads the real cause.
    await waitFor(() => {
      expect(screen.getByText("Catalogue injoignable")).toBeTruthy();
    });
    expect(screen.getByText("Réessayer")).toBeTruthy();
  });

  it("shows the loader while a retry is in flight", async () => {
    mockListSummary.mockRejectedValue(new Error("Catalogue injoignable"));
    renderShopScreen();
    await screen.findByText("Réessayer");

    let resolveRetry: (value: IngredientCategorySummary[]) => void = () => {};
    mockListSummary.mockReturnValue(
      new Promise((resolve) => {
        resolveRetry = resolve;
      }),
    );
    fireEvent.press(screen.getByText("Réessayer"));

    await waitFor(() => {
      expect(screen.getByTestId("beer-mug-loader")).toBeTruthy();
    });

    resolveRetry([{ category: "malt", count: 10 }]);
    expect(await screen.findByText("10")).toBeTruthy();
  });

  // NOT covered here, deliberately: the path where `isRetryingWithError`
  // actually bites — a *populated* catalog whose refetch fails, then retries,
  // where without the guard the brewer would keep reading stale counts as if
  // fresh. Reaching it needs a remount-driven refetch, not a button. Mutation
  // testing proved a naive version of that test passes with the guard removed
  // (this suite's first-load failure leaves the query data-less, so `status`
  // returns to `pending` and the loader shows either way) — a test that cannot
  // fail is worse than none, so the gap is named instead of faked.
});
