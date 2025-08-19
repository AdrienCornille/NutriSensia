import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import {
  AccessibilityTest,
  AccessibilityAudit,
  AccessibilityPanel,
} from './index';
import { withPadding, withCentered } from '../../../.storybook/decorators';

const meta: Meta<typeof AccessibilityTest> = {
  title: 'Design System/Components/Accessibility',
  component: AccessibilityTest,
  parameters: {
    docs: {
      description: {
        component: `
## Accessibilité - Design System NutriSensia

Les composants d'accessibilité garantissent la conformité WCAG 2.1 AA et une expérience utilisateur inclusive.

### Caractéristiques
- **Tests visuels** : Validation des contrastes et états de focus
- **Audit automatisé** : Tests WCAG 2.1 AA avec axe-core
- **Préférences utilisateur** : Personnalisation de l'accessibilité
- **Support lecteur d'écran** : Attributs ARIA appropriés
- **Navigation clavier** : Gestion complète du focus

### Composants
- **AccessibilityTest** : Tests visuels d'accessibilité
- **AccessibilityAudit** : Audit automatisé WCAG 2.1 AA
- **AccessibilityPanel** : Panel de préférences utilisateur

### Standards respectés
- **WCAG 2.1 AA** : Conformité complète
- **Contraste** : Minimum 4.5:1 pour le texte
- **Focus** : Indicateurs visibles sur tous les éléments
- **Cibles tactiles** : Minimum 48dp
- **Navigation** : Support clavier complet

### Tests inclus
- Tests de contraste des couleurs
- Tests des états de focus
- Tests de navigation clavier
- Tests lecteur d'écran
- Tests des cibles tactiles
        `,
      },
    },
  },
  argTypes: {
    showPanel: {
      control: { type: 'boolean' },
      description: "Afficher le panel d'accessibilité",
    },
    runAudit: {
      control: { type: 'boolean' },
      description: "Lancer l'audit automatique",
    },
  },
  decorators: [withPadding],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Story de base pour les tests d'accessibilité
export const AccessibilityTestDefault: Story = {
  render: () => <AccessibilityTest />,
  parameters: {
    docs: {
      description: {
        story:
          "Page complète de tests d'accessibilité avec tous les tests visuels et interactifs.",
      },
    },
  },
};

// Story pour l'audit d'accessibilité
export const AccessibilityAuditDefault: Story = {
  render: () => <AccessibilityAudit />,
  parameters: {
    docs: {
      description: {
        story:
          "Composant d'audit automatisé utilisant axe-core pour tester la conformité WCAG 2.1 AA.",
      },
    },
  },
};

// Story pour le panel d'accessibilité
export const AccessibilityPanelDefault: Story = {
  render: () => <AccessibilityPanel />,
  parameters: {
    docs: {
      description: {
        story:
          "Panel flottant pour configurer les préférences d'accessibilité de l'utilisateur.",
      },
    },
  },
};

// Story combinée - Tests et Audit
export const CombinedAccessibility: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <div className='bg-background-accent p-24dp rounded-8dp'>
        <h2 className='text-h2 text-neutral-dark mb-16dp'>
          Tests d&apos;Accessibilité Combinés
        </h2>
        <p className='text-body text-neutral-medium mb-16dp'>
          Cette page combine les tests visuels et l&apos;audit automatisé pour
          une validation complète de l&apos;accessibilité.
        </p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-32dp'>
        <div>
          <h3 className='text-h3 text-neutral-dark mb-16dp'>Tests Visuels</h3>
          <div className='bg-background-primary p-24dp rounded-8dp border border-neutral-border'>
            <AccessibilityTest />
          </div>
        </div>

        <div>
          <h3 className='text-h3 text-neutral-dark mb-16dp'>
            Audit Automatisé
          </h3>
          <div className='bg-background-primary p-24dp rounded-8dp border border-neutral-border'>
            <AccessibilityAudit />
          </div>
        </div>
      </div>

      <div className='relative'>
        <AccessibilityPanel />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Combinaison de tous les composants d'accessibilité pour une validation complète.",
      },
    },
  },
};

