import type { CameraView } from "expo-camera";
import {
  runBurstCaptureBenchmark,
  runOcrBenchmark,
  runPerceptualHashBenchmark,
} from "../benchmark.use-cases";

const FAKE_FETCH_BYTES = new Uint8Array([0x01, 0x02, 0x03, 0x04, 0x05]);

const mockFetchReturning = (bytes: Uint8Array): typeof fetch =>
  jest.fn(async (uri?: string | URL) => ({
    uri,
    arrayBuffer: async () => bytes.buffer,
    blob: async () => ({
      size: bytes.byteLength,
      type: "image/jpeg",
    }),
  })) as unknown as typeof fetch;

describe("runBurstCaptureBenchmark", () => {
  it("returns zero frames + a notes entry when the camera ref is empty", async () => {
    const result = await runBurstCaptureBenchmark(
      { current: null },
      { durationMs: 50 },
    );
    expect(result.framesCaptured).toBe(0);
    expect(result.fps).toBe(0);
    expect(result.notes.length).toBeGreaterThan(0);
    expect(result.notes[0]).toMatch(/Camera ref/);
  });

  it("captures frames and computes fps from a fake camera", async () => {
    const originalFetch = global.fetch;
    global.fetch = mockFetchReturning(FAKE_FETCH_BYTES);

    const fakeCamera = {
      takePictureAsync: jest.fn(async () => ({
        uri: "file:///fake-frame.jpg",
        width: 1024,
        height: 768,
      })),
    } as unknown as CameraView;
    const cameraRef = { current: fakeCamera };

    const result = await runBurstCaptureBenchmark(cameraRef, {
      durationMs: 100,
    });
    expect(result.framesCaptured).toBeGreaterThan(0);
    expect(result.fps).toBeGreaterThan(0);
    expect(result.payloadBytesMedian).toBe(FAKE_FETCH_BYTES.byteLength);
    expect(result.payloadBytesMax).toBe(FAKE_FETCH_BYTES.byteLength);
    expect(result.notes).toEqual([]);

    global.fetch = originalFetch;
  });

  it("aborts after 3 takePictureAsync errors and records them in notes", async () => {
    const fakeCamera = {
      takePictureAsync: jest.fn(async () => {
        throw new Error("camera busy");
      }),
    } as unknown as CameraView;
    const cameraRef = { current: fakeCamera };

    const result = await runBurstCaptureBenchmark(cameraRef, {
      durationMs: 5_000,
    });
    expect(fakeCamera.takePictureAsync).toHaveBeenCalledTimes(3);
    expect(result.framesCaptured).toBe(0);
    expect(result.notes.some((n) => n.includes("camera busy"))).toBe(true);
  });
});

describe("runPerceptualHashBenchmark", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("hashes each fixture N times and computes percentiles", async () => {
    global.fetch = mockFetchReturning(FAKE_FETCH_BYTES);

    const result = await runPerceptualHashBenchmark(
      ["file:///a.jpg", "file:///b.jpg"],
      { runs: 3 },
    );
    expect(result.fixturesCount).toBe(2);
    expect(result.runsPerFixture).toBe(3);
    expect(result.hashes.length).toBe(2);
    expect(result.hashes[0]).toMatch(/^[0-9a-f]{16}$/);
    expect(result.msPerHashMedian).toBeGreaterThanOrEqual(0);
    expect(result.notes).toEqual([]);
  });

  it("captures errors in notes when fetch fails for every fixture", async () => {
    global.fetch = jest.fn(async () => {
      throw new Error("net down");
    }) as unknown as typeof fetch;

    const result = await runPerceptualHashBenchmark(["file:///a.jpg"], {
      runs: 2,
    });
    expect(result.hashes).toEqual([]);
    expect(result.notes.length).toBeGreaterThan(0);
    expect(result.notes.some((n) => n.includes("net down"))).toBe(true);
  });

  it("reports zero timings + a note when the fixture list is empty", async () => {
    const result = await runPerceptualHashBenchmark([], { runs: 5 });
    expect(result.fixturesCount).toBe(0);
    expect(result.msPerHashMedian).toBe(0);
    expect(result.notes.some((n) => n.includes("No timings"))).toBe(true);
  });
});

describe("runOcrBenchmark", () => {
  it("returns a graceful failure when tesseract.js is not installed", async () => {
    // tesseract.js is intentionally absent from package.json (decision D4,
    // 2026-05-08). The dynamic import throws "Cannot find module 'tesseract.js'"
    // and the use-case captures it as evidence backing D4.
    const result = await runOcrBenchmark("file:///fixture.jpg");
    expect(result.succeeded).toBe(false);
    expect(result.errorMessage).not.toBeNull();
    expect(result.notes.length).toBeGreaterThan(0);
    expect(
      result.notes.some((n) => n.toLowerCase().includes("tesseract")),
    ).toBe(true);
  });
});
