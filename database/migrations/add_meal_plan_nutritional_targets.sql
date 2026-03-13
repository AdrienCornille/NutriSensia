-- Migration: Add nutritional_targets JSONB column to meal_plans
-- PLAN-N-001: Stores daily nutritional objectives for the plan
-- Format: { "calories": 2000, "protein": 100, "carbs": 250, "fat": 70, "fiber": 30, "sodium": null }

ALTER TABLE meal_plans
ADD COLUMN IF NOT EXISTS nutritional_targets JSONB DEFAULT NULL;

COMMENT ON COLUMN meal_plans.nutritional_targets IS 'Daily nutritional targets (calories, protein, carbs, fat, fiber, sodium)';
