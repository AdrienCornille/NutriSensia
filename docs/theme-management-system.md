# Système de Gestion des Thèmes - NutriSensia

## Vue d'ensemble

Le système de gestion des thèmes de NutriSensia offre une solution complète pour la personnalisation des thèmes avec support du mode sombre, détection automatique des préférences système, et personnalisation en temps réel. Il respecte les standards d'accessibilité WCAG 2.1 AA et offre une expérience utilisateur fluide avec des transitions animées.

## Fonctionnalités Principales

### 🎨 Thèmes Disponibles

- **Clair** : Thème par défaut optimisé pour les environnements bien éclairés
- **Sombre** : Thème adapté aux environnements peu éclairés
- **Automatique** : Suit les préférences système de l'utilisateur

### 🔄 Détection Automatique

- Détection des préférences système (`prefers-color-scheme`)
- Synchronisation en temps réel avec les changements système
- Persistance des préférences utilisateur dans localStorage

### ⚙️ Personnalisation Avancée

- Couleurs personnalisées (primaire, secondaire, accent)
- Préférences d'accessibilité (contraste élevé, mouvement réduit, texte agrandi)
- Transitions fluides entre les thèmes

### ♿ Accessibilité

- Conformité WCAG 2.1 AA
- Support des lecteurs d'écran
- Navigation clavier complète
- Cibles tactiles minimales (48dp)

## Architecture

### Structure des Fichiers

```
src/
├── hooks/
│   └── useTheme.ts              # Hook principal de gestion des thèmes
├── contexts/
│   └── ThemeContext.tsx         # Contexte React pour les thèmes
├── components/ui/
│   ├── ThemeSelector.tsx        # Composants de sélection de thème
│   └── ThemeManagementTest.tsx  # Composant de test complet
├── app/
│   ├── theme-management/
│   │   └── page.tsx             # Page de test des thèmes
│   ├── providers.tsx            # Providers React (inclut ThemeProvider)
│   └── globals.css              # Styles globaux et transitions
└── tailwind.config.ts           # Configuration Tailwind avec variables CSS
```

### Hook useTheme

Le hook principal `useTheme` gère toute la logique de thème :

```typescript
const {
  // État
  theme, // Thème sélectionné ('light' | 'dark' | 'auto')
  mode, // Mode effectif ('light' | 'dark')
  isLoading, // État de chargement
  preferences, // Préférences utilisateur

  // Actions
  changeTheme, // Changer de thème
  toggleTheme, // Basculer entre clair/sombre
  updatePreferences, // Mettre à jour les préférences

  // Utilitaires
  isDark, // Est-ce le mode sombre ?
  isLight, // Est-ce le mode clair ?
  isAuto, // Est-ce le mode automatique ?

  // Configuration
  themeConfig, // Configuration des thèmes
} = useTheme();
```

### Contexte React

Le `ThemeContext` fournit le système de thème à toute l'application :

```typescript
// Provider principal
<ThemeProvider>
  <App />
</ThemeProvider>

// Utilisation dans les composants
const { theme, changeTheme } = useThemeContext();
```

## Composants

### ThemeSelector

Composant de sélection de thème avec trois variantes :

#### Variante Bouton Simple

```tsx
<ThemeSelector variant='button' size='md' />
```

#### Variante Toggle Switch

```tsx
<ThemeSelector variant='toggle' size='md' />
```

#### Variante Menu Déroulant

```tsx
<ThemeSelector variant='dropdown' showLabels={true} showDescriptions={true} />
```

### AccessibilityPreferences

Composant pour gérer les préférences d'accessibilité :

```tsx
<AccessibilityPreferences />
```

### ThemeDemo

Composant de démonstration complet :

```tsx
<ThemeDemo />
```

## Configuration

### Variables CSS

Le système utilise des variables CSS pour les couleurs :