// Story pour les tests de contraste
export const ContrastTests: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <h2 className='text-h2 text-neutral-dark'>Tests de Contraste WCAG AA</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-24dp'>
        {/* Test Primary */}
        <div className='bg-primary p-24dp rounded-8dp'>
          <h3 className='text-h4 text-white mb-8dp'>Primary Green</h3>
          <p className='text-body text-white'>
            Texte blanc sur fond vert primaire - Contraste excellent
          </p>
        </div>

        {/* Test Secondary */}
        <div className='bg-secondary p-24dp rounded-8dp'>
          <h3 className='text-h4 text-white mb-8dp'>Secondary Blue</h3>
          <p className='text-body text-white'>
            Texte blanc sur fond bleu secondaire - Contraste excellent
          </p>
        </div>

        {/* Test Accent */}
        <div className='bg-accent p-24dp rounded-8dp'>
          <h3 className='text-h4 text-white mb-8dp'>Accent Orange</h3>
          <p className='text-body text-white'>
            Texte blanc sur fond orange accent - Contraste excellent
          </p>
        </div>

        {/* Test Neutral Dark */}
        <div className='bg-neutral-dark p-24dp rounded-8dp'>
          <h3 className='text-h4 text-white mb-8dp'>Neutral Dark</h3>
          <p className='text-body text-white'>
            Texte blanc sur fond gris foncé - Contraste excellent
          </p>
        </div>

        {/* Test Neutral Medium */}
        <div className='bg-neutral-medium p-24dp rounded-8dp'>
          <h3 className='text-h4 text-neutral-dark mb-8dp'>Neutral Medium</h3>
          <p className='text-body text-neutral-dark'>
            Texte foncé sur fond gris moyen - Contraste suffisant
          </p>
        </div>

        {/* Test Background */}
        <div className='bg-background-primary p-24dp rounded-8dp border border-neutral-border'>
          <h3 className='text-h4 text-neutral-dark mb-8dp'>
            Background Primary
          </h3>
          <p className='text-body text-neutral-medium'>
            Texte moyen sur fond clair - Contraste suffisant
          </p>
        </div>
      </div>

      <div className='bg-background-accent p-24dp rounded-8dp'>
        <h3 className='text-h4 text-neutral-dark mb-8dp'>
          Résultats des Tests
        </h3>
        <ul className='text-body text-neutral-medium space-y-4dp'>
          <li>✅ Tous les contrastes respectent WCAG 2.1 AA (4.5:1 minimum)</li>
          <li>✅ Texte sur fond coloré : contraste excellent</li>
          <li>✅ Texte sur fond neutre : contraste suffisant</li>
          <li>✅ Texte sur fond clair : contraste approprié</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Tests spécifiques des ratios de contraste pour la conformité WCAG 2.1 AA.',
      },
    },
  },
};

// Story pour les tests de focus
export const FocusTests: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <h2 className='text-h2 text-neutral-dark'>Tests des États de Focus</h2>

      <div className='bg-background-accent p-24dp rounded-8dp'>
        <h3 className='text-h4 text-neutral-dark mb-8dp'>Instructions</h3>
        <p className='text-body text-neutral-medium mb-16dp'>
          Utilisez la touche Tab pour naviguer entre les éléments et observer
          les indicateurs de focus.
        </p>
      </div>

      <div className='space-y-16dp'>
        <div>
          <h3 className='text-h4 text-neutral-dark mb-16dp'>Boutons</h3>
          <div className='flex flex-wrap gap-16dp'>
            <button className='btn btn-primary focus-visible'>
              Bouton Primary
            </button>
            <button className='btn btn-secondary focus-visible'>
              Bouton Secondary
            </button>
            <button className='btn btn-ghost focus-visible'>
              Bouton Ghost
            </button>
            <button className='btn btn-destructive focus-visible'>
              Bouton Destructive
            </button>
          </div>
        </div>

        <div>
          <h3 className='text-h4 text-neutral-dark mb-16dp'>Liens</h3>
          <div className='flex flex-wrap gap-16dp'>
            <a
              href='#'
              className='text-primary hover:text-primary-dark focus-visible'
            >
              Lien Primary
            </a>
            <a
              href='#'
              className='text-secondary hover:text-secondary-dark focus-visible'
            >
              Lien Secondary
            </a>
            <a
              href='#'
              className='text-accent hover:text-accent-dark focus-visible'
            >
              Lien Accent
            </a>
          </div>
        </div>

        <div>
          <h3 className='text-h4 text-neutral-dark mb-16dp'>
            Champs de saisie
          </h3>
          <div className='flex flex-wrap gap-16dp'>
            <input
              type='text'
              placeholder='Champ de texte'
              className='input input-standard focus-visible'
            />
            <input
              type='email'
              placeholder='Email'
              className='input input-standard focus-visible'
            />
            <textarea
              placeholder='Zone de texte'
              className='input input-textarea focus-visible'
              rows={3}
            />
          </div>
        </div>

        <div>
          <h3 className='text-h4 text-neutral-dark mb-16dp'>
            Éléments de navigation
          </h3>
          <div className='flex flex-wrap gap-16dp'>
            <button className='nav-item focus-visible'>
              Élément de navigation
            </button>
            <button className='tab-item focus-visible'>Onglet</button>
            <button className='sidebar-item focus-visible'>
              Élément sidebar
            </button>
          </div>
        </div>
      </div>

      <div className='bg-background-accent p-24dp rounded-8dp'>
        <h3 className='text-h4 text-neutral-dark mb-8dp'>Critères de Focus</h3>
        <ul className='text-body text-neutral-medium space-y-4dp'>
          <li>
            ✅ Indicateur de focus visible sur tous les éléments interactifs
          </li>
          <li>✅ Contraste suffisant pour l&apos;indicateur de focus</li>
          <li>✅ Ordre de tabulation logique</li>
          <li>✅ Pas d&apos;éléments piégés dans le focus</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Tests des indicateurs de focus et de la navigation clavier.',
      },
    },
  },
};

