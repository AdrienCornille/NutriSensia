-- ============================================================================
-- Script de correction: Fonction update_daily_nutrition_summary
-- ============================================================================
-- Problème: La fonction utilise daily_calorie_target (singulier)
--           mais la colonne s'appelle daily_calories_target (pluriel)
-- Solution: Corriger le nom de la colonne dans la fonction
-- ============================================================================

CREATE OR REPLACE FUNCTION update_daily_nutrition_summary(
    p_user_id UUID,
    p_date DATE
)
RETURNS VOID AS $$
DECLARE
    v_summary RECORD;
    v_goals RECORD;
BEGIN
    -- Calculer les totaux du jour
    SELECT
        COALESCE(SUM(total_calories), 0) AS total_calories,
        COALESCE(SUM(total_protein), 0) AS total_protein,
        COALESCE(SUM(total_carbs), 0) AS total_carbs,
        COALESCE(SUM(total_fat), 0) AS total_fat,
        COUNT(*) AS meal_count,
        COALESCE(SUM(CASE WHEN meal_type = 'breakfast' THEN total_calories ELSE 0 END), 0) AS breakfast_cal,
        COALESCE(SUM(CASE WHEN meal_type = 'lunch' THEN total_calories ELSE 0 END), 0) AS lunch_cal,
        COALESCE(SUM(CASE WHEN meal_type = 'dinner' THEN total_calories ELSE 0 END), 0) AS dinner_cal,
        COALESCE(SUM(CASE WHEN meal_type = 'snack' THEN total_calories ELSE 0 END), 0) AS snack_cal
    INTO v_summary
    FROM meals
    WHERE user_id = p_user_id
        AND meal_date = p_date
        AND deleted_at IS NULL;

    -- Récupérer les objectifs (CORRECTION ICI: daily_calories_target au lieu de daily_calorie_target)
    SELECT
        daily_calories_target,
        daily_protein_target AS protein_target_g,
        daily_carbs_target AS carbs_target_g,
        daily_fat_target AS fat_target_g
    INTO v_goals
    FROM user_settings
    WHERE user_id = p_user_id;

    -- Insérer ou mettre à jour
    INSERT INTO daily_nutrition_summary (
        user_id, date,
        total_calories, total_protein, total_carbs, total_fat,
        calorie_goal, protein_goal, carbs_goal, fat_goal,
        breakfast_calories, lunch_calories, dinner_calories, snack_calories,
        meal_count
    ) VALUES (
        p_user_id, p_date,
        v_summary.total_calories, v_summary.total_protein, v_summary.total_carbs, v_summary.total_fat,
        v_goals.daily_calories_target, v_goals.protein_target_g, v_goals.carbs_target_g, v_goals.fat_target_g,
        v_summary.breakfast_cal, v_summary.lunch_cal, v_summary.dinner_cal, v_summary.snack_cal,
        v_summary.meal_count
    )
    ON CONFLICT (user_id, date) DO UPDATE SET
        total_calories = EXCLUDED.total_calories,
        total_protein = EXCLUDED.total_protein,
        total_carbs = EXCLUDED.total_carbs,
        total_fat = EXCLUDED.total_fat,
        breakfast_calories = EXCLUDED.breakfast_calories,
        lunch_calories = EXCLUDED.lunch_calories,
        dinner_calories = EXCLUDED.dinner_calories,
        snack_calories = EXCLUDED.snack_calories,
        meal_count = EXCLUDED.meal_count,
        updated_at = now();
END;
$$ LANGUAGE plpgsql;
