/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  corePlugins: {preflight: false},
  theme: {
    extend: {
      spacing: {
        11: '44px',
      },
    },
  },
  plugins: [],
}

