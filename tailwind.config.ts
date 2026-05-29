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
        bg: '#08040f',
        surface: '#100820',
        surface2: '#180c30',
        primary: '#8060ff',
        primary2: '#60a0ff',
        'text-main': '#c0d8ff',
        'text-secondary': '#d0c8f0',
        muted: '#5a4a8a',
      },
    },
  },
  plugins: [],
};

export default config;
