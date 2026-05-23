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
        bg: {
          light: '#F6F1EC',
          dark: '#0E0B14',
        },
        elev: {
          light: '#FFFFFF',
          dark: '#18131F',
        },
        deep: {
          light: '#ECE3DC',
          dark: '#07050B',
        },
        ink: {
          DEFAULT: '#1A1418',
          2: '#4A3F46',
          3: '#8A7B82',
          4: '#B8AAB1',
          light: '#1A1418',
          dark: '#F4EEF1',
        },
        accent: {
          DEFAULT: '#7A1F3D',
          2: '#C0395E',
          3: '#E8AFA0',
        },
        pos: '#1F6B4A',
        warn: '#9A6B14',
        neg: '#8E2A2A',
      },
      fontFamily: {
        display: ["'Instrument Serif'", "Georgia", "serif"],
        ui: ["'Inter Tight'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["'JetBrains Mono'", "ui-monospace", "SF Mono", "monospace"],
      },
      borderRadius: {
        'sm': '10px',
        'md': '16px',
        'lg': '22px',
        'xl': '28px',
      },
      boxShadow: {
        'shd-1': '0 1px 2px rgba(26,20,24,.04), 0 6px 16px rgba(26,20,24,.06)',
        'shd-2': '0 1px 2px rgba(26,20,24,.06), 0 10px 32px rgba(26,20,24,.10)',
      }
    },
  },
  plugins: [],
}
