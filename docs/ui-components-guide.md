# Guide des Composants UI - NutriSensia

## 📋 Vue d'ensemble

Ce guide présente tous les composants UI réutilisables du design system NutriSensia. Ces composants sont conçus pour être cohérents, accessibles et conformes aux standards suisses.

## 🎯 Composants disponibles

### 1. Boutons (Button)

#### Variantes disponibles

- **Primary** : Bouton principal pour les actions importantes
- **Secondary** : Bouton secondaire avec bordure
- **Ghost** : Bouton transparent pour les actions secondaires
- **Destructive** : Bouton rouge pour les actions destructives

#### Tailles disponibles

- **sm** : Petit (44dp de hauteur)
- **md** : Moyen (48dp de hauteur) - par défaut
- **lg** : Grand (56dp de hauteur)

#### Utilisation

```tsx
import { Button, PrimaryButton, SecondaryButton } from '@/components/ui';

// Bouton de base avec variante
<Button variant="primary" size="md">
  Mon Bouton
</Button>

// Composants pré-configurés
<PrimaryButton>Action principale</PrimaryButton>
<SecondaryButton>Action secondaire</SecondaryButton>
<GhostButton>Action discrète</GhostButton>
<DestructiveButton>Supprimer</DestructiveButton>

// États spéciaux
<Button loading>Chargement...</Button>
<Button disabled>Désactivé</Button>
<Button leftIcon={<PlusIcon />}>Avec icône</Button>
<Button fullWidth>Plein largeur</Button>
```

#### Props disponibles

- `variant` : Type de bouton ('primary' | 'secondary' | 'ghost' | 'destructive')
- `size` : Taille du bouton ('sm' | 'md' | 'lg')
- `loading` : État de chargement avec spinner
- `leftIcon` : Icône à gauche du texte
- `rightIcon` : Icône à droite du texte
- `fullWidth` : Bouton plein largeur
- `disabled` : État désactivé

### 2. Cartes (Card)

#### Variantes disponibles

- **Primary** : Carte standard avec ombre normale
- **Dashboard** : Carte pour tableau de bord avec ombre légère
- **Nutrition** : Carte spécialisée avec arrière-plan accent

#### Utilisation

```tsx
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui';

// Carte complète
<Card variant="primary">
  <CardHeader>
    <h3>Titre de la carte</h3>
  </CardHeader>
  <CardContent>
    <p>Contenu de la carte</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>

// Composants pré-configurés
<PrimaryCard>
  <CardContent>Carte primaire</CardContent>
</PrimaryCard>

<DashboardCard>
  <CardContent>Carte dashboard</CardContent>
</DashboardCard>

<NutritionCard>
  <CardContent>Carte nutrition</CardContent>
</NutritionCard>

// États spéciaux
<Card loading>
  <CardContent>Chargement...</CardContent>
</Card>

<Card clickable hover>
  <CardContent>Carte cliquable</CardContent>
</Card>
```

#### Props disponibles

- `variant` : Type de carte ('primary' | 'dashboard' | 'nutrition')
- `loading` : État de chargement avec skeleton
- `clickable` : Carte cliquable
- `hover` : Effet de survol
- `shadow` : Ombre personnalisée ('none' | 'sm' | 'md' | 'lg')

### 3. Champs de saisie (Input)

#### Variantes disponibles

- **Standard** : Champ de saisie classique
- **Search** : Champ de recherche arrondi
- **Textarea** : Zone de texte multi-lignes

#### Utilisation

```tsx
import { Input, Textarea, StandardInput, SearchInput } from '@/components/ui';

// Champ standard avec label
<Input
  label="Email"
  placeholder="votre@email.com"
  helperText="Nous ne partagerons jamais votre email"
  required
/>

// Champ avec erreur
<Input
  label="Mot de passe"
  type="password"
  error="Le mot de passe doit contenir au moins 8 caractères"
/>

// Champ de recherche
<SearchInput
  placeholder="Rechercher un patient..."
  leftIcon={<SearchIcon />}
/>

// Zone de texte
<Textarea
  label="Notes"
  placeholder="Saisissez vos notes..."
  rows={4}
  helperText="Maximum 500 caractères"
/>

// États spéciaux
<Input loading placeholder="Chargement..." />
<Input disabled placeholder="Champ désactivé" />
```

#### Props disponibles

- `variant` : Type d'input ('standard' | 'search' | 'textarea')
- `size` : Taille ('sm' | 'md' | 'lg')
- `label` : Label du champ
- `helperText` : Texte d'aide
- `error` : Message d'erreur
- `leftIcon` : Icône à gauche
- `rightIcon` : Icône à droite
- `loading` : État de chargement
- `fullWidth` : Champ plein largeur
- `required` : Champ requis

### 4. Navigation (Navigation)

#### Composants disponibles

- **Sidebar** : Barre latérale de navigation
- **Tabs** : Onglets horizontaux ou verticaux
- **TabPanel** : Contenu des onglets

#### Utilisation

