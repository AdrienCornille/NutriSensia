# Système de Layout Responsive - NutriSensia

## 📋 Vue d'ensemble

Ce document décrit le système de layout responsive implémenté pour NutriSensia, offrant des composants et utilitaires pour créer des interfaces adaptatives sur tous les appareils.

## 🎯 Objectifs

- **Responsive Design** : Adaptation automatique selon les breakpoints
- **Consistance** : Respect du design system NutriSensia
- **Performance** : Optimisation pour mobile et desktop
- **Accessibilité** : Support WCAG 2.1 AA
- **Flexibilité** : Composants configurables et réutilisables

## 🏗️ Architecture

### Breakpoints Utilisés

```css
/* Mobile First */
sm: 640px   /* Tablettes */
md: 768px   /* Tablettes larges */
lg: 1024px  /* Desktop */
xl: 1280px  /* Desktop large */
```

### Système d'Espacement

Basé sur le design system NutriSensia :

- **xs**: 4dp (0.25rem)
- **sm**: 8dp (0.5rem)
- **md**: 16dp (1rem)
- **lg**: 24dp (1.5rem)
- **xl**: 32dp (2rem)
- **2xl**: 48dp (3rem)
- **3xl**: 64dp (4rem)

## 📦 Composants Disponibles

### 1. Container

Composant de base pour structurer le contenu avec différentes variantes.

```tsx
import { Container } from '@/components/layout';

// Utilisation de base
<Container>
  <p>Contenu centré avec largeur maximale</p>
</Container>

// Variantes disponibles
<Container variant="narrow">Contenu focalisé</Container>
<Container variant="wide">Dashboard large</Container>

// Tailles
<Container size="sm">640px max</Container>
<Container size="md">768px max</Container>
<Container size="lg">1024px max</Container>
<Container size="xl">1280px max</Container>
<Container size="full">100% largeur</Container>

// Espacement
<Container padding="none">Sans padding</Container>
<Container padding="sm">16dp padding</Container>
<Container padding="md">24dp padding</Container>
<Container padding="lg">32dp padding</Container>
<Container padding="xl">48dp padding</Container>
```

### 2. Grid & Flexbox

Système de grille flexible avec support responsive.

```tsx
import { Grid, GridItem, Flex, FlexItem } from '@/components/layout';

// Grille responsive
<Grid cols={1} colsMd={2} colsLg={3} gap="md">
  <GridItem span={1}>Élément 1</GridItem>
  <GridItem span={2} spanMd={1}>Élément 2</GridItem>
  <GridItem span={1}>Élément 3</GridItem>
</Grid>

// Flexbox responsive
<Flex direction="col" directionMd="row" gap="md" align="center">
  <FlexItem grow>Élément flexible</FlexItem>
  <FlexItem basis="1/3">Élément fixe</FlexItem>
</Flex>
```

### 3. Navigation Responsive

Composants de navigation adaptatifs.

```tsx
import {
  ResponsiveSidebar,
  ResponsiveTabs,
  ResponsiveTab,
  MobileNavigation
} from '@/components/layout';

// Sidebar responsive
<ResponsiveSidebar variant="overlay" width="md">
  <nav>Contenu de navigation</nav>
</ResponsiveSidebar>

// Onglets responsive
<ResponsiveTabs orientation="horizontal" variant="default">
  <ResponsiveTab isActive>Onglet 1</ResponsiveTab>
  <ResponsiveTab>Onglet 2</ResponsiveTab>
</ResponsiveTabs>

// Navigation mobile
<MobileNavigation variant="bottom">
  <nav>Navigation mobile</nav>
</MobileNavigation>
```

### 4. Espacement Responsive

Utilitaires d'espacement adaptatifs.

```tsx
import { Spacing, Margin, Stack } from '@/components/layout';

// Espacement responsive
<Spacing size="md" direction="all" responsive>
  <p>Contenu avec espacement adaptatif</p>
</Spacing>

// Marges responsive
<Margin size="lg" direction="y" responsive>
  <p>Contenu avec marges adaptatives</p>
</Margin>

// Stack responsive
<Stack spacing="md" direction="vertical" responsive>
  <div>Élément 1</div>
  <div>Élément 2</div>
  <div>Élément 3</div>
</Stack>
```

