export const env = {
  /** NestJS product backend (auth, user recipes, brassins, academy, …). */
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  /**
   * Python beer-encyclopedia knowledge base (beers, breweries, styles,
   * legal denominations, OFF importer). See ADR-0005 for the split.
   */
  encyclopediaUrl:
    process.env.EXPO_PUBLIC_BEER_ENCYCLOPEDIA_URL ?? "http://localhost:8000",
  useDemoData: (process.env.EXPO_PUBLIC_USE_DEMO_DATA ?? "false") === "true",
};
