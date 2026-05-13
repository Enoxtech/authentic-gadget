import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          DEFAULT: "#040820",
          50: "#E8F0FF",
          100: "#2A40E0",
          200: "#2030C0",
          300: "#1A25A0",
          400: "#141D80",
          500: "#0F1560",
          600: "#0A0E45",
          700: "#080B35",
          800: "#06092A",
          900: "#040820",
        },
        electric: {
          DEFAULT: "#19AFFF",
          50: "#e6f7ff",
          100: "#cceeff",
          200: "#99ddff",
          300: "#66ccff",
          400: "#33bbff",
          500: "#19AFFF",
          600: "#008acc",
          700: "#006699",
          800: "#004366",
          900: "#002233",
        },
        // Option A: Deep Navy + Warm Gold
        fog: {
          DEFAULT: "#F0EDE6",
          100: "#e8e4dc",
          200: "#d4cec3",
          300: "#c0b8a9",
          400: "#ACA38E",
          500: "#988E73",
        },
        charcoal: {
          DEFAULT: "#1A1A1A",
          50: "#f5f5f5",
          100: "#e0e0e0",
          200: "#c2c2c2",
          300: "#a3a3a3",
          400: "#858585",
          500: "#666666",
          600: "#525252",
          700: "#333333",
          800: "#1A1A1A",
          900: "#0d0d0d",
        },
        gold: {
          DEFAULT: "#D4A843",
          light: "#F5ECD7",
          dark: "#C9A96E",
          muted: "#C9A96E",
          glow: "rgba(212, 168, 67, 0.25)",
        },
        // Card backgrounds
        "navy-glass": "rgba(6, 17, 43, 0.85)",
        "card-dark": "#06112B",
      },
      fontFamily: {
        sans: ["var(--font-poppins)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "24px",
      },
      boxShadow: {
        card: "0 2px 8px rgba(0, 16, 64, 0.08)",
        "card-hover": "0 8px 24px rgba(0, 16, 64, 0.12)",
        "inner-soft": "inset 0 2px 4px rgba(0, 16, 64, 0.06)",
        "gold-glow": "0 0 30px rgba(212, 168, 67, 0.2)",
        "gold-glow-sm": "0 0 15px rgba(212, 168, 67, 0.15)",
      },
    },
  },
  plugins: [],
} satisfies Config;