import { formatFrDate, formatQuantity } from "@/core/utils/format";

describe("formatQuantity", () => {
  it("happy: keeps an integer amount integer", () => {
    expect(formatQuantity(5, "g")).toBe("5 g");
  });

  it("happy: rounds a fractional amount to two decimals", () => {
    expect(formatQuantity(0.905, "kg")).toBe("0.91 kg");
  });

  it("edge: a non-finite amount degrades to 0", () => {
    expect(formatQuantity(Number.NaN, "L")).toBe("0 L");
    expect(formatQuantity(Number.POSITIVE_INFINITY, "L")).toBe("0 L");
  });
});

describe("formatFrDate", () => {
  // Mid-month, midday UTC: the day may shift ±1 across timezones but the month
  // and year never do, so asserting "janvier 2026" stays deterministic on any
  // runner (TZ is not pinned by the jest config).
  it("happy: formats an ISO instant as a long French date", () => {
    expect(formatFrDate("2026-01-15T12:00:00.000Z")).toMatch(
      /^\d{1,2} janvier 2026$/,
    );
  });

  it("sad: returns null for a missing value", () => {
    expect(formatFrDate(null)).toBeNull();
    expect(formatFrDate(undefined)).toBeNull();
    expect(formatFrDate("")).toBeNull();
  });

  it("edge: returns null for an unparseable value rather than 'Invalid Date'", () => {
    expect(formatFrDate("not-a-date")).toBeNull();
  });
});
