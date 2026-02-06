-- ============================================================================
-- Script de correction: Politiques RLS sans récursion infinie
-- ============================================================================
-- Problème: Les politiques RLS sur profiles causaient une récursion infinie
-- Solution: Utiliser auth.jwt() pour lire le rôle au lieu de requêter profiles
-- ============================================================================

-- ============================================================================
-- 1. PROFILES TABLE - Politiques RLS corrigées
-- ============================================================================

-- Désactiver temporairement RLS
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins have full access to profiles" ON profiles;
DROP POLICY IF EXISTS "Nutritionists can view patient profiles" ON profiles;

-- Réactiver RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Politique 1: Les utilisateurs peuvent voir leur propre profil
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

-- Politique 2: Les utilisateurs peuvent modifier leur propre profil
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Politique 3: Les admins ont accès complet (via JWT claim)
-- Note: Le rôle admin doit être défini dans le JWT lors de la connexion
CREATE POLICY "Admins have full access to profiles"
    ON profiles FOR ALL
    USING (
        COALESCE(
            (auth.jwt() -> 'user_metadata' ->> 'role')::text,
            'patient'
        ) = 'admin'
    );

-- Politique 4: Les nutritionnistes peuvent voir les profils de leurs patients
CREATE POLICY "Nutritionists can view patient profiles"
    ON profiles FOR SELECT
    USING (
        COALESCE(
            (auth.jwt() -> 'user_metadata' ->> 'role')::text,
            'patient'
        ) = 'nutritionist'
        AND role = 'patient'
    );

-- ============================================================================
-- 2. MEALS TABLE - Politiques RLS
-- ============================================================================

-- Désactiver temporairement RLS
ALTER TABLE meals DISABLE ROW LEVEL SECURITY;

-- Supprimer anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own meals" ON meals;
DROP POLICY IF EXISTS "Users can insert own meals" ON meals;
DROP POLICY IF EXISTS "Users can update own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON meals;
DROP POLICY IF EXISTS "Nutritionists can view patient meals" ON meals;

-- Réactiver RLS
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- Politique 1: Les utilisateurs peuvent voir leurs propres repas
CREATE POLICY "Users can view own meals"
    ON meals FOR SELECT
    USING (auth.uid() = user_id);

-- Politique 2: Les utilisateurs peuvent créer leurs propres repas
CREATE POLICY "Users can insert own meals"
    ON meals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Politique 3: Les utilisateurs peuvent modifier leurs propres repas
CREATE POLICY "Users can update own meals"
    ON meals FOR UPDATE
    USING (auth.uid() = user_id);

-- Politique 4: Les utilisateurs peuvent supprimer leurs propres repas
CREATE POLICY "Users can delete own meals"
    ON meals FOR DELETE
    USING (auth.uid() = user_id);

-- Politique 5: Les nutritionnistes peuvent voir les repas de leurs patients
-- Note: Nécessite une table de relation nutritionist-patient
CREATE POLICY "Nutritionists can view patient meals"
    ON meals FOR SELECT
    USING (
        COALESCE(
            (auth.jwt() -> 'user_metadata' ->> 'role')::text,
            'patient'
        ) = 'nutritionist'
    );

-- ============================================================================
-- 3. MEAL_FOODS TABLE - Politiques RLS
-- ============================================================================

-- Désactiver temporairement RLS
ALTER TABLE meal_foods DISABLE ROW LEVEL SECURITY;

-- Supprimer anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can manage own meal foods" ON meal_foods;
DROP POLICY IF EXISTS "Nutritionists can view patient meal foods" ON meal_foods;

-- Réactiver RLS
ALTER TABLE meal_foods ENABLE ROW LEVEL SECURITY;

-- Politique 1: Les utilisateurs peuvent gérer les aliments de leurs propres repas
CREATE POLICY "Users can manage own meal foods"
    ON meal_foods FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM meals
            WHERE meals.id = meal_foods.meal_id
            AND meals.user_id = auth.uid()
        )
    );

-- Politique 2: Les nutritionnistes peuvent voir les meal_foods de leurs patients
CREATE POLICY "Nutritionists can view patient meal foods"
    ON meal_foods FOR SELECT
    USING (
        COALESCE(
            (auth.jwt() -> 'user_metadata' ->> 'role')::text,
            'patient'
        ) = 'nutritionist'
    );

-- ============================================================================
-- 4. DAILY_NUTRITION_SUMMARY TABLE - Politiques RLS
-- ============================================================================

-- Désactiver temporairement RLS
ALTER TABLE daily_nutrition_summary DISABLE ROW LEVEL SECURITY;

-- Supprimer anciennes politiques si elles existent
DROP POLICY IF EXISTS "Users can view own summary" ON daily_nutrition_summary;
DROP POLICY IF EXISTS "Nutritionists can view patient summary" ON daily_nutrition_summary;

-- Réactiver RLS
ALTER TABLE daily_nutrition_summary ENABLE ROW LEVEL SECURITY;

-- Politique 1: Les utilisateurs peuvent voir leur propre résumé
CREATE POLICY "Users can view own summary"
    ON daily_nutrition_summary FOR SELECT
    USING (auth.uid() = user_id);

-- Politique 2: Le système peut insérer/modifier via le trigger (SECURITY DEFINER)
-- Note: Le trigger update_daily_nutrition_summary doit être SECURITY DEFINER
CREATE POLICY "System can manage summary"
    ON daily_nutrition_summary FOR ALL
    USING (true)
    WITH CHECK (true);

-- Politique 3: Les nutritionnistes peuvent voir les résumés de leurs patients
CREATE POLICY "Nutritionists can view patient summary"
    ON daily_nutrition_summary FOR SELECT
    USING (
        COALESCE(
            (auth.jwt() -> 'user_metadata' ->> 'role')::text,
            'patient'
        ) = 'nutritionist'
    );

-- ============================================================================
-- 5. Modifier le trigger pour SECURITY DEFINER
-- ============================================================================

-- Recréer la fonction update_daily_nutrition_summary avec SECURITY DEFINER
-- Cela permet au trigger de modifier daily_nutrition_summary même avec RLS actif
DROP FUNCTION IF EXISTS update_daily_nutrition_summary(UUID, DATE);

CREATE OR REPLACE FUNCTION update_daily_nutrition_summary(
    p_user_id UUID,
    p_date DATE
)
RETURNS VOID
SECURITY DEFINER  -- IMPORTANT: Exécuter avec les privilèges du créateur
SET search_path = public
AS $$
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

    -- Récupérer les objectifs
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

-- Vérifier que tout est correct
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename IN ('profiles', 'meals', 'meal_foods', 'daily_nutrition_summary')
ORDER BY tablename, policyname;
