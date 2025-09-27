# Système de Suivi de Complétude du Profil

## Vue d'ensemble

Le système de suivi de complétude du profil de NutriSensia est un ensemble complet d'outils conçus pour guider les utilisateurs dans la création et l'amélioration de leurs profils. Il fournit une expérience d'onboarding personnalisée et des recommandations intelligentes pour optimiser la complétude des profils.

## Fonctionnalités principales

### 1. Calcul de complétude intelligent
- **Algorithme pondéré** : Chaque champ a un poids différent selon son importance
- **Catégorisation** : Les champs sont organisés en catégories (basique, professionnel, médical, contact, préférences)
- **Niveaux de complétude** : Incomplet (< 40%), Basique (40-69%), Bien (70-89%), Excellent (90%+)
- **Recommandations personnalisées** : Suggestions basées sur le rôle et le niveau actuel

### 2. Interface utilisateur moderne
- **Progression circulaire animée** : Visualisation claire du pourcentage de complétude
- **Détail par catégorie** : Progression spécifique pour chaque section du profil
- **Guide d'onboarding interactif** : Parcours guidé étape par étape
- **Paramètres de confidentialité** : Contrôle granulaire de la visibilité des informations

### 3. Optimisations techniques
- **TanStack Query** : Mise en cache intelligente et gestion d'état optimisée
- **TypeScript complet** : Typage strict pour une meilleure sécurité
- **Hooks personnalisés** : API réutilisable et maintenable
- **Validation Zod** : Intégration avec les schémas de validation existants

## Architecture du système

### Composants principaux

```
src/
├── lib/
│   └── profile-completion.ts      # Algorithme de calcul et types
├── hooks/
│   └── useProfileCompletion.ts    # Hooks pour TanStack Query
└── components/profile/
    ├── ProfileCompletionCard.tsx       # Carte de progression circulaire
    ├── ProfileProgressBar.tsx          # Barre de progression détaillée
    ├── ProfileOnboardingGuide.tsx      # Guide d'onboarding interactif
    ├── ProfilePrivacySettings.tsx      # Interface de confidentialité
    ├── ProfileCompletionDashboard.tsx  # Tableau de bord principal
    └── index.ts                        # Exports centralisés
```

### Flux de données

1. **Récupération des données** : Les données de profil sont passées aux composants
2. **Calcul de complétude** : L'algorithme analyse les champs et calcule les pourcentages
3. **Mise en cache** : TanStack Query optimise les performances avec un cache intelligent
4. **Rendu interactif** : Les composants affichent la progression avec animations
5. **Actions utilisateur** : Navigation guidée vers les sections à compléter

## Guide d'utilisation

### Installation et configuration

1. **Dépendances requises** :
```json
{
  "@tanstack/react-query": "^5.x",
  "framer-motion": "^10.x",
  "react-hook-form": "^7.x",
  "zod": "^3.x"
}
```

2. **Configuration TanStack Query** :
Le système utilise la configuration existante dans `src/app/providers.tsx`.

### Utilisation de base

```tsx
import { ProfileCompletionDashboard } from '@/components/profile';

function ProfilePage() {
  const profileData = {
    first_name: 'Marie',
    last_name: 'Dubois',
    // ... autres données du profil
  };

  return (
    <ProfileCompletionDashboard
      profileData={profileData}
      role="nutritionist"
      onEditProfile={() => {/* Navigation vers édition */}}
      onEditField={(field) => {/* Navigation vers champ spécifique */}}
    />
  );
}
```

### Composants individuels

#### 1. Carte de complétude compacte
```tsx
import { ProfileCompletionCard } from '@/components/profile';

<ProfileCompletionCard
  profileData={profileData}
  role="patient"
  compact={true}
  onEditProfile={handleEdit}
/>
```

#### 2. Progression détaillée
```tsx
import { ProfileProgressBar } from '@/components/profile';

<ProfileProgressBar
  profileData={profileData}
  role="nutritionist"
  onNavigateToSection={handleNavigation}
  orientation="horizontal"
/>
```

#### 3. Guide d'onboarding
```tsx
import { ProfileOnboardingGuide } from '@/components/profile';

<ProfileOnboardingGuide
  profileData={profileData}
  role="patient"
  onEditField={handleFieldEdit}
  onComplete={handleComplete}
  autoShow={true}
/>
```

### Hooks personnalisés

#### Hook principal
```tsx
import { useProfileCompletion } from '@/hooks/useProfileCompletion';

function MyComponent() {
  const { 
    completion, 
    isLoading, 
    estimatedTime,
    progressToNextLevel 
  } = useProfileCompletion({
    profileData,
    role: 'nutritionist'
  });

  return (
    <div>
      <p>Complétude: {completion?.percentage}%</p>
      <p>Temps estimé: {estimatedTime} minutes</p>
    </div>
  );
}
```

