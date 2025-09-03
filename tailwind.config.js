/** @type {import('tailwindcss').Config} */
export default {
  // Wir machen die Pfade expliziter, um sicherzustellen,
  // dass alle relevanten Dateien gescannt werden.
  content: ["./index.html", "./src/auth.js", "./src/ui/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
