/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'lol-gold': '#C89B3C',
        'lol-blue': '#0AC8B9',
        'lol-dark': '#010A13',
        'lol-gray': '#1E2328',
      },
    },
  },
  plugins: [],
}
