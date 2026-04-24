/**
 * Tests cover happy path (all three labels + values rendered), sad path
 * (fallback values 'dev' / 'local' still render without error), and edge
 * case (component exposes a summary-accessibility label so screen readers
 * can announce the whole "À propos" block as a single region).
 */

import { render, screen } from "@testing-library/react-native";

import { AboutFooter } from "@/core/ui/AboutFooter";
import React from "react";
import { appInfo } from "@/core/config/app-info";

jest.mock("@/core/config/app-info", () => ({
  appInfo: {
    version: "0.1.0-alpha2",
    commit: "abc1234",
    buildDate: "2026-05-07",
  },
}));

const mockedAppInfo = appInfo as unknown as {
  version: string;
  commit: string;
  buildDate: string;
};

describe("AboutFooter", () => {
  beforeEach(() => {
    mockedAppInfo.version = "0.1.0-alpha2";
    mockedAppInfo.commit = "abc1234";
    mockedAppInfo.buildDate = "2026-05-07";
  });

  it("happy path — renders all three values from appInfo", () => {
    render(<AboutFooter />);

    expect(screen.getByText("À propos")).toBeTruthy();
    expect(screen.getByTestId("about-footer-version").props.children).toBe(
      "0.1.0-alpha2",
    );
    expect(screen.getByTestId("about-footer-commit").props.children).toBe(
      "abc1234",
    );
    expect(screen.getByTestId("about-footer-build-date").props.children).toBe(
      "2026-05-07",
    );
  });

  it("happy path — labels are localised in French", () => {
    render(<AboutFooter />);

    expect(screen.getByText("Version")).toBeTruthy();
    expect(screen.getByText("Commit")).toBeTruthy();
    expect(screen.getByText("Build")).toBeTruthy();
  });

  it("edge case — exposes an accessible summary region with a descriptive label", () => {
    render(<AboutFooter />);

    // The whole card must be reachable by a screen reader as a single
    // grouped region. This guards against a future refactor that would
    // drop the accessibilityLabel.
    expect(screen.getByLabelText("À propos de l'application")).toBeTruthy();
  });

  it("sad path — renders fallback values ('dev' / 'local') without crashing when no build metadata is injected", () => {
    mockedAppInfo.version = "0.0.0-unknown";
    mockedAppInfo.commit = "dev";
    mockedAppInfo.buildDate = "local";

    render(<AboutFooter />);

    expect(screen.getByTestId("about-footer-version").props.children).toBe(
      "0.0.0-unknown",
    );
    expect(screen.getByTestId("about-footer-commit").props.children).toBe(
      "dev",
    );
    expect(screen.getByTestId("about-footer-build-date").props.children).toBe(
      "local",
    );
  });
});
