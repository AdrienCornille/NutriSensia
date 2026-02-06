-- ============================================================================
-- NutriSensia Database Schema
-- Script 03: Paramètres Utilisateur et Sessions
-- ============================================================================
-- Dépendances: 01_extensions_and_types.sql, 02_patient_nutritionist.sql
-- User Stories: PROF-005 à PROF-009, AUTH-002
-- ============================================================================

-- ===========================================
-- TABLE: user_settings
-- Préférences et paramètres utilisateur
-- ===========================================

CREATE TABLE IF NOT EXISTS user_settings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

    -- ===========================================
    -- Notifications Email (PROF-006)
    -- ===========================================
    email_appointments boolean DEFAULT true,         -- Rappels RDV
    email_messages boolean DEFAULT true,             -- Nouveaux messages
    email_reports boolean DEFAULT true,              -- Rapports hebdomadaires
    email_newsletter boolean DEFAULT false,          -- Newsletter

    -- ===========================================
    -- Notifications Push (PROF-007)
    -- ===========================================
    push_enabled boolean DEFAULT true,
    push_appointments boolean DEFAULT true,          -- Rappels RDV
    push_messages boolean DEFAULT true,              -- Nouveaux messages
    push_meal_reminders boolean DEFAULT true,        -- Rappels repas
    push_hydration_reminders boolean DEFAULT true,   -- Rappels hydratation
    push_weight_reminders boolean DEFAULT true,      -- Rappels pesée
    push_objectives boolean DEFAULT true,            -- Objectifs atteints

    -- Heures calmes (pas de push)
    quiet_hours_enabled boolean DEFAULT false,
    quiet_hours_start time DEFAULT '22:00',
    quiet_hours_end time DEFAULT '07:00',

    -- ===========================================
    -- Rappels quotidiens
    -- ===========================================
    -- Rappels repas
    meal_reminder_breakfast_enabled boolean DEFAULT false,
    meal_reminder_breakfast_time time DEFAULT '08:00',
    meal_reminder_lunch_enabled boolean DEFAULT false,
    meal_reminder_lunch_time time DEFAULT '12:00',
    meal_reminder_dinner_enabled boolean DEFAULT false,
    meal_reminder_dinner_time time DEFAULT '19:00',

    -- Rappels hydratation
    hydration_reminder_enabled boolean DEFAULT false,
    hydration_reminder_interval int DEFAULT 120,     -- minutes entre rappels
    hydration_reminder_start time DEFAULT '08:00',
    hydration_reminder_end time DEFAULT '21:00',

    -- Rappel pesée
    weight_reminder_enabled boolean DEFAULT false,
    weight_reminder_frequency varchar(20) DEFAULT 'weekly',  -- daily, weekly
    weight_reminder_day int DEFAULT 1,               -- jour de la semaine (1=lundi) si weekly
    weight_reminder_time time DEFAULT '07:30',

    -- ===========================================
    -- Préférences d'affichage (PROF-009)
    -- ===========================================
    language varchar(5) DEFAULT 'fr',                -- fr, en, de, it
    timezone varchar(50) DEFAULT 'Europe/Zurich',
    ui_theme ui_theme DEFAULT 'light',
    unit_system unit_system DEFAULT 'metric',
    first_day_of_week first_day_of_week DEFAULT 'monday',

    -- Objectifs nutritionnels personnalisés
    daily_calories_target int DEFAULT 2000,
    daily_protein_target int DEFAULT 60,             -- grammes
    daily_carbs_target int DEFAULT 250,              -- grammes
    daily_fat_target int DEFAULT 70,                 -- grammes
    daily_water_target decimal(3,1) DEFAULT 2.0,     -- litres

    -- ===========================================
    -- Préférences d'interface
    -- ===========================================
    dashboard_widgets jsonb DEFAULT '["nutrition", "hydration", "meals", "progress", "appointments", "messages"]',
    default_meal_view varchar(20) DEFAULT 'day',     -- day, week, list
    show_calories boolean DEFAULT true,
    show_macros boolean DEFAULT true,
    show_micros boolean DEFAULT false,

    -- ===========================================
    -- Vie privée
    -- ===========================================
    share_progress_nutritionist boolean DEFAULT true,
    share_weight_nutritionist boolean DEFAULT true,
    share_photos_nutritionist boolean DEFAULT true,

    -- ===========================================
    -- Appareils connectés (PROF-008)
    -- ===========================================
    connected_devices jsonb DEFAULT '[]',            -- Liste des appareils connectés
    -- Format: [{"type": "scale", "brand": "Withings", "connected_at": "...", "last_sync": "..."}]

    -- ===========================================
    -- Métadonnées
    -- ===========================================
    onboarding_settings_completed boolean DEFAULT false,
    last_notification_check timestamptz,

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

-- Commentaires
COMMENT ON TABLE user_settings IS 'Préférences et paramètres utilisateur (notifications, affichage, vie privée)';
COMMENT ON COLUMN user_settings.quiet_hours_enabled IS 'Active les heures calmes sans notifications push';
COMMENT ON COLUMN user_settings.connected_devices IS 'Liste JSON des appareils de santé connectés';

