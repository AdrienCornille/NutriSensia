# Configuration Supabase pour NutriSensia

Ce guide vous explique comment configurer Supabase pour l'authentification et la gestion des données dans NutriSensia.

## Table des matières

1. [Création d'un projet Supabase](#création-dun-projet-supabase)
2. [Configuration de l'authentification](#configuration-de-lauthentification)
3. [Configuration Google OAuth](#configuration-google-oauth)
4. [Configuration des variables d'environnement](#configuration-des-variables-denvironnement)
5. [Structure de la base de données](#structure-de-la-base-de-données)
6. [Sécurité et bonnes pratiques](#sécurité-et-bonnes-pratiques)

## Création d'un projet Supabase

### 1. Créer un compte Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Cliquez sur "Start your project"
3. Connectez-vous avec GitHub ou créez un compte

### 2. Créer un nouveau projet

1. Cliquez sur "New Project"
2. Choisissez votre organisation
3. Donnez un nom à votre projet (ex: "nutrisensia")
4. Créez un mot de passe pour la base de données
5. Choisissez une région proche de vos utilisateurs
6. Cliquez sur "Create new project"

### 3. Récupérer les clés d'API

1. Une fois le projet créé, allez dans **Settings > API**
2. Copiez les valeurs suivantes :
   - **Project URL** : `https://your-project-ref.supabase.co`
   - **anon public key** : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Configuration de l'authentification

### 1. Activer l'authentification par email/mot de passe

1. Allez dans **Authentication > Settings**
2. Activez "Enable email confirmations" pour la sécurité
3. Configurez les templates d'emails si nécessaire

### 2. Configuration des URLs de redirection

Dans **Authentication > URL Configuration**, ajoutez :

**Site URL :**

- Développement : `http://localhost:3000`
- Production : `https://votre-domaine.com`

**Redirect URLs :**

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/auth/reset-password`
- `https://votre-domaine.com/auth/callback` (production)
- `https://votre-domaine.com/auth/reset-password` (production)

## Configuration Google OAuth

### 1. Créer un projet Google Cloud

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un existant
3. Activez l'API Google+

### 2. Créer des identifiants OAuth 2.0

1. Allez dans **APIs & Services > Credentials**
2. Cliquez sur "Create Credentials" > "OAuth 2.0 Client IDs"
3. Sélectionnez "Web application"
4. Configurez les URLs autorisées :
   - **Authorized JavaScript origins :**
     - `http://localhost:3000` (développement)
     - `https://votre-domaine.com` (production)
   - **Authorized redirect URIs :**
     - `https://your-project-ref.supabase.co/auth/v1/callback`

### 3. Configurer Google dans Supabase

1. Dans votre dashboard Supabase, allez dans **Authentication > Providers**
2. Activez Google
3. Ajoutez votre **Client ID** et **Client Secret** de Google
4. Sauvegardez la configuration

## Configuration des variables d'environnement

### 1. Créer le fichier .env.local

```bash
cp .env.example .env.local
```

### 2. Configurer les variables

```env
# Configuration Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Configuration Google OAuth (optionnel)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=your_google_client_secret

# Configuration de l'application
NEXT_PUBLIC_APP_NAME=NutriSensia
NEXT_PUBLIC_APP_VERSION=0.1.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Structure de la base de données

### Table `profiles`

Cette table stocke les informations des utilisateurs avec leurs rôles :

```sql
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT CHECK (role IN ('nutritionist', 'patient', 'admin')) DEFAULT 'patient',
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE,
  last_sign_in_at TIMESTAMP WITH TIME ZONE
);
```

### Politiques RLS (Row Level Security)

```sql
-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de modifier leur propre profil
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre aux nutritionnistes de voir les profils des patients
CREATE POLICY "Nutritionists can view patient profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'nutritionist'
    ) OR auth.uid() = id
  );
```

### Trigger pour créer automatiquement un profil

```sql
-- Fonction pour créer un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour appeler la fonction lors de l'inscription
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## Sécurité et bonnes pratiques

### 1. Gestion des erreurs

- Toutes les erreurs d'authentification sont traduites en français
- Les messages d'erreur sont génériques pour éviter la fuite d'informations
- Logging des tentatives de connexion échouées

### 2. Configuration des cookies

- Cookies sécurisés avec `sameSite: 'lax'`
- Durée de vie limitée (7 jours)
- Configuration différente pour développement et production

### 3. Validation des données

- Validation côté client avec Zod
- Validation côté serveur avec les politiques RLS
- Sanitisation des entrées utilisateur

### 4. Monitoring

- Surveillance des tentatives de connexion
- Alertes en cas d'activité suspecte
- Logs d'audit pour les actions sensibles

## Dépannage

### Problèmes courants

1. **Erreur "Supabase not configured"**
   - Vérifiez que vos variables d'environnement sont correctement définies
   - Redémarrez votre serveur de développement

2. **Erreur de redirection OAuth**
   - Vérifiez que l'URL de redirection est correctement configurée dans Google Cloud Console
   - Assurez-vous que l'URL correspond exactement à celle dans Supabase

3. **Erreur "Invalid login credentials"**
   - Vérifiez que l'utilisateur existe dans la base de données
   - Assurez-vous que l'email est confirmé si la confirmation est activée

### Support

Pour plus d'aide :

- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Google OAuth](https://developers.google.com/identity/protocols/oauth2)
- [Issues GitHub du projet](https://github.com/votre-repo/nutrisensia/issues)
