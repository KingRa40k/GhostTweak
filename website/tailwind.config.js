/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'Menlo', 'monospace'],
        geist: ['var(--font-sans)', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border, 240 3.7% 15.9%))",
        input: "hsl(var(--input, 240 3.7% 15.9%))",
        ring: "hsl(var(--ring, 240 4.9% 83.9%))",
        background: "hsl(var(--background, 240 10% 3.9%))",
        foreground: "hsl(var(--foreground, 0 0% 98%))",
        primary: {
          DEFAULT: "hsl(var(--primary, 0 0% 98%))",
          foreground: "hsl(var(--primary-foreground, 240 5.9% 10%))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary, 240 3.7% 15.9%))",
          foreground: "hsl(var(--secondary-foreground, 0 0% 98%))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive, 0 62.8% 30.6%))",
          foreground: "hsl(var(--destructive-foreground, 0 0% 98%))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted, 240 3.7% 15.9%))",
          foreground: "hsl(var(--muted-foreground, 240 5% 64.9%))",
        },
        obsidian: {
          950: '#060708',
          900: '#08090a',
          850: '#0d0e11',
          800: '#14161b',
        },
        steel: {
          900: '#13161c',
          800: '#1e222b',
          700: '#2a2f3d',
          600: '#3a4154',
          500: '#545e75',
          400: '#7b87a1',
          300: '#a6b2cc',
          200: '#cbd5e1',
          100: '#f1f5f9',
        },
        accent: {
          DEFAULT: 'rgb(var(--accent-rgb, 0 240 255) / <alpha-value>)',
          glow: 'var(--accent-glow, 0 0 24px rgba(0, 240, 255, 0.35))',
        },
        emerald: {
          glow: '0 0 24px rgba(16, 185, 129, 0.35)',
        },
      },
      boxShadow: {
        'bezel': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 0 rgba(0, 0, 0, 0.7)',
        'satin': '0 20px 40px -15px rgba(0, 0, 0, 0.8), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
        'accent-glow': 'var(--accent-glow, 0 0 24px rgba(0, 240, 255, 0.35))',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
        'fade-in': 'fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-up': 'fade-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.5 },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
