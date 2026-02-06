-- ============================================================================
-- Fix: Récursion infinie dans les politiques RLS
-- ============================================================================
-- Problème: Les politiques sur patient_profiles et nutritionist_profiles
-- se référencent mutuellement, créant une boucle infinie.
--
-- Solution: Simplifier les politiques pour éviter les références croisées.
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1: Supprimer les politiques problématiques
-- ============================================================================

-- Supprimer toutes les politiques sur patient_profiles
DROP POLICY IF EXISTS "Patients can view own profile" ON patient_profiles;
DROP POLICY IF EXISTS "Patients can update own profile" ON patient_profiles;
DROP POLICY IF EXISTS "Users can create own patient profile" ON patient_profiles;
DROP POLICY IF EXISTS "Nutritionists can view their patients profiles" ON patient_profiles;
DROP POLICY IF EXISTS "Nutritionists can update their patients" ON patient_profiles;

-- Supprimer les politiques problématiques sur nutritionist_profiles
DROP POLICY IF EXISTS "Patients can view their nutritionist profile" ON nutritionist_profiles;

-- ============================================================================
-- ÉTAPE 2: Recréer les politiques SANS références croisées
-- ============================================================================

-- === PATIENT_PROFILES ===

-- Patients peuvent voir leur propre profil (simple, pas de récursion)
CREATE POLICY "Patients can view own profile"
    ON patient_profiles FOR SELECT
    USING (user_id = auth.uid());

-- Patients peuvent créer leur profil
CREATE POLICY "Users can create own patient profile"
    ON patient_profiles FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- Patients peuvent mettre à jour leur profil
CREATE POLICY "Patients can update own profile"
    ON patient_profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Nutritionnistes peuvent voir leurs patients
-- IMPORTANT: Utilise une sous-requête qui ne déclenche pas de récursion
-- car elle ne vérifie que nutritionist_profiles.user_id = auth.uid()
CREATE POLICY "Nutritionists can view their patients profiles"
    ON patient_profiles FOR SELECT
    USING (
        nutritionist_id IN (
            SELECT np.id FROM nutritionist_profiles np
            WHERE np.user_id = auth.uid()
        )
    );

-- Nutritionnistes peuvent modifier leurs patients
CREATE POLICY "Nutritionists can update their patients"
    ON patient_profiles FOR UPDATE
    USING (
        nutritionist_id IN (
            SELECT np.id FROM nutritionist_profiles np
            WHERE np.user_id = auth.uid()
        )
    );

-- === NUTRITIONIST_PROFILES ===

-- Recréer la politique pour les patients SANS référencer patient_profiles
-- Les patients peuvent voir TOUS les nutritionnistes (pour la recherche/consultation)
DROP POLICY IF EXISTS "Anyone can view nutritionists" ON nutritionist_profiles;
CREATE POLICY "Anyone can view nutritionists"
    ON nutritionist_profiles FOR SELECT
    USING (true);  -- Tous les utilisateurs authentifiés peuvent voir les nutritionnistes

-- Nutritionnistes peuvent voir/modifier leur propre profil
DROP POLICY IF EXISTS "Nutritionists can view own profile" ON nutritionist_profiles;
CREATE POLICY "Nutritionists can view own profile"
    ON nutritionist_profiles FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Nutritionists can update own profile" ON nutritionist_profiles;
CREATE POLICY "Nutritionists can update own profile"
    ON nutritionist_profiles FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================

-- 1. Vérifier les politiques sur patient_profiles
SELECT 'patient_profiles policies:' as info;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'patient_profiles'
ORDER BY cmd, policyname;

-- 2. Vérifier les politiques sur nutritionist_profiles
SELECT 'nutritionist_profiles policies:' as info;
SELECT policyname, cmd
FROM pg_policies
WHERE tablename = 'nutritionist_profiles'
ORDER BY cmd, policyname;
