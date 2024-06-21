/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: {
          light: "hsl(0, 0%, 100%)",
          dark: "hsl(0, 0%, 3.9%)",
        },
        foreground: {
          light: "hsl(0, 0%, 3.9%)",
          dark: "hsl(0, 0%, 98%)",
        },
        card: {
          light: "hsl(0, 0%, 100%)",
          dark: "hsl(0, 0%, 14.9%)",
        },
        primary: {
          light: "hsl(0, 0%, 9%)",
          dark: "hsl(0, 0%, 98%)",
        },
        "primary-dark": "hsl(0, 0%, 80%)",
        "primary-light": "hsl(0, 0%, 60%)",
        "muted-foreground": {
          light: "hsl(0, 0%, 45.1%)",
          dark: "hsl(0, 0%, 63.9%)",
        },
        border: "hsl(0, 0%, 85%)", // Ensure this color exists if referenced
        "custom-color": {
          light: "#3b82f6", // Custom light mode color
          dark: "#2563eb", // Custom dark mode color
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
  plugins: [require("tailwindcss-animate")],
};
