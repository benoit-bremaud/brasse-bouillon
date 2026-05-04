import {
  getDefaultScanConsentPreferences,
  getScanConsentSettings,
  giveScanConsent,
  processScanAttempt,
} from "@/features/scan/application/scan.use-cases";
import type {
  ScanConsentPreferences,
  ScanConsentSettings,
  ScanPendingCapture,
} from "@/features/scan/domain/scan.types";
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { ScanScreen } from "@/features/scan/presentation/ScanScreen";
import React from "react";

jest.useFakeTimers();

const mockPush = jest.fn();
const mockReplace = jest.fn();
const mockUseCameraPermissions = jest.fn();
const mockCameraCallbacks: {
  onBarcodeScanned:
    | ((event: { data?: string | null; type?: string | null }) => void)
    | null;
} = {
  onBarcodeScanned: null,
};

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

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

jest.mock("expo-camera", () => ({
  CameraView: ({
    onBarcodeScanned,
  }: {
    onBarcodeScanned?: (event: {
      data?: string | null;
      type?: string | null;
    }) => void;
  }) => {
    mockCameraCallbacks.onBarcodeScanned = onBarcodeScanned ?? null;
    return null;
  },
  useCameraPermissions: () => mockUseCameraPermissions(),
}));

jest.mock("@/features/scan/application/scan.use-cases", () => ({
  getDefaultScanConsentPreferences: jest.fn(),
  getScanConsentSettings: jest.fn(),
  giveScanConsent: jest.fn(),
  processScanAttempt: jest.fn(),
}));

const mockedGetDefaultScanConsentPreferences =
  getDefaultScanConsentPreferences as jest.MockedFunction<
    typeof getDefaultScanConsentPreferences
  >;
const mockedGetScanConsentSettings =
  getScanConsentSettings as jest.MockedFunction<typeof getScanConsentSettings>;
const mockedGiveScanConsent = giveScanConsent as jest.MockedFunction<
  typeof giveScanConsent
>;
const mockedProcessScanAttempt = processScanAttempt as jest.MockedFunction<
  typeof processScanAttempt
>;

const DEFAULT_PREFERENCES: ScanConsentPreferences = {
  storeBarcodeValue: true,
  storeBottlePhotos: true,
  storeScanMetadata: true,
  useDataForModelTraining: true,
};

function createConsentSettings(): ScanConsentSettings {
  return {
    hasConsent: true,
    consentedAtIso: "2026-02-01T08:00:00.000Z",
    retentionDays: 30,
    preferences: DEFAULT_PREFERENCES,
  };
}

function createPendingCapture(): ScanPendingCapture {
  return {
    id: "pending-1",
    status: "pending-analysis",
    createdAtIso: "2026-02-01T10:00:00.000Z",
    barcodeValue: "0000000000000",
    barcodeType: "ean13",
    frontPhotoUri: "mock://front.jpg",
    backPhotoUri: null,
    backLabelMissing: true,
    consentSnapshot: DEFAULT_PREFERENCES,
    metadata: "meta",
  };
}

function renderScreen() {
  return render(<ScanScreen />);
}

async function waitForReadyState() {
  expect(await screen.findByText("Guided scan flow")).toBeTruthy();
}

function simulateBarcodeScan(scanCount = 1) {
  if (!mockCameraCallbacks.onBarcodeScanned) {
    throw new Error("Camera callback not initialized");
  }

  act(() => {
    for (let index = 0; index < scanCount; index += 1) {
      mockCameraCallbacks.onBarcodeScanned?.({
        data: "0000000000000",
        type: "ean13",
      });
    }
  });
}

