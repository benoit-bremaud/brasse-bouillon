/**
 * Pure-JS image fingerprint for the panoramic capture tech-spike (issue #944).
 *
 * NOT a true DCT-based perceptual hash — that would require pixel-level
 * access to the decoded image, which is not available in Expo Managed
 * without a native module or a JS image decoder (e.g. `jpeg-js`).
 *
 * The spike's first iteration folded **every byte** of the JPEG via
 * 64-bit FNV-1a. On the maintainer's Android (Xiaomi ALI-NX1, 2026-05-10),
 * a 2 MB JPEG took ≈ 2.4 seconds to hash (target: ≤ 50 ms). The bottleneck
 * was 2 million synchronous JS iterations per call.
 *
 * This iteration uses **strided sampling**: read N bytes spaced evenly across
 * the file, fold them through FNV-1a. Cost is O(N) regardless of file size,
 * giving a constant-time fingerprint suitable for a benchmark probe.
 *
 * Trade-off: the strided fingerprint is sensitive to byte-level differences
 * (JPEG quantisation noise, sensor noise) so it is **not** a true perceptual
 * hash. Two captures of the same scene will produce different fingerprints.
 * For loop-closure detection in production (#947), a real pHash on a
 * down-sampled image is required — this spike just confirms the JS
 * hashing throughput once the input size is bounded.
 *
 * Returned hash is a 16-char hex string (64 bits).
 */

const FNV_OFFSET_LO = 0x84222325;
const FNV_OFFSET_HI = 0xcbf29ce4;
const FNV_PRIME_LO = 0x1b3;
const FNV_PRIME_HI = 0x100;

/**
 * Number of bytes sampled across the JPEG byte stream when computing the
 * strided fingerprint. 256 keeps the cost negligible (well under 1 ms in
 * pure JS) while still encoding enough variance for distinct scenes to
 * produce distinct fingerprints in the benchmark.
 */
export const STRIDED_SAMPLE_SIZE = 256;

interface UInt64 {
  hi: number;
  lo: number;
}

const multiplyU64 = (a: UInt64, primeLo: number, primeHi: number): UInt64 => {
  const aLoLow = a.lo & 0xffff;
  const aLoHigh = a.lo >>> 16;
  const aHiLow = a.hi & 0xffff;
  const aHiHigh = a.hi >>> 16;

  const pLoLow = primeLo & 0xffff;
  const pLoHigh = primeLo >>> 16;
  const pHiLow = primeHi & 0xffff;

  const r0 = aLoLow * pLoLow;
  const r1 = aLoHigh * pLoLow + aLoLow * pLoHigh;
  const r2 = aHiLow * pLoLow + aLoHigh * pLoHigh + aLoLow * pHiLow;
  const r3 = aHiHigh * pLoLow + aHiLow * pLoHigh + aLoHigh * pHiLow;

  const lo = (r0 + ((r1 & 0xffff) << 16)) >>> 0;
  const carry = Math.floor((r0 + ((r1 & 0xffff) << 16)) / 0x100000000);
  const hi = (carry + (r1 >>> 16) + r2 + ((r3 & 0xffff) << 16)) >>> 0;
  return { hi, lo };
};

const toHex = (value: UInt64): string =>
  value.hi.toString(16).padStart(8, "0") +
  value.lo.toString(16).padStart(8, "0");

/**
 * Compute a 64-bit FNV-1a hash over the given byte array.
 *
 * Pure synchronous JS — measures the raw fold cost on the JS thread.
 */
export const fnv1a64 = (bytes: Uint8Array): string => {
  let state: UInt64 = { hi: FNV_OFFSET_HI, lo: FNV_OFFSET_LO };
  for (const byte of bytes) {
    state = {
      hi: state.hi,
      lo: (state.lo ^ byte) >>> 0,
    };
    state = multiplyU64(state, FNV_PRIME_LO, FNV_PRIME_HI);
  }
  return toHex(state);
};

/**
 * Compute a 64-bit FNV-1a fingerprint over `samples` bytes spaced evenly
 * across the input. Falls back to {@link fnv1a64} when the input is
 * smaller than `samples`.
 *
 * Cost is O(samples), independent of input size. Suitable for benchmarking
 * the JS-thread cost of "hash an image we just captured" once the JPEG
 * payload is bounded by `pictureSize` on the camera side.
 */
export const fnv1a64Strided = (bytes: Uint8Array, samples: number): string => {
  if (bytes.length <= samples) {
    return fnv1a64(bytes);
  }
  const stride = Math.floor(bytes.length / samples);
  let state: UInt64 = { hi: FNV_OFFSET_HI, lo: FNV_OFFSET_LO };
  for (let i = 0; i < samples; i += 1) {
    const idx = i * stride;
    state = {
      hi: state.hi,
      lo: (state.lo ^ bytes[idx]) >>> 0,
    };
    state = multiplyU64(state, FNV_PRIME_LO, FNV_PRIME_HI);
  }
  return toHex(state);
};

/**
 * Read a JPEG asset (resolved via `Image.resolveAssetSource`) and return
 * its strided fingerprint. Wall-clock time of the whole `fetch + bytes +
 * strided fold` pipeline is what the benchmark measures.
 */
export const hashJpegAsset = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  return fnv1a64Strided(bytes, STRIDED_SAMPLE_SIZE);
};
