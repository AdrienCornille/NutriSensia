-- ============================================================================
-- NutriSensia Database Schema
-- Script 04: Base de Données des Aliments
-- ============================================================================
-- Dépendances: 01_extensions_and_types.sql
-- User Stories: FOOD-001 à FOOD-007, MEAL-008, MEAL-009
-- ============================================================================

-- ===========================================
-- TABLE: food_categories
-- Catégories d'aliments
-- ===========================================

CREATE TABLE IF NOT EXISTS food_categories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identifiant et nom
    slug varchar(50) NOT NULL UNIQUE,
    name_fr varchar(100) NOT NULL,
    name_en varchar(100),
    name_de varchar(100),
    name_it varchar(100),

    -- Affichage
    icon varchar(10),                                -- Emoji
    color varchar(20),                               -- Couleur hex
    sort_order int DEFAULT 0,

    -- Hiérarchie
    parent_id uuid REFERENCES food_categories(id) ON DELETE SET NULL,

    -- Statut
    is_active boolean DEFAULT true,

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_food_categories_slug ON food_categories(slug);
CREATE INDEX IF NOT EXISTS idx_food_categories_parent ON food_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_food_categories_active ON food_categories(is_active);

-- Commentaires
COMMENT ON TABLE food_categories IS 'Catégories d''aliments avec support multilingue';

-- ===========================================
-- TABLE: foods
-- Base de données des aliments
-- ===========================================

