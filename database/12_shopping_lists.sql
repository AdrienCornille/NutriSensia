-- ============================================================================
-- NutriSensia Database Schema - 12 Shopping Lists
-- ============================================================================
-- Phase 10: Listes de Courses
-- Dépendances: 01_extensions_and_types.sql, 02_patient_nutritionist.sql, 04_foods_database.sql, 05_recipes.sql, 10_meal_plans_enhanced.sql
-- User Stories: PLAN-006, REC-007, REC-008
-- ============================================================================

-- ============================================================================
-- TABLE: shopping_lists
-- Description: Listes de courses générées ou manuelles
-- ============================================================================

CREATE TABLE IF NOT EXISTS shopping_lists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Propriétaire
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Informations
    name VARCHAR(200) NOT NULL DEFAULT 'Ma liste de courses',
    description TEXT,

    -- Période couverte
    week_start DATE,
    week_end DATE,

    -- Source (d'où vient la liste)
    source_type VARCHAR(30) DEFAULT 'manual', -- 'manual', 'meal_plan', 'recipe', 'mixed'
    source_meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE SET NULL,

    -- Statut
    is_active BOOLEAN DEFAULT true,
    completed_at TIMESTAMPTZ,

    -- Partage
    shared_link_token VARCHAR(100),
    shared_link_expires_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER shopping_lists_updated_at
    BEFORE UPDATE ON shopping_lists
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_shopping_lists_user ON shopping_lists(user_id);
CREATE INDEX idx_shopping_lists_active ON shopping_lists(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_shopping_lists_week ON shopping_lists(user_id, week_start);
CREATE INDEX idx_shopping_lists_share_token ON shopping_lists(shared_link_token) WHERE shared_link_token IS NOT NULL;

-- ============================================================================
-- TABLE: shopping_list_categories
-- Description: Catégories dans une liste de courses
-- ============================================================================

CREATE TABLE IF NOT EXISTS shopping_list_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liste parente
    shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,

    -- Catégorie
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    color VARCHAR(20),

    -- Ordre
    display_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_shopping_list_categories_list ON shopping_list_categories(shopping_list_id, display_order);

-- Catégories par défaut (utilisées lors de la création)
-- Note: Ces données seront insérées programmatiquement lors de la création de liste

-- ============================================================================
-- TABLE: shopping_list_items
-- Description: Articles des listes de courses
-- ============================================================================

CREATE TABLE IF NOT EXISTS shopping_list_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liste parente
    shopping_list_id UUID NOT NULL REFERENCES shopping_lists(id) ON DELETE CASCADE,
    category_id UUID REFERENCES shopping_list_categories(id) ON DELETE SET NULL,

    -- Article
    name VARCHAR(200) NOT NULL,
    quantity VARCHAR(50),
    quantity_value DECIMAL(10, 2),
    unit VARCHAR(30),

    -- Lien vers aliment/recette (optionnel)
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL,
    recipe_id UUID REFERENCES recipes(id) ON DELETE SET NULL,

    -- Statut
    is_checked BOOLEAN DEFAULT false,
    checked_at TIMESTAMPTZ,

    -- Notes
    notes TEXT,

    -- Ordre
    display_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER shopping_list_items_updated_at
    BEFORE UPDATE ON shopping_list_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_shopping_list_items_list ON shopping_list_items(shopping_list_id);
CREATE INDEX idx_shopping_list_items_category ON shopping_list_items(category_id);
CREATE INDEX idx_shopping_list_items_checked ON shopping_list_items(shopping_list_id, is_checked);
CREATE INDEX idx_shopping_list_items_food ON shopping_list_items(food_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour générer une liste de courses depuis un plan alimentaire
CREATE OR REPLACE FUNCTION generate_shopping_list_from_plan(
    p_user_id UUID,
    p_meal_plan_id UUID,
    p_list_name VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_list_id UUID;
    v_plan RECORD;
    v_category_id UUID;
    v_category_name VARCHAR;
BEGIN
    -- Récupérer les infos du plan
    SELECT * INTO v_plan FROM meal_plans WHERE id = p_meal_plan_id;

    IF v_plan IS NULL THEN
        RAISE EXCEPTION 'Meal plan not found';
    END IF;

    -- Créer la liste
    INSERT INTO shopping_lists (
        user_id, name, source_type, source_meal_plan_id,
        week_start, week_end
    ) VALUES (
        p_user_id,
        COALESCE(p_list_name, 'Liste pour ' || v_plan.name),
        'meal_plan',
        p_meal_plan_id,
        v_plan.start_date,
        v_plan.end_date
    )
    RETURNING id INTO v_list_id;

    -- Créer les catégories par défaut
    INSERT INTO shopping_list_categories (shopping_list_id, name, icon, display_order)
    VALUES
        (v_list_id, 'Fruits & Légumes', '🥬', 1),
        (v_list_id, 'Protéines', '🥩', 2),
        (v_list_id, 'Produits laitiers', '🧀', 3),
        (v_list_id, 'Épicerie', '🥫', 4),
        (v_list_id, 'Surgelés', '❄️', 5),
        (v_list_id, 'Autres', '📦', 6);

    -- Agréger les ingrédients des recettes du plan
    INSERT INTO shopping_list_items (
        shopping_list_id, category_id, name, quantity, food_id, recipe_id
    )
    SELECT DISTINCT ON (ri.name)
        v_list_id,
        (SELECT id FROM shopping_list_categories WHERE shopping_list_id = v_list_id AND name = 'Autres'),
        ri.name,
        ri.quantity,
        ri.food_id,
        mpm.recipe_id
    FROM meal_plan_days mpd
    JOIN meal_plan_meals mpm ON mpm.plan_day_id = mpd.id
    JOIN recipes r ON r.id = mpm.recipe_id
    JOIN recipe_ingredients ri ON ri.recipe_id = r.id
    WHERE mpd.meal_plan_id = p_meal_plan_id;

    -- Agréger les aliments directs du plan
    INSERT INTO shopping_list_items (
        shopping_list_id, category_id, name, quantity, quantity_value, unit, food_id
    )
    SELECT DISTINCT ON (COALESCE(f.name_fr, mpmf.custom_name))
        v_list_id,
        (SELECT id FROM shopping_list_categories WHERE shopping_list_id = v_list_id AND name = 'Autres'),
        COALESCE(f.name_fr, mpmf.custom_name),
        mpmf.quantity::VARCHAR || ' ' || mpmf.unit,
        mpmf.quantity,
        mpmf.unit,
        mpmf.food_id
    FROM meal_plan_days mpd
    JOIN meal_plan_meals mpm ON mpm.plan_day_id = mpd.id
    JOIN meal_plan_meal_foods mpmf ON mpmf.plan_meal_id = mpm.id
    LEFT JOIN foods f ON f.id = mpmf.food_id
    WHERE mpd.meal_plan_id = p_meal_plan_id
    ON CONFLICT DO NOTHING;

    RETURN v_list_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour ajouter les ingrédients d'une recette à la liste
CREATE OR REPLACE FUNCTION add_recipe_to_shopping_list(
    p_list_id UUID,
    p_recipe_id UUID
)
RETURNS INTEGER AS $$
DECLARE
    v_count INTEGER := 0;
    v_category_id UUID;
BEGIN
    -- Récupérer la catégorie "Autres"
    SELECT id INTO v_category_id
    FROM shopping_list_categories
    WHERE shopping_list_id = p_list_id AND name = 'Autres';

    -- Si pas de catégorie, en créer une
    IF v_category_id IS NULL THEN
        INSERT INTO shopping_list_categories (shopping_list_id, name, display_order)
        VALUES (p_list_id, 'Autres', 99)
        RETURNING id INTO v_category_id;
    END IF;

    -- Ajouter les ingrédients
    INSERT INTO shopping_list_items (shopping_list_id, category_id, name, quantity, food_id, recipe_id)
    SELECT
        p_list_id,
        v_category_id,
        ri.name,
        ri.quantity,
        ri.food_id,
        p_recipe_id
    FROM recipe_ingredients ri
    WHERE ri.recipe_id = p_recipe_id
    AND NOT EXISTS (
        SELECT 1 FROM shopping_list_items sli
        WHERE sli.shopping_list_id = p_list_id
        AND LOWER(sli.name) = LOWER(ri.name)
    );

    GET DIAGNOSTICS v_count = ROW_COUNT;
    RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir la progression de la liste
CREATE OR REPLACE FUNCTION get_shopping_list_progress(p_list_id UUID)
RETURNS TABLE (
    total_items INTEGER,
    checked_items INTEGER,
    percentage INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*)::INTEGER AS total_items,
        COUNT(*) FILTER (WHERE is_checked = true)::INTEGER AS checked_items,
        CASE
            WHEN COUNT(*) > 0
            THEN ROUND((COUNT(*) FILTER (WHERE is_checked = true)::DECIMAL / COUNT(*) * 100))::INTEGER
            ELSE 0
        END AS percentage
    FROM shopping_list_items
    WHERE shopping_list_id = p_list_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un lien de partage
CREATE OR REPLACE FUNCTION generate_shopping_list_share_link(
    p_list_id UUID,
    p_expires_in_days INTEGER DEFAULT 7
)
RETURNS VARCHAR AS $$
DECLARE
    v_token VARCHAR;
BEGIN
    -- Générer un token unique
    v_token := encode(gen_random_bytes(32), 'hex');

    -- Mettre à jour la liste
    UPDATE shopping_lists
    SET
        shared_link_token = v_token,
        shared_link_expires_at = now() + (p_expires_in_days || ' days')::INTERVAL,
        updated_at = now()
    WHERE id = p_list_id;

    RETURN v_token;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE shopping_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopping_list_items ENABLE ROW LEVEL SECURITY;

-- Politiques pour shopping_lists
DROP POLICY IF EXISTS shopping_lists_own ON shopping_lists;
CREATE POLICY shopping_lists_own ON shopping_lists
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politique pour accès via lien de partage (lecture seule)
DROP POLICY IF EXISTS shopping_lists_shared ON shopping_lists;
CREATE POLICY shopping_lists_shared ON shopping_lists
    FOR SELECT USING (
        shared_link_token IS NOT NULL
        AND (shared_link_expires_at IS NULL OR shared_link_expires_at > now())
    );

-- Politiques pour shopping_list_categories
DROP POLICY IF EXISTS shopping_list_categories_via_list ON shopping_list_categories;
CREATE POLICY shopping_list_categories_via_list ON shopping_list_categories
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shopping_lists sl
            WHERE sl.id = shopping_list_categories.shopping_list_id
            AND sl.user_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour shopping_list_items
DROP POLICY IF EXISTS shopping_list_items_via_list ON shopping_list_items;
CREATE POLICY shopping_list_items_via_list ON shopping_list_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM shopping_lists sl
            WHERE sl.id = shopping_list_items.shopping_list_id
            AND sl.user_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE shopping_lists IS 'Listes de courses générées ou manuelles';
COMMENT ON TABLE shopping_list_categories IS 'Catégories dans une liste de courses';
COMMENT ON TABLE shopping_list_items IS 'Articles des listes de courses';

COMMENT ON FUNCTION generate_shopping_list_from_plan IS 'Génère une liste de courses depuis un plan alimentaire (PLAN-006)';
COMMENT ON FUNCTION add_recipe_to_shopping_list IS 'Ajoute les ingrédients d''une recette à la liste (REC-007, REC-008)';
COMMENT ON FUNCTION get_shopping_list_progress IS 'Calcule la progression de la liste';
COMMENT ON FUNCTION generate_shopping_list_share_link IS 'Génère un lien de partage pour la liste';
