-- ============================================================================
-- Migration: Allow patients to read their nutritionist's custom categories
-- Description: Adds a SELECT RLS policy so patients can see the custom
--              content categories created by their assigned nutritionist.
-- PREREQUISITES: create_custom_content_categories.sql
-- ============================================================================

CREATE POLICY "Patients read own nutritionist categories"
ON custom_content_categories
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM patient_profiles pp
    WHERE pp.nutritionist_id = custom_content_categories.nutritionist_id
      AND pp.user_id = auth.uid()
  )
);

DO $$
BEGIN
  RAISE NOTICE 'Migration add_patient_read_custom_categories terminee avec succes';
END $$;
