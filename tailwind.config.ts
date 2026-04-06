import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['var(--font-sans)', 'DM Sans', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'Syne', 'sans-serif'],
      },
      colors: {
        midnight: {
          50: '#eaedf5',
          100: '#c5cce3',
          200: '#9fabd1',
          300: '#7889be',
          400: '#5268ac',
          500: '#3a4f8f',
          600: '#2d3d72',
          700: '#1f2b55',
          800: '#131b38',
          900: '#090e1e',
          950: '#050913',
        },
        crimson: {
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        jade: {
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
        },
        amber: {
          400: '#fbbf24',
          500: '#f59e0b',
        },
        surface: '#0d1117',
        'surface-2': '#161b25',
        'surface-3': '#1e2535',
        'surface-4': '#252d40',
        'border-dim': 'rgba(255,255,255,0.06)',
        'border-mid': 'rgba(255,255,255,0.12)',
        'border-bright': 'rgba(255,255,255,0.2)',
      },
      backgroundImage: {
        'grid-pattern': 'linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '48px 48px',
      },
      animation: {
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'fade-in': 'fadeIn .3s ease-out',
        'slide-up': 'slideUp .25s ease-out',
      },
      keyframes: {
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
        fadeIn: { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
export default config
