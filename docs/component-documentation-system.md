# Système de Documentation des Composants - NutriSensia

## 📋 Vue d'ensemble

Ce document décrit le système de documentation des composants UI mis en place avec Storybook pour le design system NutriSensia.

## 🎯 Objectifs

- **Documentation interactive** : Stories Storybook pour chaque composant
- **Tests visuels** : Validation des variantes et états
- **Tests d'accessibilité** : Conformité WCAG 2.1 AA
- **Guide d'utilisation** : Exemples et bonnes pratiques
- **Tests automatisés** : Intégration Vitest dans Storybook

## 🏗️ Architecture

### Structure des Stories

```
src/components/ui/
├── Button.stories.tsx          # Stories pour les boutons
├── Card.stories.tsx            # Stories pour les cartes
├── Input.stories.tsx           # Stories pour les champs
├── Navigation.stories.tsx      # Stories pour la navigation
└── Accessibility.stories.tsx   # Stories pour l'accessibilité
```

### Configuration Storybook

```
.storybook/
├── main.ts                     # Configuration principale
├── preview.ts                  # Configuration de prévisualisation
├── preview-head.html           # Head HTML personnalisé
└── decorators.ts               # Décorateurs globaux
```

## 📚 Composants Documentés

### 1. Button Component

**Fichier** : `src/components/ui/Button.stories.tsx`

**Stories incluses** :

- `Default` : Bouton de base
- `AllVariants` : Toutes les variantes (primary, secondary, ghost, destructive)
- `AllSizes` : Toutes les tailles (sm, md, lg)
- `States` : États (loading, disabled, hover)
- `WithIcons` : Boutons avec icônes
- `FullWidth` : Boutons pleine largeur
- `Accessibility` : Tests d'accessibilité

**Contrôles** :

- `variant` : Type de bouton
- `size` : Taille du bouton
- `loading` : État de chargement
- `disabled` : État désactivé
- `fullWidth` : Pleine largeur

### 2. Card Component

**Fichier** : `src/components/ui/Card.stories.tsx`

**Stories incluses** :

- `Default` : Carte de base
- `AllVariants` : Toutes les variantes (primary, dashboard, nutrition)
- `CompleteStructure` : Structure complète avec header, content, footer
- `States` : États (loading, clickable, hover)
- `RichContent` : Contenu riche avec images et actions
- `Accessibility` : Tests d'accessibilité

**Contrôles** :

- `variant` : Type de carte
- `loading` : État de chargement
- `clickable` : Carte cliquable
- `hover` : Effet de survol

### 3. Input Component

**Fichier** : `src/components/ui/Input.stories.tsx`

**Stories incluses** :

- `Default` : Champ de base
- `AllVariants` : Toutes les variantes (standard, search, textarea)
- `AllSizes` : Toutes les tailles (sm, md, lg)
- `States` : États (error, success, disabled)
- `WithIcons` : Champs avec icônes
- `Validation` : Validation et messages d'erreur
- `Accessibility` : Tests d'accessibilité

**Contrôles** :

- `variant` : Type de champ
- `size` : Taille du champ
- `error` : État d'erreur
- `disabled` : État désactivé
- `required` : Champ requis

### 4. Navigation Component

**Fichier** : `src/components/ui/Navigation.stories.tsx`

**Stories incluses** :

- `SidebarDefault` : Sidebar de base
- `SidebarCompact` : Sidebar compacte
- `TabsHorizontal` : Onglets horizontaux
- `TabsVertical` : Onglets verticaux
- `States` : États actifs et désactivés
- `Accessibility` : Tests d'accessibilité

**Contrôles** :

- `compact` : Mode compact pour la sidebar
- `orientation` : Orientation des onglets
- `size` : Taille des éléments

### 5. Accessibility Components

**Fichier** : `src/components/ui/Accessibility.stories.tsx`

**Stories incluses** :

- `AccessibilityTestDefault` : Tests d'accessibilité
- `AccessibilityAuditDefault` : Audit automatisé
- `AccessibilityPanelDefault` : Panel de préférences
- `CombinedAccessibility` : Combinaison de tous les composants
- `ContrastTests` : Tests de contraste
- `FocusTests` : Tests de focus
- `TouchTargetTests` : Tests de cibles tactiles

## 🎨 Décorateurs Globaux

### withNutriSensiaTheme

Applique le thème NutriSensia avec support du mode sombre.

```typescript
export const withNutriSensiaTheme: Decorator = (Story, context) => {
  const theme = context.globals.theme || 'light';

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <Story />
    </div>
  );
};
```

### withPadding

Ajoute un padding autour des stories pour une meilleure visualisation.

```typescript
export const withPadding: Decorator = (Story) => (
  <div className="p-32dp">
    <Story />
  </div>
);
```

### withCentered

Centre les composants dans leur conteneur.

```typescript
export const withCentered: Decorator = (Story) => (
  <div className="flex items-center justify-center min-h-screen">
    <Story />
  </div>
);
```

### Contexte Spécifique

- `withNavigationContext` : Contexte pour les composants de navigation
- `withFormContext` : Contexte pour les formulaires
- `withCardContext` : Contexte pour les cartes

## 🔧 Configuration Storybook

### main.ts

```typescript
import type { StorybookConfig } from '@storybook/nextjs-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y', // Tests d'accessibilité
    '@storybook/addon-vitest', // Tests automatisés
  ],
  framework: {
    name: '@storybook/nextjs-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

### preview.ts

```typescript
import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';
import { withNutriSensiaTheme } from './decorators';

