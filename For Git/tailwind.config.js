/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      colors: {
        titanium: {
          950: '#07080b',
          900: '#0d0f14',
          850: '#11141b',
          800: '#161922',
          700: '#202532',
          600: '#2d3345',
          500: '#475066',
          400: '#717c96',
          300: '#9aa5bd',
          200: '#cbd5e1',
          100: '#f1f5f9',
        },
        ghost: {
          bg: '#07080b',
          surface: '#0d0f14',
          card: '#11141b',
          border: '#1c202b',
          hover: '#181b24',
          text: '#f1f5f9',
          muted: '#717c96',
          accent: 'rgb(var(--accent-rgb, 0 240 255) / <alpha-value>)',
          neon: 'rgb(var(--accent-rgb, 0 240 255) / <alpha-value>)',
          cyan: 'rgb(var(--accent-rgb, 0 240 255) / <alpha-value>)',
          emerald: '#10b981',
          green: '#10b981',
          red: '#f43f5e',
          orange: '#f59e0b',
          gold: '#eab308',
        },
      },
      boxShadow: {
        'satin': '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'bezel': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), inset 0 -1px 0 0 rgba(0, 0, 0, 0.6)',
        'cyan-glow': 'var(--accent-glow, 0 0 24px rgba(0, 240, 255, 0.25))',
        'emerald-glow': '0 0 24px rgba(16, 185, 129, 0.2)',
        'card': '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        'pulse-subtle': 'pulse-subtle 3s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scale-in 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'slot-blink': 'slot-blink 1s ease-in-out infinite',
      },
      keyframes: {
        'pulse-subtle': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.6 },
        },
        'fade-in': {
          '0%': { opacity: 0, transform: 'translateY(6px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: 0, transform: 'scale(0.97)' },
          '100%': { opacity: 1, transform: 'scale(1)' },
        },
        'slot-blink': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.2 },
        },
      },
    },
  },
  plugins: [],
};
