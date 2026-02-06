-- Script de diagnostic simplifié
-- Exécutez chaque requête SÉPARÉMENT dans Supabase SQL Editor

-- ========================================
-- REQUÊTE 1: Structure de appointments
-- ========================================
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'appointments'
ORDER BY ordinal_position;

-- ========================================
-- REQUÊTE 2: Politiques RLS sur appointments
-- ========================================
SELECT policyname, cmd, qual::text, with_check::text
FROM pg_policies
WHERE tablename = 'appointments';

-- ========================================
-- REQUÊTE 3: Types de consultation
-- ========================================
SELECT id, code, name_fr, default_duration, is_active
FROM consultation_types;

-- ========================================
-- REQUÊTE 4: Votre profil patient
-- ========================================
SELECT id, user_id, nutritionist_id, status
FROM patient_profiles
WHERE user_id = auth.uid();

-- ========================================
-- REQUÊTE 5: Tous les patients (pour debug)
-- ========================================
SELECT id, user_id, nutritionist_id
FROM patient_profiles
LIMIT 10;

-- ========================================
-- REQUÊTE 6: Vérifier si appointments existe
-- ========================================
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'appointments'
) as appointments_exists;

-- ========================================
-- REQUÊTE 7: Vérifier si consultation_types existe
-- ========================================
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema = 'public' AND table_name = 'consultation_types'
) as consultation_types_exists;
