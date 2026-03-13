-- =============================================================
-- Migration: Profil Nutritionnel (Phase 2.5)
-- Tables: nutritional_profiles, profile_suggestions
-- =============================================================

-- Enums
DO $$ BEGIN
  CREATE TYPE bmr_formula_type AS ENUM (
    'mifflin_st_jeor',
    'harris_benedict_revised',
    'harris_benedict_original',
    'katch_mcardle'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE profile_goal_type AS ENUM ('lose', 'maintain', 'gain');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE special_case_type AS ENUM (
    'none',
    'pregnancy_t1',
    'pregnancy_t2',
    'pregnancy_t3',
    'breastfeeding',
    'athlete',
    'senior',
    'adolescent'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE profile_status_type AS ENUM ('draft', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE suggestion_status_type AS ENUM ('pending', 'approved', 'rejected', 'discussed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- =============================================================
-- Table: nutritional_profiles
-- =============================================================

CREATE TABLE IF NOT EXISTS nutritional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nutritionist_id UUID NOT NULL REFERENCES nutritionist_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  status profile_status_type NOT NULL DEFAULT 'draft',
  version INTEGER NOT NULL DEFAULT 1,

  -- Snapshot des données patient au moment de la création
  weight_kg NUMERIC(5,1) NOT NULL,
  height_cm NUMERIC(5,1) NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 13 AND age <= 120),
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female')),
  body_fat_pct NUMERIC(4,1) CHECK (body_fat_pct IS NULL OR (body_fat_pct >= 1 AND body_fat_pct <= 60)),

  -- Paramètres de calcul
  bmr_formula bmr_formula_type NOT NULL DEFAULT 'mifflin_st_jeor',
  activity_level TEXT NOT NULL DEFAULT 'moderatelyActive',
  goal profile_goal_type NOT NULL DEFAULT 'maintain',
  goal_adjustment_kcal INTEGER DEFAULT 0,
  special_case special_case_type NOT NULL DEFAULT 'none',

  -- Distribution des macronutriments
  macro_template TEXT,
  protein_pct NUMERIC(4,1) NOT NULL DEFAULT 15 CHECK (protein_pct >= 0 AND protein_pct <= 100),
  carbs_pct NUMERIC(4,1) NOT NULL DEFAULT 50 CHECK (carbs_pct >= 0 AND carbs_pct <= 100),
  fat_pct NUMERIC(4,1) NOT NULL DEFAULT 35 CHECK (fat_pct >= 0 AND fat_pct <= 100),

  -- Résultats calculés (stockés pour historique/comparaison)
  calculated_bmr INTEGER,
  calculated_tdee INTEGER,
  calculated_calories INTEGER,
  calculated_protein_g NUMERIC(5,1),
  calculated_carbs_g NUMERIC(5,1),
  calculated_fat_g NUMERIC(5,1),

  -- Objectifs en micronutriments (mode basique ou avancé)
  micro_targets JSONB DEFAULT NULL,

  -- Notes
  notes TEXT,
  private_notes TEXT,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  archived_at TIMESTAMPTZ,

  -- Contrainte : P + G + L doit être ~100%
  CONSTRAINT macro_pct_sum CHECK (
    ABS(protein_pct + carbs_pct + fat_pct - 100) <= 1
  )
);

-- Index
CREATE INDEX IF NOT EXISTS idx_nutritional_profiles_patient
  ON nutritional_profiles(patient_id);
CREATE INDEX IF NOT EXISTS idx_nutritional_profiles_status
  ON nutritional_profiles(patient_id, status);
CREATE INDEX IF NOT EXISTS idx_nutritional_profiles_nutritionist
  ON nutritional_profiles(nutritionist_id);

-- Contrainte : un seul profil actif par patient
CREATE UNIQUE INDEX IF NOT EXISTS idx_one_active_profile_per_patient
  ON nutritional_profiles(patient_id) WHERE status = 'active';

-- Trigger updated_at
CREATE TRIGGER set_updated_at_nutritional_profiles
  BEFORE UPDATE ON nutritional_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================================
-- Table: profile_suggestions
-- =============================================================

CREATE TABLE IF NOT EXISTS profile_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritional_profile_id UUID NOT NULL REFERENCES nutritional_profiles(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  suggestion_type TEXT NOT NULL CHECK (
    suggestion_type IN ('activity_level', 'goal', 'macro_distribution', 'special_case', 'other')
  ),
  title TEXT NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) >= 20),
  suggested_changes JSONB NOT NULL DEFAULT '{}',
  status suggestion_status_type NOT NULL DEFAULT 'pending',
  response TEXT,
  responded_by UUID REFERENCES auth.users(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_profile_suggestions_profile
  ON profile_suggestions(nutritional_profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_suggestions_patient
  ON profile_suggestions(patient_id);
CREATE INDEX IF NOT EXISTS idx_profile_suggestions_status
  ON profile_suggestions(status);

-- =============================================================
-- RLS Policies
-- =============================================================

ALTER TABLE nutritional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_suggestions ENABLE ROW LEVEL SECURITY;

-- Nutritionniste : CRUD sur les profils de ses patients
CREATE POLICY "nutritionist_manage_profiles" ON nutritional_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nutritionist_profiles np
      WHERE np.id = nutritional_profiles.nutritionist_id
        AND np.user_id = auth.uid()
    )
  );

-- Patient : lecture de ses propres profils
CREATE POLICY "patient_read_own_profiles" ON nutritional_profiles
  FOR SELECT USING (patient_id = auth.uid());

-- Nutritionniste : gérer les suggestions de ses patients
CREATE POLICY "nutritionist_manage_suggestions" ON profile_suggestions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM nutritional_profiles np2
      JOIN nutritionist_profiles np ON np.id = np2.nutritionist_id
      WHERE np2.id = profile_suggestions.nutritional_profile_id
        AND np.user_id = auth.uid()
    )
  );

-- Patient : créer et lire ses propres suggestions
CREATE POLICY "patient_manage_own_suggestions" ON profile_suggestions
  FOR ALL USING (patient_id = auth.uid());

-- =============================================================
-- Fonction: activer un profil (archive l'ancien actif)
-- =============================================================

CREATE OR REPLACE FUNCTION activate_nutritional_profile(
  p_profile_id UUID,
  p_nutritionist_id UUID
) RETURNS UUID AS $$
DECLARE
  v_patient_id UUID;
BEGIN
  -- Récupérer le patient_id du profil cible
  SELECT patient_id INTO v_patient_id
  FROM nutritional_profiles
  WHERE id = p_profile_id AND nutritionist_id = p_nutritionist_id;

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Profil non trouvé ou accès refusé';
  END IF;

  -- Archiver le profil actif actuel
  UPDATE nutritional_profiles
  SET status = 'archived', archived_at = now()
  WHERE patient_id = v_patient_id
    AND status = 'active'
    AND id != p_profile_id;

  -- Activer le profil cible
  UPDATE nutritional_profiles
  SET status = 'active', archived_at = NULL
  WHERE id = p_profile_id;

  RETURN p_profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
