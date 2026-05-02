const explicitEncyclopediaUrl = process.env.EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL;

export const env = {
  /** NestJS product backend (auth, user recipes, brassins, academy, …). */
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  /**
   * Python beer-encyclopedia knowledge base (beers, breweries, styles,
   * legal denominations, OFF importer). See ADR-0005 for the split.
   * Defaults to `http://localhost:8000` for the dev-PC web preview;
   * physical devices and production builds MUST set
   * `EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL` explicitly — see
   * `encyclopediaUrlIsConfigured` and the data-layer guard in
   * `features/scan/data/beers-import.api.ts`.
   */
  encyclopediaUrl: explicitEncyclopediaUrl ?? "http://localhost:8000",
  /**
   * `true` only when the env var is explicitly provided. Lets the
   * data layer fail fast (Codex P1 #871) when the bundle was built
   * without the encyclopedia URL — avoids leaking a network timeout
   * to the UI when the default `localhost:8000` resolves to the
   * device itself rather than the dev PC.
   */
  encyclopediaUrlIsConfigured: !!explicitEncyclopediaUrl,
  useDemoData: (process.env.EXPO_PUBLIC_USE_DEMO_DATA ?? "false") === "true",
};
