import { fireEvent, render, screen } from "@testing-library/react-native";

import { BatchFinishedScreen } from "@/features/batches/presentation/BatchFinishedScreen";

const mockBack = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: mockBack,
    }),
  };
});

describe("BatchFinishedScreen", () => {
  beforeEach(() => {
    mockBack.mockClear();
  });

  it("renders the fil-rouge beer identity (happy path)", () => {
    render(<BatchFinishedScreen />);

    expect(screen.getByText("La Première du dimanche")).toBeOnTheScreen();
    expect(screen.getByText("Blonde simple")).toBeOnTheScreen();
    expect(
      screen.getByText("4,8 % alc./vol. · 33 cl · brassée par Marie"),
    ).toBeOnTheScreen();
  });

  it("renders the brewing KPIs and the 4-step timeline (edge path)", () => {
    render(<BatchFinishedScreen />);

    expect(screen.getByText("4,8 %")).toBeOnTheScreen();
    expect(screen.getByText("22")).toBeOnTheScreen();
    expect(screen.getByText("5 L")).toBeOnTheScreen();
    expect(screen.getByText("8")).toBeOnTheScreen();

    expect(screen.getByText("22 avril")).toBeOnTheScreen();
    expect(screen.getByText("Empâtage et ébullition")).toBeOnTheScreen();
    expect(screen.getByText("12 mai")).toBeOnTheScreen();
    expect(screen.getByText("Mise en bouteille")).toBeOnTheScreen();
  });

  it("navigates back when the header back button is pressed (sad path)", () => {
    render(<BatchFinishedScreen />);

    fireEvent.press(screen.getByLabelText("Retour à la liste des brassins"));

    expect(mockBack).toHaveBeenCalledTimes(1);
  });
});
