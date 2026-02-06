-- ============================================================================
-- Fix: Activer RLS et politiques sur patient_profiles
-- ============================================================================
-- Problème: La table patient_profiles affiche "unrestricted" dans Supabase
-- Solution: Réappliquer RLS et les politiques de sécurité
-- ============================================================================

-- 1. Activer RLS (si pas déjà fait)
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Forcer RLS même pour le propriétaire de la table (important!)
ALTER TABLE patient_profiles FORCE ROW LEVEL SECURITY;

-- ============================================================================
-- POLITIQUES SELECT
-- ============================================================================

-- Patients peuvent voir leur propre profil
DROP POLICY IF EXISTS "Patients can view own profile" ON patient_profiles;
CREATE POLICY "Patients can view own profile"
    ON patient_profiles FOR SELECT
    USING (user_id = auth.uid());

-- Nutritionnistes peuvent voir les profils de leurs patients
DROP POLICY IF EXISTS "Nutritionists can view their patients profiles" ON patient_profiles;
CREATE POLICY "Nutritionists can view their patients profiles"
    ON patient_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = patient_profiles.nutritionist_id
              AND np.user_id = auth.uid()
        )
    );

-- ============================================================================
-- POLITIQUES INSERT
-- ============================================================================

-- Permettre la création de profil patient lors de l'inscription
-- L'utilisateur peut créer son propre profil (user_id doit correspondre)
DROP POLICY IF EXISTS "Users can create own patient profile" ON patient_profiles;
CREATE POLICY "Users can create own patient profile"
    ON patient_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- POLITIQUES UPDATE
-- ============================================================================

-- Patients peuvent mettre à jour leur propre profil
DROP POLICY IF EXISTS "Patients can update own profile" ON patient_profiles;
CREATE POLICY "Patients can update own profile"
    ON patient_profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Nutritionnistes peuvent mettre à jour certains champs de leurs patients
-- (status, notes, nutritionist_id pour transfert)
DROP POLICY IF EXISTS "Nutritionists can update their patients" ON patient_profiles;
CREATE POLICY "Nutritionists can update their patients"
    ON patient_profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM nutritionist_profiles np
            WHERE np.id = patient_profiles.nutritionist_id
              AND np.user_id = auth.uid()
        )
    );

-- ============================================================================
-- POLITIQUES DELETE (optionnel - généralement on soft-delete)
-- ============================================================================

-- Pour l'instant, pas de politique DELETE
-- Les suppressions doivent passer par un admin ou service role

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- 1. Vérifier que RLS est activé
SELECT
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'patient_profiles';

-- 2. Lister toutes les politiques sur patient_profiles
SELECT
    policyname,
    cmd,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'patient_profiles'
ORDER BY cmd, policyname;
