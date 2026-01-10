/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // CSU Primary Colors
        'csu-navy': '#002855',
        'csu-gold': '#C6AA76',
        // CSU Secondary Colors
        'csu-light-blue': '#77C5D5',
        'csu-teal': '#7FA9AE',
        'csu-lime': '#C5E86C',
        'csu-pale-blue': '#BBDDE6',
        'csu-yellow': '#F1B434',
        'csu-orange': '#FF5C39',
        // CSU Neutral Colors
        'csu-lightest-gray': '#DDE5ED',
        'csu-beige': '#DFD1A7',
        'csu-light-gray': '#D0D3D4',
        'csu-medium-gray': '#A2AAAD',
        'csu-dark-gray': '#5B6770',
        'csu-near-black': '#1D252D',
      },
      fontFamily: {
        sans: ['Helvetica', 'Arial', 'sans-serif'],
      },
      width: {
        'module-panel': '300px',
      },
      minWidth: {
        'module-panel': '300px',
      },
      maxWidth: {
        'module-panel': '300px',
      },
    },
  },
  plugins: [],
}
