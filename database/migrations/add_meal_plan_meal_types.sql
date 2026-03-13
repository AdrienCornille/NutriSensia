-- Migration: Ajouter colonne meal_types à meal_plans
-- Permet au nutritionniste de sélectionner les types de repas inclus dans le plan

ALTER TABLE meal_plans ADD COLUMN IF NOT EXISTS meal_types TEXT[] DEFAULT NULL;

COMMENT ON COLUMN meal_plans.meal_types IS 'Types de repas sélectionnés pour ce plan (breakfast, morning_snack, lunch, afternoon_snack, dinner, evening_snack)';
