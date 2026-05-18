-- ============================================================================
-- Migration: Recipe Filter System - Phase 2
-- Description: Add food origin classification for automatic diet detection
--              (vegan, vegetarian, pescatarian, paleo).
-- PREREQUISITES: 04_foods_database.sql, seed_ciqual_categories.sql
-- ============================================================================

-- ============================================================================
-- 1. ADD origin_type COLUMN to foods table
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'foods' AND column_name = 'origin_type'
  ) THEN
    ALTER TABLE foods ADD COLUMN origin_type VARCHAR(20);
  END IF;
END $$;

COMMENT ON COLUMN foods.origin_type IS
  'Food origin: animal, dairy, egg, fish, seafood, plant, mixed, unknown. Used for diet detection.';

-- ============================================================================
-- 2. POPULATE origin_type based on CIQUAL sub-categories
--    Strategy: set origin on foods via their category_id -> food_categories.slug
-- ============================================================================

-- ── ANIMAL (meat, poultry) ──
UPDATE foods SET origin_type = 'animal'
WHERE category_id IN (
  SELECT id FROM food_categories WHERE slug IN (
    'meat', 'poultry',
    'ciqual-0401', -- viandes cuites
    'ciqual-0402', -- viandes crues
    'ciqual-0404'  -- autres produits a base de viande
  )
) AND origin_type IS NULL;

-- ── FISH ──
UPDATE foods SET origin_type = 'fish'
WHERE category_id IN (
  SELECT id FROM food_categories WHERE slug IN (
    'fish',
    'ciqual-0405', -- poissons cuits
    'ciqual-0406', -- poissons crus
    'ciqual-0409', -- produits a base de poissons
    'ciqual-0904'  -- huiles de poissons
  )
) AND origin_type IS NULL;

-- ── SEAFOOD ──
UPDATE foods SET origin_type = 'seafood'
WHERE category_id IN (
  SELECT id FROM food_categories WHERE slug IN (
    'seafood',
    'ciqual-0407', -- mollusques et crustaces cuits
    'ciqual-0408'  -- mollusques et crustaces crus
  )
) AND origin_type IS NULL;

-- ── EGG ──
UPDATE foods SET origin_type = 'egg'
WHERE category_id IN (
  SELECT id FROM food_categories WHERE slug IN (
    'eggs',
    'ciqual-0410' -- oeufs
  )
) AND origin_type IS NULL;

-- ── DAIRY ──
UPDATE foods SET origin_type = 'dairy'
WHERE category_id IN (
  SELECT id FROM food_categories WHERE slug IN (
    'dairy',
    'ciqual-0501', -- laits
    'ciqual-0504', -- cremes
    'ciqual-0901'  -- beurres
  )
) AND origin_type IS NULL;

-- ── PLANT ──
UPDATE foods SET origin_type = 'plant'
WHERE category_id IN (
  SELECT id FROM food_categories WHERE slug IN (
    'fruits', 'vegetables', 'grains', 'legumes',
    'ciqual-0201', -- legumes
    'ciqual-0202', -- pommes de terre
    'ciqual-0203', -- legumineuses
    'ciqual-0204', -- fruits
    'ciqual-0205', -- fruits a coque et graines
    'ciqual-0301', -- pates, riz, cereales
    'ciqual-0302', -- pains
    'ciqual-0303', -- biscuits aperitifs
    'ciqual-0304', -- farines
    'ciqual-0305', -- pates a tarte
    'ciqual-0411', -- alternatives vegetales aux produits carnes
    'ciqual-0601', -- eaux
    'ciqual-0602', -- boissons sans alcool
    'ciqual-0603', -- boissons alcoolisees
    'ciqual-0701', -- sucres, miels
    'ciqual-0704', -- confitures
    'ciqual-0802', -- sorbets
    'ciqual-0902', -- huiles vegetales
    'ciqual-0903', -- margarines
    'ciqual-1001', -- sauces
    'ciqual-1002', -- condiments
    'ciqual-1003', -- aides culinaires
    'ciqual-1004', -- sels
    'ciqual-1005', -- epices
    'ciqual-1006', -- herbes
    'ciqual-1007', -- algues
    'ciqual-1009', -- ingredients pour vegetariens
    'ciqual-1010'  -- tartinables vegetariens
  )
) AND origin_type IS NULL;

