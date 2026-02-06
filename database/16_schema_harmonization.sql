-- ============================================================================
-- NutriSensia Database Schema - 16 Schema Harmonization
-- ============================================================================
-- Migration: Rename user_id → patient_id in patient-specific tables
-- Reason: Clarify distinction between patient data and generic user data
-- Dependencies: All previous scripts (01-15)
-- ============================================================================
-- IMPORTANT: This script is idempotent and safe to run multiple times
-- ============================================================================

-- ============================================================================
-- PHASE 1: BIOMETRICS TABLES (08_biometrics.sql)
-- Tables: weight_entries, weight_goals, measurements, wellbeing_logs,
--         activities, activity_goals, hydration_logs, hydration_goals,
--         biometric_insights
-- ============================================================================

-- 1.1 weight_entries
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'weight_entries' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_weight_entries_user;
        DROP INDEX IF EXISTS idx_weight_entries_date;

        ALTER TABLE weight_entries RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_weight_entries_patient ON weight_entries(patient_id);
        CREATE INDEX idx_weight_entries_date ON weight_entries(patient_id, date DESC);

        RAISE NOTICE 'weight_entries: user_id → patient_id ✓';
    END IF;
END $$;

-- 1.2 weight_goals
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'weight_goals' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_weight_goals_user;

        ALTER TABLE weight_goals RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_weight_goals_patient ON weight_goals(patient_id);

        RAISE NOTICE 'weight_goals: user_id → patient_id ✓';
    END IF;
END $$;

-- 1.3 measurements
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'measurements' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_measurements_user;
        DROP INDEX IF EXISTS idx_measurements_type;

        ALTER TABLE measurements RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_measurements_patient ON measurements(patient_id);
        CREATE INDEX idx_measurements_type ON measurements(patient_id, measurement_type, date DESC);

        RAISE NOTICE 'measurements: user_id → patient_id ✓';
    END IF;
END $$;

-- 1.4 wellbeing_logs
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'wellbeing_logs' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_wellbeing_logs_user;
        DROP INDEX IF EXISTS idx_wellbeing_logs_date;

        ALTER TABLE wellbeing_logs RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_wellbeing_logs_patient ON wellbeing_logs(patient_id);
        CREATE INDEX idx_wellbeing_logs_date ON wellbeing_logs(patient_id, date DESC);

        RAISE NOTICE 'wellbeing_logs: user_id → patient_id ✓';
    END IF;
END $$;

-- 1.5 activities
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'activities' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_activities_user;
        DROP INDEX IF EXISTS idx_activities_date;
        DROP INDEX IF EXISTS idx_activities_recent;

        ALTER TABLE activities RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_activities_patient ON activities(patient_id);
        CREATE INDEX idx_activities_date ON activities(patient_id, date DESC);
        CREATE INDEX idx_activities_recent ON activities(patient_id, date DESC);

        RAISE NOTICE 'activities: user_id → patient_id ✓';
    END IF;
END $$;

-- 1.6 activity_goals
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'activity_goals' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_activity_goals_user;
        DROP INDEX IF EXISTS idx_activity_goals_current;

        ALTER TABLE activity_goals RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_activity_goals_patient ON activity_goals(patient_id);
        CREATE INDEX idx_activity_goals_current ON activity_goals(patient_id, valid_from, valid_until);

        RAISE NOTICE 'activity_goals: user_id → patient_id ✓';
    END IF;
END $$;

-- 1.7 hydration_logs
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'hydration_logs' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_hydration_logs_user;
        DROP INDEX IF EXISTS idx_hydration_logs_date;

        ALTER TABLE hydration_logs RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_hydration_logs_patient ON hydration_logs(patient_id);
        CREATE INDEX idx_hydration_logs_date ON hydration_logs(patient_id, date DESC);

        RAISE NOTICE 'hydration_logs: user_id → patient_id ✓';
    END IF;
END $$;

-- 1.8 hydration_goals
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'hydration_goals' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_hydration_goals_user;
        DROP INDEX IF EXISTS idx_hydration_goals_current;

        ALTER TABLE hydration_goals RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_hydration_goals_patient ON hydration_goals(patient_id);
        CREATE INDEX idx_hydration_goals_current ON hydration_goals(patient_id, valid_from, valid_until);

        RAISE NOTICE 'hydration_goals: user_id → patient_id ✓';
    END IF;
END $$;

-- 1.9 biometric_insights
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'biometric_insights' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_biometric_insights_user;
        DROP INDEX IF EXISTS idx_biometric_insights_active;
        DROP INDEX IF EXISTS idx_biometric_insights_category;

        ALTER TABLE biometric_insights RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_biometric_insights_patient ON biometric_insights(patient_id);
        -- Note: Index partiel avec now() non supporté (fonction non IMMUTABLE)
        -- Utiliser un index simple sur les colonnes pertinentes
        CREATE INDEX idx_biometric_insights_active ON biometric_insights(patient_id, is_dismissed, expires_at);
        CREATE INDEX idx_biometric_insights_category ON biometric_insights(patient_id, category);

        RAISE NOTICE 'biometric_insights: user_id → patient_id ✓';
    END IF;
