-- ============================================================================
-- Migration: Recipe Filter System - Phase 3
-- Description: Populate foods.allergens based on CIQUAL categories and
--              food name patterns. Enable automatic allergen badge detection
--              on recipes ("Sans gluten", "Sans lactose", etc.).
-- PREREQUISITES: 04_foods_database.sql, seed_ciqual_categories.sql,
--                recipe_filter_system_phase2.sql (origin_type)
-- ============================================================================

-- ============================================================================
-- 1. ALLERGEN REFERENCE TABLE (for consistent naming)
-- ============================================================================

CREATE TABLE IF NOT EXISTS allergen_definitions (
    slug VARCHAR(50) PRIMARY KEY,
    name_fr VARCHAR(100) NOT NULL,
    name_en VARCHAR(100),
    display_order INT DEFAULT 0
);

INSERT INTO allergen_definitions (slug, name_fr, name_en, display_order) VALUES
    ('gluten',           'Gluten',              'Gluten',         1),
    ('lactose',          'Lactose',             'Lactose',        2),
    ('oeuf',             'Oeuf',                'Egg',            3),
    ('arachide',         'Arachide',            'Peanut',         4),
    ('fruits-a-coque',   'Fruits a coque',      'Tree nuts',      5),
    ('poisson-crustace', 'Poisson / crustace',  'Fish / shellfish', 6),
    ('soja',             'Soja',                'Soy',            7)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 2. POPULATE foods.allergens BY CATEGORY
--    Category-level defaults: all foods in a given CIQUAL category
--    are assumed to contain that allergen.
-- ============================================================================

-- ── GLUTEN: cereales, pains, pates, farines, biscuits, gateaux, viennoiseries ──
UPDATE foods SET allergens = array_append(COALESCE(allergens, '{}'), 'gluten')
WHERE category_id IN (
  SELECT id FROM food_categories WHERE slug IN (
    'grains',
    'ciqual-0301', -- pates, riz, cereales
    'ciqual-0302', -- pains et assimiles
    'ciqual-0303', -- biscuits aperitifs
    'ciqual-0304', -- farines
    'ciqual-0305', -- pates a tarte
    'ciqual-0705', -- viennoiseries
    'ciqual-0706', -- biscuits sucres
    'ciqual-0707', -- cereales petit-dejeuner
    'ciqual-0708', -- barres cerealieres
    'ciqual-0709'  -- gateaux et patisseries
  )
)
AND NOT ('gluten' = ANY(COALESCE(allergens, '{}')));

-- ── LACTOSE: laits, produits laitiers, fromages, cremes, beurres, glaces ──
UPDATE foods SET allergens = array_append(COALESCE(allergens, '{}'), 'lactose')
WHERE category_id IN (
  SELECT id FROM food_categories WHERE slug IN (
    'dairy',
    'ciqual-0501', -- laits
    'ciqual-0502', -- produits laitiers frais
    'ciqual-0503', -- fromages
    'ciqual-0504', -- cremes
    'ciqual-0901', -- beurres
    'ciqual-0801'  -- glaces
  )
)
AND NOT ('lactose' = ANY(COALESCE(allergens, '{}')));

-- ── OEUF: oeufs, viennoiseries, gateaux, biscuits ──
UPDATE foods SET allergens = array_append(COALESCE(allergens, '{}'), 'oeuf')
WHERE category_id IN (
  SELECT id FROM food_categories WHERE slug IN (
    'eggs',
    'ciqual-0410' -- oeufs
  )
)
AND NOT ('oeuf' = ANY(COALESCE(allergens, '{}')));

-- ── POISSON/CRUSTACE: poissons, fruits de mer, huiles de poissons ──
UPDATE foods SET allergens = array_append(COALESCE(allergens, '{}'), 'poisson-crustace')
WHERE category_id IN (
  SELECT id FROM food_categories WHERE slug IN (
    'fish', 'seafood',
    'ciqual-0405', -- poissons cuits
    'ciqual-0406', -- poissons crus
    'ciqual-0407', -- mollusques et crustaces cuits
    'ciqual-0408', -- mollusques et crustaces crus
    'ciqual-0409', -- produits a base de poissons
    'ciqual-0904'  -- huiles de poissons
  )
)
AND NOT ('poisson-crustace' = ANY(COALESCE(allergens, '{}')));

-- ============================================================================
-- 3. POPULATE foods.allergens BY NAME PATTERNS
--    Catches items in mixed/prepared categories by food name matching.
-- ============================================================================

-- ── GLUTEN by name ──
UPDATE foods SET allergens = array_append(COALESCE(allergens, '{}'), 'gluten')
WHERE (
  lower(name_fr) ~ '(ble|seigle|orge|avoine|epeautre|kamut|farine|pain |pain,|pates |pates,|biscuit|gateau|crepe|galette|brioche|croissant|pizza|quiche|tarte |tarte,|couscous|boulgour|semoul)'
)
AND NOT ('gluten' = ANY(COALESCE(allergens, '{}')))
AND NOT (lower(name_fr) LIKE '%sans gluten%');

-- ── LACTOSE by name ──
UPDATE foods SET allergens = array_append(COALESCE(allergens, '{}'), 'lactose')
WHERE (
  lower(name_fr) ~ '(lait|fromage|yaourt|yogourt|creme fraiche|beurre |beurre,|gruyere|emmental|comte|camembert|roquefort|mozzarella|parmesan|raclette|fondue)'
)
AND NOT ('lactose' = ANY(COALESCE(allergens, '{}')))
AND NOT (lower(name_fr) ~ '(sans lactose|lait de coco|lait d.amande|lait de soja|lait de riz|lait d.avoine)');

