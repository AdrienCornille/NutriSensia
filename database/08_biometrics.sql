-- ============================================================================
-- NutriSensia Database Schema - 08 Biometrics
-- ============================================================================
-- Phase 6: Suivi Biométrique
-- Dépendances: 01_extensions_and_types.sql, 02_patient_nutritionist.sql
-- User Stories: BIO-001 à BIO-009, DASH-002, DASH-004
-- ============================================================================

-- ============================================================================
-- TABLE: weight_entries
-- Description: Entrées de poids des utilisateurs
-- User Story: BIO-001
-- ============================================================================

CREATE TABLE IF NOT EXISTS weight_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Données
    weight_kg DECIMAL(5, 2) NOT NULL CHECK (weight_kg > 0 AND weight_kg < 500),
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Notes optionnelles
    notes TEXT,

    -- Source de la mesure
    source VARCHAR(30) DEFAULT 'manual', -- 'manual', 'smart_scale', 'import'

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Une seule entrée par jour par utilisateur
    UNIQUE(user_id, date)
);

-- Trigger pour updated_at
CREATE TRIGGER weight_entries_updated_at
    BEFORE UPDATE ON weight_entries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_weight_entries_user ON weight_entries(user_id);
CREATE INDEX idx_weight_entries_date ON weight_entries(user_id, date DESC);

-- ============================================================================
-- TABLE: weight_goals
-- Description: Objectifs de poids
-- ============================================================================

CREATE TABLE IF NOT EXISTS weight_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Objectifs
    initial_weight_kg DECIMAL(5, 2) NOT NULL,
    target_weight_kg DECIMAL(5, 2) NOT NULL,
    target_date DATE,

    -- Progression
    is_achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER weight_goals_updated_at
    BEFORE UPDATE ON weight_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_weight_goals_user ON weight_goals(user_id);

-- ============================================================================
-- TABLE: measurements
-- Description: Mensurations corporelles
-- User Story: BIO-002
-- ============================================================================

CREATE TABLE IF NOT EXISTS measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Type de mesure
    measurement_type measurement_type NOT NULL,

    -- Valeur
    value_cm DECIMAL(5, 1) NOT NULL CHECK (value_cm > 0 AND value_cm < 500),
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Notes optionnelles
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Une seule entrée par type par jour par utilisateur
    UNIQUE(user_id, measurement_type, date)
);

-- Trigger pour updated_at
CREATE TRIGGER measurements_updated_at
    BEFORE UPDATE ON measurements
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_measurements_user ON measurements(user_id);
CREATE INDEX idx_measurements_type ON measurements(user_id, measurement_type, date DESC);
CREATE INDEX idx_measurements_date ON measurements(date DESC);

-- ============================================================================
-- TABLE: wellbeing_logs
-- Description: Logs de bien-être quotidien
-- User Story: BIO-003
-- ============================================================================

CREATE TABLE IF NOT EXISTS wellbeing_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Date
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Niveaux (1-10)
    energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 10),

    -- Humeur
    mood mood,

    -- Digestion
    digestion digestion_quality,

    -- Symptômes additionnels
    symptoms TEXT[],

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Une seule entrée par jour par utilisateur
    UNIQUE(user_id, date)
);

-- Trigger pour updated_at
CREATE TRIGGER wellbeing_logs_updated_at
    BEFORE UPDATE ON wellbeing_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_wellbeing_logs_user ON wellbeing_logs(user_id);
CREATE INDEX idx_wellbeing_logs_date ON wellbeing_logs(user_id, date DESC);
CREATE INDEX idx_wellbeing_logs_mood ON wellbeing_logs(mood);

-- ============================================================================
-- TABLE: activity_types
-- Description: Types d'activités physiques
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    slug VARCHAR(50) NOT NULL UNIQUE,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),

    -- Valeur MET (Metabolic Equivalent of Task)
    met_value DECIMAL(4, 2) NOT NULL DEFAULT 4.0,

    -- Affichage
    emoji VARCHAR(10),
    icon VARCHAR(50),
    bg_color VARCHAR(30),
    text_color VARCHAR(30),

    -- Est-ce un type système ou personnalisé
    is_system BOOLEAN DEFAULT true,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_activity_types_slug ON activity_types(slug);
