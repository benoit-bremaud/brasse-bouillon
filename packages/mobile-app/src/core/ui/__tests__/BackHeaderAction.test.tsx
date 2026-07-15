import { fireEvent, render, screen } from "@testing-library/react-native";

import { BackHeaderAction } from "@/core/ui/BackHeaderAction";

const mockBack = jest.fn();
const mockReplace = jest.fn();
let mockCanGoBack = true;

jest.mock("expo-router", () => ({
  useRouter: () => ({
    canGoBack: () => mockCanGoBack,
    back: mockBack,
    replace: mockReplace,
  }),
}));

const BACK_A11Y_LABEL = "Retour à l'écran précédent";

describe("BackHeaderAction", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
    mockCanGoBack = true;
  });

  it("renders a back control with a default label", () => {
    render(<BackHeaderAction fallback="/(app)/academy" />);

    expect(screen.getByText("Retour")).toBeTruthy();
  });

  it("supports a custom label", () => {
    render(<BackHeaderAction fallback="/(app)/academy" label="Accueil" />);

    expect(screen.getByText("Accueil")).toBeTruthy();
  });

  it("pops the history when a previous screen exists", () => {
    mockCanGoBack = true;
    render(<BackHeaderAction fallback="/(app)/academy" />);

    fireEvent.press(screen.getByLabelText(BACK_A11Y_LABEL));

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("falls back to the given route when there is no history", () => {
    mockCanGoBack = false;
    render(<BackHeaderAction fallback="/(app)/academy" />);

    fireEvent.press(screen.getByLabelText(BACK_A11Y_LABEL));

    expect(mockReplace).toHaveBeenCalledWith("/(app)/academy");
    expect(mockBack).not.toHaveBeenCalled();
  });
});
