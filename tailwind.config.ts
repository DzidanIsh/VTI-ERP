import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand accent — refined teal/emerald (lebih bersih dari HashMicro)
        brand: {
          50: "#ecfdf7",
          100: "#d1faec",
          200: "#a7f3da",
          300: "#6ee7bf",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
          800: "#065f46",
          900: "#064e3b",
        },
        // Sidebar / dark surfaces
        sidebar: {
          DEFAULT: "#0e1726",
          muted: "#172339",
          hover: "#1e2d49",
          border: "#243352",
          text: "#aebed6",
        },
        // Status warna konsisten untuk seluruh app
        status: {
          maintenance: "#f59e0b",
          operative: "#10b981",
          breakdown: "#f43f5e",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px 0 rgb(16 24 40 / 0.04), 0 1px 3px 0 rgb(16 24 40 / 0.08)",
        cardhover: "0 4px 12px -2px rgb(16 24 40 / 0.12)",
      },
      borderRadius: {
        xl: "0.875rem",
      },
      keyframes: {
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.25s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
