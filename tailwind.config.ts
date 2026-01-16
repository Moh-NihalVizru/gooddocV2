import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
      /* ═══════════════════════════════════════════════════════════════
         GOOD DOC 2025 DESIGN SYSTEM - TAILWIND EXTENSION
         ═══════════════════════════════════════════════════════════════ */
      
      colors: {
        /* Semantic Colors */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          50: "hsl(var(--gd-primary-50))",
          100: "hsl(var(--gd-primary-100))",
          200: "hsl(var(--gd-primary-200))",
          300: "hsl(var(--gd-primary-300))",
          400: "hsl(var(--gd-primary-400))",
          500: "hsl(var(--gd-primary-500))",
          600: "hsl(var(--gd-primary-600))",
          700: "hsl(var(--gd-primary-700))",
          800: "hsl(var(--gd-primary-800))",
          900: "hsl(var(--gd-primary-900))",
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
          50: "hsl(var(--gd-accent-50))",
          100: "hsl(var(--gd-accent-100))",
          200: "hsl(var(--gd-accent-200))",
          300: "hsl(var(--gd-accent-300))",
          400: "hsl(var(--gd-accent-400))",
          500: "hsl(var(--gd-accent-500))",
          600: "hsl(var(--gd-accent-600))",
          700: "hsl(var(--gd-accent-700))",
          800: "hsl(var(--gd-accent-800))",
          900: "hsl(var(--gd-accent-900))",
        },
        
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
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
        
        /* Functional Colors */
        success: {
          DEFAULT: "hsl(var(--gd-success))",
          light: "hsl(var(--gd-success-light))",
          dark: "hsl(var(--gd-success-dark))",
        },
        warning: {
          DEFAULT: "hsl(var(--gd-warning))",
          light: "hsl(var(--gd-warning-light))",
          dark: "hsl(var(--gd-warning-dark))",
        },
        error: {
          DEFAULT: "hsl(var(--gd-error))",
          light: "hsl(var(--gd-error-light))",
          dark: "hsl(var(--gd-error-dark))",
        },
        info: {
          DEFAULT: "hsl(var(--gd-info))",
          light: "hsl(var(--gd-info-light))",
          dark: "hsl(var(--gd-info-dark))",
        },
        
        /* Neutral Scale */
        neutral: {
          0: "hsl(var(--gd-neutral-0))",
          50: "hsl(var(--gd-neutral-50))",
          100: "hsl(var(--gd-neutral-100))",
          200: "hsl(var(--gd-neutral-200))",
          300: "hsl(var(--gd-neutral-300))",
          400: "hsl(var(--gd-neutral-400))",
          500: "hsl(var(--gd-neutral-500))",
          600: "hsl(var(--gd-neutral-600))",
          700: "hsl(var(--gd-neutral-700))",
          800: "hsl(var(--gd-neutral-800))",
          900: "hsl(var(--gd-neutral-900))",
        },
        
        /* Legacy compatibility */
        "ask-orange": "hsl(var(--ask-good-doc-orange))",
        "ask-red": "hsl(var(--ask-good-doc-red))",
      },
      
      backgroundImage: {
        "ask-gradient": "var(--ask-good-doc-gradient)",
      },
      
      /* Border Radius */
      borderRadius: {
        xs: "var(--radius-xs)",
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        pill: "var(--radius-pill)",
      },
      
      /* Box Shadows */
      boxShadow: {
        s: "var(--shadow-s)",
        m: "var(--shadow-m)",
        l: "var(--shadow-l)",
      },
      
      /* Typography */
      fontFamily: {
        sans: [
          "Inter var",
          "SF Pro Text",
          "Segoe UI",
          "Roboto",
          "Arial",
          "sans-serif",
        ],
      },
      
      fontSize: {
        display: ["1.75rem", { lineHeight: "1.2", fontWeight: "700" }],
        h1: ["1.25rem", { lineHeight: "1.3", fontWeight: "700" }],
        h2: ["1.125rem", { lineHeight: "1.3", fontWeight: "600" }],
        h3: ["1rem", { lineHeight: "1.35", fontWeight: "600" }],
        body: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        "body-strong": ["0.875rem", { lineHeight: "1.5", fontWeight: "600" }],
        small: ["0.75rem", { lineHeight: "1.5", fontWeight: "400" }],
        label: ["0.75rem", { lineHeight: "1.4", fontWeight: "600" }],
        caption: ["0.6875rem", { lineHeight: "1.4", fontWeight: "500" }],
        content: ["0.875rem", { lineHeight: "1.5", fontWeight: "400" }],
        subcontent: ["0.75rem", { lineHeight: "1.4", fontWeight: "400" }],
      },
      
      /* Spacing Scale */
      spacing: {
        "gd-2": "2px",
        "gd-4": "4px",
        "gd-8": "8px",
        "gd-12": "12px",
        "gd-16": "16px",
        "gd-20": "20px",
        "gd-24": "24px",
        "gd-32": "32px",
        "gd-40": "40px",
        "gd-48": "48px",
        "gd-64": "64px",
      },
      
      /* Motion */
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
        decel: "var(--ease-decel)",
        accel: "var(--ease-accel)",
      },
      
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
        long: "var(--duration-long)",
      },
      
      /* Animations */
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-out": {
          from: { opacity: "1", transform: "translateY(0)" },
          to: { opacity: "0", transform: "translateY(4px)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.96)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "scale-out": {
          from: { opacity: "1", transform: "scale(1)" },
          to: { opacity: "0", transform: "scale(0.96)" },
        },
        "slide-in-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "slide-out-right": {
          from: { transform: "translateX(0)" },
          to: { transform: "translateX(100%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in var(--duration-base) var(--ease-standard)",
        "fade-out": "fade-out var(--duration-base) var(--ease-standard)",
        "scale-in": "scale-in var(--duration-fast) var(--ease-standard)",
        "scale-out": "scale-out var(--duration-fast) var(--ease-standard)",
        "slide-in-right": "slide-in-right var(--duration-base) var(--ease-standard)",
        "slide-out-right": "slide-out-right var(--duration-base) var(--ease-standard)",
        shimmer: "shimmer 1.2s ease-in-out infinite",
        enter: "fade-in var(--duration-base) var(--ease-standard), scale-in var(--duration-fast) var(--ease-standard)",
        exit: "fade-out var(--duration-base) var(--ease-standard), scale-out var(--duration-fast) var(--ease-standard)",
      },
      
      /* Min heights for touch targets */
      minHeight: {
        touch: "44px",
      },
      minWidth: {
        touch: "44px",
      },
      
      /* Grid Templates */
      gridTemplateColumns: {
        appointments: "1.3fr 1.2fr 1fr 1fr 0.8fr 0.9fr 220px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
