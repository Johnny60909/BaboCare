/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'babo-bg': '#FDFBF7',
        'babo-light': '#F3F4F6',
        'babo-text': '#4A4A4A',
        'babo-text-light': '#999999',
        'babo-primary': '#3B82F6',
        'babo-green': '#A7D397',
        'babo-purple': '#A084E8',
        'babo-yellow': '#FBBF24',
        'babo-orange': '#F97316',
      },
      fontFamily: {
        'noto-tc': ["'Noto Sans TC'", '-apple-system', 'BlinkMacSystemFont', "'Segoe UI'", 'Roboto', 'sans-serif'],
      },
      borderRadius: {
        '3xl': '32px',
      },
      boxShadow: {
        'ios': '0 10px 25px -5px rgba(0, 0, 0, 0.05)',
      },
      scale: {
        '98': '0.98',
      },
    },
  },
  plugins: [],
}