END $$;

-- ============================================================================
-- PHASE 2: MEALS TABLES (09_meals_enhanced.sql)
-- Tables: meals, meal_templates, daily_nutrition_summary, meal_photos
-- ============================================================================

-- 2.1 meals
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'meals' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_meals_user;
        DROP INDEX IF EXISTS idx_meals_date;
        DROP INDEX IF EXISTS idx_meals_type_date;

        ALTER TABLE meals RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_meals_patient ON meals(patient_id);
        CREATE INDEX idx_meals_date ON meals(patient_id, meal_date DESC);
        CREATE INDEX idx_meals_type_date ON meals(patient_id, meal_type, meal_date);

        RAISE NOTICE 'meals: user_id → patient_id ✓';
    END IF;
END $$;

-- 2.2 meal_templates
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'meal_templates' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_meal_templates_user;
        DROP INDEX IF EXISTS idx_meal_templates_type;
        DROP INDEX IF EXISTS idx_meal_templates_usage;

        ALTER TABLE meal_templates RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_meal_templates_patient ON meal_templates(patient_id);
        CREATE INDEX idx_meal_templates_type ON meal_templates(patient_id, meal_type);
        CREATE INDEX idx_meal_templates_usage ON meal_templates(patient_id, usage_count DESC);

        RAISE NOTICE 'meal_templates: user_id → patient_id ✓';
    END IF;
END $$;

-- 2.3 daily_nutrition_summary
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'daily_nutrition_summary' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_daily_nutrition_summary_user;
        DROP INDEX IF EXISTS idx_daily_nutrition_summary_date;

        ALTER TABLE daily_nutrition_summary RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_daily_nutrition_summary_patient ON daily_nutrition_summary(patient_id);
        CREATE INDEX idx_daily_nutrition_summary_date ON daily_nutrition_summary(patient_id, date DESC);

        RAISE NOTICE 'daily_nutrition_summary: user_id → patient_id ✓';
    END IF;
END $$;

-- 2.4 meal_photos
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'meal_photos' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_meal_photos_user;

        ALTER TABLE meal_photos RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_meal_photos_patient ON meal_photos(patient_id, created_at DESC);

        RAISE NOTICE 'meal_photos: user_id → patient_id ✓';
    END IF;
END $$;

-- ============================================================================
-- PHASE 3: MEAL PLANS TABLE (10_meal_plans_enhanced.sql)
-- Remove redundant user_id column (already has patient_id and nutritionist_id)
-- Must drop dependent RLS policies first
-- ============================================================================

-- 3.1 Drop RLS policies that depend on user_id
DROP POLICY IF EXISTS meal_plans_own ON meal_plans;
DROP POLICY IF EXISTS meal_plan_days_access ON meal_plan_days;
DROP POLICY IF EXISTS meal_plan_meals_access ON meal_plan_meals;
DROP POLICY IF EXISTS meal_plan_meal_foods_access ON meal_plan_meal_foods;
DROP POLICY IF EXISTS meal_plan_alternatives_access ON meal_plan_alternatives;

-- Also drop any "Users can..." policies
DROP POLICY IF EXISTS "Users can view own meal plans" ON meal_plans;
DROP POLICY IF EXISTS "Users can manage own meal plans" ON meal_plans;

DO $$
BEGIN
    -- Check if meal_plans has both user_id AND patient_id
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'meal_plans' AND column_name = 'user_id'
    ) AND EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'meal_plans' AND column_name = 'patient_id'
    ) THEN
        -- Drop the redundant user_id column
        DROP INDEX IF EXISTS idx_meal_plans_user;
        ALTER TABLE meal_plans DROP COLUMN user_id;

        RAISE NOTICE 'meal_plans: redundant user_id removed ✓';
    ELSIF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'meal_plans' AND column_name = 'user_id'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'meal_plans' AND column_name = 'patient_id'
    ) THEN
        -- Rename user_id to patient_id if patient_id doesn't exist
        DROP INDEX IF EXISTS idx_meal_plans_user;
        ALTER TABLE meal_plans RENAME COLUMN user_id TO patient_id;
        CREATE INDEX idx_meal_plans_patient ON meal_plans(patient_id);

        RAISE NOTICE 'meal_plans: user_id → patient_id ✓';
    END IF;
END $$;

-- 3.2 Recreate RLS policies using patient_id
CREATE POLICY "Patients can view own meal plans"
    ON meal_plans FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own meal plans"
    ON meal_plans FOR ALL
    USING (auth.uid() = patient_id);

