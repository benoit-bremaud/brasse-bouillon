import React from "react";
import { Pressable, Text } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import {
  SnackbarProvider,
  useSnackbar,
  type SnackbarOptions,
} from "@/core/ui/snackbar-provider";

function ShowButton({ options }: { options: SnackbarOptions }) {
  const show = useSnackbar();
  return (
    <Pressable accessibilityRole="button" onPress={() => show(options)}>
      <Text>show</Text>
    </Pressable>
  );
}

function renderWithProvider(options: SnackbarOptions) {
  return render(
    <SnackbarProvider>
      <ShowButton options={options} />
    </SnackbarProvider>,
  );
}

describe("SnackbarProvider / useSnackbar", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it("shows the message (and action label) when show() is called", () => {
    renderWithProvider({ message: "Recette ajoutée", actionLabel: "Annuler" });

    expect(screen.queryByText("Recette ajoutée")).toBeNull();

    fireEvent.press(screen.getByText("show"));

    expect(screen.getByText("Recette ajoutée")).toBeTruthy();
    expect(screen.getByLabelText("Annuler")).toBeTruthy();
  });

  it("fires onAction and dismisses when the action is tapped", () => {
    const onAction = jest.fn();
    renderWithProvider({
      message: "Recette ajoutée",
      actionLabel: "Annuler",
      onAction,
    });

    fireEvent.press(screen.getByText("show"));
    fireEvent.press(screen.getByLabelText("Annuler"));

    expect(onAction).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Recette ajoutée")).toBeNull();
  });

  it("auto-dismisses after the duration", () => {
    jest.useFakeTimers();
    renderWithProvider({ message: "Recette ajoutée", durationMs: 5000 });

    fireEvent.press(screen.getByText("show"));
    expect(screen.getByText("Recette ajoutée")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    expect(screen.queryByText("Recette ajoutée")).toBeNull();
  });

  it("renders no action button when no actionLabel is given", () => {
    renderWithProvider({ message: "Résultats copiés" });

    fireEvent.press(screen.getByText("show"));

    expect(screen.getByText("Résultats copiés")).toBeTruthy();
    expect(screen.queryByLabelText("Annuler")).toBeNull();
  });

  it("throws when useSnackbar is used outside a SnackbarProvider", () => {
    // Silence the expected React error log for the thrown render.
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<ShowButton options={{ message: "x" }} />)).toThrow(
      "useSnackbar must be used within a SnackbarProvider",
    );
    spy.mockRestore();
  });
});