CREATE INDEX idx_activity_types_active ON activity_types(is_active) WHERE is_active = true;

-- Données initiales
INSERT INTO activity_types (slug, name_fr, name_en, met_value, emoji, bg_color, text_color) VALUES
    ('running', 'Course', 'Running', 9.8, '🏃', 'bg-orange-50', 'text-orange-600'),
    ('cycling', 'Vélo', 'Cycling', 7.5, '🚴', 'bg-blue-50', 'text-blue-600'),
    ('gym', 'Musculation', 'Gym', 6.0, '🏋️', 'bg-purple-50', 'text-purple-600'),
    ('swimming', 'Natation', 'Swimming', 8.0, '🏊', 'bg-cyan-50', 'text-cyan-600'),
    ('yoga', 'Yoga', 'Yoga', 3.0, '🧘', 'bg-pink-50', 'text-pink-600'),
    ('walking', 'Marche', 'Walking', 3.5, '🚶', 'bg-green-50', 'text-green-600'),
    ('hiking', 'Randonnée', 'Hiking', 6.0, '🥾', 'bg-amber-50', 'text-amber-600'),
    ('dance', 'Danse', 'Dance', 5.0, '💃', 'bg-rose-50', 'text-rose-600'),
    ('tennis', 'Tennis', 'Tennis', 7.0, '🎾', 'bg-lime-50', 'text-lime-600'),
    ('climbing', 'Escalade', 'Climbing', 8.0, '🧗', 'bg-stone-50', 'text-stone-600'),
    ('other', 'Autre', 'Other', 4.0, '✨', 'bg-gray-50', 'text-gray-600')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- TABLE: activities
-- Description: Activités physiques enregistrées
-- User Story: BIO-004
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Type d'activité
    activity_type_id UUID NOT NULL REFERENCES activity_types(id) ON DELETE RESTRICT,

    -- Date et heure
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME,
    end_time TIME,

    -- Durée (en minutes)
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 720),

    -- Intensité
    intensity activity_intensity NOT NULL DEFAULT 'moderate',

    -- Calories brûlées (calculées ou manuelles)
    calories_burned INTEGER,
    is_calories_manual BOOLEAN DEFAULT false,

    -- Données additionnelles
    distance_km DECIMAL(6, 2),
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,

    -- Notes
    notes TEXT,

    -- Source
    source VARCHAR(30) DEFAULT 'manual', -- 'manual', 'watch', 'app'

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER activities_updated_at
    BEFORE UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_activities_user ON activities(user_id);
CREATE INDEX idx_activities_date ON activities(user_id, date DESC);
CREATE INDEX idx_activities_type ON activities(activity_type_id);
-- Note: Index partiel avec CURRENT_DATE non supporté (fonction non IMMUTABLE)
-- Les requêtes pour la semaine utiliseront idx_activities_date
CREATE INDEX IF NOT EXISTS idx_activities_recent ON activities(user_id, date DESC);

-- ============================================================================
-- TABLE: activity_goals
-- Description: Objectifs d'activité hebdomadaires
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Objectifs
    sessions_per_week INTEGER DEFAULT 3 CHECK (sessions_per_week >= 0 AND sessions_per_week <= 14),
    minutes_per_week INTEGER DEFAULT 150 CHECK (minutes_per_week >= 0),
    calories_per_week INTEGER CHECK (calories_per_week >= 0),

    -- Période de validité
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER activity_goals_updated_at
    BEFORE UPDATE ON activity_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_activity_goals_user ON activity_goals(user_id);
CREATE INDEX idx_activity_goals_current ON activity_goals(user_id, valid_from, valid_until);

-- ============================================================================
-- TABLE: hydration_logs
-- Description: Logs d'hydratation quotidienne
-- User Story: BIO-005
-- ============================================================================

