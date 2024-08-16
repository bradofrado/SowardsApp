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
    },
  },
  plugins: [],
  darkMode: "class",
} satisfies Config;
