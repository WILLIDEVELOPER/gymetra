/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
        },
        dark: {
          50:  '#1A2035',
          100: '#151C2E',
          200: '#111827',
          300: '#0D1321',
          400: '#0A0F1E',
          500: '#070B15',
        },
        accent: {
          blue:   '#3B82F6',
          cyan:   '#06B6D4',
          purple: '#8B5CF6',
          green:  '#10B981',
          orange: '#F59E0B',
          red:    '#EF4444',
        },
        surface: {
          100: '#1E2A3A',
          200: '#1A2235',
          300: '#16192D',
        },
      },
    },
  },
  plugins: [],
};
