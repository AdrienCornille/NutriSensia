-- ============================================================================
-- Script de correction: Renommer patient_id en user_id dans daily_nutrition_summary
-- ============================================================================
-- Problème: La table daily_nutrition_summary utilise patient_id au lieu de user_id
-- Solution: Renommer patient_id en user_id pour correspondre au schéma
-- ============================================================================

-- ÉTAPE 1: Vérifier quelle colonne existe actuellement
DO $$
DECLARE
    has_patient_id BOOLEAN;
    has_user_id BOOLEAN;
BEGIN
    -- Vérifier si patient_id existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_nutrition_summary'
        AND column_name = 'patient_id'
    ) INTO has_patient_id;

    -- Vérifier si user_id existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_nutrition_summary'
        AND column_name = 'user_id'
    ) INTO has_user_id;

    RAISE NOTICE 'patient_id exists: %', has_patient_id;
    RAISE NOTICE 'user_id exists: %', has_user_id;

    -- ÉTAPE 2: Renommer si nécessaire
    IF has_patient_id AND NOT has_user_id THEN
        RAISE NOTICE 'Renaming patient_id to user_id...';
        EXECUTE 'ALTER TABLE daily_nutrition_summary RENAME COLUMN patient_id TO user_id';
        RAISE NOTICE 'Column renamed successfully!';
    ELSIF has_user_id THEN
        RAISE NOTICE 'Column user_id already exists, no action needed';
    ELSE
        RAISE EXCEPTION 'Neither patient_id nor user_id found in daily_nutrition_summary table!';
    END IF;
END $$;

-- ÉTAPE 3: Vérifier le résultat final
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'daily_nutrition_summary'
  AND column_name IN ('user_id', 'patient_id')
ORDER BY column_name;
