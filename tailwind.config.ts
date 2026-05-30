import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Russo One"', 'sans-serif'],
        body: ['"Chakra Petch"', 'sans-serif'],
      },
      colors: {
        bg:               'rgb(var(--c-bg) / <alpha-value>)',
        surface:          'rgb(var(--c-surface) / <alpha-value>)',
        surface2:         'rgb(var(--c-surface2) / <alpha-value>)',
        primary:          'rgb(var(--c-primary) / <alpha-value>)',
        primary2:         'rgb(var(--c-primary2) / <alpha-value>)',
        'text-main':      'rgb(var(--c-text-main) / <alpha-value>)',
        'text-secondary': 'rgb(var(--c-text-secondary) / <alpha-value>)',
        muted:            'rgb(var(--c-muted) / <alpha-value>)',
      },
    },
  },
  plugins: [],
};

export default config;
