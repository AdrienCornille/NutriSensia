-- =====================================================
-- NutriSensia - Migration Adaptative du Schéma des Profils
-- S'adapte à la structure existante de la base de données
-- =====================================================

-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. DIAGNOSTIC DE LA STRUCTURE EXISTANTE
-- =====================================================

DO $$
DECLARE
    col_exists BOOLEAN;
    table_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔍 Diagnostic de la structure existante...';
    
    -- Vérifier si la table profiles existe
    SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'profiles'
    ) INTO table_exists;
    
    IF table_exists THEN
        RAISE NOTICE '✅ Table profiles existe';
        
        -- Vérifier les colonnes existantes
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'first_name'
        ) INTO col_exists;
        
        IF col_exists THEN
            RAISE NOTICE '✅ Colonne first_name existe';
        ELSE
            RAISE NOTICE '⚠️ Colonne first_name manquante - sera ajoutée';
        END IF;
        
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'last_name'
        ) INTO col_exists;
        
        IF col_exists THEN
            RAISE NOTICE '✅ Colonne last_name existe';
        ELSE
            RAISE NOTICE '⚠️ Colonne last_name manquante - sera ajoutée';
        END IF;
        
        SELECT EXISTS (
            SELECT FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'role'
        ) INTO col_exists;
        
        IF col_exists THEN
            RAISE NOTICE '✅ Colonne role existe';
        ELSE
            RAISE NOTICE '⚠️ Colonne role manquante - sera ajoutée';
        END IF;
        
    ELSE
        RAISE NOTICE '❌ Table profiles n''existe pas - sera créée';
    END IF;
END $$;

-- =====================================================
-- 2. CRÉATION/MISE À JOUR DE LA TABLE PROFILES
-- =====================================================

-- Créer la table profiles si elle n'existe pas
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

-- Ajouter les colonnes manquantes à profiles
DO $$
BEGIN
    -- Ajouter first_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE profiles ADD COLUMN first_name VARCHAR(100) NOT NULL DEFAULT '';
        RAISE NOTICE '✅ Colonne first_name ajoutée';
    END IF;
    
    -- Ajouter last_name si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE profiles ADD COLUMN last_name VARCHAR(100) NOT NULL DEFAULT '';
        RAISE NOTICE '✅ Colonne last_name ajoutée';
    END IF;
    
    -- Ajouter role si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT 'patient';
        RAISE NOTICE '✅ Colonne role ajoutée';
    END IF;
    
    -- Ajouter phone si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE profiles ADD COLUMN phone VARCHAR(20);
        RAISE NOTICE '✅ Colonne phone ajoutée';
    END IF;
    
    -- Ajouter avatar_url si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
        RAISE NOTICE '✅ Colonne avatar_url ajoutée';
    END IF;
    
    -- Ajouter locale si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'locale') THEN
        ALTER TABLE profiles ADD COLUMN locale VARCHAR(10) DEFAULT 'fr-CH';
        RAISE NOTICE '✅ Colonne locale ajoutée';
    END IF;
    
    -- Ajouter timezone si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'timezone') THEN
        ALTER TABLE profiles ADD COLUMN timezone VARCHAR(50) DEFAULT 'Europe/Zurich';
        RAISE NOTICE '✅ Colonne timezone ajoutée';
    END IF;
    
    -- Ajouter updated_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE '✅ Colonne updated_at ajoutée';
    END IF;
END $$;

-- =====================================================
-- 3. CRÉATION DES TABLES SPÉCIALISÉES
-- =====================================================

