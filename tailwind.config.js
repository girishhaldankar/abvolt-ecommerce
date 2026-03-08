/** @type {import('tailwindcss').Config} */
module.exports = {
  // Files Tailwind will scan for class names
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],

  // Dark mode using a class on a parent element
  darkMode: 'class', // no need for array unless you want multiple strategies

  // Classes to always include (useful for dynamic classes)
  safelist: [
    // Gradients
    "bg-gradient-to-br",

    // Any dynamic color patterns you might use
    {
      pattern: /(from|to)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(400|500|600|700)/,
    },
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Rajdhani", "sans-serif"],
      },

      // Custom colors using CSS variables (great for theming)
      colors: {
        bg: "var(--bg-color)",
        text: "var(--text-color)",
        card: "var(--card-bg)",
        border: "var(--border-color)",
      },
    },
  },

  plugins: [],
};
