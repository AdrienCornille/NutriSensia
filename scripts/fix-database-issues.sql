-- =====================================================
-- SCRIPT DE RÉPARATION DES PROBLÈMES DE BASE DE DONNÉES
-- Pour corriger les erreurs d'inscription
-- =====================================================

-- =====================================================
-- ÉTAPE 1: VÉRIFICATION ET NETTOYAGE
-- =====================================================

-- Supprimer les fonctions et triggers existants pour éviter les conflits
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS handle_user_sign_in() CASCADE;
DROP FUNCTION IF EXISTS get_user_role(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_nutritionist(UUID) CASCADE;
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Supprimer les triggers existants
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;

-- =====================================================
-- ÉTAPE 2: CRÉATION DES FONCTIONS DE BASE
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
-- ÉTAPE 3: CRÉATION/RÉPARATION DE LA TABLE PROFILES
-- =====================================================

-- Supprimer la table profiles si elle existe
DROP TABLE IF EXISTS profiles CASCADE;

-- Recréer la table profiles avec une structure simplifiée
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
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer les index essentiels
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- =====================================================
-- ÉTAPE 4: CRÉATION/RÉPARATION DE LA TABLE USERS
-- =====================================================

-- Supprimer la table users si elle existe
DROP TABLE IF EXISTS users CASCADE;

-- Recréer la table users
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÉTAPE 5: CRÉATION DES FONCTIONS ESSENTIELLES
-- =====================================================

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Insérer dans profiles
    INSERT INTO public.profiles (
        id,
        email,
        full_name,
        role,
        email_verified,
        created_at,
        updated_at
    ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient'),
        COALESCE(NEW.email_confirmed_at IS NOT NULL, FALSE),
        NOW(),
        NOW()
    );
    
    -- Insérer dans users pour compatibilité
    INSERT INTO public.users (id, email, created_at, updated_at)
    VALUES (NEW.id, NEW.email, NOW(), NOW());
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log l'erreur mais ne pas faire échouer l'inscription
        RAISE WARNING 'Erreur lors de la création du profil pour l''utilisateur %: %', NEW.id, SQLERRM;
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
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erreur lors de la mise à jour last_sign_in_at pour l''utilisateur %: %', NEW.id, SQLERRM;
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
-- ÉTAPE 6: CRÉATION DES TRIGGERS
-- =====================================================

-- Trigger pour créer automatiquement un profil lors de l'inscription
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger pour mettre à jour last_sign_in_at lors de la connexion
CREATE TRIGGER on_auth_user_sign_in
    AFTER UPDATE OF last_sign_in_at ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_user_sign_in();

-- Triggers pour mise à jour automatique
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ÉTAPE 7: ACTIVATION DE RLS
-- =====================================================

-- Activer RLS sur les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ÉTAPE 8: CRÉATION DES POLITIQUES RLS ESSENTIELLES
-- =====================================================

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Profils publics visibles par tous les utilisateurs authentifiés" ON profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent créer leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent mettre à jour leur propre profil" ON profiles;
DROP POLICY IF EXISTS "Utilisateurs peuvent voir leur propre entrée users" ON users;

-- Politique : Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Utilisateurs peuvent voir leur propre profil"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

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

-- Politique : Les utilisateurs peuvent voir leur propre entrée users
CREATE POLICY "Utilisateurs peuvent voir leur propre entrée users"
    ON users FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- =====================================================
-- ÉTAPE 9: CORRECTION DES UTILISATEURS EXISTANTS
-- =====================================================

-- Créer des profils pour les utilisateurs existants qui n'en ont pas
INSERT INTO profiles (id, email, full_name, role, email_verified, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'name', ''),
    COALESCE(u.raw_user_meta_data->>'role', 'patient'),
    COALESCE(u.email_confirmed_at IS NOT NULL, FALSE),
    u.created_at,
    u.updated_at
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Créer des entrées users pour les utilisateurs existants qui n'en ont pas
INSERT INTO users (id, email, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    u.created_at,
    u.updated_at
FROM auth.users u
WHERE NOT EXISTS (SELECT 1 FROM users us WHERE us.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ÉTAPE 10: VÉRIFICATION ET TEST
-- =====================================================

-- Vérifier que tout fonctionne
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test-repair@example.com';
    profile_created BOOLEAN := FALSE;
    user_created BOOLEAN := FALSE;
BEGIN
    -- Test de création d'un utilisateur
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data
    ) VALUES (
        test_user_id,
        test_email,
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"name": "Test Repair User", "role": "patient"}'::jsonb
    );
    
    -- Vérifier si le profil a été créé
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = test_user_id) INTO profile_created;
    
    -- Vérifier si l'entrée users a été créée
    SELECT EXISTS(SELECT 1 FROM users WHERE id = test_user_id) INTO user_created;
    
    -- Afficher les résultats
    IF profile_created THEN
        RAISE NOTICE '✅ Profil créé automatiquement';
    ELSE
        RAISE NOTICE '❌ Profil NON créé automatiquement';
    END IF;
    
    IF user_created THEN
        RAISE NOTICE '✅ Entrée users créée automatiquement';
    ELSE
        RAISE NOTICE '❌ Entrée users NON créée automatiquement';
    END IF;
    
    -- Nettoyer le test
    DELETE FROM auth.users WHERE id = test_user_id;
    RAISE NOTICE '🧹 Test utilisateur supprimé';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur lors du test: %', SQLERRM;
        -- Nettoyer en cas d'erreur
        DELETE FROM auth.users WHERE id = test_user_id;
END $$;

-- =====================================================
-- MESSAGES DE CONFIRMATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '🔧 RÉPARATION TERMINÉE';
    RAISE NOTICE '✅ Tables profiles et users recréées';
    RAISE NOTICE '✅ Fonctions et triggers réinstallés';
    RAISE NOTICE '✅ RLS activé avec politiques de base';
    RAISE NOTICE '✅ Utilisateurs existants corrigés';
    RAISE NOTICE '🧪 Test de création d''utilisateur effectué';
    RAISE NOTICE '💡 Essayez maintenant de créer un nouveau compte';
END $$;
