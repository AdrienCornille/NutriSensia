-- ============================================================================
-- NutriSensia Database Schema - 05 Recipes
-- ============================================================================
-- Phase 3: Recettes
-- Dépendances: 01_extensions_and_types.sql, 02_patient_nutritionist.sql, 04_foods_database.sql
-- User Stories: REC-001 à REC-008
-- ============================================================================

-- ============================================================================
-- TABLE: recipe_categories
-- Description: Catégories de recettes (petit-déjeuner, déjeuner, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    slug VARCHAR(50) NOT NULL UNIQUE,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),

    -- Affichage
    emoji VARCHAR(10),
    icon VARCHAR(50),
    display_order INTEGER DEFAULT 0,

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER recipe_categories_updated_at
    BEFORE UPDATE ON recipe_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_recipe_categories_slug ON recipe_categories(slug);
CREATE INDEX idx_recipe_categories_active ON recipe_categories(is_active) WHERE is_active = true;

-- Données initiales
INSERT INTO recipe_categories (slug, name_fr, name_en, emoji, display_order) VALUES
    ('petit-dejeuner', 'Petit-déjeuner', 'Breakfast', '🌅', 1),
    ('dejeuner', 'Déjeuner', 'Lunch', '☀️', 2),
    ('diner', 'Dîner', 'Dinner', '🌙', 3),
    ('collation', 'Collation', 'Snack', '🍎', 4),
    ('dessert', 'Dessert', 'Dessert', '🍰', 5),
    ('boisson', 'Boisson', 'Beverage', '🥤', 6)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- TABLE: recipe_tags
-- Description: Tags pour les recettes (sans gluten, végan, etc.)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    slug VARCHAR(50) NOT NULL UNIQUE,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),

    -- Classification
    tag_type VARCHAR(30) DEFAULT 'diet', -- 'diet', 'allergen', 'health', 'cuisine', 'other'

    -- Affichage
    color VARCHAR(7), -- Couleur hex
    icon VARCHAR(50),

    -- Metadata
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_recipe_tags_slug ON recipe_tags(slug);
CREATE INDEX idx_recipe_tags_type ON recipe_tags(tag_type);

-- Données initiales - Tags diététiques
INSERT INTO recipe_tags (slug, name_fr, name_en, tag_type, color) VALUES
    ('sans-gluten', 'Sans gluten', 'Gluten-free', 'allergen', '#FFA500'),
    ('sans-lactose', 'Sans lactose', 'Lactose-free', 'allergen', '#87CEEB'),
    ('vegetarien', 'Végétarien', 'Vegetarian', 'diet', '#228B22'),
    ('vegan', 'Végan', 'Vegan', 'diet', '#32CD32'),
    ('pauvre-en-sel', 'Pauvre en sel', 'Low sodium', 'health', '#6495ED'),
    ('riche-en-proteines', 'Riche en protéines', 'High protein', 'health', '#DC143C'),
    ('riche-en-fibres', 'Riche en fibres', 'High fiber', 'health', '#8B4513'),
    ('faible-en-sucre', 'Faible en sucre', 'Low sugar', 'health', '#FFB6C1'),
    ('pauvre-en-glucides', 'Pauvre en glucides', 'Low carb', 'health', '#DEB887'),
    ('omega-3', 'Riche en Oméga-3', 'Rich in Omega-3', 'health', '#4682B4'),
    ('anti-inflammatoire', 'Anti-inflammatoire', 'Anti-inflammatory', 'health', '#FF6347'),
    ('detox', 'Détox', 'Detox', 'health', '#90EE90'),
    ('sans-cuisson', 'Sans cuisson', 'No cooking', 'other', '#FFD700'),
    ('rapide', 'Rapide', 'Quick', 'other', '#FF4500'),
    ('a-emporter', 'À emporter', 'To go', 'other', '#9370DB'),
    ('post-entrainement', 'Post-entraînement', 'Post-workout', 'health', '#FF8C00')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- TABLE: recipes