-- Nutritionists can view/manage their patients' meal plans
CREATE POLICY "Nutritionists can view patient meal plans"
    ON meal_plans FOR SELECT
    USING (auth.uid() = nutritionist_id);

CREATE POLICY "Nutritionists can manage patient meal plans"
    ON meal_plans FOR ALL
    USING (auth.uid() = nutritionist_id);

-- Recreate policies for related tables
CREATE POLICY "meal_plan_days_patient_access"
    ON meal_plan_days FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM meal_plans mp
            WHERE mp.id = meal_plan_days.meal_plan_id
            AND (mp.patient_id = auth.uid() OR mp.nutritionist_id = auth.uid())
        )
    );

CREATE POLICY "meal_plan_meals_patient_access"
    ON meal_plan_meals FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM meal_plan_days mpd
            JOIN meal_plans mp ON mp.id = mpd.meal_plan_id
            WHERE mpd.id = meal_plan_meals.plan_day_id
            AND (mp.patient_id = auth.uid() OR mp.nutritionist_id = auth.uid())
        )
    );

CREATE POLICY "meal_plan_meal_foods_patient_access"
    ON meal_plan_meal_foods FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM meal_plan_meals mpm
            JOIN meal_plan_days mpd ON mpd.id = mpm.plan_day_id
            JOIN meal_plans mp ON mp.id = mpd.meal_plan_id
            WHERE mpm.id = meal_plan_meal_foods.plan_meal_id
            AND (mp.patient_id = auth.uid() OR mp.nutritionist_id = auth.uid())
        )
    );

CREATE POLICY "meal_plan_alternatives_patient_access"
    ON meal_plan_alternatives FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM meal_plan_meals mpm
            JOIN meal_plan_days mpd ON mpd.id = mpm.plan_day_id
            JOIN meal_plans mp ON mp.id = mpd.meal_plan_id
            WHERE mpm.id = meal_plan_alternatives.plan_meal_id
            AND (mp.patient_id = auth.uid() OR mp.nutritionist_id = auth.uid())
        )
    );

-- ============================================================================
-- PHASE 4: SHOPPING LISTS (12_shopping_lists.sql)
-- Table: shopping_lists
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'shopping_lists' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_shopping_lists_user;
        DROP INDEX IF EXISTS idx_shopping_lists_active;
        DROP INDEX IF EXISTS idx_shopping_lists_week;

        ALTER TABLE shopping_lists RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_shopping_lists_patient ON shopping_lists(patient_id);
        CREATE INDEX idx_shopping_lists_active ON shopping_lists(patient_id, is_active) WHERE is_active = true;
        CREATE INDEX idx_shopping_lists_week ON shopping_lists(patient_id, week_start);

        RAISE NOTICE 'shopping_lists: user_id → patient_id ✓';
    END IF;
END $$;

-- ============================================================================
-- PHASE 5: GAMIFICATION (15_gamification.sql)
-- Tables: streaks, user_points → patient_points, user_badges → patient_badges,
--         weekly_objectives, points_history
-- ============================================================================

-- 5.1 streaks
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'streaks' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_streaks_user;
        DROP INDEX IF EXISTS idx_streaks_active;

        ALTER TABLE streaks RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_streaks_patient ON streaks(patient_id);
        CREATE INDEX idx_streaks_active ON streaks(patient_id, current_count DESC);

        RAISE NOTICE 'streaks: user_id → patient_id ✓';
    END IF;
END $$;

-- 5.2 user_points → patient_points (rename table AND column)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'user_points'
    ) THEN
        -- First rename the column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'user_points' AND column_name = 'user_id'
        ) THEN
            ALTER TABLE user_points RENAME COLUMN user_id TO patient_id;
        END IF;

        -- Drop old indexes
        DROP INDEX IF EXISTS idx_user_points_user;
        DROP INDEX IF EXISTS idx_user_points_level;
        DROP INDEX IF EXISTS idx_user_points_rank;

        -- Rename the table
        ALTER TABLE user_points RENAME TO patient_points;

        -- Create new indexes
        CREATE INDEX idx_patient_points_patient ON patient_points(patient_id);
        CREATE INDEX idx_patient_points_level ON patient_points(current_level DESC);
        CREATE INDEX idx_patient_points_rank ON patient_points(rank_position);

        RAISE NOTICE 'user_points → patient_points ✓';
    END IF;
END $$;

