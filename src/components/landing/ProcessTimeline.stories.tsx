import type { Meta, StoryObj } from '@storybook/react';
import ProcessTimeline from './ProcessTimeline';

/**
 * Timeline progressive en 3 étapes pour la section "Comment nous travaillons ensemble"
 *
 * ## Design
 * - Timeline verticale avec cercles numérotés
 * - Cards avec effet hover
 * - Gradient de couleur sur la ligne de progression
 * - Animations progressives au scroll
 * - Responsive mobile/desktop
 *
 * ## Sections
 * 1. **Consultation Découverte** - Premier contact et questionnaire
 * 2. **Suivi Régulier** - Ajustements et progression
 * 3. **Autonomisation** - Objectif final d'autonomie
 *
 * ## Usage
 * ```tsx
 * <ProcessTimeline />
 * ```
 */
const meta = {
  title: 'Landing/ProcessTimeline',
  component: ProcessTimeline,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          "Section timeline progressive pour présenter le processus d'accompagnement en 3 étapes claires et visuelles.",
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ProcessTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Version par défaut de la timeline avec les 3 étapes complètes
 */
export const Default: Story = {};

/**
 * Timeline dans un conteneur restreint (exemple d'intégration)
 */
export const InContainer: Story = {
  decorators: [
    Story => (
      <div className='max-w-5xl mx-auto p-8 bg-gray-50'>
        <Story />
      </div>
    ),
  ],
};

/**
 * Timeline avec fond sombre (test de contraste)
 */
export const DarkBackground: Story = {
  decorators: [
    Story => (
      <div className='bg-gray-900 py-12'>
        <Story />
      </div>
    ),
  ],
};

/**
 * Vue mobile (viewport réduit)
 */
export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};

/**
 * Vue tablette
 */
export const Tablet: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'tablet',
    },
  },
};
