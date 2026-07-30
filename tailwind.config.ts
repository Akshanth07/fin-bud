import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sidebar: "#191E1C",
        surface: "#F4F5F7",
        card: "#FFFFFF",
        primary: {
          DEFAULT: "#14A38B",
          light: "#2DD4BF",
          dark: "#0F766E",
        },
        border: "#E7E9EC",
        muted: "#475569",
      },
      borderRadius: {
        DEFAULT: "12px",
        card: "12px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(16,24,32,0.04), 0 8px 24px -8px rgba(16,24,32,0.08)",
        "card-hover": "0 4px 10px rgba(16,24,32,0.06), 0 16px 32px -12px rgba(16,24,32,0.14)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
