/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'sans-serif'],
      },
      colors: {
        'mailmind': {
          bg: '#191d2b',
          card: '#1f2333',
          orange: '#fa992b',
          pink: '#d53158',
          teal: '#04b7b0',
          'text-light': '#e6e6e8',
          'text-muted': '#9ea3b0',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #fa992b 0%, #d53158 100%)',
        'gradient-chat-user': 'linear-gradient(135deg, #fa992b 0%, #d53158 100%)',
      },
      boxShadow: {
        'glow-orange': '0 0 20px rgba(250, 153, 43, 0.3)',
        'glow-pink': '0 0 20px rgba(213, 49, 88, 0.3)',
        'glow-teal': '0 0 20px rgba(4, 183, 176, 0.3)',
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    },
  },
  plugins: [],
}