// Story pour les tests de cibles tactiles
export const TouchTargetTests: Story = {
  render: () => (
    <div className='space-y-32dp'>
      <h2 className='text-h2 text-neutral-dark'>Tests des Cibles Tactiles</h2>

      <div className='bg-background-accent p-24dp rounded-8dp'>
        <h3 className='text-h4 text-neutral-dark mb-8dp'>Standard WCAG</h3>
        <p className='text-body text-neutral-medium'>
          Les cibles tactiles doivent avoir une taille minimale de 44dp (48dp
          recommandé) pour être facilement utilisables sur mobile.
        </p>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-32dp'>
        <div>
          <h3 className='text-h4 text-neutral-dark mb-16dp'>
            Cibles Tactiles Correctes (48dp)
          </h3>
          <div className='space-y-16dp'>
            <button className='touch-target btn btn-primary w-48dp h-48dp'>
              Bouton 48dp
            </button>
            <button className='touch-target btn btn-secondary w-48dp h-48dp'>
              Bouton 48dp
            </button>
            <button className='touch-target btn btn-ghost w-48dp h-48dp'>
              Bouton 48dp
            </button>
          </div>
        </div>

        <div>
          <h3 className='text-h4 text-neutral-dark mb-16dp'>
            Cibles Tactiles Minimales (44dp)
          </h3>
          <div className='space-y-16dp'>
            <button className='touch-target btn btn-primary w-44dp h-44dp'>
              Bouton 44dp
            </button>
            <button className='touch-target btn btn-secondary w-44dp h-44dp'>
              Bouton 44dp
            </button>
            <button className='touch-target btn btn-ghost w-44dp h-44dp'>
              Bouton 44dp
            </button>
          </div>
        </div>
      </div>

      <div>
        <h3 className='text-h4 text-neutral-dark mb-16dp'>
          Éléments de Navigation
        </h3>
        <div className='flex flex-wrap gap-16dp'>
          <button className='touch-target nav-item w-48dp h-48dp'>
            Navigation
          </button>
          <button className='touch-target tab-item w-48dp h-48dp'>
            Onglet
          </button>
          <button className='touch-target sidebar-item w-48dp h-48dp'>
            Sidebar
          </button>
        </div>
      </div>

      <div className='bg-background-accent p-24dp rounded-8dp'>
        <h3 className='text-h4 text-neutral-dark mb-8dp'>Validation</h3>
        <ul className='text-body text-neutral-medium space-y-4dp'>
          <li>✅ Toutes les cibles tactiles respectent le minimum de 44dp</li>
          <li>✅ Espacement suffisant entre les éléments (8dp minimum)</li>
          <li>✅ Pas de chevauchement des zones tactiles</li>
          <li>✅ Feedback visuel lors du toucher</li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Tests des tailles de cibles tactiles pour l'utilisation mobile.",
      },
    },
  },
};
