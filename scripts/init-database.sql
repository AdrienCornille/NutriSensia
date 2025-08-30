-- =====================================================
-- NUTRISENSIA - SCRIPT D'INITIALISATION DE LA BASE DE DONNÉES
-- Système complet de rôles et profils utilisateur
-- =====================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- SUPPRESSION DES FONCTIONS EXISTANTES
-- =====================================================

-- Supprimer toutes les fonctions existantes pour éviter les conflits
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_user_sign_in() CASCADE;
DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_nutritionist(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_stats() CASCADE;

-- =====================================================
-- TABLE PROFILES - Profils utilisateur avec rôles
-- =====================================================

-- Suppression de la table si elle existe
DROP TABLE IF EXISTS profiles CASCADE;

-- Création de la table profiles avec tous les champs nécessaires
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'nutritionist', 'admin')),
    avatar_url TEXT,
    phone TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Informations nutritionnelles spécifiques
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    
    -- Préférences et restrictions
    dietary_restrictions TEXT[],
    allergies TEXT[],
    goals TEXT[],
    
    -- Paramètres de confidentialité
    profile_public BOOLEAN DEFAULT FALSE,
    allow_contact BOOLEAN DEFAULT TRUE,
    
    -- Métadonnées
    timezone TEXT DEFAULT 'Europe/Paris',
    language TEXT DEFAULT 'fr',
    notification_preferences JSONB DEFAULT '{"email": true, "push": true, "sms": false}'::jsonb
);

-- Index pour optimiser les performances
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_profiles_last_sign_in ON profiles(last_sign_in_at);

-- =====================================================
-- TABLE USERS - Table de compatibilité (optionnelle)
-- =====================================================

-- Suppression de la table si elle existe
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE MEALS - Repas et nutrition
-- =====================================================

-- Suppression de la table si elle existe
DROP TABLE IF EXISTS meals CASCADE;

CREATE TABLE meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    ingredients JSONB,
    total_calories INTEGER,
    total_protein DECIMAL(5,2),
    total_carbs DECIMAL(5,2),
    total_fat DECIMAL(5,2),
    total_fiber DECIMAL(5,2),
    total_sugar DECIMAL(5,2),
    total_sodium DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABLE MEAL_PLANS - Plans de repas
-- =====================================================

-- Suppression de la table si elle existe
DROP TABLE IF EXISTS meal_plans CASCADE;

CREATE TABLE meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    meals UUID[],
    total_calories INTEGER,
    total_protein DECIMAL(5,2),
    total_carbs DECIMAL(5,2),
    total_fat DECIMAL(5,2),
    total_fiber DECIMAL(5,2),
    total_sugar DECIMAL(5,2),
    total_sodium DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SUPPRESSION DES TRIGGERS EXISTANTS
-- =====================================================

-- Supprimer tous les triggers existants pour éviter les conflits
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_meals_updated_at ON meals;
DROP TRIGGER IF EXISTS update_meal_plans_updated_at ON meal_plans;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;

-- =====================================================
-- TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Trigger pour profiles
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour users
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour meals
CREATE TRIGGER update_meals_updated_at 
    BEFORE UPDATE ON meals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger pour meal_plans
