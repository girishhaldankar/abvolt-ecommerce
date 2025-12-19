/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],   // body text
        display: ['Rajdhani', 'sans-serif'],             // headings
      },
       colors: {
        bg: "var(--bg-color)",
        text: "var(--text-color)",
        card: "var(--card-bg)",
        border: "var(--border-color)"
      }
    },
  },
  plugins: [],
}
