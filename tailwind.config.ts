import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#1B333F",
          600: "#164049",
          700: "#132d35",
          800: "#0f1e23",
          900: "#0a1315",
          950: "#050a0c",
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
        // Benaya brand colors based on #1B333F
        benaya: {
          50: "#f0f7f8",
          100: "#daeef1",
          200: "#b9dee4",
          300: "#8bc7d1",
          400: "#56a7b7",
          500: "#3d8a9d",
          600: "#357085",
          700: "#305c6e",
          800: "#2e4d5b",
          900: "#1B333F", // Main brand color
          950: "#142933",
        },
        // Neutral colors for text
        neutral: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        },
      },
      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.75rem" }],
      },
      boxShadow: {
        glass: "0 8px 32px 0 rgba(27, 51, 63, 0.1)",
        "glass-inset": "inset 0 1px 0 0 rgba(255, 255, 255, 0.05)",
        "inner-border": "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)",
        glow: "0 0 20px rgba(27, 51, 63, 0.15)",
        "glow-lg": "0 0 40px rgba(27, 51, 63, 0.15)",
        benaya: "0 4px 20px rgba(27, 51, 63, 0.1)",
        "benaya-lg": "0 8px 40px rgba(27, 51, 63, 0.15)",
      },
      backdropBlur: {
        xs: "2px",
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
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(30px, -50px) scale(1.1)" },
          "66%": { transform: "translate(-20px, 20px) scale(0.9)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" },
        },
        shimmer: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(27, 51, 63, 0.4)" },
          "50%": { boxShadow: "0 0 40px rgba(27, 51, 63, 0.8)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.3s ease-out",
        float: "float 6s ease-in-out infinite",
        blob: "blob 7s infinite",
        shimmer: "shimmer 2s infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      animationDelay: {
        "2000": "2s",
        "4000": "4s",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities }: any) {
      const newUtilities = {
        ".glass": {
          background: "rgba(255, 255, 255, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
        },
        ".glass-dark": {
          background: "rgba(27, 51, 63, 0.1)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        },
        ".animation-delay-2000": {
          animationDelay: "2s",
        },
        ".animation-delay-4000": {
          animationDelay: "4s",
        },
      };
      addUtilities(newUtilities);
    },
  ],
};

export default config;
