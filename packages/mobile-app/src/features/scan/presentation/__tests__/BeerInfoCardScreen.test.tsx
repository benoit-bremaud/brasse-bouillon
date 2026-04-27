import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";

import { BeerInfoCardScreen } from "@/features/scan/presentation/BeerInfoCardScreen";
import {
  ScanLookupBeerNotFoundError,
  ScanLookupServiceUnavailableError,
  lookupBeerByBarcode,
} from "@/features/scan/application/scan-lookup.use-cases";
import type { ScanLookupResult } from "@/features/scan/domain/scan.types";

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

jest.mock("@/features/scan/application/scan-lookup.use-cases", () => {
  const actual = jest.requireActual(
    "@/features/scan/application/scan-lookup.use-cases",
  );
  return {
    ...actual,
    lookupBeerByBarcode: jest.fn(),
  };
});

const mockedLookup = lookupBeerByBarcode as jest.MockedFunction<
  typeof lookupBeerByBarcode
>;

function buildResult(
  overrides: Partial<ScanLookupResult["item"]> = {},
): ScanLookupResult {
  return {
    item: {
      id: "id-1",
      barcode: "5060277380011",
      name: "Punk IPA",
      brewery: "BrewDog",
      style: "IPA",
      abv: 5.4,
      ibu: 35,
      colorEbc: 14,
      fermentationType: "ale",
      aromaticTags: "tropical, citrus, pine",
      notesSource: "BrewDog DIY Dog 2019",
      isAbvEstimated: false,
      isIbuEstimated: false,
      isColorEbcEstimated: false,
      isStyleEstimated: false,
      origin: "seed",
      fetchedAt: null,
      createdAt: "2026-04-27T00:00:00.000Z",
      updatedAt: "2026-04-27T00:00:00.000Z",
      ...overrides,
    },
    source: "cache_hit_fresh",
    rawPayloadAvailable: false,
  };
}

