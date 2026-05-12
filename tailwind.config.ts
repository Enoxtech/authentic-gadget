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
        fog: {
          DEFAULT: "#F5F7FA",
          100: "#eef1f6",
          200: "#dce3ed",
          300: "#c9d5e3",
          400: "#b7c7da",
          500: "#a5b9d1",
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
      },
    },
  },
  plugins: [],
} satisfies Config;
