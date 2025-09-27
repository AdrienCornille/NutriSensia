import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  PrimaryCard,
  DashboardCard,
  NutritionCard,
} from './Card';
import { withCardContext, withPadding } from '../../../.storybook/decorators';

const meta: Meta<typeof Card> = {
  title: 'Design System/Components/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component: `
## Cartes - Design System NutriSensia

Les cartes sont des conteneurs visuels pour organiser et présenter le contenu de manière structurée.

### Caractéristiques
- **Rayon de bordure** : 12dp (Primary/Nutrition) ou 16dp (Dashboard)
- **Ombres** : Subtiles et cohérentes avec le design system
- **Espacement** : Utilise l'échelle de spacing NutriSensia
- **Accessibilité** : Support des rôles ARIA et navigation clavier

### Variantes
- **Primary** : Carte standard avec rayon 12dp
- **Dashboard** : Carte pour tableaux de bord avec rayon 16dp
- **Nutrition** : Carte spécialisée pour contenu nutritionnel

### Composants
- **CardHeader** : En-tête de carte avec titre et actions
- **CardContent** : Contenu principal de la carte
- **CardFooter** : Pied de carte avec actions secondaires

### États
- **Normal** : État par défaut
- **Hover** : Effet de survol avec élévation
- **Clickable** : Carte cliquable avec indicateur visuel
- **Loading** : État de chargement avec skeleton
        `,
      },
    },
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'dashboard', 'nutrition'],
      description: 'Variante de la carte',
    },
    clickable: {
      control: { type: 'boolean' },
      description: 'Carte cliquable',
    },
    hover: {
      control: { type: 'boolean' },
      description: 'Effet de survol',
    },
    loading: {
      control: { type: 'boolean' },
      description: 'État de chargement',
    },
  },
  decorators: [withCardContext],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Story de base
export const Default: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <h3 className='text-h3 text-neutral-dark'>Titre de la carte</h3>
      </CardHeader>
      <CardContent>
        <p className='text-body text-neutral-medium'>
          Contenu de la carte avec du texte d&apos;exemple pour démontrer
          l&apos;espacement et la typographie.
        </p>
      </CardContent>
    </Card>
  ),
};

// Story avec toutes les variantes
export const AllVariants: Story = {
  render: () => (
    <div className='grid grid-cols-1 md:grid-cols-3 gap-24dp'>
      <PrimaryCard>
        <CardHeader>
          <h3 className='text-h3 text-neutral-dark'>Carte Primaire</h3>
          <p className='text-caption text-neutral-medium'>Rayon 12dp</p>
        </CardHeader>
        <CardContent>
          <p className='text-body text-neutral-medium'>
            Carte standard utilisée pour la plupart du contenu.
          </p>
        </CardContent>
      </PrimaryCard>

      <DashboardCard>
        <CardHeader>
          <h3 className='text-h3 text-neutral-dark'>Carte Dashboard</h3>
          <p className='text-caption text-neutral-medium'>Rayon 16dp</p>
        </CardHeader>
        <CardContent>
          <p className='text-body text-neutral-medium'>
            Carte optimisée pour les tableaux de bord et les métriques.
          </p>
        </CardContent>
      </DashboardCard>

      <NutritionCard>
        <CardHeader>
          <h3 className='text-h3 text-neutral-dark'>Carte Nutrition</h3>
          <p className='text-caption text-neutral-medium'>Rayon 12dp</p>
        </CardHeader>
        <CardContent>
          <p className='text-body text-neutral-medium'>
            Carte spécialisée pour le contenu nutritionnel et diététique.
          </p>
        </CardContent>
      </NutritionCard>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Toutes les variantes de cartes disponibles dans le design system.',
      },
    },
  },
};

// Story avec structure complète
export const CompleteStructure: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-h3 text-neutral-dark'>
              Patient - Marie Dupont
            </h3>
            <p className='text-caption text-neutral-medium'>ID: PAT-2024-001</p>
          </div>
          <button className='text-primary hover:text-primary-dark'>
            <EditIcon />
          </button>
        </div>
      </CardHeader>

      <CardContent>
        <div className='space-y-16dp'>
          <div>
            <h4 className='text-h4 text-neutral-dark mb-8dp'>
              Informations personnelles
            </h4>
            <div className='grid grid-cols-2 gap-16dp'>
              <div>
                <p className='text-caption text-neutral-medium'>Âge</p>
                <p className='text-body text-neutral-dark'>32 ans</p>
              </div>
              <div>
                <p className='text-caption text-neutral-medium'>Taille</p>
                <p className='text-body text-neutral-dark'>165 cm</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className='text-h4 text-neutral-dark mb-8dp'>
              Objectifs nutritionnels
            </h4>
            <p className='text-body text-neutral-medium'>
              Perte de poids modérée avec maintien de la masse musculaire.
            </p>
          </div>
        </div>
      </CardContent>

      <CardFooter>
        <div className='flex gap-16dp'>
          <button className='text-primary hover:text-primary-dark text-body'>
            Voir le profil complet
          </button>
          <button className='text-neutral-medium hover:text-neutral-dark text-body'>
            Planifier une consultation
          </button>
        </div>
      </CardFooter>
    </Card>
  ),
  parameters: {
    docs: {
      description: {
        story: "Exemple d'utilisation complète avec header, content et footer.",
      },
    },
  },
};

// Story avec états
export const States: Story = {
  render: () => (
    <div className='space-y-24dp'>
      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>État normal</h3>
        <Card>
          <CardContent>
            <p className='text-body text-neutral-medium'>
              Carte en état normal sans effets spéciaux.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          État cliquable avec hover
        </h3>
        <Card clickable hover>
          <CardContent>
            <p className='text-body text-neutral-medium'>
              Carte cliquable avec effet de survol. Passez la souris dessus pour
              voir l&apos;effet.
            </p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          État de chargement
        </h3>
        <Card loading>
          <CardContent>
            <p className='text-body text-neutral-medium'>
              Cette carte est en cours de chargement.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Les différents états des cartes : normal, cliquable avec hover, et chargement.',
      },
    },
  },
};

// Story avec contenu riche
export const RichContent: Story = {
  render: () => (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-24dp'>
      <Card>
        <CardHeader>
          <h3 className='text-h3 text-neutral-dark'>
            Métriques nutritionnelles
          </h3>
        </CardHeader>
        <CardContent>
          <div className='space-y-16dp'>
            <div className='flex justify-between items-center'>
              <span className='text-body text-neutral-medium'>Calories</span>
              <span className='text-h4 text-neutral-dark font-semibold'>
                1,850
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-body text-neutral-medium'>Protéines</span>
              <span className='text-h4 text-neutral-dark font-semibold'>
                120g
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-body text-neutral-medium'>Glucides</span>
              <span className='text-h4 text-neutral-dark font-semibold'>
                180g
              </span>
            </div>
            <div className='flex justify-between items-center'>
              <span className='text-body text-neutral-medium'>Lipides</span>
              <span className='text-h4 text-neutral-dark font-semibold'>
                65g
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className='text-h3 text-neutral-dark'>Actions rapides</h3>
        </CardHeader>
        <CardContent>
          <div className='space-y-12dp'>
            <button className='w-full text-left p-16dp rounded-8dp hover:bg-neutral-light transition-colors'>
              <div className='flex items-center gap-12dp'>
                <PlusIcon />
                <span className='text-body text-neutral-dark'>
                  Ajouter un repas
                </span>
              </div>
            </button>
            <button className='w-full text-left p-16dp rounded-8dp hover:bg-neutral-light transition-colors'>
              <div className='flex items-center gap-12dp'>
                <EditIcon />
                <span className='text-body text-neutral-dark'>
                  Modifier le plan
                </span>
              </div>
            </button>
            <button className='w-full text-left p-16dp rounded-8dp hover:bg-neutral-light transition-colors'>
              <div className='flex items-center gap-12dp'>
                <ChartIcon />
                <span className='text-body text-neutral-dark'>
                  Voir les statistiques
                </span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Exemples de cartes avec du contenu riche et des interactions.',
      },
    },
  },
};

// Story d'accessibilité
export const Accessibility: Story = {
  render: () => (
    <div className='space-y-24dp'>
      <div className='bg-background-accent p-24dp rounded-8dp'>
        <h3 className='text-h4 text-neutral-dark mb-8dp'>
          Tests d&apos;accessibilité
        </h3>
        <ul className='text-body text-neutral-medium space-y-4dp'>
          <li>• Utilisez Tab pour naviguer vers les cartes cliquables</li>
          <li>• Utilisez Entrée pour activer les cartes cliquables</li>
          <li>• Vérifiez que le focus est visible</li>
          <li>• Testez avec un lecteur d&apos;écran</li>
        </ul>
      </div>

      <Card
        clickable
        hover
        tabIndex={0}
        role='button'
        aria-label='Carte cliquable avec informations du patient'
      >
        <CardHeader>
          <h3 className='text-h3 text-neutral-dark'>Patient - Jean Martin</h3>
        </CardHeader>
        <CardContent>
          <p className='text-body text-neutral-medium'>
            Cliquez pour voir les détails complets du patient.
          </p>
        </CardContent>
      </Card>

      <Card role='article' aria-labelledby='card-title'>
        <CardHeader>
          <h3 id='card-title' className='text-h3 text-neutral-dark'>
            Article avec titre accessible
          </h3>
        </CardHeader>
        <CardContent>
          <p className='text-body text-neutral-medium'>
            Cette carte utilise aria-labelledby pour associer le titre au
            contenu.
          </p>
        </CardContent>
      </Card>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Exemples d&apos;utilisation des attributs ARIA pour améliorer l&apos;accessibilité des cartes.',
      },
    },
  },
};

// Icônes pour les stories
const EditIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z' />
  </svg>
);

const PlusIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z'
      clipRule='evenodd'
    />
  </svg>
);

const ChartIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z' />
  </svg>
);
