import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    fontFamily: {
      sans: ["Roboto", "sans-serif"],
    },
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        // Monochrome color scheme
        "monochrome": {
          lightest: "#FFFFFF", // Pure White
          lighter: "#F5F5F5", // Almost White
          light: "#E0E0E0", // Light Gray
          medium: "#A0A0A0", // Medium Gray
          dark: "#505050", // Dark Gray
          darker: "#303030", // Very Dark Gray
          darkest: "#000000", // Pure Black
        },
        "flutter-blue": {
          light: "#E0E0E0", // Light Gray
          DEFAULT: "#000000", // Black
          dark: "#000000", // Black
        },
        "flutter-primary": {
          light: "#F5F5F5", // Light Gray
          DEFAULT: "#000000", // Black
          dark: "#000000", // Black
        },
        "flutter-accent": {
          light: "#F5F5F5", // Light Gray
          DEFAULT: "#000000", // Black
          dark: "#000000", // Black
        },
        "flutter-success": {
          light: "#E0E0E0", // Light Gray
          DEFAULT: "#000000", // Black
          dark: "#000000", // Black
        },
        "flutter-warning": {
          light: "#E0E0E0", // Light Gray
          DEFAULT: "#000000", // Black
          dark: "#000000", // Black
        },
        "flutter-error": {
          light: "#E0E0E0", // Light Gray
          DEFAULT: "#000000", // Black
          dark: "#000000", // Black
        },
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
          DEFAULT: "hsl(var(--primary))",
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
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
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
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "spin-slow": "spin 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
