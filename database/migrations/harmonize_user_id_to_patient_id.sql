-- ============================================================================
-- Migration: Harmoniser user_id → patient_id sur tables biométriques/repas
-- ============================================================================
-- Contexte : Les tables biométriques utilisent `user_id` pour référencer le
--            patient (auth.uid()), tandis que les tables dossier utilisent
--            `patient_id`. Cette incohérence a causé des bugs RLS et API.
--
-- Périmètre : weight_entries, weight_goals, measurements, wellbeing_logs,
--             activities, hydration_logs, hydration_goals, meals,
--             daily_nutrition_summary, meal_templates, meal_photos
--
-- Hors périmètre : patient_profiles.user_id, nutritionist_profiles.user_id,
--                  appointments.user_id, activity_goals (déjà patient_id)
--
-- Idempotent : Chaque bloc vérifie si la colonne existe avant de renommer
-- ============================================================================

BEGIN;

-- ==================== STEP 1: RENAME COLUMNS ====================

-- weight_entries
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='weight_entries' AND column_name='user_id') THEN
    ALTER TABLE weight_entries RENAME COLUMN user_id TO patient_id;
    RAISE NOTICE 'weight_entries: user_id → patient_id';
  END IF;
END $$;

-- weight_goals
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='weight_goals' AND column_name='user_id') THEN
    ALTER TABLE weight_goals RENAME COLUMN user_id TO patient_id;
    RAISE NOTICE 'weight_goals: user_id → patient_id';
  END IF;
END $$;

-- measurements
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='measurements' AND column_name='user_id') THEN
    ALTER TABLE measurements RENAME COLUMN user_id TO patient_id;
    RAISE NOTICE 'measurements: user_id → patient_id';
  END IF;
END $$;

-- wellbeing_logs
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='wellbeing_logs' AND column_name='user_id') THEN
    ALTER TABLE wellbeing_logs RENAME COLUMN user_id TO patient_id;
    RAISE NOTICE 'wellbeing_logs: user_id → patient_id';
  END IF;
END $$;

-- activities
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='activities' AND column_name='user_id') THEN
    ALTER TABLE activities RENAME COLUMN user_id TO patient_id;
    RAISE NOTICE 'activities: user_id → patient_id';
  END IF;
END $$;

-- hydration_logs
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='hydration_logs' AND column_name='user_id') THEN
    ALTER TABLE hydration_logs RENAME COLUMN user_id TO patient_id;
    RAISE NOTICE 'hydration_logs: user_id → patient_id';
  END IF;
END $$;

-- hydration_goals
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='hydration_goals' AND column_name='user_id') THEN
    ALTER TABLE hydration_goals RENAME COLUMN user_id TO patient_id;
    RAISE NOTICE 'hydration_goals: user_id → patient_id';
  END IF;
END $$;

-- meals
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='meals' AND column_name='user_id') THEN
    ALTER TABLE meals RENAME COLUMN user_id TO patient_id;
    RAISE NOTICE 'meals: user_id → patient_id';
  END IF;
END $$;

-- daily_nutrition_summary
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='daily_nutrition_summary' AND column_name='user_id') THEN
    ALTER TABLE daily_nutrition_summary RENAME COLUMN user_id TO patient_id;
    RAISE NOTICE 'daily_nutrition_summary: user_id → patient_id';
  END IF;
END $$;

-- meal_templates (si existe)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='meal_templates' AND column_name='user_id') THEN
    ALTER TABLE meal_templates RENAME COLUMN user_id TO patient_id;
    RAISE NOTICE 'meal_templates: user_id → patient_id';
  END IF;
END $$;

-- meal_photos (si existe)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='meal_photos' AND column_name='user_id') THEN
    ALTER TABLE meal_photos RENAME COLUMN user_id TO patient_id;
    RAISE NOTICE 'meal_photos: user_id → patient_id';
  END IF;
END $$;

-- ==================== STEP 2: REBUILD INDEXES ====================
-- PostgreSQL auto-updates constraint references but index names stay old

-- weight_entries
DROP INDEX IF EXISTS idx_weight_entries_user;
CREATE INDEX IF NOT EXISTS idx_weight_entries_patient ON weight_entries(patient_id);