-- 5.3 user_badges → patient_badges (rename table AND column)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'user_badges'
    ) THEN
        -- First rename the column
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_name = 'user_badges' AND column_name = 'user_id'
        ) THEN
            ALTER TABLE user_badges RENAME COLUMN user_id TO patient_id;
        END IF;

        -- Drop old indexes
        DROP INDEX IF EXISTS idx_user_badges_user;
        DROP INDEX IF EXISTS idx_user_badges_badge;
        DROP INDEX IF EXISTS idx_user_badges_unlocked;
        DROP INDEX IF EXISTS idx_user_badges_featured;

        -- Rename the table
        ALTER TABLE user_badges RENAME TO patient_badges;

        -- Create new indexes
        CREATE INDEX idx_patient_badges_patient ON patient_badges(patient_id);
        CREATE INDEX idx_patient_badges_badge ON patient_badges(badge_id);
        CREATE INDEX idx_patient_badges_unlocked ON patient_badges(patient_id, unlocked_at DESC);
        CREATE INDEX idx_patient_badges_featured ON patient_badges(patient_id, is_featured) WHERE is_featured = true;

        RAISE NOTICE 'user_badges → patient_badges ✓';
    END IF;
END $$;

-- 5.4 weekly_objectives
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'weekly_objectives' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_weekly_objectives_user;
        DROP INDEX IF EXISTS idx_weekly_objectives_week;

        ALTER TABLE weekly_objectives RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_weekly_objectives_patient ON weekly_objectives(patient_id);
        CREATE INDEX idx_weekly_objectives_week ON weekly_objectives(patient_id, week_start DESC);

        RAISE NOTICE 'weekly_objectives: user_id → patient_id ✓';
    END IF;
END $$;

-- 5.5 points_history
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'points_history' AND column_name = 'user_id'
    ) THEN
        DROP INDEX IF EXISTS idx_points_history_user;
        DROP INDEX IF EXISTS idx_points_history_date;

        ALTER TABLE points_history RENAME COLUMN user_id TO patient_id;

        CREATE INDEX idx_points_history_patient ON points_history(patient_id);
        CREATE INDEX idx_points_history_date ON points_history(patient_id, created_at DESC);

        RAISE NOTICE 'points_history: user_id → patient_id ✓';
    END IF;
END $$;

-- ============================================================================
-- PHASE 6: UPDATE RLS POLICIES
-- ============================================================================

-- 6.1 Biometrics policies
DROP POLICY IF EXISTS "Users can view own weight entries" ON weight_entries;
DROP POLICY IF EXISTS "Users can manage own weight entries" ON weight_entries;
DROP POLICY IF EXISTS "Patients can view own weight entries" ON weight_entries;
DROP POLICY IF EXISTS "Patients can manage own weight entries" ON weight_entries;

CREATE POLICY "Patients can view own weight entries"
    ON weight_entries FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own weight entries"
    ON weight_entries FOR ALL
    USING (auth.uid() = patient_id);

-- weight_goals
DROP POLICY IF EXISTS "Users can view own weight goals" ON weight_goals;
DROP POLICY IF EXISTS "Users can manage own weight goals" ON weight_goals;
DROP POLICY IF EXISTS "Patients can view own weight goals" ON weight_goals;
DROP POLICY IF EXISTS "Patients can manage own weight goals" ON weight_goals;

CREATE POLICY "Patients can view own weight goals"
    ON weight_goals FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own weight goals"
    ON weight_goals FOR ALL
    USING (auth.uid() = patient_id);

-- measurements
DROP POLICY IF EXISTS "Users can view own measurements" ON measurements;
DROP POLICY IF EXISTS "Users can manage own measurements" ON measurements;
DROP POLICY IF EXISTS "Patients can view own measurements" ON measurements;
DROP POLICY IF EXISTS "Patients can manage own measurements" ON measurements;

CREATE POLICY "Patients can view own measurements"
    ON measurements FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own measurements"
    ON measurements FOR ALL
    USING (auth.uid() = patient_id);

-- wellbeing_logs
DROP POLICY IF EXISTS "Users can view own wellbeing logs" ON wellbeing_logs;
DROP POLICY IF EXISTS "Users can manage own wellbeing logs" ON wellbeing_logs;
DROP POLICY IF EXISTS "Patients can view own wellbeing logs" ON wellbeing_logs;
DROP POLICY IF EXISTS "Patients can manage own wellbeing logs" ON wellbeing_logs;

CREATE POLICY "Patients can view own wellbeing logs"
    ON wellbeing_logs FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own wellbeing logs"
    ON wellbeing_logs FOR ALL
    USING (auth.uid() = patient_id);

-- activities
DROP POLICY IF EXISTS "Users can view own activities" ON activities;
DROP POLICY IF EXISTS "Users can manage own activities" ON activities;
DROP POLICY IF EXISTS "Patients can view own activities" ON activities;
DROP POLICY IF EXISTS "Patients can manage own activities" ON activities;

CREATE POLICY "Patients can view own activities"
    ON activities FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own activities"
    ON activities FOR ALL
    USING (auth.uid() = patient_id);

-- activity_goals
DROP POLICY IF EXISTS "Users can view own activity goals" ON activity_goals;
DROP POLICY IF EXISTS "Users can manage own activity goals" ON activity_goals;
DROP POLICY IF EXISTS "Patients can view own activity goals" ON activity_goals;
DROP POLICY IF EXISTS "Patients can manage own activity goals" ON activity_goals;

