export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000",
  useDemoData: (process.env.EXPO_PUBLIC_USE_DEMO_DATA ?? "false") === "true",
};
