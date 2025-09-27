-- =====================================================
-- NutriSensia - Architecture de Base de Données Optimisée
-- Nouvelle structure sans redondance avec séparation claire des responsabilités
-- =====================================================

-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TABLE PROFILES - Informations d'authentification et base uniquement
-- =====================================================

-- Suppression et recréation de la table profiles optimisée
DROP TABLE IF EXISTS profiles CASCADE;

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

-- Index pour optimiser les performances
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_created_at ON profiles(created_at);
CREATE INDEX idx_profiles_last_sign_in ON profiles(last_sign_in_at);

-- =====================================================
-- 2. TABLE NUTRITIONISTS - Profils complets des nutritionnistes
-- =====================================================

-- Suppression et recréation de la table nutritionists optimisée
DROP TABLE IF EXISTS nutritionists CASCADE;

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
    ean_code TEXT, -- Code EAN pour facturation
    
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

-- Index pour optimiser les performances
CREATE INDEX idx_nutritionists_asca ON nutritionists(asca_number);
CREATE INDEX idx_nutritionists_rme ON nutritionists(rme_number);
CREATE INDEX idx_nutritionists_verified ON nutritionists(verified);
CREATE INDEX idx_nutritionists_active ON nutritionists(is_active);
CREATE INDEX idx_nutritionists_specializations ON nutritionists USING GIN(specializations);

-- =====================================================
-- 3. TABLE PATIENTS - Profils complets des patients
-- =====================================================

-- Suppression et recréation de la table patients optimisée
DROP TABLE IF EXISTS patients CASCADE;

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

-- Index pour optimiser les performances
CREATE INDEX idx_patients_age ON patients(age);
CREATE INDEX idx_patients_gender ON patients(gender);
CREATE INDEX idx_patients_activity_level ON patients(activity_level);
CREATE INDEX idx_patients_dietary_restrictions ON patients USING GIN(dietary_restrictions);
CREATE INDEX idx_patients_allergies ON patients USING GIN(allergies);
CREATE INDEX idx_patients_goals ON patients USING GIN(goals);

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
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
-- 5. TRIGGERS POUR MISE À JOUR AUTOMATIQUE
-- =====================================================

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
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
-- 6. FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour obtenir le rôle d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM profiles WHERE id = user_id;
    RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier si un utilisateur est un nutritionniste vérifié
CREATE OR REPLACE FUNCTION is_verified_nutritionist(user_id UUID)
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
-- 7. VUES PRATIQUES
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
-- 8. DONNÉES D'EXEMPLE (OPTIONNEL)
-- =====================================================

-- Insertion d'un profil admin par défaut (optionnel)
-- INSERT INTO profiles (id, email, role, email_verified) 
-- VALUES (
--     gen_random_uuid(), 
--     'admin@nutrisensia.ch', 
--     'admin', 
--     true
-- ) ON CONFLICT (email) DO NOTHING;

COMMENT ON TABLE profiles IS 'Table des profils utilisateur - informations d''authentification et base uniquement';
COMMENT ON TABLE nutritionists IS 'Table des nutritionnistes - profils complets avec informations professionnelles';
COMMENT ON TABLE patients IS 'Table des patients - profils complets avec informations médicales/nutritionnelles';

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