### 5. Typographie Responsive

Composants de texte adaptatifs.

```tsx
import { ResponsiveHeading, ResponsiveText, ResponsiveList } from '@/components/layout';

// Titres responsives
<ResponsiveHeading level={1} responsive>
  Titre principal adaptatif
</ResponsiveHeading>

// Texte responsive
<ResponsiveText variant="body" responsive>
  Texte de contenu adaptatif
</ResponsiveText>

// Liste responsive
<ResponsiveList variant="ul" spacing="md" responsive>
  <li>Élément 1</li>
  <li>Élément 2</li>
  <li>Élément 3</li>
</ResponsiveList>
```

### 6. Tableaux Responsives

Solutions pour tableaux adaptatifs.

```tsx
import {
  ResponsiveTable,
  ResponsiveTableHead,
  ResponsiveTableBody,
  ResponsiveTableRow,
  ResponsiveTableCell
} from '@/components/layout';

// Tableau avec défilement horizontal
<ResponsiveTable variant="striped" responsive="scroll">
  <ResponsiveTableHead>
    <ResponsiveTableRow>
      <ResponsiveTableCell variant="header">Colonne 1</ResponsiveTableCell>
      <ResponsiveTableCell variant="header">Colonne 2</ResponsiveTableCell>
    </ResponsiveTableRow>
  </ResponsiveTableHead>
  <ResponsiveTableBody>
    <ResponsiveTableRow>
      <ResponsiveTableCell>Donnée 1</ResponsiveTableCell>
      <ResponsiveTableCell>Donnée 2</ResponsiveTableCell>
    </ResponsiveTableRow>
  </ResponsiveTableBody>
</ResponsiveTable>

// Tableau en cartes (mobile)
<ResponsiveTable variant="default" responsive="cards">
  <ResponsiveTableHead>
    <ResponsiveTableRow>
      <ResponsiveTableCell variant="header">Nom</ResponsiveTableCell>
      <ResponsiveTableCell variant="header">Statut</ResponsiveTableCell>
    </ResponsiveTableRow>
  </ResponsiveTableHead>
  <ResponsiveTableBody>
    <ResponsiveTableRow>
      <ResponsiveTableCell label="Nom">Marie Dupont</ResponsiveTableCell>
      <ResponsiveTableCell label="Statut">Actif</ResponsiveTableCell>
    </ResponsiveTableRow>
  </ResponsiveTableBody>
</ResponsiveTable>
```

## 🎨 Stratégies d'Adaptation

### 1. Mobile First

Tous les composants suivent l'approche "Mobile First" :

- Styles de base pour mobile
- Media queries pour écrans plus grands
- Optimisation des performances

### 2. Stratégies de Tableaux

#### Défilement Horizontal

- Maintient la structure tabulaire
- Défilement horizontal sur mobile
- Idéal pour tableaux avec nombreuses colonnes

#### Empilement Vertical

- Transforme les lignes en blocs
- Affiche les labels avant les valeurs
- Idéal pour tableaux simples

#### Transformation en Cartes

- Chaque ligne devient une carte
- Labels intégrés dans les cartes
- Idéal pour tableaux complexes

### 3. Navigation Adaptative

#### Desktop

- Sidebar fixe 240dp de largeur
- Navigation complète visible
- Onglets horizontaux

#### Mobile

- Sidebar en overlay
- Navigation mobile en bas d'écran
- Onglets verticaux ou hamburger menu

## 📱 États des Fonctionnalités

### Phase 1 : Layouts de Base

- ✅ Conteneurs responsives
- ✅ Grille et flexbox
- ✅ Navigation adaptative
- ✅ Espacement responsive

### Phase 2 : Contenu Adaptatif

- ✅ Typographie responsive
- ✅ Tableaux responsives
- ✅ Composants de test

### Phase 3 : Optimisations

