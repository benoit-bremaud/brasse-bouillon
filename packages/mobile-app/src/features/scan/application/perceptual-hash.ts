/**
 * Pure-JS perceptual hash for the panoramic capture tech-spike (issue #944).
 *
 * NOT a true DCT-based pHash — that would require pixel-level access to the
 * decoded image, which is not available in Expo Managed without adding a
 * native dep (e.g. `expo-image-manipulator`).
 *
 * Instead this is a 64-bit FNV-1a fold over the JPEG byte stream, which
 * benchmarks the realistic cost of "hash an image we just captured" in the
 * mobile app. The actual loop-closure detection in #947 will use a richer
 * scheme (perceptual hash + ORB-like signature on resized frames), but this
 * gives a tight lower bound on pure-JS hashing throughput.
 *
 * Returned hash is a 16-char hex string (64 bits).
 */

const FNV_OFFSET_LO = 0x84222325;
const FNV_OFFSET_HI = 0xcbf29ce4;
const FNV_PRIME_LO = 0x1b3;
const FNV_PRIME_HI = 0x100;

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
  for (let i = 0; i < bytes.length; i += 1) {
    state = {
      hi: state.hi,
      lo: (state.lo ^ bytes[i]) >>> 0,
    };
    state = multiplyU64(state, FNV_PRIME_LO, FNV_PRIME_HI);
  }
  return toHex(state);
};

/**
 * Read a JPEG asset (resolved via `require()` + `Image.resolveAssetSource`)
 * and return its hash. Wall-clock time of the whole `fetch + bytes + hash`
 * pipeline is what we benchmark.
 */
export const hashJpegAsset = async (uri: string): Promise<string> => {
  const response = await fetch(uri);
  const arrayBuffer = await response.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  return fnv1a64(bytes);
};
