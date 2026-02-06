-- Migration: Ajouter colonne sleep_hours à wellbeing_logs
-- Date: 2026-02-01
-- Module: 2.4 - Bien-être (Wellbeing Tracking)
-- Description: Ajoute une colonne pour stocker les heures de sommeil réelles
--              en complément de sleep_quality (échelle 1-10)

-- ============================================================================
-- 1. Ajouter colonne sleep_hours
-- ============================================================================

ALTER TABLE wellbeing_logs
ADD COLUMN IF NOT EXISTS sleep_hours DECIMAL(3,1)
CHECK (sleep_hours >= 0 AND sleep_hours <= 24);

-- ============================================================================
-- 2. Créer index pour sleep_hours (optionnel mais utile pour filtrage futur)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_wellbeing_logs_sleep
ON wellbeing_logs(sleep_hours);

-- ============================================================================
-- 3. Vérifier le résultat
-- ============================================================================

-- Afficher la structure de la table
SELECT
    column_name,
    data_type,
    character_maximum_length,
    numeric_precision,
    numeric_scale,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'wellbeing_logs'
ORDER BY ordinal_position;

-- ============================================================================
-- 4. Test d'insertion (optionnel - à commenter pour production)
-- ============================================================================

/*
-- Test: Vérifier que la colonne accepte les valeurs valides
INSERT INTO wellbeing_logs (
    user_id,
    date,
    energy_level,
    sleep_hours,
    sleep_quality,
    mood,
    digestion
) VALUES (
    (SELECT id FROM profiles LIMIT 1),  -- User ID de test
    CURRENT_DATE,
    8,
    7.5,
    9,
    'good',
    'excellent'
);

-- Vérifier l'insertion
SELECT * FROM wellbeing_logs
WHERE date = CURRENT_DATE
ORDER BY created_at DESC
LIMIT 1;
*/
