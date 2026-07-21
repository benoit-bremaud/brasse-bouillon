export type ThemeColors = {
  readonly brand: {
    readonly primary: string;
    readonly secondary: string;
    readonly background: string;
  };
  readonly semantic: {
    readonly success: string;
    readonly error: string;
    readonly warning: string;
    readonly info: string;
  };
  readonly neutral: {
    readonly white: string;
    readonly black: string;
    readonly shadow: string;
    readonly textPrimary: string;
    readonly textSecondary: string;
    readonly border: string;
    readonly muted: string;
  };
  readonly state: {
    readonly errorBackground: string;
    readonly successBackground: string;
    readonly infoBackground: string;
    readonly warningBackground: string;
  };
  readonly overlay: {
    readonly scrim: string;
  };
};

const lightColors: ThemeColors = {
  brand: {
    primary: "#b7824b",
    secondary: "#8d5832",
    background: "#ede2bd",
  },
  semantic: {
    success: "#7e7e31",
    error: "#573921",
    warning: "#d9b364",
    info: "#f3f3f3",
  },
  neutral: {
    white: "#ffffff",
    black: "#000000",
    shadow: "#1e1e1e",
    textPrimary: "#1e1e1e",
    textSecondary: "#5f5a4e",
    border: "#d6c8a4",
    muted: "#a7a096",
  },
  state: {
    errorBackground: "#fff0f0",
    successBackground: "#f4f8e8",
    infoBackground: "#f8f8f8",
    warningBackground: "#fdf3df",
  },
  overlay: {
    // Scrim behind modals/dialogs. Uses the app's dark neutral (not pure black)
    // at 40% so every backdrop across the app matches.
    scrim: "rgba(30, 30, 30, 0.4)",
  },
};

const darkColors: ThemeColors = {
  brand: {
    primary: "#d29a5d",
    secondary: "#f0c27a",
    background: "#33281d",
  },
  semantic: {
    success: "#a9c46c",
    error: "#ffb4ab",
    warning: "#e8bd70",
    info: "#302a24",
  },
  neutral: {
    white: "#211c17",
    black: "#000000",
    shadow: "#000000",
    textPrimary: "#f4eadc",
    textSecondary: "#c8bbaa",
    border: "#625548",
    muted: "#8f8172",
  },
  state: {
    errorBackground: "#3b2421",
    successBackground: "#2d3820",
    infoBackground: "#302a24",
    warningBackground: "#3c3020",
  },
  overlay: {
    scrim: "rgba(0, 0, 0, 0.6)",
  },
};

export const colors = lightColors;

export function getThemeColors(mode: "light" | "dark"): ThemeColors {
  return mode === "dark" ? darkColors : lightColors;
}
