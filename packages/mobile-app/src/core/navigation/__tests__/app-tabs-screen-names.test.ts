import { existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Guards the `(app)/_layout.tsx` Tabs.Screen registrations against expo-router's
 * silent-ignore behavior: a directory without its own `_layout.tsx` is not a route
 * node — its routes are hoisted to the parent navigator as "dir/index" (etc.), so a
 * `<Tabs.Screen name>` that matches no node is dropped at runtime with only a
 * "[Layout children]: No route named X exists" console warning. This test makes that
 * class of dead registration fail loudly instead (see fix commit 1aea5c14).
 */
const APP_GROUP_DIR = join(__dirname, "..", "..", "..", "..", "app", "(app)");
const LAYOUT_FILE = join(APP_GROUP_DIR, "_layout.tsx");

function isAppNavigatorRouteNode(name: string): boolean {
  const segments = name.split("/");
  // A node belongs to (app) only if no nested _layout sits between (app) and it.
  for (let depth = 1; depth < segments.length; depth += 1) {
    if (
      existsSync(
        join(APP_GROUP_DIR, ...segments.slice(0, depth), "_layout.tsx"),
      )
    ) {
      return false;
    }
  }
  return (
    existsSync(join(APP_GROUP_DIR, ...segments, "_layout.tsx")) ||
    existsSync(join(APP_GROUP_DIR, `${name}.tsx`))
  );
}

describe("(app) Tabs.Screen registrations", () => {
  const layoutSource = readFileSync(LAYOUT_FILE, "utf8");
  const declaredNames: string[] = [];
  const namePattern = /<Tabs\.Screen\s+name="([^"]+)"/g;
  let match = namePattern.exec(layoutSource);
  while (match !== null) {
    declaredNames.push(match[1]);
    match = namePattern.exec(layoutSource);
  }

  it("extracts at least one declared screen name (sanity check)", () => {
    expect(declaredNames.length).toBeGreaterThan(0);
  });

  it("only declares names that resolve to real (app) route nodes", () => {
    const invalid = declaredNames.filter(
      (name) => !isAppNavigatorRouteNode(name),
    );
    expect(invalid).toEqual([]);
  });

  it("rejects a name that matches no route on disk", () => {
    expect(isAppNavigatorRouteNode("no-such-route")).toBe(false);
  });
});
