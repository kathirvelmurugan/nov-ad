/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'Segoe UI', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        alo: {
          canvas: '#F8FAFC',
          canvasMobile: '#F4F6F9',
          card: '#FFFFFF',
          navy: '#0F233C',
          navyDeep: '#0B1B2B',
          gold: '#C9A227',
          teal: '#007B6E',
          tealDeep: '#0C7F9C',
          aqua: '#00C6AE',
          mint: '#E6FAF7',
          mintDark: '#0E4A48',
          darkCanvas: '#081716',
          darkCard: '#0F2422',
          darkBorder: '#1E433E',
          whatsapp: '#25D366',
          amber: '#F59E0B',
          rose: '#EF4444',
          slateText: '#475569',
        }
      }
    },
  },
  plugins: [],
}
