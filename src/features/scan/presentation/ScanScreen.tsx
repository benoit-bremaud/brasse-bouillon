import { colors, radius, spacing, typography } from "@/core/theme";
import {
  getDefaultScanConsentPreferences,
  getScanConsentSettings,
  giveScanConsent,
  processScanAttempt,
} from "@/features/scan/application/scan.use-cases";
import type {
  ScanConsentPreferences,
  ScanMode,
  ScanPhotoCaptureStage,
  ScanProcessOutcome,
} from "@/features/scan/domain/scan.types";
import { CameraView, useCameraPermissions } from "expo-camera";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getErrorMessage } from "@/core/http/http-error";
import { Card } from "@/core/ui/Card";
import { ListHeader } from "@/core/ui/ListHeader";
import { PrimaryButton } from "@/core/ui/PrimaryButton";
import { Screen } from "@/core/ui/Screen";
import { useRouter } from "expo-router";

type BarcodeScanEvent = {
  data?: string | null;
  type?: string | null;
};

type BarcodeVerificationState = {
  candidateValue: string | null;
  candidateType: string | null;
  identicalScans: number;
  confirmedValue: string | null;
  confirmedType: string | null;
};

type CameraGuidanceMode = "barcode" | "bottle";

type CameraActionButtonProps = {
  icon: string;
  label: string;
  accessibilityLabel: string;
  testID: string;
  disabled?: boolean;
  onPress: () => void;
};

const REQUIRED_IDENTICAL_BARCODE_SCANS = 5;
const DEFAULT_RETENTION_DAYS = 30;
const AUTO_CAPTURE_DELAY_MS = 1200;

function getInitialBarcodeVerificationState(): BarcodeVerificationState {
  return {
    candidateValue: null,
    candidateType: null,
    identicalScans: 0,
    confirmedValue: null,
    confirmedType: null,
  };
}

function normalizeScannedValue(value?: string | null): string | null {
  const normalizedValue = value?.trim() ?? "";
  return normalizedValue.length > 0 ? normalizedValue : null;
}

function createMockPhotoUri(stage: ScanPhotoCaptureStage): string {
  return `mock://${stage}-${Date.now()}.jpg`;
}

