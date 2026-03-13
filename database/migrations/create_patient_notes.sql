-- =====================================================
-- Migration: Create patient_notes table for PAT-006
-- Epic 2: Gestion des patients - Notes internes avec historique
-- =====================================================

-- 1. CREATE TABLE
CREATE TABLE IF NOT EXISTS patient_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    nutritionist_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. INDEXES
CREATE INDEX IF NOT EXISTS idx_patient_notes_patient ON patient_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_notes_nutritionist ON patient_notes(nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_patient_notes_created ON patient_notes(created_at DESC);

-- 3. ENABLE RLS
ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES
-- Le nutritionniste peut gérer les notes de ses patients
CREATE POLICY patient_notes_nutritionist_all ON patient_notes
    FOR ALL USING (nutritionist_id = auth.uid());

-- 5. TRIGGER updated_at
CREATE OR REPLACE FUNCTION update_patient_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_patient_notes_updated_at
    BEFORE UPDATE ON patient_notes
    FOR EACH ROW EXECUTE FUNCTION update_patient_notes_updated_at();

-- 6. MIGRATION DES DONNÉES EXISTANTES
-- Insérer le contenu de patient_profiles.notes_internal comme première note
INSERT INTO patient_notes (patient_id, nutritionist_id, content, created_at)
SELECT
    pp.id AS patient_id,
    np.user_id AS nutritionist_id,
    pp.notes_internal AS content,
    pp.updated_at AS created_at
FROM patient_profiles pp
JOIN nutritionist_profiles np ON np.id = pp.nutritionist_id
WHERE pp.notes_internal IS NOT NULL
  AND pp.notes_internal != ''
  AND pp.nutritionist_id IS NOT NULL;
