/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./app/**/*.{js,jsx}",
    "./src/**/*.{js,jsx}",
  ],
  prefix: "",
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
        light: {
          background: "hsl(0 0% 100%)",
          foreground: "hsl(0 0% 3.9%)",
          primary: "hsl(0 0% 9%)",
          secondary: "hsl(0 0% 96.1%)",
          muted: "hsl(0 0% 96.1%)",
          accent: "hsl(0 0% 96.1%)",
          destructive: "hsl(0 84.2% 60.2%)",
          border: "hsl(0 0% 89.8%)",
          input: "hsl(0 0% 89.8%)",
          ring: "hsl(0 0% 3.9%)",
        },
        dark: {
          background: "hsl(0 0% 3.9%)",
          foreground: "hsl(0 0% 98%)",
          primary: "hsl(0 0% 98%)",
          secondary: "hsl(0 0% 14.9%)",
          muted: "hsl(0 0% 14.9%)",
          accent: "hsl(0 0% 14.9%)",
          destructive: "hsl(0 62.8% 30.6%)",
          border: "hsl(0 0% 14.9%)",
          input: "hsl(0 0% 14.9%)",
          ring: "hsl(0 0% 83.1%)",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
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
