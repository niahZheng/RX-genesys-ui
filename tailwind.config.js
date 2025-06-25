/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [ "./src/**/*.{js,jsx,ts,tsx}",],
  theme: {
    extend: {
      fontFamily: {
        'loew-riyadh': ['LoewRiyadhAir-Regular', 'sans-serif'],
        'loew-riyadh-light': ['LoewRiyadhAir-Light', 'sans-serif'],
        'loew-riyadh-bold': ['LoewRiyadhAir-Bold', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