#### Hooks utilitaires
```tsx
import { 
  useProfileCompletionPercentage,
  useCriticalMissingFields,
  useProfileLevelCheck
} from '@/hooks/useProfileCompletion';

// Récupérer seulement le pourcentage
const percentage = useProfileCompletionPercentage(profileData, role);

// Récupérer les champs critiques manquants
const criticalFields = useCriticalMissingFields(profileData, role);

// Vérifier si le profil atteint un niveau minimum
const isBasicLevel = useProfileLevelCheck(profileData, role, 'basic');
```

## Configuration des champs

### Poids et priorités

Les champs sont configurés avec des poids (1-10) et des priorités :

- **Critique** : Champs essentiels pour la fonctionnalité de base
- **Important** : Champs qui améliorent significativement l'expérience
- **Optionnel** : Champs qui personnalisent l'expérience

### Champs par rôle

#### Nutritionnistes
- **Champs critiques** : Nom, prénom, spécialisations, adresse cabinet
- **Champs importants** : Certifications (ASCA/RME), bio, tarifs, téléphone
- **Champs optionnels** : Photo, code EAN

#### Patients
- **Champs critiques** : Nom, prénom, taille, poids initial, allergies
- **Champs importants** : Date de naissance, objectifs, restrictions alimentaires
- **Champs optionnels** : Photo, contact d'urgence

## Personnalisation

### Modification des seuils de niveau
```typescript
// Dans profile-completion.ts
function calculateProfileCompletion(profileData, role) {
  // Modifier ces valeurs pour ajuster les seuils
  if (percentage < 40) level = 'incomplete';      // Seuil incomplet
  else if (percentage < 70) level = 'basic';      // Seuil basique
  else if (percentage < 90) level = 'good';       // Seuil bien
  else level = 'excellent';                       // Seuil excellent
}
```

### Ajout de nouveaux champs
```typescript
// Ajouter dans NUTRITIONIST_FIELDS ou PATIENT_FIELDS
{
  name: 'nouveau_champ',
  weight: 5,                    // Importance (1-10)
  priority: 'important',        // critical | important | optional
  label: 'Nouveau champ',
  description: 'Description du champ',
  category: 'professional'      // basic | professional | medical | contact | preferences
}
```

### Personnalisation des couleurs et animations
```tsx
// Modifier les classes Tailwind dans les composants
const colorClasses = {
  blue: 'bg-blue-500',
  purple: 'bg-purple-500',
  // Ajouter de nouvelles couleurs
  custom: 'bg-gradient-to-r from-pink-500 to-violet-500'
};
```

## Intégration avec l'application existante

### 1. Pages de profil
Intégrez le tableau de bord complet dans vos pages de profil existantes.

### 2. Navigation
Configurez les callbacks pour naviguer vers vos formulaires d'édition.

### 3. Sauvegarde
Implémentez les handlers de sauvegarde pour persister les paramètres de confidentialité.

### 4. Authentification
Le système s'intègre avec le contexte d'authentification existant.

## Performances et optimisations

### Cache TanStack Query
- **Durée de cache** : 5 minutes par défaut
- **Invalidation automatique** : Lors des mises à jour de profil
- **Mise en cache par rôle** : Séparation des données par type d'utilisateur

### Rendu optimisé
- **Lazy loading** : Chargement différé des composants complexes
- **Animations performantes** : Utilisation de Framer Motion avec GPU
- **Memoization** : Calculs coûteux mis en cache

## Tests et validation

### Tests unitaires
```bash
# Tester l'algorithme de calcul
npm test profile-completion.test.ts

# Tester les hooks
npm test useProfileCompletion.test.ts
```

### Tests d'intégration
```bash
# Tester les composants
npm test ProfileCompletionCard.test.tsx
```

### Validation des données
Le système utilise les schémas Zod existants pour valider les données d'entrée.

## Accessibilité

- **Navigation au clavier** : Support complet de la navigation clavier
- **Lecteurs d'écran** : Labels ARIA appropriés
- **Contraste** : Respect des guidelines WCAG 2.1
- **Focus management** : Gestion appropriée du focus

## Déploiement et monitoring

### Variables d'environnement
Aucune variable spécifique requise - utilise la configuration Supabase existante.

### Monitoring
- **Métriques de complétude** : Suivez les taux de complétude par rôle
- **Taux de conversion** : Mesurez l'efficacité de l'onboarding
- **Performance** : Surveillez les temps de chargement

## Support et maintenance

### Logs et debugging
Le système inclut des logs détaillés en mode développement.

### Mise à jour des champs
Pour ajouter ou modifier des champs, mettez à jour la configuration dans `profile-completion.ts`.

### Compatibilité
Compatible avec React 18+ et Next.js 13+.

---

Ce système de suivi de complétude du profil fournit une base solide pour améliorer l'expérience utilisateur et augmenter l'engagement sur la plateforme NutriSensia.



