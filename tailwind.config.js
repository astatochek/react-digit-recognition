/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        'mega-xl': ['16rem', '13rem'],
      },
      colors: {
        'github-dark-deep': '#010409',
        'github-dark-gray': '#0d1117',
        'github-gray': '#21262d',
      }
    }
  },
  plugins: [],
}
