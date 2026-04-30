import { render, screen } from "@testing-library/react-native";
import React from "react";

import { BarcodeVerificationProgress } from "@/features/scan/presentation/components/BarcodeVerificationProgress";

describe("BarcodeVerificationProgress (Issue #638)", () => {
  it("renders exactly `total` dots", () => {
    render(<BarcodeVerificationProgress count={0} total={5} />);

    const filled = screen.queryAllByTestId("barcode-verification-dot-filled");
    const empty = screen.queryAllByTestId("barcode-verification-dot-empty");
    expect(filled).toHaveLength(0);
    expect(empty).toHaveLength(5);
  });

  it("fills dots progressively as count increases", () => {
    const { rerender } = render(
      <BarcodeVerificationProgress count={3} total={5} />,
    );
    expect(
      screen.queryAllByTestId("barcode-verification-dot-filled"),
    ).toHaveLength(3);
    expect(
      screen.queryAllByTestId("barcode-verification-dot-empty"),
    ).toHaveLength(2);

    rerender(<BarcodeVerificationProgress count={5} total={5} />);
    expect(
      screen.queryAllByTestId("barcode-verification-dot-filled"),
    ).toHaveLength(5);
    expect(
      screen.queryAllByTestId("barcode-verification-dot-empty"),
    ).toHaveLength(0);
  });

  it("clamps count below 0 to 0 (defensive)", () => {
    render(<BarcodeVerificationProgress count={-3} total={5} />);
    expect(
      screen.queryAllByTestId("barcode-verification-dot-filled"),
    ).toHaveLength(0);
    expect(
      screen.queryAllByTestId("barcode-verification-dot-empty"),
    ).toHaveLength(5);
  });

  it("clamps count above total to total (defensive)", () => {
    render(<BarcodeVerificationProgress count={9} total={5} />);
    expect(
      screen.queryAllByTestId("barcode-verification-dot-filled"),
    ).toHaveLength(5);
    expect(
      screen.queryAllByTestId("barcode-verification-dot-empty"),
    ).toHaveLength(0);
  });

  it("exposes a French progressbar accessibility label", () => {
    render(<BarcodeVerificationProgress count={2} total={5} />);
    expect(
      screen.getByLabelText(
        /Vérification du code-barres : 2 sur 5 scans identiques/i,
      ),
    ).toBeTruthy();
  });
});