CREATE TABLE IF NOT EXISTS hydration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Date
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Quantité (en ml)
    amount_ml INTEGER NOT NULL CHECK (amount_ml >= 0 AND amount_ml <= 10000),

    -- Type de boisson (optionnel)
    beverage_type VARCHAR(50) DEFAULT 'water', -- 'water', 'tea', 'coffee', 'juice', 'other'

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER hydration_logs_updated_at
    BEFORE UPDATE ON hydration_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_hydration_logs_user ON hydration_logs(user_id);
CREATE INDEX idx_hydration_logs_date ON hydration_logs(user_id, date DESC);

-- ============================================================================
-- TABLE: hydration_goals
-- Description: Objectifs d'hydratation
-- ============================================================================

CREATE TABLE IF NOT EXISTS hydration_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Objectif quotidien (en ml)
    daily_goal_ml INTEGER DEFAULT 2000 CHECK (daily_goal_ml > 0 AND daily_goal_ml <= 10000),

    -- Période de validité
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER hydration_goals_updated_at
    BEFORE UPDATE ON hydration_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_hydration_goals_user ON hydration_goals(user_id);
CREATE INDEX idx_hydration_goals_current ON hydration_goals(user_id, valid_from, valid_until);

-- ============================================================================
-- TABLE: biometric_insights
-- Description: Insights automatiques générés à partir des données
-- User Story: BIO-006
-- ============================================================================

CREATE TABLE IF NOT EXISTS biometric_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Type d'insight
    insight_type VARCHAR(30) NOT NULL, -- 'positive', 'warning', 'info'
    category VARCHAR(30) NOT NULL, -- 'weight', 'measurement', 'wellbeing', 'activity', 'hydration'

    -- Contenu
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    icon VARCHAR(10),

    -- Données de référence
    reference_data JSONB,

    -- Affichage
    is_dismissed BOOLEAN DEFAULT false,
    dismissed_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ
);

-- Index
CREATE INDEX idx_biometric_insights_user ON biometric_insights(user_id);
CREATE INDEX idx_biometric_insights_active ON biometric_insights(user_id, is_dismissed, expires_at)
    WHERE is_dismissed = false;
CREATE INDEX idx_biometric_insights_category ON biometric_insights(user_id, category);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour calculer les calories brûlées
CREATE OR REPLACE FUNCTION calculate_activity_calories(
    p_activity_type_id UUID,
    p_duration_minutes INTEGER,
    p_intensity activity_intensity,
    p_weight_kg DECIMAL DEFAULT 75
)
RETURNS INTEGER AS $$
DECLARE
    v_met DECIMAL;
    v_intensity_factor DECIMAL;
    v_calories INTEGER;
BEGIN
    -- Récupérer la valeur MET
    SELECT met_value INTO v_met FROM activity_types WHERE id = p_activity_type_id;

    IF v_met IS NULL THEN
        v_met := 4.0; -- Valeur par défaut
    END IF;

    -- Facteur d'intensité
    v_intensity_factor := CASE p_intensity
        WHEN 'light' THEN 0.8
        WHEN 'moderate' THEN 1.0
        WHEN 'vigorous' THEN 1.3
        WHEN 'very_vigorous' THEN 1.5
        ELSE 1.0
    END;

    -- Formule: calories = MET × poids(kg) × durée(h) × facteur_intensité
    v_calories := ROUND(v_met * p_weight_kg * (p_duration_minutes::DECIMAL / 60) * v_intensity_factor);

    RETURN v_calories;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour calculer automatiquement les calories
CREATE OR REPLACE FUNCTION activities_calculate_calories()
RETURNS TRIGGER AS $$
DECLARE
    v_weight DECIMAL;
