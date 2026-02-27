import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { getMaltDetails } from "@/features/ingredients/application/malts.use-cases";
import { MaltDetailsScreen } from "@/features/ingredients/presentation/MaltDetailsScreen";
import React from "react";

const mockBack = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: mockBack,
    }),
  };
});

jest.mock("@/features/ingredients/application/malts.use-cases", () => ({
  getMaltDetails: jest.fn(),
}));

const mockedGetMaltDetails = getMaltDetails as jest.MockedFunction<
  typeof getMaltDetails
>;

function renderMaltDetailsScreen(maltIdParam: string | string[] = "malt-1") {
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
      <MaltDetailsScreen maltIdParam={maltIdParam} />
    </QueryClientProvider>,
  );
}

describe("MaltDetailsScreen", () => {
  beforeEach(() => {
    mockBack.mockReset();
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
    renderMaltDetailsScreen("malt-1");

    expect(await screen.findByText("Pale Ale Malt")).toBeTruthy();
    expect(screen.getByText("Analytical profile")).toBeTruthy();
    expect(screen.getByText("Color")).toBeTruthy();
    expect(screen.getByText("6 EBC")).toBeTruthy();
    expect(screen.getByText("Extract (dry basis)")).toBeTruthy();
    expect(screen.getByText("81.5 %")).toBeTruthy();
  });

  it("navigates back when pressing the action button", async () => {
    renderMaltDetailsScreen("malt-1");

    expect(await screen.findByText("Pale Ale Malt")).toBeTruthy();

    fireEvent.press(screen.getByText("Go back"));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });

  it("shows empty state when route parameter is missing", async () => {
    renderMaltDetailsScreen("");

    expect(await screen.findByText("Unavailable malt sheet")).toBeTruthy();
    expect(mockedGetMaltDetails).not.toHaveBeenCalled();
  });

  it("shows empty state when malt is not found", async () => {
    mockedGetMaltDetails.mockResolvedValueOnce(null);

    renderMaltDetailsScreen("malt-missing");

    expect(await screen.findByText("Malt not found")).toBeTruthy();
  });
});
