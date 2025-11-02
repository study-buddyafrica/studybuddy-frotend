module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './public/index.html'
  ],
  theme: {
    extend: {
      fontFamily: {
        // Define your custom font families
        lilita: ['Lilita One', 'sans-serif'],
        josefin: ['Josefin Sans', 'sans-serif'],
        rowdies: ['Rowdies', 'sans-serif'], // Added Rowdies font
      },
    }
  },
  plugins: [],
}
