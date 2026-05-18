import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // Configuration pour détecter le mode sombre via la classe CSS
  theme: {
    extend: {
      // Palette de couleurs NutriSensia - MÉDITERRANÉE 🌊
      colors: {
        // Couleurs primaires - Turquoise Azur
        primary: {
          DEFAULT: '#1B998B', // Primary Turquoise
          white: '#FDFCFB', // Primary White (warm)
          dark: '#147569', // Primary Dark
          darker: '#0F5F56', // Primary Darker (hover)
          light: '#2EC4B6', // Primary Light
          pale: '#F0F9F8', // Primary Pale
        },
        // Couleurs secondaires - Sable Doré
        secondary: {
          DEFAULT: '#E9C46A', // Secondary Sand Gold
          pale: '#F8F5F2', // Secondary Cream
          sage: '#E5DED6', // Beige Sand
          light: '#F4D6A0', // Light Sand
          dark: '#D4A84E', // Dark Sand
        },
        // Couleurs d'accent - Terracotta & Méditerranée
        accent: {
          teal: '#2EC4B6', // Accent Turquoise Vif
          mint: '#78CFC6', // Accent Turquoise Clair
          orange: '#E76F51', // Accent Terracotta
          gold: '#E9C46A', // Accent Sable Doré
          terracotta: '#E76F51', // Terracotta principal
        },
        // Couleurs fonctionnelles
        functional: {
          success: '#22C55E', // Success Green
          error: '#EF4444', // Error Red
          warning: '#F59E0B', // Warning Amber
          info: '#3B82F6', // Info Blue
        },
        // Alias pour compatibilité
        success: '#22C55E',
        // Couleurs neutres - Beige Méditerranéen
        neutral: {
          light: '#FBF9F7', // Neutral Cream Light
          medium: '#A89888', // Neutral Beige Medium
          dark: '#524A42', // Neutral Brown Dark
          border: '#E5DED6', // Neutral Beige Border
        },
        // Couleurs d'arrière-plan - Crème & Blanc chaud
        background: {
          primary: '#FFFFFF', // Background Primary
          secondary: '#FBF9F7', // Background Secondary (warm cream)
          accent: '#F8F5F2', // Background Accent (warm)
        },
        // Échelle Turquoise pour éléments variés
        sage: {
          50: '#F0F9F8',
          100: '#D2EFEC',
          200: '#A5DFD9',
          300: '#78CFC6',
          400: '#2EC4B6',
          500: '#1B998B',
          600: '#147569',
          700: '#0F5F56',
          800: '#0A4A43',
          900: '#063530',
        },
        // Nouvelle échelle Beige/Sand
        sand: {
          50: '#FDFCFB',
          100: '#FBF9F7',
          200: '#F8F5F2',
          300: '#F0EBE5',
          400: '#E5DED6',
          500: '#D9CFC3',
          600: '#C4B5A5',
          700: '#A89888',
          800: '#7D7268',
          900: '#524A42',
        },
        // Échelle Terracotta
        terracotta: {
          50: '#FEF4F2',
          100: '#FCE4DF',
          200: '#F9C4B9',
          300: '#F3A08D',
          400: '#ED8872',
          500: '#E76F51',
          600: '#D35A3D',
          700: '#B04530',
          800: '#8D3725',
          900: '#6A291B',
        },
        // ────────────────────────────────────────────────────────────
        // DS v2 — Editorial sage / cream / peps + ink borders
        // Use these for ALL new work. The legacy palette above (primary
        // turquoise, sand, terracotta, sage, neutral) is kept only for
        // unmigrated screens and will be retired progressively.
        // Sage from DS v2 is intentionally NOT exposed on Tailwind to
        // avoid colliding with the legacy turquoise `sage` scale above.
        // Reach for `var(--ns-sage-500)` directly when you need it.
        // ────────────────────────────────────────────────────────────
        cream: {
          50: '#ffffff',
          100: '#faf6ea',
          200: '#f3ecd8',
          300: '#e8dec5',
        },
        ink: {
          DEFAULT: '#14160f',
          2: '#2a2d22',
          3: '#6b6d62',
          4: '#b3b3a8',
        },
        peps: {
          DEFAULT: '#c4f048',
          deep: '#9bd418',
          soft: '#e7f9b3',
        },
        coral: {
          DEFAULT: '#ff6b4a',
          soft: '#ffd8cc',
        },
        honey: '#f4b860',
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
        // DS v2 — display + script. Loaded via next/font in [locale]/layout.tsx
        serif: ['var(--ns-font-serif)', 'Fraunces', 'Georgia', 'serif'],
        script: ['var(--ns-font-script)', 'Caveat', 'cursive'],
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
        // DS v2
        pill: '9999px',
        'ns-sm': '6px',
        'ns-md': '14px',
        'ns-lg': '28px',
        'ns-xl': '40px',
      },
      // Ombres personnalisées - Méditerranée
      boxShadow: {
        'card-primary': '0 2px 12px rgba(0, 0, 0, 0.08)',
        'card-dashboard': '0 1px 8px rgba(0, 0, 0, 0.06)',
        'card-signature': '8px 8px 0 #E5DED6', // Ombre signature beige
        'card-signature-hover': '10px 10px 0 #E5DED6', // Ombre signature hover
        focus: '0 0 0 2px rgba(27, 153, 139, 0.2)', // Primary Turquoise avec 20% d'opacité
        'focus-terracotta': '0 0 0 2px rgba(231, 111, 81, 0.2)', // Terracotta avec 20% d'opacité
        // DS v2 — hard offset shadows (ink), signature interaction
        'hard-sm': '3px 3px 0 #14160f',
        hard: '4px 4px 0 #14160f',
        'hard-lg': '6px 6px 0 #14160f',
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
      // Keyframes pour les animations
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
      // Variables CSS pour le thème dynamique - MÉDITERRANÉE 🌊
      cssVariables: {
        '--color-primary': '#1B998B',
        '--color-primary-white': '#FDFCFB',
        '--color-primary-dark': '#147569',
        '--color-primary-darker': '#0F5F56',
        '--color-secondary': '#E9C46A',
        '--color-secondary-pale': '#F8F5F2',
        '--color-secondary-sage': '#E5DED6',
        '--color-accent-teal': '#2EC4B6',
        '--color-accent-mint': '#78CFC6',
        '--color-accent-orange': '#E76F51',
        '--color-accent-terracotta': '#E76F51',
        '--color-functional-success': '#22C55E',
        '--color-functional-error': '#EF4444',
        '--color-functional-warning': '#F59E0B',
        '--color-functional-info': '#2EC4B6',
        '--color-neutral-light': '#FBF9F7',
        '--color-neutral-medium': '#A89888',
        '--color-neutral-dark': '#524A42',
        '--color-neutral-border': '#E5DED6',
        '--color-background-primary': '#FFFFFF',
        '--color-background-secondary': '#FBF9F7',
        '--color-background-accent': '#F8F5F2',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
