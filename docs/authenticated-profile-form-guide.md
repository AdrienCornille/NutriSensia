# Guide du Formulaire de Profil Authentifié

## 📋 Vue d'ensemble

Le formulaire de profil authentifié (`AuthenticatedProfileForm`) est une version améliorée du formulaire de test qui utilise les vraies données de l'utilisateur connecté et met à jour directement la base de données Supabase.

## ✨ Fonctionnalités

### 🔐 Authentification Requise
- **Protection automatique** : Le formulaire vérifie automatiquement l'authentification
- **Redirection intelligente** : Redirige vers la page de connexion si non authentifié
- **Gestion des rôles** : Affiche les champs appropriés selon le rôle utilisateur

### 📊 Données Réelles
- **Chargement automatique** : Récupère les vraies données depuis Supabase
- **Mise à jour en temps réel** : Met à jour la base de données lors de la sauvegarde
- **Gestion des erreurs** : Affiche les erreurs de chargement et de sauvegarde

### 🎯 Interface Utilisateur
- **Design responsive** : Fonctionne sur mobile et desktop
- **Animations fluides** : Transitions avec Framer Motion
- **Feedback visuel** : États de chargement et messages d'erreur
- **Gestion des changements** : Détection des modifications non sauvegardées

## 🚀 Utilisation

### Page d'Édition de Profil
```tsx
// src/app/profile/edit/page.tsx
import { AuthenticatedProfileForm } from '@/components/forms/AuthenticatedProfileForm';

export default function EditProfilePage() {
  return (
    <AuthenticatedProfileForm
      redirectAfterSave="/profile"
    />
  );
}
```

### Page de Test
```tsx
// src/app/profile/authenticated-test/page.tsx
import { AuthenticatedProfileForm } from '@/components/forms/AuthenticatedProfileForm';

export default function TestPage() {
  const handleSave = async (data) => {
    // Logique personnalisée
    console.log('Données sauvegardées:', data);
  };

  return (
    <AuthenticatedProfileForm
      onSave={handleSave}
      redirectAfterSave="/profile"
    />
  );
}
```

## 🔧 Configuration

### Props Disponibles

| Prop | Type | Description | Défaut |
|------|------|-------------|---------|
| `onSave` | `Function` | Fonction personnalisée de sauvegarde | `undefined` |
| `onCancel` | `Function` | Fonction appelée lors de l'annulation | `undefined` |
| `redirectAfterSave` | `string` | URL de redirection après sauvegarde | `undefined` |

### Hook Personnalisé

Le formulaire utilise le hook `useUserProfile` qui gère :

```tsx
const {
  profile,           // Données du profil
  loading,           // État de chargement
  error,             // Erreurs éventuelles
  updateProfile,     // Fonction de mise à jour
  updateAvatar,      // Mise à jour de l'avatar
  removeAvatar,      // Suppression de l'avatar
  refreshProfile,    // Rafraîchissement du profil
} = useUserProfile();
```

## 📁 Structure des Fichiers

```
src/
├── components/
│   └── forms/
│       ├── AuthenticatedProfileForm.tsx    # Formulaire principal
│       ├── CommonProfileFields.tsx         # Champs communs
│       ├── NutritionistProfileFields.tsx   # Champs nutritionniste
│       ├── PatientProfileFields.tsx        # Champs patient
│       └── FormActions.tsx                 # Actions du formulaire
├── hooks/
│   └── useUserProfile.ts                   # Hook de gestion du profil
└── app/
    └── profile/
        ├── edit/
        │   └── page.tsx                    # Page d'édition
        └── authenticated-test/
            └── page.tsx                    # Page de test
```

## 🔄 Flux de Données

### 1. Chargement Initial
```
AuthenticatedProfileForm
    ↓
useUserProfile.loadProfile()
    ↓
Supabase (profiles + nutritionists/patients)
    ↓
Formulaire initialisé avec données réelles
```

### 2. Sauvegarde
```
Utilisateur soumet le formulaire
    ↓
Validation Zod
    ↓
onSave() ou updateProfile()
    ↓
Supabase (mise à jour des tables)
    ↓
Rechargement du profil
    ↓
Redirection (si configurée)
```

## 🛡️ Sécurité

### Authentification
- Vérification automatique de l'authentification
- Protection des routes avec `AuthGuard`
- Gestion des sessions expirées

### Autorisations
- Vérification des rôles utilisateur
- Accès limité aux données personnelles
- Politiques RLS Supabase

### Validation
- Validation côté client avec Zod
- Validation côté serveur avec Supabase
- Protection contre les injections

## 🎨 Personnalisation

### Styles
Le formulaire utilise Tailwind CSS et peut être personnalisé :

```tsx
<AuthenticatedProfileForm
  className="custom-form-styles"
  // ... autres props
/>
```

### Messages
Les messages d'erreur et de succès peuvent être personnalisés dans le hook `useUserProfile`.

### Champs
Les champs spécifiques au rôle peuvent être modifiés dans :
- `NutritionistProfileFields.tsx`
- `PatientProfileFields.tsx`

## 🧪 Tests

### Page de Test
Accédez à `/profile/authenticated-test` pour tester le formulaire avec :
- Données réelles de l'utilisateur connecté
- Mise à jour en temps réel
- Gestion des erreurs

### Développement
Pour le développement, utilisez `/profile/edit` qui est la version de production.

## 🐛 Dépannage

### Erreurs Courantes

1. **"Utilisateur non connecté"**
   - Vérifiez que l'utilisateur est authentifié
   - Vérifiez la session Supabase

2. **"Profil non trouvé"**
   - Vérifiez que le profil existe dans la base de données
   - Vérifiez les permissions RLS

3. **"Erreur de mise à jour"**
   - Vérifiez la structure des données
   - Vérifiez les contraintes de la base de données

### Logs de Débogage
Activez les logs dans la console pour voir :
- Les données chargées
- Les erreurs de validation
- Les erreurs de sauvegarde

## 📈 Améliorations Futures

- [ ] Cache des données avec TanStack Query
- [ ] Synchronisation en temps réel
- [ ] Historique des modifications
- [ ] Export des données
- [ ] Notifications push
