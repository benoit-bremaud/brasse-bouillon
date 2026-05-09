/**
 * Benchmark use-cases for the panoramic capture tech-spike (issue #944).
 *
 * These functions are called by `BenchmarkScreen` to gather hard data before
 * the implementation of #945 / #946 / #947. The output is consumed by
 * `docs/architecture/specs/scan-tech-spike-results.md`.
 *
 * Each function returns a typed result; failures are captured as `succeeded:
 * false` rather than thrown, so the screen can render partial results even
 * when one benchmark fails.
 */

import type { CameraView } from "expo-camera";
import type {
  BurstCaptureResult,
  OcrResult,
  PerceptualHashResult,
} from "@/features/scan/domain/benchmark-result.types";
import { hashJpegAsset } from "./perceptual-hash";

const median = (values: readonly number[]): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
};

const percentile = (values: readonly number[], p: number): number => {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.floor((p / 100) * sorted.length)),
  );
  return sorted[index];
};

const max = (values: readonly number[]): number =>
  values.length === 0 ? 0 : Math.max(...values);

/**
 * Benchmark `expo-camera` takePictureAsync at full speed for ~10 s.
 *
 * Caller passes a mounted CameraView ref. The function calls
 * takePictureAsync in a tight loop and records each successful frame's
 * payload size. fps is derived from frame count / wall-clock duration.
 *
 * `skipProcessing: true` mirrors the burst-capture target in #946 (no
 * orientation correction, no EXIF write — speed first).
 */
export const runBurstCaptureBenchmark = async (
  cameraRef: { current: CameraView | null },
  options: { durationMs?: number } = {},
): Promise<BurstCaptureResult> => {
  const durationMs = options.durationMs ?? 10_000;
  const camera = cameraRef.current;
  if (!camera) {
    return {
      durationSeconds: 0,
      framesCaptured: 0,
      fps: 0,
      payloadBytesMedian: 0,
      payloadBytesMax: 0,
      notes: [
        "Camera ref was not mounted. The screen must wrap CameraView and pass its ref.",
      ],
    };
  }

  const payloadSizes: number[] = [];
  const start = Date.now();
  const deadline = start + durationMs;
  const errors: string[] = [];

  while (Date.now() < deadline) {
    try {
      const photo = await camera.takePictureAsync({
        skipProcessing: true,
        quality: 0.7,
        base64: false,
        exif: false,
        shutterSound: false,
      });
      if (photo?.uri) {
        const response = await fetch(photo.uri);
        const blob = await response.blob();
        payloadSizes.push(blob.size);
      }
    } catch (error) {
      errors.push(
        error instanceof Error
          ? error.message
          : "Unknown takePictureAsync error",
      );
      if (errors.length >= 3) {
        break;
      }
    }
  }

  const elapsedMs = Date.now() - start;
  const durationSeconds = elapsedMs / 1000;
  const framesCaptured = payloadSizes.length;
  const fps = durationSeconds > 0 ? framesCaptured / durationSeconds : 0;

  const notes: string[] = [];
  if (errors.length > 0) {
    notes.push(
      `${errors.length} takePictureAsync errors: ${errors.slice(0, 3).join("; ")}`,
    );
  }
  if (framesCaptured === 0) {
    notes.push(
      "No frames captured. Verify camera permission, the CameraView is rendered, and the device is not in low-power mode.",
    );
  }

  return {
    durationSeconds: Number(durationSeconds.toFixed(2)),
    framesCaptured,
    fps: Number(fps.toFixed(2)),
    payloadBytesMedian: Math.round(median(payloadSizes)),
    payloadBytesMax: Math.round(max(payloadSizes)),
    notes,
  };
};

/**
 * Benchmark the pure-JS perceptual hash on N fixture images.
 *
 * Each fixture is fetched + hashed `runs` times. The median, P95 and max
 * are computed across all (fixtures × runs) timings.
 *
 * Target: ≤ 50 ms per hash on the slowest device (per #944 acceptance
 * criteria).
 */