```tsx
import { Sidebar, Tabs, TabPanel, NavigationItem } from '@/components/ui';

// Sidebar
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
      { id: 'list', label: 'Liste' },
      { id: 'add', label: 'Ajouter' },
    ],
  },
];

<Sidebar
  items={sidebarItems}
  activeItem="dashboard"
  onItemClick={(item) => console.log(item)}
/>

// Onglets
const tabs: NavigationItem[] = [
  { id: 'overview', label: 'Vue d\'ensemble' },
  { id: 'details', label: 'Détails' },
];

<Tabs
  tabs={tabs}
  activeTab="overview"
  onTabChange={(tab) => setActiveTab(tab.id)}
/>

<TabPanel tabId="overview" activeTab={activeTab}>
  <p>Contenu de la vue d'ensemble</p>
</TabPanel>
```

#### Props disponibles

**Sidebar :**

- `items` : Liste des éléments de navigation
- `activeItem` : Élément actif
- `onItemClick` : Fonction de clic
- `compact` : Mode compact (icônes uniquement)
- `width` : Largeur ('sm' | 'md' | 'lg')

**Tabs :**

- `tabs` : Liste des onglets
- `activeTab` : Onglet actif
- `onTabChange` : Fonction de changement
- `orientation` : Orientation ('horizontal' | 'vertical')
- `size` : Taille ('sm' | 'md' | 'lg')

## 🎨 Conformité au design system

### Couleurs

Tous les composants utilisent la palette de couleurs NutriSensia :

- **Primary** : #2E7D5E (vert principal)
- **Secondary** : #4A9B7B (vert secondaire)
- **Functional** : #22C55E (succès), #EF4444 (erreur), etc.

### Typographie

- **En-têtes** : text-h1, text-h2, text-h3, text-h4
- **Corps** : text-body-large, text-body, text-body-small
- **Spécial** : text-caption, text-button, text-label

### Espacement

Système d'espacement NutriSensia (2dp, 4dp, 8dp, 12dp, 16dp, 24dp, 32dp, 48dp, 64dp)

### Animations

- **Standard** : 200ms ease-out
- **Emphasis** : 300ms cubic-bezier
- **Micro** : 150ms ease-in-out

## ♿ Accessibilité

### Conformité WCAG AA

- **Contraste** : Minimum 4.5:1 pour le texte principal
- **Focus** : Anneaux de focus visibles avec Primary Green
- **Cibles tactiles** : Minimum 44dp pour tous les éléments interactifs

### Attributs ARIA

- Labels appropriés pour tous les composants
- Rôles ARIA corrects
- Navigation clavier supportée

### Support des lecteurs d'écran

- Textes alternatifs pour les icônes
- Messages d'erreur et d'aide annoncés
- États des composants clairement indiqués

## 📱 Responsive Design

### Mobile-first

Tous les composants sont conçus mobile-first avec :

- Tailles tactiles appropriées
- Espacement adaptatif
- Navigation optimisée pour mobile

### Breakpoints

- **sm** : 640px et plus
- **md** : 768px et plus
- **lg** : 1024px et plus
- **xl** : 1280px et plus

## 🧪 Tests et validation

### Page de test

Visitez `/ui-components` pour tester tous les composants en action.

### Tests inclus

- ✅ Toutes les variantes de boutons
- ✅ États de chargement et d'erreur
- ✅ Responsive design
- ✅ Accessibilité
- ✅ Animations et transitions

## 🔧 Personnalisation

### Classes CSS personnalisées

Vous pouvez ajouter des classes personnalisées via la prop `className` :

```tsx
<Button className='my-custom-class'>Bouton personnalisé</Button>
```

### Thème personnalisé

Les composants utilisent les variables CSS du design system pour permettre la personnalisation :

```css
:root {
  --color-primary: #2e7d5e;
  --color-secondary: #4a9b7b;
  /* ... autres variables */
}
```

## 📚 Bonnes pratiques

### 1. Utilisation cohérente

- Utilisez toujours les composants du design system
- Respectez la hiérarchie des couleurs
- Maintenez la cohérence des espacements

### 2. Accessibilité

- Ajoutez toujours des labels appropriés
- Testez avec les lecteurs d'écran
- Vérifiez les contrastes de couleurs

### 3. Performance

- Les composants sont optimisés pour les performances
- Utilisez les composants pré-configurés quand possible
- Évitez les surcharges CSS inutiles

### 4. Maintenance

- Documentez les modifications
- Testez sur différents navigateurs
- Validez l'accessibilité après les changements

## 🚀 Prochaines étapes

### Composants à venir

- **Modal** : Fenêtres modales et dialogues
- **Dropdown** : Menus déroulants
- **Table** : Tableaux de données
- **Form** : Formulaires complets
- **Toast** : Notifications toast
- **Progress** : Barres de progression

### Améliorations prévues

- Support du mode sombre avancé
- Animations plus sophistiquées
- Composants spécialisés pour la nutrition
- Intégration avec les icônes SVG
- Tests automatisés complets
