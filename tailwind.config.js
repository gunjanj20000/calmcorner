/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        calm: {
          bg: '#F4F7F6',
          card: '#FFFFFF',
          text: '#2D3748',
          blue: '#A0C4E2',
          teal: '#98D7C2',
          sage: '#B5D5C5',
          lavender: '#C8B6FF',
          peach: '#FFD1BA',
          amber: '#FDE49E',
          sky: '#BEE1E6',
          rose: '#F1C0B9',
          darkBg: '#121820',
          darkCard: '#1E293B',
          darkText: '#E2E8F0',
        }
      },
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