```css
:root {
  --color-primary: #2e7d5e;
  --color-primary-white: #fafbfc;
  --color-primary-dark: #1b4f3f;
  --color-secondary: #4a9b7b;
  --color-secondary-pale: #e8f3ef;
  --color-secondary-sage: #b8d4c7;
  --color-accent-teal: #00a693;
  --color-accent-mint: #7fd1c1;
  --color-accent-orange: #f4a261;
  /* ... autres couleurs */
}

.dark {
  --color-primary: #4a9b7b;
  --color-background-primary: #1f2937;
  --color-background-secondary: #111827;
  /* ... couleurs du mode sombre */
}
```

### Configuration Tailwind

Les variables CSS sont intégrées dans Tailwind :

```typescript
// tailwind.config.ts
const config: Config = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2E7D5E',
          white: '#FAFBFC',
          dark: '#1B4F3F',
        },
        // ... autres couleurs
      },
    },
  },
  plugins: [
    function ({ addBase, theme }) {
      addBase({
        ':root': {
          '--color-primary': theme('colors.primary.DEFAULT'),
          // ... autres variables
        },
        '.dark': {
          '--color-primary': '#4A9B7B',
          // ... couleurs du mode sombre
        },
      });
    },
  ],
};
```

## Utilisation

### Installation

Le système est déjà intégré dans l'application. Pour l'utiliser :

1. **Provider** : Le `ThemeProvider` est déjà configuré dans `src/app/providers.tsx`
2. **Hook** : Importez `useThemeContext` dans vos composants
3. **Composants** : Utilisez les composants `ThemeSelector` et `AccessibilityPreferences`

### Exemple d'Utilisation

```tsx
import { useThemeContext } from '@/contexts/ThemeContext';
import { ThemeSelector } from '@/components/ui/ThemeSelector';

function MyComponent() {
  const { theme, changeTheme, isDark } = useThemeContext();

  return (
    <div className='bg-background-primary dark:bg-background-secondary'>
      <h1 className='text-neutral-dark dark:text-neutral-light'>
        Mon Composant
      </h1>

      <ThemeSelector variant='button' />

      <button
        onClick={() => changeTheme('dark')}
        className='bg-primary text-white px-4 py-2 rounded'
      >
        Passer au mode sombre
      </button>
    </div>
  );
}
```

### Classes CSS Utiles

```css
/* Transitions de thème */
.theme-transition {
  transition:
    background-color 0.3s ease,
    color 0.3s ease,
    border-color 0.3s ease,
    box-shadow 0.3s ease;
}

/* Préférences d'accessibilité */
.high-contrast {
  /* Contraste élevé */
}
.reduced-motion {
  /* Mouvement réduit */
}
.large-text {
  /* Texte agrandi */
}
```

## Préférences d'Accessibilité

### Contraste Élevé

- Augmente le contraste des couleurs
- Améliore la lisibilité pour les utilisateurs malvoyants

### Mouvement Réduit

- Désactive les animations et transitions
- Respecte la préférence système `prefers-reduced-motion`

### Texte Agrandi

- Augmente la taille de police de 20%
- Améliore la lisibilité pour les utilisateurs âgés

## Persistance des Données

### localStorage

Les préférences sont sauvegardées dans localStorage :

```javascript
// Clés utilisées
'nutrisensia-theme'; // Thème sélectionné
'nutrisensia-theme-preferences'; // Préférences complètes
```

### Structure des Données

```typescript
interface ThemePreferences {
  theme: 'light' | 'dark' | 'auto';
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  accessibility?: {
    highContrast: boolean;
    reducedMotion: boolean;
    largeText: boolean;
  };
}
```

## Tests

### Page de Test

Accédez à `/theme-management` pour tester toutes les fonctionnalités :

- **Démonstration** : Test des sélecteurs de thème
- **Personnalisation** : Test des couleurs personnalisées
- **Accessibilité** : Test des préférences d'accessibilité
- **Tests** : Informations système et tests de performance

### Tests Automatisés

