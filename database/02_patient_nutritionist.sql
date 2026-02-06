-- ============================================================================
-- NutriSensia Database Schema
-- Script 02: Profils Patients et Nutritionnistes
-- ============================================================================
-- Dépendances: 01_extensions_and_types.sql
-- User Stories: AUTH-001, AUTH-002, AUTH-004, PROF-001
-- ============================================================================

-- ===========================================
-- TABLE: profiles
-- Table principale des profils utilisateurs
-- Liée à auth.users de Supabase
-- ===========================================

-- Créer la table si elle n'existe pas
CREATE TABLE IF NOT EXISTS profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Ajouter les colonnes si elles n'existent pas (pour les tables existantes)
DO $$
BEGIN
    -- Colonne role
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role user_role NOT NULL DEFAULT 'patient';
    END IF;

    -- Colonne email
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email') THEN
        ALTER TABLE profiles ADD COLUMN email varchar(255);
    END IF;

    -- Colonne first_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'first_name') THEN
        ALTER TABLE profiles ADD COLUMN first_name varchar(100);
    END IF;

    -- Colonne last_name
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_name') THEN
        ALTER TABLE profiles ADD COLUMN last_name varchar(100);
    END IF;

    -- Colonne avatar_url
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url text;
    END IF;

    -- Colonne locale
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'locale') THEN
        ALTER TABLE profiles ADD COLUMN locale varchar(10) DEFAULT 'fr';
    END IF;

    -- Colonne is_active
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'is_active') THEN
        ALTER TABLE profiles ADD COLUMN is_active boolean DEFAULT true;
    END IF;

    -- Colonne email_verified
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_verified') THEN
        ALTER TABLE profiles ADD COLUMN email_verified boolean DEFAULT false;
    END IF;

    -- Colonne email_verified_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'email_verified_at') THEN
        ALTER TABLE profiles ADD COLUMN email_verified_at timestamptz;
    END IF;

    -- Colonne last_sign_in_at
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_sign_in_at') THEN
        ALTER TABLE profiles ADD COLUMN last_sign_in_at timestamptz;
    END IF;
END $$;

-- Index
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_active ON profiles(is_active) WHERE is_active = true;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS trigger_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Commentaires
COMMENT ON TABLE profiles IS 'Table principale des profils utilisateurs, liée à auth.users';
COMMENT ON COLUMN profiles.role IS 'Rôle de l''utilisateur: patient, nutritionist, ou admin';

-- ===========================================
-- FONCTION: Création automatique du profil
-- Appelée via trigger après inscription
-- ===========================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            (NEW.raw_user_meta_data->>'role')::user_role,
            'patient'
        )
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement le profil à l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ===========================================
-- ROW LEVEL SECURITY pour profiles
-- ===========================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes avant de les recréer
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;

-- Tout le monde peut voir les profils de base (nécessaire pour les RLS des autres tables)
CREATE POLICY "Profiles are viewable by authenticated users"
    ON profiles FOR SELECT
    USING (auth.role() = 'authenticated');

-- Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (id = auth.uid());

-- Les admins peuvent tout faire
CREATE POLICY "Admins have full access to profiles"
    ON profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- ===========================================
-- TABLE: nutritionist_profiles
-- Extension du profil pour les nutritionnistes
-- ===========================================

CREATE TABLE IF NOT EXISTS nutritionist_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Informations professionnelles
    title varchar(100),                          -- Ex: "Diététicienne-Nutritionniste"
    specializations text[],                      -- Ex: ['perte de poids', 'sport', 'diabète']
    certifications text[],                       -- Ex: ['ASCA', 'RME']
    bio text,                                    -- Biographie affichée aux patients

    -- Coordonnées cabinet
    cabinet_name varchar(200),
    cabinet_address_line1 varchar(200),
    cabinet_address_line2 varchar(200),
    cabinet_city varchar(100),
    cabinet_postal_code varchar(20),
    cabinet_country varchar(100) DEFAULT 'Suisse',
    cabinet_phone varchar(50),

    -- Configuration consultation
    consultation_duration_initial int DEFAULT 60,    -- minutes
    consultation_duration_followup int DEFAULT 30,   -- minutes
    consultation_duration_indepth int DEFAULT 45,    -- minutes
    consultation_duration_emergency int DEFAULT 20,  -- minutes

    -- Tarifs (en CHF)
    price_initial decimal(10,2),
    price_followup decimal(10,2),
    price_indepth decimal(10,2),
    price_emergency decimal(10,2),

    -- Visio
    visio_enabled boolean DEFAULT true,
    visio_platform varchar(100) DEFAULT 'Jitsi',     -- ou 'Zoom', 'Teams', etc.
    visio_link_template text,                        -- Template du lien visio

    -- Disponibilité
    timezone varchar(50) DEFAULT 'Europe/Zurich',
    accepts_new_patients boolean DEFAULT true,
    max_patients int DEFAULT 50,

    -- Statut
    is_active boolean DEFAULT true,
    verified_at timestamptz,

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_nutritionist_profiles_user_id ON nutritionist_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_nutritionist_profiles_is_active ON nutritionist_profiles(is_active);

