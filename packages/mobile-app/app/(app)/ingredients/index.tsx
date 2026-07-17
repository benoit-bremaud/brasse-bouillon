import { Redirect } from "expo-router";

/**
 * The ingredients hub is retired: the Shop is the single door into the
 * catalog (`equipment-shop/03-component.md`). This route redirects rather
 * than 404s so existing deep links and muscle memory still land somewhere
 * sensible. The category and datasheet routes below it are untouched —
 * recipe detail links straight into them.
 */
export default function IngredientsRoute() {
  return <Redirect href="/(app)/shop" />;
}
