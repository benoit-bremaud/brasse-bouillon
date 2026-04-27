import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { Text } from "react-native";

import { Collapsible } from "@/features/scan/presentation/components/Collapsible";

describe("Collapsible", () => {
  it("does not invoke renderContent on first render (lazy)", () => {
    const renderContent = jest.fn(() => <Text>secret content</Text>);
    render(<Collapsible title="Détails" renderContent={renderContent} />);

    expect(renderContent).not.toHaveBeenCalled();
    expect(screen.queryByText("secret content")).toBeNull();
  });

  it("mounts the content only the first time the header is pressed", () => {
    const renderContent = jest.fn(() => <Text>secret content</Text>);
    render(<Collapsible title="Détails" renderContent={renderContent} />);

    fireEvent.press(screen.getByRole("button", { name: "Détails" }));

    expect(renderContent).toHaveBeenCalledTimes(1);
    expect(screen.getByText("secret content")).toBeTruthy();
  });

  it("toggles the chevron between collapsed and expanded states", () => {
    render(
      <Collapsible title="Détails" renderContent={() => <Text>x</Text>} />,
    );

    expect(screen.getByText("▸")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Détails" }));
    expect(screen.getByText("▾")).toBeTruthy();
  });

  it("invokes renderContent exactly once across multiple open/close cycles", () => {
    const renderContent = jest.fn(() => <Text>secret</Text>);
    render(<Collapsible title="Détails" renderContent={renderContent} />);

    fireEvent.press(screen.getByRole("button", { name: "Détails" })); // open
    fireEvent.press(screen.getByRole("button", { name: "Détails" })); // close
    fireEvent.press(screen.getByRole("button", { name: "Détails" })); // reopen
    fireEvent.press(screen.getByRole("button", { name: "Détails" })); // close
    fireEvent.press(screen.getByRole("button", { name: "Détails" })); // reopen

    // True Lazy Initialization: the factory runs once when the
    // subtree first mounts, the resulting node is cached, and
    // subsequent toggles reuse it. Avoids re-running expensive
    // work (useQuery, parsers, charts) in the consumer's factory.
    expect(renderContent).toHaveBeenCalledTimes(1);
  });

  it("respects initiallyExpanded by mounting the content immediately", () => {
    const renderContent = jest.fn(() => <Text>secret</Text>);
    render(
      <Collapsible
        title="Détails"
        renderContent={renderContent}
        initiallyExpanded
      />,
    );

    expect(renderContent).toHaveBeenCalled();
    expect(screen.getByText("secret")).toBeTruthy();
  });

  it("exposes the expanded state for accessibility", () => {
    render(
      <Collapsible title="Détails" renderContent={() => <Text>x</Text>} />,
    );

    const button = screen.getByRole("button", { name: "Détails" });
    expect(button.props.accessibilityState).toEqual({ expanded: false });

    fireEvent.press(button);
    expect(
      screen.getByRole("button", { name: "Détails" }).props.accessibilityState,
    ).toEqual({ expanded: true });
  });
});
