import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { getMaltDetails } from "@/features/ingredients/application/malts.use-cases";
import { MaltDetailsScreen } from "@/features/ingredients/presentation/MaltDetailsScreen";
import React from "react";

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

jest.mock("@/features/ingredients/application/malts.use-cases", () => ({
  getMaltDetails: jest.fn(),
}));

const mockedGetMaltDetails = getMaltDetails as jest.MockedFunction<
  typeof getMaltDetails
>;

type RenderMaltDetailsScreenOptions = {
  maltIdParam?: string | string[];
  returnToParam?: string | string[];
  returnRecipeIdParam?: string | string[];
};

function renderMaltDetailsScreen({
  maltIdParam = "malt-1",
  returnToParam,
  returnRecipeIdParam,
}: RenderMaltDetailsScreenOptions = {}) {
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
      <MaltDetailsScreen
        maltIdParam={maltIdParam}
        returnToParam={returnToParam}
        returnRecipeIdParam={returnRecipeIdParam}
      />
    </QueryClientProvider>,
  );
}

describe("MaltDetailsScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockedGetMaltDetails.mockReset();
    mockedGetMaltDetails.mockResolvedValue({
      id: "malt-1",
      slug: "pale-ale-malt",
      name: "Pale Ale Malt",
      brand: "Malterie du Château",
      originCountry: "France",
      maltType: "Base malt",
      description: "Classic base malt for pale ales and hop-forward recipes.",
      specGroups: [
        {
          id: "analytical",
          title: "Analytical profile",
          rows: [
            { id: "color", label: "Color", value: "6", unit: "EBC" },
            {
              id: "extract",
              label: "Extract (dry basis)",
              value: "81.5",
              unit: "%",
            },
          ],
        },
      ],
    });
  });

  it("renders malt identity and grouped specs", async () => {
    renderMaltDetailsScreen({ maltIdParam: "malt-1" });

    expect(await screen.findByText("Pale Ale Malt")).toBeTruthy();
    expect(screen.getByTestId("malt-details-scroll")).toBeTruthy();
    expect(screen.getByText("Analytical profile")).toBeTruthy();
    expect(screen.getByText("Color")).toBeTruthy();
    expect(screen.getByText("6 EBC")).toBeTruthy();
    expect(screen.getByText("Extract (dry basis)")).toBeTruthy();
    expect(screen.getByText("81.5 %")).toBeTruthy();
  });

  it("navigates back to recipe details when return params are provided", async () => {
    renderMaltDetailsScreen({
      maltIdParam: "malt-1",
      returnToParam: "/(app)/recipes/[id]",
      returnRecipeIdParam: "r1",
    });

    expect(await screen.findByText("Pale Ale Malt")).toBeTruthy();

    fireEvent.press(screen.getByText("Go back"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/recipes/[id]",
      params: { id: "r1" },
    });
  });

  it("falls back to ingredients root when no return context is provided", async () => {
    renderMaltDetailsScreen({ maltIdParam: "malt-1" });

    expect(await screen.findByText("Pale Ale Malt")).toBeTruthy();

    fireEvent.press(screen.getByText("Go back"));

    expect(mockPush).toHaveBeenCalledWith("/(app)/ingredients");
  });

  it("shows empty state when route parameter is missing", async () => {
    renderMaltDetailsScreen({ maltIdParam: "" });

    expect(await screen.findByText("Unavailable malt sheet")).toBeTruthy();
    expect(mockedGetMaltDetails).not.toHaveBeenCalled();
  });

  it("shows empty state when malt is not found", async () => {
    mockedGetMaltDetails.mockResolvedValueOnce(null);

    renderMaltDetailsScreen({ maltIdParam: "malt-missing" });

    expect(await screen.findByText("Malt not found")).toBeTruthy();
  });
});
