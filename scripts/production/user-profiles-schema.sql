-- =====================================================
-- NutriSensia - Schéma de Base de Données des Profils Utilisateur
-- Tâche 4.1: Design Database Schema for User Profiles
-- =====================================================

-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. TABLE PROFILES - Extension du système auth.users
-- =====================================================

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('nutritionist', 'patient', 'admin')),
    phone VARCHAR(20),
    avatar_url TEXT,
    locale VARCHAR(10) DEFAULT 'fr-CH',
    timezone VARCHAR(50) DEFAULT 'Europe/Zurich',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. TABLE NUTRITIONISTS - Profils professionnels
-- =====================================================

CREATE TABLE IF NOT EXISTS nutritionists (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    asca_number VARCHAR(50) UNIQUE,
    rme_number VARCHAR(50) UNIQUE,
    ean_code VARCHAR(50), -- Code EAN pour facturation
    specializations TEXT[],
    bio TEXT,
    consultation_rates JSONB DEFAULT '{
        "initial": 22500,
        "follow_up": 15000,
        "express": 7500
    }',
    practice_address JSONB DEFAULT '{
        "street": "",
        "postal_code": "",
        "city": "",
        "canton": "",
        "country": "CH"
    }',
    verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    max_patients INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. TABLE PATIENTS - Profils patients avec informations médicales
-- =====================================================

CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    nutritionist_id UUID REFERENCES nutritionists(id) ON DELETE SET NULL,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    emergency_contact JSONB DEFAULT '{
        "name": "",
        "phone": "",
        "relationship": ""
    }',
    
    -- Informations médicales
    height INTEGER, -- en cm
    initial_weight DECIMAL(5,2), -- en kg
    target_weight DECIMAL(5,2),
    activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    allergies TEXT[],
    dietary_restrictions TEXT[],
    medical_conditions TEXT[],
    medications TEXT[],
    
    -- Abonnement
    subscription_tier INTEGER CHECK (subscription_tier BETWEEN 1 AND 4),
    subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'suspended', 'expired')),
    subscription_start_date DATE,
    subscription_end_date DATE,
    package_credits JSONB DEFAULT '{
        "consultations_remaining": 0,
        "meal_plans_remaining": 0,
        "support_priority": "standard"
    }',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEX DE PERFORMANCE
-- =====================================================

-- Index critiques pour les profils
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Index pour les nutritionnistes
CREATE INDEX IF NOT EXISTS idx_nutritionists_asca_number ON nutritionists(asca_number);
CREATE INDEX IF NOT EXISTS idx_nutritionists_rme_number ON nutritionists(rme_number);
CREATE INDEX IF NOT EXISTS idx_nutritionists_verified ON nutritionists(verified);
CREATE INDEX IF NOT EXISTS idx_nutritionists_is_active ON nutritionists(is_active);

-- Index pour les patients
CREATE INDEX IF NOT EXISTS idx_patients_nutritionist_id ON patients(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_patients_subscription_status ON patients(subscription_status);
CREATE INDEX IF NOT EXISTS idx_patients_subscription_tier ON patients(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_patients_date_of_birth ON patients(date_of_birth);

-- Index composites pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_patients_nutritionist_status ON patients(nutritionist_id, subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_created ON profiles(role, created_at);

-- =====================================================
-- TRIGGERS ET FONCTIONS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON profiles 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutritionists_updated_at 
    BEFORE UPDATE ON nutritionists 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patients_updated_at 
    BEFORE UPDATE ON patients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, first_name, last_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'role', 'patient')
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour créer automatiquement un profil
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Activation RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionists ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Politiques pour profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour nutritionists
CREATE POLICY "Nutritionists can view own profile" ON nutritionists
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Nutritionists can update own profile" ON nutritionists
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Patients can view assigned nutritionist" ON nutritionists
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM patients 
            WHERE nutritionist_id = nutritionists.id AND id = auth.uid()
        )
    );

