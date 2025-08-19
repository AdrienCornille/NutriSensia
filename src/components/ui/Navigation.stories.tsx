import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Sidebar, Tabs, TabPanel, NavigationItem } from './Navigation';
import {
  withNavigationContext,
  withPadding,
} from '../../../.storybook/decorators';

const meta: Meta<typeof Sidebar> = {
  title: 'Design System/Components/Navigation',
  component: Sidebar,
  parameters: {
    docs: {
      description: {
        component: `
## Navigation - Design System NutriSensia

Les composants de navigation permettent aux utilisateurs de naviguer dans l'application.

### Caractéristiques
- **Sidebar** : Navigation latérale de 240dp de largeur
- **Tabs** : Navigation par onglets avec hauteur de 48dp
- **Accessibilité** : Support complet des lecteurs d'écran
- **Responsive** : Adaptation mobile et desktop
- **Focus management** : Navigation clavier optimisée

### Composants
- **Sidebar** : Navigation latérale avec icônes et sous-éléments
- **Tabs** : Navigation par onglets horizontale ou verticale
- **TabPanel** : Contenu des onglets
- **NavigationItem** : Élément de navigation individuel

### États
- **Normal** : État par défaut
- **Active** : Élément actuellement sélectionné
- **Hover** : Effet de survol
- **Disabled** : Élément désactivé
- **Expanded** : Sous-éléments visibles (sidebar)

### Accessibilité
- **Rôles ARIA** : navigation, tab, tabpanel
- **Labels** : Descriptions pour les lecteurs d'écran
- **Focus** : Gestion du focus et navigation clavier
- **Contraste** : Conforme WCAG 2.1 AA
        `,
      },
    },
  },
  argTypes: {
    compact: {
      control: { type: 'boolean' },
      description: 'Mode compact pour la sidebar',
    },
    orientation: {
      control: { type: 'select' },
      options: ['horizontal', 'vertical'],
      description: 'Orientation des onglets',
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Taille des éléments',
    },
  },
  decorators: [withNavigationContext],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Données de test pour la sidebar
const sidebarItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: 'Tableau de bord',
    icon: <DashboardIcon />,
  },
  {
    id: 'patients',
    label: 'Patients',
    icon: <PatientsIcon />,
    children: [
      { id: 'list', label: 'Liste des patients' },
      { id: 'add', label: 'Ajouter un patient' },
      { id: 'search', label: 'Rechercher' },
    ],
  },
  {
    id: 'consultations',
    label: 'Consultations',
    icon: <ConsultationsIcon />,
    children: [
      { id: 'upcoming', label: 'À venir' },
      { id: 'past', label: 'Passées' },
      { id: 'schedule', label: 'Planifier' },
    ],
  },
  {
    id: 'nutrition',
    label: 'Nutrition',
    icon: <NutritionIcon />,
    children: [
      { id: 'plans', label: 'Plans alimentaires' },
      { id: 'meals', label: 'Repas' },
      { id: 'recipes', label: 'Recettes' },
    ],
  },
  {
    id: 'billing',
    label: 'Facturation',
    icon: <BillingIcon />,
  },
  {
    id: 'settings',
    label: 'Paramètres',
    icon: <SettingsIcon />,
  },
];

// Données de test pour les onglets
const tabItems: NavigationItem[] = [
  { id: 'overview', label: "Vue d'ensemble" },
  { id: 'details', label: 'Détails' },
  { id: 'history', label: 'Historique' },
  { id: 'settings', label: 'Paramètres' },
];

// Story de base pour la sidebar
export const SidebarDefault: Story = {
  render: () => (
    <div className='flex min-h-screen'>
      <Sidebar
        items={sidebarItems}
        activeItem='dashboard'
        onItemClick={item => console.log('Clicked:', item.id)}
      />
      <div className='flex-1 p-32dp'>
        <h2 className='text-h2 text-neutral-dark mb-16dp'>Contenu principal</h2>
        <p className='text-body text-neutral-medium'>
          Le contenu principal de l&apos;application s&apos;affiche ici.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Sidebar de navigation standard avec tous les éléments et sous-éléments.',
      },
    },
  },
};

// Story sidebar compacte
export const SidebarCompact: Story = {
  render: () => (
    <div className='flex min-h-screen'>
      <Sidebar
        items={sidebarItems}
        activeItem='patients'
        compact
        onItemClick={item => console.log('Clicked:', item.id)}
      />
      <div className='flex-1 p-32dp'>
        <h2 className='text-h2 text-neutral-dark mb-16dp'>Mode compact</h2>
        <p className='text-body text-neutral-medium'>
          La sidebar en mode compact affiche uniquement les icônes.
        </p>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Sidebar en mode compact pour économiser l&apos;espace.',
      },
    },
  },
};

