-- ============================================================================
-- Script de migration: Renommer patient_id en user_id pour table meals
-- À exécuter dans Supabase SQL Editor
-- ============================================================================
--
-- IMPORTANT: Ce script renomme la colonne patient_id en user_id
-- pour la table meals et toutes les tables/fonctions associées.
--
-- Tables concernées:
-- - meals
-- - daily_nutrition_summary (si existe)
--
-- ============================================================================

-- ============================================================================
-- 1. Table: meals
-- ============================================================================

-- Renommer la colonne patient_id en user_id
ALTER TABLE meals
RENAME COLUMN patient_id TO user_id;

-- Mettre à jour les index existants
-- Supprimer les anciens index sur patient_id s'ils existent
DROP INDEX IF EXISTS idx_meals_patient_id;
DROP INDEX IF EXISTS idx_meals_patient_date;

-- Créer de nouveaux index sur user_id
CREATE INDEX IF NOT EXISTS idx_meals_user_id ON meals(user_id);
CREATE INDEX IF NOT EXISTS idx_meals_user_date ON meals(user_id, meal_date DESC);

-- Mettre à jour les RLS policies
DROP POLICY IF EXISTS meals_own ON meals;

CREATE POLICY meals_own ON meals
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'nutritionist'
            AND EXISTS (
                SELECT 1 FROM patient_profiles pp
                WHERE pp.user_id = meals.user_id
                AND pp.nutritionist_id = auth.uid()
            )
        )
        OR EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- ============================================================================
-- 2. Table: daily_nutrition_summary (si existe)
-- ============================================================================

-- Vérifier si la table existe avant de la migrer
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'daily_nutrition_summary'
    ) THEN
        -- Vérifier si la colonne patient_id existe
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'daily_nutrition_summary'
            AND column_name = 'patient_id'
        ) THEN
            -- Renommer la colonne
            ALTER TABLE daily_nutrition_summary
            RENAME COLUMN patient_id TO user_id;

            -- Mettre à jour les index
            DROP INDEX IF EXISTS idx_daily_nutrition_patient_date;
            CREATE INDEX IF NOT EXISTS idx_daily_nutrition_user_date
                ON daily_nutrition_summary(user_id, date DESC);

            -- Mettre à jour les RLS policies
            DROP POLICY IF EXISTS daily_nutrition_summary_own ON daily_nutrition_summary;

            CREATE POLICY daily_nutrition_summary_own ON daily_nutrition_summary
                FOR ALL USING (
                    user_id = auth.uid()
                    OR EXISTS (
                        SELECT 1 FROM profiles
                        WHERE id = auth.uid()
                        AND role = 'nutritionist'
                        AND EXISTS (
                            SELECT 1 FROM patient_profiles pp
                            WHERE pp.user_id = daily_nutrition_summary.user_id
                            AND pp.nutritionist_id = auth.uid()
                        )
                    )
                    OR EXISTS (
                        SELECT 1 FROM profiles
                        WHERE id = auth.uid()
                        AND role = 'admin'
                    )
                );
        END IF;
    END IF;
END $$;

-- ============================================================================
-- 3. Mettre à jour les fonctions SQL qui utilisent patient_id
-- ============================================================================

-- Fonction: get_daily_nutrition
-- Cette fonction doit être mise à jour pour utiliser user_id

DROP FUNCTION IF EXISTS get_daily_nutrition(UUID, DATE);

