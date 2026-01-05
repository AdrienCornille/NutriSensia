# Guide du Système d'Onboarding NutriSensia

## Vue d'ensemble

Le système d'onboarding de NutriSensia guide les nouveaux utilisateurs à travers une configuration personnalisée selon leur rôle (nutritionniste, patient, administrateur). Il utilise une approche modulaire avec des assistants multi-étapes, une sauvegarde automatique et des analytics pour optimiser l'expérience utilisateur.

## 🏗️ Architecture

### Composants Principaux

```
src/components/onboarding/
├── WizardLayout.tsx          # Layout principal des assistants
├── StepIndicator.tsx         # Indicateur de progression
├── nutritionist/             # Onboarding spécifique aux nutritionnistes
│   ├── NutritionistOnboardingWizard.tsx
│   └── steps/               # Étapes individuelles
│       ├── WelcomeStep.tsx
│       ├── PersonalInfoStep.tsx
│       ├── CredentialsStep.tsx
│       ├── PracticeDetailsStep.tsx
│       ├── SpecializationsStep.tsx
│       ├── ConsultationRatesStep.tsx
│       ├── PlatformTrainingStep.tsx
│       └── CompletionStep.tsx
├── patient/                 # À implémenter
└── admin/                   # À implémenter
```

### Types et Schémas

```
src/types/onboarding.ts      # Types TypeScript
src/lib/onboarding-schemas.ts # Schémas de validation Zod
src/hooks/useOnboardingProgress.ts # Hook de gestion de la progression
```

### Base de Données

```sql
-- Tables principales
onboarding_progress          # Progression en temps réel
user_onboarding             # Données finales
onboarding_analytics        # Analytics et événements
```

## 🚀 Utilisation

### Onboarding Nutritionniste

```tsx
import { NutritionistOnboardingWizard } from '@/components/onboarding/nutritionist';

function OnboardingPage() {
  const handleComplete = async (data: NutritionistOnboardingData) => {
    // Sauvegarder les données
    await saveNutritionistProfile(data);
    router.push('/dashboard/nutritionist');
  };

  return (
    <NutritionistOnboardingWizard
      userId={user.id}
      onComplete={handleComplete}
      onClose={() => router.push('/dashboard')}
      initialData={existingData}
    />
  );
}
```

### Hook de Progression

```tsx
import { useOnboardingProgress } from '@/hooks/useOnboardingProgress';

const { progress, updateProgress, completeStep, skipStep, isLoading, error } =
  useOnboardingProgress({
    userId: 'user-id',
    role: 'nutritionist',
    steps: NUTRITIONIST_STEPS,
  });
```

## 📊 Fonctionnalités

### ✅ Implémentées

#### Onboarding Nutritionnistes

- **Étape 1 - Bienvenue** : Présentation de la plateforme
- **Étape 2 - Informations personnelles** : Nom, téléphone, langue, fuseau horaire
- **Étape 3 - Identifiants professionnels** : Numéros ASCA, RME, EAN (optionnel)
- **Étape 4 - Détails du cabinet** : Adresse, types de consultation, langues
- **Étape 5 - Spécialisations** : Domaines d'expertise, biographie, certifications
- **Étape 6 - Tarifs** : Configuration des tarifs de consultation
- **Étape 7 - Formation plateforme** : Tour guidé des fonctionnalités (optionnel)
- **Étape 8 - Finalisation** : Révision et acceptation des conditions

#### Fonctionnalités Transversales

- **Sauvegarde automatique** : Progression sauvée en temps réel
- **Validation en temps réel** : Utilisation de Zod pour la validation
- **Indicateur de progression** : Barre de progression et étapes visuelles
- **Navigation flexible** : Retour en arrière, passage d'étapes optionnelles
- **Responsive design** : Adapté à tous les écrans
- **Animations fluides** : Transitions avec Framer Motion
- **Persistance locale** : Sauvegarde dans localStorage en backup
- **Analytics** : Suivi des événements pour optimisation

### 🔄 En Cours de Développement

- **Onboarding Patients** : Assistant pour les patients
- **Onboarding Administrateurs** : Configuration système
- **Tests automatisés** : Tests unitaires et d'intégration
- **A/B Testing** : Infrastructure pour tester différentes approches

### 📋 À Faire

- **Notifications push** : Rappels pour compléter l'onboarding
- **Onboarding mobile** : Optimisation pour applications mobiles
- **Import/Export** : Sauvegarde et restauration des données
- **Templates** : Modèles prédéfinis pour différents types de pratiques
- **Multi-langues** : Support complet de plusieurs langues

## 🔧 Configuration

### Variables d'Environnement

```env
# Supabase (requis)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Analytics (optionnel)
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id
```

### Base de Données

1. Exécuter le script de migration :

```bash
psql -f scripts/onboarding-schema.sql
```

2. Vérifier les tables créées :

