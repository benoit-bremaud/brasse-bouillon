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

  it("opens fallback modal on unmatched barcode and switches to bottle mode", async () => {
    mockedProcessScanAttempt.mockResolvedValue({
      type: "requires-photo-capture",
      stage: "front",
      toastMessage: "Barcode not recognized. Capture the front of the bottle.",
    });

    renderScreen();

    await waitForReadyState();
    simulateBarcodeScan(5);

    expect(await screen.findByText("Captured barcode")).toBeTruthy();

    fireEvent.press(screen.getByText("Analyze barcode"));

    await waitFor(() => {
      expect(mockedProcessScanAttempt).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText("Barcode not recognized")).toBeTruthy();

    fireEvent.press(screen.getByText("Passer en mode bouteille"));

    expect(await screen.findByText("Front label capture")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(1200);
    });

    expect(
      await screen.findByText("Front label auto-captured (optimal quality)."),
    ).toBeTruthy();
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
});
