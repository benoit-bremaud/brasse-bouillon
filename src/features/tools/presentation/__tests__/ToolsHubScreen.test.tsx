import { fireEvent, render, screen } from "@testing-library/react-native";

import React from "react";
import { ToolsHubScreen } from "../ToolsHubScreen";

describe("ToolsHubScreen", () => {
  it("renders calculator hub title and known calculator topics", () => {
    render(<ToolsHubScreen />);

    expect(screen.getByText("Outils de calcul")).toBeTruthy();
    expect(screen.getByText("Fermentescibles")).toBeTruthy();
    expect(screen.getByText("Couleur")).toBeTruthy();
    expect(screen.getByText("Eau")).toBeTruthy();
  });

  it("opens a calculator card action", () => {
    render(<ToolsHubScreen />);

    const cardAction = screen.getByLabelText(
      "Ouvrir le calculateur Fermentescibles",
    );

    fireEvent.press(cardAction);

    expect(screen.getByText("Outils de calcul")).toBeTruthy();
  });
});
