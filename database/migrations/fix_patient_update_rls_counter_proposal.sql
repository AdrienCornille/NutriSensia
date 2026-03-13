-- Migration: Fix RLS policy for patient counter-proposal responses
-- Date: 2026-03-08
-- Description: The rollback_postponed_status migration recreated the patient UPDATE policy
--              with a too-restrictive condition (scheduled_at > now() + 24h).
--              This prevents patients from accepting/declining counter-proposals
--              for appointments within 24 hours.
--
-- Fix: Allow patients to update appointments when:
--   - Normal modifications: status IN ('pending','confirmed') AND scheduled_at > now() + 24h
--   - Counter-proposal responses: status = 'pending' AND status_reason = 'counter_proposal' (no time restriction)

-- ============================================================================
-- 1. Drop the overly restrictive policy
-- ============================================================================

DROP POLICY IF EXISTS "Patients can update own appointments" ON appointments;

-- ============================================================================
-- 2. Recreate with proper conditions
-- ============================================================================

CREATE POLICY "Patients can update own appointments"
    ON appointments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.user_id
              AND pp.user_id = auth.uid()
        )
        AND (
            -- Case 1: Responding to a counter-proposal (no time restriction)
            (status = 'pending' AND status_reason = 'counter_proposal')
            OR
            -- Case 2: Normal patient modifications (24h restriction applies)
            (status IN ('pending', 'confirmed') AND scheduled_at > now() + interval '24 hours')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM patient_profiles pp
            WHERE pp.id = appointments.user_id
              AND pp.user_id = auth.uid()
        )
    );

-- ============================================================================
-- 3. Verify
-- ============================================================================

SELECT
    policyname,
    cmd,
    qual::text as using_clause
FROM pg_policies
WHERE tablename = 'appointments'
AND policyname = 'Patients can update own appointments';
