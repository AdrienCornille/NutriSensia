-- =====================================================
-- NutriSensia - Script de Migration vers l'Architecture Optimisée
-- Migration sécurisée des données existantes vers la nouvelle structure
-- =====================================================

-- IMPORTANT: Faire une sauvegarde de la base de données avant d'exécuter ce script !
-- pg_dump -h your-host -U your-user -d your-database > backup_before_migration.sql

BEGIN;

-- =====================================================
-- ÉTAPE 1: SAUVEGARDE DES DONNÉES EXISTANTES
-- =====================================================

-- Créer des tables temporaires pour sauvegarder les données
CREATE TEMP TABLE temp_profiles_backup AS
SELECT * FROM profiles;

-- Sauvegarder la table nutritionists si elle existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'nutritionists') THEN
        EXECUTE 'CREATE TEMP TABLE temp_nutritionists_backup AS SELECT * FROM nutritionists';
    END IF;
END $$;

-- Sauvegarder la table users si elle existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        EXECUTE 'CREATE TEMP TABLE temp_users_backup AS SELECT * FROM users';
    END IF;
END $$;

-- =====================================================
-- ÉTAPE 2: SUPPRESSION DES CONTRAINTES ET TABLES
-- =====================================================

-- Supprimer les tables dans l'ordre correct (dépendances)
DROP TABLE IF EXISTS nutritionists CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- =====================================================
-- ÉTAPE 3: CRÉATION DE LA NOUVELLE STRUCTURE
-- =====================================================

-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Table profiles optimisée
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'patient' CHECK (role IN ('patient', 'nutritionist', 'admin')),
    email_verified BOOLEAN DEFAULT FALSE,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    last_sign_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table nutritionists optimisée
CREATE TABLE nutritionists (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Informations personnelles
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    
    -- Localisation et préférences
    locale TEXT DEFAULT 'fr-CH',
    timezone TEXT DEFAULT 'Europe/Zurich',
    
    -- Identifiants professionnels
    asca_number TEXT UNIQUE,
    rme_number TEXT UNIQUE,
    ean_code TEXT,
    
    -- Informations professionnelles
    specializations TEXT[],
    bio TEXT,
    consultation_rates JSONB DEFAULT '{
        "initial": 22500,
        "follow_up": 15000,
        "express": 7500
    }'::jsonb,
    
    -- Adresse du cabinet
    practice_address JSONB DEFAULT '{
        "street": "",
        "postal_code": "",
        "city": "",
        "canton": "",
        "country": "CH"
    }'::jsonb,
    
    -- Paramètres professionnels
    verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    max_patients INTEGER DEFAULT 100,
    
    -- Paramètres de confidentialité
    profile_public BOOLEAN DEFAULT FALSE,
    allow_contact BOOLEAN DEFAULT TRUE,
    
    -- Préférences de notification
    notification_preferences JSONB DEFAULT '{
        "email": true, 
        "push": true, 
        "sms": false
    }'::jsonb,
    
    -- Données d'onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    onboarding_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table patients optimisée
CREATE TABLE patients (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- Informations personnelles
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    
    -- Localisation et préférences
    locale TEXT DEFAULT 'fr-CH',
    timezone TEXT DEFAULT 'Europe/Zurich',
    
    -- Informations médicales/nutritionnelles
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other')),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active')),
    
    -- Préférences et restrictions alimentaires
    dietary_restrictions TEXT[],
    allergies TEXT[],
    goals TEXT[],
    
    -- Paramètres de confidentialité
    profile_public BOOLEAN DEFAULT FALSE,
    allow_contact BOOLEAN DEFAULT TRUE,
    
    -- Préférences de notification
    notification_preferences JSONB DEFAULT '{
        "email": true, 
        "push": true, 
        "sms": false
    }'::jsonb,
    
    -- Données d'onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    onboarding_data JSONB DEFAULT '{}'::jsonb,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÉTAPE 4: MIGRATION DES DONNÉES EXISTANTES
-- =====================================================

-- Migrer les données vers la nouvelle table profiles
INSERT INTO profiles (
    id, 
    email, 
    role, 
    email_verified, 
    two_factor_enabled, 
    last_sign_in_at, 
    created_at, 
    updated_at
)
SELECT 
    id,
    email,
    role,
    COALESCE(email_verified, FALSE),
    COALESCE(two_factor_enabled, FALSE),
    last_sign_in_at,
    created_at,
    updated_at
FROM temp_profiles_backup
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    email_verified = EXCLUDED.email_verified,
    two_factor_enabled = EXCLUDED.two_factor_enabled,
    last_sign_in_at = EXCLUDED.last_sign_in_at,
    updated_at = EXCLUDED.updated_at;