CREATE OR REPLACE FUNCTION get_daily_nutrition(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    date DATE,
    total_calories INT,
    total_protein NUMERIC,
    total_carbs NUMERIC,
    total_fat NUMERIC,
    meal_count INT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        p_date as date,
        COALESCE(SUM(m.total_calories)::INT, 0) as total_calories,
        COALESCE(SUM(m.total_protein), 0) as total_protein,
        COALESCE(SUM(m.total_carbs), 0) as total_carbs,
        COALESCE(SUM(m.total_fat), 0) as total_fat,
        COUNT(m.id)::INT as meal_count
    FROM meals m
    WHERE m.user_id = p_user_id
      AND m.meal_date = p_date
      AND m.deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. Mettre à jour les triggers
-- ============================================================================

-- Trigger pour mettre à jour daily_nutrition_summary après insertion/update/delete de meals
-- Ce trigger doit utiliser user_id au lieu de patient_id

DROP TRIGGER IF EXISTS update_daily_nutrition_summary_trigger ON meals;
DROP FUNCTION IF EXISTS update_daily_nutrition_summary();

-- Vérifier si la table daily_nutrition_summary existe avant de créer le trigger
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'daily_nutrition_summary'
    ) THEN
        -- Créer la fonction trigger
        CREATE OR REPLACE FUNCTION update_daily_nutrition_summary()
        RETURNS TRIGGER AS $trigger$
        DECLARE
            v_user_id UUID;
            v_meal_date DATE;
        BEGIN
            -- Déterminer user_id et meal_date selon l'opération
            IF TG_OP = 'DELETE' THEN
                v_user_id := OLD.user_id;
                v_meal_date := OLD.meal_date;
            ELSE
                v_user_id := NEW.user_id;
                v_meal_date := NEW.meal_date;
            END IF;

            -- Recalculer le summary pour ce jour
            INSERT INTO daily_nutrition_summary (user_id, date, total_calories, total_protein, total_carbs, total_fat)
            SELECT
                v_user_id,
                v_meal_date,
                COALESCE(SUM(total_calories), 0),
                COALESCE(SUM(total_protein), 0),
                COALESCE(SUM(total_carbs), 0),
                COALESCE(SUM(total_fat), 0)
            FROM meals
            WHERE user_id = v_user_id
              AND meal_date = v_meal_date
              AND deleted_at IS NULL
            ON CONFLICT (user_id, date)
            DO UPDATE SET
                total_calories = EXCLUDED.total_calories,
                total_protein = EXCLUDED.total_protein,
                total_carbs = EXCLUDED.total_carbs,
                total_fat = EXCLUDED.total_fat,
                updated_at = NOW();

            RETURN NULL;
        END;
        $trigger$ LANGUAGE plpgsql;

        -- Créer le trigger
        CREATE TRIGGER update_daily_nutrition_summary_trigger
            AFTER INSERT OR UPDATE OR DELETE ON meals
            FOR EACH ROW
            EXECUTE FUNCTION update_daily_nutrition_summary();
    END IF;
END $$;

-- ============================================================================
-- 5. Vérification
-- ============================================================================

-- Vérifier que les colonnes ont été renommées
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('user_id', 'patient_id')
  AND table_name IN ('meals', 'daily_nutrition_summary')
ORDER BY table_name, column_name;

-- Résultat attendu:
-- meals                     | user_id
-- daily_nutrition_summary   | user_id (si la table existe)

-- Vérifier que les index existent
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('meals', 'daily_nutrition_summary')
  AND indexdef LIKE '%user_id%'
ORDER BY tablename, indexname;

-- Vérifier les RLS policies
SELECT
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('meals', 'daily_nutrition_summary')
ORDER BY tablename, policyname;

-- Vérifier les triggers
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table = 'meals'
ORDER BY trigger_name;

-- ============================================================================
-- Test rapide
-- ============================================================================

-- Tester que la fonction fonctionne
-- SELECT * FROM get_daily_nutrition(auth.uid(), CURRENT_DATE);

-- Vérifier qu'un utilisateur peut voir ses propres repas
-- SELECT * FROM meals WHERE user_id = auth.uid() LIMIT 5;

-- ============================================================================
-- Notes d'exécution
-- ============================================================================
--
-- 1. Ce script renomme patient_id → user_id dans la table meals
-- 2. Sauvegarder la base de données avant d'exécuter ce script
-- 3. Exécuter ce script dans Supabase SQL Editor
-- 4. Vérifier les résultats avec les requêtes de vérification ci-dessus
-- 5. Tester l'application après la migration
-- 6. Si des erreurs surviennent, restaurer la sauvegarde
--
-- Ce script est idempotent: il peut être exécuté plusieurs fois sans danger
-- (DROP IF EXISTS, CREATE IF NOT EXISTS, DO $$ BEGIN IF EXISTS...)
--
-- ============================================================================
