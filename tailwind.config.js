import layout from './src/lib/ResponsiveLayout.json';
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'selector',
  content: [
    './index.html', 
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: { screens: { desktop: `${layout.desktop}px` } },
  },
  plugins: [
    require('@vueform/slider/tailwind'),
    require("@tailwindcss/forms"),
  ],
}
