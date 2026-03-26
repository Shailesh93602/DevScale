import flattenColorPalette from 'tailwindcss/lib/util/flattenColorPalette';
import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import tailwindAnimate from 'tailwindcss-animate';
import { PluginAPI } from 'tailwindcss/types/config';

export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    screens: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1400px',
    },
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-up': 'fadeUp 0.5s ease forwards',
        move: 'move 5s linear infinite',
        scroll:
          'scroll var(--animation-duration, 40s) var(--animation-direction, forwards) linear infinite',
      },
      typography: (theme: any) => ({
        DEFAULT: {
          css: {
            h1: {
              fontSize: theme('fontSize.4xl'),
              fontWeight: theme('fontWeight.bold'),
            },
            h2: {
              fontSize: theme('fontSize.3xl'),
            },
            'ul li': {
              marginLeft: theme('spacing.4'),
              listStylePosition: 'outside',
            },
            '.ql-indent-1': {
              marginLeft: theme('spacing.12'),
            },
            '.ql-indent-2': {
              marginLeft: theme('spacing.16'),
            },
            '.ql-indent-3': {
              marginLeft: theme('spacing.20'),
            },
            '.ql-indent-4': {
              marginLeft: theme('spacing.24'),
            },
          },
        },
      }),
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'var(--primary)',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        info: {
          DEFAULT: 'hsl(var(--info))',
          foreground: 'hsl(var(--info-foreground))',
        },
        dark: 'var(--dark)',
        light: 'var(--light)',
        lightSecondary: 'var(--light-secondary)',
        darkSecondary: 'var(--dark-secondary)',
        grayText: 'var(--gray-text)',
        primary2: 'var(--primary2)',
        primaryLight: 'var(--primary-light)',
        bgColor: 'var(--bg-color)',
        // Semantic colors
        purple: 'hsl(var(--color-purple))',
        orange: 'hsl(var(--color-orange))',
        pink: 'hsl(var(--color-pink))',
        teal: 'hsl(var(--color-teal))',
        indigo: 'hsl(var(--color-indigo))',
        blue: 'hsl(var(--color-blue))',
        green: 'hsl(var(--color-green))',
        red: 'hsl(var(--color-red))',
        yellow: 'hsl(var(--color-yellow))',
        cta: {
          from: 'hsl(var(--cta-from))',
          via: 'hsl(var(--cta-via))',
          to: 'hsl(var(--cta-to))',
        },
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
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
  addBase: PluginAPI['addBase'];
  theme: PluginAPI['theme'];
}) {
  const allColors = flattenColorPalette(theme('colors'));
  const newVars = Object.fromEntries(
    Object.entries(allColors).map(([key, val]) => [`--tw-color-${key}`, val]),
  );

  addBase({
    ':root': newVars,
  });
}
