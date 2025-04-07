/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'whatsapp': {
          'light-green': '#25D366',
          'teal-green': '#128C7E',
          'teal-green-dark': '#075E54',
          'chat-bg': '#e5ddd5',
          'chat-bg-dark': '#0c1317',
          'message-out': '#dcf8c6',
          'message-in': '#ffffff',
          'message-out-dark': '#025c4b',
          'message-in-dark': '#202c33'
        }
      }
    },
  },
  plugins: [],
} 