-- Description: Recettes avec instructions et infos nutritionnelles
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    category_id UUID REFERENCES recipe_categories(id) ON DELETE SET NULL,

    -- Informations de base
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(200) NOT NULL UNIQUE,
    description TEXT,

    -- Médias
    image_url TEXT,
    video_url TEXT,

    -- Caractéristiques
    difficulty recipe_difficulty NOT NULL DEFAULT 'easy',
    prep_time_minutes INTEGER NOT NULL DEFAULT 0,
    cook_time_minutes INTEGER NOT NULL DEFAULT 0,
    total_time_minutes INTEGER GENERATED ALWAYS AS (prep_time_minutes + cook_time_minutes) STORED,
    servings INTEGER DEFAULT 2,

    -- Informations nutritionnelles (par portion)
    calories INTEGER,
    protein_g DECIMAL(6, 2),
    carbs_g DECIMAL(6, 2),
    fat_g DECIMAL(6, 2),
    fiber_g DECIMAL(6, 2),
    sugar_g DECIMAL(6, 2),
    sodium_mg DECIMAL(8, 2),

    -- Notes et évaluations
    average_rating DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,

    -- Conseils et astuces
    tips TEXT,

    -- Source et attribution
    source VARCHAR(200), -- URL ou nom de la source originale
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL, -- Nutritionniste qui a créé
    is_official BOOLEAN DEFAULT false, -- Recette officielle NutriSensia

    -- Recommandation
    is_recommended BOOLEAN DEFAULT false,
    recommended_for TEXT[], -- Conditions/objectifs recommandés

    -- Publication
    status recipe_status DEFAULT 'draft',
    published_at TIMESTAMPTZ,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    deleted_at TIMESTAMPTZ
);

-- Trigger pour updated_at
CREATE TRIGGER recipes_updated_at
    BEFORE UPDATE ON recipes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_recipes_category ON recipes(category_id);
CREATE INDEX idx_recipes_slug ON recipes(slug);
CREATE INDEX idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX idx_recipes_status ON recipes(status);
CREATE INDEX idx_recipes_rating ON recipes(average_rating DESC);
CREATE INDEX idx_recipes_recommended ON recipes(is_recommended) WHERE is_recommended = true;
CREATE INDEX idx_recipes_created_by ON recipes(created_by);
CREATE INDEX idx_recipes_published ON recipes(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_recipes_search ON recipes USING gin(to_tsvector('french', title || ' ' || COALESCE(description, '')));

-- ============================================================================
-- TABLE: recipe_tag_assignments
-- Description: Association recettes-tags (many-to-many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_tag_assignments (
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES recipe_tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (recipe_id, tag_id)
);

-- Index
CREATE INDEX idx_recipe_tag_assignments_recipe ON recipe_tag_assignments(recipe_id);
CREATE INDEX idx_recipe_tag_assignments_tag ON recipe_tag_assignments(tag_id);

-- ============================================================================
-- TABLE: recipe_ingredients
-- Description: Ingrédients des recettes avec quantités
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_ingredients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    food_id UUID REFERENCES foods(id) ON DELETE SET NULL, -- Lien optionnel vers la base d'aliments

    -- Ingrédient
    name VARCHAR(200) NOT NULL, -- Nom affiché (peut différer du food)
    quantity VARCHAR(50) NOT NULL, -- Ex: "200g", "2 c. à soupe", "1"
    quantity_value DECIMAL(10, 2), -- Valeur numérique pour calculs
    quantity_unit VARCHAR(30), -- Unité normalisée

    -- Options
    is_optional BOOLEAN DEFAULT false,
    substitution_notes TEXT, -- Notes de substitution possibles

    -- Groupe/section
    group_name VARCHAR(100), -- Ex: "Pour la sauce", "Pour la garniture"
    display_order INTEGER DEFAULT 0,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER recipe_ingredients_updated_at
    BEFORE UPDATE ON recipe_ingredients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_recipe_ingredients_recipe ON recipe_ingredients(recipe_id);
CREATE INDEX idx_recipe_ingredients_food ON recipe_ingredients(food_id);
CREATE INDEX idx_recipe_ingredients_order ON recipe_ingredients(recipe_id, display_order);

-- ============================================================================
-- TABLE: recipe_steps
-- Description: Étapes de préparation des recettes
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

    -- Contenu
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,

    -- Médias optionnels
    image_url TEXT,
    video_url TEXT,

    -- Timing optionnel
    duration_minutes INTEGER,

    -- Notes
    tips TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(recipe_id, step_number)
);

-- Trigger pour updated_at
CREATE TRIGGER recipe_steps_updated_at
    BEFORE UPDATE ON recipe_steps
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_recipe_steps_recipe ON recipe_steps(recipe_id, step_number);

-- ============================================================================
-- TABLE: recipe_favorites
-- Description: Recettes favorites des utilisateurs
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité
    UNIQUE(user_id, recipe_id)
);

