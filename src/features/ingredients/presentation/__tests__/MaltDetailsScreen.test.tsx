import {
  getMaltDetails,
  listAlternativeMalts,
} from "@/features/ingredients/application/malts.use-cases";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

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
  listAlternativeMalts: jest.fn(),
}));

const mockedGetMaltDetails = getMaltDetails as jest.MockedFunction<
  typeof getMaltDetails
>;
const mockedListAlternativeMalts = listAlternativeMalts as jest.MockedFunction<
  typeof listAlternativeMalts
>;

type RenderMaltDetailsScreenOptions = {
  maltIdParam?: string | string[];
  returnToParam?: string | string[];
  returnRecipeIdParam?: string | string[];
  returnCategoryParam?: string | string[];
  returnSearchParam?: string | string[];
  returnEbcMinParam?: string | string[];
  returnEbcMaxParam?: string | string[];
};

function renderMaltDetailsScreen({
  maltIdParam = "malt-1",
  returnToParam,
  returnRecipeIdParam,
  returnCategoryParam,
  returnSearchParam,
  returnEbcMinParam,
  returnEbcMaxParam,
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
        returnCategoryParam={returnCategoryParam}
        returnSearchParam={returnSearchParam}
        returnEbcMinParam={returnEbcMinParam}
        returnEbcMaxParam={returnEbcMaxParam}
      />
    </QueryClientProvider>,
  );
}

describe("MaltDetailsScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockedGetMaltDetails.mockReset();
    mockedListAlternativeMalts.mockReset();
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
    mockedListAlternativeMalts.mockResolvedValue([]);
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

  it("navigates back to malt category with preserved filters", async () => {
    renderMaltDetailsScreen({
      maltIdParam: "malt-1",
      returnToParam: "/(app)/ingredients/[category]",
      returnCategoryParam: "malt",
      returnSearchParam: "wheat",
      returnEbcMinParam: "4",
      returnEbcMaxParam: "12",
    });

    expect(await screen.findByText("Pale Ale Malt")).toBeTruthy();

    fireEvent.press(screen.getByText("Go back"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/[category]",
      params: {
        category: "malt",
        search: "wheat",
        ebcMin: "4",
        ebcMax: "12",
      },
    });
  });

  it("renders alternatives and opens selected alternative with context", async () => {
    mockedListAlternativeMalts.mockResolvedValueOnce([
      {
        id: "malt-2",
        slug: "vienna-malt",
        name: "Vienna Malt",
        brand: "Malterie du Château",
        originCountry: "France",
        maltType: "Base malt",
        specGroups: [
          {
            id: "analytical",
            title: "Analytical profile",
            rows: [{ id: "color", label: "Color", value: "8", unit: "EBC" }],
          },
        ],
      },
    ]);

    renderMaltDetailsScreen({
      maltIdParam: "malt-1",
      returnToParam: "/(app)/ingredients/[category]",
      returnCategoryParam: "malt",
      returnSearchParam: "wheat",
      returnEbcMinParam: "4",
      returnEbcMaxParam: "12",
    });

    expect(await screen.findByText("Alternative malts")).toBeTruthy();
    expect(screen.getByText("Vienna Malt")).toBeTruthy();
    expect(screen.getByText("Type: Base malt • EBC: 8")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("View alternative malt Vienna Malt"));

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(app)/ingredients/malts/[id]",
      params: {
        id: "malt-2",
        returnTo: "/(app)/ingredients/[category]",
        returnCategory: "malt",
        returnSearch: "wheat",
        returnEbcMin: "4",
        returnEbcMax: "12",
      },
    });
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
