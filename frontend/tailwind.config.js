/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        lubri: {
          bg: '#0A0E1A',
          card: '#141A29',
          cardBorder: '#222D46',
          header: '#0D111D',
          gold: '#FFB800',
          goldHover: '#E0A200',
          emerald: '#00C897',
          emeraldHover: '#00B084',
          danger: '#EF4444',
          input: '#1B2237',
          textMuted: '#94A3B8',
        },
      },
    },
  },
  plugins: [],
}
