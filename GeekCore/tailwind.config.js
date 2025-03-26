/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        'primary': '#e50914', // Vermelho Netflix
        'dark': '#141414',
        'darker': '#000000',
        'light': '#e5e5e5',
        'hover': '#b2070f' // Vermelho mais escuro para hover
      }
    }
  },
  plugins: []
}
