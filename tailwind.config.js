/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          600: '#475569',
          500: '#64748B',
          400: '#94A3B8',
          300: '#CBD5E1',
          200: '#E2E8F0',
          100: '#F1F5F9',
          50: '#F8FAFC',
        },
        royal: {
          DEFAULT: '#1E3A8A',
          dark: '#1E40AF',
          light: '#3B82F6',
          50: '#EFF6FF',
        },
        teal: {
          corporate: '#0D9488',
          bright: '#14B8A6',
          light: '#5EEAD4',
          50: '#F0FDFA',
          100: '#CCFBF1',
        },
        emerald: {
          deep: '#065F46',
          mid: '#047857',
          bright: '#10B981',
          mint: '#D1FAE5',
          50: '#ECFDF5',
        },
        amber: {
          rich: '#B45309',
          light: '#FBBF24',
          pale: '#FEF3C7',
          50: '#FFFBEB',
        },
        indigo: {
          deep: '#4338CA',
          light: '#6366F1',
          electric: '#4F46E5',
        },
        accent: {
          blue: '#2563EB',
          sky: '#0EA5E9',
        },
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
        display: ['"Sora"', '"Inter"', 'ui-sans-serif', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(15 23 42 / 0.05), 0 1px 2px -1px rgb(15 23 42 / 0.04)',
        'card-md': '0 4px 16px -2px rgb(15 23 42 / 0.08), 0 2px 6px -2px rgb(15 23 42 / 0.04)',
        'card-lg': '0 12px 36px -6px rgb(15 23 42 / 0.10), 0 4px 12px -4px rgb(15 23 42 / 0.05)',
        'card-xl': '0 20px 56px -8px rgb(15 23 42 / 0.12), 0 8px 20px -6px rgb(15 23 42 / 0.06)',
        'emerald-glow': '0 0 0 3px rgb(16 185 129 / 0.15), 0 4px 16px -2px rgb(16 185 129 / 0.20)',
      },
      animation: {
        'scan': 'scan 4s linear infinite',
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'count-pop': 'countPop 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2.5s ease-in-out infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(2000%)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        countPop: {
          '0%': { transform: 'scale(0.92)' },
          '50%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};