// Story onglets horizontaux
export const TabsHorizontal: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Onglets horizontaux
        </h3>
        <Tabs
          tabs={tabItems}
          activeTab='overview'
          onTabChange={tab => console.log('Tab changed:', tab.id)}
        />

        <div className='mt-24dp p-24dp bg-background-primary rounded-8dp border border-neutral-border'>
          <TabPanel tabId='overview' activeTab='overview'>
            <h4 className='text-h4 text-neutral-dark mb-8dp'>
              Vue d&apos;ensemble
            </h4>
            <p className='text-body text-neutral-medium'>
              Contenu de l&apos;onglet vue d&apos;ensemble avec les informations
              principales.
            </p>
          </TabPanel>

          <TabPanel tabId='details' activeTab='overview'>
            <h4 className='text-h4 text-neutral-dark mb-8dp'>Détails</h4>
            <p className='text-body text-neutral-medium'>
              Contenu de l&apos;onglet détails avec les informations détaillées.
            </p>
          </TabPanel>

          <TabPanel tabId='history' activeTab='overview'>
            <h4 className='text-h4 text-neutral-dark mb-8dp'>Historique</h4>
            <p className='text-body text-neutral-medium'>
              Contenu de l&apos;onglet historique avec les événements passés.
            </p>
          </TabPanel>

          <TabPanel tabId='settings' activeTab='overview'>
            <h4 className='text-h4 text-neutral-dark mb-8dp'>Paramètres</h4>
            <p className='text-body text-neutral-medium'>
              Contenu de l&apos;onglet paramètres avec les options de
              configuration.
            </p>
          </TabPanel>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Navigation par onglets horizontaux avec contenu dynamique.',
      },
    },
  },
};

// Story onglets verticaux
export const TabsVertical: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>Onglets verticaux</h3>
        <div className='flex gap-32dp'>
          <Tabs
            tabs={tabItems}
            activeTab='details'
            orientation='vertical'
            onTabChange={tab => console.log('Tab changed:', tab.id)}
          />

          <div className='flex-1 p-24dp bg-background-primary rounded-8dp border border-neutral-border'>
            <TabPanel tabId='overview' activeTab='details'>
              <h4 className='text-h4 text-neutral-dark mb-8dp'>
                Vue d&apos;ensemble
              </h4>
              <p className='text-body text-neutral-medium'>
                Contenu de l&apos;onglet vue d&apos;ensemble.
              </p>
            </TabPanel>

            <TabPanel tabId='details' activeTab='details'>
              <h4 className='text-h4 text-neutral-dark mb-8dp'>Détails</h4>
              <p className='text-body text-neutral-medium'>
                Contenu de l&apos;onglet détails.
              </p>
            </TabPanel>

            <TabPanel tabId='history' activeTab='details'>
              <h4 className='text-h4 text-neutral-dark mb-8dp'>Historique</h4>
              <p className='text-body text-neutral-medium'>
                Contenu de l&apos;onglet historique.
              </p>
            </TabPanel>

            <TabPanel tabId='settings' activeTab='details'>
              <h4 className='text-h4 text-neutral-dark mb-8dp'>Paramètres</h4>
              <p className='text-body text-neutral-medium'>
                Contenu de l&apos;onglet paramètres.
              </p>
            </TabPanel>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Navigation par onglets verticaux pour les interfaces complexes.',
      },
    },
  },
};

// Story avec états
export const States: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Éléments actifs et désactivés
        </h3>
        <div className='flex min-h-screen'>
          <Sidebar
            items={[
              ...sidebarItems,
              {
                id: 'disabled',
                label: 'Fonctionnalité désactivée',
                icon: <DisabledIcon />,
                disabled: true,
              },
            ]}
            activeItem='patients'
            onItemClick={item => console.log('Clicked:', item.id)}
          />
          <div className='flex-1 p-32dp'>
            <p className='text-body text-neutral-medium'>
              Certains éléments peuvent être désactivés selon les permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Exemples d&apos;éléments actifs et désactivés dans la navigation.',
      },
    },
  },
};

// Story d'accessibilité
export const Accessibility: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div className='bg-background-accent p-24dp rounded-8dp'>
        <h3 className='text-h4 text-neutral-dark mb-8dp'>
          Tests d&apos;accessibilité
        </h3>
        <ul className='text-body text-neutral-medium space-y-4dp'>
          <li>• Utilisez Tab pour naviguer dans la sidebar</li>
          <li>• Utilisez les flèches pour naviguer dans les onglets</li>
          <li>• Utilisez Entrée ou Espace pour activer</li>
          <li>• Testez avec un lecteur d&apos;écran</li>
        </ul>
      </div>

      <div className='flex min-h-screen'>
        <Sidebar
          items={sidebarItems}
          activeItem='dashboard'
          onItemClick={item => console.log('Clicked:', item.id)}
          aria-label='Navigation principale'
        />
        <div className='flex-1 p-32dp'>
          <h2 className='text-h2 text-neutral-dark mb-16dp'>
            Navigation accessible
          </h2>
          <p className='text-body text-neutral-medium'>
            Cette sidebar utilise les attributs ARIA appropriés pour
            l&apos;accessibilité.
          </p>
        </div>
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>Onglets avec ARIA</h3>
        <Tabs
          tabs={tabItems}
          activeTab='overview'
          onTabChange={tab => console.log('Tab changed:', tab.id)}
          aria-label='Navigation par onglets'
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Exemples d&apos;utilisation des attributs ARIA pour améliorer l&apos;accessibilité de la navigation.',
      },
    },
  },
};

// Icônes pour les stories
const DashboardIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
  </svg>
);

const PatientsIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' />
  </svg>
);

const ConsultationsIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M8 7V3a2 2 0 012-2h4.586A1 1 0 0116 2.586L19.414 6A1 1 0 0119 7H15a2 2 0 00-2 2v1a2 2 0 01-2 2H8a2 2 0 01-2-2V7z' />
  </svg>
);

const NutritionIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path d='M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z' />
  </svg>
);

const BillingIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z'
      clipRule='evenodd'
    />
  </svg>
);

const SettingsIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z'
      clipRule='evenodd'
    />
  </svg>
);

const DisabledIcon = () => (
  <svg className='w-5 h-5' fill='currentColor' viewBox='0 0 20 20'>
    <path
      fillRule='evenodd'
      d='M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z'
      clipRule='evenodd'
    />
  </svg>
);
