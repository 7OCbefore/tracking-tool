import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: '#2563eb',
        'brand-light': '#eff6ff',
        danger: '#ef4444',
        success: '#22c55e',
      },
      fontFamily: {
        mono: ['"SF Mono"', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
