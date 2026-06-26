import {
  FINAL_GRAVITY_TOO_HIGH_MESSAGE,
  computeAbv,
  validateFinalGravity,
} from "@/features/batches/application/measurement.calculations";

describe("computeAbv", () => {
  it("computes a typical ABV rounded to one decimal (happy path)", () => {
    // (1.050 - 1.010) * 131.25 = 5.25 -> 5.3 (round half up).
    expect(computeAbv(1.05, 1.01)).toBe(5.3);
  });

  it("returns 0 when OG and FG are equal (edge: no fermentation)", () => {
    expect(computeAbv(1.04, 1.04)).toBe(0);
  });

  it("rounds a tiny difference to one decimal (edge: rounding)", () => {
    // (1.041 - 1.040) * 131.25 = 0.131... -> 0.1.
    expect(computeAbv(1.041, 1.04)).toBe(0.1);
  });

  it("returns a negative value when FG exceeds OG (sad: guarded upstream)", () => {
    // (1.010 - 1.050) * 131.25 = -5.25 -> -5.3. The screen blocks this case
    // before calling computeAbv, but the helper stays pure and total.
    expect(computeAbv(1.01, 1.05)).toBe(-5.3);
  });
});

describe("validateFinalGravity", () => {
  it("accepts an FG strictly below the OG (happy path)", () => {
    expect(validateFinalGravity(1.05, 1.01)).toEqual({ valid: true });
  });

  it("rejects an FG equal to the OG with a plain message (edge)", () => {
    expect(validateFinalGravity(1.05, 1.05)).toEqual({
      valid: false,
      message: FINAL_GRAVITY_TOO_HIGH_MESSAGE,
    });
  });

  it("rejects an FG higher than the OG with a plain message (sad path)", () => {
    const result = validateFinalGravity(1.05, 1.06);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.message).toBe(FINAL_GRAVITY_TOO_HIGH_MESSAGE);
    }
  });
});
