-- ============================================================================
-- Migration: Recipe Filter System - Phase 1
-- Description: Replace single category with multi-group tag system.
--              Add recipe_auto_tags table for computed badges.
--              Seed all Phase 1 manual tag groups.
-- PREREQUISITES: 05_recipes.sql (recipe_tags, recipe_tag_assignments)
-- ============================================================================

-- ============================================================================
-- 1. RECIPE_AUTO_TAGS TABLE (computed badges: calories, time, nutrition)
-- ============================================================================

CREATE TABLE IF NOT EXISTS recipe_auto_tags (
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    tag_group VARCHAR(30) NOT NULL,   -- 'calories', 'time', 'nutrition'
    tag_value VARCHAR(50) NOT NULL,   -- 'cal-200-300', 'time-lt-30', 'high-protein'
    PRIMARY KEY (recipe_id, tag_group, tag_value)
);

CREATE INDEX IF NOT EXISTS idx_recipe_auto_tags_group
    ON recipe_auto_tags(tag_group, tag_value);

-- RLS
ALTER TABLE recipe_auto_tags ENABLE ROW LEVEL SECURITY;

CREATE POLICY recipe_auto_tags_select ON recipe_auto_tags
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE id = recipe_auto_tags.recipe_id
            AND (status = 'published' OR created_by = auth.uid())
            AND deleted_at IS NULL
        )
    );

CREATE POLICY recipe_auto_tags_manage ON recipe_auto_tags
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM recipes
            WHERE id = recipe_auto_tags.recipe_id
            AND (created_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
        )
    );

-- ============================================================================
-- 2. RECLASSIFY EXISTING TAGS to new group system
--    tag_type becomes the group slug
-- ============================================================================

-- Health tags that become auto-computed (nutrition group) -> deactivate
-- They will be replaced by recipe_auto_tags
UPDATE recipe_tags SET is_active = false
WHERE slug IN ('riche-en-proteines', 'riche-en-fibres', 'pauvre-en-glucides', 'faible-en-sucre', 'pauvre-en-sel', 'omega-3');

-- Reclassify existing tags to new groups
UPDATE recipe_tags SET tag_type = 'wellness' WHERE slug IN ('anti-inflammatoire', 'detox');
UPDATE recipe_tags SET tag_type = 'meal-type' WHERE slug = 'post-entrainement';
UPDATE recipe_tags SET tag_type = 'everyday' WHERE slug IN ('sans-cuisson', 'rapide', 'a-emporter');

-- Keep allergen + diet tags as-is (Phase 2 & 3)
-- 'sans-gluten', 'sans-lactose' -> tag_type = 'allergen' (unchanged)
-- 'vegetarien', 'vegan' -> tag_type = 'diet' (unchanged)

-- ============================================================================
-- 3. SEED NEW TAGS for Phase 1 groups
-- ============================================================================

-- ── Type de repas (meal-type) ──
INSERT INTO recipe_tags (slug, name_fr, name_en, tag_type, color, icon) VALUES
    ('petit-dej',      'Petit-déjeuner',  'Breakfast',      'meal-type', '#8B5CF6', 'sunrise'),
    ('dejeuner',       'Déjeuner',        'Lunch',          'meal-type', '#8B5CF6', 'utensils'),
    ('diner',          'Dîner',           'Dinner',         'meal-type', '#8B5CF6', 'moon'),
    ('encas',          'Encas',           'Snack',          'meal-type', '#8B5CF6', 'cookie')
ON CONFLICT (slug) DO UPDATE SET tag_type = EXCLUDED.tag_type, color = EXCLUDED.color, icon = EXCLUDED.icon;

-- Update existing post-entrainement
UPDATE recipe_tags SET name_fr = 'Post-training', color = '#8B5CF6', icon = 'zap'
WHERE slug = 'post-entrainement';

-- ── Saveurs (flavor) ──
INSERT INTO recipe_tags (slug, name_fr, name_en, tag_type, color, icon) VALUES
    ('sucre',          'Sucré',           'Sweet',          'flavor', '#EC4899', 'candy'),
    ('sale',           'Salé',            'Savory',         'flavor', '#EC4899', 'beef'),
    ('sucre-sale',     'Sucré-salé',      'Sweet & Savory', 'flavor', '#EC4899', 'sparkles')
ON CONFLICT (slug) DO UPDATE SET tag_type = EXCLUDED.tag_type, color = EXCLUDED.color, icon = EXCLUDED.icon;

-- ── Quotidien (everyday) ──
INSERT INTO recipe_tags (slug, name_fr, name_en, tag_type, color, icon) VALUES
    ('meal-prep',      'Meal prep',       'Meal prep',      'everyday', '#6B7280', 'package'),
    ('salades',        'Salades',         'Salads',         'everyday', '#6B7280', 'salad'),
    ('soupes-veloutes','Soupes & veloutés','Soups',         'everyday', '#6B7280', 'soup'),
    ('pates',          'Pâtes',           'Pasta',          'everyday', '#6B7280', 'wheat'),
    ('fait-maison',    'Fait maison',     'Homemade',       'everyday', '#6B7280', 'home'),
    ('apero-healthy',  'Apéro healthy',   'Healthy snacks', 'everyday', '#6B7280', 'glass-water')
ON CONFLICT (slug) DO UPDATE SET tag_type = EXCLUDED.tag_type, color = EXCLUDED.color, icon = EXCLUDED.icon;

