/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontSize: {
        "18xl": "16rem",
      },
      colors: {
        "magenta-tint-10": "rgb(222 51 187)",
        "brand-purple-tint-20": "rgb(151 128 229)",
        "cyan-tint-20": "rgb(126 218 227)",
        "flamingo-tint-20": "rgb(250 151 161)",
        "neutrals-light-grey-26": "rgb(66 66 66)",
        "neutrals-additionals-grey-16": "rgb(41 41 41)",
        "neutrals-additionals-grey-12": "rgb(31 31 31)"
      },
    },
  },
  plugins: [],
};
