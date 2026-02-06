-- ============================================================================
-- NutriSensia Database Schema - 15 Gamification
-- ============================================================================
-- Phase 13: Gamification
-- Dépendances: 01_extensions_and_types.sql, 02_patient_nutritionist.sql
-- User Stories: GAME-001 à GAME-004, DASH-007
-- ============================================================================

-- ============================================================================
-- TABLE: badge_categories
-- Description: Catégories de badges
-- ============================================================================

CREATE TABLE IF NOT EXISTS badge_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    slug VARCHAR(50) NOT NULL UNIQUE,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),

    -- Affichage
    icon VARCHAR(50),
    color VARCHAR(20),
    description TEXT,

    -- Ordre
    display_order INTEGER DEFAULT 0,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_badge_categories_slug ON badge_categories(slug);

-- Données initiales
INSERT INTO badge_categories (slug, name_fr, name_en, icon, display_order) VALUES
    ('nutrition', 'Nutrition', 'Nutrition', '🥗', 1),
    ('activity', 'Activité', 'Activity', '🏃', 2),
    ('consistency', 'Régularité', 'Consistency', '📆', 3),
    ('wellness', 'Bien-être', 'Wellness', '🧘', 4),
    ('social', 'Social', 'Social', '👥', 5),
    ('milestone', 'Jalons', 'Milestones', '🏆', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- TABLE: badges
-- Description: Badges disponibles
-- User Story: GAME-001
-- ============================================================================

CREATE TABLE IF NOT EXISTS badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Catégorie
    category_id UUID REFERENCES badge_categories(id) ON DELETE SET NULL,

    -- Identification
    code VARCHAR(50) NOT NULL UNIQUE,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    description_fr TEXT NOT NULL,
    description_en TEXT,

    -- Niveau
    level badge_level NOT NULL DEFAULT 'bronze', -- 'bronze', 'silver', 'gold', 'platinum'

    -- Affichage
    icon VARCHAR(50),
    emoji VARCHAR(10),
    image_url TEXT,
    color VARCHAR(20),

    -- Conditions de déblocage (JSON)
    unlock_conditions JSONB NOT NULL DEFAULT '{}',
    -- Exemple: { "type": "streak", "value": 7 }
    -- Exemple: { "type": "count", "entity": "meals", "value": 100 }
    -- Exemple: { "type": "weight_goal", "achieved": true }

    -- Points associés
    points INTEGER DEFAULT 0,

    -- Rareté (pourcentage d'utilisateurs qui l'ont)
    rarity_percent DECIMAL(5, 2),

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    is_secret BOOLEAN DEFAULT false, -- Badges cachés jusqu'au déblocage
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_badges_category ON badges(category_id);
CREATE INDEX idx_badges_code ON badges(code);
CREATE INDEX idx_badges_level ON badges(level);
CREATE INDEX idx_badges_active ON badges(is_active) WHERE is_active = true;

-- Données initiales - Badges
INSERT INTO badges (code, name_fr, description_fr, level, category_id, emoji, unlock_conditions, points) VALUES
    -- Régularité / Streaks
    ('streak_7', 'Semaine parfaite', '7 jours consécutifs d''enregistrement', 'bronze',
     (SELECT id FROM badge_categories WHERE slug = 'consistency'), '🔥',
     '{"type": "streak", "streak_type": "meal_logging", "value": 7}', 50),
    ('streak_30', 'Mois parfait', '30 jours consécutifs d''enregistrement', 'silver',
     (SELECT id FROM badge_categories WHERE slug = 'consistency'), '🔥',
     '{"type": "streak", "streak_type": "meal_logging", "value": 30}', 200),
    ('streak_100', 'Centurion', '100 jours consécutifs d''enregistrement', 'gold',
     (SELECT id FROM badge_categories WHERE slug = 'consistency'), '🔥',
     '{"type": "streak", "streak_type": "meal_logging", "value": 100}', 500),

    -- Nutrition
    ('first_meal', 'Premier repas', 'Premier repas enregistré', 'bronze',
     (SELECT id FROM badge_categories WHERE slug = 'nutrition'), '🍽️',
     '{"type": "count", "entity": "meals", "value": 1}', 10),
    ('meals_50', 'Cuisinier régulier', '50 repas enregistrés', 'silver',
     (SELECT id FROM badge_categories WHERE slug = 'nutrition'), '👨‍🍳',
     '{"type": "count", "entity": "meals", "value": 50}', 100),
    ('meals_500', 'Chef étoilé', '500 repas enregistrés', 'gold',
     (SELECT id FROM badge_categories WHERE slug = 'nutrition'), '⭐',
     '{"type": "count", "entity": "meals", "value": 500}', 300),
    ('balanced_week', 'Équilibre parfait', 'Une semaine avec tous les objectifs nutritionnels atteints', 'gold',
     (SELECT id FROM badge_categories WHERE slug = 'nutrition'), '⚖️',
     '{"type": "balanced_week", "value": 1}', 200),

    -- Activité
    ('first_activity', 'Premier pas', 'Première activité enregistrée', 'bronze',
     (SELECT id FROM badge_categories WHERE slug = 'activity'), '🏃',
     '{"type": "count", "entity": "activities", "value": 1}', 10),
    ('activities_20', 'Sportif', '20 activités enregistrées', 'silver',
     (SELECT id FROM badge_categories WHERE slug = 'activity'), '💪',
     '{"type": "count", "entity": "activities", "value": 20}', 100),
    ('weekly_goal_4', 'Objectif hebdo x4', 'Atteindre l''objectif hebdomadaire 4 semaines de suite', 'gold',
     (SELECT id FROM badge_categories WHERE slug = 'activity'), '🎯',
     '{"type": "weekly_goal_streak", "value": 4}', 250),

    -- Bien-être
    ('hydration_master', 'Maître hydratation', '7 jours consécutifs d''objectif hydratation atteint', 'silver',
     (SELECT id FROM badge_categories WHERE slug = 'wellness'), '💧',
     '{"type": "streak", "streak_type": "hydration_goal", "value": 7}', 100),
    ('wellbeing_tracker', 'Observateur', '30 jours de suivi bien-être', 'silver',
     (SELECT id FROM badge_categories WHERE slug = 'wellness'), '🧘',
     '{"type": "count", "entity": "wellbeing_logs", "value": 30}', 150),

    -- Jalons
    ('weight_goal', 'Objectif atteint', 'Atteindre son objectif de poids', 'platinum',
     (SELECT id FROM badge_categories WHERE slug = 'milestone'), '🏆',
     '{"type": "weight_goal", "achieved": true}', 1000),
    ('first_month', 'Premier mois', '1 mois d''utilisation de NutriSensia', 'bronze',
     (SELECT id FROM badge_categories WHERE slug = 'milestone'), '📅',
     '{"type": "account_age", "days": 30}', 50),
    ('one_year', 'Anniversaire', '1 an d''utilisation de NutriSensia', 'gold',
     (SELECT id FROM badge_categories WHERE slug = 'milestone'), '🎂',
     '{"type": "account_age", "days": 365}', 500)
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- TABLE: user_badges
-- Description: Badges débloqués par utilisateur
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur et badge
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,

    -- Progression (pour badges à étapes)
    progress INTEGER DEFAULT 100, -- 0-100%
    progress_data JSONB, -- Données de progression spécifiques

    -- Déblocage
    unlocked_at TIMESTAMPTZ DEFAULT now(),
    is_featured BOOLEAN DEFAULT false, -- Affiché sur le profil

    -- Notification
    notification_sent BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(user_id, badge_id)
);

