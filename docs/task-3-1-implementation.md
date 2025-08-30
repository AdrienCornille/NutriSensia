# Implémentation de la Tâche 3.1 : Supabase Auth Provider Setup

## Vue d'ensemble

Cette tâche implémente la configuration complète de l'authentification Supabase pour NutriSensia, incluant l'authentification par email/mot de passe et Google OAuth.

## Fonctionnalités implémentées

### ✅ Authentification par email/mot de passe

- Inscription avec validation des données
- Connexion sécurisée
- Réinitialisation de mot de passe
- Mise à jour de mot de passe
- Gestion des erreurs traduites en français

### ✅ Authentification Google OAuth

- Configuration Google Cloud Console
- Intégration avec Supabase Auth
- Redirection sécurisée
- Gestion des tokens de rafraîchissement

### ✅ Gestion des rôles utilisateur

- Système de rôles : `nutritionist`, `patient`, `admin`
- Table `profiles` avec métadonnées utilisateur
- Politiques RLS (Row Level Security) basées sur les rôles

### ✅ Sécurité et conformité

- Configuration des cookies sécurisés
- Gestion des sessions persistantes
- Protection CSRF
- Headers de sécurité
- Conformité GDPR

## Structure des fichiers modifiés

### 1. Configuration Supabase (`src/lib/supabase.ts`)

**Améliorations apportées :**

- **Types TypeScript complets** pour toutes les tables
- **Gestion d'erreurs robuste** avec traduction en français
- **Configuration sécurisée** des cookies et sessions
- **API wrapper** pour toutes les opérations d'authentification
- **Support Google OAuth** avec configuration avancée

**Nouvelles fonctions :**

```typescript
// Authentification email/mot de passe
auth.signInWithPassword(email, password)
auth.signUp(email, password, metadata)

// Authentification Google OAuth
auth.signInWithGoogle(redirectTo?)

// Gestion des mots de passe
auth.resetPasswordForEmail(email, redirectTo?)
auth.updatePassword(password)

// Gestion des sessions
auth.getSession()
auth.getUser()
auth.signOut()
```

### 2. Hook d'authentification (`src/hooks/useAuth.ts`)

**Améliorations apportées :**

- **Gestion d'état complète** avec erreurs et loading
- **Support Google OAuth** intégré
- **Méthodes de réinitialisation** de mot de passe
- **Gestion des erreurs** centralisée
- **Compatibilité** avec l'API existante

**Nouvelles méthodes :**

```typescript
const {
  user,
  session,
  loading,
  error,
  signInWithPassword,
  signInWithGoogle,
  signUp,
  signOut,
  resetPassword,
  updatePassword,
  getUser,
  clearError,
} = useAuth();
```

### 3. Composant de test (`src/components/SupabaseTest.tsx`)

**Fonctionnalités de test :**

- **Test de configuration** des variables d'environnement
- **Test de connexion** à Supabase
- **Test d'inscription** et de connexion
- **Test Google OAuth** avec redirection
- **Test de réinitialisation** de mot de passe
- **Interface utilisateur** complète avec résultats détaillés

### 4. Script SQL (`scripts/init-database.sql`)

**Structure de base de données :**

- **Table `profiles`** avec rôles et métadonnées
- **Politiques RLS** pour la sécurité
- **Triggers automatiques** pour la gestion des utilisateurs
- **Index optimisés** pour les performances
- **Fonctions utilitaires** pour les statistiques

### 5. Configuration des variables d'environnement

**Fichier `.env.example` amélioré :**

- **Instructions détaillées** pour la configuration
- **Variables Google OAuth** optionnelles
- **Configuration SMTP** pour les emails
- **Variables de développement** et production

## Configuration requise

### 1. Variables d'environnement

```env
# Supabase (OBLIGATOIRE)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Google OAuth (OPTIONNEL)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Application
NEXT_PUBLIC_APP_NAME=NutriSensia
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Configuration Supabase

1. **Créer un projet Supabase**
2. **Exécuter le script SQL** `scripts/init-database.sql`
3. **Configurer l'authentification** dans le dashboard
4. **Ajouter les URLs de redirection**

### 3. Configuration Google OAuth

1. **Créer un projet Google Cloud**
2. **Activer l'API Google+**
3. **Créer des identifiants OAuth 2.0**
4. **Configurer les URLs autorisées**
5. **Ajouter les clés dans Supabase**

## Utilisation

### Authentification de base

```typescript
import { useAuth } from '@/hooks/useAuth';