-- Index
CREATE INDEX idx_recipe_favorites_user ON recipe_favorites(user_id);
CREATE INDEX idx_recipe_favorites_recipe ON recipe_favorites(recipe_id);
CREATE INDEX idx_recipe_favorites_date ON recipe_favorites(created_at DESC);

-- ============================================================================
-- TABLE: recipe_ratings
-- Description: Évaluations des recettes par les utilisateurs
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

    -- Évaluation
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contrainte d'unicité (un utilisateur ne peut noter qu'une fois)
    UNIQUE(user_id, recipe_id)
);

-- Trigger pour updated_at
CREATE TRIGGER recipe_ratings_updated_at
    BEFORE UPDATE ON recipe_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_recipe_ratings_user ON recipe_ratings(user_id);
CREATE INDEX idx_recipe_ratings_recipe ON recipe_ratings(recipe_id);
CREATE INDEX idx_recipe_ratings_date ON recipe_ratings(created_at DESC);

-- ============================================================================
-- TABLE: recipe_history
-- Description: Historique des recettes consultées/préparées
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Liaisons
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,

    -- Type d'interaction
    action_type VARCHAR(20) NOT NULL DEFAULT 'viewed', -- 'viewed', 'cooked', 'shared'

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index
CREATE INDEX idx_recipe_history_user ON recipe_history(user_id, created_at DESC);
CREATE INDEX idx_recipe_history_recipe ON recipe_history(recipe_id);
CREATE INDEX idx_recipe_history_action ON recipe_history(user_id, action_type);

-- ============================================================================
-- TABLE: recipe_collections
-- Description: Collections personnalisées de recettes
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Propriétaire
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Informations
    name VARCHAR(100) NOT NULL,
    description TEXT,
    cover_image_url TEXT,

    -- Visibilité
    is_public BOOLEAN DEFAULT false,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE TRIGGER recipe_collections_updated_at
    BEFORE UPDATE ON recipe_collections
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX idx_recipe_collections_user ON recipe_collections(user_id);
CREATE INDEX idx_recipe_collections_public ON recipe_collections(is_public) WHERE is_public = true;

-- ============================================================================
-- TABLE: recipe_collection_items
-- Description: Recettes dans les collections
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_collection_items (
    collection_id UUID REFERENCES recipe_collections(id) ON DELETE CASCADE,
    recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    added_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (collection_id, recipe_id)
);

