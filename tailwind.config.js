/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#22c55e',
        'primary-hover': '#16a34a',
        background: '#0a0a0a',
        surface: '#111111',
        'surface-hover': '#1a1a1a',
        border: 'rgba(255,255,255,0.05)',
        'border-active': 'rgba(34,197,94,0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
};