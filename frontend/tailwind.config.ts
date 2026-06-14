import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        bg: {
          primary:   '#0C0C0E',
          secondary: '#131316',
          tertiary:  '#1A1A1F',
          hover:     '#21212A',
        },
        border: {
          subtle:  'rgba(255,255,255,0.06)',
          default: 'rgba(255,255,255,0.10)',
          strong:  'rgba(255,255,255,0.18)',
        },
        text: {
          primary:   '#FFFFFF',
          secondary: 'rgba(255,255,255,0.60)',
          muted:     'rgba(255,255,255,0.35)',
          disabled:  'rgba(255,255,255,0.20)',
        },
        brand: {
          50:  '#F0EFFE',
          100: '#DDD9FD',
          200: '#BBB4FB',
          400: '#7B6CF7',
          500: '#6356F5',
          600: '#4D42D4',
          700: '#3A30A8',
          800: '#29217C',
          900: '#1A1552',
        },
        success: '#22C55E',
        warning: '#F59E0B',
        error:   '#EF4444',
        info:    '#3B82F6',
      },
      animation: {
        'fade-in':    'fade-in 0.35s ease forwards',
        'slide-up':   'slide-up 0.4s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #7B6CF7 0%, #6356F5 100%)',
        'subtle-gradient': 'linear-gradient(180deg, rgba(99,86,245,0.06) 0%, transparent 100%)',
      },
    },
  },
  plugins: [],
}

export default config
