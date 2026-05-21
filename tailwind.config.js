/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FFF8F0',
        coral: '#FF9A8B',
        mint: '#A8E6CF',
        sky: '#B6CED9',
        brown: '#8B6F47',
        text: '#2D2D2D',
      },
      borderRadius: {
        card: '20px',
        button: '16px',
      },
      fontFamily: {
        base: ['Pretendard', 'system-ui', 'sans-serif'],
        score: ['DungGeunMo', 'monospace'],
      },
    },
  },
  plugins: [],
}
