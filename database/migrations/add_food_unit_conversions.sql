-- ============================================================================
-- Migration: food_unit_conversions
-- Ajout du support multi-unités avec conversions exactes
-- ============================================================================

-- Table de conversions d'unités par aliment ou par catégorie
CREATE TABLE IF NOT EXISTS food_unit_conversions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Ciblage: soit un aliment spécifique, soit une catégorie (fallback)
    food_id UUID REFERENCES foods(id) ON DELETE CASCADE,
    food_category_id UUID REFERENCES food_categories(id) ON DELETE CASCADE,

    -- Unité et conversion
    unit VARCHAR(30) NOT NULL,           -- clé technique: g, ml, c_a_s, c_a_c, tasse, portion, piece
    label VARCHAR(50) NOT NULL,          -- affichage: grammes, millilitres, cuillère à soupe, etc.
    gram_equivalent DECIMAL(8,3) NOT NULL, -- 1 unité = X grammes pour cet aliment/catégorie

    -- Audit
    created_at TIMESTAMPTZ DEFAULT now(),

    -- Au moins food_id ou food_category_id doit être renseigné
    CONSTRAINT chk_food_or_category CHECK (food_id IS NOT NULL OR food_category_id IS NOT NULL)
);

-- Index uniques partiels pour éviter les doublons
CREATE UNIQUE INDEX IF NOT EXISTS idx_food_unit_conv_food
    ON food_unit_conversions(food_id, unit) WHERE food_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_food_unit_conv_category
    ON food_unit_conversions(food_category_id, unit) WHERE food_category_id IS NOT NULL AND food_id IS NULL;

-- Index de recherche
CREATE INDEX IF NOT EXISTS idx_food_unit_conv_food_id ON food_unit_conversions(food_id);
CREATE INDEX IF NOT EXISTS idx_food_unit_conv_category_id ON food_unit_conversions(food_category_id);

COMMENT ON TABLE food_unit_conversions IS 'Conversions d''unités vers grammes, par aliment ou catégorie';
COMMENT ON COLUMN food_unit_conversions.gram_equivalent IS '1 unité = X grammes. Ex: pour lait entier, ml -> 1.030 signifie 1ml = 1.030g';
