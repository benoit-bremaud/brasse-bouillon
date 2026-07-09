module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^yaml$": "<rootDir>/../../node_modules/yaml/dist/index.js",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native|expo(nent)?|@expo(nent)?/.*|@expo/.*|expo-router|@react-navigation/.*))",
  ],
  // Coverage ratchet (ADR-0019 D3, #1236): a floor a few points below the
  // current baseline so a meaningful drop fails CI without breaking the first
  // run. Raise deliberately over time; never lower.
  coverageThreshold: {
    global: {
      statements: 82,
      branches: 72,
      functions: 80,
      lines: 82,
    },
  },
};
