-- Migration: Fix définitif des politiques RLS patient UPDATE sur appointments
-- Date: 2026-03-08
-- Description: Les migrations précédentes ont introduit des restrictions trop fortes
--              dans la clause USING (ex: scheduled_at > now() + 24h), ce qui bloque
--              les opérations légitimes côté patient (annulation, réponse aux contre-propositions).
--
-- Principe: Le RLS doit vérifier la PROPRIÉTÉ et empêcher les modifications sur les
--           statuts finaux. La logique métier (restriction 24h, validations de statut)
--           est gérée par l'API, pas par le RLS.
--
-- Cas couverts par cette policy:
--   - Annulation par le patient (DELETE → update status to cancelled_by_patient)
--   - Modification de RDV (PATCH → update scheduled_at, mode, etc.)
--   - Réponse à une contre-proposition du nutritionniste (accept/decline/counter-propose)
--   - Contre-proposition du patient (update scheduled_at + status=pending + status_reason=patient_counter_proposal)

-- ============================================================================
-- 1. Supprimer l'ancienne politique (quelle que soit la version en place)
-- ============================================================================

DROP POLICY IF EXISTS "Patients can update own appointments" ON appointments;

-- ============================================================================
-- 2. Créer la politique définitive
-- ============================================================================

CREATE POLICY "Patients can update own appointments"
    ON appointments FOR UPDATE
    USING (
        -- Le patient est propriétaire du RDV
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.user_id
              AND pp.user_id = auth.uid()
        )
        -- Le RDV n'est pas dans un état final (seul le nutritionniste peut modifier ces états)
        AND status NOT IN ('cancelled', 'cancelled_by_patient', 'cancelled_by_nutritionist', 'completed', 'no_show')
    )
    WITH CHECK (
        -- Le patient reste propriétaire après la mise à jour
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.user_id
              AND pp.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 3. Vérification
-- ============================================================================

SELECT
    policyname,
    cmd,
    qual::text as using_clause,
    with_check::text as with_check_clause
FROM pg_policies
WHERE tablename = 'appointments'
AND policyname = 'Patients can update own appointments';