-- Index
CREATE INDEX idx_recipe_collection_items_collection ON recipe_collection_items(collection_id);
CREATE INDEX idx_recipe_collection_items_recipe ON recipe_collection_items(recipe_id);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Fonction pour mettre à jour la note moyenne d'une recette
CREATE OR REPLACE FUNCTION update_recipe_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Mise à jour de la note moyenne et du nombre d'évaluations
    UPDATE recipes
    SET
        average_rating = (
            SELECT COALESCE(AVG(rating)::DECIMAL(3,2), 0)
            FROM recipe_ratings
            WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
        ),
        rating_count = (
            SELECT COUNT(*)
            FROM recipe_ratings
            WHERE recipe_id = COALESCE(NEW.recipe_id, OLD.recipe_id)
        ),
        updated_at = now()
    WHERE id = COALESCE(NEW.recipe_id, OLD.recipe_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger pour mettre à jour la note moyenne
CREATE TRIGGER recipe_ratings_update_average
    AFTER INSERT OR UPDATE OR DELETE ON recipe_ratings
    FOR EACH ROW
    EXECUTE FUNCTION update_recipe_rating();

-- Fonction de recherche de recettes
CREATE OR REPLACE FUNCTION search_recipes(
    p_query TEXT DEFAULT NULL,
    p_category_id UUID DEFAULT NULL,
    p_difficulty recipe_difficulty DEFAULT NULL,
    p_max_time INTEGER DEFAULT NULL,
    p_tag_ids UUID[] DEFAULT NULL,
    p_max_calories INTEGER DEFAULT NULL,
    p_min_protein DECIMAL DEFAULT NULL,
    p_limit INTEGER DEFAULT 20,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    recipe_id UUID,
    title VARCHAR(200),
    slug VARCHAR(200),
    description TEXT,
    image_url TEXT,
    category_name VARCHAR(100),
    difficulty recipe_difficulty,
    total_time INTEGER,
    calories INTEGER,
    protein DECIMAL,
    average_rating DECIMAL,
    rating_count INTEGER,
    is_recommended BOOLEAN,
    relevance REAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT
        r.id AS recipe_id,
        r.title,
        r.slug,
        r.description,
        r.image_url,
        rc.name_fr AS category_name,
        r.difficulty,
        r.total_time_minutes AS total_time,
        r.calories,
        r.protein_g AS protein,
        r.average_rating,
        r.rating_count,
        r.is_recommended,
        CASE
            WHEN p_query IS NOT NULL THEN
                ts_rank(to_tsvector('french', r.title || ' ' || COALESCE(r.description, '')),
                       plainto_tsquery('french', p_query))
            ELSE 1.0
        END AS relevance
    FROM recipes r
    LEFT JOIN recipe_categories rc ON r.category_id = rc.id
    LEFT JOIN recipe_tag_assignments rta ON r.id = rta.recipe_id
    WHERE r.status = 'published'
        AND r.deleted_at IS NULL
        AND (p_query IS NULL OR to_tsvector('french', r.title || ' ' || COALESCE(r.description, '')) @@ plainto_tsquery('french', p_query))
        AND (p_category_id IS NULL OR r.category_id = p_category_id)
        AND (p_difficulty IS NULL OR r.difficulty = p_difficulty)
        AND (p_max_time IS NULL OR r.total_time_minutes <= p_max_time)
        AND (p_max_calories IS NULL OR r.calories <= p_max_calories)
        AND (p_min_protein IS NULL OR r.protein_g >= p_min_protein)
        AND (p_tag_ids IS NULL OR rta.tag_id = ANY(p_tag_ids))
    ORDER BY
        relevance DESC,
        r.average_rating DESC,
        r.created_at DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les recettes recommandées pour un utilisateur
CREATE OR REPLACE FUNCTION get_recommended_recipes(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    recipe_id UUID,
    title VARCHAR(200),
    reason TEXT
) AS $$
BEGIN
    -- Pour l'instant, retourne les recettes recommandées générales
    -- TODO: Implémenter la personnalisation basée sur le profil patient
    RETURN QUERY
    SELECT
        r.id AS recipe_id,
        r.title,
        'Recommandé pour vous'::TEXT AS reason
    FROM recipes r
    WHERE r.status = 'published'
        AND r.deleted_at IS NULL
        AND r.is_recommended = true
    ORDER BY r.average_rating DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE recipe_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_tag_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_collection_items ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour idempotence
DROP POLICY IF EXISTS recipe_categories_select ON recipe_categories;
DROP POLICY IF EXISTS recipe_categories_manage ON recipe_categories;
DROP POLICY IF EXISTS recipe_tags_select ON recipe_tags;
DROP POLICY IF EXISTS recipe_tags_manage ON recipe_tags;
DROP POLICY IF EXISTS recipes_select_published ON recipes;
DROP POLICY IF EXISTS recipes_select_own ON recipes;
DROP POLICY IF EXISTS recipes_insert_nutritionist ON recipes;
DROP POLICY IF EXISTS recipes_update_own ON recipes;
DROP POLICY IF EXISTS recipes_delete_own ON recipes;
DROP POLICY IF EXISTS recipe_tag_assignments_select ON recipe_tag_assignments;
DROP POLICY IF EXISTS recipe_tag_assignments_manage ON recipe_tag_assignments;
DROP POLICY IF EXISTS recipe_ingredients_select ON recipe_ingredients;
DROP POLICY IF EXISTS recipe_ingredients_manage ON recipe_ingredients;
DROP POLICY IF EXISTS recipe_steps_select ON recipe_steps;
DROP POLICY IF EXISTS recipe_steps_manage ON recipe_steps;
DROP POLICY IF EXISTS recipe_favorites_own ON recipe_favorites;
DROP POLICY IF EXISTS recipe_ratings_select ON recipe_ratings;
DROP POLICY IF EXISTS recipe_ratings_manage_own ON recipe_ratings;
DROP POLICY IF EXISTS recipe_history_own ON recipe_history;
DROP POLICY IF EXISTS recipe_collections_own ON recipe_collections;
DROP POLICY IF EXISTS recipe_collections_select_public ON recipe_collections;
DROP POLICY IF EXISTS recipe_collection_items_own ON recipe_collection_items;
DROP POLICY IF EXISTS recipe_collection_items_select_public ON recipe_collection_items;

-- Politiques pour recipe_categories (lecture publique)
CREATE POLICY recipe_categories_select ON recipe_categories
    FOR SELECT USING (is_active = true);

CREATE POLICY recipe_categories_manage ON recipe_categories
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour recipe_tags (lecture publique)
CREATE POLICY recipe_tags_select ON recipe_tags
    FOR SELECT USING (is_active = true);

CREATE POLICY recipe_tags_manage ON recipe_tags
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour recipes
CREATE POLICY recipes_select_published ON recipes
    FOR SELECT USING (
        status = 'published'
        AND deleted_at IS NULL
    );

CREATE POLICY recipes_select_own ON recipes
    FOR SELECT USING (
        created_by = auth.uid()
        AND deleted_at IS NULL
    );

CREATE POLICY recipes_insert_nutritionist ON recipes
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('nutritionist', 'admin'))
    );