-- weight_goals
DROP INDEX IF EXISTS idx_weight_goals_user;
CREATE INDEX IF NOT EXISTS idx_weight_goals_patient ON weight_goals(patient_id);

-- measurements
DROP INDEX IF EXISTS idx_measurements_user;
CREATE INDEX IF NOT EXISTS idx_measurements_patient ON measurements(patient_id);

-- wellbeing_logs
DROP INDEX IF EXISTS idx_wellbeing_logs_user;
CREATE INDEX IF NOT EXISTS idx_wellbeing_logs_patient ON wellbeing_logs(patient_id);

-- activities
DROP INDEX IF EXISTS idx_activities_user;
CREATE INDEX IF NOT EXISTS idx_activities_patient ON activities(patient_id);

-- hydration_logs
DROP INDEX IF EXISTS idx_hydration_logs_user;
CREATE INDEX IF NOT EXISTS idx_hydration_logs_patient ON hydration_logs(patient_id);

-- hydration_goals
DROP INDEX IF EXISTS idx_hydration_goals_user;
CREATE INDEX IF NOT EXISTS idx_hydration_goals_patient ON hydration_goals(patient_id);

-- meals
DROP INDEX IF EXISTS idx_meals_user;
CREATE INDEX IF NOT EXISTS idx_meals_patient ON meals(patient_id);

-- daily_nutrition_summary
DROP INDEX IF EXISTS idx_daily_nutrition_summary_user;
CREATE INDEX IF NOT EXISTS idx_daily_nutrition_summary_patient ON daily_nutrition_summary(patient_id);

-- meal_templates
DROP INDEX IF EXISTS idx_meal_templates_user;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='meal_templates') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_meal_templates_patient ON meal_templates(patient_id)';
  END IF;
END $$;

-- meal_photos
DROP INDEX IF EXISTS idx_meal_photos_user;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='meal_photos') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_meal_photos_patient ON meal_photos(patient_id)';
  END IF;
END $$;


-- ==================== STEP 3: RLS POLICIES ====================
-- Drop ALL old policies, then create unified ones with nutritionist JOIN

-- Helper: The nutritionist access pattern is:
--   EXISTS (
--     SELECT 1 FROM patient_profiles pp
--     JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
--     WHERE pp.user_id = <table>.patient_id AND np.user_id = auth.uid()
--   )

