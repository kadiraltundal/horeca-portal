/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        pos: {
          sidebar: '#0f172a',
          'sidebar-hover': '#1e293b',
          'sidebar-active': '#1e40af',
          header: '#1e40af',
          success: '#16a34a',
          danger: '#dc2626',
          warning: '#eab308',
          info: '#0ea5e9',
        },
      },
    },
  },
  plugins: [],
};
