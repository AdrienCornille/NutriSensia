-- ============================================================================
-- NutriSensia Database Schema - 09 Meals Enhanced
-- ============================================================================
-- Phase 7: Gestion des Repas (Enrichissement)
-- Dépendances: 01_extensions_and_types.sql, 02_patient_nutritionist.sql, 04_foods_database.sql
-- User Stories: MEAL-001 à MEAL-016, DASH-001, DASH-003
-- ============================================================================

-- Note: Cette migration crée la table meals de base, puis l'enrichit avec des colonnes additionnelles

-- ============================================================================
-- TABLE: meals (création de la table de base)
-- Description: Table principale des repas consommés par les utilisateurs
-- ============================================================================

CREATE TABLE IF NOT EXISTS meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Propriétaire
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Informations de base
    name VARCHAR(200) NOT NULL,
    description TEXT,
    meal_type meal_type NOT NULL,

    -- Totaux nutritionnels (calculés à partir des meal_foods)
    total_calories INTEGER DEFAULT 0,
    total_protein DECIMAL(6, 2) DEFAULT 0,
    total_carbs DECIMAL(6, 2) DEFAULT 0,
    total_fat DECIMAL(6, 2) DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'meals_updated_at'
    ) THEN
        CREATE TRIGGER meals_updated_at
            BEFORE UPDATE ON meals
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

-- Index de base
CREATE INDEX IF NOT EXISTS idx_meals_user ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_type ON meals(meal_type);

-- ============================================================================
-- ALTER TABLE: meals (enrichissement)
-- Description: Ajoute des colonnes pour photos, notes, contexte, date du repas
-- ============================================================================

-- Ajouter les nouvelles colonnes à la table meals existante
ALTER TABLE meals ADD COLUMN IF NOT EXISTS meal_date DATE DEFAULT CURRENT_DATE;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS meal_time TIME;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS context meal_context;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS location VARCHAR(100);
ALTER TABLE meals ADD COLUMN IF NOT EXISTS hunger_level INTEGER CHECK (hunger_level >= 1 AND hunger_level <= 5);
ALTER TABLE meals ADD COLUMN IF NOT EXISTS satisfaction_level INTEGER CHECK (satisfaction_level >= 1 AND satisfaction_level <= 5);
ALTER TABLE meals ADD COLUMN IF NOT EXISTS is_planned BOOLEAN DEFAULT false;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS plan_meal_id UUID;
ALTER TABLE meals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_meals_date ON meals(user_id, meal_date DESC);
CREATE INDEX IF NOT EXISTS idx_meals_type_date ON meals(user_id, meal_type, meal_date);
CREATE INDEX IF NOT EXISTS idx_meals_planned ON meals(is_planned) WHERE is_planned = true;