export const runPerceptualHashBenchmark = async (
  fixtureUris: readonly string[],
  options: { runs?: number } = {},
): Promise<PerceptualHashResult> => {
  const runs = options.runs ?? 10;
  const timings: number[] = [];
  const hashes: string[] = [];
  const errors: string[] = [];

  for (const uri of fixtureUris) {
    for (let i = 0; i < runs; i += 1) {
      try {
        const start = Date.now();
        const hash = await hashJpegAsset(uri);
        const elapsed = Date.now() - start;
        timings.push(elapsed);
        if (i === 0) {
          hashes.push(hash);
        }
      } catch (error) {
        errors.push(
          error instanceof Error
            ? error.message
            : "Unknown hashJpegAsset error",
        );
      }
    }
  }

  const notes: string[] = [];
  if (errors.length > 0) {
    notes.push(
      `${errors.length} hash errors: ${errors.slice(0, 3).join("; ")}. Verify fixture URIs resolve.`,
    );
  }
  if (timings.length === 0) {
    notes.push("No timings collected. The benchmark could not run.");
  }

  return {
    fixturesCount: fixtureUris.length,
    runsPerFixture: runs,
    msPerHashMedian: Math.round(median(timings)),
    msPerHashP95: Math.round(percentile(timings, 95)),
    msPerHashMax: Math.round(max(timings)),
    hashes,
    notes,
  };
};

/**
 * Benchmark `tesseract.js` initialisation + a single OCR pass.
 *
 * Decision D4 (2026-05-08) already removed `tesseract.js` from the production
 * burst flow, but the spike is still valuable to validate D4 with hard data:
 * if `tesseract.js` cannot even initialise inside Expo Managed (Web Worker
 * unavailable, WASM blocked, etc.), that confirms the drop and rules out
 * even the debug-mode flag.
 *
 * The benchmark also runs a "JS thread blocking probe": a setInterval ticker
 * is started, the OCR runs synchronously enough to delay ticks, and the
 * difference between expected and actual ticks measures how long the thread
 * was blocked.
 */
export const runOcrBenchmark = async (
  fixtureUri: string,
): Promise<OcrResult> => {
  const probeIntervalMs = 50;
  let probeTicks = 0;
  const probeStart = Date.now();
  const probe = setInterval(() => {
    probeTicks += 1;
  }, probeIntervalMs);

  let initMs: number | null = null;
  let ocrMs: number | null = null;
  let textPreview: string | null = null;
  let errorMessage: string | null = null;

  try {
    const initStart = Date.now();
    // tesseract.js is intentionally NOT in package.json — see decision D4
    // (2026-05-08, scan-algorithms.md §3 Phase 4 dropped). The dynamic import
    // is expected to fail at runtime in production builds. The benchmark
    // captures the failure mode itself as evidence backing D4.
    // @ts-expect-error tesseract.js intentionally not declared as a dependency
    const tesseract = await import("tesseract.js");
    const worker = await tesseract.createWorker(["eng", "fra"]);
    initMs = Date.now() - initStart;

    const ocrStart = Date.now();
    const recognised = await worker.recognize(fixtureUri);
    ocrMs = Date.now() - ocrStart;
    textPreview = recognised.data.text.slice(0, 200);

    await worker.terminate();
  } catch (error) {
    errorMessage =
      error instanceof Error ? error.message : "Unknown tesseract.js error";
  }

  clearInterval(probe);
  const probeElapsed = Date.now() - probeStart;
  const expectedTicks = Math.floor(probeElapsed / probeIntervalMs);
  const missedTicks = Math.max(0, expectedTicks - probeTicks);
  const jsThreadBlockedMs =
    expectedTicks === 0 ? 0 : missedTicks * probeIntervalMs;

  const notes: string[] = [];
  if (errorMessage !== null) {
    notes.push(
      "tesseract.js failed to run. This is itself a useful data point — confirms decision D4 (drop tesseract.js from production) was correct, and rules out a debug-mode flag.",
    );
  }
  if (jsThreadBlockedMs > 1000) {
    notes.push(
      `JS thread blocked for ~${jsThreadBlockedMs} ms during the OCR pass. UX-impacting — coaching strings would freeze.`,
    );
  }

  return {
    succeeded: errorMessage === null,
    initMs,
    ocrMs,
    textPreview,
    jsThreadBlockedMs: errorMessage === null ? jsThreadBlockedMs : null,
    errorMessage,
    notes,
  };
};
