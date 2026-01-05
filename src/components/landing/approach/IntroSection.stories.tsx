import type { Meta, StoryObj } from '@storybook/react';
import { IntroSection } from './IntroSection';

/**
 * # IntroSection
 *
 * Section d'introduction simple et élégante pour la page "L'Approche".
 *
 * ## Caractéristiques
 *
 * - **Max-width 800px** pour une lisibilité optimale
 * - **Spacing généreux** entre titre, sous-titre et paragraphes
 * - **Animation fade-in** au chargement avec décalage progressif
 * - **Sous-titre en couleur accent** pour la hiérarchie visuelle
 * - **Line-height confortable** (1.7-1.8) pour les paragraphes
 * - **Design responsive** avec ajustements de taille de police
 *
 * ## Utilisation
 *
 * Cette section est conçue pour être la première section visible après le header
 * sur la page /approche. Elle introduit l'approche nutritionnelle de manière
 * humaine et accessible, en créant une connexion émotionnelle avant de présenter
 * les détails méthodologiques.
 */
const meta = {
  title: 'Landing/Approach/IntroSection',
  component: IntroSection,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Section d\'introduction simple et élégante qui présente l\'approche nutritionnelle de manière humaine et scientifique.',
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof IntroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Version par défaut de la section Intro
 *
 * Affiche l'introduction complète avec :
 * - Titre H1 : "Mon Approche Nutritionnelle"
 * - Sous-titre explicatif en couleur accent
 * - Deux paragraphes qui expliquent la différence de l'approche
 */
export const Default: Story = {
  args: {},
};

/**
 * Version avec classe personnalisée
 *
 * Démontre l'utilisation de la prop className pour ajouter
 * des styles personnalisés à la section.
 */
export const WithCustomClass: Story = {
  args: {
    className: 'bg-sage-50',
  },
};

/**
 * Version mobile
 *
 * Affiche la section dans un viewport mobile pour tester
 * la responsivité et l'adaptation du contenu.
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Version tablette
 *
 * Affiche la section dans un viewport tablette pour vérifier
 * les breakpoints intermédiaires.
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};

/**
 * Version desktop large
 *
 * Affiche la section sur un grand écran pour vérifier
 * que le max-width est bien respecté et que le contenu
 * reste centré et lisible.
 */
export const DesktopLarge: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'desktop',
    },
  },
};