CREATE TRIGGER update_meal_plans_updated_at 
    BEFORE UPDATE ON meal_plans 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        avatar_url,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', ''),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
        NOW(),
        NOW()
    );
    
    -- Créer aussi une entrée dans la table users pour compatibilité
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour mettre à jour last_sign_in_at
CREATE OR REPLACE FUNCTION handle_user_sign_in()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.profiles 
    SET last_sign_in_at = NOW()
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier les rôles utilisateur
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID DEFAULT auth.uid())
RETURNS TEXT AS $$
BEGIN
    RETURN (
        SELECT role 
        FROM profiles 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur est nutritioniste
CREATE OR REPLACE FUNCTION is_nutritionist(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role IN ('nutritionist', 'admin')
        FROM profiles 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si l'utilisateur est admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN (
        SELECT role = 'admin'
        FROM profiles 
        WHERE id = user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS POUR GESTION AUTOMATIQUE
-- =====================================================

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger pour mettre à jour last_sign_in_at lors de la connexion
CREATE TRIGGER on_auth_user_sign_in
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_user_sign_in();

-- =====================================================
-- ACTIVATION DE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- SUPPRESSION DES POLITIQUES RLS EXISTANTES
-- =====================================================

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Profils publics visibles par tous les utilisateurs authentifiés" ON profiles;
DROP POLICY IF EXISTS "Nutritionistes peuvent voir les profils patients" ON profiles;
DROP POLICY IF EXISTS "Admins peuvent voir tous les profils" ON profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent créer leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent mettre à jour leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Admins peuvent mettre à jour tous les profils" ON profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent supprimer leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Admins peuvent supprimer tous les profils" ON profiles;

DROP POLICY IF EXISTS "Utilisateurs peuvent voir leur propre entrée users" ON users;
DROP POLICY IF EXISTS "Admins peuvent voir toutes les entrées users" ON users;

DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs propres repas" ON meals;
DROP POLICY IF EXISTS "Nutritionistes peuvent voir les repas patients" ON meals;
DROP POLICY IF EXISTS "Admins peuvent voir tous les repas" ON meals;
DROP POLICY IF EXISTS "Utilisateurs peuvent créer leurs propres repas" ON meals;
DROP POLICY IF EXISTS "Utilisateurs peuvent mettre à jour leurs propres repas" ON meals;
DROP POLICY IF EXISTS "Utilisateurs peuvent supprimer leurs propres repas" ON meals;

DROP POLICY IF EXISTS "Utilisateurs peuvent voir leurs propres plans de repas" ON meal_plans;
DROP POLICY IF EXISTS "Nutritionistes peuvent voir les plans de repas patients" ON meal_plans;
DROP POLICY IF EXISTS "Admins peuvent voir tous les plans de repas" ON meal_plans;
DROP POLICY IF EXISTS "Utilisateurs peuvent créer leurs propres plans de repas" ON meal_plans;
DROP POLICY IF EXISTS "Utilisateurs peuvent mettre à jour leurs propres plans de repas" ON meal_plans;
DROP POLICY IF EXISTS "Utilisateurs peuvent supprimer leurs propres plans de repas" ON meal_plans;

-- =====================================================
-- POLITIQUES RLS POUR PROFILES
-- =====================================================

-- Politique : Les profils publics sont visibles par tous les utilisateurs authentifiés
CREATE POLICY "Profils publics visibles par tous les utilisateurs authentifiés"
    ON profiles FOR SELECT
    TO authenticated
    USING (profile_public = true OR auth.uid() = id);

-- Politique : Les nutritionistes peuvent voir les profils de leurs patients
CREATE POLICY "Nutritionistes peuvent voir les profils patients"
    ON profiles FOR SELECT
    TO authenticated
    USING (
        is_nutritionist() AND role = 'patient'
    );

-- Politique : Les admins peuvent voir tous les profils
CREATE POLICY "Admins peuvent voir tous les profils"
    ON profiles FOR SELECT
    TO authenticated
    USING (is_admin());

-- Politique : Les utilisateurs peuvent créer leur propre profil
CREATE POLICY "Utilisateurs peuvent créer leur propre profil"
    ON profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Politique : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Utilisateurs peuvent mettre à jour leur propre profil"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Politique : Les admins peuvent mettre à jour tous les profils
CREATE POLICY "Admins peuvent mettre à jour tous les profils"
    ON profiles FOR UPDATE
    TO authenticated
    USING (is_admin())
    WITH CHECK (is_admin());

-- Politique : Les utilisateurs peuvent supprimer leur propre profil
CREATE POLICY "Utilisateurs peuvent supprimer leur propre profil"
    ON profiles FOR DELETE
    TO authenticated
    USING (auth.uid() = id);

-- Politique : Les admins peuvent supprimer tous les profils
CREATE POLICY "Admins peuvent supprimer tous les profils"
    ON profiles FOR DELETE
    TO authenticated
    USING (is_admin());

-- =====================================================
-- POLITIQUES RLS POUR USERS
-- =====================================================

-- Politique : Les utilisateurs peuvent voir leur propre entrée
CREATE POLICY "Utilisateurs peuvent voir leur propre entrée users"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- Politique : Les admins peuvent voir toutes les entrées
CREATE POLICY "Admins peuvent voir toutes les entrées users"
    ON users FOR SELECT
    TO authenticated
    USING (is_admin());

-- =====================================================
-- POLITIQUES RLS POUR MEALS
-- =====================================================

-- Politique : Les utilisateurs peuvent voir leurs propres repas
CREATE POLICY "Utilisateurs peuvent voir leurs propres repas"
    ON meals FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Politique : Les nutritionistes peuvent voir les repas de leurs patients
CREATE POLICY "Nutritionistes peuvent voir les repas patients"
    ON meals FOR SELECT
    TO authenticated
    USING (
        is_nutritionist() AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = meals.user_id AND role = 'patient'
        )
    );

-- Politique : Les admins peuvent voir tous les repas
CREATE POLICY "Admins peuvent voir tous les repas"
    ON meals FOR SELECT
    TO authenticated
    USING (is_admin());

-- Politique : Les utilisateurs peuvent créer leurs propres repas
CREATE POLICY "Utilisateurs peuvent créer leurs propres repas"
    ON meals FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres repas
CREATE POLICY "Utilisateurs peuvent mettre à jour leurs propres repas"
    ON meals FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres repas
CREATE POLICY "Utilisateurs peuvent supprimer leurs propres repas"
    ON meals FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================
-- POLITIQUES RLS POUR MEAL_PLANS
-- =====================================================

-- Politique : Les utilisateurs peuvent voir leurs propres plans de repas
CREATE POLICY "Utilisateurs peuvent voir leurs propres plans de repas"
    ON meal_plans FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Politique : Les nutritionistes peuvent voir les plans de repas de leurs patients
CREATE POLICY "Nutritionistes peuvent voir les plans de repas patients"
    ON meal_plans FOR SELECT
    TO authenticated
    USING (
        is_nutritionist() AND 
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = meal_plans.user_id AND role = 'patient'
        )
    );

