/**
 * The fallback shown when a route subtree throws while rendering.
 *
 * Its whole job is to replace a silent process kill (release builds have no
 * redbox) with something readable on-device, so the assertions here are about
 * what the user actually sees and can do.
 */
import { fireEvent, render, screen } from "@testing-library/react-native";

import { RouteErrorFallback } from "@/core/ui/RouteErrorFallback";

describe("RouteErrorFallback", () => {
  it("happy: shows the error message so the failure is reportable", () => {
    render(
      <RouteErrorFallback
        error={new Error("undefined is not a function")}
        retry={jest.fn()}
      />,
    );

    expect(screen.getByText("undefined is not a function")).toBeTruthy();
    expect(screen.getByText("Une erreur est survenue")).toBeTruthy();
  });

  it("happy: pressing Réessayer re-mounts the subtree via retry", () => {
    const retry = jest.fn();
    render(<RouteErrorFallback error={new Error("boom")} retry={retry} />);

    fireEvent.press(screen.getByText("Réessayer"));

    expect(retry).toHaveBeenCalledTimes(1);
  });

  it("edge: an error with an empty message still renders a titled screen, never a blank one", () => {
    render(<RouteErrorFallback error={new Error("")} retry={jest.fn()} />);

    // The point of the boundary is that the user is never left staring at
    // nothing — the title and the recovery action carry the screen on their own.
    expect(screen.getByText("Une erreur est survenue")).toBeTruthy();
    expect(screen.getByText("Réessayer")).toBeTruthy();
  });
});
