import "@testing-library/jest-native/extend-expect";

import React from "react";
import { configure } from "@testing-library/react-native";

/**
 * Async-assertion budgets. Edited with Benoît's explicit approval (2026-07-20),
 * as this file is on the package's do-not-modify list; `asyncUtilTimeout` has
 * no `jest.config.js` key and can only be set at runtime via `configure()`.
 *
 * `waitFor` / `findBy*` default to 1000 ms, which is a wall-clock race rather
 * than a correctness bound: they await a real loading → loaded transition while
 * jest spreads suites across every core, so a heavy screen's first render can
 * miss the deadline even though the code is correct. Repro on `main` 392e3a6e:
 * green run alone, but two concurrent suites failed every time — and on
 * different tests (`DashboardScreen`, then `BeerInfoCardScreen`), which is why
 * this belongs here and not in one spec file.
 *
 * Both budgets move together and their ORDER is the point: jest's own per-test
 * timeout also defaults to 5 s, so lifting `asyncUtilTimeout` alone to 5 s made
 * things worse — the assertion burned the whole test budget and jest killed it
 * with an opaque "Exceeded timeout of 5000 ms" instead of the query's own
 * "Unable to find an element". `asyncUtilTimeout` must stay clear of
 * `jest.setTimeout` so the async helper loses first and says what it awaited.
 *
 * 10 s absorbs contention; 15 s keeps 5 s of headroom (teardown costs
 * milliseconds, not seconds) while capping what one genuinely stuck test costs
 * CI. Per-assertion overrides remain available.
 *
 * Measured idle, so the budget is not a blind bump. `DashboardScreen`'s first
 * test runs in ~235 ms — 4x clear of the old 1000 ms, so purely
 * contention-sensitive. `BeerInfoCardScreen`'s "shows the loading state while a
 * retry is in flight" is the outlier at ~700-810 ms (~1.4x margin), but the
 * cost is the harness, not the app: instrumenting the screen shows it leaves
 * the error state ~3 ms after `refetch()`, once three React flush cycles have
 * run. Pumping `act()` by hand clears it in 3 flushes / 3 ms and drops that
 * test to 180 ms, whereas `waitFor`'s wall-clock polling takes ~600 ms to
 * deliver the same flushes. So the scan retry path has no user-visible delay —
 * only a test sitting near the old ceiling for reasons unrelated to
 * correctness, which is exactly what a wall-clock budget should absorb.
 */
jest.setTimeout(15_000);
configure({ asyncUtilTimeout: 10_000 });

jest.mock("react-native-safe-area-context", () => {
  const actual = jest.requireActual("react-native-safe-area-context");
  return {
    ...actual,
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
  };
});

jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  usePathname: () => "/",
  Redirect: () => null,
  Stack: ({ children }: { children: React.ReactNode }) => children,
  Tabs: ({ children }: { children: React.ReactNode }) => children,
}));
