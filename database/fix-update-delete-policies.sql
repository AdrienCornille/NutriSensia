-- ============================================================================
-- Correction des politiques RLS pour UPDATE et DELETE sur meals
-- ============================================================================
-- Problème: La politique UPDATE manque WITH CHECK, ce qui bloque les mises à jour
-- Solution: Ajouter WITH CHECK (auth.uid() = user_id) pour autoriser les UPDATE
-- ============================================================================

-- Supprimer les anciennes politiques UPDATE et DELETE
DROP POLICY IF EXISTS "Users can update own meals" ON meals;
DROP POLICY IF EXISTS "Users can delete own meals" ON meals;

-- Recréer la politique UPDATE avec WITH CHECK
CREATE POLICY "Users can update own meals"
    ON meals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Recréer la politique DELETE (pas besoin de WITH CHECK pour DELETE)
CREATE POLICY "Users can delete own meals"
    ON meals FOR DELETE
    USING (auth.uid() = user_id);

-- Vérifier que les politiques sont correctes
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,  -- USING clause
    with_check  -- WITH CHECK clause
FROM pg_policies
WHERE tablename = 'meals'
ORDER BY policyname;