-- ============================================================================
-- TABLE: meal_foods
-- Description: Table de liaison repas-aliments avec quantités
-- Permet un tracking plus précis des aliments consommés
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,

    -- Si pas de food_id, nom personnalisé
    custom_name VARCHAR(200),

    -- Quantité
    quantity DECIMAL(8, 2) NOT NULL DEFAULT 100,
    portion_id UUID REFERENCES food_portions(id),
    unit VARCHAR(30) DEFAULT 'g',

    -- Valeurs nutritionnelles calculées pour cette portion
    calories INTEGER,
    protein_g DECIMAL(6, 2),
    carbs_g DECIMAL(6, 2),
    fat_g DECIMAL(6, 2),
    fiber_g DECIMAL(6, 2),

    -- Ordre d'affichage
    display_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte: soit food_id soit custom_name
    CONSTRAINT meal_foods_check_food CHECK (food_id IS NOT NULL OR custom_name IS NOT NULL)
);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS meal_foods_updated_at ON meal_foods;
CREATE TRIGGER meal_foods_updated_at
    BEFORE UPDATE ON meal_foods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_meal_foods_meal ON meal_foods(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_foods_food ON meal_foods(food_id);

-- ============================================================================
-- TABLE: meal_templates
-- Description: Modèles de repas pour réutilisation rapide
-- User Story: MEAL-012
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Propriétaire
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Informations
    name VARCHAR(200) NOT NULL,
    description TEXT,
    meal_type meal_type NOT NULL,

    -- Données nutritionnelles
    total_calories INTEGER,
    total_protein DECIMAL(6, 2),
    total_carbs DECIMAL(6, 2),
    total_fat DECIMAL(6, 2),

    -- Photo
    photo_url TEXT,

    -- Fréquence d'utilisation
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS meal_templates_updated_at ON meal_templates;
CREATE TRIGGER meal_templates_updated_at
    BEFORE UPDATE ON meal_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_meal_templates_user ON meal_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_templates_type ON meal_templates(user_id, meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_templates_usage ON meal_templates(user_id, usage_count DESC);

-- ============================================================================
-- TABLE: meal_template_foods
-- Description: Aliments des modèles de repas
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_template_foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    template_id UUID NOT NULL REFERENCES meal_templates(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,

    -- Si pas de food_id, nom personnalisé
    custom_name VARCHAR(200),

    -- Quantité
    quantity DECIMAL(8, 2) NOT NULL DEFAULT 100,
    portion_id UUID REFERENCES food_portions(id),
    unit VARCHAR(30) DEFAULT 'g',

    -- Valeurs nutritionnelles
    calories INTEGER,
    protein_g DECIMAL(6, 2),
    carbs_g DECIMAL(6, 2),
    fat_g DECIMAL(6, 2),

    -- Ordre d'affichage
    display_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte
    CONSTRAINT meal_template_foods_check_food CHECK (food_id IS NOT NULL OR custom_name IS NOT NULL)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_meal_template_foods_template ON meal_template_foods(template_id);

-- ============================================================================
-- TABLE: daily_nutrition_summary
-- Description: Résumé nutritionnel quotidien (calculé/caché)
-- User Story: DASH-001
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_nutrition_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur et date
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Totaux
    total_calories INTEGER DEFAULT 0,
    total_protein DECIMAL(8, 2) DEFAULT 0,
    total_carbs DECIMAL(8, 2) DEFAULT 0,
    total_fat DECIMAL(8, 2) DEFAULT 0,
    total_fiber DECIMAL(8, 2) DEFAULT 0,
    total_sugar DECIMAL(8, 2) DEFAULT 0,

    -- Objectifs du jour
    calorie_goal INTEGER,
    protein_goal DECIMAL(6, 2),
    carbs_goal DECIMAL(6, 2),
    fat_goal DECIMAL(6, 2),

    -- Par type de repas
    breakfast_calories INTEGER DEFAULT 0,
    lunch_calories INTEGER DEFAULT 0,
    dinner_calories INTEGER DEFAULT 0,
    snack_calories INTEGER DEFAULT 0,

    -- Nombre de repas
    meal_count INTEGER DEFAULT 0,

    -- Dernière mise à jour
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(user_id, date)
);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS daily_nutrition_summary_updated_at ON daily_nutrition_summary;
CREATE TRIGGER daily_nutrition_summary_updated_at
    BEFORE UPDATE ON daily_nutrition_summary
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_summary_user ON daily_nutrition_summary(user_id, date DESC);
-- Note: Index partiel avec CURRENT_DATE non supporté (fonction non IMMUTABLE)
-- Les requêtes pour la semaine utiliseront idx_daily_nutrition_summary_user
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_summary_recent ON daily_nutrition_summary(user_id, date DESC);

-- ============================================================================
-- TABLE: meal_photos
-- Description: Historique des photos de repas
-- User Story: MEAL-014
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    meal_id UUID REFERENCES meals(id) ON DELETE SET NULL,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Photo
    photo_url TEXT NOT NULL,
    thumbnail_url TEXT,

    -- Metadata de l'image
    width INTEGER,
    height INTEGER,
    file_size INTEGER,

    -- Analyse IA (optionnel)
    ai_analysis JSONB, -- { detected_foods: [], confidence: 0.95 }

    -- Date de prise
    taken_at TIMESTAMPTZ DEFAULT now(),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_meal_photos_user ON meal_photos(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_meal_photos_meal ON meal_photos(meal_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour calculer les totaux d'un repas
CREATE OR REPLACE FUNCTION calculate_meal_totals(p_meal_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE meals
    SET
        total_calories = COALESCE((
            SELECT SUM(calories) FROM meal_foods WHERE meal_id = p_meal_id
        ), 0),
        total_protein = COALESCE((
            SELECT SUM(protein_g) FROM meal_foods WHERE meal_id = p_meal_id
        ), 0),
        total_carbs = COALESCE((
            SELECT SUM(carbs_g) FROM meal_foods WHERE meal_id = p_meal_id
        ), 0),
        total_fat = COALESCE((
            SELECT SUM(fat_g) FROM meal_foods WHERE meal_id = p_meal_id
        ), 0),
        updated_at = now()
    WHERE id = p_meal_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour recalculer les totaux du repas
CREATE OR REPLACE FUNCTION meal_foods_update_totals()
RETURNS TRIGGER AS $$
BEGIN
    -- Recalculer les totaux du repas affecté
    PERFORM calculate_meal_totals(COALESCE(NEW.meal_id, OLD.meal_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meal_foods_totals_trigger ON meal_foods;
CREATE TRIGGER meal_foods_totals_trigger
    AFTER INSERT OR UPDATE OR DELETE ON meal_foods
    FOR EACH ROW
    EXECUTE FUNCTION meal_foods_update_totals();

-- Fonction pour calculer les valeurs nutritionnelles d'un aliment
CREATE OR REPLACE FUNCTION calculate_meal_food_nutrition()
RETURNS TRIGGER AS $$
DECLARE
    v_food RECORD;
    v_factor DECIMAL;
BEGIN
    -- Si food_id est défini, calculer les valeurs nutritionnelles
    IF NEW.food_id IS NOT NULL THEN
        SELECT * INTO v_food FROM foods WHERE id = NEW.food_id;

        IF v_food IS NOT NULL THEN
            -- Facteur = quantité / 100g
            v_factor := NEW.quantity / 100;

            NEW.calories := ROUND(v_food.calories_per_100g * v_factor);
            NEW.protein_g := ROUND((v_food.protein_g * v_factor)::NUMERIC, 2);
            NEW.carbs_g := ROUND((v_food.carbs_g * v_factor)::NUMERIC, 2);
            NEW.fat_g := ROUND((v_food.fat_g * v_factor)::NUMERIC, 2);
            NEW.fiber_g := ROUND((v_food.fiber_g * v_factor)::NUMERIC, 2);
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meal_foods_calculate_nutrition ON meal_foods;
CREATE TRIGGER meal_foods_calculate_nutrition
    BEFORE INSERT OR UPDATE ON meal_foods
    FOR EACH ROW
    EXECUTE FUNCTION calculate_meal_food_nutrition();

-- Fonction pour mettre à jour le résumé quotidien
CREATE OR REPLACE FUNCTION update_daily_nutrition_summary(
    p_user_id UUID,
    p_date DATE
)
RETURNS VOID AS $$
DECLARE
    v_summary RECORD;
    v_goals RECORD;
BEGIN
    -- Calculer les totaux
    SELECT
        COALESCE(SUM(total_calories), 0) AS total_calories,
        COALESCE(SUM(total_protein), 0) AS total_protein,
        COALESCE(SUM(total_carbs), 0) AS total_carbs,
        COALESCE(SUM(total_fat), 0) AS total_fat,
        COUNT(*) AS meal_count,
        COALESCE(SUM(CASE WHEN meal_type = 'breakfast' THEN total_calories ELSE 0 END), 0) AS breakfast_cal,
        COALESCE(SUM(CASE WHEN meal_type = 'lunch' THEN total_calories ELSE 0 END), 0) AS lunch_cal,
        COALESCE(SUM(CASE WHEN meal_type = 'dinner' THEN total_calories ELSE 0 END), 0) AS dinner_cal,
        COALESCE(SUM(CASE WHEN meal_type = 'snack' THEN total_calories ELSE 0 END), 0) AS snack_cal
    INTO v_summary
    FROM meals
    WHERE user_id = p_user_id
        AND meal_date = p_date
        AND deleted_at IS NULL;

    -- Récupérer les objectifs
    SELECT
        daily_calorie_target,
        protein_target_g,
        carbs_target_g,
        fat_target_g
    INTO v_goals
    FROM user_settings
    WHERE user_id = p_user_id;

    -- Insérer ou mettre à jour
    INSERT INTO daily_nutrition_summary (
        user_id, date,
        total_calories, total_protein, total_carbs, total_fat,
        calorie_goal, protein_goal, carbs_goal, fat_goal,
        breakfast_calories, lunch_calories, dinner_calories, snack_calories,
        meal_count
    ) VALUES (
        p_user_id, p_date,
        v_summary.total_calories, v_summary.total_protein, v_summary.total_carbs, v_summary.total_fat,
        v_goals.daily_calorie_target, v_goals.protein_target_g, v_goals.carbs_target_g, v_goals.fat_target_g,
        v_summary.breakfast_cal, v_summary.lunch_cal, v_summary.dinner_cal, v_summary.snack_cal,
        v_summary.meal_count
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
        total_calories = EXCLUDED.total_calories,
        total_protein = EXCLUDED.total_protein,
        total_carbs = EXCLUDED.total_carbs,
        total_fat = EXCLUDED.total_fat,
        breakfast_calories = EXCLUDED.breakfast_calories,
        lunch_calories = EXCLUDED.lunch_calories,
        dinner_calories = EXCLUDED.dinner_calories,
        snack_calories = EXCLUDED.snack_calories,
        meal_count = EXCLUDED.meal_count,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour le résumé quotidien
CREATE OR REPLACE FUNCTION meals_update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le résumé pour la date concernée
    IF TG_OP = 'DELETE' THEN
        PERFORM update_daily_nutrition_summary(OLD.user_id, OLD.meal_date);
    ELSE
        PERFORM update_daily_nutrition_summary(NEW.user_id, NEW.meal_date);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meals_daily_summary_trigger ON meals;
CREATE TRIGGER meals_daily_summary_trigger
    AFTER INSERT OR UPDATE OR DELETE ON meals
    FOR EACH ROW
    EXECUTE FUNCTION meals_update_daily_summary();

-- Fonction pour créer un repas depuis un template
CREATE OR REPLACE FUNCTION create_meal_from_template(
    p_template_id UUID,
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE,
    p_time TIME DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_template RECORD;
    v_meal_id UUID;
BEGIN
    -- Récupérer le template
    SELECT * INTO v_template FROM meal_templates WHERE id = p_template_id;

    IF v_template IS NULL THEN
        RAISE EXCEPTION 'Template not found';
    END IF;

    -- Créer le repas
    INSERT INTO meals (
        user_id, name, description, meal_type, meal_date, meal_time,
        photo_url, total_calories, total_protein, total_carbs, total_fat
    ) VALUES (
        p_user_id, v_template.name, v_template.description, v_template.meal_type,
        p_date, p_time, v_template.photo_url,
        v_template.total_calories, v_template.total_protein,
        v_template.total_carbs, v_template.total_fat
    )
    RETURNING id INTO v_meal_id;

    -- Copier les aliments
    INSERT INTO meal_foods (meal_id, food_id, custom_name, quantity, portion_id, unit, calories, protein_g, carbs_g, fat_g, display_order)
    SELECT v_meal_id, food_id, custom_name, quantity, portion_id, unit, calories, protein_g, carbs_g, fat_g, display_order
    FROM meal_template_foods
    WHERE template_id = p_template_id;

    -- Mettre à jour le compteur d'utilisation
    UPDATE meal_templates
    SET usage_count = usage_count + 1, last_used_at = now()
    WHERE id = p_template_id;

    RETURN v_meal_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le résumé nutritionnel d'une période
CREATE OR REPLACE FUNCTION get_nutrition_summary(
    p_user_id UUID,
    p_start_date DATE,
    p_end_date DATE
)
RETURNS TABLE (
    date DATE,
    total_calories INTEGER,
    total_protein DECIMAL,
    total_carbs DECIMAL,
    total_fat DECIMAL,
    meal_count INTEGER,
    calorie_goal INTEGER,
    goal_percentage INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        dns.date,
        dns.total_calories,
        dns.total_protein,
        dns.total_carbs,
        dns.total_fat,
        dns.meal_count,
        dns.calorie_goal,
        CASE
            WHEN dns.calorie_goal > 0
            THEN LEAST(ROUND((dns.total_calories::DECIMAL / dns.calorie_goal * 100))::INTEGER, 200)
            ELSE 0
        END AS goal_percentage
    FROM daily_nutrition_summary dns
    WHERE dns.user_id = p_user_id
        AND dns.date BETWEEN p_start_date AND p_end_date
    ORDER BY dns.date DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- RLS pour meals (table principale)
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS meals_own ON meals;
CREATE POLICY meals_own ON meals
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = meals.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- RLS pour les tables liées
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_template_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_nutrition_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_photos ENABLE ROW LEVEL SECURITY;

-- Politiques pour meal_foods (via meals)
DROP POLICY IF EXISTS meal_foods_via_meal ON meal_foods;
CREATE POLICY meal_foods_via_meal ON meal_foods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meals m
            WHERE m.id = meal_foods.meal_id
            AND (
                m.user_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM patient_profiles pp
                    WHERE pp.user_id = m.user_id
                    AND pp.nutritionist_id = auth.uid()
                )
            )
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour meal_templates
DROP POLICY IF EXISTS meal_templates_own ON meal_templates;
CREATE POLICY meal_templates_own ON meal_templates
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour meal_template_foods
DROP POLICY IF EXISTS meal_template_foods_via_template ON meal_template_foods;
CREATE POLICY meal_template_foods_via_template ON meal_template_foods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meal_templates mt
            WHERE mt.id = meal_template_foods.template_id
            AND mt.user_id = auth.uid()
        )
    );

-- Politiques pour daily_nutrition_summary
DROP POLICY IF EXISTS daily_nutrition_summary_own ON daily_nutrition_summary;
CREATE POLICY daily_nutrition_summary_own ON daily_nutrition_summary
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = daily_nutrition_summary.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour meal_photos
DROP POLICY IF EXISTS meal_photos_own ON meal_photos;
CREATE POLICY meal_photos_own ON meal_photos
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = meal_photos.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE meal_foods IS 'Table de liaison repas-aliments avec quantités et valeurs nutritionnelles';
COMMENT ON TABLE meal_templates IS 'Modèles de repas pour réutilisation rapide (MEAL-012)';
COMMENT ON TABLE meal_template_foods IS 'Aliments des modèles de repas';
COMMENT ON TABLE daily_nutrition_summary IS 'Résumé nutritionnel quotidien calculé (DASH-001)';
COMMENT ON TABLE meal_photos IS 'Historique des photos de repas (MEAL-014)';

COMMENT ON FUNCTION calculate_meal_totals IS 'Recalcule les totaux nutritionnels d''un repas';
COMMENT ON FUNCTION update_daily_nutrition_summary IS 'Met à jour le résumé quotidien pour un utilisateur';
COMMENT ON FUNCTION create_meal_from_template IS 'Crée un repas à partir d''un modèle';
COMMENT ON FUNCTION get_nutrition_summary IS 'Récupère le résumé nutritionnel d''une période';
