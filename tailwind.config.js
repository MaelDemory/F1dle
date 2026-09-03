/** @type {import('tailwindcss').Config} */
module.exports = {
  // dark: applies in system dark (unless .light overrides) or under an explicit .dark class
  darkMode: ['variant', [
    '@media (prefers-color-scheme: dark) { &:not(:is(.light *)) }',
    '&:is(.dark *)',
  ]],
  content: [
    './src/**/*.{ts,tsx}',
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
        background: "hsl(var(--background) / <alpha-value>)",
        surface: {
          DEFAULT: "hsl(var(--surface) / <alpha-value>)",
          raised: "hsl(var(--surface-raised) / <alpha-value>)",
        },
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        secondary: "hsl(var(--text-secondary) / <alpha-value>)",
        tertiary: "hsl(var(--text-tertiary) / <alpha-value>)",
        border: "hsl(var(--border) / <alpha-value>)",
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        success: "hsl(var(--success) / <alpha-value>)",
        warning: "hsl(var(--warning) / <alpha-value>)",
        danger: "hsl(var(--danger) / <alpha-value>)",
        scrim: "hsl(var(--scrim) / <alpha-value>)",
        difficulty: {
          1: "hsl(var(--game-difficulty-1) / <alpha-value>)",
          2: "hsl(var(--game-difficulty-2) / <alpha-value>)",
          3: "hsl(var(--game-difficulty-3) / <alpha-value>)",
          4: "hsl(var(--game-difficulty-4) / <alpha-value>)",
        },
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
      },
      boxShadow: {
        1: "var(--shadow-1)",
        2: "var(--shadow-2)",
        3: "var(--shadow-3)",
      },
      fontSize: {
        display: ["3.5rem", { lineHeight: "1.05", letterSpacing: "-0.021em", fontWeight: "700" }],
        title1: ["2rem", { lineHeight: "1.15", letterSpacing: "-0.017em", fontWeight: "700" }],
        title2: ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.014em", fontWeight: "600" }],
        title3: ["1.25rem", { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" }],
        body: ["1rem", { lineHeight: "1.5", letterSpacing: "0" }],
        callout: ["0.9375rem", { lineHeight: "1.45", letterSpacing: "0" }],
        footnote: ["0.8125rem", { lineHeight: "1.4", letterSpacing: "0" }],
        caption: ["0.75rem", { lineHeight: "1.35", letterSpacing: "0.01em" }],
      },
      letterSpacing: {
        // the only wide tracking allowed, reserved for uppercase labels <= 12px
        wide: "0.04em",
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
}
