# Guide des Formulaires d'Édition de Profil

## Vue d'ensemble

Les formulaires d'édition de profil de NutriSensia permettent aux utilisateurs de modifier leurs informations personnelles et professionnelles de manière intuitive et sécurisée. Ils utilisent React Hook Form avec validation Zod pour une expérience utilisateur optimale.

## Architecture

### Composants Principaux

- **`ProfileEditForm`** : Composant principal qui orchestre l'ensemble du formulaire
- **`CommonProfileFields`** : Champs communs à tous les types d'utilisateurs
- **`NutritionistProfileFields`** : Champs spécifiques aux nutritionnistes
- **`PatientProfileFields`** : Champs spécifiques aux patients
- **`FormActions`** : Actions du formulaire (sauvegarder, annuler)
- **`AvatarUpload`** : Composant de téléchargement d'avatar

### Structure des Données

```typescript
interface ProfileEditFormProps {
  userType: 'nutritionist' | 'patient';
  initialData?: Partial<NutritionistProfile | PatientProfile>;
  onSave?: (data: ProfileUpdate) => Promise<void>;
  onCancel?: () => void;
}
```

## Utilisation

### Exemple de Base

```tsx
import { ProfileEditForm } from '@/components/forms/ProfileEditForm';

function ProfilePage() {
  const handleSave = async (data: ProfileUpdate) => {
    try {
      // Logique de sauvegarde vers Supabase
      await updateProfile(data);
      toast.success('Profil mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <ProfileEditForm
      userType='nutritionist'
      initialData={currentProfile}
      onSave={handleSave}
      onCancel={() => router.back()}
    />
  );
}
```

### Données d'Exemple

#### Nutritionniste

```typescript
const nutritionistData = {
  first_name: 'Marie',
  last_name: 'Dubois',
  phone: '+41791234567',
  asca_number: 'ND123456',
  rme_number: 'RME789012',
  specializations: ['Nutrition sportive', 'Perte de poids'],
  bio: 'Nutritionniste expérimentée...',
  consultation_rates: {
    initial: 15000, // CHF 150.00
    follow_up: 10000, // CHF 100.00
    express: 5000, // CHF 50.00
  },
  practice_address: {
    street: 'Rue de la Paix 123',
    postal_code: '1200',
    city: 'Genève',
    canton: 'GE',
    country: 'CH',
  },
};
```

#### Patient

```typescript
const patientData = {
  first_name: 'Jean',
  last_name: 'Martin',
  phone: '+41787654321',
  date_of_birth: '1985-06-15',
  gender: 'male',
  height: 175,
  initial_weight: 80,
  target_weight: 70,
  activity_level: 'moderate',
  allergies: ['Gluten', 'Lactose'],
  dietary_restrictions: ['Végétarien'],
  medical_conditions: ['Hypertension'],
  medications: ['Médicament A'],
};
```

## Fonctionnalités

### 1. Validation en Temps Réel

Le formulaire utilise les schémas Zod pour valider les données en temps réel :

- **Validation des champs requis** : Prénom, nom, téléphone
- **Validation des formats** : Email, téléphone suisse, codes postaux
- **Validation croisée** : Poids cible vs poids initial, tarifs de consultation
- **Validation des âges** : Minimum 13 ans pour les patients

### 2. Gestion des Changements Non Sauvegardés

```typescript
// Détection automatique des modifications
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

// Prévention de la navigation accidentelle
useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = '';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [hasUnsavedChanges]);
```

### 3. Upload d'Avatar

Le composant `AvatarUpload` offre :

- **Glisser-déposer** : Interface intuitive pour télécharger des images
- **Prévisualisation** : Aperçu immédiat de l'image sélectionnée
- **Validation** : Formats acceptés (JPEG, PNG, WebP), taille max 5MB
- **Responsive** : Adaptation mobile et desktop

### 4. Champs Dynamiques

#### Spécialisations (Nutritionnistes)

```tsx
const specializations = [
  'Nutrition sportive',
  'Perte de poids',
  'Gain de masse musculaire',
  'Nutrition clinique',
  'Allergies alimentaires',
  'Intolérances',
  'Nutrition pédiatrique',
  'Nutrition gériatrique',
  'Nutrition végétarienne',
  'Nutrition végane',
  'Troubles du comportement alimentaire',
  'Nutrition préventive',
];
```

#### Allergies et Restrictions (Patients)

Interface d'ajout/suppression dynamique avec tags colorés :

- **Allergies** : Tags rouges
- **Restrictions** : Tags jaunes
- **Conditions médicales** : Tags bleus
- **Médicaments** : Tags verts

