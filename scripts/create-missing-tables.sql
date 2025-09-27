-- =====================================================
-- Script de Création - Tables Nutritionists et Patients
-- =====================================================

-- Étape 1: Créer la table nutritionists si elle n'existe pas
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

-- Étape 2: Créer la table patients si elle n'existe pas
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

-- Étape 3: Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_nutritionists_asca_number ON nutritionists(asca_number);
CREATE INDEX IF NOT EXISTS idx_nutritionists_rme_number ON nutritionists(rme_number);
CREATE INDEX IF NOT EXISTS idx_nutritionists_verified ON nutritionists(verified);
CREATE INDEX IF NOT EXISTS idx_nutritionists_is_active ON nutritionists(is_active);

CREATE INDEX IF NOT EXISTS idx_patients_nutritionist_id ON patients(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_patients_subscription_status ON patients(subscription_status);
CREATE INDEX IF NOT EXISTS idx_patients_date_of_birth ON patients(date_of_birth);

-- Étape 4: Créer les triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer les triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_nutritionists_updated_at ON nutritionists;
CREATE TRIGGER update_nutritionists_updated_at
    BEFORE UPDATE ON nutritionists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON patients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Étape 5: Vérifier la création
DO $$
BEGIN
    RAISE NOTICE '🎉 Tables nutritionists et patients créées avec succès !';
    
    -- Vérifier nutritionists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nutritionists') THEN
        RAISE NOTICE '✅ Table nutritionists existe';
    ELSE
        RAISE NOTICE '❌ Table nutritionists n''existe pas';
    END IF;
    
    -- Vérifier patients
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
        RAISE NOTICE '✅ Table patients existe';
    ELSE
        RAISE NOTICE '❌ Table patients n''existe pas';
    END IF;
END $$;
