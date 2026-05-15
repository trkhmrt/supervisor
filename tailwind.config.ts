import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: "#f6f6f6",
          100: "#ebebeb",
          200: "#d8d8d8",
          300: "#c0c0c0",
          400: "#9a9a9a",
          500: "#767676",
          600: "#5f5f5f",
          700: "#454545",
          800: "#2d2d2d",
          900: "#111111",
          950: "#000000",
        },
        clinical: {
          white: "#F1F0F0",
          light: "#F1F0F0",
          border: "#d2d2d2",
          text: "#111111",
          muted: "#5f5f5f",
        },
        accent: {
          gold: "#111111",
          blue: "#111111",
          red: "#111111",
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "Source Serif 4", "serif"],
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
      },
      borderRadius: {
        "premium": "0.5rem", // Daha keskin ve kurumsal
      },
      boxShadow: {
        premium: "0 4px 20px -2px rgba(0, 0, 0, 0.12), 0 2px 8px -1px rgba(0, 0, 0, 0.06)",
        "premium-hover": "0 20px 40px -4px rgba(0, 0, 0, 0.18), 0 8px 16px -2px rgba(0, 0, 0, 0.1)",
      },
      keyframes: {
        "scroll-reveal": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "line-grow": {
          "0%": { width: "0%" },
          "100%": { width: "100%" },
        }
      },
      animation: {
        "scroll-reveal": "scroll-reveal 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards",
      },
    },
  },
  plugins: [],
};

export default config;
