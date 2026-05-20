export const theme = {
  colors: {
    primary: "#3300C9",
    muted: "#4D4D4D",
    dark: "#1E1E1E",
    surface: "#F5F4FA",
  },
  fonts: {
    body: "Raleway",
    title: "Oambe",
  },
} as const;

export type Theme = typeof theme;
