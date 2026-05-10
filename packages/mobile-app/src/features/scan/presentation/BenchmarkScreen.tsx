import { CameraView, useCameraPermissions } from "expo-camera";
import Constants from "expo-constants";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "@/core/theme/colors";
import { radius } from "@/core/theme/radius";
import { spacing } from "@/core/theme/spacing";
import { typography } from "@/core/theme/typography";
import {
  runBurstCaptureBenchmark,
  runOcrBenchmark,
  runPerceptualHashBenchmark,
} from "@/features/scan/application/benchmark.use-cases";
import type {
  BenchmarkResult,
  BurstCaptureResult,
  DeviceInfo,
  OcrResult,
  PerceptualHashResult,
  Platform as BenchmarkPlatform,
} from "@/features/scan/domain/benchmark-result.types";

import fixture1 from "../../../../assets/benchmark-fixtures/fixture-1.jpg";
import fixture2 from "../../../../assets/benchmark-fixtures/fixture-2.jpg";
import fixture3 from "../../../../assets/benchmark-fixtures/fixture-3.jpg";

const FIXTURE_MODULES: readonly number[] = [fixture1, fixture2, fixture3];

const resolveFixtureUris = (): readonly string[] => {
  return FIXTURE_MODULES.map((moduleId) => {
    const source = Image.resolveAssetSource(moduleId);
    return source?.uri ?? "";
  }).filter((uri) => uri.length > 0);
};

const detectPlatform = (): BenchmarkPlatform => {
  if (Platform.OS === "ios") return "ios";
  if (Platform.OS === "android") return "android";
  return "web";
};

const collectDeviceInfo = (): DeviceInfo => ({
  platform: detectPlatform(),
  osVersion: String(Platform.Version ?? "unknown"),
  deviceModel: Constants.deviceName ?? "unknown",
  appVersion: Constants.expoConfig?.version ?? "unknown",
});

const formatBytes = (bytes: number): string => {
  if (bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

interface RunningState {
  readonly burst: boolean;
  readonly hash: boolean;
  readonly ocr: boolean;
}

const INITIAL_RUNNING: RunningState = {
  burst: false,
  hash: false,
  ocr: false,
};

export const BenchmarkScreen = (): React.ReactElement => {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView | null>(null);
  const [running, setRunning] = useState<RunningState>(INITIAL_RUNNING);
  const [burstResult, setBurstResult] = useState<BurstCaptureResult | null>(
    null,
  );
  const [hashResult, setHashResult] = useState<PerceptualHashResult | null>(
    null,
  );
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);

  const fixtureUris = useMemo(() => resolveFixtureUris(), []);
  const deviceInfo = useMemo(() => collectDeviceInfo(), []);

  const aggregate = useMemo<BenchmarkResult>(
    () => ({
      ranAt: new Date().toISOString(),
      device: deviceInfo,
      burstCapture: burstResult,
      perceptualHash: hashResult,
      ocr: ocrResult,
    }),
    [burstResult, deviceInfo, hashResult, ocrResult],
  );

  const handleRunBurst = useCallback(async () => {
    if (!permission?.granted) {
      const next = await requestPermission();
      if (!next.granted) {
        Alert.alert(
          "Permission requise",
          "Autorise l'accès à la caméra pour benchmarker.",
        );
        return;
      }
    }
    setRunning((s) => ({ ...s, burst: true }));
    const result = await runBurstCaptureBenchmark(cameraRef);
    setBurstResult(result);
    setRunning((s) => ({ ...s, burst: false }));
  }, [permission, requestPermission]);

  const handleRunHash = useCallback(async () => {
    setRunning((s) => ({ ...s, hash: true }));
    const result = await runPerceptualHashBenchmark(fixtureUris, { runs: 10 });
    setHashResult(result);
    setRunning((s) => ({ ...s, hash: false }));
  }, [fixtureUris]);

  const handleRunOcr = useCallback(async () => {
    if (fixtureUris.length === 0) {
      Alert.alert(
        "Pas de fixture",
        "Impossible de résoudre les images embarquées.",
      );
      return;
    }
    setRunning((s) => ({ ...s, ocr: true }));
    const result = await runOcrBenchmark(fixtureUris[0]);
    setOcrResult(result);
    setRunning((s) => ({ ...s, ocr: false }));
  }, [fixtureUris]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message: JSON.stringify(aggregate, null, 2),
        title: `scan-tech-spike-results — ${deviceInfo.platform}`,
      });
    } catch (error) {
      console.warn("[BenchmarkScreen] Share failed", error);
    }
  }, [aggregate, deviceInfo.platform]);

  const anyRunning = running.burst || running.hash || running.ocr;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Tech-spike #944</Text>
        <Text style={styles.subtitle}>
          {deviceInfo.platform} · {deviceInfo.deviceModel} · OS{" "}
          {deviceInfo.osVersion} · app {deviceInfo.appVersion}
        </Text>

        <View style={styles.cameraCard}>
          {permission?.granted ? (
            <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          ) : (
            <Pressable
              style={styles.permissionButton}
              onPress={() => {
                void requestPermission();
              }}
            >
              <Text style={styles.permissionButtonText}>
                Autoriser la caméra pour le benchmark burst
              </Text>
            </Pressable>
          )}
        </View>

        <View style={styles.buttonRow}>
          <BenchmarkButton
            label="Burst (10 s)"
            running={running.burst}
            disabled={anyRunning && !running.burst}
            onPress={() => {
              void handleRunBurst();
            }}
          />
          <BenchmarkButton
            label="Hash (10×3)"
            running={running.hash}
            disabled={anyRunning && !running.hash}
            onPress={() => {
              void handleRunHash();
            }}
          />
          <BenchmarkButton
            label="OCR"
            running={running.ocr}
            disabled={anyRunning && !running.ocr}
            onPress={() => {
              void handleRunOcr();
            }}
          />
        </View>

        <ResultBlock title="Burst capture" content={renderBurst(burstResult)} />
        <ResultBlock title="Perceptual hash" content={renderHash(hashResult)} />
        <ResultBlock title="Tesseract.js OCR" content={renderOcr(ocrResult)} />

        <Pressable
          style={styles.shareButton}
          onPress={handleShare}
          disabled={anyRunning}
        >
          <Text style={styles.shareButtonText}>Partager le JSON complet</Text>
        </Pressable>
        <Text style={styles.footnote}>
          Colle le JSON partagé dans la PR #944 ou le doc
          scan-tech-spike-results.md.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

