/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'sans-serif'],
      },
      colors: {
        alo: {
          teal: '#0D9488',
          dark: '#0F172A',
          navy: '#1E293B',
          accent: '#0284C7',
          gold: '#D97706',
          success: '#16A34A',
          warning: '#EA580C',
        }
      }
    },
  },
  plugins: [],
}
