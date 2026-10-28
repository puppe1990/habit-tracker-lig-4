/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        felt: "var(--felt)",
        ink: "var(--ink)",
        muted: "var(--muted)",
        board: {
          DEFAULT: "var(--board)",
          hi: "var(--board-hi)",
          lo: "var(--board-lo)",
        },
        well: "var(--well)",
        panel: "var(--panel)",
        gold: "var(--gold)",
        disc: {
          done: "var(--disc-done)",
          missed: "var(--disc-missed)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Impact", "sans-serif"],
      },
      boxShadow: {
        board: "0 28px 60px rgba(6, 18, 48, 0.38), inset 0 2px 0 rgba(255,255,255,0.26)",
        disc: "inset 0 3px 5px rgba(255,255,255,0.45), inset 0 -5px 8px rgba(0,0,0,0.28), 0 2px 0 rgba(0,0,0,0.22)",
      },
    },
  },
  plugins: [],
};
