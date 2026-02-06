import type { Meta, StoryObj } from '@storybook/react';
import { PrinciplesSection } from './PrinciplesSection';

/**
 * Section "Mes Principes" de la page L'Approche
 *
 * Cette section présente les 3 piliers fondamentaux de l'approche nutritionnelle
 * sous forme de cards verticales avec animations au scroll.
 *
 * ## Design System
 * - Police : Inter (design system NutriSensia)
 * - Couleurs : Primary, Accent Teal, Background Accent
 * - Typographie : text-h2, text-h3, text-body-large
 * - Spacing : 24dp, 32dp, 48dp, 64dp
 * - Animations : scroll-triggered avec Framer Motion
 *
 * ## Structure
 * - Label "MES PRINCIPES" en uppercase
 * - Titre H2 : "Les 3 Piliers de Mon Approche"
 * - Paragraphe d'introduction
 * - 3 cards verticales avec :
 *   - Icône emoji
 *   - Sous-titre
 *   - Tagline en italique
 *   - Paragraphes de contenu
 *   - Box "Ce que ça change pour vous" avec fond coloré
 *   - Exemple concret en blockquote
 */
const meta = {
  title: 'Landing/Approach/PrinciplesSection',
  component: PrinciplesSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Section présentant les 3 piliers de l'approche nutritionnelle avec design system NutriSensia.",
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PrinciplesSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Version par défaut de la section Principes
 */
export const Default: Story = {
  args: {},
};

/**
 * Vue mobile (375px)
 */
export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Vue tablette (768px)
 */
export const Tablet: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Vue desktop large (1920px)
 */
export const DesktopLarge: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};

/**
 * Avec classe personnalisée (fond blanc)
 */
export const WithWhiteBackground: Story = {
  args: {
    className: 'bg-background-primary',
  },
};
