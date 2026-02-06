-- ============================================================================
-- NutriSensia Database Schema - 10 Meal Plans Enhanced
-- ============================================================================
-- Phase 8: Plans Alimentaires (Enrichissement)
-- Dépendances: 01_extensions_and_types.sql, 02_patient_nutritionist.sql, 04_foods_database.sql, 05_recipes.sql, 09_meals_enhanced.sql
-- User Stories: PLAN-001 à PLAN-007
-- ============================================================================

-- ============================================================================
-- TABLE: meal_plans (création de la table de base)
-- Description: Table principale des plans alimentaires
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Propriétaire (créateur du plan)
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Informations de base
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'meal_plans_updated_at'
    ) THEN
        CREATE TRIGGER meal_plans_updated_at
            BEFORE UPDATE ON meal_plans
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
    END IF;
END $$;

-- Index de base
CREATE INDEX IF NOT EXISTS idx_meal_plans_user ON meal_plans(user_id);

-- ============================================================================
-- ALTER TABLE: meal_plans (enrichissement)
-- Description: Enrichit la table meal_plans existante
-- ============================================================================

-- Ajouter les nouvelles colonnes à la table meal_plans existante
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS patient_id UUID REFERENCES profiles(id);
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS nutritionist_id UUID REFERENCES profiles(id);
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS status meal_plan_status DEFAULT 'draft';
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS objective VARCHAR(200);
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS is_template BOOLEAN DEFAULT false;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS parent_plan_id UUID REFERENCES meal_plans(id);
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Index pour les nouvelles colonnes
CREATE INDEX IF NOT EXISTS idx_meal_plans_patient ON meal_plans(patient_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_nutritionist ON meal_plans(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_status ON meal_plans(status);
CREATE INDEX IF NOT EXISTS idx_meal_plans_dates ON meal_plans(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_template ON meal_plans(is_template) WHERE is_template = true;

-- ============================================================================
-- TABLE: meal_plan_days
-- Description: Jours du plan alimentaire
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_plan_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaison
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,

    -- Jour
    day_number INTEGER NOT NULL CHECK (day_number >= 1 AND day_number <= 31),
    date DATE, -- Date réelle si le plan a des dates fixes
    day_name VARCHAR(20), -- Ex: "Lundi", "Jour 1"

    -- Totaux nutritionnels du jour
    total_calories INTEGER DEFAULT 0,
    total_protein DECIMAL(6, 2) DEFAULT 0,
    total_carbs DECIMAL(6, 2) DEFAULT 0,
    total_fat DECIMAL(6, 2) DEFAULT 0,

    -- Notes du jour
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(meal_plan_id, day_number)
);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS meal_plan_days_updated_at ON meal_plan_days;
CREATE TRIGGER meal_plan_days_updated_at
    BEFORE UPDATE ON meal_plan_days
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_meal_plan_days_plan ON meal_plan_days(meal_plan_id, day_number);

-- ============================================================================
-- TABLE: meal_plan_meals
-- Description: Repas planifiés pour chaque jour du plan
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_plan_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    plan_day_id UUID NOT NULL REFERENCES meal_plan_days(id) ON DELETE CASCADE,

    -- Type de repas
    meal_type meal_type NOT NULL,

    -- Référence optionnelle à une recette
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,

    -- Ou description personnalisée
    title VARCHAR(200),
    description TEXT,
    image_url TEXT,

    -- Informations nutritionnelles
    calories INTEGER,
    protein_g DECIMAL(6, 2),
    carbs_g DECIMAL(6, 2),
    fat_g DECIMAL(6, 2),

    -- Heure suggérée
    suggested_time TIME,

    -- Portions
    servings INTEGER DEFAULT 1,

    -- Notes
    notes TEXT,

    -- Ordre d'affichage pour le même meal_type
    display_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS meal_plan_meals_updated_at ON meal_plan_meals;
CREATE TRIGGER meal_plan_meals_updated_at
    BEFORE UPDATE ON meal_plan_meals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_day ON meal_plan_meals(plan_day_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_type ON meal_plan_meals(plan_day_id, meal_type);
CREATE INDEX IF NOT EXISTS idx_meal_plan_meals_recipe ON meal_plan_meals(recipe_id);

-- ============================================================================
-- TABLE: meal_plan_meal_foods
-- Description: Aliments spécifiques pour chaque repas planifié
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_plan_meal_foods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    plan_meal_id UUID NOT NULL REFERENCES meal_plan_meals(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,

    -- Ou nom personnalisé
    custom_name VARCHAR(200),

    -- Quantité
    quantity DECIMAL(8, 2) NOT NULL DEFAULT 100,
    unit VARCHAR(30) DEFAULT 'g',

    -- Valeurs nutritionnelles
    calories INTEGER,
    protein_g DECIMAL(6, 2),
    carbs_g DECIMAL(6, 2),
    fat_g DECIMAL(6, 2),

    -- Ordre
    display_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte
    CONSTRAINT meal_plan_meal_foods_check CHECK (food_id IS NOT NULL OR custom_name IS NOT NULL)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_meal_plan_meal_foods_meal ON meal_plan_meal_foods(plan_meal_id);

-- ============================================================================
-- TABLE: meal_plan_alternatives
-- Description: Alternatives suggérées pour les repas/aliments
-- User Story: PLAN-004
-- ============================================================================

CREATE TABLE IF NOT EXISTS meal_plan_alternatives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ce qui est remplacé
    plan_meal_id UUID REFERENCES meal_plan_meals(id) ON DELETE CASCADE,
    plan_food_id UUID REFERENCES meal_plan_meal_foods(id) ON DELETE CASCADE,

    -- Alternative proposée
    alternative_recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,
    alternative_food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    alternative_name VARCHAR(200),

    -- Raison de l'alternative
    reason TEXT, -- Ex: "Sans gluten", "Végétarien", "Moins calorique"

    -- Informations nutritionnelles
    calories INTEGER,
    protein_g DECIMAL(6, 2),
    carbs_g DECIMAL(6, 2),
    fat_g DECIMAL(6, 2),

    -- Ordre de préférence
    preference_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Au moins un parent
    CONSTRAINT meal_plan_alternatives_check_parent CHECK (
        plan_meal_id IS NOT NULL OR plan_food_id IS NOT NULL
    ),
    -- Au moins une alternative
    CONSTRAINT meal_plan_alternatives_check_alternative CHECK (
        alternative_recipe_id IS NOT NULL OR alternative_food_id IS NOT NULL OR alternative_name IS NOT NULL
    )
);

-- Index
CREATE INDEX IF NOT EXISTS idx_meal_plan_alternatives_meal ON meal_plan_alternatives(plan_meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_plan_alternatives_food ON meal_plan_alternatives(plan_food_id);

-- ============================================================================
-- TABLE: plan_modification_requests
-- Description: Demandes de modification du plan par le patient
-- User Story: PLAN-005
-- ============================================================================

CREATE TABLE IF NOT EXISTS plan_modification_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Élément concerné
    plan_meal_id UUID REFERENCES meal_plan_meals(id) ON DELETE SET NULL,
    plan_day_id UUID REFERENCES meal_plan_days(id) ON DELETE SET NULL,

    -- Type de demande
    request_type VARCHAR(30) NOT NULL, -- 'substitute', 'remove', 'add', 'modify_quantity', 'general'

    -- Contenu de la demande
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,

    -- Suggestion du patient
    suggested_alternative TEXT,

    -- Statut
    status modification_request_status DEFAULT 'pending',

    -- Réponse du nutritionniste
    response TEXT,
    responded_at TIMESTAMPTZ,
    responded_by UUID REFERENCES profiles(id),

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS plan_modification_requests_updated_at ON plan_modification_requests;
CREATE TRIGGER plan_modification_requests_updated_at
    BEFORE UPDATE ON plan_modification_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_plan_modification_requests_plan ON plan_modification_requests(meal_plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_modification_requests_patient ON plan_modification_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_plan_modification_requests_nutritionist ON plan_modification_requests(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_plan_modification_requests_status ON plan_modification_requests(status);
CREATE INDEX IF NOT EXISTS idx_plan_modification_requests_pending ON plan_modification_requests(nutritionist_id, status)
    WHERE status = 'pending';

-- ============================================================================
-- TABLE: plan_adherence
-- Description: Suivi de l'adhérence au plan
-- User Story: PLAN-007
-- ============================================================================

CREATE TABLE IF NOT EXISTS plan_adherence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    meal_plan_id UUID NOT NULL REFERENCES meal_plans(id) ON DELETE CASCADE,
    plan_meal_id UUID REFERENCES meal_plan_meals(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Date
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Statut d'adhérence
    status adherence_status NOT NULL DEFAULT 'not_tracked', -- 'followed', 'partial', 'skipped', 'not_tracked'

    -- Repas réellement consommé (si différent)
    actual_meal_id UUID REFERENCES meals(id) ON DELETE SET NULL,

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(plan_meal_id, date)
);

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS plan_adherence_updated_at ON plan_adherence;
CREATE TRIGGER plan_adherence_updated_at
    BEFORE UPDATE ON plan_adherence
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_plan_adherence_plan ON plan_adherence(meal_plan_id, date);
CREATE INDEX IF NOT EXISTS idx_plan_adherence_patient ON plan_adherence(patient_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_plan_adherence_status ON plan_adherence(status);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour calculer les totaux d'un jour de plan
CREATE OR REPLACE FUNCTION calculate_plan_day_totals(p_day_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE meal_plan_days
    SET
        total_calories = COALESCE((
            SELECT SUM(calories) FROM meal_plan_meals WHERE plan_day_id = p_day_id
        ), 0),
        total_protein = COALESCE((
            SELECT SUM(protein_g) FROM meal_plan_meals WHERE plan_day_id = p_day_id
        ), 0),
        total_carbs = COALESCE((
            SELECT SUM(carbs_g) FROM meal_plan_meals WHERE plan_day_id = p_day_id
        ), 0),
        total_fat = COALESCE((
            SELECT SUM(fat_g) FROM meal_plan_meals WHERE plan_day_id = p_day_id
        ), 0),
        updated_at = now()
    WHERE id = p_day_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour recalculer les totaux du jour
CREATE OR REPLACE FUNCTION meal_plan_meals_update_day_totals()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM calculate_plan_day_totals(COALESCE(NEW.plan_day_id, OLD.plan_day_id));
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS meal_plan_meals_day_totals ON meal_plan_meals;
CREATE TRIGGER meal_plan_meals_day_totals
    AFTER INSERT OR UPDATE OR DELETE ON meal_plan_meals
    FOR EACH ROW
    EXECUTE FUNCTION meal_plan_meals_update_day_totals();

-- Fonction pour dupliquer un plan alimentaire
CREATE OR REPLACE FUNCTION duplicate_meal_plan(
    p_plan_id UUID,
    p_new_patient_id UUID DEFAULT NULL,
    p_new_name VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_old_plan RECORD;
    v_new_plan_id UUID;
    v_day_mapping JSONB := '{}';
    v_old_day_id UUID;
    v_new_day_id UUID;
BEGIN
    -- Récupérer le plan original
    SELECT * INTO v_old_plan FROM meal_plans WHERE id = p_plan_id;

    IF v_old_plan IS NULL THEN
        RAISE EXCEPTION 'Plan not found';
    END IF;

    -- Créer le nouveau plan
    INSERT INTO meal_plans (
        user_id, patient_id, nutritionist_id, name, description,
        total_calories, total_protein, total_carbs, total_fat,
        objective, status, is_template, parent_plan_id, notes
    ) VALUES (
        COALESCE(p_new_patient_id, v_old_plan.user_id),
        COALESCE(p_new_patient_id, v_old_plan.patient_id),
        v_old_plan.nutritionist_id,
        COALESCE(p_new_name, v_old_plan.name || ' (copie)'),
        v_old_plan.description,
        v_old_plan.total_calories, v_old_plan.total_protein,
        v_old_plan.total_carbs, v_old_plan.total_fat,
        v_old_plan.objective,
        'draft',
        false,
        p_plan_id,
        v_old_plan.notes
    )
    RETURNING id INTO v_new_plan_id;

    -- Dupliquer les jours et créer le mapping
    FOR v_old_day_id IN
        SELECT id FROM meal_plan_days WHERE meal_plan_id = p_plan_id ORDER BY day_number
    LOOP
        INSERT INTO meal_plan_days (
            meal_plan_id, day_number, day_name, total_calories,
            total_protein, total_carbs, total_fat, notes
        )
        SELECT
            v_new_plan_id, day_number, day_name, total_calories,
            total_protein, total_carbs, total_fat, notes
        FROM meal_plan_days
        WHERE id = v_old_day_id
        RETURNING id INTO v_new_day_id;

        -- Stocker le mapping
        v_day_mapping := v_day_mapping || jsonb_build_object(v_old_day_id::TEXT, v_new_day_id::TEXT);

        -- Dupliquer les repas du jour
        INSERT INTO meal_plan_meals (
            plan_day_id, meal_type, recipe_id, title, description, image_url,
            calories, protein_g, carbs_g, fat_g, suggested_time, servings, notes, display_order
        )
        SELECT
            v_new_day_id, meal_type, recipe_id, title, description, image_url,
            calories, protein_g, carbs_g, fat_g, suggested_time, servings, notes, display_order
        FROM meal_plan_meals
        WHERE plan_day_id = v_old_day_id;
    END LOOP;

    RETURN v_new_plan_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir l'adhérence au plan
CREATE OR REPLACE FUNCTION get_plan_adherence_stats(
    p_plan_id UUID,
    p_start_date DATE DEFAULT NULL,
    p_end_date DATE DEFAULT NULL
)
RETURNS TABLE (
    total_meals INTEGER,
    followed_meals INTEGER,
    partial_meals INTEGER,
    skipped_meals INTEGER,
    not_tracked_meals INTEGER,
    adherence_rate DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_meals,
        COUNT(*) FILTER (WHERE status = 'followed')::INTEGER AS followed_meals,
        COUNT(*) FILTER (WHERE status = 'partial')::INTEGER AS partial_meals,
        COUNT(*) FILTER (WHERE status = 'skipped')::INTEGER AS skipped_meals,
        COUNT(*) FILTER (WHERE status = 'not_tracked')::INTEGER AS not_tracked_meals,
        ROUND(
            (COUNT(*) FILTER (WHERE status IN ('followed', 'partial'))::DECIMAL /
            NULLIF(COUNT(*) FILTER (WHERE status != 'not_tracked')::DECIMAL, 0) * 100),
            1
        ) AS adherence_rate
    FROM plan_adherence
    WHERE meal_plan_id = p_plan_id
        AND (p_start_date IS NULL OR date >= p_start_date)
        AND (p_end_date IS NULL OR date <= p_end_date);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir le plan actif d'un patient
CREATE OR REPLACE FUNCTION get_active_meal_plan(p_patient_id UUID)
RETURNS TABLE (
    plan_id UUID,
    plan_name VARCHAR,
    start_date DATE,
    end_date DATE,
    current_day INTEGER,
    total_days INTEGER,
    adherence_rate DECIMAL
) AS $$
DECLARE
    v_plan RECORD;
BEGIN
    -- Trouver le plan actif
    SELECT mp.* INTO v_plan
    FROM meal_plans mp
    WHERE mp.patient_id = p_patient_id
        AND mp.status = 'active'
        AND mp.deleted_at IS NULL
        AND (mp.start_date IS NULL OR mp.start_date <= CURRENT_DATE)
        AND (mp.end_date IS NULL OR mp.end_date >= CURRENT_DATE)
    ORDER BY mp.created_at DESC
    LIMIT 1;

    IF v_plan IS NULL THEN
        RETURN;
    END IF;

    RETURN QUERY
    SELECT
        v_plan.id AS plan_id,
        v_plan.name AS plan_name,
        v_plan.start_date,
        v_plan.end_date,
        CASE
            WHEN v_plan.start_date IS NOT NULL
            THEN (CURRENT_DATE - v_plan.start_date + 1)::INTEGER
            ELSE 1
        END AS current_day,
        (SELECT COUNT(*)::INTEGER FROM meal_plan_days WHERE meal_plan_id = v_plan.id) AS total_days,
        COALESCE((SELECT adherence_rate FROM get_plan_adherence_stats(v_plan.id)), 0) AS adherence_rate;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- RLS pour meal_plans (table principale)
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS meal_plans_own ON meal_plans;
CREATE POLICY meal_plans_own ON meal_plans
    FOR ALL USING (
        user_id = auth.uid()
        OR patient_id = auth.uid()
        OR nutritionist_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- RLS pour les tables liées
ALTER TABLE meal_plan_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_meal_foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plan_alternatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_modification_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_adherence ENABLE ROW LEVEL SECURITY;

-- Politiques pour meal_plan_days
DROP POLICY IF EXISTS meal_plan_days_access ON meal_plan_days;
CREATE POLICY meal_plan_days_access ON meal_plan_days
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meal_plans mp
            WHERE mp.id = meal_plan_days.meal_plan_id
            AND (
                mp.user_id = auth.uid()
                OR mp.patient_id = auth.uid()
                OR mp.nutritionist_id = auth.uid()
            )
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour meal_plan_meals
DROP POLICY IF EXISTS meal_plan_meals_access ON meal_plan_meals;
CREATE POLICY meal_plan_meals_access ON meal_plan_meals
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meal_plan_days mpd
            JOIN meal_plans mp ON mp.id = mpd.meal_plan_id
            WHERE mpd.id = meal_plan_meals.plan_day_id
            AND (
                mp.user_id = auth.uid()
                OR mp.patient_id = auth.uid()
                OR mp.nutritionist_id = auth.uid()
            )
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour meal_plan_meal_foods
DROP POLICY IF EXISTS meal_plan_meal_foods_access ON meal_plan_meal_foods;
CREATE POLICY meal_plan_meal_foods_access ON meal_plan_meal_foods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meal_plan_meals mpm
            JOIN meal_plan_days mpd ON mpd.id = mpm.plan_day_id
            JOIN meal_plans mp ON mp.id = mpd.meal_plan_id
            WHERE mpm.id = meal_plan_meal_foods.plan_meal_id
            AND (
                mp.user_id = auth.uid()
                OR mp.patient_id = auth.uid()
                OR mp.nutritionist_id = auth.uid()
            )
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour meal_plan_alternatives
DROP POLICY IF EXISTS meal_plan_alternatives_access ON meal_plan_alternatives;
CREATE POLICY meal_plan_alternatives_access ON meal_plan_alternatives
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM meal_plan_meals mpm
            JOIN meal_plan_days mpd ON mpd.id = mpm.plan_day_id
            JOIN meal_plans mp ON mp.id = mpd.meal_plan_id
            WHERE mpm.id = meal_plan_alternatives.plan_meal_id
            AND (
                mp.user_id = auth.uid()
                OR mp.patient_id = auth.uid()
                OR mp.nutritionist_id = auth.uid()
            )
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour plan_modification_requests
DROP POLICY IF EXISTS plan_modification_requests_patient ON plan_modification_requests;
CREATE POLICY plan_modification_requests_patient ON plan_modification_requests
    FOR ALL USING (
        patient_id = auth.uid()
        OR nutritionist_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour plan_adherence
DROP POLICY IF EXISTS plan_adherence_access ON plan_adherence;
CREATE POLICY plan_adherence_access ON plan_adherence
    FOR ALL USING (
        patient_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM meal_plans mp
            WHERE mp.id = plan_adherence.meal_plan_id
            AND mp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE meal_plan_days IS 'Jours du plan alimentaire avec totaux nutritionnels';
COMMENT ON TABLE meal_plan_meals IS 'Repas planifiés pour chaque jour du plan';
COMMENT ON TABLE meal_plan_meal_foods IS 'Aliments spécifiques pour chaque repas planifié';
COMMENT ON TABLE meal_plan_alternatives IS 'Alternatives suggérées pour les repas/aliments (PLAN-004)';
COMMENT ON TABLE plan_modification_requests IS 'Demandes de modification du plan par le patient (PLAN-005)';
COMMENT ON TABLE plan_adherence IS 'Suivi de l''adhérence au plan alimentaire (PLAN-007)';

COMMENT ON FUNCTION calculate_plan_day_totals IS 'Recalcule les totaux nutritionnels d''un jour de plan';
COMMENT ON FUNCTION duplicate_meal_plan IS 'Duplique un plan alimentaire pour un autre patient ou comme template';
COMMENT ON FUNCTION get_plan_adherence_stats IS 'Calcule les statistiques d''adhérence au plan';
COMMENT ON FUNCTION get_active_meal_plan IS 'Récupère le plan alimentaire actif d''un patient';
