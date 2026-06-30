/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        casa: {
          dark: '#1e1e2e',
          darker: '#11111b',
          light: '#cdd6f4',
          accent: '#89b4fa',
          hover: '#313244'
        }
      }
    },
  },
  plugins: [],
}
