import type { Meta, StoryObj } from '@storybook/react';
import { WaveDivider } from './WaveDivider';

/**
 * WaveDivider - Séparateur de section avec vague SVG animée
 *
 * Crée des transitions fluides et dynamiques entre les sections avec
 * une vague SVG responsive et animée. Parfait pour ajouter du dynamisme
 * tout en maintenant une apparence professionnelle.
 */
const meta = {
  title: 'UI/WaveDivider',
  component: WaveDivider,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Un séparateur de section avec vague SVG animée pour créer des transitions élégantes entre les sections. Utilise Framer Motion pour des animations fluides et performantes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['smooth', 'wavy', 'curved'],
      description: 'Style de la vague',
    },
    fromColor: {
      control: 'color',
      description: 'Couleur de départ (haut)',
    },
    toColor: {
      control: 'color',
      description: "Couleur d'arrivée (bas)",
    },
    animate: {
      control: 'boolean',
      description: "Active/désactive l'animation",
    },
    flip: {
      control: 'boolean',
      description: 'Inverse la vague verticalement',
    },
  },
} satisfies Meta<typeof WaveDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Configuration par défaut - Vague douce animée
 */
export const Default: Story = {
  args: {
    variant: 'smooth',
    fromColor: '#ffffff',
    toColor: '#E8F3EF',
    animate: true,
    height: { mobile: 80, desktop: 120 },
  },
  decorators: [
    Story => (
      <div className="bg-gray-100">
        <div className="bg-white h-64 flex items-center justify-center">
          <p className="text-2xl font-bold text-gray-800">Section au-dessus</p>
        </div>
        <Story />
        <div className="bg-[#E8F3EF] h-64 flex items-center justify-center">
          <p className="text-2xl font-bold text-gray-800">
            Section en-dessous
          </p>
        </div>
      </div>
    ),
  ],
};

/**
 * Variante Smooth - Vague douce et subtile (Recommandée)
 */
export const Smooth: Story = {
  args: {
    variant: 'smooth',
    fromColor: '#ffffff',
    toColor: '#E8F3EF',
    animate: true,
  },
  decorators: Default.decorators,
};

/**
 * Variante Wavy - Vagues plus prononcées
 */
export const Wavy: Story = {
  args: {
    variant: 'wavy',
    fromColor: '#ffffff',
    toColor: '#E8F3EF',
    animate: true,
    height: { mobile: 80, desktop: 120 },
  },
  decorators: Default.decorators,
};

/**
 * Variante Curved - Courbes élégantes
 */
export const Curved: Story = {
  args: {
    variant: 'curved',
    fromColor: '#ffffff',
    toColor: '#E8F3EF',
    animate: true,
    height: { mobile: 70, desktop: 110 },
  },
  decorators: Default.decorators,
};

/**
 * Sans animation - Version statique
 */
export const NoAnimation: Story = {
  args: {
    variant: 'smooth',
    fromColor: '#ffffff',
    toColor: '#E8F3EF',
    animate: false,
  },
  decorators: Default.decorators,
};

/**
 * Inversée - Pour alterner les directions
 */
export const Flipped: Story = {
  args: {
    variant: 'smooth',
    fromColor: '#E8F3EF',
    toColor: '#ffffff',
    animate: true,
    flip: true,
  },
  decorators: [
    Story => (
      <div className="bg-gray-100">
        <div className="bg-[#E8F3EF] h-64 flex items-center justify-center">
          <p className="text-2xl font-bold text-gray-800">Section au-dessus</p>
        </div>
        <Story />
        <div className="bg-white h-64 flex items-center justify-center">
          <p className="text-2xl font-bold text-gray-800">
            Section en-dessous
          </p>
        </div>
      </div>
    ),
  ],
};

/**
 * Transition Primary → Sage - Pour sections avec background coloré
 */
export const PrimaryToSage: Story = {
  args: {
    variant: 'smooth',
    fromColor: '#2E7D5E',
    toColor: '#E8F3EF',
    animate: true,
  },
  decorators: [
    Story => (
      <div className="bg-gray-100">
        <div className="bg-[#2E7D5E] h-64 flex items-center justify-center">
          <p className="text-2xl font-bold text-white">Section Primary</p>
        </div>
        <Story />
        <div className="bg-[#E8F3EF] h-64 flex items-center justify-center">
          <p className="text-2xl font-bold text-gray-800">Section Sage</p>
        </div>
      </div>
    ),
  ],
};

/**
 * Haute vague - Pour un effet plus dramatique
 */
export const TallWave: Story = {
  args: {
    variant: 'smooth',
    fromColor: '#ffffff',
    toColor: '#E8F3EF',
    animate: true,
    height: { mobile: 120, desktop: 180 },
  },
  decorators: Default.decorators,
};

/**
 * Petite vague - Plus subtile
 */
export const SmallWave: Story = {
  args: {
    variant: 'smooth',
    fromColor: '#ffffff',
    toColor: '#E8F3EF',
    animate: true,
    height: { mobile: 40, desktop: 60 },
  },
  decorators: Default.decorators,
};

/**
 * Multiple vagues - Exemple d'utilisation dans une page complète
 */
export const MultipleDividers: Story = {
  render: () => (
    <div className="bg-gray-100">
      {/* Section 1 */}
      <div className="bg-white h-64 flex items-center justify-center">
        <p className="text-2xl font-bold text-gray-800">Section 1 - Blanc</p>
      </div>

      {/* Divider 1 : Blanc → Sage */}
      <WaveDivider
        variant="smooth"
        fromColor="#ffffff"
        toColor="#E8F3EF"
        animate={true}
      />

      {/* Section 2 */}
      <div className="bg-[#E8F3EF] h-64 flex items-center justify-center">
        <p className="text-2xl font-bold text-gray-800">Section 2 - Sage</p>
      </div>

      {/* Divider 2 : Sage → Blanc (inversé) */}
      <WaveDivider
        variant="smooth"
        fromColor="#E8F3EF"
        toColor="#ffffff"
        animate={true}
        flip={true}
      />

      {/* Section 3 */}
      <div className="bg-white h-64 flex items-center justify-center">
        <p className="text-2xl font-bold text-gray-800">Section 3 - Blanc</p>
      </div>

      {/* Divider 3 : Blanc → Primary */}
      <WaveDivider
        variant="curved"
        fromColor="#ffffff"
        toColor="#2E7D5E"
        animate={true}
      />

      {/* Section 4 */}
      <div className="bg-[#2E7D5E] h-64 flex items-center justify-center">
        <p className="text-2xl font-bold text-white">Section 4 - Primary</p>
      </div>
    </div>
  ),
};
