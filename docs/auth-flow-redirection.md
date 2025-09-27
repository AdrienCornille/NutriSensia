# Système de redirection d'authentification 2FA

## Vue d'ensemble

Ce document décrit le système de redirection intelligent mis en place pour gérer le flux d'authentification avec authentification à deux facteurs (2FA) dans NutriSensia.

## Architecture du système

### Composants principaux

1. **Hook `useAuthRedirect`** (`src/hooks/useAuthRedirect.ts`)
   - Gère la logique de redirection après authentification
   - Vérifie le statut 2FA de l'utilisateur
   - Redirige vers la page appropriée selon le statut

2. **Composant `MFAProtection`** (`src/components/auth/MFAProtection.tsx`)
   - Protège les pages qui nécessitent une authentification complète
   - Vérifie automatiquement le statut 2FA
   - Affiche un écran de chargement pendant la vérification

3. **Formulaire de connexion modifié** (`src/components/auth/AuthForms.tsx`)
   - Intègre la logique de vérification 2FA après connexion
   - Redirige automatiquement selon le statut de l'utilisateur

## Flux d'authentification

### 1. Connexion initiale

Lorsqu'un utilisateur se connecte via `/auth/signin` :

1. **Authentification** : L'utilisateur entre ses identifiants
2. **Vérification 2FA** : Le système vérifie le niveau d'assurance d'authentification
3. **Décision de redirection** :
   - Si `nextLevel === 'aal2'` et `currentLevel === 'aal1'` : L'utilisateur doit configurer ou vérifier le 2FA
   - Sinon : L'utilisateur est déjà authentifié correctement

### 2. Redirection selon le statut 2FA

#### Cas 1 : 2FA non configuré
- **Redirection** : `/auth/enroll-mfa`
- **Action** : L'utilisateur configure son premier facteur 2FA
- **Après configuration** : Redirection vers `/` (page d'accueil)

#### Cas 2 : 2FA configuré mais non vérifié
- **Redirection** : `/auth/verify-mfa`
- **Action** : L'utilisateur entre son code 2FA
- **Après vérification** : Redirection vers `/` (page d'accueil)

#### Cas 3 : 2FA déjà vérifié
- **Redirection** : `/` (page d'accueil)
- **Action** : L'utilisateur accède directement à l'application

## Niveaux d'assurance d'authentification (AAL)

### AAL1 (Authenticator Assurance Level 1)
- Authentification simple (email + mot de passe)
- Niveau de sécurité de base

### AAL2 (Authenticator Assurance Level 2)
- Authentification à deux facteurs requise
- Niveau de sécurité élevé
- Nécessite un facteur supplémentaire (TOTP, SMS, etc.)

## Utilisation des composants

### Hook useAuthRedirect

```typescript
import { useAuthRedirect } from '@/hooks/useAuthRedirect';

function MonComposant() {
  const { checkMFAAndRedirect, redirectToHome } = useAuthRedirect();

  const handleAction = async () => {
    // Vérifie le statut 2FA et redirige automatiquement
    await checkMFAAndRedirect();
  };

  return (
    <button onClick={handleAction}>
      Vérifier et rediriger
    </button>
  );
}
```

### Composant MFAProtection

```typescript
import { MFAProtection } from '@/components/auth';

function PageProtegee() {
  return (
    <MFAProtection>
      <div>
        {/* Contenu protégé - accessible seulement si 2FA vérifié */}
        <h1>Page sécurisée</h1>
      </div>
    </MFAProtection>
  );
}
```

## Pages de test

### Page de test du flux d'authentification
- **URL** : `/auth-flow-test`
- **Fonctionnalités** :
  - Affiche les informations de session
  - Montre le statut 2FA actuel
  - Permet de tester les redirections
  - Liste les facteurs MFA configurés

### Accès aux pages de test
- **Page d'accueil** : Section "Tests et développement"
- **Boutons disponibles** :
  - "Tester la 2FA" → `/mfa-test`
  - "Test du flux d'authentification" → `/auth-flow-test`

## Gestion des erreurs

### Erreurs de vérification 2FA
- **Comportement** : Redirection vers la page d'accueil
- **Log** : Erreur enregistrée dans la console
- **Fallback** : L'utilisateur peut continuer sans 2FA

### Erreurs de session
- **Comportement** : Redirection vers `/auth/signin`
- **Log** : Erreur enregistrée dans la console

## Sécurité

### Vérifications automatiques
- Vérification de session à chaque chargement de page protégée
- Vérification du niveau d'assurance d'authentification
- Redirection automatique en cas de session expirée

### Protection des routes
- Les pages sensibles peuvent être protégées avec `MFAProtection`
- Vérification automatique du statut 2FA
- Écran de chargement pendant les vérifications

## Configuration

### Variables d'environnement
Aucune configuration supplémentaire requise. Le système utilise les configurations Supabase existantes.

### Personnalisation des redirections
Les redirections peuvent être personnalisées en modifiant le hook `useAuthRedirect` :

```typescript
// Redirection personnalisée après vérification 2FA
const redirectToHome = useCallback(() => {
  router.push('/dashboard'); // Au lieu de '/'
}, [router]);
```

## Tests

### Test manuel du flux
1. Aller sur `/auth/signin`
2. Se connecter avec un compte
3. Observer la redirection automatique selon le statut 2FA
4. Utiliser `/auth-flow-test` pour vérifier les informations

### Test des redirections
1. Aller sur `/auth-flow-test`
2. Cliquer sur "Tester la redirection automatique"
3. Vérifier que la redirection fonctionne correctement

## Dépannage

### Problèmes courants

#### Redirection en boucle
- **Cause** : Erreur dans la vérification 2FA
- **Solution** : Vérifier les logs de la console

#### Page de chargement infinie
- **Cause** : Erreur réseau ou problème avec Supabase
- **Solution** : Vérifier la connexion et les logs

#### 2FA non reconnu
- **Cause** : Facteur non vérifié ou expiré
- **Solution** : Reconfigurer le 2FA via `/auth/enroll-mfa`

## Évolutions futures

### Améliorations possibles
- Support de facteurs 2FA supplémentaires (clés de sécurité, etc.)
- Configuration du niveau d'assurance requis par rôle
- Historique des connexions et tentatives 2FA
- Notifications de sécurité (nouvelles connexions, etc.)

### Intégrations
- Support de l'authentification par SMS
- Intégration avec des applications d'authentification tierces
- Support de la récupération de compte sécurisée

