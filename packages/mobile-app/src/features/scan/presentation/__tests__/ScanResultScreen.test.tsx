import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import React from "react";
import { ScanResultScreen } from "@/features/scan/presentation/ScanResultScreen";
import { getScanResultDetails } from "@/features/scan/application/scan.use-cases";

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");

  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
      replace: mockReplace,
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/scan/application/scan.use-cases", () => ({
  getScanResultDetails: jest.fn(),
}));

const mockedGetScanResultDetails = getScanResultDetails as jest.MockedFunction<
  typeof getScanResultDetails
>;

describe("ScanResultScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockedGetScanResultDetails.mockReset();
  });

  it("renders unavailable state when no result exists", async () => {
    mockedGetScanResultDetails.mockResolvedValue(null);

    render(<ScanResultScreen scanIdParam="scan-missing" />);

    expect(await screen.findByText("Result unavailable")).toBeTruthy();

    fireEvent.press(screen.getByText("Back to scanner"));

    expect(mockReplace).toHaveBeenCalledWith("/(app)/dashboard/scan");
  });

  it("loads details, expands recommendations and opens a recipe", async () => {
    mockedGetScanResultDetails.mockResolvedValue({
      result: {
        scanId: "scan-123",
        status: "matched",
        matchedBy: "label",
        matchedValue: "Session IPA Citra",
        scannedAtIso: "2026-02-01T10:00:00.000Z",
        product: {
          id: "beer-1",
          name: "Session IPA Citra",
          brewery: "Brasse Bouillon Labs",
          style: "Session IPA",
          format: "Can 44cl",
          abv: 5.1,
          ibu: 42,
          colorEbc: 11,
          thumbnailUri: "https://example.com/images/session-ipa-citra.jpg",
        },
        recommendations: [
          {
            recipeId: "r-1",
            recipeName: "Recipe One",
            equivalencePercent: 91,
          },
          {
            recipeId: "r-2",
            recipeName: "Recipe Two",
            equivalencePercent: 83,
          },
          {
            recipeId: "r-3",
            recipeName: "Recipe Three",
            equivalencePercent: 75,
          },
        ],
      },
      details: {
        productId: "beer-1",
        description: "Session IPA with citrus and tropical aromas.",
        ingredients: ["Water", "Barley malt", "Citra hops", "Yeast"],
        tastingNotes: ["Citrus", "Pine"],
        servingTemperatureCelsius: "6-8°C",
        foodPairings: ["Fish tacos"],
      },
    });

    render(<ScanResultScreen scanIdParam="scan-123" />);

    expect(await screen.findByText("Session IPA Citra")).toBeTruthy();
    expect(screen.queryByText("Recipe Three")).toBeNull();

    fireEvent.press(screen.getByText("Show product details"));
    expect(
      await screen.findByText("Session IPA with citrus and tropical aromas."),
    ).toBeTruthy();

    fireEvent.press(screen.getByText("Show more recommendations"));
    expect(await screen.findByText("Recipe Three")).toBeTruthy();

    fireEvent.press(screen.getAllByText("Open recipe")[0]);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/(app)/recipes/r-1");
    });
  });
});