BEGIN
    -- Ne calculer que si pas de valeur manuelle
    IF NEW.is_calories_manual = false OR NEW.calories_burned IS NULL THEN
        -- Récupérer le poids actuel de l'utilisateur
        SELECT weight_kg INTO v_weight
        FROM weight_entries
        WHERE user_id = NEW.user_id
        ORDER BY date DESC
        LIMIT 1;

        IF v_weight IS NULL THEN
            v_weight := 75; -- Poids par défaut
        END IF;

        NEW.calories_burned := calculate_activity_calories(
            NEW.activity_type_id,
            NEW.duration_minutes,
            NEW.intensity,
            v_weight
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER activities_auto_calories
    BEFORE INSERT OR UPDATE ON activities
    FOR EACH ROW
    EXECUTE FUNCTION activities_calculate_calories();

-- Fonction pour obtenir les stats de poids
CREATE OR REPLACE FUNCTION get_weight_stats(
    p_user_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    current_weight DECIMAL,
    initial_weight DECIMAL,
    goal_weight DECIMAL,
    change_kg DECIMAL,
    change_percent DECIMAL,
    weekly_change DECIMAL,
    trend VARCHAR
) AS $$
DECLARE
    v_current DECIMAL;
    v_initial DECIMAL;
    v_goal DECIMAL;
    v_week_ago DECIMAL;
BEGIN
    -- Poids actuel
    SELECT weight_kg INTO v_current
    FROM weight_entries
    WHERE user_id = p_user_id
    ORDER BY date DESC
    LIMIT 1;

    -- Poids initial (il y a p_days jours)
    SELECT weight_kg INTO v_initial
    FROM weight_entries
    WHERE user_id = p_user_id
        AND date <= CURRENT_DATE - (p_days || ' days')::INTERVAL
    ORDER BY date DESC
    LIMIT 1;

    -- Si pas de données anciennes, prendre la plus ancienne
    IF v_initial IS NULL THEN
        SELECT weight_kg INTO v_initial
        FROM weight_entries
        WHERE user_id = p_user_id
        ORDER BY date ASC
        LIMIT 1;
    END IF;

    -- Objectif de poids
    SELECT target_weight_kg INTO v_goal
    FROM weight_goals
    WHERE user_id = p_user_id
        AND is_achieved = false
    ORDER BY created_at DESC
    LIMIT 1;

    -- Poids il y a une semaine
    SELECT weight_kg INTO v_week_ago
    FROM weight_entries
    WHERE user_id = p_user_id
        AND date <= CURRENT_DATE - INTERVAL '7 days'
    ORDER BY date DESC
    LIMIT 1;

    RETURN QUERY
    SELECT
        v_current AS current_weight,
        v_initial AS initial_weight,
        v_goal AS goal_weight,
        COALESCE(v_current - v_initial, 0) AS change_kg,
        CASE
            WHEN v_initial IS NOT NULL AND v_initial > 0
            THEN ROUND(((v_current - v_initial) / v_initial * 100)::NUMERIC, 1)
            ELSE 0
        END AS change_percent,
        COALESCE(v_current - v_week_ago, 0) AS weekly_change,
        CASE
            WHEN v_week_ago IS NULL THEN 'stable'
            WHEN v_current > v_week_ago + 0.1 THEN 'up'
            WHEN v_current < v_week_ago - 0.1 THEN 'down'
            ELSE 'stable'
        END::VARCHAR AS trend;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les stats d'activité de la semaine
CREATE OR REPLACE FUNCTION get_weekly_activity_stats(
    p_user_id UUID
)
RETURNS TABLE (
    sessions INTEGER,
    total_minutes INTEGER,
    total_calories INTEGER,
    goal_sessions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(a.id)::INTEGER AS sessions,
        COALESCE(SUM(a.duration_minutes), 0)::INTEGER AS total_minutes,
        COALESCE(SUM(a.calories_burned), 0)::INTEGER AS total_calories,
        COALESCE(ag.sessions_per_week, 3)::INTEGER AS goal_sessions
    FROM activities a
    LEFT JOIN activity_goals ag ON ag.user_id = a.user_id
        AND (ag.valid_until IS NULL OR ag.valid_until >= CURRENT_DATE)
        AND ag.valid_from <= CURRENT_DATE
    WHERE a.user_id = p_user_id
        AND a.date >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY ag.sessions_per_week;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les stats d'hydratation du jour
CREATE OR REPLACE FUNCTION get_daily_hydration(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_ml INTEGER,
    goal_ml INTEGER,
    percentage INTEGER
) AS $$
DECLARE
    v_total INTEGER;
    v_goal INTEGER;
BEGIN
    -- Total du jour
    SELECT COALESCE(SUM(amount_ml), 0) INTO v_total
    FROM hydration_logs
    WHERE user_id = p_user_id
        AND date = p_date;

    -- Objectif
    SELECT COALESCE(hg.daily_goal_ml, 2000) INTO v_goal
    FROM hydration_goals hg
    WHERE hg.user_id = p_user_id
        AND hg.valid_from <= p_date
        AND (hg.valid_until IS NULL OR hg.valid_until >= p_date)
    ORDER BY hg.created_at DESC
    LIMIT 1;

    IF v_goal IS NULL THEN
        v_goal := 2000;
    END IF;

    RETURN QUERY
    SELECT
        v_total AS total_ml,
        v_goal AS goal_ml,
        LEAST(ROUND((v_total::DECIMAL / v_goal * 100))::INTEGER, 100) AS percentage;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE weight_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weight_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE wellbeing_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE biometric_insights ENABLE ROW LEVEL SECURITY;

-- Politiques pour weight_entries
DROP POLICY IF EXISTS weight_entries_own ON weight_entries;
CREATE POLICY weight_entries_own ON weight_entries
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = weight_entries.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour weight_goals
DROP POLICY IF EXISTS weight_goals_own ON weight_goals;
CREATE POLICY weight_goals_own ON weight_goals
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = weight_goals.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour measurements
DROP POLICY IF EXISTS measurements_own ON measurements;
CREATE POLICY measurements_own ON measurements
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = measurements.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour wellbeing_logs
DROP POLICY IF EXISTS wellbeing_logs_own ON wellbeing_logs;
CREATE POLICY wellbeing_logs_own ON wellbeing_logs
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = wellbeing_logs.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour activity_types
DROP POLICY IF EXISTS activity_types_read ON activity_types;
CREATE POLICY activity_types_read ON activity_types
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS activity_types_manage ON activity_types;
CREATE POLICY activity_types_manage ON activity_types
    FOR ALL USING (
        created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour activities
DROP POLICY IF EXISTS activities_own ON activities;
CREATE POLICY activities_own ON activities
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = activities.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour activity_goals
DROP POLICY IF EXISTS activity_goals_own ON activity_goals;
CREATE POLICY activity_goals_own ON activity_goals
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = activity_goals.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour hydration_logs
DROP POLICY IF EXISTS hydration_logs_own ON hydration_logs;
CREATE POLICY hydration_logs_own ON hydration_logs
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = hydration_logs.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour hydration_goals
DROP POLICY IF EXISTS hydration_goals_own ON hydration_goals;
CREATE POLICY hydration_goals_own ON hydration_goals
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = hydration_goals.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour biometric_insights
DROP POLICY IF EXISTS biometric_insights_own ON biometric_insights;
CREATE POLICY biometric_insights_own ON biometric_insights
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE weight_entries IS 'Entrées de poids des utilisateurs (BIO-001)';
COMMENT ON TABLE weight_goals IS 'Objectifs de poids des utilisateurs';
COMMENT ON TABLE measurements IS 'Mensurations corporelles (BIO-002)';
COMMENT ON TABLE wellbeing_logs IS 'Logs de bien-être quotidien (BIO-003)';
COMMENT ON TABLE activity_types IS 'Types d''activités physiques avec valeurs MET';
COMMENT ON TABLE activities IS 'Activités physiques enregistrées (BIO-004)';
COMMENT ON TABLE activity_goals IS 'Objectifs d''activité hebdomadaires';
COMMENT ON TABLE hydration_logs IS 'Logs d''hydratation quotidienne (BIO-005)';
COMMENT ON TABLE hydration_goals IS 'Objectifs d''hydratation';
COMMENT ON TABLE biometric_insights IS 'Insights automatiques générés (BIO-006)';

COMMENT ON FUNCTION calculate_activity_calories IS 'Calcule les calories brûlées selon la formule MET (BIO-007)';
COMMENT ON FUNCTION get_weight_stats IS 'Récupère les statistiques de poids d''un utilisateur';
COMMENT ON FUNCTION get_weekly_activity_stats IS 'Récupère les statistiques d''activité de la semaine';
COMMENT ON FUNCTION get_daily_hydration IS 'Récupère l''hydratation du jour avec l''objectif';