const preview: Preview = {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'color-contrast', enabled: true },
          { id: 'focus-order-semantics', enabled: true },
        ],
      },
    },
    designToken: {
      light: {
        // Tokens de design pour le thème clair
      },
      dark: {
        // Tokens de design pour le thème sombre
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#ffffff' },
        { name: 'dark', value: '#1a1a1a' },
      ],
    },
    viewport: {
      viewports: {
        mobile: { name: 'Mobile', styles: { width: '375px', height: '667px' } },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1200px', height: '800px' },
        },
      },
    },
  },
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
  decorators: [withNutriSensiaTheme],
};

export default preview;
```

## 🧪 Tests d'Accessibilité

### Configuration axe-core

```typescript
// Dans preview.ts
a11y: {
  config: {
    rules: [
      { id: 'color-contrast', enabled: true },
      { id: 'focus-order-semantics', enabled: true },
      { id: 'landmark-one-main', enabled: true },
      { id: 'page-has-heading-one', enabled: true },
    ],
  },
  options: {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa'],
    },
  },
},
```

### Tests Automatisés

```typescript
// Dans les stories
export const Accessibility: Story = {
  render: () => <Button>Accessible Button</Button>,
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: 'button-name', enabled: true },
        ],
      },
    },
  },
};
```

## 📱 Responsive Design

### Viewports Configurés

- **Mobile** : 375px × 667px
- **Tablet** : 768px × 1024px
- **Desktop** : 1200px × 800px

### Utilisation dans les Stories

```typescript
export const MobileView: Story = {
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
  },
  render: () => <Button>Mobile Button</Button>,
};
```

## 🎨 Thèmes et Design Tokens

### Design Tokens

```typescript
designToken: {
  light: {
    'color-primary': '#2e7d5e',
    'color-secondary': '#3b82f6',
    'color-accent': '#f59e0b',
    'color-neutral-dark': '#1f2937',
    'color-neutral-medium': '#6b7280',
    'color-neutral-light': '#f3f4f6',
    'color-background-primary': '#ffffff',
    'color-background-secondary': '#f9fafb',
  },
  dark: {
    'color-primary': '#4ade80',
    'color-secondary': '#60a5fa',
    'color-accent': '#fbbf24',
    'color-neutral-dark': '#f9fafb',
    'color-neutral-medium': '#d1d5db',
    'color-neutral-light': '#374151',
    'color-background-primary': '#111827',
    'color-background-secondary': '#1f2937',
  },
},
```

## 🚀 Utilisation

### Démarrage de Storybook

```bash
npm run storybook
```

### Build de Production

```bash
npm run build-storybook
```

### Tests Automatisés

```bash
npm run test-storybook
```

## 📖 Bonnes Pratiques

### 1. Structure des Stories

```typescript
// 1. Meta avec documentation
const meta: Meta<typeof Component> = {
  title: 'Design System/Components/ComponentName',
  component: Component,
  parameters: {
    docs: {
      description: {
        component: `Description complète du composant...`,
      },
    },
  },
  argTypes: {
    // Contrôles interactifs
  },
  decorators: [withPadding],
};

// 2. Stories avec exemples variés
export const Default: Story = {
  render: () => <Component />,
};

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-16dp">
      <Component variant="primary" />
      <Component variant="secondary" />
    </div>
  ),
};
```

### 2. Documentation

- **Description complète** : Utiliser le paramètre `docs.description.component`
- **Exemples concrets** : Montrer les cas d'usage réels
- **Accessibilité** : Inclure des tests d'accessibilité
- **Responsive** : Tester sur différents viewports

### 3. Tests

- **Tests visuels** : Stories pour chaque variante
- **Tests d'accessibilité** : Utiliser l'addon a11y
- **Tests automatisés** : Intégrer Vitest
- **Tests interactifs** : Utiliser les contrôles

### 4. Performance

- **Lazy loading** : Charger les composants à la demande
- **Optimisation des images** : Utiliser des images optimisées
- **Bundle size** : Surveiller la taille des bundles

## 🔍 Monitoring et Maintenance

### Métriques à Surveiller

- **Temps de chargement** : Performance des stories
- **Couverture des tests** : Pourcentage de code testé
- **Violations d'accessibilité** : Nombre de violations WCAG
- **Utilisation des composants** : Fréquence d'utilisation

### Maintenance

- **Mise à jour régulière** : Storybook et addons
- **Révision des stories** : Vérifier la pertinence
- **Documentation** : Maintenir à jour
- **Tests** : Exécuter régulièrement

## 📚 Ressources

### Documentation Officielle

- [Storybook Documentation](https://storybook.js.org/docs)
- [Addon A11y](https://github.com/storybookjs/storybook/tree/main/addons/a11y)
- [Addon Vitest](https://github.com/storybookjs/addon-vitest)

### Guides NutriSensia

- [Design System Specs](../design-system-specs.md)
- [Accessibility Guide](./accessibility-guide.md)
- [UI Components Guide](./ui-components-guide.md)

### Outils Recommandés

- **Chromatic** : Tests visuels automatisés
- **Storybook Interactions** : Tests d'interaction
- **Storybook Accessibility** : Tests d'accessibilité
- **Storybook Vitest** : Tests unitaires

---

_Ce document fait partie du design system NutriSensia et doit être maintenu à jour avec les évolutions du système._
