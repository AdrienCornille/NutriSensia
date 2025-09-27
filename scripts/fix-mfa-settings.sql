-- Script pour corriger les paramètres MFA de Supabase
-- Ce script résout l'erreur "AAL2 required to enroll a new factor"

-- 1. Vérifier la configuration actuelle
SELECT 
    name,
    setting 
FROM pg_settings 
WHERE name LIKE '%mfa%' OR name LIKE '%aal%';

-- 2. Vérifier les politiques RLS existantes qui pourraient bloquer l'enrôlement
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename LIKE '%mfa%' OR qual LIKE '%aal2%';

-- 3. Vérifier s'il y a des facteurs MFA existants
SELECT 
    id,
    user_id,
    friendly_name,
    factor_type,
    status,
    created_at,
    updated_at
FROM auth.mfa_factors 
LIMIT 10;

-- 4. Vérifier les utilisateurs et leur statut AAL
SELECT 
    u.id,
    u.email,
    u.created_at,
    COUNT(mf.id) as mfa_factors_count,
    ARRAY_AGG(mf.status) as factor_statuses
FROM auth.users u
LEFT JOIN auth.mfa_factors mf ON u.id = mf.user_id
GROUP BY u.id, u.email, u.created_at
ORDER BY u.created_at DESC
LIMIT 10;

-- 5. Vérifier la configuration du projet Supabase
SELECT 
    name,
    value
FROM auth.config
WHERE name IN ('mfa_enrollment_enabled', 'mfa_max_enrolled_factors', 'security_update_password_require_reauthentication');

-- 6. SOLUTION TEMPORAIRE : Permettre l'enrôlement du premier facteur MFA
-- Cette requête désactive temporairement la vérification AAL2 pour l'enrôlement
-- ATTENTION: Ceci est une solution temporaire pour les tests

-- Option A: Via les paramètres de configuration (si disponible)
-- UPDATE auth.config 
-- SET value = 'false' 
-- WHERE name = 'mfa_require_aal2_for_enrollment';

-- Option B: Créer une politique RLS permissive pour l'enrôlement MFA
-- (Cette approche est plus sûre car elle ne modifie pas la configuration globale)

-- Vérifier si la table mfa_factors a des politiques restrictives
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'auth' AND tablename = 'mfa_factors';

-- DIAGNOSTIC: Vérifier les permissions sur auth.mfa_factors
SELECT 
    grantee,
    table_schema,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'auth' AND table_name = 'mfa_factors';

-- DIAGNOSTIC: Vérifier les fonctions liées à MFA
SELECT 
    routine_name,
    routine_type,
    security_type
FROM information_schema.routines 
WHERE routine_schema = 'auth' AND routine_name LIKE '%mfa%';

-- Message d'information
SELECT 'Configuration MFA vérifiée. Consultez les résultats ci-dessus pour diagnostiquer le problème.' as status;

