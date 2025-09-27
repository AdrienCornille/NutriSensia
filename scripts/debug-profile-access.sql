-- =====================================================
-- SCRIPT DE DIAGNOSTIC POUR L'ACCÈS À LA PAGE PROFILE
-- =====================================================

-- Vérifier les utilisateurs existants et leurs profils
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.raw_user_meta_data,
    CASE 
        WHEN p.id IS NOT NULL THEN '✅ Profil existe'
        ELSE '❌ Profil manquant'
    END as profile_status,
    p.role as profile_role,
    p.email_verified as profile_email_verified
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
ORDER BY u.created_at DESC;

-- Vérifier les permissions RLS sur la table profiles
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

-- Vérifier si RLS est activé sur profiles
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
AND tablename = 'profiles';

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

-- Test de lecture d'un profil (simulation d'un utilisateur authentifié)
-- Remplacez 'VOTRE_USER_ID' par l'ID d'un utilisateur réel
DO $$
DECLARE
    test_user_id UUID;
    profile_exists BOOLEAN;
    can_read_profile BOOLEAN;
BEGIN
    -- Prendre le premier utilisateur comme test
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        RAISE NOTICE '❌ Aucun utilisateur trouvé dans auth.users';
        RETURN;
    END IF;
    
    RAISE NOTICE '🧪 Test avec l''utilisateur: %', test_user_id;
    
    -- Vérifier si le profil existe
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = test_user_id) INTO profile_exists;
    
    IF profile_exists THEN
        RAISE NOTICE '✅ Profil trouvé pour l''utilisateur';
        
        -- Simuler une lecture du profil (comme le ferait l'application)
        BEGIN
            -- Cette requête simule ce que fait l'application
            SELECT COUNT(*) INTO can_read_profile 
            FROM profiles 
            WHERE id = test_user_id;
            
            IF can_read_profile > 0 THEN
                RAISE NOTICE '✅ Lecture du profil réussie';
            ELSE
                RAISE NOTICE '❌ Lecture du profil échouée';
            END IF;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE '❌ Erreur lors de la lecture du profil: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE '❌ Profil manquant pour l''utilisateur';
    END IF;
    
END $$;

-- Vérifier les triggers sur auth.users
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'auth' 
AND event_object_table = 'users'
ORDER BY trigger_name;

-- Vérifier les fonctions liées aux triggers
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('handle_new_user', 'handle_user_sign_in')
ORDER BY routine_name;

-- Vérifier les connexions actives (alternative aux logs)
SELECT 
    pid,
    usename,
    application_name,
    client_addr,
    state,
    query_start,
    state_change,
    query
FROM pg_stat_activity 
WHERE state = 'active'
AND query LIKE '%profiles%'
ORDER BY query_start DESC
LIMIT 5;

-- Afficher les messages de diagnostic
DO $$
BEGIN
    RAISE NOTICE '🔍 DIAGNOSTIC PROFILE TERMINÉ';
    RAISE NOTICE '📋 Vérifiez les résultats ci-dessus';
    RAISE NOTICE '💡 Si le profil existe mais que l''accès échoue, le problème est dans le middleware ou les permissions RLS';
    RAISE NOTICE '🛠️ Si le profil n''existe pas, exécutez le script de réparation';
END $$;
