# Système de navigation utilisateur

## Vue d'ensemble

Ce document décrit le système de navigation utilisateur implémenté dans NutriSensia, qui permet aux utilisateurs connectés d'accéder facilement à leur profil et de se déconnecter.

## 🎯 **Fonctionnalités implémentées**

### ✅ **Page d'accueil intelligente**

La page d'accueil (`/`) détecte automatiquement l'état de connexion de l'utilisateur et affiche :

#### **Utilisateur connecté :**

- **Message de bienvenue** personnalisé avec le nom de l'utilisateur
- **Affichage du rôle** (patient ou nutritionniste)
- **Bouton "Mon profil"** pour accéder à la page de profil
- **Bouton "Se déconnecter"** pour se déconnecter

#### **Utilisateur non connecté :**

- **Bouton "Se connecter"** pour accéder à la page de connexion
- **Bouton "S'inscrire"** pour créer un nouveau compte

### ✅ **Composants de navigation**

#### **UserNav** (`src/components/layout/UserNav.tsx`)

- **Fonction** : Composant de navigation utilisateur réutilisable
- **Fonctionnalités** :
  - Détection automatique de l'état de connexion
  - Affichage des informations utilisateur (nom, rôle)
  - Boutons de navigation (profil, déconnexion)
  - État de chargement avec animation
  - Interface responsive

#### **Header** (`src/components/layout/Header.tsx`)

- **Fonction** : Header principal avec navigation intégrée
- **Fonctionnalités** :
  - Logo NutriSensia avec lien vers l'accueil
  - Navigation principale (Nutrition, Profil, Paramètres)
  - Intégration du composant UserNav
  - Design responsive

### ✅ **Page de profil complète**

La page de profil (`/profile`) offre :

- **Informations personnelles** (nom, email, rôle, téléphone)
- **Gestion de l'avatar** (upload, suppression)
- **Statut 2FA** (activé/désactivé)
- **Date d'inscription**
- **Interface intuitive** avec cartes organisées

## 🔧 **Architecture technique**

### **Détection de session**

```typescript
// Dans les composants
const [session, setSession] = useState<any>(null);

useEffect(() => {
  // Récupérer la session actuelle
  const getSession = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setSession(session);
  };

  // Écouter les changements d'authentification
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    setSession(session);
  });

  return () => subscription.unsubscribe();
}, []);
```

### **Gestion de la déconnexion**

```typescript
const handleSignOut = async () => {
  await supabase.auth.signOut();
  // La redirection est gérée automatiquement par onAuthStateChange
};
```

### **Affichage conditionnel**

```typescript
{session ? (
  // Interface pour utilisateur connecté
  <div>
    <p>Bonjour, {session.user.user_metadata?.name}!</p>
    <Button onClick={handleSignOut}>Se déconnecter</Button>
  </div>
) : (
  // Interface pour utilisateur non connecté
  <div>
    <Button href="/auth/signin">Se connecter</Button>
  </div>
)}
```

## 🎨 **Interface utilisateur**

### **États d'affichage**

#### **État de chargement**

- Animation de chargement avec spinner
- Placeholder pour les informations utilisateur
- Transitions fluides

#### **État connecté**

- Avatar utilisateur avec icône par défaut
- Nom et rôle affichés clairement
- Boutons d'action bien visibles
- Design cohérent avec le thème

#### **État déconnecté**

- Boutons de connexion/inscription
- Design épuré et accueillant
- Call-to-action clair

### **Responsive Design**

- **Mobile** : Boutons empilés verticalement
- **Tablet** : Layout adaptatif
- **Desktop** : Boutons côte à côte
- **Navigation** : Masquée sur mobile, visible sur desktop

## 🧪 **Pages de test**

### **`/navigation-test`**

- **Fonction** : Test complet du système de navigation
- **Fonctionnalités** :
  - Affichage de l'état d'authentification
  - Test du composant Header
  - Vérification des redirections
  - Instructions de test

### **Accès aux tests**

- **Page d'accueil** : Section "Tests et développement"
- **Boutons disponibles** :
  - "Test de la navigation" → `/navigation-test`
  - "Test du flux d'authentification" → `/auth-flow-test`
  - "Test des rôles et 2FA" → `/role-test`
  - "Tester la 2FA" → `/mfa-test`

## 🔄 **Flux utilisateur**

### **Connexion**

1. **Page d'accueil** → Bouton "Se connecter"
2. **Page de connexion** → Authentification
3. **Redirection automatique** → Page d'accueil avec interface connectée
4. **Navigation** → Accès au profil, déconnexion, etc.

### **Navigation**

1. **Header** → Navigation principale (Nutrition, Profil, Paramètres)
2. **UserNav** → Informations utilisateur et actions rapides
3. **Page d'accueil** → Interface contextuelle selon l'état de connexion

### **Déconnexion**

1. **Bouton "Se déconnecter"** → Déconnexion automatique
2. **Redirection** → Page d'accueil avec interface déconnectée
3. **Nettoyage** → Suppression de la session

## 🛡️ **Sécurité**

### **Gestion des sessions**

- **Vérification automatique** de l'état de connexion
- **Nettoyage automatique** lors de la déconnexion
- **Protection** contre les accès non autorisés

### **Données utilisateur**

- **Affichage sécurisé** des informations personnelles
- **Pas de stockage local** des données sensibles
- **Mise à jour en temps réel** de l'état d'authentification

## 📱 **Compatibilité**

### **Navigateurs supportés**

- Chrome, Firefox, Safari, Edge
- Versions récentes recommandées

### **Appareils**

- **Mobile** : iOS Safari, Chrome Mobile
- **Tablet** : iPad, Android Tablet
- **Desktop** : Windows, macOS, Linux

## 🔍 **Dépannage**

### **Problèmes courants**

#### **Session non détectée**

- **Cause** : Problème de connexion Supabase
- **Solution** : Vérifier la configuration Supabase

#### **Boutons non fonctionnels**

- **Cause** : Erreur JavaScript
- **Solution** : Vérifier la console du navigateur

#### **Interface non mise à jour**

- **Cause** : Problème avec onAuthStateChange
- **Solution** : Recharger la page

### **Debugging**

#### **Console du navigateur**

```javascript
// Vérifier l'état de la session
console.log('Session:', session);

// Vérifier les métadonnées utilisateur
console.log('User metadata:', session?.user?.user_metadata);
```

#### **Page de test**

- Utiliser `/navigation-test` pour diagnostiquer
- Vérifier l'état d'authentification
- Tester les redirections

## 🚀 **Évolutions futures**

### **Améliorations possibles**

- **Menu déroulant** pour plus d'actions utilisateur
- **Notifications** en temps réel
- **Thème sombre/clair** persistant
- **Préférences utilisateur** sauvegardées

### **Nouvelles fonctionnalités**

- **Historique de navigation**
- **Favoris** et raccourcis personnalisés
- **Mode hors ligne** avec synchronisation
- **Intégration** avec d'autres services

## 📞 **Support**

Pour toute question sur la navigation :

- Consultez la page `/navigation-test` pour diagnostiquer
- Vérifiez la console du navigateur pour les erreurs
- Contactez l'équipe technique si nécessaire
