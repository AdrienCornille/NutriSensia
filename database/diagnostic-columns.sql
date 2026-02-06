-- ============================================================================
-- Script de diagnostic: Vérifier les colonnes des tables meals
-- ============================================================================
-- Ce script liste toutes les colonnes des tables liées aux repas
-- pour identifier les différences avec le schéma SQL
-- ============================================================================

-- Table meals
SELECT 'meals' AS table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'meals'
  AND column_name LIKE '%user%' OR column_name LIKE '%patient%'
ORDER BY ordinal_position;

-- Table meal_foods
SELECT 'meal_foods' AS table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'meal_foods'
  AND column_name LIKE '%user%' OR column_name LIKE '%patient%'
ORDER BY ordinal_position;

-- Table daily_nutrition_summary
SELECT 'daily_nutrition_summary' AS table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'daily_nutrition_summary'
ORDER BY ordinal_position;

-- Table user_settings
SELECT 'user_settings' AS table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_settings'
  AND column_name LIKE '%calor%' OR column_name LIKE '%protein%' OR column_name LIKE '%carb%' OR column_name LIKE '%fat%'
ORDER BY ordinal_position;
