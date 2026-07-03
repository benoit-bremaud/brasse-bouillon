import React from "react";
import { Text, Pressable } from "react-native";
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";

import { ConfirmProvider, useConfirm } from "@/core/ui/confirm-provider";

// A tiny harness that calls confirm() and records the resolved value.
function Harness({
  options,
  onResult,
}: {
  options: Parameters<ReturnType<typeof useConfirm>>[0];
  onResult: (value: boolean) => void;
}) {
  const confirm = useConfirm();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="ask"
      onPress={() => {
        void confirm(options).then(onResult);
      }}
    >
      <Text>ask</Text>
    </Pressable>
  );
}

describe("ConfirmProvider / useConfirm", () => {
  it("shows the branded dialog and resolves true on confirm (happy)", async () => {
    const onResult = jest.fn();
    render(
      <ConfirmProvider>
        <Harness
          options={{
            title: "Lancer le brassage ?",
            message: "Action irréversible.",
            confirmLabel: "Lancer",
          }}
          onResult={onResult}
        />
      </ConfirmProvider>,
    );

    fireEvent.press(screen.getByLabelText("ask"));

    expect(await screen.findByText("Lancer le brassage ?")).toBeTruthy();
    expect(screen.getByText("Action irréversible.")).toBeTruthy();

    fireEvent.press(screen.getByLabelText("Lancer"));

    await waitFor(() => expect(onResult).toHaveBeenCalledWith(true));
    // Dialog is dismissed after the choice.
    expect(screen.queryByText("Lancer le brassage ?")).toBeNull();
  });

  it("resolves false on cancel (sad)", async () => {
    const onResult = jest.fn();
    render(
      <ConfirmProvider>
        <Harness
          options={{ title: "Supprimer ?", confirmLabel: "Supprimer" }}
          onResult={onResult}
        />
      </ConfirmProvider>,
    );

    fireEvent.press(screen.getByLabelText("ask"));
    await screen.findByText("Supprimer ?");
    fireEvent.press(screen.getByLabelText("Annuler"));

    await waitFor(() => expect(onResult).toHaveBeenCalledWith(false));
  });

  it("settles the pending promise as declined when a second confirm opens (edge: re-entrancy)", async () => {
    const first = jest.fn();
    const second = jest.fn();

    function TwoAsks() {
      const confirm = useConfirm();
      return (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="ask-1"
            onPress={() => void confirm({ title: "Premier ?" }).then(first)}
          >
            <Text>ask-1</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="ask-2"
            onPress={() =>
              void confirm({ title: "Second ?", confirmLabel: "OK" }).then(
                second,
              )
            }
          >
            <Text>ask-2</Text>
          </Pressable>
        </>
      );
    }

    render(
      <ConfirmProvider>
        <TwoAsks />
      </ConfirmProvider>,
    );

    fireEvent.press(screen.getByLabelText("ask-1"));
    await screen.findByText("Premier ?");
    // Second request while the first dialog is open: the first promise must
    // resolve (declined), never hang, and the dialog switches to the second.
    fireEvent.press(screen.getByLabelText("ask-2"));

    await waitFor(() => expect(first).toHaveBeenCalledWith(false));
    expect(await screen.findByText("Second ?")).toBeTruthy();
    expect(screen.queryByText("Premier ?")).toBeNull();

    fireEvent.press(screen.getByLabelText("OK"));
    await waitFor(() => expect(second).toHaveBeenCalledWith(true));
  });

  it("throws when useConfirm is used outside a ConfirmProvider (edge)", () => {
    const Bare = () => {
      useConfirm();
      return null;
    };
    // Silence the expected React error boundary log for this render.
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bare />)).toThrow(/ConfirmProvider/);
    spy.mockRestore();
  });
});
