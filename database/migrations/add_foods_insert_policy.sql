-- ============================================================================
-- Migration: Allow nutritionists to create custom foods
-- Date: 2026-04-05
-- Description: Adds INSERT policy on foods table for nutritionists
-- ============================================================================

-- Allow nutritionists (and admins) to insert custom foods
DROP POLICY IF EXISTS "Nutritionists can create custom foods" ON foods;
CREATE POLICY "Nutritionists can create custom foods"
    ON foods FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid()
            AND role IN ('nutritionist', 'admin')
        )
    );

-- Allow users to update their own custom foods
DROP POLICY IF EXISTS "Users can update own custom foods" ON foods;
CREATE POLICY "Users can update own custom foods"
    ON foods FOR UPDATE
    TO authenticated
    USING (
        created_by = auth.uid()
        AND is_custom = true
    );