-- ── OEUF by name ──
UPDATE foods SET allergens = array_append(COALESCE(allergens, '{}'), 'oeuf')
WHERE (
  lower(name_fr) ~ '(oeuf|omelette|mayonnaise|meringue|quiche|flan |flan,)'
)
AND NOT ('oeuf' = ANY(COALESCE(allergens, '{}')));

-- ── ARACHIDE by name ──
UPDATE foods SET allergens = array_append(COALESCE(allergens, '{}'), 'arachide')
WHERE (
  lower(name_fr) ~ '(arachide|cacahuete|cacahouete|beurre de cacah)'
)
AND NOT ('arachide' = ANY(COALESCE(allergens, '{}')));

-- ── FRUITS A COQUE by name ──
UPDATE foods SET allergens = array_append(COALESCE(allergens, '{}'), 'fruits-a-coque')
WHERE (
  lower(name_fr) ~ '(noix |noix,|noix de cajou|noisette|amande |amande,|pistache|pecan|macadamia|pignon|praline|nougat)'
)
AND NOT ('fruits-a-coque' = ANY(COALESCE(allergens, '{}')))
AND NOT (lower(name_fr) LIKE '%noix de coco%')
AND NOT (lower(name_fr) LIKE '%noix de muscade%');

-- ── SOJA by name ──
UPDATE foods SET allergens = array_append(COALESCE(allergens, '{}'), 'soja')
WHERE (
  lower(name_fr) ~ '(soja|tofu|tempeh|edamame|miso |miso,|sauce soja)'
)
AND NOT ('soja' = ANY(COALESCE(allergens, '{}')));

-- ── POISSON by name (catches fish in prepared/mixed categories) ──
UPDATE foods SET allergens = array_append(COALESCE(allergens, '{}'), 'poisson-crustace')
WHERE (
  lower(name_fr) ~ '(saumon|thon|cabillaud|merlu|sardine|maquereau|truite|sole |sole,|bar |bar,|dorade|loup de mer|anchois|hareng|morue|crevette|crabe|homard|langouste|huitre|moule |moule,|calamar|poulpe|surimi)'
)
AND NOT ('poisson-crustace' = ANY(COALESCE(allergens, '{}')));

-- ============================================================================
-- 4. REMOVE "sans gluten" items from gluten allergen
--    CIQUAL has explicit "sans gluten" products
-- ============================================================================

UPDATE foods SET allergens = array_remove(allergens, 'gluten')
WHERE lower(name_fr) LIKE '%sans gluten%'
AND 'gluten' = ANY(COALESCE(allergens, '{}'));

-- Similarly for "sans lactose"
UPDATE foods SET allergens = array_remove(allergens, 'lactose')
WHERE lower(name_fr) ~ '(sans lactose|teneur reduite en lactose)'
AND 'lactose' = ANY(COALESCE(allergens, '{}'));

-- ============================================================================
-- 5. FINALIZE: set empty array for categorized foods with no allergens detected
--    NULL = unknown (user-created foods without category)
--    {} = confirmed no tracked allergens (categorized CIQUAL foods)
-- ============================================================================

UPDATE foods SET allergens = '{}'
WHERE allergens IS NULL
AND category_id IS NOT NULL;

-- ============================================================================
-- 6. INDEX for allergen array lookups
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_foods_allergens ON foods USING gin(allergens);

-- ============================================================================
-- Done
-- ============================================================================

DO $$
DECLARE
  cnt_gluten INT; cnt_lactose INT; cnt_oeuf INT; cnt_arachide INT;
  cnt_fac INT; cnt_poisson INT; cnt_soja INT; cnt_any INT;
BEGIN
  SELECT count(*) INTO cnt_gluten FROM foods WHERE 'gluten' = ANY(allergens);
  SELECT count(*) INTO cnt_lactose FROM foods WHERE 'lactose' = ANY(allergens);
  SELECT count(*) INTO cnt_oeuf FROM foods WHERE 'oeuf' = ANY(allergens);
  SELECT count(*) INTO cnt_arachide FROM foods WHERE 'arachide' = ANY(allergens);
  SELECT count(*) INTO cnt_fac FROM foods WHERE 'fruits-a-coque' = ANY(allergens);
  SELECT count(*) INTO cnt_poisson FROM foods WHERE 'poisson-crustace' = ANY(allergens);
  SELECT count(*) INTO cnt_soja FROM foods WHERE 'soja' = ANY(allergens);
  SELECT count(*) INTO cnt_any FROM foods WHERE allergens IS NOT NULL AND array_length(allergens, 1) > 0;

  RAISE NOTICE 'Migration recipe_filter_system_phase3 terminee avec succes';
  RAISE NOTICE 'Allergens: gluten=%, lactose=%, oeuf=%, arachide=%, fruits-a-coque=%, poisson=%, soja=%',
    cnt_gluten, cnt_lactose, cnt_oeuf, cnt_arachide, cnt_fac, cnt_poisson, cnt_soja;
  RAISE NOTICE 'Total aliments avec au moins 1 allergene: %', cnt_any;
END $$;
