-- ============================================================================
-- Script de création des tables Hydratation
-- À exécuter dans Supabase SQL Editor
-- ============================================================================

-- Table: hydration_logs
-- Description: Logs d'hydratation quotidiens
CREATE TABLE IF NOT EXISTS hydration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Date
    date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Quantité (en ml)
    amount_ml INTEGER NOT NULL CHECK (amount_ml >= 0 AND amount_ml <= 10000),

    -- Type de boisson (optionnel)
    beverage_type VARCHAR(50) DEFAULT 'water', -- 'water', 'tea', 'coffee', 'juice', 'other'

    -- Notes
    notes TEXT,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE OR REPLACE TRIGGER hydration_logs_updated_at
    BEFORE UPDATE ON hydration_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_hydration_logs_user ON hydration_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_logs_date ON hydration_logs(user_id, date DESC);

-- ============================================================================
-- Table: hydration_goals
-- Description: Objectifs d'hydratation
-- ============================================================================

CREATE TABLE IF NOT EXISTS hydration_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Utilisateur
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

    -- Objectif quotidien (en ml)
    daily_goal_ml INTEGER DEFAULT 2000 CHECK (daily_goal_ml > 0 AND daily_goal_ml <= 10000),

    -- Période de validité
    valid_from DATE DEFAULT CURRENT_DATE,
    valid_until DATE,

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger pour updated_at
CREATE OR REPLACE TRIGGER hydration_goals_updated_at
    BEFORE UPDATE ON hydration_goals
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Index
CREATE INDEX IF NOT EXISTS idx_hydration_goals_user ON hydration_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_hydration_goals_current ON hydration_goals(user_id, valid_from, valid_until);

-- ============================================================================
-- Row Level Security (RLS)
-- ============================================================================

-- Activer RLS
ALTER TABLE hydration_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE hydration_goals ENABLE ROW LEVEL SECURITY;

-- Politiques pour hydration_logs
DROP POLICY IF EXISTS hydration_logs_own ON hydration_logs;
CREATE POLICY hydration_logs_own ON hydration_logs
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = hydration_logs.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Politiques pour hydration_goals
DROP POLICY IF EXISTS hydration_goals_own ON hydration_goals;
CREATE POLICY hydration_goals_own ON hydration_goals
    FOR ALL USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.user_id = hydration_goals.user_id
            AND pp.nutritionist_id = auth.uid()
        )
        OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================================================
-- Vérification
-- ============================================================================

-- Vérifier que les tables ont été créées
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_name IN ('hydration_logs', 'hydration_goals')
ORDER BY table_name;
