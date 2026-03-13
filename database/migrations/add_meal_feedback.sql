-- =====================================================
-- Migration: Add meal_feedback table for SUIVI-007
-- Epic 8: Suivi & Progression patient
-- =====================================================

CREATE TABLE IF NOT EXISTS meal_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    meal_id UUID NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    comment TEXT NOT NULL,
    feedback_type VARCHAR(30) DEFAULT 'general' CHECK (feedback_type IN ('general', 'positive', 'warning', 'suggestion')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_meal_feedback_meal ON meal_feedback(meal_id);
CREATE INDEX IF NOT EXISTS idx_meal_feedback_nutritionist ON meal_feedback(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_meal_feedback_created ON meal_feedback(created_at DESC);

-- RLS
ALTER TABLE meal_feedback ENABLE ROW LEVEL SECURITY;

-- Nutritionist can manage feedback on their patients' meals
CREATE POLICY meal_feedback_nutritionist_all ON meal_feedback
    FOR ALL USING (
        nutritionist_id = auth.uid()
    );

-- Nutritionist can also read feedback from same practice (for patient view)
CREATE POLICY meal_feedback_nutritionist_read ON meal_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meals m
            JOIN patient_profiles pp ON pp.user_id = m.user_id
            JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
            WHERE m.id = meal_feedback.meal_id
            AND np.user_id = auth.uid()
        )
    );

-- Patient can read feedback on their own meals
CREATE POLICY meal_feedback_patient_read ON meal_feedback
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM meals m
            WHERE m.id = meal_feedback.meal_id
            AND m.user_id = auth.uid()
        )
    );

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_meal_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_meal_feedback_updated_at
    BEFORE UPDATE ON meal_feedback
    FOR EACH ROW EXECUTE FUNCTION update_meal_feedback_updated_at();