interface BenchmarkButtonProps {
  readonly label: string;
  readonly running: boolean;
  readonly disabled: boolean;
  readonly onPress: () => void;
}

const BenchmarkButton = ({
  label,
  running,
  disabled,
  onPress,
}: BenchmarkButtonProps): React.ReactElement => (
  <Pressable
    style={[
      styles.benchmarkButton,
      disabled && styles.benchmarkButtonDisabled,
      running && styles.benchmarkButtonRunning,
    ]}
    onPress={onPress}
    disabled={disabled || running}
  >
    <Text style={styles.benchmarkButtonText}>{running ? "…" : label}</Text>
  </Pressable>
);

interface ResultBlockProps {
  readonly title: string;
  readonly content: string;
}

const ResultBlock = ({
  title,
  content,
}: ResultBlockProps): React.ReactElement => (
  <View style={styles.resultBlock}>
    <Text style={styles.resultTitle}>{title}</Text>
    <Text style={styles.resultContent}>{content}</Text>
  </View>
);

const renderBurst = (result: BurstCaptureResult | null): string => {
  if (!result) return "Pas encore exécuté.";
  const lines = [
    `Frames : ${result.framesCaptured} en ${result.durationSeconds} s`,
    `FPS    : ${result.fps}`,
    `JPEG   : médiane ${formatBytes(result.payloadBytesMedian)}, max ${formatBytes(result.payloadBytesMax)}`,
  ];
  if (result.notes.length > 0) {
    lines.push("Notes  :");
    result.notes.forEach((n) => lines.push(`  • ${n}`));
  }
  return lines.join("\n");
};

const renderHash = (result: PerceptualHashResult | null): string => {
  if (!result) return "Pas encore exécuté.";
  const lines = [
    `Fixtures × runs : ${result.fixturesCount} × ${result.runsPerFixture}`,
    `ms / hash       : médiane ${result.msPerHashMedian}, p95 ${result.msPerHashP95}, max ${result.msPerHashMax}`,
    `Hashes (sample) : ${result.hashes.slice(0, 3).join(", ")}`,
  ];
  if (result.notes.length > 0) {
    lines.push("Notes :");
    result.notes.forEach((n) => lines.push(`  • ${n}`));
  }
  return lines.join("\n");
};

const renderOcr = (result: OcrResult | null): string => {
  if (!result) return "Pas encore exécuté.";
  if (!result.succeeded) {
    return `Échec : ${result.errorMessage ?? "inconnu"}\n→ Confirme la décision D4 (drop tesseract.js de la prod).`;
  }
  const lines = [
    `Init   : ${result.initMs} ms`,
    `OCR    : ${result.ocrMs} ms`,
    `Bloqué : JS thread ~${result.jsThreadBlockedMs} ms`,
    `Texte  : ${(result.textPreview ?? "").slice(0, 120)}…`,
  ];
  if (result.notes.length > 0) {
    lines.push("Notes :");
    result.notes.forEach((n) => lines.push(`  • ${n}`));
  }
  return lines.join("\n");
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.brand.background,
  },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.md,
  },
  title: {
    fontSize: typography.size.h1,
    lineHeight: typography.lineHeight.h1,
    fontWeight: typography.weight.bold,
    color: colors.neutral.textPrimary,
  },
  subtitle: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textSecondary,
  },
  cameraCard: {
    // Portrait orientation — bottle labels are taller than wide, so a
    // 3:4 (width:height) frame makes alignment intuitive.
    aspectRatio: 3 / 4,
    width: "100%",
    borderRadius: radius.md,
    overflow: "hidden",
    backgroundColor: colors.neutral.white,
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  permissionButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.brand.primary,
  },
  permissionButtonText: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.regular,
    color: colors.neutral.white,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  benchmarkButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.brand.primary,
    alignItems: "center",
  },
  benchmarkButtonRunning: {
    backgroundColor: colors.semantic.warning,
  },
  benchmarkButtonDisabled: {
    opacity: 0.4,
  },
  benchmarkButtonText: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.medium,
    color: colors.neutral.white,
  },
  resultBlock: {
    backgroundColor: colors.neutral.white,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  resultTitle: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.medium,
    color: colors.neutral.textPrimary,
  },
  resultContent: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.regular,
    color: colors.neutral.textSecondary,
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
  },
  shareButton: {
    paddingVertical: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.brand.secondary,
    alignItems: "center",
  },
  shareButtonText: {
    fontSize: typography.size.body,
    lineHeight: typography.lineHeight.body,
    fontWeight: typography.weight.medium,
    color: colors.neutral.white,
  },
  footnote: {
    fontSize: typography.size.caption,
    lineHeight: typography.lineHeight.caption,
    fontWeight: typography.weight.regular,
    color: colors.neutral.muted,
    textAlign: "center",
  },
});