describe("BeerInfoCardScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockedLookup.mockReset();
  });

  describe("happy path", () => {
    it("renders hero, at-a-glance words, and recipes for a known beer", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      render(<BeerInfoCardScreen barcodeParam="5060277380011" />);

      expect(await screen.findByText("Punk IPA")).toBeTruthy();
      expect(screen.getByText("BrewDog")).toBeTruthy();
      // "IPA" appears twice: in the hero chip and the at-a-glance Style cell
      expect(screen.getAllByText("IPA")).toHaveLength(2);
      expect(screen.getByText("5.4 %")).toBeTruthy();
      expect(screen.getByText("De session")).toBeTruthy();
      expect(screen.getByText("Ambrée")).toBeTruthy();
      expect(screen.getByText("Modérément amère")).toBeTruthy();
      expect(screen.getByText("🧪 Recettes équivalentes")).toBeTruthy();
      // The demo set maps Punk IPA to existing demoRecipes
      // (r-demo-1 / r-demo-7 / r-demo-13) so taps land on real
      // recipe detail pages.
      expect(screen.getByText("Session IPA Citra")).toBeTruthy();
    });

    it("calls the use-case with the barcode from the route param", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      render(<BeerInfoCardScreen barcodeParam="5060277380011" />);

      await screen.findByText("Punk IPA");
      expect(mockedLookup).toHaveBeenCalledWith("5060277380011");
    });

    it("handles barcodeParam passed as an array (Expo Router edge case)", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      render(
        <BeerInfoCardScreen
          barcodeParam={["5060277380011", "extra"] as string[]}
        />,
      );

      await screen.findByText("Punk IPA");
      expect(mockedLookup).toHaveBeenCalledWith("5060277380011");
    });
  });

  describe("sad path — partial data", () => {
    it("renders Inconnu words for missing IBU and EBC", async () => {
      mockedLookup.mockResolvedValueOnce(
        buildResult({
          name: "Mystery Beer",
          brewery: "Unknown",
          ibu: null,
          colorEbc: null,
          aromaticTags: null,
          notesSource: null,
        }),
      );

      render(<BeerInfoCardScreen barcodeParam="0000000000000" />);

      expect(await screen.findByText("Mystery Beer")).toBeTruthy();
      const inconnuLabels = screen.getAllByText("Inconnu");
      expect(inconnuLabels.length).toBeGreaterThanOrEqual(2);
    });

    it("falls back to dash for missing ABV", async () => {
      mockedLookup.mockResolvedValueOnce(
        buildResult({ abv: null, ibu: null, colorEbc: null }),
      );

      render(<BeerInfoCardScreen barcodeParam="0000000000000" />);

      await screen.findByText("Punk IPA");
      expect(screen.getByText("—")).toBeTruthy();
    });
  });

  describe("lazy folds", () => {
    it("does not render technical details before the fold is opened", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      render(<BeerInfoCardScreen barcodeParam="5060277380011" />);

      await screen.findByText("Punk IPA");
      // "Notes aromatiques" is inside Technical Details fold
      expect(screen.queryByText("Notes aromatiques")).toBeNull();
    });

    it("renders technical details after the fold is opened", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      render(<BeerInfoCardScreen barcodeParam="5060277380011" />);

      await screen.findByText("Punk IPA");
      fireEvent.press(
        screen.getByRole("button", { name: "Détails techniques" }),
      );

      expect(screen.getByText("Notes aromatiques")).toBeTruthy();
      expect(screen.getByText("tropical, citrus, pine")).toBeTruthy();
    });

    it("renders the curated brewery story when the fold is opened (BrewDog)", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      render(<BeerInfoCardScreen barcodeParam="5060277380011" />);

      await screen.findByText("Punk IPA");
      fireEvent.press(
        screen.getByRole("button", { name: "Histoire de la brasserie" }),
      );

      expect(screen.getByText(/Fondée en 2007 à Fraserburgh/)).toBeTruthy();
    });

    it("renders 'Histoire à venir' fallback when the brewery has no curated story", async () => {
      mockedLookup.mockResolvedValueOnce(
        buildResult({ brewery: "Unknown Brewery" }),
      );

      render(<BeerInfoCardScreen barcodeParam="0000000000000" />);

      await screen.findByText("Punk IPA");
      fireEvent.press(
        screen.getByRole("button", { name: "Histoire de la brasserie" }),
      );

      expect(screen.getByText(/Histoire à venir/)).toBeTruthy();
    });
  });

  describe("error states", () => {
    it("shows the not-found message when the lookup throws ScanLookupBeerNotFoundError", async () => {
      mockedLookup.mockRejectedValueOnce(
        new ScanLookupBeerNotFoundError("0000000000000"),
      );

      render(<BeerInfoCardScreen barcodeParam="0000000000000" />);

      expect(
        await screen.findByText(/n'est pas dans notre catalogue/),
      ).toBeTruthy();
    });

    it("shows the unavailable message + retry on ScanLookupServiceUnavailableError", async () => {
      mockedLookup.mockRejectedValueOnce(
        new ScanLookupServiceUnavailableError("5060277380011"),
      );

      render(<BeerInfoCardScreen barcodeParam="5060277380011" />);

      expect(
        await screen.findByText(/temporairement indisponible/),
      ).toBeTruthy();
    });
  });

  describe("recipe navigation", () => {
    it("navigates to a real recipe detail when a recipe row is pressed", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      render(<BeerInfoCardScreen barcodeParam="5060277380011" />);

      const recipeRow = await screen.findByLabelText(/Session IPA Citra/);
      fireEvent.press(recipeRow);

      // Punk IPA's first match maps to the existing r-demo-1 recipe
      // so the navigation lands on a resolvable recipe detail page
      // (Codex P1 fix: mocks now use real demoRecipes IDs).
      expect(mockPush).toHaveBeenCalledWith("/(app)/recipes/r-demo-1");
    });
  });
});
