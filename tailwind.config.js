/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        black: '#262626',
        'global-bg': '#fef0d2',
        'chat-bg': '#fdedc9',
        'sidebar-bg': '#fde1bf',
        'other-message': '#fed2d3',
        'my-message': '#fcdcca',
        'ai-message': '#feefdc',
        'input-bg': '#feefdc',
        'send-button': '#fbc888',
        'loading-color': '#f16e27',
      },
      keyframes: {
        rotation: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'loading-spin': 'rotation 1s linear infinite',
      },
    },
  },
  plugins: [],
};
