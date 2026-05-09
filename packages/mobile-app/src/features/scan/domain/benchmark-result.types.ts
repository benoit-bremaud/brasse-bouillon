/**
 * Result types for the panoramic capture tech-spike (issue #944).
 *
 * Each benchmark routine in `application/benchmark.use-cases.ts` returns one of
 * these shapes. The aggregate `BenchmarkResult` is what the BenchmarkScreen
 * displays + serialises for sharing.
 */

export type Platform = "ios" | "android" | "web";

export interface DeviceInfo {
  readonly platform: Platform;
  readonly osVersion: string;
  readonly deviceModel: string;
  readonly appVersion: string;
}

export interface BurstCaptureResult {
  readonly durationSeconds: number;
  readonly framesCaptured: number;
  readonly fps: number;
  readonly payloadBytesMedian: number;
  readonly payloadBytesMax: number;
  readonly notes: readonly string[];
}

export interface PerceptualHashResult {
  readonly fixturesCount: number;
  readonly runsPerFixture: number;
  readonly msPerHashMedian: number;
  readonly msPerHashP95: number;
  readonly msPerHashMax: number;
  readonly hashes: readonly string[];
  readonly notes: readonly string[];
}

export interface OcrResult {
  readonly succeeded: boolean;
  readonly initMs: number | null;
  readonly ocrMs: number | null;
  readonly textPreview: string | null;
  readonly jsThreadBlockedMs: number | null;
  readonly errorMessage: string | null;
  readonly notes: readonly string[];
}

export interface BenchmarkResult {
  readonly ranAt: string;
  readonly device: DeviceInfo;
  readonly burstCapture: BurstCaptureResult | null;
  readonly perceptualHash: PerceptualHashResult | null;
  readonly ocr: OcrResult | null;
}

export type BenchmarkKind = "burst" | "hash" | "ocr";

export interface BenchmarkProgress {
  readonly kind: BenchmarkKind;
  readonly currentRun: number;
  readonly totalRuns: number;
  readonly elapsedMs: number;
}