CREATE POLICY "Patients can view own activity goals"
    ON activity_goals FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own activity goals"
    ON activity_goals FOR ALL
    USING (auth.uid() = patient_id);

-- hydration_logs
DROP POLICY IF EXISTS "Users can view own hydration logs" ON hydration_logs;
DROP POLICY IF EXISTS "Users can manage own hydration logs" ON hydration_logs;
DROP POLICY IF EXISTS "Patients can view own hydration logs" ON hydration_logs;
DROP POLICY IF EXISTS "Patients can manage own hydration logs" ON hydration_logs;

CREATE POLICY "Patients can view own hydration logs"
    ON hydration_logs FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own hydration logs"
    ON hydration_logs FOR ALL
    USING (auth.uid() = patient_id);

-- hydration_goals
DROP POLICY IF EXISTS "Users can view own hydration goals" ON hydration_goals;
DROP POLICY IF EXISTS "Users can manage own hydration goals" ON hydration_goals;
DROP POLICY IF EXISTS "Patients can view own hydration goals" ON hydration_goals;
DROP POLICY IF EXISTS "Patients can manage own hydration goals" ON hydration_goals;

CREATE POLICY "Patients can view own hydration goals"
    ON hydration_goals FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own hydration goals"
    ON hydration_goals FOR ALL
    USING (auth.uid() = patient_id);

-- biometric_insights
DROP POLICY IF EXISTS "Users can view own biometric insights" ON biometric_insights;
DROP POLICY IF EXISTS "Users can manage own biometric insights" ON biometric_insights;
DROP POLICY IF EXISTS "Patients can view own biometric insights" ON biometric_insights;
DROP POLICY IF EXISTS "Patients can manage own biometric insights" ON biometric_insights;

CREATE POLICY "Patients can view own biometric insights"
    ON biometric_insights FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own biometric insights"
    ON biometric_insights FOR ALL
    USING (auth.uid() = patient_id);

-- 6.2 Meals policies
DROP POLICY IF EXISTS "Users can view own meals" ON meals;
DROP POLICY IF EXISTS "Users can manage own meals" ON meals;
DROP POLICY IF EXISTS "Patients can view own meals" ON meals;
DROP POLICY IF EXISTS "Patients can manage own meals" ON meals;

CREATE POLICY "Patients can view own meals"
    ON meals FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own meals"
    ON meals FOR ALL
    USING (auth.uid() = patient_id);

-- meal_templates
DROP POLICY IF EXISTS "Users can view own meal templates" ON meal_templates;
DROP POLICY IF EXISTS "Users can manage own meal templates" ON meal_templates;
DROP POLICY IF EXISTS "Patients can view own meal templates" ON meal_templates;
DROP POLICY IF EXISTS "Patients can manage own meal templates" ON meal_templates;

CREATE POLICY "Patients can view own meal templates"
    ON meal_templates FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own meal templates"
    ON meal_templates FOR ALL
    USING (auth.uid() = patient_id);

-- daily_nutrition_summary
DROP POLICY IF EXISTS "Users can view own nutrition summary" ON daily_nutrition_summary;
DROP POLICY IF EXISTS "Users can manage own nutrition summary" ON daily_nutrition_summary;
DROP POLICY IF EXISTS "Patients can view own nutrition summary" ON daily_nutrition_summary;
DROP POLICY IF EXISTS "Patients can manage own nutrition summary" ON daily_nutrition_summary;

CREATE POLICY "Patients can view own nutrition summary"
    ON daily_nutrition_summary FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own nutrition summary"
    ON daily_nutrition_summary FOR ALL
    USING (auth.uid() = patient_id);

-- meal_photos
DROP POLICY IF EXISTS "Users can view own meal photos" ON meal_photos;
DROP POLICY IF EXISTS "Users can manage own meal photos" ON meal_photos;
DROP POLICY IF EXISTS "Patients can view own meal photos" ON meal_photos;
DROP POLICY IF EXISTS "Patients can manage own meal photos" ON meal_photos;

CREATE POLICY "Patients can view own meal photos"
    ON meal_photos FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own meal photos"
    ON meal_photos FOR ALL
    USING (auth.uid() = patient_id);

-- 6.3 Shopping lists policies
DROP POLICY IF EXISTS "Users can view own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Users can manage own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Patients can view own shopping lists" ON shopping_lists;
DROP POLICY IF EXISTS "Patients can manage own shopping lists" ON shopping_lists;

CREATE POLICY "Patients can view own shopping lists"
    ON shopping_lists FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own shopping lists"
    ON shopping_lists FOR ALL
    USING (auth.uid() = patient_id);