-- ===========================================
-- TABLE: user_sessions
-- Sessions actives pour gestion multi-appareils (PROF-005)
-- ===========================================

CREATE TABLE IF NOT EXISTS user_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Informations de session
    session_token varchar(255) NOT NULL,             -- Token unique de session
    refresh_token varchar(255),

    -- Appareil
    device_type varchar(50),                         -- mobile, tablet, desktop
    device_name varchar(200),                        -- Ex: "iPhone 15 Pro"
    device_os varchar(100),                          -- Ex: "iOS 17.2"
    browser varchar(100),                            -- Ex: "Safari 17"
    browser_version varchar(50),

    -- Localisation
    ip_address inet,
    country varchar(100),
    city varchar(100),
    approximate_location varchar(200),               -- Ex: "Zurich, Suisse"

    -- État
    is_current boolean DEFAULT false,                -- Session actuelle
    is_active boolean DEFAULT true,
    last_activity_at timestamptz DEFAULT now(),

    -- Sécurité
    login_method varchar(50) DEFAULT 'password',     -- password, google, magic_link
    two_factor_verified boolean DEFAULT false,

    -- Métadonnées
    user_agent text,
    fingerprint varchar(255),                        -- Device fingerprint optionnel

    -- Durée
    expires_at timestamptz,
    signed_out_at timestamptz,

    -- Audit
    created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_last_activity ON user_sessions(last_activity_at);

-- Commentaires
COMMENT ON TABLE user_sessions IS 'Sessions actives des utilisateurs pour gestion multi-appareils (PROF-005)';
COMMENT ON COLUMN user_sessions.is_current IS 'Indique si c''est la session actuelle de l''utilisateur';

-- ===========================================
-- TABLE: login_attempts
-- Historique des tentatives de connexion (AUTH-002)
-- ===========================================

CREATE TABLE IF NOT EXISTS login_attempts (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email varchar(255) NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,

    -- Résultat
    success boolean NOT NULL,
    failure_reason varchar(100),                     -- 'invalid_password', 'account_locked', etc.

    -- Contexte
    ip_address inet,
    user_agent text,
    country varchar(100),
    city varchar(100),

    -- Audit
    attempted_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_date ON login_attempts(attempted_at);

-- Index pour compter les tentatives récentes (anti-brute force)
CREATE INDEX IF NOT EXISTS idx_login_attempts_recent ON login_attempts(email, attempted_at)
    WHERE success = false;

-- Commentaires
COMMENT ON TABLE login_attempts IS 'Historique des tentatives de connexion pour sécurité et anti-brute force';

-- ===========================================
-- FONCTIONS
-- ===========================================

-- Fonction pour vérifier si un compte est bloqué (5 tentatives en 15 min)
CREATE OR REPLACE FUNCTION is_account_locked(check_email varchar)
RETURNS boolean AS $$
DECLARE
    failed_attempts int;
BEGIN
    SELECT COUNT(*)
    INTO failed_attempts
    FROM login_attempts
    WHERE email = check_email
      AND success = false
      AND attempted_at > now() - interval '15 minutes';

    RETURN failed_attempts >= 5;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le nombre de tentatives restantes
CREATE OR REPLACE FUNCTION get_remaining_attempts(check_email varchar)
RETURNS int AS $$
DECLARE
    failed_attempts int;
BEGIN
    SELECT COUNT(*)
    INTO failed_attempts
    FROM login_attempts
    WHERE email = check_email
      AND success = false
      AND attempted_at > now() - interval '15 minutes';

    RETURN GREATEST(0, 5 - failed_attempts);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer les paramètres par défaut d'un nouvel utilisateur
CREATE OR REPLACE FUNCTION create_default_user_settings()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_settings (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Ce trigger devrait être créé sur la table auth.users, mais cela nécessite
-- des privilèges spéciaux dans Supabase. Alternativement, créer les settings
-- lors de l'inscription dans le code applicatif.

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_user_settings_updated_at ON user_settings;
CREATE TRIGGER trigger_user_settings_updated_at
    BEFORE UPDATE ON user_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour idempotence
DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can view own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can delete own sessions" ON user_sessions;
DROP POLICY IF EXISTS "Users can view own login attempts" ON login_attempts;

-- Politiques pour user_settings
CREATE POLICY "Users can view own settings"
    ON user_settings FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can update own settings"
    ON user_settings FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert own settings"
    ON user_settings FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Politiques pour user_sessions
CREATE POLICY "Users can view own sessions"
    ON user_sessions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sessions"
    ON user_sessions FOR DELETE
    USING (user_id = auth.uid());

-- Politiques pour login_attempts
CREATE POLICY "Users can view own login attempts"
    ON login_attempts FOR SELECT
    USING (user_id = auth.uid());

-- ===========================================
-- DONNÉES INITIALES
-- ===========================================

-- Pas de données initiales nécessaires pour ces tables
-- Les settings sont créés à l'inscription de chaque utilisateur