-- Commentaires
COMMENT ON TABLE nutritionist_profiles IS 'Profils étendus des nutritionnistes avec informations professionnelles et tarifs';
COMMENT ON COLUMN nutritionist_profiles.specializations IS 'Liste des spécialisations (perte de poids, sport, etc.)';
COMMENT ON COLUMN nutritionist_profiles.certifications IS 'Certifications professionnelles (ASCA, RME, etc.)';

-- ===========================================
-- TABLE: patient_profiles
-- Extension du profil pour les patients
-- ===========================================

CREATE TABLE IF NOT EXISTS patient_profiles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Relation avec nutritionniste
    nutritionist_id uuid REFERENCES nutritionist_profiles(id) ON DELETE SET NULL,
    assigned_at timestamptz,

    -- Informations personnelles
    first_name varchar(100),
    last_name varchar(100),
    date_of_birth date,
    gender gender,
    phone varchar(50),

    -- Adresse
    address_line1 varchar(200),
    address_line2 varchar(200),
    city varchar(100),
    postal_code varchar(20),
    country varchar(100) DEFAULT 'Suisse',

    -- Données physiques initiales
    initial_weight decimal(5,2),                -- kg
    initial_height decimal(5,2),                -- cm
    initial_bmi decimal(4,2),                   -- calculé

    -- Objectifs et contexte (AUTH-004)
    consultation_reason text,                    -- Raison principale de consultation
    consultation_reason_details text,            -- Détails supplémentaires
    health_goals text[],                         -- Objectifs de santé
    dietary_restrictions text[],                 -- Restrictions alimentaires
    allergies text[],                            -- Allergies
    medical_conditions text[],                   -- Conditions médicales
    medications text[],                          -- Médicaments actuels
    activity_level varchar(50),                  -- sédentaire, modéré, actif, très actif

    -- Préférences alimentaires
    food_preferences jsonb DEFAULT '{}',         -- préférences diverses
    disliked_foods text[],                       -- aliments n'aimant pas

    -- Onboarding
    onboarding_completed boolean DEFAULT false,
    onboarding_completed_at timestamptz,
    onboarding_step int DEFAULT 0,              -- étape actuelle si non complété
    tutorial_completed boolean DEFAULT false,
    tutorial_completed_at timestamptz,

    -- Statut
    status patient_status DEFAULT 'pending',
    status_changed_at timestamptz DEFAULT now(),
    status_reason text,                          -- raison du changement de statut

    -- Consentements RGPD
    consent_data_processing boolean DEFAULT false,
    consent_data_processing_at timestamptz,
    consent_marketing boolean DEFAULT false,
    consent_marketing_at timestamptz,
    consent_sharing_nutritionist boolean DEFAULT true,
    consent_sharing_nutritionist_at timestamptz,

    -- Métadonnées
    source varchar(100),                         -- comment le patient a trouvé NutriSensia
    referral_code varchar(50),                   -- code de parrainage utilisé
    notes_internal text,                         -- notes internes (visible nutritionniste)

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_patient_profiles_user_id ON patient_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_nutritionist_id ON patient_profiles(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_status ON patient_profiles(status);
CREATE INDEX IF NOT EXISTS idx_patient_profiles_onboarding ON patient_profiles(onboarding_completed);

-- Commentaires
COMMENT ON TABLE patient_profiles IS 'Profils étendus des patients avec données de santé et onboarding';
COMMENT ON COLUMN patient_profiles.consultation_reason IS 'Raison principale de consultation (AUTH-004)';
COMMENT ON COLUMN patient_profiles.onboarding_step IS 'Étape actuelle de l''onboarding (0 = non commencé)';

-- ===========================================
-- TABLE: patient_nutritionist_history
-- Historique des relations patient-nutritionniste
-- ===========================================

CREATE TABLE IF NOT EXISTS patient_nutritionist_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    nutritionist_id uuid NOT NULL REFERENCES nutritionist_profiles(id) ON DELETE CASCADE,

    -- Période
    started_at timestamptz NOT NULL DEFAULT now(),
    ended_at timestamptz,

    -- Raison de fin
    end_reason text,

    -- Audit
    created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_pnh_patient_id ON patient_nutritionist_history(patient_id);
CREATE INDEX IF NOT EXISTS idx_pnh_nutritionist_id ON patient_nutritionist_history(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_pnh_dates ON patient_nutritionist_history(started_at, ended_at);

COMMENT ON TABLE patient_nutritionist_history IS 'Historique des relations patient-nutritionniste pour traçabilité';

-- ===========================================
-- FONCTIONS
-- ===========================================

-- Fonction pour calculer le BMI
CREATE OR REPLACE FUNCTION calculate_bmi(weight_kg decimal, height_cm decimal)
RETURNS decimal AS $$
BEGIN
    IF height_cm IS NULL OR height_cm = 0 OR weight_kg IS NULL THEN
        RETURN NULL;
    END IF;
    RETURN ROUND(weight_kg / ((height_cm / 100) ^ 2), 2);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Fonction pour mettre à jour le BMI initial
CREATE OR REPLACE FUNCTION update_initial_bmi()
RETURNS TRIGGER AS $$
BEGIN
    NEW.initial_bmi := calculate_bmi(NEW.initial_weight, NEW.initial_height);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement le BMI initial
DROP TRIGGER IF EXISTS trigger_update_initial_bmi ON patient_profiles;
CREATE TRIGGER trigger_update_initial_bmi
    BEFORE INSERT OR UPDATE OF initial_weight, initial_height
    ON patient_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_initial_bmi();

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers updated_at
DROP TRIGGER IF EXISTS trigger_nutritionist_profiles_updated_at ON nutritionist_profiles;
CREATE TRIGGER trigger_nutritionist_profiles_updated_at
    BEFORE UPDATE ON nutritionist_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_patient_profiles_updated_at ON patient_profiles;
CREATE TRIGGER trigger_patient_profiles_updated_at
    BEFORE UPDATE ON patient_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour logger le changement de nutritionniste
CREATE OR REPLACE FUNCTION log_nutritionist_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Si le nutritionniste change
    IF OLD.nutritionist_id IS DISTINCT FROM NEW.nutritionist_id THEN
        -- Fermer l'ancienne relation si elle existe
        IF OLD.nutritionist_id IS NOT NULL THEN
            UPDATE patient_nutritionist_history
            SET ended_at = now(),
                end_reason = 'Changement de nutritionniste'
            WHERE patient_id = NEW.id
              AND nutritionist_id = OLD.nutritionist_id
              AND ended_at IS NULL;
        END IF;

        -- Créer la nouvelle relation si un nouveau nutritionniste est assigné
        IF NEW.nutritionist_id IS NOT NULL THEN
            INSERT INTO patient_nutritionist_history (patient_id, nutritionist_id, started_at)
            VALUES (NEW.id, NEW.nutritionist_id, now());

            NEW.assigned_at = now();
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour logger les changements de nutritionniste
DROP TRIGGER IF EXISTS trigger_log_nutritionist_change ON patient_profiles;
CREATE TRIGGER trigger_log_nutritionist_change
    BEFORE UPDATE OF nutritionist_id ON patient_profiles
    FOR EACH ROW
    EXECUTE FUNCTION log_nutritionist_change();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE nutritionist_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_nutritionist_history ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes
DROP POLICY IF EXISTS "Nutritionists can view own profile" ON nutritionist_profiles;
DROP POLICY IF EXISTS "Nutritionists can update own profile" ON nutritionist_profiles;
DROP POLICY IF EXISTS "Patients can view their nutritionist profile" ON nutritionist_profiles;
DROP POLICY IF EXISTS "Patients can view own profile" ON patient_profiles;
DROP POLICY IF EXISTS "Patients can update own profile" ON patient_profiles;
DROP POLICY IF EXISTS "Nutritionists can view their patients profiles" ON patient_profiles;
DROP POLICY IF EXISTS "Patients can view own history" ON patient_nutritionist_history;
DROP POLICY IF EXISTS "Nutritionists can view their patients history" ON patient_nutritionist_history;

-- Politiques pour nutritionist_profiles
CREATE POLICY "Nutritionists can view own profile"
    ON nutritionist_profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Nutritionists can update own profile"
    ON nutritionist_profiles FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Patients can view their nutritionist profile"
    ON nutritionist_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.nutritionist_id = nutritionist_profiles.id
              AND pp.user_id = auth.uid()
        )
    );

-- Politiques pour patient_profiles
CREATE POLICY "Patients can view own profile"
    ON patient_profiles FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Patients can update own profile"
    ON patient_profiles FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Nutritionists can view their patients profiles"
    ON patient_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = patient_profiles.nutritionist_id
              AND np.user_id = auth.uid()
        )
    );

-- Politiques pour patient_nutritionist_history
CREATE POLICY "Patients can view own history"
    ON patient_nutritionist_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = patient_nutritionist_history.patient_id
              AND pp.user_id = auth.uid()
        )
    );

CREATE POLICY "Nutritionists can view their patients history"
    ON patient_nutritionist_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = patient_nutritionist_history.nutritionist_id
              AND np.user_id = auth.uid()
        )
    );
