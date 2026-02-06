-- ============================================================================
-- Migration: Ajouter nutritionist_id à consultation_types
-- Permet à chaque nutritionniste de définir ses propres types de consultation
-- ============================================================================

-- 1. Ajouter la colonne nutritionist_id (nullable pour types globaux)
ALTER TABLE consultation_types
ADD COLUMN IF NOT EXISTS nutritionist_id uuid REFERENCES nutritionist_profiles(id) ON DELETE CASCADE;

-- 2. Ajouter la colonne sort_order si elle n'existe pas
ALTER TABLE consultation_types
ADD COLUMN IF NOT EXISTS sort_order int DEFAULT 0;

-- 3. Index pour requêtes par nutritionniste
CREATE INDEX IF NOT EXISTS idx_consultation_types_nutritionist
ON consultation_types(nutritionist_id);

-- 4. Supprimer contrainte UNIQUE sur code (si elle existe)
ALTER TABLE consultation_types DROP CONSTRAINT IF EXISTS consultation_types_code_key;

-- 5. Contrainte UNIQUE par nutritionniste (code unique par nutritionniste)
DROP INDEX IF EXISTS idx_consultation_types_code_nutritionist;
CREATE UNIQUE INDEX idx_consultation_types_code_nutritionist
ON consultation_types(code, nutritionist_id)
WHERE nutritionist_id IS NOT NULL;

-- 6. Contrainte UNIQUE pour codes globaux (nutritionist_id IS NULL)
DROP INDEX IF EXISTS idx_consultation_types_code_global;
CREATE UNIQUE INDEX idx_consultation_types_code_global
ON consultation_types(code)
WHERE nutritionist_id IS NULL;

-- ============================================================================
-- RLS Policies
-- ============================================================================

-- Supprimer les anciennes policies
DROP POLICY IF EXISTS "Anyone can view consultation types" ON consultation_types;
DROP POLICY IF EXISTS "Nutritionists can view consultation types" ON consultation_types;
DROP POLICY IF EXISTS "Nutritionists can insert own consultation types" ON consultation_types;
DROP POLICY IF EXISTS "Nutritionists can update own consultation types" ON consultation_types;
DROP POLICY IF EXISTS "Nutritionists can delete own consultation types" ON consultation_types;
DROP POLICY IF EXISTS "Patients can view consultation types" ON consultation_types;

-- Policy SELECT: Les nutritionnistes voient leurs types + types globaux
-- Les patients voient les types globaux + types de leur nutritionniste assigné
CREATE POLICY "Users can view consultation types"
ON consultation_types FOR SELECT
TO authenticated
USING (
  is_active = true
  AND (
    -- Types globaux (visibles par tous)
    nutritionist_id IS NULL
    -- OU types du nutritionniste connecté
    OR nutritionist_id IN (
      SELECT id FROM nutritionist_profiles WHERE user_id = auth.uid()
    )
    -- OU types du nutritionniste assigné au patient (via patient_profiles)
    OR nutritionist_id IN (
      SELECT pp.nutritionist_id FROM patient_profiles pp WHERE pp.user_id = auth.uid() AND pp.nutritionist_id IS NOT NULL
    )
  )
);

-- Policy INSERT: Les nutritionnistes peuvent créer leurs propres types
CREATE POLICY "Nutritionists can insert own consultation types"
ON consultation_types FOR INSERT
TO authenticated
WITH CHECK (
  nutritionist_id IN (
    SELECT id FROM nutritionist_profiles WHERE user_id = auth.uid()
  )
);

-- Policy UPDATE: Les nutritionnistes peuvent modifier leurs propres types
CREATE POLICY "Nutritionists can update own consultation types"
ON consultation_types FOR UPDATE
TO authenticated
USING (
  nutritionist_id IN (
    SELECT id FROM nutritionist_profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  nutritionist_id IN (
    SELECT id FROM nutritionist_profiles WHERE user_id = auth.uid()
  )
);

-- Policy DELETE: Les nutritionnistes peuvent supprimer leurs propres types
CREATE POLICY "Nutritionists can delete own consultation types"
ON consultation_types FOR DELETE
TO authenticated
USING (
  nutritionist_id IN (
    SELECT id FROM nutritionist_profiles WHERE user_id = auth.uid()
  )
);

-- ============================================================================
-- Vérification
-- ============================================================================
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'consultation_types'
ORDER BY ordinal_position;
