import { Config } from "tailwindcss";

export default {
  content: [
    "../../packages/ui/**/*.{ts,tsx}",
    "./**/*.{ts,tsx}",
    "./pages/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: "#66b1eb33",
          DEFAULT: "#41b8d5",
          dark: "#39a5bf",
        },
        gray: {
          DEFAULT: "#f2f3f5cc",
        },
        black: "#04060D",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [],
  darkMode: "class",
} satisfies Config;
