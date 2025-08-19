import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';
import { withNutriSensiaTheme } from './decorators';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // Configuration pour les tests d'accessibilité WCAG 2.1 AA
      config: {
        rules: [
          {
            id: 'color-contrast',
            enabled: true,
          },
          {
            id: 'focus-order-semantics',
            enabled: true,
          },
          {
            id: 'landmark-one-main',
            enabled: true,
          },
          {
            id: 'page-has-heading-one',
            enabled: true,
          },
        ],
      },
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'error',
    },

    // Configuration du design system NutriSensia
    designToken: {
      defaultTheme: 'light',
      themes: {
        light: {
          name: 'Light Theme',
          tokens: {
            'color-primary': '#2E7D5E',
            'color-secondary': '#4A9B7B',
            'color-accent': '#00A693',
            'color-neutral-dark': '#374151',
            'color-neutral-medium': '#9CA3AF',
            'color-neutral-light': '#F8F9FA',
            'color-functional-success': '#22C55E',
            'color-functional-error': '#EF4444',
            'color-functional-warning': '#F59E0B',
            'color-functional-info': '#3B82F6',
          },
        },
        dark: {
          name: 'Dark Theme',
          tokens: {
            'color-primary': '#4A9B7B',
            'color-secondary': '#2E7D5E',
            'color-accent': '#7FD1C1',
            'color-neutral-dark': '#F8F9FA',
            'color-neutral-medium': '#9CA3AF',
            'color-neutral-light': '#374151',
            'color-functional-success': '#22C55E',
            'color-functional-error': '#EF4444',
            'color-functional-warning': '#F59E0B',
            'color-functional-info': '#3B82F6',
          },
        },
      },
    },

    // Configuration des backgrounds
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#FAFBFC',
        },
        {
          name: 'dark',
          value: '#1F2937',
        },
        {
          name: 'primary',
          value: '#2E7D5E',
        },
        {
          name: 'secondary',
          value: '#4A9B7B',
        },
      ],
    },

    // Configuration des viewports
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1440px',
            height: '900px',
          },
        },
      },
    },
  },

  // Configuration globale des stories
  globalTypes: {
    theme: {
      description: 'Global theme for components',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
        icon: 'circlehollow',
        items: ['light', 'dark'],
        dynamicTitle: true,
      },
    },
    locale: {
      description: 'Internationalization locale',
      defaultValue: 'fr',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'fr', title: 'Français' },
          { value: 'en', title: 'English' },
        ],
      },
    },
  },

  // Décorateurs globaux
  decorators: [withNutriSensiaTheme],
};

export default preview;
