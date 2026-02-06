-- ============================================================================
-- Script de correction: Renommer patient_id en user_id dans la table meals
-- ============================================================================
-- Problème: La base de données utilise patient_id, mais le schéma SQL utilise user_id
-- Solution: Renommer patient_id en user_id pour correspondre au schéma
-- ============================================================================

-- Renommer la colonne patient_id en user_id
ALTER TABLE meals
RENAME COLUMN patient_id TO user_id;

-- Vérifier que le renommage a fonctionné
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'meals'
  AND column_name IN ('user_id', 'patient_id')
ORDER BY column_name;

-- Note: Les index et foreign keys sont automatiquement renommés par PostgreSQL
