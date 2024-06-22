const { fontFamily } = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          light: "hsl(var(--card-light))",
          dark: "hsl(var(--card-dark))",
          foreground: {
            light: "hsl(var(--card-foreground-light))",
            dark: "hsl(var(--card-foreground-dark))",
          },
        },
        custom: {
          light: "#3b82f6",
          dark: "#2563eb",
        },
      },
    },
  },
  plugins: [],
};
