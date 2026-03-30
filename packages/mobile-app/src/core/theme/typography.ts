export const typography = {
  fontFamily: "System",
  size: {
    h1: 32,
    h2: 24,
    body: 16,
    label: 14,
    caption: 12,
  },
  lineHeight: {
    h1: 38,
    h2: 30,
    body: 24,
    label: 20,
    caption: 16,
  },
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    bold: "700" as const,
  },
} as const;
