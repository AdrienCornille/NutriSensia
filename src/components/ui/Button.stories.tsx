import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Button,
  PrimaryButton,
  SecondaryButton,
  GhostButton,
  DestructiveButton,
} from './Button';
import { withPadding, withCentered } from '../../../.storybook/decorators';

const meta: Meta<typeof Button> = {
  title: 'Design System/Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Boutons - Design System NutriSensia

Les boutons sont des éléments interactifs essentiels pour les actions principales de l'interface utilisateur.

### Caractéristiques
- **Hauteur standard** : 48dp (recommandé pour l'accessibilité)
- **Contraste** : Conforme WCAG 2.1 AA (4.5:1 minimum)
- **Focus visible** : Indicateur de focus avec couleur primaire
- **États** : Normal, hover, active, disabled, loading

### Variantes
- **Primary** : Actions principales et importantes
- **Secondary** : Actions secondaires
- **Ghost** : Actions discrètes
- **Destructive** : Actions dangereuses (suppression, etc.)

### Tailles
- **sm** : 44dp de hauteur
- **md** : 48dp de hauteur (par défaut)
- **lg** : 56dp de hauteur
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'ghost', 'destructive'],
      description: 'Variante du bouton',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Taille du bouton',
    },
    disabled: {
      control: { type: 'boolean' },
      description: 'État désactivé',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'État de chargement',
    },
    fullWidth: {
      control: { type: 'boolean' },
      description: 'Pleine largeur',
    },
    children: {
      control: { type: 'text' },
      description: 'Contenu du bouton',
    },
  },
  decorators: [withPadding],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Story de base
export const Default: Story = {
  args: {
    children: 'Bouton par défaut',
    variant: 'primary',
    size: 'md',
  },
};

// Story avec toutes les variantes
export const AllVariants: Story = {
  render: () => (
    <div className='space-y-16dp'>
      <div className='grid grid-cols-2 md:grid-cols-4 gap-16dp'>
        <PrimaryButton>Bouton Primaire</PrimaryButton>
        <SecondaryButton>Bouton Secondaire</SecondaryButton>
        <GhostButton>Bouton Fantôme</GhostButton>
        <DestructiveButton>Bouton Destructif</DestructiveButton>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Toutes les variantes de boutons disponibles dans le design system.',
      },
    },
  },
};

// Story avec toutes les tailles
export const AllSizes: Story = {
  render: () => (
    <div className='space-y-16dp'>
      <div className='space-y-16dp'>
        <div>
          <h3 className='text-h4 text-neutral-dark mb-8dp'>
            Taille Small (44dp)
          </h3>
          <div className='flex gap-16dp'>
            <PrimaryButton size='sm'>Petit Primaire</PrimaryButton>
            <SecondaryButton size='sm'>Petit Secondaire</SecondaryButton>
            <GhostButton size='sm'>Petit Fantôme</GhostButton>
            <DestructiveButton size='sm'>Petit Destructif</DestructiveButton>
          </div>
        </div>

        <div>
          <h3 className='text-h4 text-neutral-dark mb-8dp'>
            Taille Medium (48dp)
          </h3>
          <div className='flex gap-16dp'>
            <PrimaryButton size='md'>Moyen Primaire</PrimaryButton>
            <SecondaryButton size='md'>Moyen Secondaire</SecondaryButton>
            <GhostButton size='md'>Moyen Fantôme</GhostButton>
            <DestructiveButton size='md'>Moyen Destructif</DestructiveButton>
          </div>
        </div>

        <div>
          <h3 className='text-h4 text-neutral-dark mb-8dp'>
            Taille Large (56dp)
          </h3>
          <div className='flex gap-16dp'>
            <PrimaryButton size='lg'>Grand Primaire</PrimaryButton>
            <SecondaryButton size='lg'>Grand Secondaire</SecondaryButton>
            <GhostButton size='lg'>Grand Fantôme</GhostButton>
            <DestructiveButton size='lg'>Grand Destructif</DestructiveButton>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Toutes les tailles de boutons disponibles. La taille medium (48dp) est recommandée pour l'accessibilité.",
      },
    },
  },
};

