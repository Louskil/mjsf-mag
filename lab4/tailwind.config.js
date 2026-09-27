/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      spacing: {
        11: '44px',
      },
      colors: {
        page: 'var(--color-page)',
        surface: 'var(--color-surface)',
        ink: 'var(--color-ink)',
        muted: 'var(--color-muted)',
        line: 'var(--color-line)',
        accent: 'var(--color-accent)',
        vue: 'var(--color-vue)',
        html: 'var(--color-html)',
        css: 'var(--color-css)',
        js: 'var(--color-javascript)',
      },
    },
  },
  plugins: [],
}