-- ── MIXED (categories that can contain both animal and plant products) ──
UPDATE foods SET origin_type = 'mixed'
WHERE category_id IN (
  SELECT id FROM food_categories WHERE slug IN (
    'prepared',
    'ciqual-0101', -- salades composees
    'ciqual-0102', -- soupes
    'ciqual-0103', -- plats composes
    'ciqual-0104', -- pizzas, tartes
    'ciqual-0105', -- sandwichs
    'ciqual-0106', -- feuilletees
    'ciqual-0403', -- charcuteries et alternatives vegetales
    'ciqual-0502', -- produits laitiers frais et alternatives vegetales
    'ciqual-0503', -- fromages et alternatives vegetales
    'ciqual-0702', -- chocolats (peut contenir lait)
    'ciqual-0703', -- confiseries
    'ciqual-0705', -- viennoiseries (beurre, oeufs)
    'ciqual-0706', -- biscuits sucres
    'ciqual-0707', -- cereales petit-dejeuner
    'ciqual-0708', -- barres cerealieres
    'ciqual-0709', -- gateaux et patisseries
    'ciqual-0801', -- glaces
    'ciqual-0803', -- desserts glaces
    'ciqual-0905', -- autres matieres grasses
    'ciqual-1008', -- denrees alimentation particuliere
    'ciqual-1101', -- laits infantiles
    'ciqual-1102', -- petits pots infantiles
    'ciqual-1103', -- desserts infantiles
    'ciqual-1104'  -- cereales infantiles
  )
) AND origin_type IS NULL;

-- ── Fallback: anything still NULL gets 'unknown' ──
UPDATE foods SET origin_type = 'unknown' WHERE origin_type IS NULL;

-- ============================================================================
-- 3. ADD is_override column to recipe_tag_assignments for semi-auto tags
-- ============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipe_tag_assignments' AND column_name = 'is_override'
  ) THEN
    ALTER TABLE recipe_tag_assignments ADD COLUMN is_override BOOLEAN DEFAULT false;
  END IF;
END $$;

COMMENT ON COLUMN recipe_tag_assignments.is_override IS
  'True if nutritionist manually overrode an auto-suggested diet tag';

-- ============================================================================
-- 4. INDEX for fast origin lookups
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_foods_origin_type ON foods(origin_type);

-- ============================================================================
-- Done
-- ============================================================================

DO $$
DECLARE
  cnt_animal INT; cnt_fish INT; cnt_seafood INT; cnt_egg INT;
  cnt_dairy INT; cnt_plant INT; cnt_mixed INT; cnt_unknown INT;
BEGIN
  SELECT count(*) INTO cnt_animal FROM foods WHERE origin_type = 'animal';
  SELECT count(*) INTO cnt_fish FROM foods WHERE origin_type = 'fish';
  SELECT count(*) INTO cnt_seafood FROM foods WHERE origin_type = 'seafood';
  SELECT count(*) INTO cnt_egg FROM foods WHERE origin_type = 'egg';
  SELECT count(*) INTO cnt_dairy FROM foods WHERE origin_type = 'dairy';
  SELECT count(*) INTO cnt_plant FROM foods WHERE origin_type = 'plant';
  SELECT count(*) INTO cnt_mixed FROM foods WHERE origin_type = 'mixed';
  SELECT count(*) INTO cnt_unknown FROM foods WHERE origin_type = 'unknown';

  RAISE NOTICE 'Migration recipe_filter_system_phase2 terminee avec succes';
  RAISE NOTICE 'Origin mapping: animal=%, fish=%, seafood=%, egg=%, dairy=%, plant=%, mixed=%, unknown=%',
    cnt_animal, cnt_fish, cnt_seafood, cnt_egg, cnt_dairy, cnt_plant, cnt_mixed, cnt_unknown;
END $$;