-- weight_entries
DROP POLICY IF EXISTS "Users can manage their own weight entries" ON weight_entries;
DROP POLICY IF EXISTS weight_entries_own ON weight_entries;
DROP POLICY IF EXISTS weight_entries_access ON weight_entries;
CREATE POLICY weight_entries_access ON weight_entries FOR ALL USING (
  patient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM patient_profiles pp
    JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
    WHERE pp.user_id = weight_entries.patient_id AND np.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- weight_goals
DROP POLICY IF EXISTS "Users can manage their own weight goals" ON weight_goals;
DROP POLICY IF EXISTS weight_goals_own ON weight_goals;
DROP POLICY IF EXISTS weight_goals_access ON weight_goals;
CREATE POLICY weight_goals_access ON weight_goals FOR ALL USING (
  patient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM patient_profiles pp
    JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
    WHERE pp.user_id = weight_goals.patient_id AND np.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- measurements
DROP POLICY IF EXISTS "Users can manage their own measurements" ON measurements;
DROP POLICY IF EXISTS measurements_own ON measurements;
DROP POLICY IF EXISTS measurements_access ON measurements;
CREATE POLICY measurements_access ON measurements FOR ALL USING (
  patient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM patient_profiles pp
    JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
    WHERE pp.user_id = measurements.patient_id AND np.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- wellbeing_logs
DROP POLICY IF EXISTS "Users can manage their own wellbeing logs" ON wellbeing_logs;
DROP POLICY IF EXISTS wellbeing_logs_own ON wellbeing_logs;
DROP POLICY IF EXISTS wellbeing_logs_access ON wellbeing_logs;
CREATE POLICY wellbeing_logs_access ON wellbeing_logs FOR ALL USING (
  patient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM patient_profiles pp
    JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
    WHERE pp.user_id = wellbeing_logs.patient_id AND np.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- activities
DROP POLICY IF EXISTS "Users can manage their own activities" ON activities;
DROP POLICY IF EXISTS activities_own ON activities;
DROP POLICY IF EXISTS activities_access ON activities;
CREATE POLICY activities_access ON activities FOR ALL USING (
  patient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM patient_profiles pp
    JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
    WHERE pp.user_id = activities.patient_id AND np.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- activity_goals (already uses patient_id)
DROP POLICY IF EXISTS "Users can manage their own activity goals" ON activity_goals;
DROP POLICY IF EXISTS activity_goals_own ON activity_goals;
DROP POLICY IF EXISTS activity_goals_access ON activity_goals;
CREATE POLICY activity_goals_access ON activity_goals FOR ALL USING (
  patient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM patient_profiles pp
    JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
    WHERE pp.user_id = activity_goals.patient_id AND np.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- hydration_logs
DROP POLICY IF EXISTS "Users can manage their own hydration logs" ON hydration_logs;
DROP POLICY IF EXISTS hydration_logs_own ON hydration_logs;
DROP POLICY IF EXISTS hydration_logs_access ON hydration_logs;
CREATE POLICY hydration_logs_access ON hydration_logs FOR ALL USING (
  patient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM patient_profiles pp
    JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
    WHERE pp.user_id = hydration_logs.patient_id AND np.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- hydration_goals
DROP POLICY IF EXISTS "Users can manage their own hydration goals" ON hydration_goals;
DROP POLICY IF EXISTS hydration_goals_own ON hydration_goals;
DROP POLICY IF EXISTS hydration_goals_access ON hydration_goals;
CREATE POLICY hydration_goals_access ON hydration_goals FOR ALL USING (
  patient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM patient_profiles pp
    JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
    WHERE pp.user_id = hydration_goals.patient_id AND np.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- meals
DROP POLICY IF EXISTS "Users can manage their own meals" ON meals;
DROP POLICY IF EXISTS meals_own ON meals;
DROP POLICY IF EXISTS meals_access ON meals;
CREATE POLICY meals_access ON meals FOR ALL USING (
  patient_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM patient_profiles pp
    JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
    WHERE pp.user_id = meals.patient_id AND np.user_id = auth.uid()
  )
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- daily_nutrition_summary
DROP POLICY IF EXISTS "Users can view their own daily nutrition" ON daily_nutrition_summary;
DROP POLICY IF EXISTS daily_nutrition_summary_own ON daily_nutrition_summary;
DROP POLICY IF EXISTS daily_nutrition_summary_access ON daily_nutrition_summary;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='daily_nutrition_summary') THEN
    EXECUTE 'CREATE POLICY daily_nutrition_summary_access ON daily_nutrition_summary FOR ALL USING (
      patient_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM patient_profiles pp
        JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
        WHERE pp.user_id = daily_nutrition_summary.patient_id AND np.user_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
  END IF;
END $$;

-- meal_templates
DROP POLICY IF EXISTS "Users can manage their own meal templates" ON meal_templates;
DROP POLICY IF EXISTS meal_templates_own ON meal_templates;
DROP POLICY IF EXISTS meal_templates_access ON meal_templates;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='meal_templates') THEN
    EXECUTE 'CREATE POLICY meal_templates_access ON meal_templates FOR ALL USING (
      patient_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM patient_profiles pp
        JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
        WHERE pp.user_id = meal_templates.patient_id AND np.user_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
  END IF;
END $$;

-- meal_photos
DROP POLICY IF EXISTS "Users can manage their own meal photos" ON meal_photos;
DROP POLICY IF EXISTS meal_photos_own ON meal_photos;
DROP POLICY IF EXISTS meal_photos_access ON meal_photos;
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='meal_photos') THEN
    EXECUTE 'CREATE POLICY meal_photos_access ON meal_photos FOR ALL USING (
      patient_id = auth.uid()
      OR EXISTS (
        SELECT 1 FROM patient_profiles pp
        JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
        WHERE pp.user_id = meal_photos.patient_id AND np.user_id = auth.uid()
      )
      OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = ''admin'')
    )';
  END IF;
END $$;


-- ==================== STEP 4: UPDATE STORED FUNCTIONS ====================

-- 4a. activities_calculate_calories() - trigger on activities
CREATE OR REPLACE FUNCTION activities_calculate_calories()
RETURNS TRIGGER AS $$
DECLARE
    v_weight DECIMAL;
BEGIN
    IF NEW.is_calories_manual = false OR NEW.calories_burned IS NULL THEN
        SELECT weight_kg INTO v_weight
        FROM weight_entries
        WHERE patient_id = NEW.patient_id
        ORDER BY date DESC
        LIMIT 1;

        IF v_weight IS NULL THEN
            v_weight := 75;
        END IF;

        NEW.calories_burned := calculate_activity_calories(
            NEW.activity_type_id,
            NEW.duration_minutes,
            NEW.intensity,
            v_weight
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4b. get_weight_stats() - DROP first because parameter name changed (p_user_id → p_patient_id)
DROP FUNCTION IF EXISTS get_weight_stats(UUID, INTEGER);
CREATE OR REPLACE FUNCTION get_weight_stats(
    p_patient_id UUID,
    p_days INTEGER DEFAULT 30
)
RETURNS TABLE (
    current_weight DECIMAL,
    initial_weight DECIMAL,
    goal_weight DECIMAL,
    change_kg DECIMAL,
    change_percent DECIMAL,
    weekly_change DECIMAL,
    trend VARCHAR
) AS $$
DECLARE
    v_current DECIMAL;
    v_initial DECIMAL;
    v_goal DECIMAL;
    v_week_ago DECIMAL;
BEGIN
    SELECT weight_kg INTO v_current
    FROM weight_entries
    WHERE patient_id = p_patient_id
    ORDER BY date DESC
    LIMIT 1;

    SELECT weight_kg INTO v_initial
    FROM weight_entries
    WHERE patient_id = p_patient_id
        AND date <= CURRENT_DATE - (p_days || ' days')::INTERVAL
    ORDER BY date DESC
    LIMIT 1;

    IF v_initial IS NULL THEN
        SELECT weight_kg INTO v_initial
        FROM weight_entries
        WHERE patient_id = p_patient_id
        ORDER BY date ASC
        LIMIT 1;
    END IF;

    SELECT target_weight_kg INTO v_goal
    FROM weight_goals
    WHERE patient_id = p_patient_id
        AND is_achieved = false
    ORDER BY created_at DESC
    LIMIT 1;

    SELECT weight_kg INTO v_week_ago
    FROM weight_entries
    WHERE patient_id = p_patient_id
        AND date <= CURRENT_DATE - INTERVAL '7 days'
    ORDER BY date DESC
    LIMIT 1;

    RETURN QUERY
    SELECT
        v_current AS current_weight,
        v_initial AS initial_weight,
        v_goal AS goal_weight,
        COALESCE(v_current - v_initial, 0) AS change_kg,
        CASE
            WHEN v_initial IS NOT NULL AND v_initial > 0
            THEN ROUND(((v_current - v_initial) / v_initial * 100)::NUMERIC, 1)
            ELSE 0
        END AS change_percent,
        COALESCE(v_current - v_week_ago, 0) AS weekly_change,
        CASE
            WHEN v_week_ago IS NULL THEN 'stable'
            WHEN v_current > v_week_ago + 0.1 THEN 'up'
            WHEN v_current < v_week_ago - 0.1 THEN 'down'
            ELSE 'stable'
        END::VARCHAR AS trend;
END;
$$ LANGUAGE plpgsql;

-- 4c. get_weekly_activity_stats() - DROP first because parameter name changed
DROP FUNCTION IF EXISTS get_weekly_activity_stats(UUID);
CREATE OR REPLACE FUNCTION get_weekly_activity_stats(
    p_patient_id UUID
)
RETURNS TABLE (
    sessions INTEGER,
    total_minutes INTEGER,
    total_calories INTEGER,
    goal_sessions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(a.id)::INTEGER AS sessions,
        COALESCE(SUM(a.duration_minutes), 0)::INTEGER AS total_minutes,
        COALESCE(SUM(a.calories_burned), 0)::INTEGER AS total_calories,
        COALESCE(ag.sessions_per_week, 3)::INTEGER AS goal_sessions
    FROM activities a
    LEFT JOIN activity_goals ag ON ag.patient_id = a.patient_id
        AND (ag.valid_until IS NULL OR ag.valid_until >= CURRENT_DATE)
        AND ag.valid_from <= CURRENT_DATE
    WHERE a.patient_id = p_patient_id
        AND a.date >= CURRENT_DATE - INTERVAL '6 days'
    GROUP BY ag.sessions_per_week;
END;
$$ LANGUAGE plpgsql;

-- 4d. get_daily_hydration() - DROP first because parameter name changed
DROP FUNCTION IF EXISTS get_daily_hydration(UUID, DATE);
CREATE OR REPLACE FUNCTION get_daily_hydration(
    p_patient_id UUID,
    p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_ml INTEGER,
    goal_ml INTEGER,
    percentage INTEGER
) AS $$
DECLARE
    v_total INTEGER;
    v_goal INTEGER;
BEGIN
    SELECT COALESCE(SUM(amount_ml), 0) INTO v_total
    FROM hydration_logs
    WHERE patient_id = p_patient_id
        AND date = p_date;

    SELECT COALESCE(hg.daily_goal_ml, 2000) INTO v_goal
    FROM hydration_goals hg
    WHERE hg.patient_id = p_patient_id
        AND hg.valid_from <= p_date
        AND (hg.valid_until IS NULL OR hg.valid_until >= p_date)
    ORDER BY hg.created_at DESC
    LIMIT 1;

    IF v_goal IS NULL THEN
        v_goal := 2000;
    END IF;

    RETURN QUERY
    SELECT
        v_total AS total_ml,
        v_goal AS goal_ml,
        LEAST(ROUND((v_total::DECIMAL / v_goal * 100))::INTEGER, 100) AS percentage;
END;
$$ LANGUAGE plpgsql;

-- 4e. update_daily_nutrition_summary() - DROP first because parameter name changed
DROP FUNCTION IF EXISTS update_daily_nutrition_summary(UUID, DATE);
CREATE OR REPLACE FUNCTION update_daily_nutrition_summary(
    p_patient_id UUID,
    p_date DATE
)
RETURNS VOID AS $$
DECLARE
    v_summary RECORD;
    v_goals RECORD;
BEGIN
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
    WHERE patient_id = p_patient_id
        AND meal_date = p_date
        AND deleted_at IS NULL;

    SELECT
        daily_calories_target,
        daily_protein_target AS protein_target_g,
        daily_carbs_target AS carbs_target_g,
        daily_fat_target AS fat_target_g
    INTO v_goals
    FROM user_settings
    WHERE user_id = p_patient_id;

    INSERT INTO daily_nutrition_summary (
        patient_id, date,
        total_calories, total_protein, total_carbs, total_fat,
        calorie_goal, protein_goal, carbs_goal, fat_goal,
        breakfast_calories, lunch_calories, dinner_calories, snack_calories,
        meal_count
    ) VALUES (
        p_patient_id, p_date,
        v_summary.total_calories, v_summary.total_protein, v_summary.total_carbs, v_summary.total_fat,
        v_goals.daily_calories_target, v_goals.protein_target_g, v_goals.carbs_target_g, v_goals.fat_target_g,
        v_summary.breakfast_cal, v_summary.lunch_cal, v_summary.dinner_cal, v_summary.snack_cal,
        v_summary.meal_count
    )
    ON CONFLICT (patient_id, date) DO UPDATE SET
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

-- 4f. meals_update_daily_summary() - trigger on meals
CREATE OR REPLACE FUNCTION meals_update_daily_summary()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM update_daily_nutrition_summary(OLD.patient_id, OLD.meal_date);
    ELSE
        PERFORM update_daily_nutrition_summary(NEW.patient_id, NEW.meal_date);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  RAISE NOTICE '✅ Harmonisation user_id → patient_id terminée';
END $$;

COMMIT;