-- Index
CREATE INDEX idx_user_badges_user ON user_badges(user_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_user_badges_unlocked ON user_badges(user_id, unlocked_at DESC);
CREATE INDEX idx_user_badges_featured ON user_badges(user_id, is_featured) WHERE is_featured = true;

-- ============================================================================
-- TABLE: streaks
-- Description: Séries d'enregistrement
-- User Story: GAME-002
-- ============================================================================

CREATE TABLE IF NOT EXISTS streaks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Type de streak
    streak_type streak_type NOT NULL, -- 'meal_logging', 'weight_logging', 'hydration_goal', 'activity', 'app_usage'

    -- Compteurs
    current_count INTEGER DEFAULT 0,
    longest_count INTEGER DEFAULT 0,

    -- Dates
    last_activity_date DATE,
    streak_started_at DATE,

    -- Freeze (jours de grâce)
    freeze_days_remaining INTEGER DEFAULT 0,
    freeze_days_used INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(user_id, streak_type)
);

-- Trigger pour updated_at
CREATE TRIGGER streaks_updated_at
    BEFORE UPDATE ON streaks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_streaks_user ON streaks(user_id);
CREATE INDEX idx_streaks_type ON streaks(streak_type);
CREATE INDEX idx_streaks_active ON streaks(user_id, current_count DESC);