describe("ScanScreen", () => {
  beforeEach(() => {
    mockPush.mockReset();
    mockReplace.mockReset();
    mockCameraCallbacks.onBarcodeScanned = null;
    mockUseCameraPermissions.mockReset();
    mockedGetDefaultScanConsentPreferences.mockReset();
    mockedGetScanConsentSettings.mockReset();
    mockedGiveScanConsent.mockReset();
    mockedProcessScanAttempt.mockReset();

    mockUseCameraPermissions.mockReturnValue([{ granted: true }, jest.fn()]);
    mockedGetDefaultScanConsentPreferences.mockReturnValue(DEFAULT_PREFERENCES);
    mockedGetScanConsentSettings.mockResolvedValue(createConsentSettings());
    mockedGiveScanConsent.mockResolvedValue(createConsentSettings());
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it("starts in barcode mode and supports manual mode switch", async () => {
    renderScreen();

    await waitForReadyState();
    act(() => {
      jest.runOnlyPendingTimers();
    });
    expect(screen.getByText("Barcode scan")).toBeTruthy();
    expect(screen.getByTestId("barcode-guidance-overlay")).toBeTruthy();

    fireEvent.press(screen.getByText("Switch to bottle mode"));

    expect(await screen.findByText("Front label capture")).toBeTruthy();
    expect(screen.getByText("Required: front label")).toBeTruthy();
    expect(screen.getByTestId("bottle-guidance-overlay")).toBeTruthy();
    expect(screen.getByTestId("bottle-action-row-front")).toBeTruthy();
    expect(screen.getByTestId("capture-front-button")).toBeTruthy();
    expect(screen.getByTestId("validate-front-button")).toBeTruthy();

    fireEvent.press(screen.getByText("Return to barcode mode"));

    expect(await screen.findByText("Barcode scan")).toBeTruthy();
    expect(screen.getByTestId("barcode-guidance-overlay")).toBeTruthy();
  });

  it("hands a confirmed barcode off to the lookup screen (Epic #594, #698)", async () => {
    renderScreen();

    await waitForReadyState();
    simulateBarcodeScan(5);

    expect(await screen.findByText("Captured barcode")).toBeTruthy();

    fireEvent.press(screen.getByText("Analyze barcode"));

    // The legacy `processScanAttempt` path is bypassed for the
    // barcode-confirmed case — the new flow delegates to
    // BeerInfoCardScreen which calls `lookupBeerByBarcode` itself
    // and renders the recognised beer (or its NotFound state).
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith(
        expect.stringContaining("/(app)/dashboard/scan/lookup/"),
      );
    });
    expect(mockedProcessScanAttempt).not.toHaveBeenCalled();
  });

  it("requires five identical scans before confirmation and supports scan restart", async () => {
    renderScreen();

    await waitForReadyState();
    simulateBarcodeScan(4);

    expect(screen.queryByText("Captured barcode")).toBeNull();
    expect(
      screen.getByText("Barcode verification: 4/5 identical scans"),
    ).toBeTruthy();

    simulateBarcodeScan();

    expect(await screen.findByText("Captured barcode")).toBeTruthy();
    expect(screen.queryByTestId("barcode-guidance-overlay")).toBeNull();
    expect(screen.getByText("Scan")).toBeTruthy();

    fireEvent.press(screen.getByText("Scan"));

    expect(
      await screen.findByText("Barcode verification: 0/5 identical scans"),
    ).toBeTruthy();
    expect(screen.getByTestId("barcode-guidance-overlay")).toBeTruthy();
    expect(screen.queryByText("Captured barcode")).toBeNull();
  });

  it("supports front-required and back-optional pending flow", async () => {
    mockedProcessScanAttempt
      .mockResolvedValueOnce({
        type: "requires-photo-capture",
        stage: "back",
        toastMessage: "Front captured. Capture the back of the bottle.",
      })
      .mockResolvedValueOnce({
        type: "pending",
        capture: createPendingCapture(),
        toastMessage: "Saved locally for later analysis.",
      });

    renderScreen();

    await waitForReadyState();
    fireEvent.press(screen.getByText("Switch to bottle mode"));

    expect(await screen.findByText("Required: front label")).toBeTruthy();
    expect(screen.getByTestId("bottle-guidance-overlay")).toBeTruthy();
    expect(screen.getByTestId("bottle-guidance-label-frame")).toBeTruthy();
    expect(screen.getByTestId("bottle-guidance-label-focus")).toBeTruthy();
    expect(screen.getByTestId("bottle-action-row-front")).toBeTruthy();
    expect(screen.getByTestId("capture-front-button")).toBeTruthy();
    expect(screen.getByTestId("validate-front-button")).toBeTruthy();
    expect(screen.getByTestId("auto-capture-status")).toBeTruthy();

    fireEvent.press(screen.getByTestId("capture-front-button"));

    await waitFor(() => {
      expect(screen.queryByTestId("auto-capture-status")).toBeNull();
    });

    expect(await screen.findByText(/Captured URI:/)).toBeTruthy();
    expect(screen.getByTestId("bottle-guidance-overlay")).toBeTruthy();

    fireEvent.press(screen.getByTestId("validate-front-button"));

    await waitFor(() => {
      expect(mockedProcessScanAttempt).toHaveBeenCalledTimes(1);
    });

    const firstAttempt = mockedProcessScanAttempt.mock.calls[0][0];
    expect(firstAttempt.frontPhotoUri).toEqual(expect.any(String));
    expect(firstAttempt.backPhotoUri).toBeNull();
    expect(firstAttempt.backLabelMissing).toBe(false);

    expect(
      await screen.findByText("Required: back label (optional)"),
    ).toBeTruthy();
    expect(screen.getByTestId("bottle-guidance-overlay")).toBeTruthy();
    expect(screen.getByTestId("bottle-action-row-back")).toBeTruthy();
    expect(screen.getByTestId("capture-back-button")).toBeTruthy();
    expect(screen.getByTestId("mark-no-back-label-button")).toBeTruthy();
    expect(screen.getByTestId("validate-back-button")).toBeTruthy();
    expect(screen.getByTestId("auto-capture-status")).toBeTruthy();

    fireEvent.press(screen.getByTestId("mark-no-back-label-button"));

    await waitFor(() => {
      expect(
        screen.queryAllByText("Back label marked as unavailable.").length,
      ).toBeGreaterThan(0);
    });

    await waitFor(() => {
      expect(screen.queryByTestId("auto-capture-status")).toBeNull();
    });

    fireEvent.press(screen.getByTestId("validate-back-button"));

    await waitFor(() => {
      expect(mockedProcessScanAttempt).toHaveBeenCalledTimes(2);
    });

    const secondAttempt = mockedProcessScanAttempt.mock.calls[1][0];
    expect(secondAttempt.frontPhotoUri).toBe(firstAttempt.frontPhotoUri);
    expect(secondAttempt.backPhotoUri).toBeNull();
    expect(secondAttempt.backLabelMissing).toBe(true);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/(app)/dashboard/scan/pending");
    });
  });

  it("auto-captures bottle labels when quality is considered optimal", async () => {
    mockedProcessScanAttempt
      .mockResolvedValueOnce({
        type: "requires-photo-capture",
        stage: "back",
        toastMessage: "Front captured. Capture the back of the bottle.",
      })
      .mockResolvedValueOnce({
        type: "pending",
        capture: createPendingCapture(),
        toastMessage: "Saved locally for later analysis.",
      });

    renderScreen();

    await waitForReadyState();
    fireEvent.press(screen.getByText("Switch to bottle mode"));

    expect(await screen.findByText("Required: front label")).toBeTruthy();
    expect(screen.getByTestId("auto-capture-status")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(
      await screen.findByText("Front label auto-captured (optimal quality)."),
    ).toBeTruthy();

    fireEvent.press(screen.getByTestId("validate-front-button"));

    await waitFor(() => {
      expect(mockedProcessScanAttempt).toHaveBeenCalledTimes(1);
    });

    expect(
      await screen.findByText("Required: back label (optional)"),
    ).toBeTruthy();
    expect(screen.getByTestId("auto-capture-status")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(
      await screen.findByText("Back label auto-captured (optimal quality)."),
    ).toBeTruthy();

    fireEvent.press(screen.getByTestId("validate-back-button"));

    await waitFor(() => {
      expect(mockedProcessScanAttempt).toHaveBeenCalledTimes(2);
    });

    const firstAttempt = mockedProcessScanAttempt.mock.calls[0][0];
    const secondAttempt = mockedProcessScanAttempt.mock.calls[1][0];

    expect(firstAttempt.frontPhotoUri).toEqual(expect.any(String));
    expect(secondAttempt.backPhotoUri).toEqual(expect.any(String));
    expect(secondAttempt.backLabelMissing).toBe(false);
  });

  it("blocks bottle validation when consent has not been granted", async () => {
    mockedGetScanConsentSettings.mockResolvedValue({
      hasConsent: false,
      consentedAtIso: "2026-02-01T08:00:00.000Z",
      retentionDays: 30,
      preferences: DEFAULT_PREFERENCES,
    });

    renderScreen();

    await waitForReadyState();

    fireEvent.press(screen.getByText("Later"));

    await waitFor(() => {
      expect(screen.queryByText("Scan consent required")).toBeNull();
    });

    fireEvent.press(screen.getByText("Switch to bottle mode"));

    expect(await screen.findByText("Front label capture")).toBeTruthy();

    fireEvent.press(screen.getByTestId("capture-front-button"));

    expect(await screen.findByText(/Captured URI:/)).toBeTruthy();

    fireEvent.press(screen.getByTestId("validate-front-button"));

    expect(
      await screen.findByText("Scan consent is required before validation."),
    ).toBeTruthy();
    expect(screen.getByText("Scan consent required")).toBeTruthy();
    expect(mockedProcessScanAttempt).not.toHaveBeenCalled();
  });

  it("confirms reset action before restarting the scan flow", async () => {
    renderScreen();

    await waitForReadyState();
    fireEvent.press(screen.getByText("Switch to bottle mode"));

    expect(await screen.findByText("Front label capture")).toBeTruthy();

    fireEvent.press(screen.getByText("Restart scan flow"));
    expect(await screen.findByText("Restart the scan flow?")).toBeTruthy();

    fireEvent.press(screen.getByText("Cancel"));

    await waitFor(() => {
      expect(screen.queryByText("Restart the scan flow?")).toBeNull();
    });
    expect(screen.getByText("Return to barcode mode")).toBeTruthy();

    fireEvent.press(screen.getByText("Restart scan flow"));
    expect(await screen.findByText("Restart the scan flow?")).toBeTruthy();

    fireEvent.press(screen.getByText("Restart flow"));

    await waitFor(() => {
      expect(screen.queryByText("Restart the scan flow?")).toBeNull();
    });
    expect(screen.getByText("Barcode scan")).toBeTruthy();
    expect(screen.getByText("Switch to bottle mode")).toBeTruthy();
  });

  describe("progressive verification feedback (Issue #638)", () => {
    it("starts with 0 filled dots and 5 empty dots when no scan has fired", async () => {
      renderScreen();
      await waitForReadyState();

      expect(
        screen.queryAllByTestId("barcode-verification-dot-filled"),
      ).toHaveLength(0);
      expect(
        screen.queryAllByTestId("barcode-verification-dot-empty"),
      ).toHaveLength(5);
    });

    it("fills dots in real time as identical scans accumulate", async () => {
      renderScreen();
      await waitForReadyState();

      simulateBarcodeScan(2);
      expect(
        screen.queryAllByTestId("barcode-verification-dot-filled"),
      ).toHaveLength(2);
      expect(
        screen.queryAllByTestId("barcode-verification-dot-empty"),
      ).toHaveLength(3);

      simulateBarcodeScan(2);
      expect(
        screen.queryAllByTestId("barcode-verification-dot-filled"),
      ).toHaveLength(4);
      expect(
        screen.queryAllByTestId("barcode-verification-dot-empty"),
      ).toHaveLength(1);
    });
  });

  describe("demo override hidden long-press (Issue #642)", () => {
    it("opens the demo override menu on a long-press of the help button", async () => {
      renderScreen();
      await waitForReadyState();

      const helpButton = screen.getByLabelText("Open scan guide");
      fireEvent(helpButton, "longPress");

      // The override menu lists seeded beers — Punk IPA appears
      // twice (UK 0,5L canonical EAN + DE 0,33L physical alias —
      // Issue #807), so assert via findAllByText.
      expect(await screen.findAllByText("Punk IPA")).toHaveLength(2);
      // The regular guide modal must NOT be shown.
      expect(screen.queryByText("How barcode verification works")).toBeNull();
    });

    it("does NOT open the guide modal on the trailing onPress that fires after a long-press", async () => {
      renderScreen();
      await waitForReadyState();

      const helpButton = screen.getByLabelText("Open scan guide");
      // Simulate the React Native sequence: onLongPress fires,
      // then onPress fires on release. Without the guard the
      // guide modal would open behind the override sheet.
      fireEvent(helpButton, "longPress");
      fireEvent.press(helpButton);

      expect(await screen.findAllByText("Punk IPA")).toHaveLength(2);
      expect(screen.queryByText("How barcode verification works")).toBeNull();
    });

    it("opens the guide modal on a regular press (no long-press)", async () => {
      renderScreen();
      await waitForReadyState();

      const helpButton = screen.getByLabelText("Open scan guide");
      fireEvent.press(helpButton);

      expect(
        await screen.findByText("How barcode verification works"),
      ).toBeTruthy();
      // The override menu must NOT be shown.
      expect(screen.queryByText(/Démo — bières seedées/i)).toBeNull();
    });

    it("navigates to the lookup route when a beer is selected from the override menu", async () => {
      renderScreen();
      await waitForReadyState();

      fireEvent(screen.getByLabelText("Open scan guide"), "longPress");
      // Punk IPA — two EAN variants in the menu (UK 0,5L canonical
      // 5060277380019 + DE 0,33L physical alias 4260649360279,
      // Issue #807). Tap the first row (canonical UK EAN).
      const punkRows = await screen.findAllByLabelText(/Forcer Punk IPA/i);
      fireEvent.press(punkRows[0]);

      expect(mockPush).toHaveBeenCalledWith(
        "/(app)/dashboard/scan/lookup/5060277380019",
      );
    });
  });
});