- ⏳ Performance mobile
- ⏳ Animations adaptatives
- ⏳ Tests d'accessibilité

## 🧪 Tests et Validation

### Page de Test

Accédez à `/responsive-layout` pour tester tous les composants :

- **Conteneurs** : Différentes variantes et tailles
- **Grille & Flexbox** : Layouts responsives
- **Navigation** : Sidebar et onglets adaptatifs
- **Espacement** : Utilitaires d'espacement
- **Typographie** : Textes et titres responsives
- **Tableaux** : Stratégies d'adaptation

### Tests Responsive

1. **Mobile (320px-640px)**
   - Vérifier l'adaptation des conteneurs
   - Tester la navigation mobile
   - Valider les tableaux en cartes

2. **Tablette (640px-1024px)**
   - Vérifier les breakpoints intermédiaires
   - Tester les grilles adaptatives
   - Valider l'espacement responsive

3. **Desktop (1024px+)**
   - Vérifier les layouts complets
   - Tester la sidebar fixe
   - Valider les tableaux complets

## 🔧 Utilisation Avancée

### Combinaison de Composants

```tsx
// Layout complexe responsive
<Container variant='wide' padding='lg'>
  <ResponsiveHeading level={1} responsive>
    Dashboard Nutritionniste
  </ResponsiveHeading>

  <Grid cols={1} colsMd={2} colsLg={3} gap='lg'>
    <GridItem>
      <Card>
        <CardHeader>
          <ResponsiveHeading level={3}>Patients Actifs</ResponsiveHeading>
        </CardHeader>
        <CardContent>
          <ResponsiveText variant='body-large' responsive>
            24 patients actuellement suivis
          </ResponsiveText>
        </CardContent>
      </Card>
    </GridItem>

    <GridItem>
      <Card>
        <CardHeader>
          <ResponsiveHeading level={3}>
            Consultations Aujourd'hui
          </ResponsiveHeading>
        </CardHeader>
        <CardContent>
          <ResponsiveText variant='body-large' responsive>
            8 consultations programmées
          </ResponsiveText>
        </CardContent>
      </Card>
    </GridItem>
  </Grid>
</Container>
```

### Personnalisation

```tsx
// Composant personnalisé avec layout responsive
function PatientDashboard() {
  return (
    <Container variant='wide'>
      <ResponsiveSidebar variant='default'>
        <PatientNavigation />
      </ResponsiveSidebar>

      <Flex direction='col' className='flex-1'>
        <ResponsiveTabs>
          <ResponsiveTab isActive>Vue d'ensemble</ResponsiveTab>
          <ResponsiveTab>Détails</ResponsiveTab>
        </ResponsiveTabs>

        <Spacing size='lg' responsive>
          <PatientList />
        </Spacing>
      </Flex>
    </Container>
  );
}
```

## 📚 Bonnes Pratiques

### 1. Mobile First

- Commencer par les styles mobile
- Ajouter les media queries progressivement
- Tester sur de vrais appareils

### 2. Performance

- Utiliser les classes Tailwind optimisées
- Éviter les calculs CSS complexes
- Optimiser les images et médias

### 3. Accessibilité

- Maintenir les ratios de contraste
- Assurer la navigation clavier
- Tester avec les lecteurs d'écran

### 4. Consistance

- Respecter le design system
- Utiliser les espacements standardisés
- Maintenir la cohérence visuelle

## 🚀 Prochaines Étapes

1. **Tests d'Accessibilité**
   - Validation WCAG 2.1 AA
   - Tests avec lecteurs d'écran
   - Navigation clavier complète

2. **Optimisations Performance**
   - Lazy loading des composants
   - Optimisation des animations
   - Réduction du bundle size

3. **Fonctionnalités Avancées**
   - Layouts dynamiques
   - Thèmes personnalisables
   - Composants spécialisés

## 📖 Références

- [Design System NutriSensia](./design-system-specs.md)
- [Guide d'Accessibilité](./accessibility-guide.md)
- [Documentation Tailwind CSS](https://tailwindcss.com/docs)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