-- Table nutritionists
CREATE TABLE IF NOT EXISTS nutritionists (
    id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
    asca_number VARCHAR(50) UNIQUE,
    rme_number VARCHAR(50) UNIQUE,
    ean_code VARCHAR(50),
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

-- Table patients
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
    height INTEGER,
    initial_weight DECIMAL(5,2),
    target_weight DECIMAL(5,2),
    activity_level VARCHAR(20) CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
    allergies TEXT[],
    dietary_restrictions TEXT[],
    medical_conditions TEXT[],
    medications TEXT[],
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
-- 4. INDEX DE PERFORMANCE
-- =====================================================

-- Index pour profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- Index pour nutritionists
CREATE INDEX IF NOT EXISTS idx_nutritionists_asca_number ON nutritionists(asca_number);
CREATE INDEX IF NOT EXISTS idx_nutritionists_rme_number ON nutritionists(rme_number);
CREATE INDEX IF NOT EXISTS idx_nutritionists_verified ON nutritionists(verified);
CREATE INDEX IF NOT EXISTS idx_nutritionists_is_active ON nutritionists(is_active);

-- Index pour patients
CREATE INDEX IF NOT EXISTS idx_patients_nutritionist_id ON patients(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_patients_subscription_status ON patients(subscription_status);
CREATE INDEX IF NOT EXISTS idx_patients_subscription_tier ON patients(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_patients_date_of_birth ON patients(date_of_birth);

-- Index composites
CREATE INDEX IF NOT EXISTS idx_patients_nutritionist_status ON patients(nutritionist_id, subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_role_created ON profiles(role, created_at);

-- =====================================================
-- 5. FONCTIONS ET TRIGGERS
-- =====================================================

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Supprimer les triggers existants s'ils existent
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_nutritionists_updated_at ON nutritionists;
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;

-- Recréer les triggers
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

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- 6. ROW LEVEL SECURITY
-- =====================================================

-- Activation RLS sur toutes les tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritionists ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

DROP POLICY IF EXISTS "Nutritionists can view own profile" ON nutritionists;
DROP POLICY IF EXISTS "Nutritionists can update own profile" ON nutritionists;
DROP POLICY IF EXISTS "Patients can view assigned nutritionist" ON nutritionists;
DROP POLICY IF EXISTS "Admins can manage all nutritionists" ON nutritionists;

DROP POLICY IF EXISTS "Patients can view own profile" ON patients;
DROP POLICY IF EXISTS "Patients can update own profile" ON patients;
DROP POLICY IF EXISTS "Nutritionists can view assigned patients" ON patients;
DROP POLICY IF EXISTS "Nutritionists can update assigned patients" ON patients;
DROP POLICY IF EXISTS "Admins can manage all patients" ON patients;

-- Recréer les politiques
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
-- 7. VUES UTILITAIRES (ADAPTATIVES)
-- =====================================================

-- Vue pour les profils complets des nutritionnistes
CREATE OR REPLACE VIEW nutritionist_profiles AS
SELECT 
    p.id,
    p.email,
    COALESCE(p.first_name, '') as first_name,
    COALESCE(p.last_name, '') as last_name,
    p.phone,
    p.avatar_url,
    COALESCE(p.locale, 'fr-CH') as locale,
    COALESCE(p.timezone, 'Europe/Zurich') as timezone,
    p.created_at,
    COALESCE(p.updated_at, p.created_at) as updated_at,
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
    COALESCE(p.first_name, '') as first_name,
    COALESCE(p.last_name, '') as last_name,
    p.phone,
    p.avatar_url,
    COALESCE(p.locale, 'fr-CH') as locale,
    COALESCE(p.timezone, 'Europe/Zurich') as timezone,
    p.created_at,
    COALESCE(p.updated_at, p.created_at) as updated_at,
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
-- 8. FONCTIONS UTILITAIRES
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
-- 9. RAPPORT FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '🎉 MIGRATION ADAPTATIVE TERMINÉE AVEC SUCCÈS';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Structure de base de données adaptée';
    RAISE NOTICE '✅ Colonnes manquantes ajoutées';
    RAISE NOTICE '✅ Index de performance en place';
    RAISE NOTICE '✅ Triggers et fonctions opérationnels';
    RAISE NOTICE '✅ Sécurité RLS configurée';
    RAISE NOTICE '✅ Vues utilitaires fonctionnelles';
    RAISE NOTICE '';
    RAISE NOTICE '📋 Prochaines étapes:';
    RAISE NOTICE '   - Exécuter les tests de validation';
    RAISE NOTICE '   - Vérifier les politiques RLS';
    RAISE NOTICE '   - Tester les fonctions utilitaires';
    RAISE NOTICE '';
END $$;
