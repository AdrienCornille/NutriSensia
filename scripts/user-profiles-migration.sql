-- =====================================================
-- NutriSensia - Migration Sécurisée du Schéma des Profils
-- Gestion des conflits avec les éléments existants
-- =====================================================

-- Activation des extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. CRÉATION DES TABLES (AVEC GESTION DES CONFLITS)
-- =====================================================

-- Table profiles
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
-- 2. AJOUT DE COLONNES MANQUANTES (SI NÉCESSAIRE)
-- =====================================================

-- Ajouter des colonnes manquantes à profiles si elles n'existent pas
DO $$
BEGIN
    -- Ajouter locale si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'locale') THEN
        ALTER TABLE profiles ADD COLUMN locale VARCHAR(10) DEFAULT 'fr-CH';
    END IF;
    
    -- Ajouter timezone si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'timezone') THEN
        ALTER TABLE profiles ADD COLUMN timezone VARCHAR(50) DEFAULT 'Europe/Zurich';
    END IF;
    
    -- Ajouter updated_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Ajouter des colonnes manquantes à nutritionists si elles n'existent pas
DO $$
BEGIN
    -- Ajouter consultation_rates si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nutritionists' AND column_name = 'consultation_rates') THEN
        ALTER TABLE nutritionists ADD COLUMN consultation_rates JSONB DEFAULT '{"initial": 22500, "follow_up": 15000, "express": 7500}';
    END IF;
    
    -- Ajouter practice_address si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nutritionists' AND column_name = 'practice_address') THEN
        ALTER TABLE nutritionists ADD COLUMN practice_address JSONB DEFAULT '{"street": "", "postal_code": "", "city": "", "canton": "", "country": "CH"}';
    END IF;
    
    -- Ajouter updated_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'nutritionists' AND column_name = 'updated_at') THEN
        ALTER TABLE nutritionists ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- Ajouter des colonnes manquantes à patients si elles n'existent pas
DO $$
BEGIN
    -- Ajouter emergency_contact si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'emergency_contact') THEN
        ALTER TABLE patients ADD COLUMN emergency_contact JSONB DEFAULT '{"name": "", "phone": "", "relationship": ""}';
    END IF;
    
    -- Ajouter package_credits si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'package_credits') THEN
        ALTER TABLE patients ADD COLUMN package_credits JSONB DEFAULT '{"consultations_remaining": 0, "meal_plans_remaining": 0, "support_priority": "standard"}';
    END IF;
    
    -- Ajouter updated_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'updated_at') THEN
        ALTER TABLE patients ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
    END IF;
END $$;

-- =====================================================
-- 3. INDEX DE PERFORMANCE (AVEC GESTION DES CONFLITS)
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
-- 4. FONCTIONS ET TRIGGERS (AVEC GESTION DES CONFLITS)
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
-- 5. ROW LEVEL SECURITY (AVEC GESTION DES CONFLITS)
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
-- 6. VUES UTILITAIRES (AVEC GESTION DES CONFLITS)
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
-- 7. FONCTIONS UTILITAIRES (AVEC GESTION DES CONFLITS)
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
-- 8. COMMENTAIRES ET DOCUMENTATION
-- =====================================================

COMMENT ON TABLE profiles IS 'Table principale des profils utilisateur, extension de auth.users';
COMMENT ON TABLE nutritionists IS 'Profils professionnels des nutritionnistes avec informations ASCA/RME';
COMMENT ON TABLE patients IS 'Profils patients avec informations médicales et abonnements';

COMMENT ON COLUMN nutritionists.consultation_rates IS 'Tarifs de consultation en centimes CHF';
COMMENT ON COLUMN nutritionists.practice_address IS 'Adresse du cabinet au format JSON';
COMMENT ON COLUMN patients.package_credits IS 'Crédits restants selon le package d''abonnement';
COMMENT ON COLUMN patients.emergency_contact IS 'Contact d''urgence au format JSON';

-- =====================================================
-- 9. RAPPORT DE MIGRATION
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '🎉 MIGRATION DU SCHÉMA DES PROFILS TERMINÉE';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Tables créées/mises à jour avec succès';
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
