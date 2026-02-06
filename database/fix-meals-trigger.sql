-- ============================================================================
-- Script de correction: Trigger meals_update_daily_summary
-- ============================================================================
-- Problème: Le trigger pourrait utiliser patient_id alors que la colonne doit être user_id
-- Solution: Recréer le trigger avec user_id (après avoir renommé la colonne)
-- ============================================================================
-- IMPORTANT: Exécutez d'abord fix-rename-patient-id-to-user-id.sql avant ce script
-- ============================================================================

-- Supprimer l'ancien trigger
DROP TRIGGER IF EXISTS meals_daily_summary_trigger ON meals;

-- Recréer la fonction avec user_id
CREATE OR REPLACE FUNCTION meals_update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour le résumé pour la date concernée
    IF TG_OP = 'DELETE' THEN
        PERFORM update_daily_nutrition_summary(OLD.user_id, OLD.meal_date);
    ELSE
        PERFORM update_daily_nutrition_summary(NEW.user_id, NEW.meal_date);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER meals_daily_summary_trigger
    AFTER INSERT OR UPDATE OR DELETE ON meals
    FOR EACH ROW
    EXECUTE FUNCTION meals_update_daily_summary();

-- Vérifier que le trigger est bien créé
SELECT
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'meals_daily_summary_trigger';

