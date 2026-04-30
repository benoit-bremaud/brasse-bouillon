import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import {
  listPendingScans,
  purgeScanLocalData,
} from "@/features/scan/application/scan.use-cases";

import { PendingScansScreen } from "@/features/scan/presentation/PendingScansScreen";
import React from "react";

const mockReplace = jest.fn();

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");

  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: mockReplace,
      back: jest.fn(),
    }),
  };
});

jest.mock("@/features/scan/application/scan.use-cases", () => ({
  listPendingScans: jest.fn(),
  purgeScanLocalData: jest.fn(),
}));

const mockedListPendingScans = listPendingScans as jest.MockedFunction<
  typeof listPendingScans
>;
const mockedPurgeScanLocalData = purgeScanLocalData as jest.MockedFunction<
  typeof purgeScanLocalData
>;

describe("PendingScansScreen", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockedListPendingScans.mockReset();
    mockedPurgeScanLocalData.mockReset();
  });

  it("renders empty state when no pending scans exist", async () => {
    mockedListPendingScans.mockResolvedValue([]);

    render(<PendingScansScreen />);

    expect(await screen.findByText("No pending scan")).toBeTruthy();
    expect(screen.getByText(/0 pending capture/)).toBeTruthy();
  });

  it("shows pending captures, loads more, and purges local data", async () => {
    mockedListPendingScans.mockResolvedValue([
      {
        id: "pending-1",
        status: "pending-analysis",
        createdAtIso: "2026-02-01T08:00:00.000Z",
        barcodeValue: null,
        barcodeType: null,
        frontPhotoUri: null,
        backPhotoUri: null,
        backLabelMissing: false,
        consentSnapshot: {
          storeBarcodeValue: true,
          storeBottlePhotos: true,
          storeScanMetadata: true,
          useDataForModelTraining: true,
        },
        metadata: "metadata-1",
      },
      {
        id: "pending-2",
        status: "pending-analysis",
        createdAtIso: "2026-02-02T08:00:00.000Z",
        barcodeValue: null,
        barcodeType: null,
        frontPhotoUri: null,
        backPhotoUri: null,
        backLabelMissing: false,
        consentSnapshot: {
          storeBarcodeValue: true,
          storeBottlePhotos: true,
          storeScanMetadata: true,
          useDataForModelTraining: true,
        },
        metadata: "metadata-2",
      },
      {
        id: "pending-3",
        status: "pending-analysis",
        createdAtIso: "2026-02-03T08:00:00.000Z",
        barcodeValue: null,
        barcodeType: null,
        frontPhotoUri: null,
        backPhotoUri: null,
        backLabelMissing: false,
        consentSnapshot: {
          storeBarcodeValue: true,
          storeBottlePhotos: true,
          storeScanMetadata: true,
          useDataForModelTraining: true,
        },
        metadata: "metadata-3",
      },
      {
        id: "pending-4",
        status: "pending-analysis",
        createdAtIso: "2026-02-04T08:00:00.000Z",
        barcodeValue: null,
        barcodeType: null,
        frontPhotoUri: null,
        backPhotoUri: null,
        backLabelMissing: false,
        consentSnapshot: {
          storeBarcodeValue: true,
          storeBottlePhotos: true,
          storeScanMetadata: true,
          useDataForModelTraining: true,
        },
        metadata: "metadata-4",
      },
    ]);

    mockedPurgeScanLocalData.mockResolvedValue();

    render(<PendingScansScreen />);

    expect(await screen.findByText("pending-1")).toBeTruthy();
    expect(screen.queryByText("pending-4")).toBeNull();

    fireEvent.press(screen.getByText("Show more"));
    expect(await screen.findByText("pending-4")).toBeTruthy();

    fireEvent.press(screen.getByText("Purge local scan data"));

    await waitFor(() => {
      expect(mockedPurgeScanLocalData).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByText("No pending scan")).toBeTruthy();
    });
  });

  describe("consent snapshot rendered in human-readable French (Issue #640)", () => {
    function captureWithConsent(consentSnapshot: {
      storeBarcodeValue: boolean;
      storeBottlePhotos: boolean;
      storeScanMetadata: boolean;
      useDataForModelTraining: boolean;
    }) {
      return {
        id: "pending-consent",
        status: "pending-analysis" as const,
        createdAtIso: "2026-04-30T10:00:00.000Z",
        barcodeValue: null,
        barcodeType: null,
        frontPhotoUri: null,
        backPhotoUri: null,
        backLabelMissing: false,
        consentSnapshot,
        metadata: "metadata-consent",
      };
    }

    it("renders the full sentence when all four consents are granted", async () => {
      mockedListPendingScans.mockResolvedValue([
        captureWithConsent({
          storeBarcodeValue: true,
          storeBottlePhotos: true,
          storeScanMetadata: true,
          useDataForModelTraining: true,
        }),
      ]);

      render(<PendingScansScreen />);

      expect(
        await screen.findByText(
          /Tu as autorisé : la lecture du code-barre, le stockage des photos, les métadonnées, et l'entraînement de notre IA/i,
        ),
      ).toBeTruthy();
      // No raw jargon (yes/no, barcode:, photos:, etc.) leaks through.
      expect(screen.queryByText(/barcode: yes/i)).toBeNull();
      expect(screen.queryByText(/training: yes/i)).toBeNull();
    });

    it("trims the sentence when only some consents are granted", async () => {
      mockedListPendingScans.mockResolvedValue([
        captureWithConsent({
          storeBarcodeValue: true,
          storeBottlePhotos: false,
          storeScanMetadata: true,
          useDataForModelTraining: false,
        }),
      ]);

      render(<PendingScansScreen />);

      const text = await screen.findByText(/Tu as autorisé/i);
      expect(text).toBeTruthy();
      // Granted items present
      expect(text.props.children).toMatch(/lecture du code-barre/i);
      expect(text.props.children).toMatch(/métadonnées/i);
      // Refused items absent
      expect(text.props.children).not.toMatch(/photos/i);
      expect(text.props.children).not.toMatch(/IA/i);
    });

    it("shows the negative form when no consent is granted", async () => {
      mockedListPendingScans.mockResolvedValue([
        captureWithConsent({
          storeBarcodeValue: false,
          storeBottlePhotos: false,
          storeScanMetadata: false,
          useDataForModelTraining: false,
        }),
      ]);

      render(<PendingScansScreen />);

      expect(
        await screen.findByText(/Aucune autorisation donnée/i),
      ).toBeTruthy();
    });
  });
});