CREATE TABLE IF NOT EXISTS foods (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Identification
    barcode varchar(50),                             -- Code-barres EAN/UPC
    external_id varchar(100),                        -- ID externe (OpenFoodFacts, etc.)

    -- Nom et description
    name_fr varchar(200) NOT NULL,
    name_en varchar(200),
    name_de varchar(200),
    name_it varchar(200),
    brand varchar(200),                              -- Marque (si produit industriel)
    description text,

    -- Catégorie
    category_id uuid REFERENCES food_categories(id) ON DELETE SET NULL,

    -- ===========================================
    -- Valeurs nutritionnelles (pour 100g)
    -- ===========================================
    -- Macronutriments
    calories decimal(8,2),                           -- kcal
    proteins decimal(8,2),                           -- g
    carbohydrates decimal(8,2),                      -- g
    sugars decimal(8,2),                             -- g (dont sucres)
    fiber decimal(8,2),                              -- g
    fat decimal(8,2),                                -- g
    saturated_fat decimal(8,2),                      -- g (dont saturés)

    -- Autres macros
    cholesterol decimal(8,2),                        -- mg
    sodium decimal(8,2),                             -- mg
    potassium decimal(8,2),                          -- mg

    -- Vitamines (optionnel)
    vitamin_a decimal(8,2),                          -- µg
    vitamin_c decimal(8,2),                          -- mg
    vitamin_d decimal(8,2),                          -- µg
    vitamin_e decimal(8,2),                          -- mg
    vitamin_k decimal(8,2),                          -- µg
    vitamin_b1 decimal(8,2),                         -- mg (thiamine)
    vitamin_b2 decimal(8,2),                         -- mg (riboflavine)
    vitamin_b3 decimal(8,2),                         -- mg (niacine)
    vitamin_b6 decimal(8,2),                         -- mg
    vitamin_b9 decimal(8,2),                         -- µg (folate)
    vitamin_b12 decimal(8,2),                        -- µg

    -- Minéraux (optionnel)
    calcium decimal(8,2),                            -- mg
    iron decimal(8,2),                               -- mg
    magnesium decimal(8,2),                          -- mg
    phosphorus decimal(8,2),                         -- mg
    zinc decimal(8,2),                               -- mg

    -- ===========================================
    -- Métadonnées
    -- ===========================================
    -- Image
    image_url text,
    thumbnail_url text,

    -- Tags et filtres
    tags text[],                                     -- Ex: ['bio', 'sans gluten', 'vegan']
    allergens text[],                                -- Ex: ['gluten', 'lactose', 'arachides']

    -- Saison (pour fruits/légumes)
    season_months int[],                             -- Ex: [6, 7, 8] pour juin-août

    -- Source des données
    data_source varchar(100),                        -- 'openfoodfacts', 'usda', 'manual', 'nutritionist'
    data_quality varchar(20) DEFAULT 'medium',       -- 'low', 'medium', 'high', 'verified'
    verified_at timestamptz,
    verified_by uuid REFERENCES auth.users(id),

    -- Popularité
    usage_count int DEFAULT 0,                       -- Compteur d'utilisation

    -- Statut
    is_active boolean DEFAULT true,
    is_custom boolean DEFAULT false,                 -- Aliment ajouté par un utilisateur
    created_by uuid REFERENCES auth.users(id),

    -- Audit
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_foods_barcode ON foods(barcode) WHERE barcode IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods(category_id);
CREATE INDEX IF NOT EXISTS idx_foods_active ON foods(is_active);
CREATE INDEX IF NOT EXISTS idx_foods_name_fr ON foods USING gin(name_fr gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_foods_brand ON foods(brand) WHERE brand IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_foods_usage ON foods(usage_count DESC);

-- Index de recherche full-text
CREATE INDEX IF NOT EXISTS idx_foods_search ON foods USING gin(
    to_tsvector('french', coalesce(name_fr, '') || ' ' || coalesce(brand, '') || ' ' || coalesce(description, ''))
);

-- Commentaires
COMMENT ON TABLE foods IS 'Base de données des aliments avec valeurs nutritionnelles complètes';
COMMENT ON COLUMN foods.barcode IS 'Code-barres EAN/UPC pour scan (MEAL-009, FOOD-006)';
COMMENT ON COLUMN foods.data_quality IS 'Qualité des données nutritionnelles';

-- ===========================================
-- TABLE: food_portions
-- Portions standards pour chaque aliment
-- ===========================================

CREATE TABLE IF NOT EXISTS food_portions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    food_id uuid NOT NULL REFERENCES foods(id) ON DELETE CASCADE,

    -- Description de la portion
    name_fr varchar(100) NOT NULL,                   -- Ex: "cuillère à soupe", "tranche"
    name_en varchar(100),
    name_de varchar(100),
    name_it varchar(100),

    -- Quantité
    grams decimal(8,2) NOT NULL,                     -- Poids en grammes

    -- Affichage
    sort_order int DEFAULT 0,
    is_default boolean DEFAULT false,                -- Portion par défaut

    -- Audit
    created_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_food_portions_food ON food_portions(food_id);

-- Commentaires
COMMENT ON TABLE food_portions IS 'Portions standards prédéfinies pour faciliter la saisie (FOOD-004)';

-- ===========================================
-- TABLE: food_favorites
-- Aliments favoris des utilisateurs
-- ===========================================

CREATE TABLE IF NOT EXISTS food_favorites (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_id uuid NOT NULL REFERENCES foods(id) ON DELETE CASCADE,

    -- Usage
    usage_count int DEFAULT 0,                       -- Nombre de fois utilisé
    last_used_at timestamptz,

    -- Audit
    created_at timestamptz DEFAULT now(),

    -- Contrainte d'unicité
    CONSTRAINT unique_user_food_favorite UNIQUE (user_id, food_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_food_favorites_user ON food_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_food_favorites_food ON food_favorites(food_id);
CREATE INDEX IF NOT EXISTS idx_food_favorites_usage ON food_favorites(user_id, usage_count DESC);

-- Commentaires
COMMENT ON TABLE food_favorites IS 'Aliments favoris des utilisateurs (FOOD-005)';

-- ===========================================
-- TABLE: food_search_history
-- Historique des recherches d'aliments
-- ===========================================

CREATE TABLE IF NOT EXISTS food_search_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Recherche
    query varchar(200) NOT NULL,
    results_count int,

    -- Audit
    searched_at timestamptz DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_food_search_user ON food_search_history(user_id);
CREATE INDEX IF NOT EXISTS idx_food_search_recent ON food_search_history(user_id, searched_at DESC);

-- Commentaires
COMMENT ON TABLE food_search_history IS 'Historique des recherches pour suggestions (FOOD-001)';

-- ===========================================
-- TABLE: food_recent
-- Aliments récemment utilisés
-- ===========================================

CREATE TABLE IF NOT EXISTS food_recent (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    food_id uuid NOT NULL REFERENCES foods(id) ON DELETE CASCADE,

    -- Contexte d'utilisation
    meal_type meal_type,

    -- Audit
    used_at timestamptz DEFAULT now(),

    -- Contrainte d'unicité pour éviter les doublons
    CONSTRAINT unique_user_food_recent UNIQUE (user_id, food_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_food_recent_user ON food_recent(user_id);
CREATE INDEX IF NOT EXISTS idx_food_recent_date ON food_recent(user_id, used_at DESC);

-- Commentaires
COMMENT ON TABLE food_recent IS 'Aliments récemment utilisés pour accès rapide (MEAL-008)';

-- ===========================================
-- FONCTIONS
-- ===========================================

-- Fonction de recherche d'aliments (tolérante aux fautes)
CREATE OR REPLACE FUNCTION search_foods(
    search_query text,
    user_id_param uuid DEFAULT NULL,
    limit_count int DEFAULT 20
)
RETURNS TABLE (
    id uuid,
    name_fr varchar,
    brand varchar,
    calories decimal,
    proteins decimal,
    carbohydrates decimal,
    fat decimal,
    category_name varchar,
    is_favorite boolean,
    relevance real
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        f.id,
        f.name_fr,
        f.brand,
        f.calories,
        f.proteins,
        f.carbohydrates,
        f.fat,
        fc.name_fr as category_name,
        CASE WHEN ff.id IS NOT NULL THEN true ELSE false END as is_favorite,
        similarity(f.name_fr, search_query) +
            CASE WHEN f.brand IS NOT NULL THEN similarity(f.brand, search_query) * 0.5 ELSE 0 END as relevance
    FROM foods f
    LEFT JOIN food_categories fc ON f.category_id = fc.id
    LEFT JOIN food_favorites ff ON ff.food_id = f.id AND ff.user_id = user_id_param
    WHERE f.is_active = true
      AND (
          f.name_fr % search_query  -- Similarité trigram
          OR f.brand % search_query
          OR f.name_fr ILIKE '%' || search_query || '%'
          OR f.brand ILIKE '%' || search_query || '%'
      )
    ORDER BY
        CASE WHEN ff.id IS NOT NULL THEN 0 ELSE 1 END,  -- Favoris en premier
        relevance DESC,
        f.usage_count DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour incrémenter le compteur d'utilisation
CREATE OR REPLACE FUNCTION increment_food_usage(food_id_param uuid)
RETURNS void AS $$
BEGIN
    UPDATE foods
    SET usage_count = usage_count + 1,
        updated_at = now()
    WHERE id = food_id_param;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour ajouter un aliment récent
CREATE OR REPLACE FUNCTION add_recent_food(
    user_id_param uuid,
    food_id_param uuid,
    meal_type_param meal_type DEFAULT NULL
)
RETURNS void AS $$
BEGIN
    INSERT INTO food_recent (user_id, food_id, meal_type, used_at)
    VALUES (user_id_param, food_id_param, meal_type_param, now())
    ON CONFLICT (user_id, food_id)
    DO UPDATE SET used_at = now(), meal_type = COALESCE(meal_type_param, food_recent.meal_type);

    -- Garder seulement les 50 derniers
    DELETE FROM food_recent
    WHERE user_id = user_id_param
      AND id NOT IN (
          SELECT id FROM food_recent
          WHERE user_id = user_id_param
          ORDER BY used_at DESC
          LIMIT 50
      );

    -- Incrémenter le compteur d'utilisation
    PERFORM increment_food_usage(food_id_param);
END;
$$ LANGUAGE plpgsql;

-- Trigger updated_at
DROP TRIGGER IF EXISTS trigger_foods_updated_at ON foods;
CREATE TRIGGER trigger_foods_updated_at
    BEFORE UPDATE ON foods
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_food_categories_updated_at ON food_categories;
CREATE TRIGGER trigger_food_categories_updated_at
    BEFORE UPDATE ON food_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- ROW LEVEL SECURITY
-- ===========================================

ALTER TABLE food_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_portions ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_recent ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour idempotence
DROP POLICY IF EXISTS "Anyone can view food categories" ON food_categories;
DROP POLICY IF EXISTS "Anyone can view active foods" ON foods;
DROP POLICY IF EXISTS "Anyone can view food portions" ON food_portions;
DROP POLICY IF EXISTS "Users can view own favorites" ON food_favorites;
DROP POLICY IF EXISTS "Users can manage own favorites" ON food_favorites;
DROP POLICY IF EXISTS "Users can manage own search history" ON food_search_history;
DROP POLICY IF EXISTS "Users can manage own recent foods" ON food_recent;

-- Politiques pour food_categories (lecture publique)
CREATE POLICY "Anyone can view food categories"
    ON food_categories FOR SELECT
    USING (is_active = true);

-- Politiques pour foods (lecture publique pour aliments actifs)
CREATE POLICY "Anyone can view active foods"
    ON foods FOR SELECT
    USING (is_active = true);

-- Politiques pour food_portions (lecture publique)
CREATE POLICY "Anyone can view food portions"
    ON food_portions FOR SELECT
    USING (true);

-- Politiques pour food_favorites
CREATE POLICY "Users can view own favorites"
    ON food_favorites FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can manage own favorites"
    ON food_favorites FOR ALL
    USING (user_id = auth.uid());

-- Politiques pour food_search_history
CREATE POLICY "Users can manage own search history"
    ON food_search_history FOR ALL
    USING (user_id = auth.uid());

-- Politiques pour food_recent
CREATE POLICY "Users can manage own recent foods"
    ON food_recent FOR ALL
    USING (user_id = auth.uid());

-- ===========================================
-- DONNÉES INITIALES - Catégories
-- ===========================================

INSERT INTO food_categories (slug, name_fr, name_en, icon, color, sort_order) VALUES
    ('fruits', 'Fruits', 'Fruits', '🍎', '#FF6B6B', 1),
    ('vegetables', 'Légumes', 'Vegetables', '🥬', '#51CF66', 2),
    ('grains', 'Céréales & Féculents', 'Grains & Starches', '🌾', '#FFD43B', 3),
    ('proteins', 'Protéines', 'Proteins', '🍗', '#FF922B', 4),
    ('dairy', 'Produits laitiers', 'Dairy', '🥛', '#74C0FC', 5),
    ('fats-oils', 'Matières grasses', 'Fats & Oils', '🫒', '#F7DC6F', 6),
    ('sweets', 'Sucreries', 'Sweets', '🍫', '#E599F7', 7),
    ('beverages', 'Boissons', 'Beverages', '🥤', '#63E6BE', 8),
    ('condiments', 'Condiments & Épices', 'Condiments & Spices', '🧂', '#FFA94D', 9),
    ('prepared', 'Plats préparés', 'Prepared Foods', '🍱', '#A9E34B', 10)
ON CONFLICT (slug) DO NOTHING;

-- Sous-catégories pour Protéines
INSERT INTO food_categories (slug, name_fr, name_en, icon, parent_id, sort_order)
SELECT 'meat', 'Viandes', 'Meat', '🥩', id, 1 FROM food_categories WHERE slug = 'proteins'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO food_categories (slug, name_fr, name_en, icon, parent_id, sort_order)
SELECT 'poultry', 'Volailles', 'Poultry', '🍗', id, 2 FROM food_categories WHERE slug = 'proteins'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO food_categories (slug, name_fr, name_en, icon, parent_id, sort_order)
SELECT 'fish', 'Poissons', 'Fish', '🐟', id, 3 FROM food_categories WHERE slug = 'proteins'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO food_categories (slug, name_fr, name_en, icon, parent_id, sort_order)
SELECT 'seafood', 'Fruits de mer', 'Seafood', '🦐', id, 4 FROM food_categories WHERE slug = 'proteins'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO food_categories (slug, name_fr, name_en, icon, parent_id, sort_order)
SELECT 'eggs', 'Œufs', 'Eggs', '🥚', id, 5 FROM food_categories WHERE slug = 'proteins'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO food_categories (slug, name_fr, name_en, icon, parent_id, sort_order)
SELECT 'legumes', 'Légumineuses', 'Legumes', '🫘', id, 6 FROM food_categories WHERE slug = 'proteins'
ON CONFLICT (slug) DO NOTHING;
