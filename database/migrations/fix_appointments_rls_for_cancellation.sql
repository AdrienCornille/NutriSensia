-- Migration: Correction des politiques RLS pour les rendez-vous
-- Date: 2025-02-05
-- Description: Permet aux patients d'annuler leurs rendez-vous via RLS
--              Utilise user_id (pas patient_id)

-- ============================================================================
-- 1. Supprimer l'ancienne politique UPDATE pour les patients
-- ============================================================================

DROP POLICY IF EXISTS "Patients can update own appointments" ON appointments;

-- ============================================================================
-- 2. Créer la nouvelle politique UPDATE qui permet l'annulation
-- ============================================================================

CREATE POLICY "Patients can update own appointments"
    ON appointments FOR UPDATE
    USING (
        -- Le patient peut mettre à jour ses propres RDV
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.user_id
              AND pp.user_id = auth.uid()
        )
        -- Seulement si le RDV n'est pas déjà annulé ou terminé
        AND status NOT IN ('cancelled', 'cancelled_by_patient', 'cancelled_by_nutritionist', 'completed', 'no_show')
    )
    WITH CHECK (
        -- Vérifier que le patient est toujours propriétaire après la mise à jour
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.user_id
              AND pp.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 3. Corriger aussi la politique SELECT si nécessaire
-- ============================================================================

DROP POLICY IF EXISTS "Patients can view own appointments" ON appointments;

CREATE POLICY "Patients can view own appointments"
    ON appointments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.user_id
              AND pp.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 4. Corriger la politique INSERT
-- ============================================================================

DROP POLICY IF EXISTS "Patients can create appointments" ON appointments;

CREATE POLICY "Patients can create appointments"
    ON appointments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.user_id
              AND pp.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 5. Vérification
-- ============================================================================

SELECT
    policyname,
    cmd,
    qual::text as using_clause
FROM pg_policies
WHERE tablename = 'appointments'
AND policyname LIKE 'Patients%'
ORDER BY policyname;
