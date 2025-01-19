import flattenColorPalette from "tailwindcss/lib/util/flattenColorPalette";
import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";
import tailwindAnimate from "tailwindcss-animate";
import { PluginAPI } from "tailwindcss/types/config";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
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
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        move: "move 5s linear infinite",
        scroll:
          "scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite",
      },
      typography:
        '(theme) => ({\\r\\n        DEFAULT: {\\r\\n          css: {\\r\\n            h1: {\\r\\n              fontSize: theme("fontSize.4xl"),\\r\\n              fontWeight: theme("fontWeight.bold"),\\r\\n            },\\r\\n            h2: {\\r\\n              fontSize: theme("fontSize.3xl"),\\r\\n            },\\r\\n            "ul li": {\\r\\n              marginLeft: theme("spacing.4"),\\r\\n              listStylePosition: "outside",\\r\\n            },\\r\\n            ".ql-indent-1": {\\r\\n              // paddingLeft: theme("spacing.8"),\\r\\n              marginLeft: theme("spacing.12"),\\r\\n            },\\r\\n            ".ql-indent-2": {\\r\\n              // paddingLeft: theme("spacing.12"),\\r\\n              marginLeft: theme("spacing.16"),\\r\\n            },\\r\\n            ".ql-indent-3": {\\r\\n              // paddingLeft: theme("spacing.16"),\\r\\n              marginLeft: theme("spacing.20"),\\r\\n            },\\r\\n            ".ql-indent-4": {\\r\\n              // paddingLeft: theme("spacing.20"),\\r\\n              marginLeft: theme("spacing.24"),\\r\\n            },\\r\\n          },\\r\\n        },\\r\\n      })',
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        red: "hsl(var(--red))",
        dark: "var(--dark)",
        light: "var(--light)",
        lightSecondary: "var(--light-secondary)",
        darkSecondary: "var(--dark-secondary)",
        grayText: "var(--gray-text)",
        primary2: "var(--primary2)",
        primaryLight: "var(--primary-light)",
        bgColor: "var(--bg-color)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
    },
  },

  plugins: [typography, tailwindAnimate, addVariablesForColors],
} satisfies Config;

function addVariablesForColors({
  addBase,
  theme,
}: {
  addBase: PluginAPI["addBase"];
  theme: PluginAPI["theme"];
}) {
  const allColors = flattenColorPalette(theme("colors"));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--${key}`, val])
  );

  addBase({
    ":root": newVars,
  });
}