-- Politique : Les admins peuvent voir tous les plans de repas
CREATE POLICY "Admins peuvent voir tous les plans de repas"
    ON meal_plans FOR SELECT
    TO authenticated
    USING (is_admin());

-- Politique : Les utilisateurs peuvent créer leurs propres plans de repas
CREATE POLICY "Utilisateurs peuvent créer leurs propres plans de repas"
    ON meal_plans FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent mettre à jour leurs propres plans de repas
CREATE POLICY "Utilisateurs peuvent mettre à jour leurs propres plans de repas"
    ON meal_plans FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Politique : Les utilisateurs peuvent supprimer leurs propres plans de repas
CREATE POLICY "Utilisateurs peuvent supprimer leurs propres plans de repas"
    ON meal_plans FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- =====================================================
-- SUPPRESSION DES VUES EXISTANTES
-- =====================================================

-- Supprimer les vues existantes pour éviter les conflits
DROP VIEW IF EXISTS user_profiles;
DROP VIEW IF EXISTS user_stats;

-- =====================================================
-- VUES UTILITAIRES
-- =====================================================

-- Vue pour combiner les données des profils et utilisateurs
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.avatar_url,
    p.phone,
    p.email_verified,
    p.two_factor_enabled,
    p.last_sign_in_at,
    p.created_at,
    p.updated_at,
    p.height_cm,
    p.weight_kg,
    p.age,
    p.gender,
    p.activity_level,
    p.dietary_restrictions,
    p.allergies,
    p.goals,
    p.profile_public,
    p.allow_contact,
    p.timezone,
    p.language,
    p.notification_preferences
FROM profiles p
JOIN users u ON p.id = u.id;

-- Vue pour les statistiques utilisateur
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    role,
    COUNT(*) as total_users,
    COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
    COUNT(CASE WHEN two_factor_enabled = true THEN 1 END) as mfa_users,
    AVG(EXTRACT(YEAR FROM AGE(NOW(), created_at))) as avg_account_age_years,
    COUNT(CASE WHEN last_sign_in_at > NOW() - INTERVAL '30 days' THEN 1 END) as active_last_30_days
FROM profiles
GROUP BY role;

-- =====================================================
-- FONCTIONS DE STATISTIQUES
-- =====================================================

-- Fonction pour obtenir les statistiques d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_stats(user_id UUID DEFAULT auth.uid())
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_meals', (SELECT COUNT(*) FROM meals WHERE meals.user_id = get_user_stats.user_id),
        'total_meal_plans', (SELECT COUNT(*) FROM meal_plans WHERE meal_plans.user_id = get_user_stats.user_id),
        'last_meal_date', (SELECT MAX(created_at) FROM meals WHERE meals.user_id = get_user_stats.user_id),
        'last_meal_plan_date', (SELECT MAX(created_at) FROM meal_plans WHERE meal_plans.user_id = get_user_stats.user_id),
        'profile_completion', (
            SELECT 
                CASE 
                    WHEN p.height_cm IS NOT NULL AND p.weight_kg IS NOT NULL AND p.age IS NOT NULL 
                    THEN 100
                    WHEN p.height_cm IS NOT NULL OR p.weight_kg IS NOT NULL OR p.age IS NOT NULL 
                    THEN 50
                    ELSE 0
                END
            FROM profiles p 
            WHERE p.id = get_user_stats.user_id
        )
    ) INTO result;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MESSAGES DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Base de données NutriSensia initialisée avec succès !';
    RAISE NOTICE '📊 Tables créées : profiles, users, meals, meal_plans';
    RAISE NOTICE '🔒 RLS activé sur toutes les tables';
    RAISE NOTICE '👥 Système de rôles : patient, nutritionist, admin';
    RAISE NOTICE '🔄 Triggers configurés pour gestion automatique';
    RAISE NOTICE '📈 Vues créées : user_profiles, user_stats';
    RAISE NOTICE '⚙️ Fonctions utilitaires disponibles';
    RAISE NOTICE '🧹 Anciens triggers, politiques et fonctions supprimés pour éviter les conflits';
END $$;