```sql
SELECT * FROM onboarding_progress;
SELECT * FROM user_onboarding;
SELECT * FROM onboarding_analytics;
```

### Permissions Supabase

Assurez-vous que les politiques RLS sont correctement configurées :

```sql
-- Vérifier les politiques
SELECT * FROM pg_policies WHERE tablename IN ('onboarding_progress', 'user_onboarding');
```

## 📈 Analytics et Métriques

### Événements Trackés

- `ONBOARDING_STARTED` : Début de l'onboarding
- `STEP_STARTED` : Début d'une étape
- `STEP_COMPLETED` : Fin d'une étape
- `STEP_SKIPPED` : Étape passée
- `VALIDATION_ERROR` : Erreur de validation
- `ONBOARDING_COMPLETED` : Onboarding terminé
- `ONBOARDING_ABANDONED` : Onboarding abandonné

### Métriques Clés

```sql
-- Taux de completion par rôle
SELECT * FROM onboarding_stats;

-- Événements récents
SELECT * FROM recent_onboarding_events;

-- Points d'abandon
SELECT
    step_id,
    COUNT(*) as abandons
FROM onboarding_analytics
WHERE event_type = 'ONBOARDING_ABANDONED'
GROUP BY step_id
ORDER BY abandons DESC;
```

## 🎨 Personnalisation

### Thèmes et Styles

Le système utilise Tailwind CSS avec des variables CSS personnalisables :

```css
:root {
  --onboarding-primary: #3b82f6;
  --onboarding-secondary: #6366f1;
  --onboarding-success: #10b981;
  --onboarding-warning: #f59e0b;
  --onboarding-error: #ef4444;
}
```

### Ajout d'Étapes

Pour ajouter une nouvelle étape :

1. Créer le composant dans `steps/`
2. Ajouter la configuration dans le wizard principal
3. Mettre à jour les types et schémas
4. Ajouter les tests

Exemple :

```tsx
// steps/NewStep.tsx
export const NewStep: React.FC<StepProps> = ({
  data,
  onDataChange,
  onNext,
}) => {
  // Implémentation de l'étape
};

// Dans le wizard principal
const STEPS = [
  // ... autres étapes
  {
    id: 'new-step',
    title: 'Nouvelle Étape',
    description: 'Description de la nouvelle étape',
    icon: <Icon className='h-5 w-5' />,
    estimatedTime: 5,
    isRequired: true,
    canSkip: false,
  },
];
```

## 🧪 Tests

### Tests Unitaires

```bash
npm run test:unit -- src/components/onboarding
```

### Tests d'Intégration

```bash
npm run test:integration -- src/app/onboarding
```

### Tests E2E

```bash
npm run test:e2e -- cypress/integration/onboarding
```

## 🚨 Dépannage

### Problèmes Courants

#### Progression Non Sauvegardée

- Vérifier les permissions Supabase
- Contrôler la connexion réseau
- Consulter les logs de la console

#### Validation Échouée

- Vérifier les schémas Zod
- Contrôler les données d'entrée
- Tester avec des données valides

#### Performance Lente

- Optimiser les requêtes Supabase
- Réduire la fréquence de sauvegarde automatique
- Utiliser la mise en cache appropriée

### Logs et Debug

```tsx
// Activer les logs détaillés
const debugMode = process.env.NODE_ENV === 'development';

if (debugMode) {
  console.log('Onboarding Debug:', { progress, data, step });
}
```

## 📚 Ressources

### Documentation Technique

- [Types TypeScript](../src/types/onboarding.ts)
- [Schémas de Validation](../src/lib/onboarding-schemas.ts)
- [Hook de Progression](../src/hooks/useOnboardingProgress.ts)

### Design System

- [Composants UI](../src/components/ui/)
- [Guide Tailwind](./tailwind-usage.md)
- [Animations Framer Motion](https://www.framer.com/motion/)

### APIs et Intégrations

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase Database](https://supabase.com/docs/guides/database)
- [React Hook Form](https://react-hook-form.com/)
- [Zod Validation](https://zod.dev/)

## 🤝 Contribution

### Processus de Développement

1. **Fork** le repository
2. **Créer** une branche feature (`git checkout -b feature/nouvelle-etape`)
3. **Commiter** les changements (`git commit -am 'Ajouter nouvelle étape'`)
4. **Push** la branche (`git push origin feature/nouvelle-etape`)
5. **Créer** une Pull Request

### Standards de Code

- **TypeScript strict** activé
- **ESLint** et **Prettier** configurés
- **Tests** requis pour nouvelles fonctionnalités
- **Documentation** mise à jour

### Guidelines UI/UX

- **Accessibility** : Support WCAG 2.1 AA
- **Mobile-first** : Design responsive obligatoire
- **Performance** : Lighthouse score > 90
- **Internationalization** : Support multi-langues prévu

---

_Ce guide sera mis à jour régulièrement avec les nouvelles fonctionnalités et améliorations du système d'onboarding._