-- Migrer les données des nutritionnistes existants (si la table existait)
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'temp_nutritionists_backup') THEN
        INSERT INTO nutritionists (
            id,
            first_name,
            last_name,
            phone,
            avatar_url,
            locale,
            timezone,
            asca_number,
            rme_number,
            ean_code,
            specializations,
            bio,
            consultation_rates,
            practice_address,
            verified,
            is_active,
            max_patients,
            created_at,
            updated_at
        )
        SELECT 
            n.id,
            -- Extraire first_name et last_name depuis full_name si nécessaire
            COALESCE(
                p.first_name, 
                CASE 
                    WHEN p.full_name IS NOT NULL THEN split_part(p.full_name, ' ', 1)
                    ELSE 'Prénom'
                END
            ) as first_name,
            COALESCE(
                p.last_name, 
                CASE 
                    WHEN p.full_name IS NOT NULL AND position(' ' in p.full_name) > 0
                    THEN substring(p.full_name from position(' ' in p.full_name) + 1)
                    ELSE 'Nom'
                END
            ) as last_name,
            p.phone,
            p.avatar_url,
            COALESCE(p.locale, 'fr-CH'),
            COALESCE(p.timezone, 'Europe/Zurich'),
            n.asca_number,
            n.rme_number,
            n.ean_code,
            n.specializations,
            n.bio,
            n.consultation_rates,
            n.practice_address,
            COALESCE(n.verified, FALSE),
            COALESCE(n.is_active, TRUE),
            COALESCE(n.max_patients, 100),
            n.created_at,
            n.updated_at
        FROM temp_nutritionists_backup n
        JOIN temp_profiles_backup p ON n.id = p.id
        WHERE p.role = 'nutritionist';
        
        RAISE NOTICE 'Données nutritionnistes migrées depuis l''ancienne table';
    ELSE
        RAISE NOTICE 'Aucune table nutritionists existante - migration depuis profiles uniquement';
        
        -- Créer des entrées nutritionnistes basiques depuis les profils avec role='nutritionist'
        INSERT INTO nutritionists (
            id,
            first_name,
            last_name,
            phone,
            avatar_url,
            locale,
            timezone,
            specializations,
            verified,
            is_active,
            max_patients,
            profile_public,
            allow_contact,
            notification_preferences,
            onboarding_completed,
            created_at,
            updated_at
        )
        SELECT 
            p.id,
            COALESCE(
                p.first_name, 
                CASE 
                    WHEN p.full_name IS NOT NULL THEN split_part(p.full_name, ' ', 1)
                    ELSE 'Prénom'
                END
            ) as first_name,
            COALESCE(
                p.last_name, 
                CASE 
                    WHEN p.full_name IS NOT NULL AND position(' ' in p.full_name) > 0
                    THEN substring(p.full_name from position(' ' in p.full_name) + 1)
                    ELSE 'Nom'
                END
            ) as last_name,
            p.phone,
            p.avatar_url,
            COALESCE(p.locale, 'fr-CH'),
            COALESCE(p.timezone, 'Europe/Zurich'),
            ARRAY[]::text[], -- specializations vides
            FALSE, -- verified
            TRUE, -- is_active
            100, -- max_patients
            FALSE, -- profile_public
            TRUE, -- allow_contact
            '{"email": true, "push": true, "sms": false}'::jsonb, -- notification_preferences
            FALSE, -- onboarding_completed
            p.created_at,
            p.updated_at
        FROM temp_profiles_backup p
        WHERE p.role = 'nutritionist';
    END IF;
END $$;

