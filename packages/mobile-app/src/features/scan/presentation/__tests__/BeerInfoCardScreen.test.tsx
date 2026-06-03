import { Alert, Linking } from "react-native";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { BeerInfoCardScreen } from "@/features/scan/presentation/BeerInfoCardScreen";
import { getMatchingRecipes } from "@/features/scan/application/recipe-matching.use-cases";
import { importRecipeFromCommunity } from "@/features/recipes/application/recipes.use-cases";
import {
  ScanLookupBeerNotFoundError,
  ScanLookupNotABeerError,
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

jest.mock("@/features/recipes/application/recipes.use-cases", () => ({
  importRecipeFromCommunity: jest.fn(),
  // The screen's helper picks the right id (demo vs backend); in
  // tests we stay in demo mode so we just return match.recipeId.
  getImportSourceId: (match: { recipeId: string }) => match.recipeId,
}));

jest.mock("@/features/scan/application/recipe-matching.use-cases", () => ({
  getMatchingRecipes: jest.fn(),
}));

const mockedLookup = lookupBeerByBarcode as jest.MockedFunction<
  typeof lookupBeerByBarcode
>;
const mockedImport = importRecipeFromCommunity as jest.MockedFunction<
  typeof importRecipeFromCommunity
>;
const mockedMatching = getMatchingRecipes as jest.MockedFunction<
  typeof getMatchingRecipes
>;

// The screen now fetches via TanStack Query, so it must render inside a
// QueryClientProvider. A fresh client per render keeps the cache from
// leaking between tests; retry is off so rejected mocks surface their
// error state immediately (no retry/backoff delays).
function renderScreen(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return render(
    <QueryClientProvider client={client}>{ui}</QueryClientProvider>,
  );
}

// Default matching response — Punk IPA scan returns a curated trio
// of equivalent IPA-family recipes. Tests can override per case.
const PUNK_IPA_MATCHES = [
  {
    recipeId: "r-demo-1",
    publicRecipeId: "00000000-0000-4000-8000-000000000001",
    name: "Session IPA Citra",
    brewer: "Communauté Brasse-Bouillon",
    rating: 4.7,
    brewedCount: 23,
    score: 92,
    style: "Session IPA",
  },
  {
    recipeId: "r-demo-2",
    publicRecipeId: "00000000-0000-4000-8000-000000000002",
    name: "NEIPA Tropical",
    brewer: "Communauté Brasse-Bouillon",
    rating: 4.5,
    brewedCount: 18,
    score: 78,
    style: "NEIPA",
  },
  {
    recipeId: "r-demo-3",
    publicRecipeId: "00000000-0000-4000-8000-000000000003",
    name: "White IPA",
    brewer: "Communauté Brasse-Bouillon",
    rating: 4.3,
    brewedCount: 12,
    score: 65,
    style: "White IPA",
  },
];

function buildResult(
  overrides: Partial<ScanLookupResult["item"]> = {},
): ScanLookupResult {
  return {
    item: {
      id: "id-1",
      barcode: "5060277380019",
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
  let alertSpy: jest.SpyInstance;

  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockedLookup.mockReset();
    mockedImport.mockReset();
    mockedMatching.mockReset();
    // Default matching response: Punk IPA equivalents, no warning.
    // Individual tests override via mockedMatching.mockResolvedValueOnce.
    mockedMatching.mockResolvedValue({
      rankings: PUNK_IPA_MATCHES,
      lowConfidence: false,
    });
    alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  describe("happy path", () => {
    it("renders hero, at-a-glance words, and recipes for a known beer", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      expect(await screen.findByText("Punk IPA")).toBeTruthy();
      expect(screen.getByText("BrewDog")).toBeTruthy();
      // "IPA" appears twice: in the hero chip and the at-a-glance Style cell
      expect(screen.getAllByText("IPA")).toHaveLength(2);
      expect(screen.getByText("5.4 %")).toBeTruthy();
      expect(screen.getByText("De session")).toBeTruthy();
      expect(screen.getByText("Ambrée")).toBeTruthy();
      expect(screen.getByText("Modérément amère")).toBeTruthy();
      // The matching section renders after a second async effect; wait for it.
      expect(await screen.findByText("🧪 Recettes équivalentes")).toBeTruthy();
      // The demo set maps Punk IPA to existing demoRecipes
      // (r-demo-1 / r-demo-7 / r-demo-13) so taps land on real
      // recipe detail pages.
      expect(screen.getByText("Session IPA Citra")).toBeTruthy();
    });

    it("calls the use-case with the barcode from the route param", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      await screen.findByText("Punk IPA");
      expect(mockedLookup).toHaveBeenCalledWith("5060277380019");
    });

    it("handles barcodeParam passed as an array (Expo Router edge case)", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      renderScreen(
        <BeerInfoCardScreen
          barcodeParam={["5060277380019", "extra"] as string[]}
        />,
      );

      await screen.findByText("Punk IPA");
      expect(mockedLookup).toHaveBeenCalledWith("5060277380019");
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

      renderScreen(<BeerInfoCardScreen barcodeParam="0000000000000" />);

      expect(await screen.findByText("Mystery Beer")).toBeTruthy();
      const inconnuLabels = screen.getAllByText("Inconnu");
      expect(inconnuLabels.length).toBeGreaterThanOrEqual(2);
    });

    it("falls back to dash for missing ABV", async () => {
      mockedLookup.mockResolvedValueOnce(
        buildResult({ abv: null, ibu: null, colorEbc: null }),
      );

      renderScreen(<BeerInfoCardScreen barcodeParam="0000000000000" />);

      await screen.findByText("Punk IPA");
      expect(screen.getByText("—")).toBeTruthy();
    });
  });

  describe("lazy folds", () => {
    it("does not render technical details before the fold is opened", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      await screen.findByText("Punk IPA");
      // "Notes aromatiques" is inside Technical Details fold
      expect(screen.queryByText("Notes aromatiques")).toBeNull();
    });

    it("renders technical details after the fold is opened", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      await screen.findByText("Punk IPA");
      fireEvent.press(
        screen.getByRole("button", { name: "Détails techniques" }),
      );

      expect(screen.getByText("Notes aromatiques")).toBeTruthy();
      expect(screen.getByText("tropical, citrus, pine")).toBeTruthy();
    });

    it("renders the curated brewery story when the fold is opened (BrewDog)", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

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

      renderScreen(<BeerInfoCardScreen barcodeParam="0000000000000" />);

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

      renderScreen(<BeerInfoCardScreen barcodeParam="0000000000000" />);

      expect(
        await screen.findByText(/n'est pas dans notre catalogue/),
      ).toBeTruthy();
    });

    it("shows the unavailable message + retry on ScanLookupServiceUnavailableError", async () => {
      mockedLookup.mockRejectedValueOnce(
        new ScanLookupServiceUnavailableError("5060277380019"),
      );

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      expect(
        await screen.findByText(/temporairement indisponible/),
      ).toBeTruthy();
    });

    describe("unknown beer graceful UX (Issue #796)", () => {
      let openUrlSpy: jest.SpyInstance;

      beforeEach(() => {
        openUrlSpy = jest
          .spyOn(Linking, "openURL")
          .mockResolvedValue(undefined as never);
      });

      afterEach(() => {
        openUrlSpy.mockRestore();
      });

      it("surfaces the scanned barcode beneath the not-found message", async () => {
        mockedLookup.mockRejectedValueOnce(
          new ScanLookupBeerNotFoundError("3760215750042"),
        );

        renderScreen(<BeerInfoCardScreen barcodeParam="3760215750042" />);

        await screen.findByText(/n'est pas dans notre catalogue/);
        expect(screen.getByText("3760215750042")).toBeTruthy();
        expect(screen.getByText(/Code-barres scanné/i)).toBeTruthy();
      });

      it("opens a well-formed mailto when 'Suggérer une correction' is pressed", async () => {
        mockedLookup.mockRejectedValueOnce(
          new ScanLookupBeerNotFoundError("3760215750042"),
        );

        renderScreen(<BeerInfoCardScreen barcodeParam="3760215750042" />);

        const cta = await screen.findByLabelText(
          /Suggérer une correction par email/i,
        );
        fireEvent.press(cta);

        expect(openUrlSpy).toHaveBeenCalledTimes(1);
        const url = openUrlSpy.mock.calls[0][0] as string;
        expect(url).toMatch(/^mailto:contact@brasse-bouillon\.com\?/);
        expect(url).toContain(encodeURIComponent("Suggestion de correction"));
        expect(url).toContain("3760215750042");
      });

      it("opens a distinct mailto when 'Ajouter cette bière au catalogue' is pressed", async () => {
        mockedLookup.mockRejectedValueOnce(
          new ScanLookupBeerNotFoundError("3760215750042"),
        );

        renderScreen(<BeerInfoCardScreen barcodeParam="3760215750042" />);

        const cta = await screen.findByLabelText(
          /Ajouter cette bière au catalogue par email/i,
        );
        fireEvent.press(cta);

        expect(openUrlSpy).toHaveBeenCalledTimes(1);
        const url = openUrlSpy.mock.calls[0][0] as string;
        expect(url).toMatch(/^mailto:contact@brasse-bouillon\.com\?/);
        expect(url).toContain(encodeURIComponent("Ajout au catalogue"));
        expect(url).toContain("3760215750042");
      });

      it("does NOT render the unknown beer CTAs on a service-unavailable error", async () => {
        mockedLookup.mockRejectedValueOnce(
          new ScanLookupServiceUnavailableError("5060277380019"),
        );

        renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

        await screen.findByText(/temporairement indisponible/);
        expect(screen.queryByText(/Code-barres scanné/i)).toBeNull();
        expect(
          screen.queryByLabelText(/Suggérer une correction par email/i),
        ).toBeNull();
      });
    });

    describe("not-a-beer detection (Issue #798)", () => {
      it("displays the product name and a 'Scanner une bière' CTA when the lookup throws ScanLookupNotABeerError", async () => {
        mockedLookup.mockRejectedValueOnce(
          new ScanLookupNotABeerError("5449000000996", "Coca-Cola Original"),
        );

        renderScreen(<BeerInfoCardScreen barcodeParam="5449000000996" />);

        expect(await screen.findByText(/Coca-Cola Original/i)).toBeTruthy();
        expect(screen.getByText(/ce n'est pas une bière/i)).toBeTruthy();
        expect(
          screen.getByLabelText(
            /Retourner au scan pour tenter une autre bouteille/i,
          ),
        ).toBeTruthy();
      });

      it("falls back to a generic message when the product name is null", async () => {
        mockedLookup.mockRejectedValueOnce(
          new ScanLookupNotABeerError("5449000000996", null),
        );

        renderScreen(<BeerInfoCardScreen barcodeParam="5449000000996" />);

        expect(
          await screen.findByText(/Ce produit n'est pas une bière/i),
        ).toBeTruthy();
      });

      it("the 'Scanner une bière' CTA navigates back to the scan view", async () => {
        mockedLookup.mockRejectedValueOnce(
          new ScanLookupNotABeerError("5449000000996", "Coca-Cola Original"),
        );

        renderScreen(<BeerInfoCardScreen barcodeParam="5449000000996" />);

        const cta = await screen.findByLabelText(
          /Retourner au scan pour tenter une autre bouteille/i,
        );
        fireEvent.press(cta);

        expect(mockReplace).toHaveBeenCalledWith("/(app)/dashboard/scan");
      });
    });

    describe("photo fallback CTA on invalid barcode (Issue #797)", () => {
      it("renders 'Photographier l'étiquette' CTA when the screen lands without a barcode param", async () => {
        // No barcodeParam → sets ERROR_INVALID directly without hitting the lookup.
        renderScreen(<BeerInfoCardScreen barcodeParam={undefined} />);

        expect(
          await screen.findByLabelText(/Photographier l'étiquette/i),
        ).toBeTruthy();
        expect(mockedLookup).not.toHaveBeenCalled();
      });

      it("opens an informational alert referencing v0.2 / epic #751 when the CTA is pressed", async () => {
        renderScreen(<BeerInfoCardScreen barcodeParam={undefined} />);

        const cta = await screen.findByLabelText(/Photographier l'étiquette/i);
        fireEvent.press(cta);

        expect(alertSpy).toHaveBeenCalledWith(
          expect.stringMatching(/Reconnaissance visuelle/i),
          expect.stringMatching(/v0\.2.*#751/i),
          expect.any(Array),
        );
      });

      it("does NOT render the photo fallback CTA on a not-found error", async () => {
        mockedLookup.mockRejectedValueOnce(
          new ScanLookupBeerNotFoundError("3760215750042"),
        );

        renderScreen(<BeerInfoCardScreen barcodeParam="3760215750042" />);

        await screen.findByText(/n'est pas dans notre catalogue/);
        expect(
          screen.queryByLabelText(/Photographier l'étiquette/i),
        ).toBeNull();
      });
    });
  });

  describe("import community recipe", () => {
    /**
     * Issue #766 — every import flow now goes through a pre-flight
     * confirmation Alert. This helper traverses the confirmation by
     * pressing "Importer" so the existing happy-path assertions
     * downstream stay focused on what they were originally testing.
     */
    async function pressImporterOnConfirmationAlert(): Promise<void> {
      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          "Importer cette recette ?",
          expect.any(String),
          expect.any(Array),
          expect.any(Object),
        );
      });
      const confirmButtons = alertSpy.mock.calls[0][2] as Array<{
        text: string;
        onPress?: () => void;
      }>;
      const importerButton = confirmButtons.find((b) => b.text === "Importer");
      expect(importerButton).toBeDefined();
      await act(async () => {
        importerButton?.onPress?.();
      });
    }

    it("imports the recipe and navigates to the new detail page on success", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());
      mockedImport.mockResolvedValueOnce({
        recipeId: "imported-uuid-1",
        name: "Session IPA Citra",
      });

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      const row = await screen.findByLabelText(/Importer Session IPA Citra/);
      await act(async () => {
        fireEvent.press(row);
      });
      await pressImporterOnConfirmationAlert();

      await waitFor(() => {
        expect(mockedImport).toHaveBeenCalledWith("r-demo-1");
      });
      // The success Alert is the SECOND call (the first was the
      // confirmation Alert traversed above).
      const successCall = alertSpy.mock.calls.find(
        (c) => c[0] === "Recette importée",
      );
      expect(successCall).toBeDefined();
      expect(successCall?.[1]).toEqual(
        expect.stringContaining("Session IPA Citra"),
      );

      // Trigger the "Voir la recette" button from the success alert.
      const buttons = successCall?.[2] as Array<{
        text: string;
        onPress?: () => void;
      }>;
      const viewButton = buttons.find((b) => b.text === "Voir la recette");
      act(() => {
        viewButton?.onPress?.();
      });
      expect(mockPush).toHaveBeenCalledWith("/(app)/recipes/imported-uuid-1");
    });

    it("does not navigate when the user dismisses the success alert", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());
      mockedImport.mockResolvedValueOnce({
        recipeId: "imported-uuid-2",
        name: "Session IPA Citra",
      });

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      const row = await screen.findByLabelText(/Importer Session IPA Citra/);
      await act(async () => {
        fireEvent.press(row);
      });
      await pressImporterOnConfirmationAlert();

      await waitFor(() => {
        expect(
          alertSpy.mock.calls.some((c) => c[0] === "Recette importée"),
        ).toBe(true);
      });

      const successCall = alertSpy.mock.calls.find(
        (c) => c[0] === "Recette importée",
      );
      // The "Plus tard" cancel button has no onPress handler — pressing it
      // (or dismissing the alert by tapping outside) must NOT navigate.
      const buttons = successCall?.[2] as Array<{
        text: string;
        style?: string;
        onPress?: () => void;
      }>;
      const cancelButton = buttons.find((b) => b.style === "cancel");
      expect(cancelButton).toBeDefined();
      expect(cancelButton?.onPress).toBeUndefined();
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("shows an error alert when the import fails and does not navigate", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());
      mockedImport.mockRejectedValueOnce(new Error("boom"));

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      const row = await screen.findByLabelText(/Importer Session IPA Citra/);
      await act(async () => {
        fireEvent.press(row);
      });
      await pressImporterOnConfirmationAlert();

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          "Import impossible",
          expect.stringContaining("Réessaie"),
        );
      });
      expect(mockPush).not.toHaveBeenCalled();
    });

    describe("pre-flight confirmation modal (Issue #766)", () => {
      it("opens a confirmation Alert with the recipe name on tap", async () => {
        mockedLookup.mockResolvedValueOnce(buildResult());
        renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

        const row = await screen.findByLabelText(/Importer Session IPA Citra/);
        await act(async () => {
          fireEvent.press(row);
        });

        expect(alertSpy).toHaveBeenCalledWith(
          "Importer cette recette ?",
          expect.stringContaining("Session IPA Citra"),
          expect.any(Array),
          expect.any(Object),
        );
        // The API call is NOT yet made — we are blocked on confirmation.
        expect(mockedImport).not.toHaveBeenCalled();
      });

      it("does not call the import API when the user taps Annuler", async () => {
        mockedLookup.mockResolvedValueOnce(buildResult());
        renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

        const row = await screen.findByLabelText(/Importer Session IPA Citra/);
        await act(async () => {
          fireEvent.press(row);
        });

        const confirmButtons = alertSpy.mock.calls[0][2] as Array<{
          text: string;
          style?: string;
          onPress?: () => void;
        }>;
        const cancelButton = confirmButtons.find((b) => b.style === "cancel");
        expect(cancelButton?.text).toBe("Annuler");
        // The cancel button has no onPress (per RN Alert convention) —
        // tapping it just dismisses without firing anything.
        expect(cancelButton?.onPress).toBeUndefined();
        expect(mockedImport).not.toHaveBeenCalled();
        expect(mockPush).not.toHaveBeenCalled();
      });
    });
  });

  describe("matching view envelope (Issue #700)", () => {
    it("displays the low_confidence warning when the API flags it", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());
      mockedMatching.mockResolvedValueOnce({
        rankings: PUNK_IPA_MATCHES.slice(0, 1),
        lowConfidence: true,
      });

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      const warning = await screen.findByText(
        /Aucune recette très similaire dans la base/,
      );
      expect(warning).toBeTruthy();
    });

    it("does NOT display the low_confidence warning when lowConfidence is false", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());
      // default beforeEach already sets lowConfidence: false

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      // Wait for the rankings to be rendered (find the first equivalent).
      await screen.findByText("Session IPA Citra");
      expect(screen.queryByText(/Aucune recette très similaire/)).toBeNull();
    });

    it("renders the 🏆 Recette officielle section above the equivalents when one is flagged official", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());
      mockedMatching.mockResolvedValueOnce({
        rankings: [
          {
            recipeId: "r-official-punk",
            publicRecipeId: "00000000-0000-4000-8000-officialpunk",
            name: "Punk IPA — Recette officielle",
            brewer: "BrewDog",
            rating: 4.9,
            brewedCount: 100,
            score: 100,
            isOfficial: true,
            style: "American IPA",
          },
          ...PUNK_IPA_MATCHES,
        ],
        lowConfidence: false,
      });

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      // Official section title appears.
      const officialTitle = await screen.findByText(/🏆 Recette officielle/);
      expect(officialTitle).toBeTruthy();
      // Official recipe row also rendered.
      expect(screen.getByText("Punk IPA — Recette officielle")).toBeTruthy();
      // Equivalents below.
      expect(screen.getByText("Session IPA Citra")).toBeTruthy();
    });

    it("does not render the 🏆 section when no recipe is flagged official", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());
      // default mock: PUNK_IPA_MATCHES — no isOfficial=true

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      await screen.findByText("Session IPA Citra");
      expect(screen.queryByText(/🏆 Recette officielle/)).toBeNull();
    });

    it("caps equivalents to 3 even when the API returns more", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());
      mockedMatching.mockResolvedValueOnce({
        rankings: [
          ...PUNK_IPA_MATCHES,
          {
            recipeId: "r-demo-4",
            publicRecipeId: "00000000-0000-4000-8000-000000000004",
            name: "Belgian Tripel",
            brewer: "Communauté Brasse-Bouillon",
            rating: 4.8,
            brewedCount: 31,
            score: 50,
            style: "Belgian Tripel",
          },
        ],
        lowConfidence: false,
      });

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      await screen.findByText("Session IPA Citra");
      expect(screen.getByText("NEIPA Tropical")).toBeTruthy();
      expect(screen.getByText("White IPA")).toBeTruthy();
      // 4th recipe is filtered out (cap at 3).
      expect(screen.queryByText("Belgian Tripel")).toBeNull();
    });

    it("renders an empty state when the API returns zero rankings", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());
      mockedMatching.mockResolvedValueOnce({
        rankings: [],
        lowConfidence: false,
      });

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      const empty = await screen.findByText(
        /Aucune recette équivalente n'a encore été partagée/,
      );
      expect(empty).toBeTruthy();
    });

    it("shows low_confidence warning even when only an official recipe is returned (no equivalents)", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());
      mockedMatching.mockResolvedValueOnce({
        rankings: [
          {
            recipeId: "r-official-only",
            publicRecipeId: "00000000-0000-4000-8000-officialonly1",
            name: "Punk IPA — Recette officielle",
            brewer: "BrewDog",
            rating: 4.9,
            brewedCount: 100,
            score: 100,
            isOfficial: true,
            style: "American IPA",
          },
        ],
        lowConfidence: true,
      });

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      // Official section appears.
      expect(await screen.findByText(/🏆 Recette officielle/)).toBeTruthy();
      // Warning must also appear even though there are no community equivalents.
      expect(
        screen.getByText(/Aucune recette très similaire dans la base/),
      ).toBeTruthy();
    });

    it("renders an error message when the matching API throws", async () => {
      mockedLookup.mockResolvedValueOnce(buildResult());
      mockedMatching.mockRejectedValueOnce(new Error("network"));

      renderScreen(<BeerInfoCardScreen barcodeParam="5060277380019" />);

      const errorMsg = await screen.findByText(
        /Impossible de charger les recettes équivalentes/,
      );
      expect(errorMsg).toBeTruthy();
    });
  });
});
