import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Palette de couleurs NutriSensia
      colors: {
        // Couleurs primaires
        primary: {
          DEFAULT: '#2E7D5E', // Primary Green
          white: '#FAFBFC', // Primary White
          dark: '#1B4F3F', // Primary Dark
        },
        // Couleurs secondaires
        secondary: {
          DEFAULT: '#4A9B7B', // Secondary Green Light
          pale: '#E8F3EF', // Secondary Green Pale
          sage: '#B8D4C7', // Sage Green
        },
        // Couleurs d'accent
        accent: {
          teal: '#00A693', // Accent Teal
          mint: '#7FD1C1', // Accent Mint
          orange: '#F4A261', // Accent Orange
        },
        // Couleurs fonctionnelles
        functional: {
          success: '#22C55E', // Success Green
          error: '#EF4444', // Error Red
          warning: '#F59E0B', // Warning Amber
          info: '#3B82F6', // Info Blue
        },
        // Couleurs neutres
        neutral: {
          light: '#F8F9FA', // Neutral Gray Light
          medium: '#9CA3AF', // Neutral Gray Medium
          dark: '#374151', // Neutral Gray Dark
          border: '#E5E7EB', // Neutral Gray Border
        },
        // Couleurs d'arrière-plan
        background: {
          primary: '#FFFFFF', // Background Primary
          secondary: '#F8FAFB', // Background Secondary
          accent: '#F0F7F4', // Background Accent
        },
      },
      // Configuration de la typographie
      fontFamily: {
        sans: [
          'Inter',
          'SF Pro Text',
          'Roboto',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
      // Poids de police
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      // Tailles de texte personnalisées
      fontSize: {
        // En-têtes
        h1: [
          '32px',
          { lineHeight: '40px', letterSpacing: '-0.3px', fontWeight: '700' },
        ],
        h2: [
          '28px',
          { lineHeight: '36px', letterSpacing: '-0.2px', fontWeight: '700' },
        ],
        h3: [
          '24px',
          { lineHeight: '32px', letterSpacing: '-0.1px', fontWeight: '600' },
        ],
        h4: [
          '20px',
          { lineHeight: '28px', letterSpacing: '0px', fontWeight: '600' },
        ],
        // Texte du corps
        'body-large': [
          '18px',
          { lineHeight: '28px', letterSpacing: '0px', fontWeight: '400' },
        ],
        body: [
          '16px',
          { lineHeight: '24px', letterSpacing: '0px', fontWeight: '400' },
        ],
        'body-small': [
          '14px',
          { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '400' },
        ],
        // Texte spécial
        caption: [
          '12px',
          { lineHeight: '16px', letterSpacing: '0.3px', fontWeight: '500' },
        ],
        button: [
          '16px',
          { lineHeight: '24px', letterSpacing: '0.2px', fontWeight: '500' },
        ],
        link: [
          '16px',
          { lineHeight: '24px', letterSpacing: '0px', fontWeight: '500' },
        ],
        label: [
          '14px',
          { lineHeight: '20px', letterSpacing: '0.1px', fontWeight: '500' },
        ],
      },
      // Système d'espacement NutriSensia (en pixels)
      spacing: {
        '2dp': '2px',
        '4dp': '4px',
        '8dp': '8px',
        '12dp': '12px',
        '16dp': '16px',
        '24dp': '24px',
        '32dp': '32px',
        '48dp': '48px',
        '64dp': '64px',
      },
      // Bordures personnalisées
      borderRadius: {
        '8dp': '8px',
        '12dp': '12px',
        '16dp': '16px',
        '22dp': '22px',
      },
      // Ombres personnalisées
      boxShadow: {
        'card-primary': '0 2px 12px rgba(0, 0, 0, 0.08)',
        'card-dashboard': '0 1px 8px rgba(0, 0, 0, 0.06)',
        focus: '0 0 0 2px rgba(46, 125, 94, 0.2)', // Primary Green avec 20% d'opacité
      },
      // Animations et transitions
      transitionDuration: {
        standard: '200ms',
        emphasis: '300ms',
        micro: '150ms',
        page: '350ms',
        loading: '1200ms',
      },
      transitionTimingFunction: {
        standard: 'ease-out',
        emphasis: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
        micro: 'ease-in-out',
        page: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        loading: 'linear',
      },
      // Hauteurs personnalisées pour les composants
      height: {
        '44dp': '44px',
        '48dp': '48px',
        '56dp': '56px',
        '72dp': '72px',
        '96dp': '96px',
      },
      minHeight: {
        '96dp': '96px',
      },
      // Largeurs personnalisées
      width: {
        '240dp': '240px',
        '280dp': '280px',
      },
      // Variables CSS pour le thème dynamique
      cssVariables: {
        '--color-primary': '#2E7D5E',
        '--color-primary-white': '#FAFBFC',
        '--color-primary-dark': '#1B4F3F',
        '--color-secondary': '#4A9B7B',
        '--color-secondary-pale': '#E8F3EF',
        '--color-secondary-sage': '#B8D4C7',
        '--color-accent-teal': '#00A693',
        '--color-accent-mint': '#7FD1C1',
        '--color-accent-orange': '#F4A261',
        '--color-functional-success': '#22C55E',
        '--color-functional-error': '#EF4444',
        '--color-functional-warning': '#F59E0B',
        '--color-functional-info': '#3B82F6',
        '--color-neutral-light': '#F8F9FA',
        '--color-neutral-medium': '#9CA3AF',
        '--color-neutral-dark': '#374151',
        '--color-neutral-border': '#E5E7EB',
        '--color-background-primary': '#FFFFFF',
        '--color-background-secondary': '#F8FAFB',
        '--color-background-accent': '#F0F7F4',
      },
    },
  },
  plugins: [
    // Plugin pour les variables CSS
    function ({ addBase, theme }: any) {
      addBase({
        ':root': {
          '--color-primary': theme('colors.primary.DEFAULT'),
          '--color-primary-white': theme('colors.primary.white'),
          '--color-primary-dark': theme('colors.primary.dark'),
          '--color-secondary': theme('colors.secondary.DEFAULT'),
          '--color-secondary-pale': theme('colors.secondary.pale'),
          '--color-secondary-sage': theme('colors.secondary.sage'),
          '--color-accent-teal': theme('colors.accent.teal'),
          '--color-accent-mint': theme('colors.accent.mint'),
          '--color-accent-orange': theme('colors.accent.orange'),
          '--color-functional-success': theme('colors.functional.success'),
          '--color-functional-error': theme('colors.functional.error'),
          '--color-functional-warning': theme('colors.functional.warning'),
          '--color-functional-info': theme('colors.functional.info'),
          '--color-neutral-light': theme('colors.neutral.light'),
          '--color-neutral-medium': theme('colors.neutral.medium'),
          '--color-neutral-dark': theme('colors.neutral.dark'),
          '--color-neutral-border': theme('colors.neutral.border'),
          '--color-background-primary': theme('colors.background.primary'),
          '--color-background-secondary': theme('colors.background.secondary'),
          '--color-background-accent': theme('colors.background.accent'),
        },
        // Mode sombre
        '.dark': {
          '--color-primary': '#4A9B7B',
          '--color-primary-white': '#1B4F3F',
          '--color-primary-dark': '#2E7D5E',
          '--color-background-primary': '#1F2937',
          '--color-background-secondary': '#111827',
          '--color-background-accent': '#374151',
          '--color-neutral-light': '#374151',
          '--color-neutral-medium': '#6B7280',
          '--color-neutral-dark': '#F9FAFB',
          '--color-neutral-border': '#4B5563',
        },
      });
    },
  ],
};

export default config;