-- Migrer les données des patients (depuis l'ancienne table profiles - approche simplifiée)
INSERT INTO patients (
    id,
    first_name,
    last_name,
    phone,
    avatar_url,
    locale,
    timezone,
    height_cm,
    weight_kg,
    age,
    gender,
    activity_level,
    dietary_restrictions,
    allergies,
    goals,
    profile_public,
    allow_contact,
    notification_preferences,
    created_at,
    updated_at
)
SELECT 
    p.id,
    -- Extraire first_name et last_name depuis full_name si nécessaire
    COALESCE(
        p.first_name, 
        CASE 
            WHEN p.full_name IS NOT NULL THEN split_part(p.full_name, ' ', 1)
            ELSE 'Prénom'
        END
    ) as first_name,
    COALESCE(
        p.last_name, 
        CASE 
            WHEN p.full_name IS NOT NULL AND position(' ' in p.full_name) > 0
            THEN substring(p.full_name from position(' ' in p.full_name) + 1)
            ELSE 'Nom'
        END
    ) as last_name,
    p.phone,
    p.avatar_url,
    COALESCE(p.locale, 'fr-CH'),
    COALESCE(p.timezone, 'Europe/Zurich'),
    -- Colonnes spécifiques patients - valeurs par défaut car absentes de votre structure
    NULL as height_cm,
    NULL as weight_kg,
    NULL as age,
    NULL as gender,
    NULL as activity_level,
    ARRAY[]::text[] as dietary_restrictions,
    ARRAY[]::text[] as allergies,
    ARRAY[]::text[] as goals,
    FALSE as profile_public,
    TRUE as allow_contact,
    '{"email": true, "push": true, "sms": false}'::jsonb as notification_preferences,
    p.created_at,
    p.updated_at
FROM temp_profiles_backup p
WHERE p.role = 'patient';

-- =====================================================
-- ÉTAPE 5: CRÉATION DES INDEX ET CONTRAINTES
-- =====================================================

-- Index pour la table profiles
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_profiles_last_sign_in ON profiles(last_sign_in_at);

-- Index pour la table nutritionists
CREATE INDEX idx_nutritionists_asca ON nutritionists(asca_number);
CREATE INDEX idx_nutritionists_rme ON nutritionists(rme_number);
CREATE INDEX idx_nutritionists_verified ON nutritionists(verified);
CREATE INDEX idx_nutritionists_active ON nutritionists(is_active);
CREATE INDEX idx_nutritionists_specializations ON nutritionists USING GIN(specializations);

-- Index pour la table patients
CREATE INDEX idx_patients_age ON patients(age);
CREATE INDEX idx_patients_gender ON patients(gender);
CREATE INDEX idx_patients_activity_level ON patients(activity_level);
CREATE INDEX idx_patients_dietary_restrictions ON patients USING GIN(dietary_restrictions);
CREATE INDEX idx_patients_allergies ON patients USING GIN(allergies);
CREATE INDEX idx_patients_goals ON patients USING GIN(goals);

-- =====================================================
-- ÉTAPE 6: CONFIGURATION DE LA SÉCURITÉ (RLS)
-- =====================================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionists ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Politiques pour la table profiles
CREATE POLICY "Users can view their own profile"
    ON profiles FOR SELECT
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "Users can update their own profile"
    ON profiles FOR UPDATE
    USING ((SELECT auth.uid()) = id);

-- Politiques pour la table nutritionists
CREATE POLICY "Nutritionists can view their own data"
    ON nutritionists FOR SELECT
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "Nutritionists can update their own data"
    ON nutritionists FOR UPDATE
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "Nutritionists can insert their own data"
    ON nutritionists FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "Public can view verified nutritionist profiles"
    ON nutritionists FOR SELECT
    USING (verified = true AND profile_public = true);

-- Politiques pour la table patients
CREATE POLICY "Patients can view their own data"
    ON patients FOR SELECT
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "Patients can update their own data"
    ON patients FOR UPDATE
    USING ((SELECT auth.uid()) = id);

CREATE POLICY "Patients can insert their own data"
    ON patients FOR INSERT
    WITH CHECK ((SELECT auth.uid()) = id);

-- =====================================================
-- ÉTAPE 7: TRIGGERS ET FONCTIONS
-- =====================================================

-- Supprimer l'ancienne fonction trigger si elle existe
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Fonction pour mettre à jour updated_at
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour toutes les tables
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutritionists_updated_at
    BEFORE UPDATE ON nutritionists
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ÉTAPE 8: FONCTIONS UTILITAIRES
-- =====================================================

-- Supprimer les anciennes fonctions si elles existent (pour éviter les conflits de paramètres)
DROP FUNCTION IF EXISTS get_user_role(uuid);
DROP FUNCTION IF EXISTS is_verified_nutritionist(uuid);

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM profiles WHERE id = user_id;
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur est un nutritionniste vérifié
CREATE FUNCTION is_verified_nutritionist(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_verified BOOLEAN := FALSE;
BEGIN
    SELECT verified INTO is_verified 
    FROM nutritionists 
    WHERE id = user_id;
    
    RETURN COALESCE(is_verified, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ÉTAPE 9: VUES PRATIQUES
-- =====================================================

-- Vue pour obtenir les informations complètes d'un nutritionniste
CREATE OR REPLACE VIEW nutritionist_profiles AS
SELECT 
    p.id,
    p.email,
    p.role,
    p.email_verified,
    p.two_factor_enabled,
    p.last_sign_in_at,
    n.first_name,
    n.last_name,
    n.phone,
    n.avatar_url,
    n.locale,
    n.timezone,
    n.asca_number,
    n.rme_number,
    n.ean_code,
    n.specializations,
    n.bio,
    n.consultation_rates,
    n.practice_address,
    n.verified,
    n.is_active,
    n.max_patients,
    n.profile_public,
    n.allow_contact,
    n.notification_preferences,
    n.onboarding_completed,
    n.onboarding_completed_at,
    p.created_at,
    n.updated_at
FROM profiles p
JOIN nutritionists n ON p.id = n.id;

-- Vue pour obtenir les informations complètes d'un patient
CREATE OR REPLACE VIEW patient_profiles AS
SELECT 
    p.id,
    p.email,
    p.role,
    p.email_verified,
    p.two_factor_enabled,
    p.last_sign_in_at,
    pt.first_name,
    pt.last_name,
    pt.phone,
    pt.avatar_url,
    pt.locale,
    pt.timezone,
    pt.height_cm,
    pt.weight_kg,
    pt.age,
    pt.gender,
    pt.activity_level,
    pt.dietary_restrictions,
    pt.allergies,
    pt.goals,
    pt.profile_public,
    pt.allow_contact,
    pt.notification_preferences,
    pt.onboarding_completed,
    pt.onboarding_completed_at,
    p.created_at,
    pt.updated_at
FROM profiles p
JOIN patients pt ON p.id = pt.id;

-- =====================================================
-- ÉTAPE 10: VÉRIFICATION DE LA MIGRATION
-- =====================================================

-- Vérifier le nombre d'enregistrements migrés
DO $$
DECLARE
    old_profiles_count INTEGER;
    new_profiles_count INTEGER;
    old_nutritionists_count INTEGER := 0;
    new_nutritionists_count INTEGER;
    patients_count INTEGER;
    nutritionists_from_profiles INTEGER;
BEGIN
    -- Compter les anciens enregistrements
    SELECT COUNT(*) INTO old_profiles_count FROM temp_profiles_backup;
    
    -- Compter les nutritionnistes dans l'ancienne structure (si table existait)
    IF EXISTS (SELECT FROM pg_tables WHERE tablename = 'temp_nutritionists_backup') THEN
        SELECT COUNT(*) INTO old_nutritionists_count FROM temp_nutritionists_backup;
    ELSE
        -- Compter les nutritionnistes dans profiles
        SELECT COUNT(*) INTO nutritionists_from_profiles FROM temp_profiles_backup WHERE role = 'nutritionist';
        old_nutritionists_count := nutritionists_from_profiles;
    END IF;
    
    -- Compter les nouveaux enregistrements
    SELECT COUNT(*) INTO new_profiles_count FROM profiles;
    SELECT COUNT(*) INTO new_nutritionists_count FROM nutritionists;
    SELECT COUNT(*) INTO patients_count FROM patients;
    
    -- Afficher les résultats
    RAISE NOTICE 'Migration terminée:';
    RAISE NOTICE '  Anciens profils: %, Nouveaux profils: %', old_profiles_count, new_profiles_count;
    RAISE NOTICE '  Nutritionnistes (anciens/nouveaux): % / %', old_nutritionists_count, new_nutritionists_count;
    RAISE NOTICE '  Nouveaux patients: %', patients_count;
    
    -- Vérifier la cohérence
    IF new_profiles_count != old_profiles_count THEN
        RAISE WARNING 'Attention: Nombre de profils différent après migration!';
    END IF;
    
    IF new_nutritionists_count != old_nutritionists_count THEN
        RAISE NOTICE 'Info: Nombre de nutritionnistes différent (normal si migration depuis profiles)';
    END IF;
    
    RAISE NOTICE '✅ Migration terminée avec succès !';
END $$;

-- Ajouter des commentaires sur les tables
COMMENT ON TABLE profiles IS 'Table des profils utilisateur - informations d''authentification et base uniquement';
COMMENT ON TABLE nutritionists IS 'Table des nutritionnistes - profils complets avec informations professionnelles';
COMMENT ON TABLE patients IS 'Table des patients - profils complets avec informations médicales/nutritionnelles';

COMMIT;

-- =====================================================
-- INSTRUCTIONS POST-MIGRATION
-- =====================================================

/*
INSTRUCTIONS APRÈS LA MIGRATION:

1. Vérifiez que toutes les données ont été correctement migrées
2. Testez l'application avec la nouvelle structure
3. Mettez à jour le code de l'application pour utiliser les nouvelles tables
4. Supprimez les tables temporaires si tout fonctionne correctement:
   - Les tables temp_*_backup sont automatiquement supprimées à la fin de la session
5. Créez une nouvelle sauvegarde de la base de données migrée

En cas de problème, vous pouvez restaurer depuis le backup créé au début:
psql -h your-host -U your-user -d your-database < backup_before_migration.sql
*/
