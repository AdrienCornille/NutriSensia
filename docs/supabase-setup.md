# Configuration Supabase pour NutriSensia

## Vue d'ensemble

Ce document décrit la configuration de Supabase pour le projet NutriSensia, incluant l'hébergement EU-West pour la conformité GDPR.

## Prérequis

1. Compte Supabase (https://supabase.com)
2. Projet Supabase créé avec la région EU-West

## Configuration du projet Supabase

### 1. Création du projet

1. Connectez-vous à votre compte Supabase
2. Cliquez sur "New Project"
3. Choisissez la région **EU-West (Ireland)** pour la conformité GDPR
4. Nommez votre projet "nutrisensia"
5. Créez le projet

### 2. Configuration de la base de données

#### Tables à créer

##### Table `users`

```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  preferences JSONB DEFAULT NULL
);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

##### Table `meals`

```sql
CREATE TABLE meals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  total_calories INTEGER NOT NULL,
  total_protein DECIMAL(5,2) NOT NULL,
  total_carbs DECIMAL(5,2) NOT NULL,
  total_fat DECIMAL(5,2) NOT NULL,
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_meals_updated_at BEFORE UPDATE ON meals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

##### Table `meal_plans`

```sql
CREATE TABLE meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  meals UUID[] NOT NULL,
  total_calories INTEGER NOT NULL,
  total_protein DECIMAL(5,2) NOT NULL,
  total_carbs DECIMAL(5,2) NOT NULL,
  total_fat DECIMAL(5,2) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 3. Configuration des politiques de sécurité (RLS)

#### Politique pour la table `users`

```sql
-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs ne peuvent voir que leurs propres données
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Politique : les utilisateurs peuvent mettre à jour leurs propres données
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Politique : les utilisateurs peuvent insérer leurs propres données
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

#### Politique pour la table `meals`

```sql
-- Activer RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs ne peuvent voir que leurs propres repas
CREATE POLICY "Users can view own meals" ON meals
  FOR SELECT USING (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent créer leurs propres repas
CREATE POLICY "Users can create own meals" ON meals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent mettre à jour leurs propres repas
CREATE POLICY "Users can update own meals" ON meals
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent supprimer leurs propres repas
CREATE POLICY "Users can delete own meals" ON meals
  FOR DELETE USING (auth.uid() = user_id);
```

#### Politique pour la table `meal_plans`

```sql
-- Activer RLS
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- Politique : les utilisateurs ne peuvent voir que leurs propres plans
CREATE POLICY "Users can view own meal plans" ON meal_plans
  FOR SELECT USING (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent créer leurs propres plans
CREATE POLICY "Users can create own meal plans" ON meal_plans
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent mettre à jour leurs propres plans
CREATE POLICY "Users can update own meal plans" ON meal_plans
  FOR UPDATE USING (auth.uid() = user_id);

-- Politique : les utilisateurs peuvent supprimer leurs propres plans
CREATE POLICY "Users can delete own meal plans" ON meal_plans
  FOR DELETE USING (auth.uid() = user_id);
```

## Configuration de l'application

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Configuration de l'environnement
NODE_ENV=development

# Autres variables d'environnement pour NutriSensia
NEXT_PUBLIC_APP_NAME=NutriSensia
NEXT_PUBLIC_APP_VERSION=0.1.0
```

### 2. Récupération des clés Supabase

1. Dans votre projet Supabase, allez dans Settings > API
2. Copiez l'URL du projet et la clé anon/public
3. Remplacez les valeurs dans `.env.local`

### 3. Configuration de l'authentification

Dans Supabase Dashboard > Authentication > Settings :

1. **Site URL** : `http://localhost:3000` (développement)
2. **Redirect URLs** :
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/dashboard`

## Test de la configuration

Utilisez le composant `SupabaseTest` pour vérifier que la configuration fonctionne :

1. Lancez l'application : `npm run dev`
2. Naviguez vers la page de test
3. Cliquez sur "Tester la connexion"
4. Cliquez sur "Tester l'authentification"

## Conformité GDPR

### Hébergement EU-West

- Le projet est configuré dans la région EU-West (Ireland)
- Les données sont stockées conformément au RGPD
- Les utilisateurs européens bénéficient d'une latence optimale

### Politiques de confidentialité

1. **Minimisation des données** : Seules les données nécessaires sont collectées
2. **Consentement** : Les utilisateurs doivent accepter les conditions d'utilisation
3. **Droit à l'oubli** : Les utilisateurs peuvent supprimer leurs données
4. **Portabilité** : Les utilisateurs peuvent exporter leurs données

## Dépannage

### Erreurs courantes

1. **"Variables d'environnement Supabase manquantes"**
   - Vérifiez que `.env.local` existe et contient les bonnes valeurs
   - Redémarrez le serveur de développement

2. **"Erreur de connexion"**
   - Vérifiez que l'URL et la clé Supabase sont correctes
   - Vérifiez que le projet Supabase est actif

3. **"Erreur d'authentification"**
   - Vérifiez la configuration des URLs de redirection
   - Vérifiez que l'authentification est activée dans Supabase

### Support

Pour plus d'aide, consultez :

- [Documentation Supabase](https://supabase.com/docs)
- [Guide de migration](https://supabase.com/docs/guides/migrations)
- [Politiques de sécurité](https://supabase.com/docs/guides/auth/row-level-security)
