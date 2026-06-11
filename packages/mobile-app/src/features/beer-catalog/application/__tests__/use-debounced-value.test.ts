/**
 * Debounce hook tests (`08-state-search-input.md`): the value propagates
 * only after it has stopped changing for SEARCH_DEBOUNCE_MS; rapid
 * keystrokes reset the timer; unmounting cancels the pending timer.
 */
import { act, renderHook } from "@testing-library/react-native";

import {
  SEARCH_DEBOUNCE_MS,
  useDebouncedValue,
} from "@/features/beer-catalog/application/use-debounced-value";

describe("use-debounced-value / useDebouncedValue", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("happy: returns the initial value immediately, then settles a new value after 300 ms", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value),
      { initialProps: { value: "ipa" } },
    );

    expect(SEARCH_DEBOUNCE_MS).toBe(300);
    expect(result.current).toBe("ipa");

    rerender({ value: "stout" });
    // Not yet — the timer has not elapsed.
    expect(result.current).toBe("ipa");

    act(() => {
      jest.advanceTimersByTime(299);
    });
    expect(result.current).toBe("ipa");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(result.current).toBe("stout");
  });

  it("happy: rapid changes collapse to the last value only", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value),
      { initialProps: { value: "k" } },
    );

    // Three keystrokes, each within the debounce window of the previous.
    rerender({ value: "kö" });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ value: "köl" });
    act(() => {
      jest.advanceTimersByTime(100);
    });
    rerender({ value: "kölsch" });

    // 200 ms of typing elapsed but each change reset the timer.
    expect(result.current).toBe("k");

    act(() => {
      jest.advanceTimersByTime(300);
    });
    // Intermediate values never propagated.
    expect(result.current).toBe("kölsch");
  });

  it("sad: a change that settles, then another, propagates both in order", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("b");

    rerender({ value: "c" });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    expect(result.current).toBe("c");
  });

  it("edge: unmounting before the timer fires cancels it — no late state update, no warning", () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    try {
      const { rerender, unmount } = renderHook(
        ({ value }: { value: string }) => useDebouncedValue(value),
        { initialProps: { value: "ipa" } },
      );

      rerender({ value: "stout" });
      unmount();

      act(() => {
        jest.advanceTimersByTime(1000);
      });

      expect(jest.getTimerCount()).toBe(0);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    } finally {
      consoleErrorSpy.mockRestore();
    }
  });

  it("edge: honours a custom delay", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebouncedValue(value, 500),
      { initialProps: { value: "ipa" } },
    );

    rerender({ value: "stout" });
    act(() => {
      jest.advanceTimersByTime(300);
    });
    // The default window has passed but the custom one has not.
    expect(result.current).toBe("ipa");

    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(result.current).toBe("stout");
  });
});
