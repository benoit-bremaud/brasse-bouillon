import { fireEvent, render, screen } from "@testing-library/react-native";

import { SocialFeedScreen } from "@/features/social/presentation/SocialFeedScreen";

const mockReplace = jest.fn();

jest.mock("@expo/vector-icons", () => ({
  Ionicons: () => null,
}));

jest.mock("expo-router", () => {
  const actual = jest.requireActual("expo-router");
  return {
    ...actual,
    useRouter: () => ({
      push: jest.fn(),
      replace: mockReplace,
      back: jest.fn(),
    }),
  };
});

describe("SocialFeedScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("renders the weekly banner and the four demo posts (happy path)", () => {
    render(<SocialFeedScreen />);

    expect(
      screen.getByText("+24 brassins partagés cette semaine"),
    ).toBeOnTheScreen();
    expect(screen.getByText("La Première du dimanche")).toBeOnTheScreen();
    expect(screen.getByText("Saison fermière")).toBeOnTheScreen();
    expect(screen.getByText("Imperial Stout maison")).toBeOnTheScreen();
    expect(screen.getByText("Petite APA du jardin")).toBeOnTheScreen();
  });

  it("shows the like and comment counts on each post (edge path)", () => {
    render(<SocialFeedScreen />);

    expect(screen.getByText("🍻 12")).toBeOnTheScreen();
    expect(screen.getByText("💬 3")).toBeOnTheScreen();
    expect(screen.getByText("🍻 24")).toBeOnTheScreen();
    expect(screen.getByText("💬 6")).toBeOnTheScreen();
  });

  it("returns to the home tab when the header back button is pressed (sad path)", () => {
    // "Communauté" is a top-level dock tab: back goes home explicitly, not
    // router.back() (which would fall through to the previous tab).
    render(<SocialFeedScreen />);

    fireEvent.press(screen.getByLabelText("Retour à l’accueil"));

    expect(mockReplace).toHaveBeenCalledWith("/dashboard");
  });
});