CREATE POLICY recipes_update_own ON recipes
    FOR UPDATE USING (
        created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY recipes_delete_own ON recipes
    FOR DELETE USING (
        created_by = auth.uid()
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour recipe_tag_assignments (suit les recettes)
CREATE POLICY recipe_tag_assignments_select ON recipe_tag_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE id = recipe_tag_assignments.recipe_id
            AND (status = 'published' OR created_by = auth.uid())
            AND deleted_at IS NULL
        )
    );

CREATE POLICY recipe_tag_assignments_manage ON recipe_tag_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE id = recipe_tag_assignments.recipe_id
            AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
        )
    );

-- Politiques pour recipe_ingredients (suit les recettes)
CREATE POLICY recipe_ingredients_select ON recipe_ingredients
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE id = recipe_ingredients.recipe_id
            AND (status = 'published' OR created_by = auth.uid())
            AND deleted_at IS NULL
        )
    );

CREATE POLICY recipe_ingredients_manage ON recipe_ingredients
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE id = recipe_ingredients.recipe_id
            AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
        )
    );

-- Politiques pour recipe_steps (suit les recettes)
CREATE POLICY recipe_steps_select ON recipe_steps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE id = recipe_steps.recipe_id
            AND (status = 'published' OR created_by = auth.uid())
            AND deleted_at IS NULL
        )
    );

CREATE POLICY recipe_steps_manage ON recipe_steps
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE id = recipe_steps.recipe_id
            AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
        )
    );

-- Politiques pour recipe_favorites
CREATE POLICY recipe_favorites_own ON recipe_favorites
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour recipe_ratings
CREATE POLICY recipe_ratings_select ON recipe_ratings
    FOR SELECT USING (true); -- Tout le monde peut voir les notes

CREATE POLICY recipe_ratings_manage_own ON recipe_ratings
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour recipe_history
CREATE POLICY recipe_history_own ON recipe_history
    FOR ALL USING (user_id = auth.uid());

-- Politiques pour recipe_collections
CREATE POLICY recipe_collections_own ON recipe_collections
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY recipe_collections_select_public ON recipe_collections
    FOR SELECT USING (is_public = true);

-- Politiques pour recipe_collection_items
CREATE POLICY recipe_collection_items_own ON recipe_collection_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM recipe_collections
            WHERE id = recipe_collection_items.collection_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY recipe_collection_items_select_public ON recipe_collection_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recipe_collections
            WHERE id = recipe_collection_items.collection_id
            AND is_public = true
        )
    );

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE recipe_categories IS 'Catégories de recettes (petit-déjeuner, déjeuner, etc.)';
COMMENT ON TABLE recipe_tags IS 'Tags pour les recettes (régimes, allergènes, etc.)';
COMMENT ON TABLE recipes IS 'Recettes avec instructions et informations nutritionnelles';
COMMENT ON TABLE recipe_tag_assignments IS 'Association many-to-many recettes-tags';
COMMENT ON TABLE recipe_ingredients IS 'Ingrédients des recettes avec quantités';
COMMENT ON TABLE recipe_steps IS 'Étapes de préparation des recettes';
COMMENT ON TABLE recipe_favorites IS 'Recettes favorites des utilisateurs';
COMMENT ON TABLE recipe_ratings IS 'Évaluations des recettes par les utilisateurs';
COMMENT ON TABLE recipe_history IS 'Historique des recettes consultées/préparées';
COMMENT ON TABLE recipe_collections IS 'Collections personnalisées de recettes';
COMMENT ON TABLE recipe_collection_items IS 'Recettes dans les collections';
