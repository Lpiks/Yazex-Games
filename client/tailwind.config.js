/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'pirate-dark': '#1A1A1B',
        'pirate-gold': '#C5A367',
        'pirate-paper': '#F5F2ED',
        'abyss-black': '#0e0e10',
        'ultras-red': '#E53E3E',
        'ultras-green': '#38A169',
        'smoke-glow': '#FF5722',
      },
      fontFamily: {
        heading: ['Staatliches', 'sans-serif'],
        body: ['Montserrat', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      boxShadow: {
        'gold-glow': '0 0 25px rgba(197, 163, 103, 0.45)',
        'fumi-glow': '0 0 30px rgba(229, 62, 62, 0.6)',
      }
    },
  },
  plugins: [],
}
