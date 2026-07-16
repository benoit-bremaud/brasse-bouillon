import { renderHook } from "@testing-library/react-native";

import { useBackNavigation } from "@/core/navigation/use-back-navigation";

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

describe("useBackNavigation", () => {
  beforeEach(() => {
    mockBack.mockClear();
    mockReplace.mockClear();
    mockCanGoBack = true;
  });

  it("pops the real history when a previous screen exists", () => {
    mockCanGoBack = true;
    const { result } = renderHook(() => useBackNavigation("/(app)/academy"));

    result.current();

    expect(mockBack).toHaveBeenCalledTimes(1);
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("falls back to the given route when there is no history to pop", () => {
    mockCanGoBack = false;
    const { result } = renderHook(() => useBackNavigation("/(app)/academy"));

    result.current();

    expect(mockReplace).toHaveBeenCalledWith("/(app)/academy");
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("uses whichever fallback route it is given", () => {
    mockCanGoBack = false;
    const { result } = renderHook(() => useBackNavigation("/(app)/dashboard"));

    result.current();

    expect(mockReplace).toHaveBeenCalledWith("/(app)/dashboard");
  });
});