-- ============================================================================
-- TABLE: weekly_objectives
-- Description: Objectifs hebdomadaires personnalisés
-- User Story: DASH-007, GAME-003
-- ============================================================================

CREATE TABLE IF NOT EXISTS weekly_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Semaine
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,

    -- Objectifs (JSON flexible)
    objectives JSONB NOT NULL DEFAULT '[]',
    -- Exemple: [
    --   { "id": "log_meals", "title": "Enregistrer 5 repas", "target": 5, "current": 3, "type": "count", "entity": "meals" },
    --   { "id": "hydration", "title": "Atteindre l'objectif hydratation 4 jours", "target": 4, "current": 2, "type": "days", "condition": "hydration_goal" }
    -- ]

    -- Progression globale
    total_objectives INTEGER DEFAULT 0,
    completed_objectives INTEGER DEFAULT 0,
    progress_percent INTEGER DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),

    -- Récompense
    points_earned INTEGER DEFAULT 0,
    bonus_unlocked BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(user_id, week_start)
);

-- Trigger pour updated_at
CREATE TRIGGER weekly_objectives_updated_at
    BEFORE UPDATE ON weekly_objectives
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_weekly_objectives_user ON weekly_objectives(user_id);
CREATE INDEX idx_weekly_objectives_week ON weekly_objectives(user_id, week_start DESC);
CREATE INDEX idx_weekly_objectives_current ON weekly_objectives(week_start, week_end);

-- ============================================================================
-- TABLE: user_points
-- Description: Points et niveau utilisateur
-- User Story: GAME-004
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,

    -- Points
    total_points INTEGER DEFAULT 0,
    current_level INTEGER DEFAULT 1,
    points_to_next_level INTEGER DEFAULT 100,

    -- Historique
    points_this_week INTEGER DEFAULT 0,
    points_this_month INTEGER DEFAULT 0,

    -- Rang
    rank_position INTEGER,
    rank_updated_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER user_points_updated_at
    BEFORE UPDATE ON user_points
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_user_points_user ON user_points(user_id);
CREATE INDEX idx_user_points_level ON user_points(current_level DESC);
CREATE INDEX idx_user_points_rank ON user_points(rank_position);

-- ============================================================================
-- TABLE: points_history
-- Description: Historique des points gagnés
-- ============================================================================

CREATE TABLE IF NOT EXISTS points_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Points
    points INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    reason_data JSONB,

    -- Source
    badge_id UUID REFERENCES badges(id) ON DELETE SET NULL,
    weekly_objective_id UUID REFERENCES weekly_objectives(id) ON DELETE SET NULL,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_points_history_user ON points_history(user_id, created_at DESC);
-- Note: Index partiel avec CURRENT_DATE non supporté (fonction non IMMUTABLE)
-- Les requêtes pour la semaine utiliseront idx_points_history_user
CREATE INDEX idx_points_history_recent ON points_history(user_id, created_at DESC);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour mettre à jour un streak
CREATE OR REPLACE FUNCTION update_streak(
    p_user_id UUID,
    p_streak_type streak_type,
    p_activity_date DATE DEFAULT CURRENT_DATE
)
RETURNS INTEGER AS $$
DECLARE
    v_streak RECORD;
    v_new_count INTEGER;
    v_days_diff INTEGER;
