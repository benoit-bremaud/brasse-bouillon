import {
  convertQuantity,
  formatQuantityForUnitSystem,
  formatVolumeForUnitSystem,
} from "../quantity-conversion";

describe("quantity conversion", () => {
  it("keeps metric quantities unchanged", () => {
    // Arrange

    // Act
    const quantity = convertQuantity(4.2, "kg", "metric");

    // Assert
    expect(quantity).toEqual({ amount: 4.2, unit: "kg" });
  });

  it("uses the app's canonical metric volume labels", () => {
    // Arrange

    // Act
    const volume = formatVolumeForUnitSystem(20, "metric");

    // Assert
    expect(volume).toBe("20 L");
  });

  it("converts brewing mass and volume to imperial display units", () => {
    // Arrange

    // Act
    const mass = formatQuantityForUnitSystem(4.2, "kg", "imperial");
    const volume = formatVolumeForUnitSystem(20, "imperial");

    // Assert
    expect(mass).toBe("9.26 lb");
    expect(volume).toBe("5.28 gal");
  });

  it("preserves unknown units instead of guessing a conversion", () => {
    // Arrange

    // Act
    const quantity = convertQuantity(1, "pack", "imperial");

    // Assert
    expect(quantity).toEqual({ amount: 1, unit: "pack" });
  });

  it("keeps zero quantities stable at the conversion boundary", () => {
    // Arrange

    // Act
    const quantity = formatQuantityForUnitSystem(0, "g", "imperial");

    // Assert
    expect(quantity).toBe("0 oz");
  });

  it("normalizes non-finite amounts to a safe zero display", () => {
    // Arrange

    // Act
    const quantity = formatQuantityForUnitSystem(Number.NaN, "g", "imperial");

    // Assert
    expect(quantity).toBe("0 g");
  });
});
