import type { Config } from 'tailwindcss';

/**
 * Configuration Tailwind alternative avec la palette "Deep Ocean"
 *
 * Cette configuration propose une palette de couleurs élégante basée sur
 * des tons bleu-marine sophistiqués, se différenciant complètement de
 * la palette verte actuelle tout en conservant le même niveau d'élégance.
 *
 * PALETTE "DEEP OCEAN" :
 * =====================
 *
 * Primaires (remplace les verts) :
 * - #2C5282 : Bleu marine profond (remplace #2E7D5E)
 * - #1E3A5F : Bleu marine très sombre (remplace #1B4F3F)
 * - #F5F8FA : Blanc cassé bleuté (remplace #FAFBFC)
 *
 * Secondaires (remplace les sage greens) :
 * - #5A7BA6 : Bleu clair (remplace #4A9B7B)
 * - #E8EEF5 : Bleu très pâle (remplace #E8F3EF)
 * - #B8C8DC : Bleu-gris doux (remplace #B8D4C7)
 *
 * Accents :
 * - #3B7EA1 : Teal-blue vif (remplace #00A693)
 * - #7FA9C9 : Bleu ciel (remplace #7FD1C1)
 * - #E87A5D : Coral chaleureux (remplace #F4A261)
 * - #D4A574 : Gold (conservé)
 *
 * Cette palette maintient :
 * ✓ Des tons naturels et professionnels
 * ✓ Une hiérarchie visuelle claire
 * ✓ Un excellent contraste pour l'accessibilité
 * ✓ Une sensation de confiance et de sérénité
 */

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Palette de couleurs "Deep Ocean"
      colors: {
        // Couleurs primaires - Bleu Marine
        primary: {
          DEFAULT: '#2C5282', // Bleu marine profond (remplace #2E7D5E)
          white: '#F5F8FA', // Blanc cassé bleuté (remplace #FAFBFC)
          dark: '#1E3A5F', // Bleu marine très sombre (remplace #1B4F3F)
        },
        // Couleurs secondaires - Bleus doux
        secondary: {
          DEFAULT: '#5A7BA6', // Bleu clair (remplace #4A9B7B)
          pale: '#E8EEF5', // Bleu très pâle (remplace #E8F3EF)
          sage: '#B8C8DC', // Bleu-gris doux (remplace #B8D4C7)
        },
        // Couleurs d'accent
        accent: {
          teal: '#3B7EA1', // Teal-blue vif (remplace #00A693)
          mint: '#7FA9C9', // Bleu ciel (remplace #7FD1C1)
          orange: '#E87A5D', // Coral chaleureux (remplace #F4A261)
          gold: '#D4A574', // Gold (conservé)
        },
        // Couleurs fonctionnelles (conservées)
        functional: {
          success: '#22C55E',
          error: '#EF4444',
          warning: '#F59E0B',
          info: '#3B82F6',
        },
        success: '#22C55E',
        // Couleurs neutres (légèrement ajustées)
        neutral: {
          light: '#F8F9FA',
          medium: '#9CA3AF',
          dark: '#374151',
          border: '#E5E7EB',
        },
        // Couleurs d'arrière-plan
        background: {
          primary: '#FFFFFF',
          secondary: '#F8FAFB',
          accent: '#EEF2F7', // Légèrement plus bleuté
        },
        // Échelle de bleus pour remplacer les sage
        ocean: {
          50: '#F5F8FA',
          100: '#E8EEF5',
          200: '#B8C8DC',
          300: '#9DB4CC',
          400: '#7FA9C9',
          500: '#5A7BA6',
          600: '#4A6B8E',
          700: '#3A5576',
          800: '#2C5282',
          900: '#1E3A5F',
        },
      },
      // Configuration de la typographie (identique)
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
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
      fontSize: {
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
      borderRadius: {
        '8dp': '8px',
        '12dp': '12dp',
        '16dp': '16px',
        '22dp': '22px',
      },
      boxShadow: {
        'card-primary': '0 2px 12px rgba(44, 82, 130, 0.08)', // Bleu au lieu de noir
        'card-dashboard': '0 1px 8px rgba(44, 82, 130, 0.06)',
        focus: '0 0 0 2px rgba(44, 82, 130, 0.2)', // Bleu marine
      },
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
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
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
      width: {
        '240dp': '240px',
        '280dp': '280px',
      },
    },
  },
  plugins: [
    function ({ addBase, theme }: any) {
      addBase({
        ':root': {
          // Variables CSS avec la palette "Deep Ocean"
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
        '.dark': {
          '--color-primary': '#5A7BA6',
          '--color-primary-white': '#1E3A5F',
          '--color-primary-dark': '#2C5282',
          '--color-secondary': '#7FA9C9',
          '--color-secondary-pale': '#1F2937',
          '--color-secondary-sage': '#374151',
          '--color-accent-teal': '#3B7EA1',
          '--color-accent-mint': '#7FA9C9',
          '--color-accent-orange': '#E87A5D',
          '--color-functional-success': '#22C55E',
          '--color-functional-error': '#EF4444',
          '--color-functional-warning': '#F59E0B',
          '--color-functional-info': '#3B82F6',
          '--color-background-primary': '#1F2937',
          '--color-background-secondary': '#111827',
          '--color-background-accent': '#374151',
          '--color-neutral-light': '#374151',
          '--color-neutral-medium': '#9CA3AF',
          '--color-neutral-dark': '#F9FAFB',
          '--color-neutral-border': '#4B5563',
        },
      });
    },
  ],
};

export default config;