// Story avec états
export const States: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>États normaux</h3>
        <div className='flex gap-16dp'>
          <PrimaryButton>Normal</PrimaryButton>
          <SecondaryButton>Normal</SecondaryButton>
          <GhostButton>Normal</GhostButton>
          <DestructiveButton>Normal</DestructiveButton>
        </div>
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>États désactivés</h3>
        <div className='flex gap-16dp'>
          <PrimaryButton disabled>Désactivé</PrimaryButton>
          <SecondaryButton disabled>Désactivé</SecondaryButton>
          <GhostButton disabled>Désactivé</GhostButton>
          <DestructiveButton disabled>Désactivé</DestructiveButton>
        </div>
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          États de chargement
        </h3>
        <div className='flex gap-16dp'>
          <PrimaryButton loading>Chargement</PrimaryButton>
          <SecondaryButton loading>Chargement</SecondaryButton>
          <GhostButton loading>Chargement</GhostButton>
          <DestructiveButton loading>Chargement</DestructiveButton>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Les différents états des boutons : normal, désactivé et chargement.',
      },
    },
  },
};

// Story avec icônes
export const WithIcons: Story = {
  render: () => (
    <div className='space-y-16dp'>
      <div className='flex gap-16dp'>
        <PrimaryButton leftIcon={<PlusIcon />}>Ajouter</PrimaryButton>
        <SecondaryButton rightIcon={<ArrowIcon />}>Continuer</SecondaryButton>
        <GhostButton leftIcon={<EditIcon />}>Modifier</GhostButton>
        <DestructiveButton leftIcon={<TrashIcon />}>
          Supprimer
        </DestructiveButton>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Boutons avec icônes à gauche ou à droite. Les icônes améliorent la compréhension de l'action.",
      },
    },
  },
};

// Story pleine largeur
export const FullWidth: Story = {
  render: () => (
    <div className='space-y-16dp w-full max-w-md'>
      <PrimaryButton fullWidth>Bouton pleine largeur</PrimaryButton>
      <SecondaryButton fullWidth>Bouton pleine largeur</SecondaryButton>
      <GhostButton fullWidth>Bouton pleine largeur</GhostButton>
      <DestructiveButton fullWidth>Bouton pleine largeur</DestructiveButton>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Boutons en pleine largeur, utiles pour les formulaires et les actions principales.',
      },
    },
  },
};

// Story d'accessibilité
export const Accessibility: Story = {
  render: () => (
    <div className='space-y-16dp'>
      <div className='bg-background-accent p-24dp rounded-8dp'>
        <h3 className='text-h4 text-neutral-dark mb-8dp'>
          Tests d&apos;accessibilité
        </h3>
        <ul className='text-body text-neutral-medium space-y-4dp'>
          <li>• Utilisez Tab pour naviguer entre les boutons</li>
          <li>• Utilisez Entrée ou Espace pour activer</li>
          <li>• Vérifiez que le focus est visible</li>
          <li>• Testez avec un lecteur d&apos;écran</li>
        </ul>
      </div>

      <div className='flex gap-16dp'>
        <PrimaryButton aria-label='Ajouter un nouveau patient'>
          <PlusIcon />
        </PrimaryButton>
        <SecondaryButton aria-describedby='help-text'>Aide</SecondaryButton>
        <GhostButton aria-pressed='false'>Option</GhostButton>
      </div>

      <p id='help-text' className='text-caption text-neutral-medium'>
        Ce bouton ouvre la documentation d&apos;aide
      </p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Exemples d&apos;utilisation des attributs ARIA pour améliorer l&apos;accessibilité.',
      },
    },
  },
};

// Icônes pour les stories
const PlusIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
      clipRule='evenodd'
    />
  </svg>
);

const ArrowIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z'
      clipRule='evenodd'
    />
  </svg>
);

const EditIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
  </svg>
);

const TrashIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
      clipRule='evenodd'
    />
  </svg>
);
