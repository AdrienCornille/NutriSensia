# Configuration Google OAuth pour Supabase

## 📋 **Prérequis**

1. Un projet Supabase configuré
2. Un projet Google Cloud Console
3. Les variables d'environnement Supabase configurées

## 🔧 **Étapes de Configuration**

### **1. Configuration Google Cloud Console**

#### **1.1 Créer un projet Google Cloud**

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API Google+ API

#### **1.2 Créer des identifiants OAuth 2.0**

1. Dans le menu, allez à **APIs & Services** > **Credentials**
2. Cliquez sur **+ CREATE CREDENTIALS** > **OAuth 2.0 Client IDs**
3. Sélectionnez **Web application**
4. Configurez les URLs autorisées :
   - **Authorized JavaScript origins** :
     ```
     http://localhost:3000
     https://your-domain.com (pour la production)
     ```
   - **Authorized redirect URIs** :
     ```
     http://localhost:3000/auth/callback
     https://your-domain.com/auth/callback (pour la production)
     https://ywshijyzpmothwjnvrxi.supabase.co/auth/v1/callback
     ```
5. Notez le **Client ID** et **Client Secret**

### **2. Configuration Supabase**

#### **2.1 Activer Google Provider**

1. Allez dans votre dashboard Supabase
2. Naviguez vers **Authentication** > **Providers**
3. Trouvez **Google** et activez-le
4. Entrez vos identifiants Google :
   - **Client ID** : Votre Google Client ID
   - **Client Secret** : Votre Google Client Secret

#### **2.2 Configurer les URLs de redirection**

1. Dans **Authentication** > **URL Configuration**
2. Ajoutez vos URLs de redirection :
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

### **3. Variables d'Environnement (Optionnel)**

Si vous voulez configurer Google OAuth via des variables d'environnement, ajoutez dans `.env.local` :

```env
# Google OAuth (optionnel - configuré via dashboard Supabase)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 🧪 **Test de la Configuration**

### **1. Test via l'interface Supabase**

1. Allez dans **Authentication** > **Users**
2. Cliquez sur **Add user**
3. Sélectionnez **Sign up with Google**
4. Testez la connexion

### **2. Test via votre application**

1. Lancez votre application : `npm run dev`
2. Allez sur `http://localhost:3000/auth-test`
3. Cliquez sur **Test Google OAuth**
4. Vérifiez que la redirection fonctionne

## 🔍 **Dépannage**

### **Erreur "Invalid redirect URI"**

- Vérifiez que l'URL de redirection dans Google Cloud Console correspond exactement à celle de Supabase
- Assurez-vous que `http://localhost:3000/auth/callback` est bien configuré

### **Erreur "Client ID not found"**

- Vérifiez que le Client ID dans Supabase correspond exactement à celui de Google Cloud Console
- Assurez-vous que le projet Google Cloud est bien sélectionné

### **Erreur "OAuth consent screen"**

- Configurez l'écran de consentement OAuth dans Google Cloud Console
- Ajoutez votre domaine dans les domaines autorisés

### **Redirection qui ne fonctionne pas**

- Vérifiez que l'URL de redirection dans Supabase est correcte
- Assurez-vous que votre application écoute sur le bon port

## 📝 **Notes Importantes**

1. **En développement** : Utilisez `http://localhost:3000`
2. **En production** : Utilisez votre domaine réel avec HTTPS
3. **Sécurité** : Ne partagez jamais votre Client Secret
4. **Limites** : Google OAuth a des limites de requêtes par jour

## 🔗 **Liens Utiles**

- [Documentation Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Documentation Supabase Auth](https://supabase.com/docs/guides/auth/social-login/auth-google)
- [Google Cloud Console](https://console.cloud.google.com/)

## ✅ **Vérification Finale**

Après configuration, vous devriez pouvoir :

- ✅ Voir Google dans la liste des providers actifs dans Supabase
- ✅ Tester la connexion via l'interface Supabase
- ✅ Utiliser le bouton "Test Google OAuth" dans votre application
- ✅ Être redirigé vers Google pour l'authentification
- ✅ Revenir sur votre application après authentification