### 5. Responsive Design

Le formulaire s'adapte automatiquement aux différentes tailles d'écran :

- **Desktop** : Layout en grille avec colonnes multiples
- **Tablet** : Adaptation progressive des colonnes
- **Mobile** : Stack vertical pour une meilleure lisibilité

## Validation et Messages d'Erreur

### Messages en Français

Tous les messages d'erreur sont localisés en français :

```typescript
// Exemples de messages d'erreur
'Le prénom est requis';
'Le numéro de téléphone suisse invalide';
'L\'âge doit être compris entre 13 et 120 ans';
'Le tarif initial doit être supérieur ou égal au tarif de suivi';
```

### Validation Croisée

```typescript
// Exemple : Validation des tarifs de consultation
.refine(
  (data) => data.initial >= data.follow_up,
  {
    message: 'Le tarif initial doit être supérieur ou égal au tarif de suivi',
    path: ['initial'],
  }
)
```

## Intégration avec Supabase

### Sauvegarde des Données

```typescript
const handleSave = async (data: ProfileUpdate) => {
  try {
    const { data: result, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: currentUser.id,
        ...data,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return result;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    throw error;
  }
};
```

### Upload d'Avatar vers Supabase Storage

```typescript
const uploadAvatar = async (file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('avatars')
    .upload(fileName, file);

  if (error) throw error;

  return data.path;
};
```

## Tests

### Tests Unitaires

Les formulaires sont testés avec React Testing Library et Vitest :

```typescript
// Test de validation
it('devrait valider les champs requis', async () => {
  const user = userEvent.setup();

  render(<ProfileEditForm userType="nutritionist" />);

  await user.clear(screen.getByLabelText('Prénom'));
  await user.click(screen.getByText('Sauvegarder'));

  expect(screen.getByText('Le prénom est requis')).toBeInTheDocument();
});
```

### Tests d'Accessibilité

- **Navigation au clavier** : Tous les champs sont accessibles via Tab
- **Labels appropriés** : Chaque champ a un label associé
- **Messages d'erreur** : Liés aux champs correspondants
- **Contraste** : Respect des standards WCAG

## Performance

### Optimisations

1. **React Hook Form** : Gestion d'état performante
2. **Validation différée** : Validation uniquement lors des changements
3. **Memoization** : Composants optimisés avec React.memo
4. **Lazy loading** : Chargement différé des composants complexes

### Métriques

- **Temps de rendu initial** : < 100ms
- **Validation en temps réel** : < 50ms
- **Soumission** : < 200ms
- **Taille du bundle** : +15KB (gzippé)

## Personnalisation

### Thèmes

Le formulaire utilise le système de thèmes de NutriSensia :

```css
/* Variables CSS personnalisables */
:root {
  --form-border-color: theme('colors.gray.300');
  --form-focus-color: theme('colors.primary');
  --form-error-color: theme('colors.red.600');
  --form-success-color: theme('colors.green.600');
}
```

### Styles Responsive

```css
/* Breakpoints personnalisables */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

## Dépannage

### Problèmes Courants

1. **Validation qui ne fonctionne pas**
   - Vérifier que le schéma Zod est correctement importé
   - S'assurer que les types TypeScript correspondent

2. **Upload d'avatar qui échoue**
   - Vérifier les permissions Supabase Storage
   - Contrôler la taille et le format du fichier

3. **Changements non détectés**
   - Vérifier que `mode: 'onChange'` est configuré
   - S'assurer que `watch()` est correctement utilisé

### Debug

```typescript
// Activer le mode debug de React Hook Form
const methods = useForm({
  resolver: zodResolver(profileUpdateSchema),
  mode: 'onChange',
  debug: true, // Affiche les logs de debug
});
```

## Évolutions Futures

### Fonctionnalités Prévues

1. **Sauvegarde automatique** : Sauvegarde en arrière-plan
2. **Historique des modifications** : Traçabilité des changements
3. **Import/Export** : Conformité GDPR
4. **Validation côté serveur** : Double validation
5. **Mode hors ligne** : Synchronisation différée

### Améliorations Techniques

1. **Web Workers** : Validation dans un thread séparé
2. **Service Workers** : Cache des formulaires
3. **Progressive Web App** : Installation native
4. **Accessibilité avancée** : Support des lecteurs d'écran

## Conclusion

Les formulaires d'édition de profil de NutriSensia offrent une expérience utilisateur moderne et accessible, avec une validation robuste et une architecture extensible. Ils constituent la base pour la gestion des profils utilisateurs dans l'application.
