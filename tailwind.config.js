/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        arena: {
          midnight: '#1B1931',   // Deep midnight plum background
          aubergine: '#44174E',  // Dark aubergine surface / card
          berry: '#862249',      // Berry purple layered card / secondary
          rose: '#A34054',       // Muted rose accent / border
          peach: '#ED9E59',      // Warm peach primary CTA & rank highlight
          blush: '#E8BCB9',      // Soft blush text accent & subtle surface
          surface: '#241E3A',    // Slightly elevated surface
          card: '#2D1F44',       // Elevated container
          border: 'rgba(232, 188, 185, 0.15)',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-peach': '0 0 25px rgba(237, 158, 89, 0.35)',
        'glow-berry': '0 0 25px rgba(134, 34, 73, 0.4)',
        'card-elevated': '0 10px 30px -5px rgba(27, 25, 49, 0.6), 0 0 0 1px rgba(232, 188, 185, 0.08)',
      },
    },
  },
  plugins: [],
}
