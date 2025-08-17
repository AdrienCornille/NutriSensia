import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Palette de couleurs personnalisée pour NutriSensia
        primary: {
          DEFAULT: '#2E7D5E', // Vert principal
          light: '#4A9B7A',
          dark: '#1E5A3E',
        },
        background: {
          DEFAULT: '#FAFBFC', // Fond principal
          secondary: '#F8F9FA',
        },
        accent: {
          DEFAULT: '#FF6B35', // Orange accent
          light: '#FF8A5C',
          dark: '#E55A2B',
        },
        neutral: {
          DEFAULT: '#6B7280', // Gris neutre
          light: '#9CA3AF',
          dark: '#4B5563',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