-- 6.4 Gamification policies
-- streaks
DROP POLICY IF EXISTS "Users can view own streaks" ON streaks;
DROP POLICY IF EXISTS "Users can manage own streaks" ON streaks;
DROP POLICY IF EXISTS "Patients can view own streaks" ON streaks;
DROP POLICY IF EXISTS "Patients can manage own streaks" ON streaks;

CREATE POLICY "Patients can view own streaks"
    ON streaks FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own streaks"
    ON streaks FOR ALL
    USING (auth.uid() = patient_id);

-- patient_points (formerly user_points)
DROP POLICY IF EXISTS "Users can view own points" ON patient_points;
DROP POLICY IF EXISTS "Users can manage own points" ON patient_points;
DROP POLICY IF EXISTS "Patients can view own points" ON patient_points;
DROP POLICY IF EXISTS "Patients can manage own points" ON patient_points;

CREATE POLICY "Patients can view own points"
    ON patient_points FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own points"
    ON patient_points FOR ALL
    USING (auth.uid() = patient_id);

-- patient_badges (formerly user_badges)
DROP POLICY IF EXISTS "Users can view own badges" ON patient_badges;
DROP POLICY IF EXISTS "Users can manage own badges" ON patient_badges;
DROP POLICY IF EXISTS "Patients can view own badges" ON patient_badges;
DROP POLICY IF EXISTS "Patients can manage own badges" ON patient_badges;

CREATE POLICY "Patients can view own badges"
    ON patient_badges FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own badges"
    ON patient_badges FOR ALL
    USING (auth.uid() = patient_id);

-- weekly_objectives
DROP POLICY IF EXISTS "Users can view own objectives" ON weekly_objectives;
DROP POLICY IF EXISTS "Users can manage own objectives" ON weekly_objectives;
DROP POLICY IF EXISTS "Patients can view own objectives" ON weekly_objectives;
DROP POLICY IF EXISTS "Patients can manage own objectives" ON weekly_objectives;

CREATE POLICY "Patients can view own objectives"
    ON weekly_objectives FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own objectives"
    ON weekly_objectives FOR ALL
    USING (auth.uid() = patient_id);

-- points_history
DROP POLICY IF EXISTS "Users can view own points history" ON points_history;
DROP POLICY IF EXISTS "Users can manage own points history" ON points_history;
DROP POLICY IF EXISTS "Patients can view own points history" ON points_history;
DROP POLICY IF EXISTS "Patients can manage own points history" ON points_history;

CREATE POLICY "Patients can view own points history"
    ON points_history FOR SELECT
    USING (auth.uid() = patient_id);

CREATE POLICY "Patients can manage own points history"
    ON points_history FOR ALL
    USING (auth.uid() = patient_id);

-- ============================================================================
-- PHASE 7: UPDATE FUNCTIONS
-- ============================================================================

