-- ============================================================================
-- Script de migration: Renommer patient_id en user_id pour tables hydratation
-- À exécuter dans Supabase SQL Editor
-- ============================================================================
--
-- IMPORTANT: Ce script renomme UNIQUEMENT les colonnes patient_id en user_id
-- pour les tables liées à l'hydratation.
--
-- Tables concernées:
-- - hydration_logs
-- - hydration_goals
--
-- Les tables meals conservent user_id (pas de changement)
--
-- ============================================================================

-- ============================================================================
-- 1. Table: hydration_logs
-- ============================================================================

-- Renommer la colonne patient_id en user_id
ALTER TABLE hydration_logs
RENAME COLUMN patient_id TO user_id;

-- Mettre à jour les index existants
-- Supprimer les anciens index sur patient_id s'ils existent
DROP INDEX IF EXISTS idx_hydration_logs_patient;
DROP INDEX IF EXISTS idx_hydration_logs_patient_date;

-- Créer de nouveaux index sur user_id
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user ON hydration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user_date ON hydration_logs(user_id, date DESC);

-- Mettre à jour les RLS policies
DROP POLICY IF EXISTS hydration_logs_own ON hydration_logs;

CREATE POLICY hydration_logs_own ON hydration_logs
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = hydration_logs.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- 2. Table: hydration_goals
-- ============================================================================

-- Renommer la colonne patient_id en user_id
ALTER TABLE hydration_goals
RENAME COLUMN patient_id TO user_id;

-- Mettre à jour les index existants
-- Supprimer les anciens index sur patient_id s'ils existent
DROP INDEX IF EXISTS idx_hydration_goals_patient;
DROP INDEX IF EXISTS idx_hydration_goals_patient_current;

-- Créer de nouveaux index sur user_id
CREATE INDEX IF NOT EXISTS idx_hydration_goals_user ON hydration_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_goals_user_current ON hydration_goals(user_id, valid_from, valid_until);

-- Mettre à jour les RLS policies
DROP POLICY IF EXISTS hydration_goals_own ON hydration_goals;

CREATE POLICY hydration_goals_own ON hydration_goals
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = hydration_goals.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- 3. Mettre à jour la fonction SQL get_daily_hydration
-- ============================================================================

DROP FUNCTION IF EXISTS get_daily_hydration(UUID, DATE);

CREATE OR REPLACE FUNCTION get_daily_hydration(
    p_user_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    date DATE,
    total_ml INT,
    goal_ml INT,
    percentage INT,
    log_count INT
) AS $$
DECLARE
    v_goal_ml INT;
BEGIN
    -- Récupérer l'objectif du jour
    SELECT daily_goal_ml INTO v_goal_ml
    FROM hydration_goals
    WHERE user_id = p_user_id
      AND valid_from <= p_date
      AND (valid_until IS NULL OR valid_until >= p_date)
    ORDER BY created_at DESC
    LIMIT 1;

    -- Valeur par défaut si aucun objectif
    v_goal_ml := COALESCE(v_goal_ml, 2000);

    RETURN QUERY
    SELECT
        p_date as date,
        COALESCE(SUM(hl.amount_ml)::INT, 0) as total_ml,
        v_goal_ml as goal_ml,
        CASE
            WHEN v_goal_ml > 0 THEN ROUND((COALESCE(SUM(hl.amount_ml), 0) / v_goal_ml) * 100)::INT
            ELSE 0
        END as percentage,
        COUNT(hl.id)::INT as log_count
    FROM hydration_logs hl
    WHERE hl.user_id = p_user_id
      AND hl.date = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. Vérification
-- ============================================================================

-- Vérifier que les colonnes ont été renommées
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('user_id', 'patient_id')
  AND table_name IN ('hydration_logs', 'hydration_goals')
ORDER BY table_name, column_name;

-- Résultat attendu:
-- hydration_goals | user_id
-- hydration_logs  | user_id

-- Vérifier que les index existent
SELECT
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('hydration_logs', 'hydration_goals')
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
  AND tablename IN ('hydration_logs', 'hydration_goals')
ORDER BY tablename, policyname;

-- ============================================================================
-- Test rapide
-- ============================================================================

-- Tester que la fonction fonctionne
-- SELECT * FROM get_daily_hydration('<your-user-id>', CURRENT_DATE);

-- Vérifier qu'un utilisateur peut voir ses propres logs
-- SELECT * FROM hydration_logs WHERE user_id = auth.uid() LIMIT 5;

-- Vérifier qu'un utilisateur peut voir son objectif
-- SELECT * FROM hydration_goals WHERE user_id = auth.uid() LIMIT 1;

-- ============================================================================
-- Notes d'exécution
-- ============================================================================
--
-- 1. Ce script renomme UNIQUEMENT les tables hydratation
-- 2. Les tables meals conservent user_id (pas de changement)
-- 3. Sauvegarder la base de données avant d'exécuter ce script
-- 4. Exécuter ce script dans Supabase SQL Editor
-- 5. Vérifier les résultats avec les requêtes de vérification ci-dessus
-- 6. Tester l'application après la migration
-- 7. Si des erreurs surviennent, restaurer la sauvegarde
--
-- Ce script est idempotent: il peut être exécuté plusieurs fois sans danger
-- (DROP IF EXISTS, CREATE IF NOT EXISTS)
--
-- ============================================================================