CREATE POLICY "Admins can manage all nutritionists" ON nutritionists
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Politiques pour patients
CREATE POLICY "Patients can view own profile" ON patients
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Patients can update own profile" ON patients
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Nutritionists can view assigned patients" ON patients
    FOR SELECT USING (
        nutritionist_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Nutritionists can update assigned patients" ON patients
    FOR UPDATE USING (
        nutritionist_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can manage all patients" ON patients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- =====================================================
-- VUES UTILES
-- =====================================================

-- Vue pour les profils complets des nutritionnistes
CREATE OR REPLACE VIEW nutritionist_profiles AS
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.phone,
    p.avatar_url,
    p.locale,
    p.timezone,
    p.created_at,
    p.updated_at,
    n.asca_number,
    n.rme_number,
    n.ean_code,
    n.specializations,
    n.bio,
    n.consultation_rates,
    n.practice_address,
    n.verified,
    n.is_active,
    n.max_patients
FROM profiles p
JOIN nutritionists n ON p.id = n.id
WHERE p.role = 'nutritionist';

-- Vue pour les profils complets des patients
CREATE OR REPLACE VIEW patient_profiles AS
SELECT 
    p.id,
    p.email,
    p.first_name,
    p.last_name,
    p.phone,
    p.avatar_url,
    p.locale,
    p.timezone,
    p.created_at,
    p.updated_at,
    pat.nutritionist_id,
    pat.date_of_birth,
    pat.gender,
    pat.emergency_contact,
    pat.height,
    pat.initial_weight,
    pat.target_weight,
    pat.activity_level,
    pat.allergies,
    pat.dietary_restrictions,
    pat.medical_conditions,
    pat.medications,
    pat.subscription_tier,
    pat.subscription_status,
    pat.subscription_start_date,
    pat.subscription_end_date,
    pat.package_credits
FROM profiles p
JOIN patients pat ON p.id = pat.id
WHERE p.role = 'patient';

-- =====================================================
-- FONCTIONS UTILITAIRES
-- =====================================================

-- Fonction pour obtenir le profil complet d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_profile(user_id UUID)
RETURNS JSON AS $$
DECLARE
    user_role VARCHAR;
    profile_data JSON;
BEGIN
    -- Récupérer le rôle de l'utilisateur
    SELECT role INTO user_role FROM profiles WHERE id = user_id;
    
    IF user_role = 'nutritionist' THEN
        SELECT json_build_object(
            'profile', row_to_json(p),
            'nutritionist', row_to_json(n)
        ) INTO profile_data
        FROM profiles p
        JOIN nutritionists n ON p.id = n.id
        WHERE p.id = user_id;
    ELSIF user_role = 'patient' THEN
        SELECT json_build_object(
            'profile', row_to_json(p),
            'patient', row_to_json(pat)
        ) INTO profile_data
        FROM profiles p
        JOIN patients pat ON p.id = pat.id
        WHERE p.id = user_id;
    ELSE
        SELECT row_to_json(p) INTO profile_data
        FROM profiles p
        WHERE p.id = user_id;
    END IF;
    
    RETURN profile_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour calculer l'âge d'un patient
CREATE OR REPLACE FUNCTION calculate_age(birth_date DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN EXTRACT(YEAR FROM AGE(birth_date));
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE profiles IS 'Table principale des profils utilisateur, extension de auth.users';
COMMENT ON TABLE nutritionists IS 'Profils professionnels des nutritionnistes avec informations ASCA/RME';
COMMENT ON TABLE patients IS 'Profils patients avec informations médicales et abonnements';

COMMENT ON COLUMN nutritionists.consultation_rates IS 'Tarifs de consultation en centimes CHF';
COMMENT ON COLUMN nutritionists.practice_address IS 'Adresse du cabinet au format JSON';
COMMENT ON COLUMN patients.package_credits IS 'Crédits restants selon le package d''abonnement';
COMMENT ON COLUMN patients.emergency_contact IS 'Contact d''urgence au format JSON';

-- =====================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =====================================================

-- Insertion d'un admin de test (à supprimer en production)
-- INSERT INTO profiles (id, email, first_name, last_name, role) 
-- VALUES (uuid_generate_v4(), 'admin@nutrisensia.ch', 'Admin', 'System', 'admin');

-- =====================================================
-- FIN DU SCRIPT
-- =====================================================
