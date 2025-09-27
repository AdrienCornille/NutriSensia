-- =====================================================
-- MIGRATION VERS UNE STRUCTURE DE BASE DE DONNÉES OPTIMISÉE
-- Suppression des redondances et création d'une structure logique
-- =====================================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. CRÉER LES NOUVELLES TABLES
-- =====================================================

-- Table nutritionist_profiles (toutes les données des nutritionnistes)
CREATE TABLE IF NOT EXISTS nutritionist_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informations personnelles (migrées depuis profiles)
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    locale TEXT DEFAULT 'fr',
    timezone TEXT DEFAULT 'Europe/Zurich',
    
    -- Identifiants professionnels
    asca_number TEXT,
    rme_number TEXT,
    ean_code TEXT,
    
    -- Informations professionnelles
    specializations TEXT[],
    bio TEXT,
    consultation_rates JSONB,
    practice_address JSONB,
    consultation_types TEXT[] DEFAULT ARRAY['in-person'],
    available_languages TEXT[] DEFAULT ARRAY['fr'],
    
    -- Statuts et limites
    verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    max_patients INTEGER DEFAULT 100,
    
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMPTZ,
    onboarding_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table patient_profiles (pour les futurs patients)
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Informations personnelles
    first_name TEXT,
    last_name TEXT,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    locale TEXT DEFAULT 'fr',
    timezone TEXT DEFAULT 'Europe/Zurich',
    
    -- Informations de santé
    date_of_birth DATE,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer-not-to-say')),
    height_cm INTEGER,
    weight_kg DECIMAL(5,2),
    activity_level TEXT CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very-active')),
    
    -- Préférences et restrictions
    dietary_restrictions TEXT[],
    allergies TEXT[],
    medical_conditions TEXT[],
    medications TEXT[],
    goals TEXT[],
    
    -- Onboarding
    onboarding_completed BOOLEAN DEFAULT FALSE,
    onboarding_completed_at TIMESTAMPTZ,
    onboarding_data JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. MIGRER LES DONNÉES EXISTANTES
-- =====================================================

-- Migrer les nutritionnistes existants
INSERT INTO nutritionist_profiles (
    id, first_name, last_name, full_name, phone, avatar_url, locale, timezone,
    asca_number, rme_number, ean_code, specializations, bio, consultation_rates, 
    practice_address, verified, is_active, max_patients, created_at, updated_at
)
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.locale,
    p.timezone,
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
    GREATEST(p.created_at, n.created_at),
    GREATEST(p.updated_at, n.updated_at)
FROM profiles p
LEFT JOIN nutritionists n ON p.id = n.id
WHERE p.role = 'nutritionist'
ON CONFLICT (id) DO UPDATE SET
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    avatar_url = EXCLUDED.avatar_url,
    locale = EXCLUDED.locale,
    timezone = EXCLUDED.timezone,
    asca_number = EXCLUDED.asca_number,
    rme_number = EXCLUDED.rme_number,
    ean_code = EXCLUDED.ean_code,
    specializations = EXCLUDED.specializations,
    bio = EXCLUDED.bio,
    consultation_rates = EXCLUDED.consultation_rates,
    practice_address = EXCLUDED.practice_address,
    verified = EXCLUDED.verified,
    is_active = EXCLUDED.is_active,
    max_patients = EXCLUDED.max_patients,
    updated_at = NOW();

