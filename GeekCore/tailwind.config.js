/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        'primary': '#e50914',
        'dark': '#141414',
        'darker': '#000000',
        'light': '#e5e5e5',
        'hover': '#b2070f'
      }
    }
  },
  plugins: [],
  purge: {
    enabled: process.env.NODE_ENV === 'production',
    content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
    options: {
      safelist: [
        'text-primary',
        'bg-primary',
        'hover:bg-hover'
      ]
    }
  }
}
