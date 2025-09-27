-- =====================================================
-- SCRIPT DE VÉRIFICATION DE L'ÉTAT DE LA BASE DE DONNÉES
-- Pour diagnostiquer les problèmes d'inscription
-- =====================================================

-- Vérifier si les tables existent
SELECT 
    table_name,
    CASE 
        WHEN table_name IS NOT NULL THEN '✅ Existe'
        ELSE '❌ Manquante'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'users', 'meals', 'meal_plans')
ORDER BY table_name;

-- Vérifier la structure de la table profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Vérifier si les triggers existent
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    CASE 
        WHEN trigger_name IS NOT NULL THEN '✅ Existe'
        ELSE '❌ Manquant'
    END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND trigger_name IN ('on_auth_user_created', 'on_auth_user_sign_in')
ORDER BY trigger_name;

-- Vérifier si les fonctions existent
SELECT 
    routine_name,
    routine_type,
    CASE 
        WHEN routine_name IS NOT NULL THEN '✅ Existe'
        ELSE '❌ Manquante'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'handle_user_sign_in', 'get_user_role', 'is_nutritionist', 'is_admin')
ORDER BY routine_name;

-- Vérifier les politiques RLS
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
WHERE schemaname = 'public' 
AND tablename = 'profiles'
ORDER BY policyname;

-- Vérifier si RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity = true THEN '✅ Activé'
        ELSE '❌ Désactivé'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'users', 'meals', 'meal_plans')
ORDER BY tablename;

-- Vérifier les contraintes de la table profiles
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'public.profiles'::regclass
ORDER BY conname;

-- Vérifier les index de la table profiles
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'profiles'
ORDER BY indexname;

-- Vérifier les permissions sur la table profiles
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY grantee, privilege_type;

-- Vérifier les séquences
SELECT 
    sequence_name,
    data_type,
    start_value,
    minimum_value,
    maximum_value,
    increment
FROM information_schema.sequences 
WHERE sequence_schema = 'public'
ORDER BY sequence_name;

-- Vérifier les vues
SELECT 
    table_name,
    view_definition
FROM information_schema.views 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Test de création d'un utilisateur de test (à supprimer après)
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
    test_email TEXT := 'test@example.com';
BEGIN
    -- Insérer un utilisateur de test dans auth.users
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data
    ) VALUES (
        test_user_id,
        test_email,
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"name": "Test User", "role": "patient"}'::jsonb
    );
    
    RAISE NOTICE '✅ Test utilisateur créé avec ID: %', test_user_id;
    
    -- Vérifier si le trigger a créé le profil
    IF EXISTS (SELECT 1 FROM profiles WHERE id = test_user_id) THEN
        RAISE NOTICE '✅ Profil créé automatiquement par le trigger';
    ELSE
        RAISE NOTICE '❌ Profil NON créé automatiquement - problème avec le trigger';
    END IF;
    
    -- Nettoyer le test
    DELETE FROM auth.users WHERE id = test_user_id;
    RAISE NOTICE '🧹 Test utilisateur supprimé';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erreur lors du test: %', SQLERRM;
        -- Nettoyer en cas d'erreur
        DELETE FROM auth.users WHERE id = test_user_id;
END $$;

-- Afficher les messages de diagnostic
DO $$
BEGIN
    RAISE NOTICE '🔍 DIAGNOSTIC TERMINÉ';
    RAISE NOTICE '📋 Vérifiez les résultats ci-dessus pour identifier les problèmes';
    RAISE NOTICE '💡 Si des éléments sont manquants, exécutez le script init-database.sql';
    RAISE NOTICE '🛠️ Si le trigger ne fonctionne pas, vérifiez les permissions et les logs';
END $$;
