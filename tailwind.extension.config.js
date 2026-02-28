/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './chrome-extension/popup.html',
    './chrome-extension/popup.js',
  ],
  corePlugins: {
    preflight: false,
  },
  theme: {
    extend: {},
  },
  plugins: [],
};
