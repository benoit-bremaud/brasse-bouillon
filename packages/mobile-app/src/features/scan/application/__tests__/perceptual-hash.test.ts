import { fnv1a64, hashJpegAsset } from "../perceptual-hash";

describe("perceptual-hash — fnv1a64", () => {
  it("returns the canonical 64-bit FNV-1a offset basis on empty input", () => {
    const result = fnv1a64(new Uint8Array(0));
    expect(result).toBe("cbf29ce484222325");
  });

  it("is deterministic for identical input", () => {
    const bytes = new Uint8Array([0x42, 0xb6, 0x21, 0x00, 0xff]);
    expect(fnv1a64(bytes)).toBe(fnv1a64(bytes));
  });

  it("changes the hash when a single byte changes", () => {
    const a = new Uint8Array([0x00, 0x01, 0x02, 0x03]);
    const b = new Uint8Array([0x00, 0x01, 0x02, 0x04]);
    expect(fnv1a64(a)).not.toBe(fnv1a64(b));
  });

  it("returns a 16-char hex string regardless of input size", () => {
    const small = fnv1a64(new Uint8Array([0x01]));
    const large = fnv1a64(new Uint8Array(10_000).fill(0xab));
    expect(small).toMatch(/^[0-9a-f]{16}$/);
    expect(large).toMatch(/^[0-9a-f]{16}$/);
  });
});

describe("perceptual-hash — hashJpegAsset", () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("hashes the bytes returned by fetch", async () => {
    const expectedBytes = new Uint8Array([0xff, 0xd8, 0xff, 0xe0]);
    global.fetch = jest.fn(async () => ({
      arrayBuffer: async () => expectedBytes.buffer,
    })) as unknown as typeof fetch;

    const hash = await hashJpegAsset("file:///fake.jpg");
    expect(hash).toBe(fnv1a64(expectedBytes));
  });

  it("propagates fetch errors so the caller can record the failure", async () => {
    global.fetch = jest.fn(async () => {
      throw new Error("network down");
    }) as unknown as typeof fetch;

    await expect(hashJpegAsset("file:///fake.jpg")).rejects.toThrow(
      "network down",
    );
  });
});
