/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0A1F44', // Deep Navy
        background: '#F5F6F8', // Cool Light Gray
        surface: '#FFFFFF', // White
        text: '#2C2C2C', // Charcoal
        accent: {
          1: '#2ECC71', // Emerald Green
          2: '#F4C542', // Modern Gold
          3: '#2D9CDB', // Sky Blue
        },
        error: '#E74C3C', // Red
        warning: '#F39C12', // Orange
        success: '#27AE60', // Green
      },
    },
  },
  plugins: [],
}