-- Update existing reclassified tags
UPDATE recipe_tags SET color = '#6B7280' WHERE slug IN ('sans-cuisson', 'rapide', 'a-emporter') AND tag_type = 'everyday';

-- ── Plaisirs healthy (healthy-treats) ──
INSERT INTO recipe_tags (slug, name_fr, name_en, tag_type, color, icon) VALUES
    ('barres-cookies',  'Barres & cookies', 'Bars & cookies',  'healthy-treats', '#6366F1', 'cookie'),
    ('energy-balls',    'Energy balls',     'Energy balls',    'healthy-treats', '#6366F1', 'circle'),
    ('gateaux',         'Gâteaux',          'Cakes',           'healthy-treats', '#6366F1', 'cake'),
    ('boissons',        'Boissons',         'Drinks',          'healthy-treats', '#6366F1', 'cup-soda'),
    ('glaces',          'Glaces',           'Ice cream',       'healthy-treats', '#6366F1', 'ice-cream-cone'),
    ('smoothies',       'Smoothies',        'Smoothies',       'healthy-treats', '#6366F1', 'glass-water')
ON CONFLICT (slug) DO UPDATE SET tag_type = EXCLUDED.tag_type, color = EXCLUDED.color, icon = EXCLUDED.icon;

-- ── Saison (season) ──
INSERT INTO recipe_tags (slug, name_fr, name_en, tag_type, color, icon) VALUES
    ('printemps',      'Printemps',       'Spring',         'season', '#14B8A6', 'flower'),
    ('ete',            'Été',             'Summer',         'season', '#14B8A6', 'sun'),
    ('automne',        'Automne',         'Fall',           'season', '#14B8A6', 'leaf'),
    ('hiver',          'Hiver',           'Winter',         'season', '#14B8A6', 'snowflake')
ON CONFLICT (slug) DO UPDATE SET tag_type = EXCLUDED.tag_type, color = EXCLUDED.color, icon = EXCLUDED.icon;

-- ── Cuisine du monde (cuisine) ──
INSERT INTO recipe_tags (slug, name_fr, name_en, tag_type, color, icon) VALUES
    ('francaise',      'Française',       'French',         'cuisine', '#F59E0B', 'flag'),
    ('mediterraneenne','Méditerranéenne', 'Mediterranean',  'cuisine', '#F59E0B', 'sun'),
    ('orientale',      'Orientale',       'Middle Eastern', 'cuisine', '#F59E0B', 'lamp'),
    ('asiatique',      'Asiatique',       'Asian',          'cuisine', '#F59E0B', 'utensils-crossed'),
    ('mexicaine',      'Mexicaine',       'Mexican',        'cuisine', '#F59E0B', 'pepper'),
    ('suisse',         'Suisse',          'Swiss',          'cuisine', '#F59E0B', 'mountain')
ON CONFLICT (slug) DO UPDATE SET tag_type = EXCLUDED.tag_type, color = EXCLUDED.color, icon = EXCLUDED.icon;

-- ── Occasion (occasion) ──
INSERT INTO recipe_tags (slug, name_fr, name_en, tag_type, color, icon) VALUES
    ('paques',         'Pâques',          'Easter',         'occasion', '#F472B6', 'egg'),
    ('noel',           'Noël',            'Christmas',      'occasion', '#F472B6', 'gift'),
    ('halloween',      'Halloween',       'Halloween',      'occasion', '#F472B6', 'ghost'),
    ('saint-valentin', 'Saint-Valentin',  'Valentine',      'occasion', '#F472B6', 'heart'),
    ('famille',        'Famille',         'Family',         'occasion', '#F472B6', 'users'),
    ('brunch',         'Brunch',          'Brunch',         'occasion', '#F472B6', 'coffee')
ON CONFLICT (slug) DO UPDATE SET tag_type = EXCLUDED.tag_type, color = EXCLUDED.color, icon = EXCLUDED.icon;

-- ── Bien-etre (wellness) ──
-- 'anti-inflammatoire' and 'detox' already reclassified above
INSERT INTO recipe_tags (slug, name_fr, name_en, tag_type, color, icon) VALUES
    ('digestion-confort', 'Digestion & confort', 'Digestion & comfort', 'wellness', '#10B981', 'heart-pulse'),
    ('energie-recuperation', 'Énergie & récupération', 'Energy & recovery', 'wellness', '#10B981', 'battery-charging')
ON CONFLICT (slug) DO UPDATE SET tag_type = EXCLUDED.tag_type, color = EXCLUDED.color, icon = EXCLUDED.icon;

-- Update colors for reclassified wellness tags
UPDATE recipe_tags SET color = '#10B981' WHERE slug IN ('anti-inflammatoire', 'detox') AND tag_type = 'wellness';

-- ============================================================================
-- 4. DEPRECATE category_id (keep column, stop using)
-- ============================================================================

COMMENT ON COLUMN recipes.category_id IS 'DEPRECATED: Use recipe_tag_assignments with tag_type=meal-type instead';

-- ============================================================================
-- Done
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Migration recipe_filter_system_phase1 terminee avec succes';
  RAISE NOTICE 'Tables creees: recipe_auto_tags';
  RAISE NOTICE 'Tags seeds: meal-type(5), flavor(3), everyday(9), healthy-treats(6), season(4), cuisine(6), occasion(6), wellness(4)';
  RAISE NOTICE 'Tags desactives: 6 health tags (remplaces par auto-tags)';
END $$;