function LoginComponent() {
  const { signInWithPassword, loading, error } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const { data, error } = await signInWithPassword(email, password);
    if (error) {
      console.error('Erreur de connexion:', error.message);
    } else {
      console.log('Connexion réussie:', data);
    }
  };
}
```

### Authentification Google OAuth

```typescript
import { useAuth } from '@/hooks/useAuth';

function GoogleLoginComponent() {
  const { signInWithGoogle, loading } = useAuth();

  const handleGoogleLogin = async () => {
    const { data, error } = await signInWithGoogle();
    if (error) {
      console.error('Erreur Google OAuth:', error.message);
    } else {
      // Redirection automatique vers Google
      console.log('Redirection Google initiée');
    }
  };
}
```

### Inscription avec rôles

```typescript
import { useAuth } from '@/hooks/useAuth';

function SignUpComponent() {
  const { signUp, loading } = useAuth();

  const handleSignUp = async (email: string, password: string) => {
    const { data, error } = await signUp(email, password, {
      full_name: 'John Doe',
      role: 'patient',
      phone: '+33123456789',
    });

    if (error) {
      console.error("Erreur d'inscription:", error.message);
    } else {
      console.log('Inscription réussie:', data);
    }
  };
}
```

## Tests

### Composant de test intégré

Le composant `SupabaseTest` permet de tester toutes les fonctionnalités :

1. **Lancer l'application** : `npm run dev`
2. **Naviguer vers** `/supabase-test`
3. **Exécuter les tests** individuels ou tous ensemble
4. **Vérifier les résultats** dans l'interface

### Tests automatisés

```bash
# Test de la configuration
npm run test:auth

# Test de l'intégration
npm run test:integration
```

## Sécurité

### Mesures implémentées

1. **Row Level Security (RLS)** sur toutes les tables
2. **Validation des données** côté client et serveur
3. **Gestion sécurisée des cookies** avec `sameSite: 'lax'`
4. **Protection CSRF** intégrée
5. **Headers de sécurité** automatiques
6. **Gestion des erreurs** sans fuite d'informations

### Politiques RLS

```sql
-- Utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Nutritionnistes peuvent voir les profils des patients
CREATE POLICY "Nutritionists can view patient profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'nutritionist'
    ) OR auth.uid() = id
  );
```

## Gestion des erreurs

### Traduction des erreurs

Toutes les erreurs Supabase sont traduites en français :

```typescript
const errorMessages = {
  'Invalid login credentials': 'Email ou mot de passe incorrect',
  'Email not confirmed':
    'Veuillez confirmer votre email avant de vous connecter',
  'Too many requests':
    'Trop de tentatives de connexion. Veuillez réessayer plus tard',
  'User already registered': 'Un compte existe déjà avec cet email',
};
```

### Gestion centralisée

```typescript
// Dans le hook useAuth
const [error, setError] = useState<AuthError | null>(null);

// Affichage dans les composants
if (error) {
  return <div className="error">{error.message}</div>;
}
```

## Performance

### Optimisations implémentées

1. **Index de base de données** pour les requêtes fréquentes
2. **Mise en cache** des sessions utilisateur
3. **Chargement différé** des données utilisateur
4. **Gestion optimisée** des états de chargement

### Monitoring

```typescript
// Logs d'authentification
console.log('Auth state changed:', event, session?.user?.email);

// Métriques de performance
const startTime = performance.now();
// ... opération d'authentification
const endTime = performance.now();
console.log(`Auth operation took ${endTime - startTime}ms`);
```

## Prochaines étapes

### Tâches suivantes

1. **Tâche 3.2** : Implémentation des rôles et profils utilisateur
2. **Tâche 3.3** : Composants UI d'authentification
3. **Tâche 3.4** : Authentification à deux facteurs (2FA)
4. **Tâche 3.5** : Routes protégées et middleware

### Améliorations futures

1. **Support d'autres providers OAuth** (GitHub, Facebook)
2. **Authentification par SMS** pour les nutritionnistes
3. **Audit trail** des connexions
4. **Notifications de sécurité** par email

## Support et dépannage

### Problèmes courants

1. **"Supabase not configured"**
   - Vérifier les variables d'environnement
   - Redémarrer le serveur de développement

2. **Erreurs de redirection OAuth**
   - Vérifier les URLs dans Google Cloud Console
   - S'assurer que les URLs correspondent dans Supabase

3. **Erreurs de base de données**
   - Exécuter le script SQL d'initialisation
   - Vérifier les politiques RLS

### Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Guide Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Documentation du projet](./supabase-setup.md)
- [Script SQL d'initialisation](../scripts/init-database.sql)

---

**Statut :** ✅ Terminé  
**Développeur :** Assistant IA  
**Date :** Décembre 2024  
**Version :** 1.0.0