-- Migrer les patients existants (s'il y en a)
INSERT INTO patient_profiles (
    id, first_name, last_name, full_name, phone, avatar_url, locale, timezone,
    date_of_birth, gender, height_cm, weight_kg, activity_level,
    dietary_restrictions, allergies, goals, created_at, updated_at
)
SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.locale,
    p.timezone,
    -- Ces champs pourraient ne pas exister dans la structure actuelle
    NULL as date_of_birth,
    NULL as gender,
    NULL as height_cm,
    NULL as weight_kg,
    NULL as activity_level,
    NULL as dietary_restrictions,
    NULL as allergies,
    NULL as goals,
    p.created_at,
    p.updated_at
FROM profiles p
WHERE p.role = 'patient'
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 3. NETTOYER LA TABLE PROFILES
-- =====================================================

-- Sauvegarder l'ancienne structure (optionnel, pour rollback)
CREATE TABLE IF NOT EXISTS profiles_backup AS SELECT * FROM profiles;

-- Supprimer les colonnes redondantes de la table profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS first_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS full_name;
ALTER TABLE profiles DROP COLUMN IF EXISTS phone;
ALTER TABLE profiles DROP COLUMN IF EXISTS avatar_url;
ALTER TABLE profiles DROP COLUMN IF EXISTS locale;
ALTER TABLE profiles DROP COLUMN IF EXISTS timezone;

-- =====================================================
-- 4. SUPPRIMER L'ANCIENNE TABLE NUTRITIONISTS
-- =====================================================

-- Sauvegarder l'ancienne table nutritionists (pour rollback)
CREATE TABLE IF NOT EXISTS nutritionists_backup AS SELECT * FROM nutritionists;

-- Supprimer la table nutritionists (maintenant redondante)
DROP TABLE IF EXISTS nutritionists;

-- =====================================================
-- 5. CRÉER LES INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================

-- Index pour nutritionist_profiles
CREATE INDEX IF NOT EXISTS idx_nutritionist_profiles_verified ON nutritionist_profiles(verified);
CREATE INDEX IF NOT EXISTS idx_nutritionist_profiles_is_active ON nutritionist_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_nutritionist_profiles_specializations ON nutritionist_profiles USING GIN(specializations);
CREATE INDEX IF NOT EXISTS idx_nutritionist_profiles_asca ON nutritionist_profiles(asca_number) WHERE asca_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nutritionist_profiles_rme ON nutritionist_profiles(rme_number) WHERE rme_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_nutritionist_profiles_onboarding ON nutritionist_profiles(onboarding_completed);

-- Index pour patient_profiles
CREATE INDEX IF NOT EXISTS idx_patient_profiles_onboarding ON patient_profiles(onboarding_completed);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_activity_level ON patient_profiles(activity_level);

-- Index pour profiles (structure simplifiée)
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);
CREATE INDEX IF NOT EXISTS idx_profiles_two_factor ON profiles(two_factor_enabled);

-- =====================================================
-- 6. CRÉER LES FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_nutritionist_profiles_updated_at
    BEFORE UPDATE ON nutritionist_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_profiles_updated_at
    BEFORE UPDATE ON patient_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. CRÉER LES POLITIQUES RLS (Row Level Security)
-- =====================================================

-- Activer RLS
ALTER TABLE nutritionist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

-- Politiques pour nutritionist_profiles
CREATE POLICY "Nutritionists can view own profile" ON nutritionist_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Nutritionists can update own profile" ON nutritionist_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Nutritionists can insert own profile" ON nutritionist_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politiques pour patient_profiles
CREATE POLICY "Patients can view own profile" ON patient_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Patients can update own profile" ON patient_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Patients can insert own profile" ON patient_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- MIGRATION TERMINÉE
-- =====================================================

-- Afficher un résumé
DO $$
BEGIN
    RAISE NOTICE '✅ Migration terminée avec succès !';
    RAISE NOTICE '📊 Nouvelles tables créées :';
    RAISE NOTICE '   - nutritionist_profiles (avec toutes les données nutritionnistes)';
    RAISE NOTICE '   - patient_profiles (pour les futurs patients)';
    RAISE NOTICE '🧹 Table profiles nettoyée (gardé seulement les champs essentiels)';
    RAISE NOTICE '🗑️  Table nutritionists supprimée (données migrées)';
    RAISE NOTICE '💾 Tables de sauvegarde créées pour rollback si nécessaire';
    RAISE NOTICE '🔒 Politiques RLS configurées';
    RAISE NOTICE '⚡ Index créés pour optimiser les performances';
END $$;