-- 7.1 Update biometrics functions
CREATE OR REPLACE FUNCTION get_biometric_dashboard(p_patient_id UUID)
RETURNS TABLE (
    latest_weight DECIMAL,
    weight_change DECIMAL,
    weight_trend VARCHAR,
    latest_measurements JSONB,
    wellbeing_average DECIMAL,
    hydration_average DECIMAL,
    activity_streak INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH latest_weight AS (
        SELECT weight_kg, date
        FROM weight_entries
        WHERE patient_id = p_patient_id
        ORDER BY date DESC
        LIMIT 1
    ),
    previous_weight AS (
        SELECT weight_kg
        FROM weight_entries
        WHERE patient_id = p_patient_id
        ORDER BY date DESC
        OFFSET 1
        LIMIT 1
    ),
    week_wellbeing AS (
        SELECT AVG(mood) as avg_mood
        FROM wellbeing_logs
        WHERE patient_id = p_patient_id
        AND date >= CURRENT_DATE - INTERVAL '7 days'
    ),
    week_hydration AS (
        SELECT AVG(amount_ml) as avg_hydration
        FROM hydration_logs
        WHERE patient_id = p_patient_id
        AND date >= CURRENT_DATE - INTERVAL '7 days'
    ),
    activity_streak AS (
        SELECT current_count
        FROM streaks
        WHERE patient_id = p_patient_id AND streak_type = 'activity'
        LIMIT 1
    )
    SELECT
        lw.weight_kg,
        COALESCE(lw.weight_kg - pw.weight_kg, 0),
        CASE
            WHEN lw.weight_kg > pw.weight_kg THEN 'up'
            WHEN lw.weight_kg < pw.weight_kg THEN 'down'
            ELSE 'stable'
        END,
        (
            SELECT jsonb_agg(jsonb_build_object(
                'type', measurement_type,
                'value', value_cm,
                'date', date
            ))
            FROM (
                SELECT DISTINCT ON (measurement_type) measurement_type, value_cm, date
                FROM measurements
                WHERE patient_id = p_patient_id
                ORDER BY measurement_type, date DESC
            ) latest_m
        ),
        ww.avg_mood,
        wh.avg_hydration,
        COALESCE(ast.current_count, 0)
    FROM latest_weight lw
    LEFT JOIN previous_weight pw ON true
    LEFT JOIN week_wellbeing ww ON true
    LEFT JOIN week_hydration wh ON true
    LEFT JOIN activity_streak ast ON true;
END;
$$;

-- 7.2 Update meals functions
CREATE OR REPLACE FUNCTION get_daily_nutrition(
    p_patient_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    calories DECIMAL,
    proteins DECIMAL,
    carbs DECIMAL,
    fats DECIMAL,
    fiber DECIMAL,
    meal_count INTEGER,
    is_complete BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(SUM(m.total_calories), 0)::DECIMAL,
        COALESCE(SUM(m.total_protein), 0)::DECIMAL,
        COALESCE(SUM(m.total_carbs), 0)::DECIMAL,
        COALESCE(SUM(m.total_fat), 0)::DECIMAL,
        COALESCE(SUM(m.total_fiber), 0)::DECIMAL,
        COUNT(*)::INTEGER,
        COUNT(*) >= 3
    FROM meals m
    WHERE m.patient_id = p_patient_id
    AND m.meal_date = p_date
    AND m.deleted_at IS NULL;
END;
$$;

CREATE OR REPLACE FUNCTION get_nutrition_week_summary(p_patient_id UUID)
RETURNS TABLE (
    day_date DATE,
    total_calories DECIMAL,
    total_proteins DECIMAL,
    total_carbs DECIMAL,
    total_fats DECIMAL,
    meal_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.meal_date,
        COALESCE(SUM(m.total_calories), 0)::DECIMAL,
        COALESCE(SUM(m.total_protein), 0)::DECIMAL,
        COALESCE(SUM(m.total_carbs), 0)::DECIMAL,
        COALESCE(SUM(m.total_fat), 0)::DECIMAL,
        COUNT(*)::INTEGER
    FROM meals m
    WHERE m.patient_id = p_patient_id
    AND m.meal_date >= CURRENT_DATE - INTERVAL '7 days'
    AND m.deleted_at IS NULL
    GROUP BY m.meal_date
    ORDER BY m.meal_date;
END;
$$;

-- 7.3 Update gamification functions
CREATE OR REPLACE FUNCTION award_points(
    p_patient_id UUID,
    p_points INTEGER,
    p_source VARCHAR,
    p_description TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_total INTEGER;
BEGIN
    -- Get or create patient_points record
    INSERT INTO patient_points (patient_id, total_points, current_level, points_this_week, points_this_month)
    VALUES (p_patient_id, 0, 1, 0, 0)
    ON CONFLICT (patient_id) DO NOTHING;

    -- Update points
    UPDATE patient_points
    SET
        total_points = total_points + p_points,
        points_this_week = points_this_week + p_points,
        points_this_month = points_this_month + p_points,
        updated_at = now()
    WHERE patient_id = p_patient_id
    RETURNING total_points INTO v_new_total;

    -- Record in history
    INSERT INTO points_history (patient_id, points, reason, reason_data)
    VALUES (p_patient_id, p_points, p_source, jsonb_build_object('description', p_description));

    -- Check for level up
    PERFORM update_patient_level(p_patient_id);

    RETURN true;
END;
$$;

CREATE OR REPLACE FUNCTION update_patient_level(p_patient_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_points INTEGER;
    v_new_level INTEGER;
    v_current_level INTEGER;
    v_points_for_next INTEGER;
BEGIN
    SELECT total_points, current_level
    INTO v_total_points, v_current_level
    FROM patient_points
    WHERE patient_id = p_patient_id;

    IF v_total_points IS NULL THEN
        RETURN 1;
    END IF;

    -- Calculate new level (every 100 points = 1 level)
    v_new_level := GREATEST(1, (v_total_points / 100) + 1);
    v_points_for_next := (v_new_level * 100) - v_total_points;

    UPDATE patient_points
    SET
        current_level = v_new_level,
        points_to_next_level = v_points_for_next,
        updated_at = now()
    WHERE patient_id = p_patient_id;

    RETURN v_new_level;
END;
$$;

CREATE OR REPLACE FUNCTION get_patient_gamification_stats(p_patient_id UUID)
RETURNS TABLE (
    total_points INTEGER,
    points_this_week INTEGER,
    current_level INTEGER,
    badges_count BIGINT,
    active_streaks JSONB,
    weekly_progress JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(pp.total_points, 0),
        COALESCE(pp.points_this_week, 0),
        COALESCE(pp.current_level, 1),
        (SELECT COUNT(*) FROM patient_badges WHERE patient_id = p_patient_id),
        (
            SELECT jsonb_agg(jsonb_build_object(
                'type', streak_type,
                'current', current_count,
                'longest', longest_count
            ))
            FROM streaks
            WHERE patient_id = p_patient_id AND current_count > 0
        ),
        (
            SELECT jsonb_agg(jsonb_build_object(
                'objective', objective_type,
                'target', target_value,
                'current', current_value,
                'completed', is_completed
            ))
            FROM weekly_objectives
            WHERE patient_id = p_patient_id
            AND week_start = date_trunc('week', CURRENT_DATE)::DATE
        )
    FROM patient_points pp
    WHERE pp.patient_id = p_patient_id;
END;
$$;

-- 7.4 Update shopping list functions
CREATE OR REPLACE FUNCTION generate_shopping_list(
    p_patient_id UUID,
    p_meal_plan_id UUID DEFAULT NULL,
    p_days INTEGER DEFAULT 7
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_list_id UUID;
    v_start_date DATE := CURRENT_DATE;
    v_end_date DATE := CURRENT_DATE + p_days;
    v_category_id UUID;
BEGIN
    -- Create new shopping list
    INSERT INTO shopping_lists (patient_id, name, week_start, week_end, source_type, source_meal_plan_id, is_active)
    VALUES (
        p_patient_id,
        'Liste du ' || to_char(v_start_date, 'DD/MM') || ' au ' || to_char(v_end_date, 'DD/MM'),
        v_start_date,
        v_end_date,
        CASE WHEN p_meal_plan_id IS NOT NULL THEN 'meal_plan' ELSE 'manual' END,
        p_meal_plan_id,
        true
    )
    RETURNING id INTO v_list_id;

    -- Create default category
    INSERT INTO shopping_list_categories (shopping_list_id, name, icon, display_order)
    VALUES (v_list_id, 'Autres', '📦', 1)
    RETURNING id INTO v_category_id;

    -- Add items based on meal plan if provided
    IF p_meal_plan_id IS NOT NULL THEN
        INSERT INTO shopping_list_items (shopping_list_id, category_id, name, quantity, quantity_value, unit, food_id)
        SELECT DISTINCT ON (COALESCE(f.name_fr, mpmf.custom_name))
            v_list_id,
            v_category_id,
            COALESCE(f.name_fr, mpmf.custom_name),
            mpmf.quantity::VARCHAR || ' ' || mpmf.unit,
            mpmf.quantity,
            mpmf.unit,
            mpmf.food_id
        FROM meal_plan_days mpd
        JOIN meal_plan_meal_foods mpmf ON mpmf.plan_day_id = mpd.id
        LEFT JOIN foods f ON f.id = mpmf.food_id
        WHERE mpd.meal_plan_id = p_meal_plan_id
        AND mpd.date BETWEEN v_start_date AND v_end_date;
    END IF;

    RETURN v_list_id;
END;
$$;

-- ============================================================================
-- PHASE 8: ADD NUTRITIONIST ACCESS POLICIES
-- ============================================================================
-- Note: La relation patient-nutritionniste est stockée dans patient_profiles.nutritionist_id
-- patient_profiles.user_id = auth.users.id (le patient)
-- patient_profiles.nutritionist_id = nutritionist_profiles.id (le nutritionniste)

-- Nutritionists can view their patients' biometric data
CREATE POLICY "Nutritionists can view patient weight entries"
    ON weight_entries FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
            WHERE pp.user_id = weight_entries.patient_id
            AND np.user_id = auth.uid()
            AND pp.status = 'active'
        )
    );

CREATE POLICY "Nutritionists can view patient measurements"
    ON measurements FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
            WHERE pp.user_id = measurements.patient_id
            AND np.user_id = auth.uid()
            AND pp.status = 'active'
        )
    );

CREATE POLICY "Nutritionists can view patient meals"
    ON meals FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
            WHERE pp.user_id = meals.patient_id
            AND np.user_id = auth.uid()
            AND pp.status = 'active'
        )
    );

CREATE POLICY "Nutritionists can view patient nutrition summary"
    ON daily_nutrition_summary FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
            WHERE pp.user_id = daily_nutrition_summary.patient_id
            AND np.user_id = auth.uid()
            AND pp.status = 'active'
        )
    );

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Schema Harmonization Complete!';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Changes made:';
    RAISE NOTICE '- Biometrics: user_id → patient_id';
    RAISE NOTICE '- Meals: user_id → patient_id';
    RAISE NOTICE '- Meal plans: redundant user_id removed';
    RAISE NOTICE '- Shopping lists: user_id → patient_id';
    RAISE NOTICE '- Gamification: user_id → patient_id';
    RAISE NOTICE '- Tables renamed: user_points → patient_points';
    RAISE NOTICE '- Tables renamed: user_badges → patient_badges';
    RAISE NOTICE '- RLS policies updated';
    RAISE NOTICE '- Functions updated';
    RAISE NOTICE '- Nutritionist access policies added';
    RAISE NOTICE '============================================';
END $$;