function CameraGuidanceOverlay({ mode }: { mode: CameraGuidanceMode }) {
  const isBarcodeMode = mode === "barcode";

  return (
    <View
      pointerEvents="none"
      testID={
        isBarcodeMode ? "barcode-guidance-overlay" : "bottle-guidance-overlay"
      }
      style={styles.cameraOverlay}
    >
      {isBarcodeMode ? (
        <View style={styles.barcodeGuideContainer}>
          <View style={styles.barcodeGuideFrame}>
            <View style={styles.barcodeGuideLine} />
          </View>

          <View style={styles.barcodeGuideBottomTextContainer}>
            <Text style={styles.cameraOverlayLabel}>
              Align barcode inside the frame
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.bottleGuideContainer}>
          <View
            testID="bottle-guidance-label-frame"
            style={styles.bottleGuideLabelFrame}
          >
            <View
              testID="bottle-guidance-label-focus"
              style={styles.bottleGuideLabelFocus}
            />
            <View style={styles.bottleGuideLabelCenterLine} />
          </View>

          <View style={styles.bottleGuideBottomTextContainer}>
            <Text style={styles.cameraOverlayLabel}>
              Center the bottle label inside the highlighted frame
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function CameraActionButton({
  icon,
  label,
  accessibilityLabel,
  testID,
  disabled,
  onPress,
}: CameraActionButtonProps) {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      style={({ pressed }) => [
        styles.cameraActionButton,
        disabled && styles.cameraActionButtonDisabled,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <Text style={styles.cameraActionIcon}>{icon}</Text>
      <Text style={styles.cameraActionLabel}>{label}</Text>
    </Pressable>
  );
}

export function ScanScreen() {
  const router = useRouter();
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [scanMode, setScanMode] = useState<ScanMode>("barcode");
  const [captureStage, setCaptureStage] =
    useState<ScanPhotoCaptureStage>("front");
  const [frontPhotoUri, setFrontPhotoUri] = useState<string | null>(null);
  const [backPhotoUri, setBackPhotoUri] = useState<string | null>(null);
  const [backLabelMissing, setBackLabelMissing] = useState(false);

  const [barcodeVerification, setBarcodeVerification] =
    useState<BarcodeVerificationState>(getInitialBarcodeVerificationState);
  const [isCameraVisible, setIsCameraVisible] = useState(true);

  const [hasConsent, setHasConsent] = useState(false);
  const [isConsentModalVisible, setIsConsentModalVisible] = useState(false);
  const [isLoadingConsent, setIsLoadingConsent] = useState(true);
  const [consentPreferences] = useState<ScanConsentPreferences>(() =>
    getDefaultScanConsentPreferences(),
  );

  const [isGuideModalVisible, setIsGuideModalVisible] = useState(false);
  const [isFallbackModalVisible, setIsFallbackModalVisible] = useState(false);
  const [isResetModalVisible, setIsResetModalVisible] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canUseCameraPermission = Boolean(cameraPermission?.granted);

  const loadConsentSettings = useCallback(async () => {
    setIsLoadingConsent(true);
    setError(null);

    try {
      const settings = await getScanConsentSettings();
      const consentGranted = Boolean(settings?.hasConsent);
      setHasConsent(consentGranted);
      setIsConsentModalVisible(!consentGranted);
    } catch (loadError) {
      setError(
        getErrorMessage(loadError, "Unable to load scan consent settings."),
      );
    } finally {
      setIsLoadingConsent(false);
    }
  }, []);

  useEffect(() => {
    void loadConsentSettings();
  }, [loadConsentSettings]);

  useEffect(() => {
    if (barcodeVerification.confirmedValue && isCameraVisible) {
      setIsCameraVisible(false);
      setStatusMessage(
        `Barcode confirmed after ${REQUIRED_IDENTICAL_BARCODE_SCANS} identical scans.`,
      );
    }
  }, [barcodeVerification.confirmedValue, isCameraVisible]);

  const modeStepTitle = useMemo(() => {
    if (scanMode === "barcode") {
      return "Barcode scan";
    }

    if (captureStage === "front") {
      return "Front label capture";
    }

    return "Back label capture";
  }, [captureStage, scanMode]);

  const barcodeVerificationText = useMemo(
    () =>
      `Barcode verification: ${barcodeVerification.identicalScans}/${REQUIRED_IDENTICAL_BARCODE_SCANS} identical scans`,
    [barcodeVerification.identicalScans],
  );

  const resetBarcodeVerification = useCallback(() => {
    setBarcodeVerification(getInitialBarcodeVerificationState());
    setIsCameraVisible(true);
  }, []);

  const resetScanFlow = useCallback(() => {
    setScanMode("barcode");
    setCaptureStage("front");
    setFrontPhotoUri(null);
    setBackPhotoUri(null);
    setBackLabelMissing(false);
    resetBarcodeVerification();
    setIsFallbackModalVisible(false);
    setStatusMessage(null);
    setError(null);
  }, [resetBarcodeVerification]);

  const handleProcessOutcome = useCallback(
    (outcome: ScanProcessOutcome) => {
      if (outcome.type === "matched") {
        setStatusMessage("Product matched successfully.");
        router.push(`/(app)/dashboard/scan/result/${outcome.result.scanId}`);
        return;
      }

      if (outcome.type === "pending") {
        setStatusMessage(outcome.toastMessage);
        router.push("/(app)/dashboard/scan/pending");
        return;
      }

      setStatusMessage(outcome.toastMessage);

      if (outcome.stage === "front") {
        setIsFallbackModalVisible(true);
        return;
      }

      setScanMode("bottle");
      setCaptureStage("back");
    },
    [router],
  );

  const handleScan = useCallback(
    (event: BarcodeScanEvent) => {
      if (!hasConsent || scanMode !== "barcode" || !isCameraVisible) {
        return;
      }

      const normalizedValue = normalizeScannedValue(event.data);
      if (!normalizedValue) {
        return;
      }

      const normalizedType = normalizeScannedValue(event.type);

      setBarcodeVerification((previousState) => {
        const isSameBarcode = previousState.candidateValue === normalizedValue;
        const nextCount = isSameBarcode ? previousState.identicalScans + 1 : 1;
        const boundedCount = Math.min(
          nextCount,
          REQUIRED_IDENTICAL_BARCODE_SCANS,
        );
        const isConfirmed = boundedCount >= REQUIRED_IDENTICAL_BARCODE_SCANS;

        return {
          candidateValue: normalizedValue,
          candidateType: normalizedType,
          identicalScans: boundedCount,
          confirmedValue: isConfirmed ? normalizedValue : null,
          confirmedType: isConfirmed ? normalizedType : null,
        };
      });
    },
    [hasConsent, isCameraVisible, scanMode],
  );

  const handleAnalyzeBarcode = async () => {
    if (!barcodeVerification.confirmedValue) {
      setStatusMessage(
        `Scan the same barcode ${REQUIRED_IDENTICAL_BARCODE_SCANS} times before analysis.`,
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const outcome = await processScanAttempt({
        barcodeValue: barcodeVerification.confirmedValue,
        barcodeType: barcodeVerification.confirmedType,
        scannedAt: new Date(),
      });
      handleProcessOutcome(outcome);
    } catch (processError) {
      setError(getErrorMessage(processError, "Unable to analyze barcode."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGrantConsent = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const settings = await giveScanConsent({
        retentionDays: DEFAULT_RETENTION_DAYS,
        preferences: consentPreferences,
      });
      setHasConsent(Boolean(settings.hasConsent));
      setIsConsentModalVisible(false);
    } catch (consentError) {
      setError(getErrorMessage(consentError, "Unable to save scan consent."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const captureBottleLabel = useCallback(
    (stage: ScanPhotoCaptureStage, origin: "manual" | "auto") => {
      if (stage === "front") {
        setFrontPhotoUri(createMockPhotoUri("front"));
      } else {
        setBackPhotoUri(createMockPhotoUri("back"));
        setBackLabelMissing(false);
      }

      if (origin === "auto") {
        setStatusMessage(
          `${stage === "front" ? "Front" : "Back"} label auto-captured (optimal quality).`,
        );
        return;
      }

      setStatusMessage(
        `${stage === "front" ? "Front" : "Back"} label captured.`,
      );
    },
    [],
  );

  const handleCaptureFrontLabel = useCallback(() => {
    captureBottleLabel("front", "manual");
  }, [captureBottleLabel]);

  const handleCaptureBackLabel = useCallback(() => {
    captureBottleLabel("back", "manual");
  }, [captureBottleLabel]);

  const handleMarkBackLabelMissing = () => {
    setBackLabelMissing(true);
    setBackPhotoUri(null);
    setStatusMessage("Back label marked as unavailable.");
  };

  const isAutoCaptureArmed = useMemo(() => {
    const isBottleCameraReady =
      scanMode === "bottle" &&
      hasConsent &&
      canUseCameraPermission &&
      !isSubmitting;

    if (!isBottleCameraReady) {
      return false;
    }

    const hasCaptureForCurrentStage =
      captureStage === "front"
        ? Boolean(frontPhotoUri)
        : Boolean(backPhotoUri || backLabelMissing);

    return !hasCaptureForCurrentStage;
  }, [
    backLabelMissing,
    backPhotoUri,
    canUseCameraPermission,
    captureStage,
    frontPhotoUri,
    hasConsent,
    isSubmitting,
    scanMode,
  ]);

  useEffect(() => {
    if (!isAutoCaptureArmed) {
      return;
    }

    const timeoutId = setTimeout(() => {
      captureBottleLabel(captureStage, "auto");
    }, AUTO_CAPTURE_DELAY_MS);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [captureBottleLabel, captureStage, isAutoCaptureArmed]);

  const autoCaptureHint = useMemo(() => {
    if (!isAutoCaptureArmed) {
      return null;
    }

    if (captureStage === "front") {
      return "Auto-capture armed: hold the front label steady.";
    }

    return "Auto-capture armed: hold the back label steady.";
  }, [captureStage, isAutoCaptureArmed]);

  const ensureBottleValidationAccess = useCallback((): boolean => {
    if (!hasConsent) {
      setStatusMessage("Scan consent is required before validation.");
      setIsConsentModalVisible(true);
      return false;
    }

    if (!canUseCameraPermission) {
      setStatusMessage("Camera permission is required before validation.");
      return false;
    }

    return true;
  }, [canUseCameraPermission, hasConsent]);

  const handleValidateFrontLabel = async () => {
    if (!ensureBottleValidationAccess()) {
      return;
    }

    if (!frontPhotoUri) {
      setStatusMessage("Capture the front label before validation.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const outcome = await processScanAttempt({
        barcodeValue: barcodeVerification.confirmedValue,
        barcodeType: barcodeVerification.confirmedType,
        frontPhotoUri,
        backPhotoUri: null,
        backLabelMissing: false,
        scannedAt: new Date(),
      });
      handleProcessOutcome(outcome);
    } catch (processError) {
      setError(
        getErrorMessage(processError, "Unable to validate front label."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveBottleCapture = async () => {
    if (!ensureBottleValidationAccess()) {
      return;
    }

    if (!frontPhotoUri) {
      setStatusMessage("Capture the front label before saving.");
      return;
    }

    if (!backLabelMissing && !backPhotoUri) {
      setStatusMessage("Capture the back label or mark it as unavailable.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const outcome = await processScanAttempt({
        barcodeValue: barcodeVerification.confirmedValue,
        barcodeType: barcodeVerification.confirmedType,
        frontPhotoUri,
        backPhotoUri: backLabelMissing ? null : backPhotoUri,
        backLabelMissing,
        scannedAt: new Date(),
      });
      handleProcessOutcome(outcome);
    } catch (processError) {
      setError(getErrorMessage(processError, "Unable to save bottle capture."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen
      isLoading={isLoadingConsent}
      error={error}
      onRetry={() => {
        void loadConsentSettings();
      }}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <ListHeader
          title="Guided scan flow"
          subtitle="Scan barcode first, then complete bottle capture only when needed."
          action={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open scan guide"
              style={({ pressed }) => [
                styles.helpButton,
                pressed && styles.pressed,
              ]}
              onPress={() => setIsGuideModalVisible(true)}
            >
              <Text style={styles.helpButtonText}>?</Text>
            </Pressable>
          }
        />

        <Card style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{modeStepTitle}</Text>

          {scanMode === "barcode" ? (
            <View style={styles.sectionContent}>
              {!hasConsent ? (
                <>
                  <Text style={styles.supportText}>
                    Scan consent is required before camera capture.
                  </Text>
                  <PrimaryButton
                    label="Review consent preferences"
                    style={styles.primaryActionButton}
                    onPress={() => setIsConsentModalVisible(true)}
                  />
                </>
              ) : null}

              {hasConsent && !canUseCameraPermission ? (
                <>
                  <Text style={styles.supportText}>
                    Camera permission is required to scan barcodes.
                  </Text>
                  <PrimaryButton
                    label="Grant camera permission"
                    style={styles.primaryActionButton}
                    onPress={() => {
                      void requestCameraPermission();
                    }}
                  />
                </>
              ) : null}

              {hasConsent && canUseCameraPermission && isCameraVisible ? (
                <View
                  testID="barcode-camera-frame"
                  style={[styles.cameraFrame, styles.barcodeCameraFrame]}
                >
                  <CameraView
                    style={styles.cameraView}
                    onBarcodeScanned={handleScan}
                  />
                  <CameraGuidanceOverlay mode="barcode" />
                </View>
              ) : null}

              <Text style={styles.supportText}>{barcodeVerificationText}</Text>

              {barcodeVerification.confirmedValue ? (
                <View style={styles.capturedBarcodeContainer}>
                  <Text style={styles.capturedBarcodeLabel}>
                    Captured barcode
                  </Text>
                  <Text style={styles.capturedBarcodeValue}>
                    {barcodeVerification.confirmedValue}
                  </Text>
                  <Text style={styles.capturedBarcodeType}>
                    Type: {barcodeVerification.confirmedType ?? "unknown"}
                  </Text>
                </View>
              ) : null}

              {hasConsent && canUseCameraPermission && !isCameraVisible ? (
                <View style={styles.barcodeActionRow}>
                  <PrimaryButton
                    label="Scan"
                    disabled={isSubmitting}
                    style={styles.barcodeActionButton}
                    onPress={resetBarcodeVerification}
                  />

                  <PrimaryButton
                    label={isSubmitting ? "Analyzing..." : "Analyze barcode"}
                    disabled={
                      !barcodeVerification.confirmedValue || isSubmitting
                    }
                    style={styles.barcodeActionButton}
                    onPress={() => {
                      void handleAnalyzeBarcode();
                    }}
                  />

                  <PrimaryButton
                    label="Switch to bottle mode"
                    disabled={isSubmitting}
                    style={styles.barcodeActionButton}
                    onPress={() => {
                      setScanMode("bottle");
                      setCaptureStage("front");
                    }}
                  />
                </View>
              ) : null}

              {hasConsent &&
              canUseCameraPermission &&
              !isCameraVisible ? null : (
                <View style={styles.barcodeActionRow}>
                  <PrimaryButton
                    label={isSubmitting ? "Analyzing..." : "Analyze barcode"}
                    disabled={
                      !barcodeVerification.confirmedValue || isSubmitting
                    }
                    style={styles.barcodeActionButton}
                    onPress={() => {
                      void handleAnalyzeBarcode();
                    }}
                  />

                  <PrimaryButton
                    label="Switch to bottle mode"
                    disabled={isSubmitting}
                    style={styles.barcodeActionButton}
                    onPress={() => {
                      setScanMode("bottle");
                      setCaptureStage("front");
                    }}
                  />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.sectionContent}>
              <Text style={styles.requirementText}>
                {captureStage === "front"
                  ? "Required: front label"
                  : "Required: back label (optional)"}
              </Text>

              {!hasConsent ? (
                <>
                  <Text style={styles.supportText}>
                    Scan consent is required before camera capture.
                  </Text>
                  <PrimaryButton
                    label="Review consent preferences"
                    style={styles.primaryActionButton}
                    onPress={() => setIsConsentModalVisible(true)}
                  />
                </>
              ) : null}

              {hasConsent && !canUseCameraPermission ? (
                <>
                  <Text style={styles.supportText}>
                    Camera permission is required to capture bottle labels.
                  </Text>
                  <PrimaryButton
                    label="Grant camera permission"
                    style={styles.primaryActionButton}
                    onPress={() => {
                      void requestCameraPermission();
                    }}
                  />
                </>
              ) : null}

              {hasConsent && canUseCameraPermission ? (
                <View
                  testID="bottle-camera-frame"
                  style={[styles.cameraFrame, styles.bottleCameraFrame]}
                >
                  <CameraView style={styles.cameraView} />
                  <CameraGuidanceOverlay mode="bottle" />
                </View>
              ) : null}

              {autoCaptureHint ? (
                <Text testID="auto-capture-status" style={styles.supportText}>
                  {autoCaptureHint}
                </Text>
              ) : null}

              {frontPhotoUri ? (
                <Text style={styles.captureUriText}>
                  Captured URI: {frontPhotoUri}
                </Text>
              ) : null}

              {captureStage === "front" ? (
                <View
                  testID="bottle-action-row-front"
                  style={styles.cameraActionRow}
                >
                  <CameraActionButton
                    testID="capture-front-button"
                    icon="📸"
                    label="Front"
                    accessibilityLabel="Capture front label"
                    disabled={isSubmitting}
                    onPress={handleCaptureFrontLabel}
                  />
                  <CameraActionButton
                    testID="validate-front-button"
                    icon="✅"
                    label={isSubmitting ? "Checking" : "Validate"}
                    accessibilityLabel="Validate front label"
                    disabled={isSubmitting || !frontPhotoUri}
                    onPress={() => {
                      void handleValidateFrontLabel();
                    }}
                  />
                </View>
              ) : (
                <>
                  {backPhotoUri ? (
                    <Text style={styles.captureUriText}>
                      Captured URI: {backPhotoUri}
                    </Text>
                  ) : null}

                  <View
                    testID="bottle-action-row-back"
                    style={styles.cameraActionRow}
                  >
                    <CameraActionButton
                      testID="capture-back-button"
                      icon="📸"
                      label="Back"
                      accessibilityLabel="Capture back label"
                      disabled={isSubmitting}
                      onPress={handleCaptureBackLabel}
                    />

                    <CameraActionButton
                      testID="validate-back-button"
                      icon="✅"
                      label={
                        isSubmitting
                          ? "Saving"
                          : backLabelMissing
                            ? "Save"
                            : "Validate"
                      }
                      accessibilityLabel={
                        backLabelMissing
                          ? "Save bottle without back label"
                          : "Validate back label"
                      }
                      disabled={
                        isSubmitting || (!backLabelMissing && !backPhotoUri)
                      }
                      onPress={() => {
                        void handleSaveBottleCapture();
                      }}
                    />

                    <CameraActionButton
                      testID="mark-no-back-label-button"
                      icon="🚫"
                      label="No back"
                      accessibilityLabel="Mark bottle without back label"
                      disabled={isSubmitting}
                      onPress={handleMarkBackLabelMissing}
                    />
                  </View>
                </>
              )}

              <PrimaryButton
                label="Return to barcode mode"
                disabled={isSubmitting}
                style={styles.bottleModeSwitchButton}
                onPress={() => setScanMode("barcode")}
              />
            </View>
          )}
        </Card>

        {statusMessage ? (
          <Card variant="subtle">
            <Text style={styles.statusMessageText}>{statusMessage}</Text>
          </Card>
        ) : null}

        <PrimaryButton
          label="Restart scan flow"
          disabled={isSubmitting}
          style={styles.primaryActionButton}
          onPress={() => setIsResetModalVisible(true)}
        />
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={isGuideModalVisible}
        onRequestClose={() => setIsGuideModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              How barcode verification works
            </Text>
            <Text style={styles.modalDescription}>
              Keep the camera on the same barcode until it is detected five
              times. Once confirmed, the camera is hidden and you can analyze or
              restart a new scan.
            </Text>
            <PrimaryButton
              label="Close"
              style={styles.primaryActionButton}
              onPress={() => setIsGuideModalVisible(false)}
            />
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={isFallbackModalVisible}
        onRequestClose={() => setIsFallbackModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Barcode not recognized</Text>
            <Text style={styles.modalDescription}>
              Switch to bottle mode to capture front and back labels.
            </Text>
            <PrimaryButton
              label="Passer en mode bouteille"
              style={styles.primaryActionButton}
              onPress={() => {
                setIsFallbackModalVisible(false);
                setScanMode("bottle");
                setCaptureStage("front");
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close barcode fallback modal"
              style={({ pressed }) => [
                styles.secondaryModalButton,
                pressed && styles.pressed,
              ]}
              onPress={() => setIsFallbackModalVisible(false)}
            >
              <Text style={styles.secondaryModalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={isResetModalVisible}
        onRequestClose={() => setIsResetModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Restart the scan flow?</Text>
            <Text style={styles.modalDescription}>
              This will reset barcode verification and bottle captures.
            </Text>
            <PrimaryButton
              label="Restart flow"
              style={styles.primaryActionButton}
              onPress={() => {
                setIsResetModalVisible(false);
                resetScanFlow();
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel restart"
              style={({ pressed }) => [
                styles.secondaryModalButton,
                pressed && styles.pressed,
              ]}
              onPress={() => setIsResetModalVisible(false)}
            >
              <Text style={styles.secondaryModalButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal
        transparent
        animationType="fade"
        visible={isConsentModalVisible}
        onRequestClose={() => setIsConsentModalVisible(false)}
      >
        <View style={styles.modalRoot}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Scan consent required</Text>
            <Text style={styles.modalDescription}>
              Barcode value, photo captures, and metadata will be stored locally
              to complete scan analysis.
            </Text>
            <View style={styles.consentActionRow}>
              <PrimaryButton
                label={isSubmitting ? "Saving consent..." : "Allow scanning"}
                disabled={isSubmitting}
                style={styles.consentPrimaryButton}
                onPress={() => {
                  void handleGrantConsent();
                }}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close consent modal"
                style={({ pressed }) => [
                  styles.consentSecondaryButton,
                  pressed && styles.pressed,
                ]}
                onPress={() => setIsConsentModalVisible(false)}
              >
                <Text style={styles.consentSecondaryButtonText}>Later</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  sectionCard: {
    gap: spacing.sm,
  },
  sectionTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  sectionContent: {
    gap: spacing.sm,
  },
  supportText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  helpButton: {
    minWidth: spacing.lg,
    minHeight: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xxs,
    paddingVertical: spacing.xxs,
  },
  helpButtonText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  barcodeActionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  barcodeActionButton: {
    flex: 1,
    minHeight: spacing.xxl + spacing.sm,
    alignSelf: "stretch",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  bottleModeSwitchButton: {
    width: "100%",
    minHeight: spacing.xxl + spacing.sm,
    alignSelf: "stretch",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  primaryActionButton: {
    width: "100%",
    minHeight: spacing.xxl + spacing.sm,
    alignSelf: "stretch",
    justifyContent: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  cameraFrame: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.neutral.black,
  },
  barcodeCameraFrame: {
    height: spacing.xxl * 5 + spacing.xs,
  },
  bottleCameraFrame: {
    alignSelf: "center",
    width: "82%",
    minWidth: spacing.xxl * 6,
    maxWidth: spacing.xxl * 9,
    aspectRatio: 2 / 3,
  },
  cameraView: {
    flex: 1,
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.sm,
  },
  cameraOverlayLabel: {
    color: colors.neutral.white,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.medium,
    textAlign: "center",
    textShadowColor: colors.neutral.black,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: radius.xs,
  },
  barcodeGuideContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  barcodeGuideFrame: {
    width: "92%",
    height: "46%",
    minHeight: spacing.xl * 3,
    maxHeight: spacing.xxl * 3 + spacing.sm,
    borderWidth: 2,
    borderColor: colors.neutral.white,
    borderRadius: radius.md,
    justifyContent: "center",
    backgroundColor: colors.neutral.black + "25",
  },
  barcodeGuideBottomTextContainer: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
  },
  barcodeGuideLine: {
    alignSelf: "center",
    width: "88%",
    height: 2,
    borderRadius: radius.full,
    backgroundColor: colors.brand.primary,
  },
  bottleGuideContainer: {
    width: "100%",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
    paddingBottom: spacing.xl,
  },
  bottleGuideLabelFrame: {
    width: "92%",
    height: "46%",
    minHeight: spacing.xxl * 3 + spacing.sm,
    maxHeight: spacing.xxl * 4,
    borderWidth: 2,
    borderColor: colors.neutral.white,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral.black + "20",
  },
  bottleGuideLabelFocus: {
    width: "88%",
    height: "68%",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: colors.brand.primary,
    borderRadius: radius.md,
    backgroundColor: colors.brand.background + "35",
  },
  bottleGuideLabelCenterLine: {
    position: "absolute",
    width: "72%",
    height: 2,
    borderRadius: radius.full,
    borderColor: colors.brand.primary,
    backgroundColor: colors.brand.primary,
  },
  bottleGuideBottomTextContainer: {
    position: "absolute",
    left: spacing.sm,
    right: spacing.sm,
    bottom: spacing.sm,
  },
  cameraActionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  cameraActionButton: {
    flex: 1,
    minHeight: spacing.xxl + spacing.sm,
    borderWidth: 0,
    borderRadius: radius.md,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xxs,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xs,
  },
  cameraActionButtonDisabled: {
    backgroundColor: colors.neutral.muted,
  },
  cameraActionIcon: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
  },
  cameraActionLabel: {
    color: colors.neutral.white,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
    textAlign: "center",
  },
  capturedBarcodeContainer: {
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xxs,
    backgroundColor: colors.brand.background,
  },
  capturedBarcodeLabel: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.bold,
  },
  capturedBarcodeValue: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  capturedBarcodeType: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  requirementText: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  captureUriText: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
  },
  statusMessageText: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: colors.neutral.black + "55",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  modalCard: {
    width: "100%",
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    backgroundColor: colors.neutral.white,
    padding: spacing.md,
    gap: spacing.sm,
  },
  modalTitle: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.bold,
  },
  modalDescription: {
    color: colors.neutral.textSecondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
  },
  secondaryModalButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.xs,
  },
  secondaryModalButtonText: {
    color: colors.brand.secondary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  consentActionRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.xs,
  },
  consentPrimaryButton: {
    flex: 1,
    minHeight: spacing.xxl + spacing.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  consentSecondaryButton: {
    flex: 1,
    minHeight: spacing.xxl + spacing.sm,
    borderWidth: 1,
    borderColor: colors.neutral.border,
    borderRadius: radius.md,
    backgroundColor: colors.neutral.white,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.xs,
  },
  consentSecondaryButtonText: {
    color: colors.neutral.textPrimary,
    fontSize: typography.size.label,
    lineHeight: typography.lineHeight.label,
    fontWeight: typography.weight.medium,
  },
  pressed: {
    opacity: 0.85,
  },
});