BEGIN
    -- Récupérer ou créer le streak
    SELECT * INTO v_streak
    FROM streaks
    WHERE user_id = p_user_id AND streak_type = p_streak_type;

    IF v_streak IS NULL THEN
        -- Créer un nouveau streak
        INSERT INTO streaks (user_id, streak_type, current_count, longest_count, last_activity_date, streak_started_at)
        VALUES (p_user_id, p_streak_type, 1, 1, p_activity_date, p_activity_date);
        RETURN 1;
    END IF;

    -- Calculer la différence de jours
    v_days_diff := p_activity_date - v_streak.last_activity_date;

    IF v_days_diff = 0 THEN
        -- Même jour, pas de changement
        RETURN v_streak.current_count;
    ELSIF v_days_diff = 1 THEN
        -- Jour consécutif
        v_new_count := v_streak.current_count + 1;
    ELSIF v_days_diff <= 1 + v_streak.freeze_days_remaining THEN
        -- Utilisation du freeze
        UPDATE streaks
        SET
            freeze_days_remaining = freeze_days_remaining - (v_days_diff - 1),
            freeze_days_used = freeze_days_used + (v_days_diff - 1)
        WHERE id = v_streak.id;
        v_new_count := v_streak.current_count + 1;
    ELSE
        -- Streak cassé
        v_new_count := 1;
        UPDATE streaks
        SET streak_started_at = p_activity_date
        WHERE id = v_streak.id;
    END IF;

    -- Mettre à jour le streak
    UPDATE streaks
    SET
        current_count = v_new_count,
        longest_count = GREATEST(longest_count, v_new_count),
        last_activity_date = p_activity_date,
        updated_at = now()
    WHERE id = v_streak.id;

    RETURN v_new_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour ajouter des points
CREATE OR REPLACE FUNCTION add_points(
    p_user_id UUID,
    p_points INTEGER,
    p_reason VARCHAR,
    p_reason_data JSONB DEFAULT NULL,
    p_badge_id UUID DEFAULT NULL,
    p_weekly_objective_id UUID DEFAULT NULL
)
RETURNS INTEGER AS $$
DECLARE
    v_new_total INTEGER;
BEGIN
    -- Ajouter à l'historique
    INSERT INTO points_history (user_id, points, reason, reason_data, badge_id, weekly_objective_id)
    VALUES (p_user_id, p_points, p_reason, p_reason_data, p_badge_id, p_weekly_objective_id);

    -- Mettre à jour les points utilisateur
    INSERT INTO user_points (user_id, total_points, points_this_week, points_this_month)
    VALUES (p_user_id, p_points, p_points, p_points)
    ON CONFLICT (user_id) DO UPDATE SET
        total_points = user_points.total_points + p_points,
        points_this_week = user_points.points_this_week + p_points,
        points_this_month = user_points.points_this_month + p_points,
        updated_at = now();

    -- Récupérer le nouveau total
    SELECT total_points INTO v_new_total FROM user_points WHERE user_id = p_user_id;

    -- Mettre à jour le niveau
    PERFORM update_user_level(p_user_id);

    RETURN v_new_total;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour mettre à jour le niveau
