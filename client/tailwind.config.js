/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#050505',
        surface: '#111111',
        primary: '#00F0FF',
        secondary: '#0055FF',
        textMain: '#FFFFFF',
        textMuted: '#A0A0A0',
        glass: 'rgba(255, 255, 255, 0.05)',
        glassBorder: 'rgba(255, 255, 255, 0.1)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'glow-gradient': 'radial-gradient(circle at center, rgba(0, 240, 255, 0.15) 0%, rgba(0, 0, 0, 0) 50%)',
      }
    },
  },
  plugins: [],
}
