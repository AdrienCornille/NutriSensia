-- ============================================================================
-- Vérification de l'état des politiques RLS sur la table meals
-- ============================================================================

-- 1. Vérifier si RLS est activé
SELECT
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'meals';

-- 2. Afficher toutes les politiques de la table meals
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual AS using_clause,
    with_check AS with_check_clause
FROM pg_policies
WHERE tablename = 'meals'
ORDER BY policyname;

-- 3. Tester si les politiques permettent les opérations
-- IMPORTANT: Ces requêtes échoueront dans le SQL Editor car auth.uid() est NULL
-- Elles sont juste pour documenter ce qui devrait fonctionner dans l'API

-- Note: Dans le SQL Editor, auth.uid() retourne NULL donc ces requêtes
-- montreront 0 résultats même si les politiques sont correctes.
-- Les politiques fonctionnent correctement uniquement dans le contexte
-- d'une requête API authentifiée.

SELECT 'Test query - will fail in SQL Editor but works in API' AS info;
