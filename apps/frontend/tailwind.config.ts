import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // semantic surface tokens
        bg: "var(--bg)",
        card: "var(--card)",
        cardBorder: "var(--card-border)",
        text: "var(--text)",
        textMuted: "var(--text-muted)",
        accent: "var(--accent)",
        accentFg: "var(--accent-fg)"
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)"
      }
    }
  },
  plugins: []
};

export default config;