```typescript
// Test du hook
import { renderHook, act } from '@testing-library/react';
import { useTheme } from '@/hooks/useTheme';

test('changeTheme updates theme correctly', () => {
  const { result } = renderHook(() => useTheme());

  act(() => {
    result.current.changeTheme('dark');
  });

  expect(result.current.theme).toBe('dark');
  expect(result.current.isDark).toBe(true);
});
```

## Performance

### Optimisations

1. **Transitions CSS** : Utilisation de transitions CSS pour les animations
2. **Lazy Loading** : Chargement différé des préférences
3. **Memoization** : Utilisation de `useCallback` pour les fonctions
4. **localStorage** : Persistance efficace des préférences

### Métriques

- **Changement de thème** : < 50ms
- **Chargement des préférences** : < 10ms
- **Détection système** : Temps réel

## Bonnes Pratiques

### Pour les Développeurs

1. **Utilisez les classes Tailwind** : `dark:` pour le mode sombre
2. **Testez les deux modes** : Vérifiez l'apparence en clair et sombre
3. **Respectez l'accessibilité** : Utilisez les classes d'accessibilité
4. **Transitions fluides** : Ajoutez `theme-transition` aux éléments

### Exemple de Composant

```tsx
function MyCard({ children }) {
  return (
    <div
      className='
      bg-white dark:bg-neutral-dark
      text-neutral-dark dark:text-neutral-light
      border border-neutral-border dark:border-neutral-medium
      rounded-lg p-4
      theme-transition
    '
    >
      {children}
    </div>
  );
}
```

### Pour les Designers

1. **Contraste** : Maintenez un ratio de contraste minimum de 4.5:1
2. **Couleurs** : Utilisez la palette NutriSensia définie
3. **Espacement** : Respectez le système d'espacement (2dp-64dp)
4. **Typographie** : Utilisez les tailles de police définies

## Dépannage

### Problèmes Courants

#### Le thème ne change pas

- Vérifiez que le `ThemeProvider` est bien configuré
- Vérifiez les erreurs dans la console
- Vérifiez que localStorage est disponible

#### Les transitions ne fonctionnent pas

- Vérifiez que la classe `theme-transition` est appliquée
- Vérifiez que `prefers-reduced-motion` n'est pas activé
- Vérifiez les styles CSS

#### Les couleurs personnalisées ne s'appliquent pas

- Vérifiez que les variables CSS sont correctement définies
- Vérifiez que Tailwind est configuré pour utiliser les variables
- Vérifiez que les couleurs sont au format hexadécimal

### Debug

```typescript
// Debug des préférences
const { preferences } = useThemeContext();
console.log('Préférences:', preferences);

// Debug du thème actuel
const { theme, mode } = useThemeContext();
console.log('Thème:', theme, 'Mode:', mode);
```

## Évolutions Futures

### Fonctionnalités Prévues

1. **Thèmes saisonniers** : Thèmes automatiques selon la saison
2. **Thèmes personnalisés** : Création de thèmes par l'utilisateur
3. **Synchronisation cloud** : Sauvegarde des préférences en ligne
4. **Thèmes par organisation** : Thèmes spécifiques aux clients

### API Extensions

```typescript
// Futures extensions
interface ExtendedThemePreferences extends ThemePreferences {
  seasonal?: boolean;
  customTheme?: {
    name: string;
    colors: CustomColorPalette;
  };
  organization?: {
    id: string;
    theme: OrganizationTheme;
  };
}
```

## Support

### Documentation

- **Guide d'accessibilité** : `docs/accessibility-guide.md`
- **Guide des composants UI** : `docs/ui-components-guide.md`
- **Guide Tailwind** : `docs/tailwind-usage.md`

### Ressources

- **WCAG 2.1 AA** : Standards d'accessibilité
- **Tailwind CSS** : Framework CSS
- **React Context** : Gestion d'état React

---

_Documentation mise à jour le 2024-12-19_