CREATE OR REPLACE FUNCTION update_user_level(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    v_points INTEGER;
    v_level INTEGER;
    v_points_for_next INTEGER;
BEGIN
    SELECT total_points INTO v_points FROM user_points WHERE user_id = p_user_id;

    IF v_points IS NULL THEN
        RETURN 1;
    END IF;

    -- Calcul du niveau (formule simple: niveau = sqrt(points / 100) + 1)
    v_level := FLOOR(SQRT(v_points::DECIMAL / 100)) + 1;
    v_points_for_next := POWER(v_level, 2) * 100 - v_points;

    UPDATE user_points
    SET
        current_level = v_level,
        points_to_next_level = v_points_for_next,
        updated_at = now()
    WHERE user_id = p_user_id;

    RETURN v_level;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour débloquer un badge
CREATE OR REPLACE FUNCTION unlock_badge(
    p_user_id UUID,
    p_badge_code VARCHAR
)
RETURNS UUID AS $$
DECLARE
    v_badge RECORD;
    v_user_badge_id UUID;
BEGIN
    -- Récupérer le badge
    SELECT * INTO v_badge FROM badges WHERE code = p_badge_code AND is_active = true;

    IF v_badge IS NULL THEN
        RETURN NULL;
    END IF;

    -- Vérifier si déjà débloqué
    IF EXISTS (SELECT 1 FROM user_badges WHERE user_id = p_user_id AND badge_id = v_badge.id) THEN
        RETURN NULL;
    END IF;

    -- Débloquer le badge
    INSERT INTO user_badges (user_id, badge_id, progress)
    VALUES (p_user_id, v_badge.id, 100)
    RETURNING id INTO v_user_badge_id;

    -- Ajouter les points
    IF v_badge.points > 0 THEN
        PERFORM add_points(
            p_user_id,
            v_badge.points,
            'Badge débloqué: ' || v_badge.name_fr,
            jsonb_build_object('badge_code', p_badge_code),
            v_badge.id
        );
    END IF;

    RETURN v_user_badge_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer les objectifs hebdomadaires
CREATE OR REPLACE FUNCTION create_weekly_objectives(
    p_user_id UUID,
    p_week_start DATE DEFAULT date_trunc('week', CURRENT_DATE)::DATE
)
RETURNS UUID AS $$
DECLARE
    v_objective_id UUID;
    v_objectives JSONB;
BEGIN
    -- Définir les objectifs par défaut
    v_objectives := jsonb_build_array(
        jsonb_build_object(
            'id', 'log_meals_5',
            'title', 'Enregistrer 5 repas',
            'target', 5,
            'current', 0,
            'type', 'count',
            'entity', 'meals'
        ),
        jsonb_build_object(
            'id', 'log_weight',
            'title', 'Se peser au moins une fois',
            'target', 1,
            'current', 0,
            'type', 'count',
            'entity', 'weight_entries'
        ),
        jsonb_build_object(
            'id', 'hydration_4',
            'title', 'Atteindre l''objectif hydratation 4 jours',
            'target', 4,
            'current', 0,
            'type', 'days',
            'condition', 'hydration_goal'
        )
    );

    -- Créer les objectifs
    INSERT INTO weekly_objectives (
        user_id, week_start, week_end,
        objectives, total_objectives
    ) VALUES (
        p_user_id, p_week_start, p_week_start + INTERVAL '6 days',
        v_objectives, jsonb_array_length(v_objectives)
    )
    ON CONFLICT (user_id, week_start) DO NOTHING
    RETURNING id INTO v_objective_id;

    RETURN v_objective_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE badge_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE points_history ENABLE ROW LEVEL SECURITY;

-- Politiques de lecture publique
DROP POLICY IF EXISTS badge_categories_read ON badge_categories;
CREATE POLICY badge_categories_read ON badge_categories
    FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS badges_read ON badges;
CREATE POLICY badges_read ON badges
    FOR SELECT USING (is_active = true AND (is_secret = false OR EXISTS (
        SELECT 1 FROM user_badges WHERE badge_id = badges.id AND user_id = auth.uid()
    )));

-- Politiques pour données utilisateur
DROP POLICY IF EXISTS user_badges_own ON user_badges;
CREATE POLICY user_badges_own ON user_badges
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_badges_read_public ON user_badges;
CREATE POLICY user_badges_read_public ON user_badges
    FOR SELECT USING (is_featured = true);

DROP POLICY IF EXISTS streaks_own ON streaks;
CREATE POLICY streaks_own ON streaks
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS weekly_objectives_own ON weekly_objectives;
CREATE POLICY weekly_objectives_own ON weekly_objectives
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_points_own ON user_points;
CREATE POLICY user_points_own ON user_points
    FOR ALL USING (user_id = auth.uid());

DROP POLICY IF EXISTS user_points_read_rank ON user_points;
CREATE POLICY user_points_read_rank ON user_points
    FOR SELECT USING (true); -- Pour le classement

DROP POLICY IF EXISTS points_history_own ON points_history;
CREATE POLICY points_history_own ON points_history
    FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE badge_categories IS 'Catégories de badges';
COMMENT ON TABLE badges IS 'Badges disponibles (GAME-001)';
COMMENT ON TABLE user_badges IS 'Badges débloqués par utilisateur';
COMMENT ON TABLE streaks IS 'Séries d''enregistrement (GAME-002)';
COMMENT ON TABLE weekly_objectives IS 'Objectifs hebdomadaires (DASH-007, GAME-003)';
COMMENT ON TABLE user_points IS 'Points et niveau utilisateur (GAME-004)';
COMMENT ON TABLE points_history IS 'Historique des points gagnés';

COMMENT ON FUNCTION update_streak IS 'Met à jour un streak et retourne le nouveau compte';
COMMENT ON FUNCTION add_points IS 'Ajoute des points à un utilisateur';
COMMENT ON FUNCTION update_user_level IS 'Calcule et met à jour le niveau utilisateur';
COMMENT ON FUNCTION unlock_badge IS 'Débloque un badge pour un utilisateur';
COMMENT ON FUNCTION create_weekly_objectives IS 'Crée les objectifs hebdomadaires pour un utilisateur';
